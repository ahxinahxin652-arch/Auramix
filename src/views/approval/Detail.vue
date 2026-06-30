<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowLeft,
  Refresh,
  Check,
  Close,
  CircleCheckFilled,
  Clock,
  Loading,
  WarningFilled,
} from '@element-plus/icons-vue'
import PageHeader from '@/components/PageHeader.vue'
import EmptyState from '@/components/EmptyState.vue'
import { useAuthStore } from '@/store/modules/auth'
import {
  getReviewProgress,
  subscribeReviewProgress,
  confirmReview,
  ReviewVerdict,
  ReviewStatus,
  type ReviewProgress,
  type DimensionProgress,
  type SSEEventType,
} from '@/api/admin/reviewManage'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const recordId = computed(() => String(route.params.id ?? ''))

// ---- 进度状态 ----
const progress = ref<ReviewProgress | null>(null)
const loading = ref(false)
const loadError = ref('')

// ---- SSE ----
let es: EventSource | null = null
const sseConnected = ref(false)

// ---- 人工确认对话框 ----
const confirmVisible = ref(false)
const confirmLoading = ref(false)
const adminVerdict = ref<1 | -1>(1)
const adminNote = ref('')

// ---- 最终结果横幅 ----
const finishedBanner = computed(() => {
  if (!progress.value?.finishedAt) return null
  const v = progress.value.finalVerdict
  const s = progress.value.finalStatus
  let text = ''
  let type: 'success' | 'warning' | 'error' | 'info' = 'info'
  if (s === ReviewStatus.PENDING_MANUAL) {
    text = `AI 置信度 ${progress.value.finalConfidence}，低于 80，待人工确认`
    type = 'warning'
  } else if (s === ReviewStatus.PENDING_AUTO) {
    text = `AI 置信度 ${progress.value.finalConfidence}，高置信度，等待系统自动处理`
    type = 'info'
  } else if (s === ReviewStatus.AUTO_DONE) {
    text = v === ReviewVerdict.PASS ? '系统已自动通过，歌曲已上架' : '系统已自动驳回，歌曲已下架'
    type = v === ReviewVerdict.PASS ? 'success' : 'error'
  } else if (s === ReviewStatus.MANUAL_DONE) {
    text = v === ReviewVerdict.PASS ? '管理员已确认通过，歌曲已上架' : '管理员已确认驳回，歌曲已下架'
    type = v === ReviewVerdict.PASS ? 'success' : 'error'
  } else if (s === ReviewStatus.FAILED) {
    text = 'AI 审核异常，可手动覆盖结果'
    type = 'error'
  }
  return { text, type }
})

const isFinished = computed(() => !!progress.value?.finishedAt)

const judgeVerdictText = computed(() => {
  const j = progress.value?.judge
  if (!j || j.status !== 'DONE') return '等待中'
  return j.verdict === 'PASS' ? '通过' : '不通过'
})

function verdictTagType(v: DimensionProgress['verdict']): 'success' | 'danger' | 'info' {
  if (v === 'PASS') return 'success'
  if (v === 'FAIL') return 'danger'
  return 'info'
}

function statusText(s: number): string {
  switch (s) {
    case ReviewStatus.REVIEWING: return 'AI 审核中'
    case ReviewStatus.PENDING_AUTO: return '待自动处理'
    case ReviewStatus.AUTO_DONE: return '已自动处理'
    case ReviewStatus.PENDING_MANUAL: return '待人工确认'
    case ReviewStatus.MANUAL_DONE: return '人工已确认'
    case ReviewStatus.FAILED: return '失败/异常'
    default: return String(s)
  }
}

function statusTagType(s: number): 'info' | 'warning' | 'success' | 'danger' {
  switch (s) {
    case ReviewStatus.REVIEWING: return 'info'
    case ReviewStatus.PENDING_AUTO: return 'info'
    case ReviewStatus.AUTO_DONE: return 'success'
    case ReviewStatus.PENDING_MANUAL: return 'warning'
    case ReviewStatus.MANUAL_DONE: return 'success'
    case ReviewStatus.FAILED: return 'danger'
    default: return 'info'
  }
}

function confidenceColor(c: number | null): string {
  if (c == null) return '#909399'
  if (c >= 80) return '#67c23a'
  if (c >= 50) return '#e6a23c'
  return '#f56c6c'
}

function formatTime(iso: string | null | undefined): string {
  if (!iso) return '-'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function formatDuration(ms: number | null | undefined): string {
  if (ms == null) return '-'
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

// ---- 加载快照 ----
async function loadSnapshot() {
  if (!recordId.value) return
  loading.value = true
  loadError.value = ''
  try {
    progress.value = await getReviewProgress(recordId.value)
  } catch (err) {
    loadError.value = err instanceof Error ? err.message : '加载失败'
    console.error('加载审核进度快照出错:', err)
  } finally {
    loading.value = false
  }
}

// ---- SSE 订阅 ----
function connectSSE() {
  if (!recordId.value || !auth.token) return
  // 关闭旧连接
  closeSSE()

  es = subscribeReviewProgress(recordId.value, auth.token)

  es.onopen = () => {
    sseConnected.value = true
  }

  const handleEvent = (type: SSEEventType, data: string) => {
    try {
      const payload = JSON.parse(data) as ReviewProgress
      payload.eventType = type
      applyEvent(type, payload)
    } catch (e) {
      console.error('SSE 数据解析失败:', type, e)
    }
  }

  ;(['SNAPSHOT', 'STARTED', 'DIMENSION_DONE', 'JUDGE_DONE', 'FINISHED'] as SSEEventType[]).forEach(
    (type) => {
      es?.addEventListener(type, (e: MessageEvent) => handleEvent(type, e.data))
    },
  )

  es.onerror = () => {
    sseConnected.value = false
    // EventSource 默认自动重连，重连后服务端推 SNAPSHOT 补偿
  }
}

function closeSSE() {
  if (es) {
    es.close()
    es = null
    sseConnected.value = false
  }
}

/** 将 SSE 事件增量合并到 progress */
function applyEvent(type: SSEEventType, payload: ReviewProgress) {
  if (type === 'SNAPSHOT') {
    // 全量覆盖
    progress.value = payload
    return
  }

  if (!progress.value) {
    // 没有 snapshot 基础状态，直接用 payload 作为基础
    progress.value = payload
    return
  }

  const base = progress.value

  if (type === 'STARTED') {
    base.startedAt = payload.startedAt ?? base.startedAt
    if (payload.dimensions?.length) base.dimensions = payload.dimensions
    if (payload.judge) base.judge = payload.judge
    return
  }

  if (type === 'DIMENSION_DONE') {
    // payload.dimensions 只含该维度 1 项
    for (const incoming of payload.dimensions ?? []) {
      const idx = base.dimensions.findIndex((d) => d.agentName === incoming.agentName)
      if (idx >= 0) {
        base.dimensions[idx] = { ...base.dimensions[idx], ...incoming }
      }
    }
    return
  }

  if (type === 'JUDGE_DONE') {
    if (payload.judge) base.judge = payload.judge
    return
  }

  if (type === 'FINISHED') {
    base.finishedAt = payload.finishedAt
    base.finalStatus = payload.finalStatus
    base.finalVerdict = payload.finalVerdict
    base.finalConfidence = payload.finalConfidence
    // 服务端会主动 complete()，前端也显式关闭双保险
    closeSSE()
    return
  }
}

// ---- 人工确认 ----
function openConfirmDialog(verdict?: 1 | -1) {
  adminVerdict.value = verdict ?? 1
  adminNote.value = ''
  confirmVisible.value = true
}

async function handleConfirmSubmit() {
  if (!recordId.value) return
  confirmLoading.value = true
  try {
    await confirmReview(recordId.value, {
      adminVerdict: adminVerdict.value,
      adminNote: adminNote.value || undefined,
    })
    ElMessage.success(adminVerdict.value === 1 ? '已通过审核，歌曲恢复上架' : '已驳回审核，歌曲已下架')
    confirmVisible.value = false
    // 重新拉取快照以同步最终状态
    await loadSnapshot()
  } catch (err) {
    console.error('确认审核出错:', err)
  } finally {
    confirmLoading.value = false
  }
}

function handleQuickConfirm(verdict: 1 | -1) {
  const action = verdict === 1 ? '通过' : '驳回'
  const statusText = verdict === 1 ? '恢复上架' : '下架'
  const title = progress.value?.trackTitle ?? '该歌曲'
  ElMessageBox.confirm(
    `确认对歌曲《${title}》执行【${action}】操作？歌曲将${statusText}。`,
    '审核确认',
    {
      confirmButtonText: action,
      cancelButtonText: '取消',
      type: verdict === 1 ? 'success' : 'warning',
    },
  )
    .then(async () => {
      try {
        await confirmReview(recordId.value, { adminVerdict: verdict })
        ElMessage.success(`已${action}，歌曲已${statusText}`)
        await loadSnapshot()
      } catch (err) {
        console.error('快速确认出错:', err)
      }
    })
    .catch(() => {})
}

function goBack() {
  router.push('/approval')
}

onMounted(async () => {
  await loadSnapshot()
  // 若审核尚未完结，订阅 SSE 接收增量
  if (progress.value && !progress.value.finishedAt) {
    connectSSE()
  }
})

onUnmounted(() => {
  closeSSE()
})
</script>

<template>
  <div class="page-review-detail">
    <PageHeader
      :title="progress?.trackTitle ? `审核详情 · ${progress.trackTitle}` : '审核详情'"
      subtitle="AI 审核 4 维度并行 + 裁决 Agent 汇总"
    >
      <template #actions>
        <el-button :icon="ArrowLeft" @click="goBack">返回列表</el-button>
        <el-button type="primary" :icon="Refresh" :loading="loading" @click="loadSnapshot">
          刷新快照
        </el-button>
      </template>
    </PageHeader>

    <div class="page-review-detail__content">
      <!-- 加载错误 -->
      <el-alert
        v-if="loadError"
        :title="loadError"
        type="error"
        :closable="false"
        show-icon
        class="info-alert"
      />

      <!-- 加载中骨架 -->
      <el-skeleton v-if="loading && !progress" :rows="6" animated />

      <!-- 空状态 -->
      <el-card v-else-if="!progress" shadow="never" class="page-card">
        <EmptyState icon="WarningFilled" title="未找到审核进度" hint="该审核记录可能尚未初始化进度" />
      </el-card>

      <!-- 进度内容 -->
      <template v-else>
        <!-- SSE 连接状态 -->
        <div class="sse-status-bar">
          <el-tag v-if="isFinished" type="info" size="small" effect="plain">SSE 已关闭（审核完结）</el-tag>
          <el-tag v-else-if="sseConnected" type="success" size="small" effect="plain">
            <el-icon class="el-icon--left"><Loading /></el-icon>
            SSE 实时连接中
          </el-tag>
          <el-tag v-else type="warning" size="small" effect="plain">SSE 未连接 / 重连中</el-tag>

          <el-tag :type="statusTagType(progress.finalStatus ?? ReviewStatus.REVIEWING)" size="small">
            {{ statusText(progress.finalStatus ?? ReviewStatus.REVIEWING) }}
          </el-tag>
        </div>

        <!-- 完结横幅 -->
        <el-alert
          v-if="finishedBanner"
          :title="finishedBanner.text"
          :type="finishedBanner.type"
          :closable="false"
          show-icon
          class="info-alert"
        />

        <!-- 基本信息 -->
        <el-card shadow="never" class="page-card">
          <template #header>
            <span class="card-title">基本信息</span>
          </template>
          <el-descriptions :column="3" border size="small">
            <el-descriptions-item label="审核记录 ID">{{ progress.recordId }}</el-descriptions-item>
            <el-descriptions-item label="歌曲 ID">{{ progress.trackId }}</el-descriptions-item>
            <el-descriptions-item label="歌曲标题">{{ progress.trackTitle }}</el-descriptions-item>
            <el-descriptions-item label="开始时间">{{ formatTime(progress.startedAt) }}</el-descriptions-item>
            <el-descriptions-item label="完结时间">{{ formatTime(progress.finishedAt) }}</el-descriptions-item>
            <el-descriptions-item label="最终置信度">
              <span v-if="progress.finalConfidence != null" :style="{ color: confidenceColor(progress.finalConfidence) }">
                {{ progress.finalConfidence }}/100
              </span>
              <span v-else class="text-placeholder">-</span>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 4 维度进度 -->
        <el-card shadow="never" class="page-card">
          <template #header>
            <span class="card-title">维度审核进度（4 维度并行）</span>
          </template>
          <div class="dimensions-grid">
            <div
              v-for="dim in progress.dimensions"
              :key="dim.agentName"
              class="dimension-card"
              :class="{ 'dimension-card--done': dim.status === 'DONE' }"
            >
              <div class="dimension-card__header">
                <div class="dimension-card__name">
                  <span class="dimension-card__order">{{ dim.order }}</span>
                  <span>{{ dim.displayName }}</span>
                </div>
                <el-tag
                  :type="dim.status === 'DONE' ? 'success' : 'info'"
                  size="small"
                  effect="plain"
                >
                  <el-icon v-if="dim.status === 'DONE'" class="el-icon--left"><CircleCheckFilled /></el-icon>
                  <el-icon v-else class="el-icon--left"><Clock /></el-icon>
                  {{ dim.status === 'DONE' ? '已完成' : '等待中' }}
                </el-tag>
              </div>

              <div class="dimension-card__body">
                <div class="dimension-card__row">
                  <span class="label">判定</span>
                  <el-tag
                    v-if="dim.verdict"
                    :type="verdictTagType(dim.verdict)"
                    size="small"
                  >
                    <el-icon v-if="dim.verdict === 'PASS'" class="el-icon--left"><Check /></el-icon>
                    <el-icon v-else class="el-icon--left"><Close /></el-icon>
                    {{ dim.verdict === 'PASS' ? '通过' : '不通过' }}
                  </el-tag>
                  <span v-else class="text-placeholder">-</span>
                </div>

                <div class="dimension-card__row">
                  <span class="label">置信度</span>
                  <el-progress
                    v-if="dim.confidence != null"
                    :percentage="dim.confidence"
                    :color="confidenceColor(dim.confidence)"
                    :stroke-width="12"
                    :text-inside="true"
                    style="width: 160px;"
                  />
                  <span v-else class="text-placeholder">-</span>
                </div>

                <div v-if="dim.reason" class="dimension-card__reason">
                  <el-icon class="reason-icon"><WarningFilled /></el-icon>
                  <span>{{ dim.reason }}</span>
                </div>

                <div class="dimension-card__time">
                  <span class="label">完成时间</span>
                  <span>{{ formatTime(dim.finishedAt) }}</span>
                  <span class="label">耗时</span>
                  <span>{{ formatDuration(dim.durationMs) }}</span>
                </div>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 裁决 Agent -->
        <el-card shadow="never" class="page-card">
          <template #header>
            <span class="card-title">裁决 Agent 汇总</span>
          </template>
          <div class="judge-block">
            <div class="judge-block__status">
              <el-tag
                :type="progress.judge.status === 'DONE' ? 'success' : 'info'"
                size="small"
              >
                {{ progress.judge.status === 'DONE' ? '已完成' : '等待中' }}
              </el-tag>
              <el-tag
                v-if="progress.judge.verdict"
                :type="verdictTagType(progress.judge.verdict)"
                size="small"
              >
                {{ judgeVerdictText }}
              </el-tag>
            </div>

            <el-descriptions :column="2" border size="small" class="judge-desc">
              <el-descriptions-item label="置信度">
                <span v-if="progress.judge.confidence != null" :style="{ color: confidenceColor(progress.judge.confidence) }">
                  {{ progress.judge.confidence }}/100
                </span>
                <span v-else class="text-placeholder">-</span>
              </el-descriptions-item>
              <el-descriptions-item label="完成时间">{{ formatTime(progress.judge.finishedAt) }}</el-descriptions-item>
              <el-descriptions-item label="失败原因" :span="2">
                <span v-if="progress.judge.reason" class="fail-reasons">{{ progress.judge.reason }}</span>
                <span v-else class="text-placeholder">-</span>
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </el-card>

        <!-- 操作区 -->
        <el-card shadow="never" class="page-card">
          <template #header>
            <span class="card-title">人工确认</span>
          </template>
          <div class="action-bar">
            <el-button type="success" :icon="Check" @click="handleQuickConfirm(1)">
              通过（上架）
            </el-button>
            <el-button type="danger" :icon="Close" @click="handleQuickConfirm(-1)">
              驳回（下架）
            </el-button>
            <el-button :icon="WarningFilled" @click="openConfirmDialog()">
              附注确认
            </el-button>
          </div>
        </el-card>
      </template>
    </div>

    <!-- 附注确认对话框 -->
    <el-dialog
      v-model="confirmVisible"
      title="人工确认审核"
      width="480px"
      destroy-on-close
    >
      <div class="confirm-dialog-body" v-if="progress">
        <div class="confirm-track-info">
          <el-icon class="track-icon"><WarningFilled /></el-icon>
          <div>
            <div class="confirm-track-title">{{ progress.trackTitle }}</div>
            <div class="confirm-track-sub">
              AI 置信度: {{ progress.finalConfidence ?? progress.judge.confidence ?? '-' }}/100 · {{ formatTime(progress.startedAt) }}
            </div>
          </div>
        </div>

        <div class="confirm-fail-reasons" v-if="progress.judge.reason">
          <div class="reasons-label">AI 不通过原因:</div>
          <div class="reasons-text">{{ progress.judge.reason }}</div>
        </div>

        <el-divider />

        <div class="verdict-section">
          <div class="verdict-label">管理员裁决 <span class="required">*</span></div>
          <el-radio-group v-model="adminVerdict" size="large">
            <el-radio-button :value="1">
              <el-icon><Check /></el-icon>
              通过（上架）
            </el-radio-button>
            <el-radio-button :value="-1">
              <el-icon><Close /></el-icon>
              驳回（下架）
            </el-radio-button>
          </el-radio-group>
        </div>

        <div class="note-section">
          <div class="note-label">审核备注</div>
          <el-input
            v-model="adminNote"
            type="textarea"
            :rows="3"
            maxlength="500"
            show-word-limit
            placeholder="可填写人工审核结论说明（选填）"
          />
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="confirmVisible = false">取消</el-button>
          <el-button
            :type="adminVerdict === 1 ? 'success' : 'danger'"
            :loading="confirmLoading"
            @click="handleConfirmSubmit"
          >
            确认{{ adminVerdict === 1 ? '通过' : '驳回' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.page-review-detail {
  &__content {
    padding: $spacing-md;
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
  }
}

.info-alert {
  // 使用全局 alert 样式
}

.page-card {
  border: 1px solid $border-base;
  border-radius: $radius-md;
  box-shadow: $shadow-card;

  .card-title {
    font-size: $font-size-md;
    font-weight: 600;
    color: $text-primary;
  }
}

.sse-status-bar {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
}

.text-placeholder {
  color: $text-tertiary;
}

.fail-reasons {
  font-size: $font-size-xs;
  color: $text-secondary;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-all;
}

// ---- 维度卡片网格 ----
.dimensions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: $spacing-md;
}

.dimension-card {
  border: 1px solid $border-base;
  border-radius: $radius-md;
  padding: $spacing-md;
  background: $bg-surface;
  transition: border-color 200ms;

  &--done {
    border-color: $border-subtle;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: $spacing-sm;
  }

  &__name {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    font-size: $font-size-md;
    font-weight: 600;
    color: $text-primary;
  }

  &__order {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: $primary-soft;
    color: $primary-color;
    font-size: $font-size-2xs;
    font-weight: 700;
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
  }

  &__row {
    display: flex;
    align-items: center;
    gap: $spacing-sm;

    .label {
      color: $text-tertiary;
      font-size: $font-size-xs;
      width: 56px;
      flex-shrink: 0;
    }
  }

  &__reason {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    background: $bg-subtle;
    border-radius: $radius-sm;
    padding: $spacing-xs $spacing-sm;
    font-size: $font-size-xs;
    color: $text-secondary;
    line-height: 1.5;

    .reason-icon {
      color: $warning-color;
      flex-shrink: 0;
      margin-top: 2px;
    }
  }

  &__time {
    display: grid;
    grid-template-columns: auto 1fr auto 1fr;
    gap: $spacing-xs $spacing-sm;
    font-size: $font-size-2xs;
    color: $text-tertiary;
    align-items: center;

    .label {
      color: $text-tertiary;
    }
  }
}

// ---- 裁决区 ----
.judge-block {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;

  &__status {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
  }
}

.judge-desc {
  max-width: 640px;
}

// ---- 操作区 ----
.action-bar {
  display: flex;
  gap: $spacing-sm;
  flex-wrap: wrap;
}

// ---- 确认对话框（与列表页风格一致） ----
.confirm-dialog-body {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.confirm-track-info {
  display: flex;
  align-items: flex-start;
  gap: $spacing-sm;

  .track-icon {
    font-size: 24px;
    color: $warning-color;
    flex-shrink: 0;
    margin-top: 2px;
  }

  .confirm-track-title {
    font-size: $font-size-md;
    font-weight: 600;
    color: $text-primary;
  }

  .confirm-track-sub {
    font-size: $font-size-xs;
    color: $text-tertiary;
    margin-top: 2px;
  }
}

.confirm-fail-reasons {
  background-color: $bg-subtle;
  border-radius: $radius-md;
  padding: $spacing-sm $spacing-md;

  .reasons-label {
    font-size: $font-size-xs;
    font-weight: 600;
    color: $text-secondary;
    margin-bottom: 4px;
  }

  .reasons-text {
    font-size: $font-size-xs;
    color: $text-tertiary;
    line-height: 1.5;
    white-space: pre-wrap;
    word-break: break-all;
  }
}

.verdict-section {
  .verdict-label {
    font-size: $font-size-sm;
    font-weight: 600;
    color: $text-primary;
    margin-bottom: $spacing-sm;

    .required {
      color: $danger-color;
    }
  }
}

.note-section {
  .note-label {
    font-size: $font-size-sm;
    font-weight: 600;
    color: $text-primary;
    margin-bottom: $spacing-sm;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: $spacing-sm;
}
</style>
