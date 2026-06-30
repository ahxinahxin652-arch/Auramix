<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh, Check, Close, WarningFilled, View } from '@element-plus/icons-vue'
import PageHeader from '@/components/PageHeader.vue'
import EmptyState from '@/components/EmptyState.vue'
import {
  listReviews,
  confirmReview,
  ReviewStatus,
  ReviewVerdict,
  type ReviewListItem,
} from '@/api/admin/reviewManage'

const router = useRouter()

// ---- 分页与表格 ----
const list = ref<ReviewListItem[]>([])
const loading = ref(false)
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(5)

// ---- 状态筛选 ----
const statusFilter = ref<number | undefined>(undefined)

// ---- 确认对话框 ----
const confirmVisible = ref(false)
const confirmLoading = ref(false)
const currentReview = ref<ReviewListItem | null>(null)
const adminVerdict = ref<1 | -1>(1)
const adminNote = ref('')

// ---- 自动刷新 ----
const autoRefresh = ref(false)
let refreshTimer: ReturnType<typeof setInterval> | null = null

async function loadData() {
  loading.value = true
  try {
    const res = await listReviews({
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      status: statusFilter.value,
    })
    list.value = res.records
    // 后端 total 为 Long 类型，JSON 可能序列化为字符串，el-pagination 需要 number
    total.value = Number(res.total) || 0
  } catch (err) {
    console.error('加载审核列表出错:', err)
  } finally {
    loading.value = false
  }
}

function handlePageChange(p: number) {
  pageNum.value = p
  loadData()
}

function handleSizeChange(size: number) {
  pageSize.value = size
  pageNum.value = 1
  loadData()
}

function openConfirmDialog(row: ReviewListItem) {
  currentReview.value = row
  adminVerdict.value = 1
  adminNote.value = ''
  confirmVisible.value = true
}

async function handleConfirmSubmit() {
  if (!currentReview.value) return
  confirmLoading.value = true
  try {
    await confirmReview(currentReview.value.id, {
      adminVerdict: adminVerdict.value,
      adminNote: adminNote.value || undefined,
    })
    ElMessage.success(adminVerdict.value === 1 ? '已通过审核，歌曲恢复上架' : '已驳回审核，歌曲已下架')
    confirmVisible.value = false
    loadData()
  } catch (err) {
    console.error('确认审核出错:', err)
  } finally {
    confirmLoading.value = false
  }
}

function handleQuickConfirm(row: ReviewListItem, verdict: 1 | -1) {
  const action = verdict === 1 ? '通过' : '驳回'
  const actionResult = verdict === 1 ? '恢复上架' : '下架'
  ElMessageBox.confirm(
    `确认对歌曲《${row.trackTitle}》执行【${action}】操作？歌曲将${actionResult}。`,
    '审核确认',
    {
      confirmButtonText: action,
      cancelButtonText: '取消',
      type: verdict === 1 ? 'success' : 'warning',
    },
  )
    .then(async () => {
      try {
        await confirmReview(row.id, { adminVerdict: verdict })
        ElMessage.success(`已${action}，歌曲已${actionResult}`)
        loadData()
      } catch (err) {
        console.error('快速确认出错:', err)
      }
    })
    .catch(() => {})
}

function toggleAutoRefresh(val: boolean) {
  if (val) {
    refreshTimer = setInterval(() => {
      loadData()
    }, 8000)
  } else if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
}

function handleStatusFilterChange() {
  pageNum.value = 1
  loadData()
}

function goDetail(row: ReviewListItem) {
  router.push(`/approval/detail/${row.id}`)
}

function statusText(s: number): string {
  switch (s) {
    case ReviewStatus.REVIEWING: return '审核中'
    case ReviewStatus.PENDING_AUTO: return '待自动处理'
    case ReviewStatus.AUTO_DONE: return '已自动处理'
    case ReviewStatus.PENDING_MANUAL: return '待人工确认'
    case ReviewStatus.MANUAL_DONE: return '人工已确认'
    case ReviewStatus.FAILED: return '失败/异常'
    default: return String(s)
  }
}

function statusTagType(s: number): 'primary' | 'info' | 'warning' | 'success' | 'danger' {
  switch (s) {
    case ReviewStatus.REVIEWING: return 'primary'
    case ReviewStatus.PENDING_AUTO: return 'info'
    case ReviewStatus.AUTO_DONE: return 'info'
    case ReviewStatus.PENDING_MANUAL: return 'warning'
    case ReviewStatus.MANUAL_DONE: return 'success'
    case ReviewStatus.FAILED: return 'danger'
    default: return 'info'
  }
}

function verdictText(v: number): string {
  switch (v) {
    case ReviewVerdict.PENDING: return '审核中'
    case ReviewVerdict.PASS: return '通过'
    case ReviewVerdict.FAIL: return '不通过'
    case ReviewVerdict.WAITING_MANUAL: return '待确认'
    default: return String(v)
  }
}

function verdictTagType(v: number): 'success' | 'danger' | 'warning' | 'info' {
  switch (v) {
    case ReviewVerdict.PASS: return 'success'
    case ReviewVerdict.FAIL: return 'danger'
    case ReviewVerdict.WAITING_MANUAL: return 'warning'
    default: return 'info'
  }
}

function formatTime(iso: string): string {
  if (!iso) return '-'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function confidenceColor(conf: number): string {
  if (conf >= 70) return '#e6a23c'
  if (conf >= 40) return '#f56c6c'
  return '#909399'
}

onMounted(() => {
  loadData()
})

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer)
})
</script>

<template>
  <div class="page-approval">
    <PageHeader title="智能审批" subtitle="AI 内容安全审核 — 查看全部审核记录与人工确认">
      <template #actions>
        <el-switch
          v-model="autoRefresh"
          active-text="自动刷新"
          @change="(val: string | number | boolean) => toggleAutoRefresh(val === true)"
        />
        <el-button type="primary" :icon="Refresh" :loading="loading" @click="loadData">
          刷新
        </el-button>
      </template>
    </PageHeader>

    <div class="page-approval__content">
      <el-alert
        title="AI 审核流程说明"
        type="info"
        :closable="false"
        show-icon
        class="info-alert"
      >
        <template #default>
          歌曲创建/更新后自动触发 4 维度 AI 审核。置信度 ≥ 80 的结果由系统自动处理，< 80 的低置信度记录需管理员在此人工确认。
          通过则歌曲恢复上架，驳回则歌曲下架。可按状态筛选查看不同阶段的审核记录。
        </template>
      </el-alert>

      <el-card shadow="never" class="page-card">
        <template #header>
          <div class="card-header">
            <span class="card-title">审核记录列表</span>
            <el-tag size="small">共 {{ total }} 条</el-tag>
          </div>
        </template>

        <div class="filter-bar">
          <el-radio-group v-model="statusFilter" @change="handleStatusFilterChange">
            <el-radio-button :value="undefined">全部</el-radio-button>
            <el-radio-button :value="ReviewStatus.REVIEWING">审核中</el-radio-button>
            <el-radio-button :value="ReviewStatus.PENDING_AUTO">待自动处理</el-radio-button>
            <el-radio-button :value="ReviewStatus.AUTO_DONE">已自动处理</el-radio-button>
            <el-radio-button :value="ReviewStatus.PENDING_MANUAL">待人工确认</el-radio-button>
            <el-radio-button :value="ReviewStatus.MANUAL_DONE">人工已确认</el-radio-button>
            <el-radio-button :value="ReviewStatus.FAILED">失败/异常</el-radio-button>
          </el-radio-group>
        </div>

        <el-table v-loading="loading" :data="list" style="width: 100%" empty-text="暂无审核记录">
          <el-table-column label="歌曲" min-width="200">
            <template #default="{ row }">
              <div class="track-info">
                <el-icon class="track-icon"><WarningFilled /></el-icon>
                <div class="track-meta">
                  <span class="track-title">{{ row.trackTitle }}</span>
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="AI 置信度" width="130" align="center">
            <template #default="{ row }">
              <div class="confidence-box">
                <el-progress
                  :percentage="row.confidence"
                  :color="confidenceColor(row.confidence)"
                  :stroke-width="14"
                  :text-inside="true"
                  style="width: 100px;"
                />
              </div>
            </template>
          </el-table-column>

          <el-table-column label="AI 裁决" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="verdictTagType(row.verdict)" size="small">
                {{ verdictText(row.verdict) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="处理状态" width="120" align="center">
            <template #default="{ row }">
              <el-tag :type="statusTagType(row.status)" size="small" effect="plain">
                {{ statusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="审核时间" width="170" align="center">
            <template #default="{ row }">
              <span>{{ formatTime(row.createdAt) }}</span>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="260" fixed="right" align="center">
            <template #default="{ row }">
              <el-button link type="primary" :icon="View" @click="goDetail(row as ReviewListItem)">
                查看进度
              </el-button>
              <template v-if="row.status !== ReviewStatus.MANUAL_DONE">
                <el-button link type="success" :icon="Check" @click="handleQuickConfirm(row as ReviewListItem, 1)">
                  通过
                </el-button>
                <el-button link type="danger" :icon="Close" @click="handleQuickConfirm(row as ReviewListItem, -1)">
                  驳回
                </el-button>
                <el-button link type="info" @click="openConfirmDialog(row as ReviewListItem)">
                  附注
                </el-button>
              </template>
            </template>
          </el-table-column>

          <template #empty>
            <EmptyState icon="CircleCheck" title="暂无审核记录" hint="当前筛选条件下没有审核记录" />
          </template>
        </el-table>

        <div class="pagination-wrapper" v-if="total > 0">
          <el-pagination
            v-model:current-page="pageNum"
            v-model:page-size="pageSize"
            :total="total"
            :page-sizes="[5, 10]"
            layout="total, sizes, prev, pager, next, jumper"
            @current-change="handlePageChange"
            @size-change="handleSizeChange"
          />
        </div>
      </el-card>
    </div>

    <!-- 附注确认对话框 -->
    <el-dialog
      v-model="confirmVisible"
      title="人工确认审核"
      width="480px"
      destroy-on-close
    >
      <div class="confirm-dialog-body" v-if="currentReview">
        <div class="confirm-track-info">
          <el-icon class="track-icon"><WarningFilled /></el-icon>
          <div>
            <div class="confirm-track-title">{{ currentReview.trackTitle }}</div>
            <div class="confirm-track-sub">
              AI 置信度: {{ currentReview.confidence }}/100 · {{ formatTime(currentReview.createdAt) }}
            </div>
          </div>
        </div>

        <div class="confirm-fail-reasons" v-if="currentReview.failReasons">
          <div class="reasons-label">AI 不通过原因:</div>
          <div class="reasons-text">{{ currentReview.failReasons }}</div>
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
.page-approval {
  &__content {
    padding: $spacing-md;
  }
}

.info-alert {
  margin-bottom: $spacing-md;
}

.page-card {
  border: 1px solid $border-base;
  border-radius: $radius-md;
  box-shadow: $shadow-card;
}

.card-header {
  display: flex;
  align-items: center;
  gap: $spacing-sm;

  .card-title {
    font-size: $font-size-md;
    font-weight: 600;
    color: $text-primary;
  }
}

.filter-bar {
  margin-bottom: $spacing-md;
}

.track-info {
  display: flex;
  align-items: center;
  gap: $spacing-sm;

  .track-icon {
    font-size: 20px;
    color: $warning-color;
    flex-shrink: 0;
  }

  .track-meta {
    display: flex;
    flex-direction: column;

    .track-title {
      font-size: $font-size-sm;
      font-weight: 500;
      color: $text-primary;
    }
  }
}

.confidence-box {
  display: flex;
  justify-content: center;
}

.text-placeholder {
  color: $text-tertiary;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: $spacing-md;
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
