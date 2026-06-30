<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Refresh,
  Check,
  Close,
  CircleCheckFilled,
  Clock,
  Loading,
  WarningFilled,
  Document,
  Monitor,
  Connection,
  UserFilled,
} from '@element-plus/icons-vue'
import { useAuthStore } from '@/store/modules/auth'
import {
  getReviewDetail,
  subscribeReviewProgress,
  confirmReview,
  ReviewVerdict,
  ReviewStatus,
  DIMENSION_DISPLAY_NAME,
  type ReviewDetail,
  type ReviewProgress,
  type SSEEventType,
  type PipelineStage,
  type DimensionStatus,
} from '@/api/admin/reviewManage'

const props = defineProps<{
  modelValue: boolean
  reviewId: string | null
}>()

const emit = defineEmits<{
  'update:modelValue': [val: boolean]
  confirmed: []
}>()

const auth = useAuthStore()

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

// ---- 详情数据 ----
const detail = ref<ReviewDetail | null>(null)
const loading = ref(false)
const loadError = ref('')

// ---- 实时进度（仅 status=0 时使用） ----
const liveProgress = ref<ReviewProgress | null>(null)

// ---- SSE ----
let es: EventSource | null = null
const sseConnected = ref(false)

// ---- 人工确认对话框 ----
const confirmVisible = ref(false)
const confirmLoading = ref(false)
const adminVerdict = ref<1 | -1>(1)
const adminNote = ref('')

// ---- 是否为审核中状态 ----
const isReviewing = computed(() => detail.value?.status === ReviewStatus.REVIEWING)

// ---- 合并后的进度数据 ----
const progress = computed<ReviewProgress | null>(() => {
  if (liveProgress.value) return liveProgress.value
  return detail.value?.progress ?? null
})

// ---- 流水线阶段步骤 ----
const stageSteps = [
  { title: '歌词拉取', stage: 'LYRICS_PHASE' as PipelineStage },
  { title: '维度分析', stage: 'DIMENSION_PHASE' as PipelineStage },
  { title: '裁决汇总', stage: 'JUDGE_PHASE' as PipelineStage },
  { title: '已完成', stage: 'FINISHED' as PipelineStage },
]

const currentStepIndex = computed(() => {
  const stage = progress.value?.stage
  if (!stage) return 0
  const idx = stageSteps.findIndex((s) => s.stage === stage)
  return idx >= 0 ? idx : 0
})

const dimensionProgressPercent = computed(() => {
  const total = progress.value?.totalDimensions
  const completed = progress.value?.completedDimensions
  if (!total || completed == null) return 0
  return Math.round((completed / total) * 100)
})

// ---- 状态横幅 ----
const statusBanner = computed(() => {
  const d = detail.value
  if (!d) return null
  const s = d.status
  const v = d.verdict
  let text = ''
  let type: 'success' | 'warning' | 'error' | 'info' = 'info'

  if (s === ReviewStatus.REVIEWING) {
    text = 'AI 审核进行中'
    type = 'info'
  } else if (s === ReviewStatus.PENDING_AUTO) {
    text = `AI 置信度 ${d.confidence}，高置信度，等待系统自动处理`
    type = 'info'
  } else if (s === ReviewStatus.AUTO_DONE) {
    text = v === ReviewVerdict.PASS ? '系统已自动通过，歌曲已上架' : '系统已自动驳回，歌曲已下架'
    type = v === ReviewVerdict.PASS ? 'success' : 'error'
  } else if (s === ReviewStatus.PENDING_MANUAL) {
    text = `AI 置信度 ${d.confidence}，低于 80，待人工确认`
    type = 'warning'
  } else if (s === ReviewStatus.MANUAL_DONE) {
    const adminV = d.adminConfirm?.adminVerdict
    text = adminV === 1 ? '管理员已确认通过，歌曲已上架' : '管理员已确认驳回，歌曲已下架'
    type = adminV === 1 ? 'success' : 'error'
  } else if (s === ReviewStatus.FAILED) {
    text = 'AI 审核异常，可手动覆盖结果'
    type = 'error'
  }
  return { text, type }
})

const isFinished = computed(() => {
  const s = detail.value?.status
  if (s == null) return false
  return s !== ReviewStatus.REVIEWING
})

const canConfirm = computed(() => {
  const s = detail.value?.status
  if (s == null) return false
  return s !== ReviewStatus.MANUAL_DONE && s !== ReviewStatus.REVIEWING
})

// ---- AI 裁决结果摘要 ----
const aiVerdictSummary = computed(() => {
  const d = detail.value
  if (!d) return null
  const v = d.verdict
  let label = '审核中'
  let type: 'success' | 'danger' | 'warning' | 'info' = 'info'
  if (v === ReviewVerdict.PASS) { label = '通过'; type = 'success' }
  else if (v === ReviewVerdict.FAIL) { label = '不通过'; type = 'danger' }
  else if (v === ReviewVerdict.WAITING_MANUAL) { label = '待确认'; type = 'warning' }
  return { label, type }
})

// ---- 人工确认结果摘要 ----
const adminVerdictSummary = computed(() => {
  const ac = detail.value?.adminConfirm
  if (!ac) return null
  return {
    label: ac.adminVerdict === 1 ? '通过' : '驳回',
    type: (ac.adminVerdict === 1 ? 'success' : 'danger') as 'success' | 'danger',
    note: ac.adminNote || '无',
    adminId: ac.adminId,
    reviewedAt: ac.reviewedAt,
  }
})

// ---- 辅助函数 ----
function dimensionStatusTagType(status: DimensionStatus): 'success' | 'info' | 'warning' | 'danger' {
  switch (status) {
    case 'DONE': return 'success'
    case 'RUNNING': return 'warning'
    case 'FAIL': return 'danger'
    default: return 'info'
  }
}

function dimensionStatusText(status: DimensionStatus): string {
  switch (status) {
    case 'DONE': return '已完成'
    case 'RUNNING': return '分析中'
    case 'FAIL': return '失败'
    default: return '等待中'
  }
}

function verdictTagType(v: 'PASS' | 'FAIL' | null): 'success' | 'danger' | 'info' {
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

function confidenceColor(c: number | null | undefined): string {
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

// ---- 加载详情 ----
async function loadDetail() {
  if (!props.reviewId) return
  loading.value = true
  loadError.value = ''
  try {
    detail.value = await getReviewDetail(props.reviewId)
    if (detail.value?.status === ReviewStatus.REVIEWING && detail.value.progress) {
      liveProgress.value = detail.value.progress
    }
  } catch (err) {
    loadError.value = err instanceof Error ? err.message : '加载失败'
    console.error('加载审核详情出错:', err)
  } finally {
    loading.value = false
  }
}

// ---- SSE ----
function connectSSE() {
  if (!props.reviewId || !auth.token) return
  closeSSE()

  es = subscribeReviewProgress(props.reviewId, auth.token)

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

  const allEvents: SSEEventType[] = [
    'SNAPSHOT', 'LYRICS_FETCHING', 'LYRICS_DONE', 'STARTED',
    'DIMENSION_STARTED', 'DIMENSION_DONE', 'JUDGE_STARTED', 'JUDGE_DONE', 'FINISHED',
  ]
  allEvents.forEach((type) => {
    es?.addEventListener(type, (e: MessageEvent) => handleEvent(type, e.data))
  })

  es.onerror = () => {
    sseConnected.value = false
  }
}

function closeSSE() {
  if (es) {
    es.close()
    es = null
    sseConnected.value = false
  }
}

function applyEvent(type: SSEEventType, payload: ReviewProgress) {
  if (type === 'SNAPSHOT') {
    liveProgress.value = payload
    return
  }
  if (!liveProgress.value) {
    liveProgress.value = payload
    return
  }
  const base = liveProgress.value

  if (type === 'LYRICS_FETCHING') {
    base.stage = 'LYRICS_PHASE'
    return
  }
  if (type === 'LYRICS_DONE') {
    base.stage = 'LYRICS_PHASE'
    if (payload.judge) base.judge = { ...base.judge, ...payload.judge }
    return
  }
  if (type === 'STARTED') {
    base.startedAt = payload.startedAt ?? base.startedAt
    base.stage = 'DIMENSION_PHASE'
    if (payload.dimensions?.length) base.dimensions = payload.dimensions
    if (payload.judge) base.judge = payload.judge
    return
  }
  if (type === 'DIMENSION_STARTED') {
    base.stage = 'DIMENSION_PHASE'
    for (const incoming of payload.dimensions ?? []) {
      const idx = base.dimensions.findIndex((d) => d.agentName === incoming.agentName)
      if (idx >= 0) {
        base.dimensions[idx] = {
          ...base.dimensions[idx],
          status: 'RUNNING',
          startedAt: incoming.startedAt ?? base.dimensions[idx].startedAt,
        }
      }
    }
    return
  }
  if (type === 'DIMENSION_DONE') {
    base.stage = 'DIMENSION_PHASE'
    for (const incoming of payload.dimensions ?? []) {
      const idx = base.dimensions.findIndex((d) => d.agentName === incoming.agentName)
      if (idx >= 0) base.dimensions[idx] = { ...base.dimensions[idx], ...incoming }
    }
    if (payload.completedDimensions != null) {
      base.completedDimensions = payload.completedDimensions
    } else {
      base.completedDimensions = base.dimensions.filter((d) => d.status === 'DONE').length
    }
    return
  }
  if (type === 'JUDGE_STARTED') {
    base.stage = 'JUDGE_PHASE'
    if (payload.judge) base.judge = { ...base.judge, ...payload.judge, status: 'RUNNING' }
    return
  }
  if (type === 'JUDGE_DONE') {
    base.stage = 'JUDGE_PHASE'
    if (payload.judge) base.judge = payload.judge
    return
  }
  if (type === 'FINISHED') {
    base.stage = 'FINISHED'
    base.finishedAt = payload.finishedAt
    base.finalStatus = payload.finalStatus
    base.finalVerdict = payload.finalVerdict
    base.finalConfidence = payload.finalConfidence
    if (detail.value && payload.finalStatus != null) {
      detail.value.status = payload.finalStatus
      detail.value.verdict = payload.finalVerdict ?? detail.value.verdict
      detail.value.confidence = payload.finalConfidence ?? detail.value.confidence
    }
    closeSSE()
    loadDetail()
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
  if (!props.reviewId) return
  confirmLoading.value = true
  try {
    await confirmReview(props.reviewId, {
      adminVerdict: adminVerdict.value,
      adminNote: adminNote.value || undefined,
    })
    ElMessage.success(adminVerdict.value === 1 ? '已通过审核，歌曲恢复上架' : '已驳回审核，歌曲已下架')
    confirmVisible.value = false
    await loadDetail()
    emit('confirmed')
  } catch (err) {
    console.error('确认审核出错:', err)
  } finally {
    confirmLoading.value = false
  }
}

function handleQuickConfirm(verdict: 1 | -1) {
  const action = verdict === 1 ? '通过' : '驳回'
  const actionResult = verdict === 1 ? '恢复上架' : '下架'
  const title = detail.value?.trackTitle ?? '该歌曲'
  ElMessageBox.confirm(
    `确认对歌曲《${title}》执行【${action}】操作？歌曲将${actionResult}。`,
    '审核确认',
    { confirmButtonText: action, cancelButtonText: '取消', type: verdict === 1 ? 'success' : 'warning' },
  )
    .then(async () => {
      try {
        await confirmReview(props.reviewId!, { adminVerdict: verdict })
        ElMessage.success(`已${action}，歌曲已${actionResult}`)
        await loadDetail()
        emit('confirmed')
      } catch (err) {
        console.error('快速确认出错:', err)
      }
    })
    .catch(() => {})
}

// ---- 弹窗打开/关闭 ----
function handleOpen() {
  if (props.reviewId) {
    loadDetail().then(() => {
      if (detail.value && detail.value.status === ReviewStatus.REVIEWING) {
        connectSSE()
      }
    })
  }
}

function handleClose() {
  closeSSE()
  detail.value = null
  liveProgress.value = null
  loadError.value = ''
}

onUnmounted(() => {
  closeSSE()
})
</script>

<template>
  <el-dialog
    v-model="visible"
    title="审核详情"
    width="880px"
    top="5vh"
    destroy-on-close
    class="review-detail-dialog"
    @open="handleOpen"
    @close="handleClose"
  >
    <div class="detail-body">
      <!-- 加载错误 -->
      <el-alert v-if="loadError" :title="loadError" type="error" :closable="false" show-icon class="detail-alert" />

      <!-- 加载骨架 -->
      <el-skeleton v-if="loading && !detail" :rows="6" animated />

      <!-- 空状态 -->
      <div v-else-if="!detail" class="detail-empty">
        <el-empty description="未找到审核记录" />
      </div>

      <!-- 详情内容 -->
      <template v-else>
        <!-- 顶部信息条 -->
        <div class="detail-topbar">
          <div class="detail-topbar__left">
            <div class="detail-topbar__title">{{ detail.trackTitle }}</div>
            <div class="detail-topbar__meta">
              <span>{{ detail.artistNames || '未知歌手' }}</span>
              <span class="dot">·</span>
              <span>{{ detail.albumTitle || '未知专辑' }}</span>
            </div>
          </div>
          <div class="detail-topbar__right">
            <el-tag v-if="isFinished" type="info" size="small" effect="plain">审核已完结</el-tag>
            <el-tag v-else-if="sseConnected" type="success" size="small" effect="plain">
              <el-icon class="el-icon--left"><Loading /></el-icon>实时连接中
            </el-tag>
            <el-tag v-else type="warning" size="small" effect="plain">SSE 未连接</el-tag>
            <el-tag :type="statusTagType(detail.status)" size="small" effect="plain">
              {{ statusText(detail.status) }}
            </el-tag>
            <el-button text :icon="Refresh" :loading="loading" @click="loadDetail" size="small">刷新</el-button>
          </div>
        </div>

        <!-- 状态横幅 -->
        <el-alert
          v-if="statusBanner"
          :title="statusBanner.text"
          :type="statusBanner.type"
          :closable="false"
          show-icon
          class="detail-alert"
        />

        <!-- ========== 结果总览：AI 裁决 + 人工确认 ========== -->
        <div class="verdict-overview">
          <!-- AI 裁决结果卡片 -->
          <div class="verdict-card verdict-card--ai">
            <div class="verdict-card__header">
              <div class="verdict-card__icon verdict-card__icon--ai">
                <el-icon><Monitor /></el-icon>
              </div>
              <span class="verdict-card__title">AI 裁决</span>
            </div>
            <div class="verdict-card__body">
              <div class="verdict-card__verdict">
                <el-tag
                  v-if="aiVerdictSummary"
                  :type="aiVerdictSummary.type"
                  size="default"
                  effect="light"
                >
                  <el-icon v-if="aiVerdictSummary.type === 'success'" class="el-icon--left"><Check /></el-icon>
                  <el-icon v-else-if="aiVerdictSummary.type === 'danger'" class="el-icon--left"><Close /></el-icon>
                  <el-icon v-else class="el-icon--left"><Clock /></el-icon>
                  {{ aiVerdictSummary.label }}
                </el-tag>
              </div>
              <div class="verdict-card__metric">
                <span class="verdict-card__metric-label">置信度</span>
                <span class="verdict-card__metric-value" :style="{ color: confidenceColor(detail.confidence) }">
                  {{ detail.confidence }}/100
                </span>
              </div>
              <div v-if="detail.failReasons" class="verdict-card__reason">
                <el-icon><WarningFilled /></el-icon>
                <span>{{ detail.failReasons }}</span>
              </div>
            </div>
          </div>

          <!-- 人工确认结果卡片 -->
          <div
            v-if="adminVerdictSummary"
            class="verdict-card"
            :class="adminVerdictSummary.type === 'success' ? 'verdict-card--pass' : 'verdict-card--reject'"
          >
            <div class="verdict-card__header">
              <div
                class="verdict-card__icon"
                :class="adminVerdictSummary.type === 'success' ? 'verdict-card__icon--pass' : 'verdict-card__icon--reject'"
              >
                <el-icon><UserFilled /></el-icon>
              </div>
              <span class="verdict-card__title">人工确认</span>
            </div>
            <div class="verdict-card__body">
              <div class="verdict-card__verdict">
                <el-tag :type="adminVerdictSummary.type" size="default" effect="light">
                  <el-icon v-if="adminVerdictSummary.type === 'success'" class="el-icon--left"><Check /></el-icon>
                  <el-icon v-else class="el-icon--left"><Close /></el-icon>
                  {{ adminVerdictSummary.label }}
                </el-tag>
              </div>
              <div class="verdict-card__metric">
                <span class="verdict-card__metric-label">管理员</span>
                <span class="verdict-card__metric-value">#{{ adminVerdictSummary.adminId }}</span>
              </div>
              <div class="verdict-card__metric">
                <span class="verdict-card__metric-label">确认时间</span>
                <span class="verdict-card__metric-value">{{ formatTime(adminVerdictSummary.reviewedAt) }}</span>
              </div>
              <div class="verdict-card__note">
                <span class="verdict-card__note-label">备注</span>
                <span class="verdict-card__note-text">{{ adminVerdictSummary.note }}</span>
              </div>
            </div>
          </div>

          <!-- 待人工确认占位卡片 -->
          <div
            v-else-if="detail.status === ReviewStatus.PENDING_MANUAL || detail.status === ReviewStatus.FAILED"
            class="verdict-card verdict-card--pending"
          >
            <div class="verdict-card__header">
              <div class="verdict-card__icon verdict-card__icon--pending">
                <el-icon><Clock /></el-icon>
              </div>
              <span class="verdict-card__title">人工确认</span>
            </div>
            <div class="verdict-card__body">
              <div class="verdict-card__placeholder">
                <el-icon class="verdict-card__placeholder-icon"><WarningFilled /></el-icon>
                <span>{{ detail.status === ReviewStatus.FAILED ? 'AI 异常，待人工覆盖' : '待人工确认' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 基本信息网格 -->
        <div class="info-grid">
          <div class="info-cell">
            <span class="info-cell__label">处理状态</span>
            <el-tag :type="statusTagType(detail.status)" size="small" effect="plain">
              {{ statusText(detail.status) }}
            </el-tag>
          </div>
          <div class="info-cell">
            <span class="info-cell__label">创建时间</span>
            <span class="info-cell__value">{{ formatTime(detail.createdAt) }}</span>
          </div>
          <div class="info-cell">
            <span class="info-cell__label">更新时间</span>
            <span class="info-cell__value">{{ formatTime(detail.updatedAt) }}</span>
          </div>
        </div>

        <!-- ========== 实时进度区（审核中） ========== -->
        <template v-if="isReviewing && progress">
          <!-- 流水线步骤条 -->
          <div class="section-block">
            <div class="section-block__title">审核流水线</div>
            <el-steps :active="currentStepIndex" finish-status="success" align-center simple>
              <el-step
                v-for="(step, idx) in stageSteps"
                :key="step.stage"
                :title="step.title"
                :icon="idx === 0 ? Document : idx === 1 ? Monitor : idx === 2 ? Connection : CircleCheckFilled"
              />
            </el-steps>
            <div class="dim-progress-bar" v-if="progress.totalDimensions">
              <span class="dim-progress-bar__label">
                维度进度 {{ progress.completedDimensions ?? 0 }} / {{ progress.totalDimensions }}
              </span>
              <el-progress
                :percentage="dimensionProgressPercent"
                color="#409eff"
                :stroke-width="16"
                :text-inside="true"
              />
            </div>
          </div>

          <!-- 维度卡片 -->
          <div class="section-block">
            <div class="section-block__title">维度审核（4 维度并行）</div>
            <div class="dim-grid">
              <div
                v-for="dim in progress.dimensions"
                :key="dim.agentName"
                class="dim-card"
                :class="{
                  'dim-card--done': dim.status === 'DONE',
                  'dim-card--running': dim.status === 'RUNNING',
                  'dim-card--fail': dim.status === 'FAIL',
                }"
              >
                <div class="dim-card__head">
                  <span class="dim-card__name">
                    <i class="dim-card__order">{{ dim.order }}</i>
                    {{ dim.displayName }}
                  </span>
                  <el-tag :type="dimensionStatusTagType(dim.status)" size="small" effect="plain">
                    <el-icon v-if="dim.status === 'DONE'" class="el-icon--left"><CircleCheckFilled /></el-icon>
                    <el-icon v-else-if="dim.status === 'RUNNING'" class="el-icon--left is-loading"><Loading /></el-icon>
                    <el-icon v-else class="el-icon--left"><Clock /></el-icon>
                    {{ dimensionStatusText(dim.status) }}
                  </el-tag>
                </div>
                <div class="dim-card__body">
                  <div class="dim-card__row">
                    <span class="dim-label">判定</span>
                    <el-tag v-if="dim.verdict" :type="verdictTagType(dim.verdict)" size="small">
                      <el-icon v-if="dim.verdict === 'PASS'" class="el-icon--left"><Check /></el-icon>
                      <el-icon v-else class="el-icon--left"><Close /></el-icon>
                      {{ dim.verdict === 'PASS' ? '通过' : '不通过' }}
                    </el-tag>
                    <span v-else class="dim-placeholder">-</span>
                  </div>
                  <div class="dim-card__row">
                    <span class="dim-label">置信度</span>
                    <el-progress
                      v-if="dim.confidence != null"
                      :percentage="dim.confidence"
                      :color="confidenceColor(dim.confidence)"
                      :stroke-width="10"
                      :text-inside="true"
                      style="flex: 1; max-width: 160px;"
                    />
                    <span v-else class="dim-placeholder">-</span>
                  </div>
                  <div v-if="dim.reason" class="dim-card__reason">
                    <el-icon><WarningFilled /></el-icon>
                    <span>{{ dim.reason }}</span>
                  </div>
                  <div class="dim-card__time">
                    <span>开始 {{ formatTime(dim.startedAt) }}</span>
                    <span>耗时 {{ formatDuration(dim.durationMs) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 裁决 Agent -->
          <div class="section-block">
            <div class="section-block__title">裁决 Agent 汇总</div>
            <div class="judge-panel">
              <div class="judge-panel__head">
                <el-tag :type="dimensionStatusTagType(progress.judge.status)" size="small">
                  <el-icon v-if="progress.judge.status === 'DONE'" class="el-icon--left"><CircleCheckFilled /></el-icon>
                  <el-icon v-else-if="progress.judge.status === 'RUNNING'" class="el-icon--left is-loading"><Loading /></el-icon>
                  <el-icon v-else class="el-icon--left"><Clock /></el-icon>
                  {{ dimensionStatusText(progress.judge.status) }}
                </el-tag>
                <el-tag v-if="progress.judge.verdict" :type="verdictTagType(progress.judge.verdict)" size="small">
                  {{ progress.judge.verdict === 'PASS' ? '通过' : '不通过' }}
                </el-tag>
                <span v-if="progress.judge.confidence != null" class="judge-panel__conf" :style="{ color: confidenceColor(progress.judge.confidence) }">
                  {{ progress.judge.confidence }}/100
                </span>
              </div>
              <div v-if="progress.judge.reason" class="judge-panel__reason">
                <el-icon><WarningFilled /></el-icon>
                <span>{{ progress.judge.reason }}</span>
              </div>
            </div>
          </div>
        </template>

        <!-- ========== 审核报告区（非审核中） ========== -->
        <template v-if="!isReviewing && detail.report">
          <div class="section-block">
            <div class="section-block__title">AI 审核报告</div>

            <!-- 维度概览卡片 -->
            <div class="report-grid">
              <div
                v-for="summary in detail.report.dimensionSummary"
                :key="summary.agentName"
                class="report-card"
                :class="{ 'report-card--fail': summary.verdict === 'FAIL' }"
              >
                <div class="report-card__name">{{ DIMENSION_DISPLAY_NAME[summary.agentName] ?? summary.agentName }}</div>
                <el-tag :type="verdictTagType(summary.verdict)" size="small">
                  <el-icon v-if="summary.verdict === 'PASS'" class="el-icon--left"><Check /></el-icon>
                  <el-icon v-else class="el-icon--left"><Close /></el-icon>
                  {{ summary.verdict === 'PASS' ? '通过' : '不通过' }}
                </el-tag>
                <el-progress
                  :percentage="summary.confidence"
                  :color="confidenceColor(summary.confidence)"
                  :stroke-width="8"
                  :text-inside="true"
                />
              </div>
            </div>

            <!-- 维度详细原因 -->
            <div class="report-reasons">
              <div
                v-for="dim in detail.report.dimensions"
                :key="dim.agentName"
                class="reason-item"
              >
                <div class="reason-item__head">
                  <span class="reason-item__name">{{ DIMENSION_DISPLAY_NAME[dim.agentName] ?? dim.agentName }}</span>
                  <el-tag :type="verdictTagType(dim.verdict)" size="small" effect="plain">
                    {{ dim.verdict === 'PASS' ? '通过' : '不通过' }}
                  </el-tag>
                  <span class="reason-item__conf" :style="{ color: confidenceColor(dim.confidence) }">
                    {{ dim.confidence }}/100
                  </span>
                </div>
                <div v-if="dim.reason" class="reason-item__text">
                  <el-icon><WarningFilled /></el-icon>
                  <span>{{ dim.reason }}</span>
                </div>
              </div>
            </div>

            <!-- 裁决结果 -->
            <div class="judge-summary">
              <div class="judge-summary__head">
                <span class="judge-summary__title">裁决 Agent</span>
                <el-tag :type="verdictTagType(detail.report.judge.verdict)" size="small">
                  {{ detail.report.judge.verdict === 'PASS' ? '通过' : '不通过' }}
                </el-tag>
                <span class="judge-summary__conf" :style="{ color: confidenceColor(detail.report.judge.confidence) }">
                  {{ detail.report.judge.confidence }}/100
                </span>
              </div>
              <div v-if="detail.report.judge.reason" class="judge-summary__reason">
                <el-icon><WarningFilled /></el-icon>
                <span>{{ detail.report.judge.reason }}</span>
              </div>
            </div>
          </div>
        </template>

        <!-- ========== 操作区 ========== -->
        <div v-if="canConfirm" class="action-zone">
          <el-button type="success" :icon="Check" @click="handleQuickConfirm(1)">通过（上架）</el-button>
          <el-button type="danger" :icon="Close" @click="handleQuickConfirm(-1)">驳回（下架）</el-button>
          <el-button :icon="WarningFilled" @click="openConfirmDialog()">附注确认</el-button>
        </div>
      </template>
    </div>

    <!-- 附注确认子弹窗 -->
    <el-dialog
      v-model="confirmVisible"
      title="人工确认审核"
      width="440px"
      append-to-body
      destroy-on-close
    >
      <div class="confirm-body" v-if="detail">
        <div class="confirm-track">
          <el-icon class="confirm-track__icon"><WarningFilled /></el-icon>
          <div>
            <div class="confirm-track__title">{{ detail.trackTitle }}</div>
            <div class="confirm-track__sub">AI 置信度: {{ detail.confidence }}/100</div>
          </div>
        </div>
        <div v-if="detail.failReasons" class="confirm-reasons">
          <div class="confirm-reasons__label">AI 不通过原因</div>
          <div class="confirm-reasons__text">{{ detail.failReasons }}</div>
        </div>
        <el-divider />
        <div class="confirm-verdict">
          <div class="confirm-verdict__label">管理员裁决 <span class="required">*</span></div>
          <el-radio-group v-model="adminVerdict" size="large">
            <el-radio-button :value="1"><el-icon><Check /></el-icon> 通过（上架）</el-radio-button>
            <el-radio-button :value="-1"><el-icon><Close /></el-icon> 驳回（下架）</el-radio-button>
          </el-radio-group>
        </div>
        <div class="confirm-note">
          <div class="confirm-note__label">审核备注</div>
          <el-input v-model="adminNote" type="textarea" :rows="3" maxlength="500" show-word-limit placeholder="可填写人工审核结论说明（选填）" />
        </div>
      </div>
      <template #footer>
        <el-button @click="confirmVisible = false">取消</el-button>
        <el-button :type="adminVerdict === 1 ? 'success' : 'danger'" :loading="confirmLoading" @click="handleConfirmSubmit">
          确认{{ adminVerdict === 1 ? '通过' : '驳回' }}
        </el-button>
      </template>
    </el-dialog>
  </el-dialog>
</template>

<style scoped lang="scss">
// ---- 弹窗内部滚动 ----
.detail-body {
  max-height: 72vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
  padding-right: 4px;
}

.detail-alert {
  margin-bottom: 0;
}

.detail-empty {
  padding: $spacing-xl 0;
}

// ---- 顶部信息条 ----
.detail-topbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: $spacing-md;
  padding-bottom: $spacing-md;
  border-bottom: 1px solid $border-base;

  &__left {
    flex: 1;
    min-width: 0;
  }

  &__title {
    font-size: $font-size-lg;
    font-weight: 700;
    color: $text-primary;
    line-height: 1.3;
  }

  &__meta {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: $font-size-xs;
    color: $text-tertiary;
    margin-top: 4px;

    .dot { color: $border-base; }
  }

  &__right {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    flex-shrink: 0;
  }
}

// ---- 结果总览卡片 ----
.verdict-overview {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $spacing-md;

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
}

.verdict-card {
  display: flex;
  flex-direction: column;
  border: 1px solid $border-base;
  border-radius: $radius-lg;
  overflow: hidden;
  background: $bg-surface;

  &--ai {
    border-color: rgba(244, 63, 94, 0.20);
    background: linear-gradient(135deg, rgba(244, 63, 94, 0.03) 0%, $bg-surface 60%);
  }

  &--pass {
    border-color: rgba(16, 185, 129, 0.25);
  }

  &--reject {
    border-color: rgba(239, 68, 68, 0.25);
  }

  &--pending {
    border-style: dashed;
    border-color: $border-base;
    background: $bg-subtle;
  }

  &__header {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-sm $spacing-md;
    border-bottom: 1px solid $border-subtle;
  }

  &__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: $radius-md;
    font-size: 18px;

    &--ai {
      background: $primary-soft;
      color: $primary-color;
    }

    &--pass {
      background: rgba(16, 185, 129, 0.10);
      color: $success-color;
    }

    &--reject {
      background: rgba(239, 68, 68, 0.10);
      color: $danger-color;
    }

    &--pending {
      background: $border-subtle;
      color: $text-tertiary;
    }
  }

  &__title {
    font-size: $font-size-sm;
    font-weight: 700;
    color: $text-primary;
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
    padding: $spacing-sm $spacing-md $spacing-md;
  }

  &__verdict {
    display: flex;
    align-items: center;
  }

  &__metric {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $spacing-sm;
  }

  &__metric-label {
    font-size: $font-size-2xs;
    color: $text-tertiary;
  }

  &__metric-value {
    font-size: $font-size-sm;
    font-weight: 600;
    color: $text-primary;
  }

  &__reason {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    background: $bg-subtle;
    border-radius: $radius-sm;
    padding: 6px 8px;
    font-size: $font-size-2xs;
    color: $text-secondary;
    line-height: 1.5;

    .el-icon { color: $warning-color; flex-shrink: 0; margin-top: 1px; }
  }

  &__note {
    display: flex;
    flex-direction: column;
    gap: 2px;
    background: $bg-subtle;
    border-radius: $radius-sm;
    padding: 6px 8px;
  }

  &__note-label {
    font-size: $font-size-2xs;
    color: $text-tertiary;
    font-weight: 600;
  }

  &__note-text {
    font-size: $font-size-2xs;
    color: $text-secondary;
    line-height: 1.5;
    word-break: break-all;
  }

  &__placeholder {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-xs 0;
    font-size: $font-size-xs;
    color: $text-tertiary;
  }

  &__placeholder-icon {
    font-size: 16px;
    color: $warning-color;
  }
}

// ---- 信息网格 ----
.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: $spacing-sm;
  padding: $spacing-sm 0;

  @media (max-width: 760px) {
    grid-template-columns: repeat(2, 1fr);
  }
}

.info-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: $spacing-sm $spacing-md;
  background: $bg-subtle;
  border-radius: $radius-md;

  &__label {
    font-size: $font-size-2xs;
    color: $text-tertiary;
  }

  &__value {
    font-size: $font-size-sm;
    font-weight: 600;
    color: $text-primary;
  }
}

// ---- 区块通用 ----
.section-block {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;

  &__title {
    font-size: $font-size-sm;
    font-weight: 700;
    color: $text-primary;
    padding-left: 8px;
    border-left: 3px solid $primary-color;
  }
}

// ---- 进度条 ----
.dim-progress-bar {
  display: flex;
  align-items: center;
  gap: $spacing-md;

  &__label {
    font-size: $font-size-xs;
    color: $text-secondary;
    white-space: nowrap;
  }
}

// ---- 维度卡片 ----
.dim-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $spacing-sm;

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
}

.dim-card {
  border: 1px solid $border-base;
  border-radius: $radius-md;
  padding: $spacing-sm $spacing-md;
  background: $bg-surface;
  transition: border-color 200ms, box-shadow 200ms;

  &--done { border-color: $border-subtle; }
  &--running {
    border-color: $primary-color;
    box-shadow: 0 0 0 2px rgba(244, 63, 94, 0.10);
    animation: pulse-border 1.8s ease-in-out infinite;
  }
  &--fail { border-color: $danger-color; }

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: $spacing-sm;
  }

  &__name {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    font-size: $font-size-sm;
    font-weight: 600;
    color: $text-primary;
  }

  &__order {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: $primary-soft;
    color: $primary-color;
    font-size: $font-size-2xs;
    font-style: normal;
    font-weight: 700;
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;
  }

  &__row {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
  }

  &__reason {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    background: $bg-subtle;
    border-radius: $radius-sm;
    padding: 6px 8px;
    font-size: $font-size-2xs;
    color: $text-secondary;
    line-height: 1.5;

    .el-icon { color: $warning-color; flex-shrink: 0; margin-top: 1px; }
  }

  &__time {
    display: flex;
    gap: $spacing-md;
    font-size: $font-size-2xs;
    color: $text-tertiary;
    padding-top: 4px;
    border-top: 1px dashed $border-subtle;
  }
}

.dim-label {
  font-size: $font-size-2xs;
  color: $text-tertiary;
  width: 42px;
  flex-shrink: 0;
}

.dim-placeholder {
  color: $text-tertiary;
  font-size: $font-size-xs;
}

@keyframes pulse-border {
  0%, 100% { box-shadow: 0 0 0 2px rgba(244, 63, 94, 0.10); }
  50% { box-shadow: 0 0 0 4px rgba(244, 63, 94, 0.18); }
}

// ---- 裁决面板 ----
.judge-panel {
  border: 1px solid $border-base;
  border-radius: $radius-md;
  padding: $spacing-sm $spacing-md;
  background: $bg-surface;

  &__head {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
  }

  &__conf {
    font-size: $font-size-xs;
    font-weight: 600;
  }

  &__reason {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    margin-top: $spacing-sm;
    font-size: $font-size-xs;
    color: $text-secondary;
    line-height: 1.5;

    .el-icon { color: $warning-color; flex-shrink: 0; margin-top: 1px; }
  }
}

// ---- 审核报告 ----
.report-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $spacing-sm;

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
}

.report-card {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-sm $spacing-md;
  border: 1px solid $border-base;
  border-radius: $radius-md;
  background: $bg-surface;

  &--fail { border-color: rgba(239, 68, 68, 0.25); }

  &__name {
    font-size: $font-size-sm;
    font-weight: 600;
    color: $text-primary;
    min-width: 70px;
  }
}

.report-reasons {
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
}

.reason-item {
  padding: $spacing-sm $spacing-md;
  border: 1px solid $border-base;
  border-radius: $radius-md;
  background: $bg-surface;

  &__head {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
  }

  &__name {
    font-size: $font-size-sm;
    font-weight: 600;
    color: $text-primary;
    min-width: 80px;
  }

  &__conf {
    font-size: $font-size-xs;
    font-weight: 600;
  }

  &__text {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    margin-top: 6px;
    font-size: $font-size-2xs;
    color: $text-secondary;
    line-height: 1.5;

    .el-icon { color: $warning-color; flex-shrink: 0; margin-top: 1px; }
  }
}

.judge-summary {
  padding: $spacing-sm $spacing-md;
  border: 1px solid $border-base;
  border-radius: $radius-md;
  background: $bg-surface;

  &__head {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
  }

  &__title {
    font-size: $font-size-sm;
    font-weight: 600;
    color: $text-primary;
  }

  &__conf {
    font-size: $font-size-xs;
    font-weight: 600;
  }

  &__reason {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    margin-top: 6px;
    font-size: $font-size-2xs;
    color: $text-secondary;
    line-height: 1.5;

    .el-icon { color: $warning-color; flex-shrink: 0; margin-top: 1px; }
  }
}

// ---- 操作区 ----
.action-zone {
  display: flex;
  gap: $spacing-sm;
  flex-wrap: wrap;
  padding-top: $spacing-sm;
  border-top: 1px solid $border-base;
}

// ---- 附注确认子弹窗 ----
.confirm-body {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.confirm-track {
  display: flex;
  align-items: flex-start;
  gap: $spacing-sm;

  &__icon {
    font-size: 24px;
    color: $warning-color;
    flex-shrink: 0;
    margin-top: 2px;
  }

  &__title {
    font-size: $font-size-md;
    font-weight: 600;
    color: $text-primary;
  }

  &__sub {
    font-size: $font-size-xs;
    color: $text-tertiary;
    margin-top: 2px;
  }
}

.confirm-reasons {
  background: $bg-subtle;
  border-radius: $radius-md;
  padding: $spacing-sm $spacing-md;

  &__label {
    font-size: $font-size-xs;
    font-weight: 600;
    color: $text-secondary;
    margin-bottom: 4px;
  }

  &__text {
    font-size: $font-size-xs;
    color: $text-tertiary;
    line-height: 1.5;
    white-space: pre-wrap;
    word-break: break-all;
  }
}

.confirm-verdict {
  &__label {
    font-size: $font-size-sm;
    font-weight: 600;
    color: $text-primary;
    margin-bottom: $spacing-sm;

    .required { color: $danger-color; }
  }
}

.confirm-note {
  &__label {
    font-size: $font-size-sm;
    font-weight: 600;
    color: $text-primary;
    margin-bottom: $spacing-sm;
  }
}
</style>
