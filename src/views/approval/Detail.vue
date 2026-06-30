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
  Document,
  Monitor,
  Connection,
} from '@element-plus/icons-vue'
import PageHeader from '@/components/PageHeader.vue'
import EmptyState from '@/components/EmptyState.vue'
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

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const recordId = computed(() => String(route.params.id ?? ''))

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

// ---- 是否为审核中状态（需要 SSE 实时进度） ----
const isReviewing = computed(() => detail.value?.status === ReviewStatus.REVIEWING)

// ---- 合并后的进度数据（优先使用 liveProgress，回退到 detail.progress） ----
const progress = computed<ReviewProgress | null>(() => {
  if (liveProgress.value) return liveProgress.value
  return detail.value?.progress ?? null
})

// ---- 流水线阶段映射到 el-steps ----
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

// ---- 进度条百分比 ----
const dimensionProgressPercent = computed(() => {
  const total = progress.value?.totalDimensions
  const completed = progress.value?.completedDimensions
  if (!total || completed == null) return 0
  return Math.round((completed / total) * 100)
})

// ---- 最终结果横幅 ----
const finishedBanner = computed(() => {
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
    text = v === ReviewVerdict.PASS ? '管理员已确认通过，歌曲已上架' : '管理员已确认驳回，歌曲已下架'
    type = v === ReviewVerdict.PASS ? 'success' : 'error'
  } else if (s === ReviewStatus.FAILED) {
    text = 'AI 审核异常，可手动覆盖结果'
    type = 'error'
  }
  return { text, type }
})

// ---- 是否完结 ----
const isFinished = computed(() => {
  const s = detail.value?.status
  if (s == null) return false
  return s !== ReviewStatus.REVIEWING
})

// ---- 是否可人工确认（非人工已确认且非审核中） ----
const canConfirm = computed(() => {
  const s = detail.value?.status
  if (s == null) return false
  return s !== ReviewStatus.MANUAL_DONE && s !== ReviewStatus.REVIEWING
})

// ---- 维度卡片状态样式 ----
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
  if (!recordId.value) return
  loading.value = true
  loadError.value = ''
  try {
    detail.value = await getReviewDetail(recordId.value)
    // 如果审核中且详情包含 progress 快照，初始化 liveProgress
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

// ---- SSE 订阅 ----
function connectSSE() {
  if (!recordId.value || !auth.token) return
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

  // 订阅全部 9 种事件
  const allEvents: SSEEventType[] = [
    'SNAPSHOT',
    'LYRICS_FETCHING',
    'LYRICS_DONE',
    'STARTED',
    'DIMENSION_STARTED',
    'DIMENSION_DONE',
    'JUDGE_STARTED',
    'JUDGE_DONE',
    'FINISHED',
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

/** 将 SSE 事件增量合并到 liveProgress */
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

  // 歌词阶段事件
  if (type === 'LYRICS_FETCHING') {
    base.stage = 'LYRICS_PHASE'
    return
  }

  if (type === 'LYRICS_DONE') {
    base.stage = 'LYRICS_PHASE'
    // LYRICS_DONE 中 judge.verdict 临时复用为 HAS_LYRICS / NO_LYRICS，不是真实裁决
    if (payload.judge) {
      base.judge = { ...base.judge, ...payload.judge }
    }
    return
  }

  // 维度阶段开始
  if (type === 'STARTED') {
    base.startedAt = payload.startedAt ?? base.startedAt
    base.stage = 'DIMENSION_PHASE'
    if (payload.dimensions?.length) base.dimensions = payload.dimensions
    if (payload.judge) base.judge = payload.judge
    return
  }

  // 单个维度开始执行
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

  // 单个维度完成
  if (type === 'DIMENSION_DONE') {
    base.stage = 'DIMENSION_PHASE'
    for (const incoming of payload.dimensions ?? []) {
      const idx = base.dimensions.findIndex((d) => d.agentName === incoming.agentName)
      if (idx >= 0) {
        base.dimensions[idx] = { ...base.dimensions[idx], ...incoming }
      }
    }
    // 更新已完成维度数
    if (payload.completedDimensions != null) {
      base.completedDimensions = payload.completedDimensions
    } else {
      base.completedDimensions = base.dimensions.filter((d) => d.status === 'DONE').length
    }
    return
  }

  // 裁决阶段开始
  if (type === 'JUDGE_STARTED') {
    base.stage = 'JUDGE_PHASE'
    if (payload.judge) {
      base.judge = { ...base.judge, ...payload.judge, status: 'RUNNING' }
    }
    return
  }

  // 裁决完成
  if (type === 'JUDGE_DONE') {
    base.stage = 'JUDGE_PHASE'
    if (payload.judge) base.judge = payload.judge
    return
  }

  // 流水线完结
  if (type === 'FINISHED') {
    base.stage = 'FINISHED'
    base.finishedAt = payload.finishedAt
    base.finalStatus = payload.finalStatus
    base.finalVerdict = payload.finalVerdict
    base.finalConfidence = payload.finalConfidence
    // 更新 detail 状态以触发 UI 切换
    if (detail.value && payload.finalStatus != null) {
      detail.value.status = payload.finalStatus
      detail.value.verdict = payload.finalVerdict ?? detail.value.verdict
      detail.value.confidence = payload.finalConfidence ?? detail.value.confidence
    }
    closeSSE()
    // 重新加载详情以获取 report 段
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
  if (!recordId.value) return
  confirmLoading.value = true
  try {
    await confirmReview(recordId.value, {
      adminVerdict: adminVerdict.value,
      adminNote: adminNote.value || undefined,
    })
    ElMessage.success(adminVerdict.value === 1 ? '已通过审核，歌曲恢复上架' : '已驳回审核，歌曲已下架')
    confirmVisible.value = false
    await loadDetail()
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
    {
      confirmButtonText: action,
      cancelButtonText: '取消',
      type: verdict === 1 ? 'success' : 'warning',
    },
  )
    .then(async () => {
      try {
        await confirmReview(recordId.value, { adminVerdict: verdict })
        ElMessage.success(`已${action}，歌曲已${actionResult}`)
        await loadDetail()
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
  await loadDetail()
  // 若审核尚未完结，订阅 SSE 接收增量
  if (detail.value && detail.value.status === ReviewStatus.REVIEWING) {
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
      :title="detail?.trackTitle ? `审核详情 · ${detail.trackTitle}` : '审核详情'"
      subtitle="AI 审核 4 维度并行 + 裁决 Agent 汇总"
    >
      <template #actions>
        <el-button :icon="ArrowLeft" @click="goBack">返回列表</el-button>
        <el-button type="primary" :icon="Refresh" :loading="loading" @click="loadDetail">
          刷新
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
      <el-skeleton v-if="loading && !detail" :rows="6" animated />

      <!-- 空状态 -->
      <el-card v-else-if="!detail" shadow="never" class="page-card">
        <EmptyState icon="WarningFilled" title="未找到审核记录" hint="该审核记录可能已被删除" />
      </el-card>

      <!-- 详情内容 -->
      <template v-else>
        <!-- 状态栏 -->
        <div class="sse-status-bar">
          <el-tag v-if="isFinished" type="info" size="small" effect="plain">审核已完结</el-tag>
          <el-tag v-else-if="sseConnected" type="success" size="small" effect="plain">
            <el-icon class="el-icon--left"><Loading /></el-icon>
            SSE 实时连接中
          </el-tag>
          <el-tag v-else type="warning" size="small" effect="plain">SSE 未连接 / 重连中</el-tag>

          <el-tag :type="statusTagType(detail.status)" size="small">
            {{ statusText(detail.status) }}
          </el-tag>
        </div>

        <!-- 完结/状态横幅 -->
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
            <el-descriptions-item label="审核记录 ID">{{ detail.id }}</el-descriptions-item>
            <el-descriptions-item label="歌曲标题">{{ detail.trackTitle }}</el-descriptions-item>
            <el-descriptions-item label="歌手">{{ detail.artistNames || '-' }}</el-descriptions-item>
            <el-descriptions-item label="专辑">{{ detail.albumTitle || '-' }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ formatTime(detail.createdAt) }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ formatTime(detail.updatedAt) }}</el-descriptions-item>
            <el-descriptions-item label="AI 置信度">
              <span :style="{ color: confidenceColor(detail.confidence) }">
                {{ detail.confidence }}/100
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="AI 裁决">
              <el-tag :type="verdictTagType(detail.verdict === ReviewVerdict.PASS ? 'PASS' : detail.verdict === ReviewVerdict.FAIL ? 'FAIL' : null)" size="small">
                {{ detail.verdict === ReviewVerdict.PASS ? '通过' : detail.verdict === ReviewVerdict.FAIL ? '不通过' : detail.verdict === ReviewVerdict.WAITING_MANUAL ? '待确认' : '审核中' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="失败原因" v-if="detail.failReasons">
              <span class="fail-reasons">{{ detail.failReasons }}</span>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- ========== 实时进度区（仅审核中 status=0） ========== -->
        <template v-if="isReviewing && progress">
          <!-- 流水线阶段步骤条 -->
          <el-card shadow="never" class="page-card">
            <template #header>
              <span class="card-title">审核流水线</span>
            </template>
            <el-steps :active="currentStepIndex" finish-status="success" align-center>
              <el-step
                v-for="(step, idx) in stageSteps"
                :key="step.stage"
                :title="step.title"
                :icon="idx === 0 ? Document : idx === 1 ? Monitor : idx === 2 ? Connection : CircleCheckFilled"
              />
            </el-steps>

            <!-- 维度进度条 -->
            <div class="dimension-progress-bar" v-if="progress.totalDimensions">
              <div class="progress-bar-label">
                维度进度：{{ progress.completedDimensions ?? 0 }} / {{ progress.totalDimensions }}
              </div>
              <el-progress
                :percentage="dimensionProgressPercent"
                :color="'#409eff'"
                :stroke-width="18"
                :text-inside="true"
                status="success"
              />
            </div>
          </el-card>

          <!-- 4 维度实时卡片 -->
          <el-card shadow="never" class="page-card">
            <template #header>
              <span class="card-title">维度审核进度（4 维度并行）</span>
            </template>
            <div class="dimensions-grid">
              <div
                v-for="dim in progress.dimensions"
                :key="dim.agentName"
                class="dimension-card"
                :class="{
                  'dimension-card--done': dim.status === 'DONE',
                  'dimension-card--running': dim.status === 'RUNNING',
                  'dimension-card--fail': dim.status === 'FAIL',
                }"
              >
                <div class="dimension-card__header">
                  <div class="dimension-card__name">
                    <span class="dimension-card__order">{{ dim.order }}</span>
                    <span>{{ dim.displayName }}</span>
                  </div>
                  <el-tag
                    :type="dimensionStatusTagType(dim.status)"
                    size="small"
                    effect="plain"
                  >
                    <el-icon v-if="dim.status === 'DONE'" class="el-icon--left"><CircleCheckFilled /></el-icon>
                    <el-icon v-else-if="dim.status === 'RUNNING'" class="el-icon--left is-loading"><Loading /></el-icon>
                    <el-icon v-else class="el-icon--left"><Clock /></el-icon>
                    {{ dimensionStatusText(dim.status) }}
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
                    <span class="label">开始</span>
                    <span>{{ formatTime(dim.startedAt) }}</span>
                    <span class="label">完成</span>
                    <span>{{ formatTime(dim.finishedAt) }}</span>
                    <span class="label">耗时</span>
                    <span>{{ formatDuration(dim.durationMs) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </el-card>

          <!-- 裁决 Agent 实时状态 -->
          <el-card shadow="never" class="page-card">
            <template #header>
              <span class="card-title">裁决 Agent 汇总</span>
            </template>
            <div class="judge-block">
              <div class="judge-block__status">
                <el-tag
                  :type="dimensionStatusTagType(progress.judge.status)"
                  size="small"
                >
                  <el-icon v-if="progress.judge.status === 'DONE'" class="el-icon--left"><CircleCheckFilled /></el-icon>
                  <el-icon v-else-if="progress.judge.status === 'RUNNING'" class="el-icon--left is-loading"><Loading /></el-icon>
                  <el-icon v-else class="el-icon--left"><Clock /></el-icon>
                  {{ dimensionStatusText(progress.judge.status) }}
                </el-tag>
                <el-tag
                  v-if="progress.judge.verdict"
                  :type="verdictTagType(progress.judge.verdict)"
                  size="small"
                >
                  {{ progress.judge.verdict === 'PASS' ? '通过' : '不通过' }}
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
        </template>

        <!-- ========== 审核报告区（status≠0 且有 report） ========== -->
        <template v-if="!isReviewing && detail.report">
          <el-card shadow="never" class="page-card">
            <template #header>
              <span class="card-title">AI 审核报告</span>
            </template>

            <!-- 维度概览 -->
            <div class="report-summary-grid">
              <div
                v-for="summary in detail.report.dimensionSummary"
                :key="summary.agentName"
                class="report-summary-item"
              >
                <div class="report-summary-item__name">
                  {{ DIMENSION_DISPLAY_NAME[summary.agentName] ?? summary.agentName }}
                </div>
                <el-tag :type="verdictTagType(summary.verdict)" size="small">
                  <el-icon v-if="summary.verdict === 'PASS'" class="el-icon--left"><Check /></el-icon>
                  <el-icon v-else class="el-icon--left"><Close /></el-icon>
                  {{ summary.verdict === 'PASS' ? '通过' : '不通过' }}
                </el-tag>
                <el-progress
                  :percentage="summary.confidence"
                  :color="confidenceColor(summary.confidence)"
                  :stroke-width="10"
                  :text-inside="true"
                  style="width: 120px;"
                />
              </div>
            </div>

            <el-divider />

            <!-- 维度详细原因 -->
            <div class="report-details">
              <div
                v-for="dim in detail.report.dimensions"
                :key="dim.agentName"
                class="report-detail-row"
              >
                <div class="report-detail-row__header">
                  <span class="report-detail-row__name">
                    {{ DIMENSION_DISPLAY_NAME[dim.agentName] ?? dim.agentName }}
                  </span>
                  <el-tag :type="verdictTagType(dim.verdict)" size="small" effect="plain">
                    {{ dim.verdict === 'PASS' ? '通过' : '不通过' }}
                  </el-tag>
                  <span class="report-detail-row__confidence" :style="{ color: confidenceColor(dim.confidence) }">
                    {{ dim.confidence }}/100
                  </span>
                </div>
                <div v-if="dim.reason" class="report-detail-row__reason">
                  <el-icon class="reason-icon"><WarningFilled /></el-icon>
                  <span>{{ dim.reason }}</span>
                </div>
              </div>
            </div>

            <el-divider />

            <!-- 裁决 Agent 结果 -->
            <div class="judge-result">
              <div class="judge-result__header">
                <span class="judge-result__title">裁决 Agent</span>
                <el-tag :type="verdictTagType(detail.report.judge.verdict)" size="small">
                  {{ detail.report.judge.verdict === 'PASS' ? '通过' : '不通过' }}
                </el-tag>
                <span class="judge-result__confidence" :style="{ color: confidenceColor(detail.report.judge.confidence) }">
                  {{ detail.report.judge.confidence }}/100
                </span>
              </div>
              <div v-if="detail.report.judge.reason" class="judge-result__reason">
                <el-icon class="reason-icon"><WarningFilled /></el-icon>
                <span>{{ detail.report.judge.reason }}</span>
              </div>
            </div>
          </el-card>
        </template>

        <!-- ========== 管理员确认信息（status=4） ========== -->
        <template v-if="detail.adminConfirm">
          <el-card shadow="never" class="page-card">
            <template #header>
              <span class="card-title">人工确认信息</span>
            </template>
            <el-descriptions :column="2" border size="small">
              <el-descriptions-item label="管理员 ID">{{ detail.adminConfirm.adminId }}</el-descriptions-item>
              <el-descriptions-item label="确认时间">{{ formatTime(detail.adminConfirm.reviewedAt) }}</el-descriptions-item>
              <el-descriptions-item label="管理员裁决">
                <el-tag :type="detail.adminConfirm.adminVerdict === 1 ? 'success' : 'danger'" size="small">
                  {{ detail.adminConfirm.adminVerdict === 1 ? '通过' : '驳回' }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="审核备注">
                <span v-if="detail.adminConfirm.adminNote">{{ detail.adminConfirm.adminNote }}</span>
                <span v-else class="text-placeholder">无</span>
              </el-descriptions-item>
            </el-descriptions>
          </el-card>
        </template>

        <!-- ========== 操作区 ========== -->
        <el-card v-if="canConfirm" shadow="never" class="page-card">
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
      <div class="confirm-dialog-body" v-if="detail">
        <div class="confirm-track-info">
          <el-icon class="track-icon"><WarningFilled /></el-icon>
          <div>
            <div class="confirm-track-title">{{ detail.trackTitle }}</div>
            <div class="confirm-track-sub">
              AI 置信度: {{ detail.confidence }}/100 · {{ formatTime(detail.createdAt) }}
            </div>
          </div>
        </div>

        <div class="confirm-fail-reasons" v-if="detail.failReasons">
          <div class="reasons-label">AI 不通过原因:</div>
          <div class="reasons-text">{{ detail.failReasons }}</div>
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

// ---- 维度进度条 ----
.dimension-progress-bar {
  margin-top: $spacing-md;

  .progress-bar-label {
    font-size: $font-size-sm;
    color: $text-secondary;
    margin-bottom: $spacing-sm;
  }
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
  transition: border-color 200ms, box-shadow 200ms;

  &--done {
    border-color: $border-subtle;
  }

  &--running {
    border-color: $primary-color;
    box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.12);
    animation: pulse-border 1.8s ease-in-out infinite;
  }

  &--fail {
    border-color: $danger-color;
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
    grid-template-columns: auto 1fr auto 1fr auto 1fr;
    gap: $spacing-xs $spacing-sm;
    font-size: $font-size-2xs;
    color: $text-tertiary;
    align-items: center;

    .label {
      color: $text-tertiary;
    }
  }
}

@keyframes pulse-border {
  0%, 100% {
    box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.12);
  }
  50% {
    box-shadow: 0 0 0 4px rgba(64, 158, 255, 0.20);
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

// ---- 审核报告区 ----
.report-summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: $spacing-md;
}

.report-summary-item {
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
  padding: $spacing-sm $spacing-md;
  border: 1px solid $border-base;
  border-radius: $radius-md;
  background: $bg-surface;

  &__name {
    font-size: $font-size-sm;
    font-weight: 600;
    color: $text-primary;
  }
}

.report-details {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.report-detail-row {
  padding: $spacing-sm $spacing-md;
  border: 1px solid $border-base;
  border-radius: $radius-md;
  background: $bg-surface;

  &__header {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
  }

  &__name {
    font-size: $font-size-sm;
    font-weight: 600;
    color: $text-primary;
    min-width: 100px;
  }

  &__confidence {
    font-size: $font-size-xs;
    font-weight: 600;
  }

  &__reason {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    margin-top: $spacing-xs;
    font-size: $font-size-xs;
    color: $text-secondary;
    line-height: 1.5;

    .reason-icon {
      color: $warning-color;
      flex-shrink: 0;
      margin-top: 2px;
    }
  }
}

.judge-result {
  padding: $spacing-sm $spacing-md;
  border: 1px solid $border-base;
  border-radius: $radius-md;
  background: $bg-surface;

  &__header {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
  }

  &__title {
    font-size: $font-size-sm;
    font-weight: 600;
    color: $text-primary;
  }

  &__confidence {
    font-size: $font-size-xs;
    font-weight: 600;
  }

  &__reason {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    margin-top: $spacing-xs;
    font-size: $font-size-xs;
    color: $text-secondary;
    line-height: 1.5;

    .reason-icon {
      color: $warning-color;
      flex-shrink: 0;
      margin-top: 2px;
    }
  }
}

// ---- 操作区 ----
.action-bar {
  display: flex;
  gap: $spacing-sm;
  flex-wrap: wrap;
}

// ---- 确认对话框 ----
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
