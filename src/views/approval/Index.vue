<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh, Check, Close, WarningFilled } from '@element-plus/icons-vue'
import PageHeader from '@/components/PageHeader.vue'
import EmptyState from '@/components/EmptyState.vue'
import { listPendingReviews, confirmReview, type ReviewListItem } from '@/api/admin/reviewManage'

// ---- 分页与表格 ----
const list = ref<ReviewListItem[]>([])
const loading = ref(false)
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)

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
    const res = await listPendingReviews({
      pageNum: pageNum.value,
      pageSize: pageSize.value,
    })
    list.value = res.records
    total.value = res.total
  } catch (err) {
    console.error('加载待审核列表出错:', err)
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
  const statusText = verdict === 1 ? '恢复上架' : '下架'
  ElMessageBox.confirm(
    `确认对歌曲《${row.trackTitle}》执行【${action}】操作？歌曲将${statusText}。`,
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
        ElMessage.success(`已${action}，歌曲已${statusText}`)
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
    <PageHeader title="智能审批" subtitle="AI 内容安全审核 — 人工确认低置信度审核结果">
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
          通过则歌曲恢复上架，驳回则歌曲下架。
        </template>
      </el-alert>

      <el-card shadow="never" class="page-card">
        <template #header>
          <div class="card-header">
            <span class="card-title">待人工确认列表</span>
            <el-tag type="warning" size="small">共 {{ total }} 条待处理</el-tag>
          </div>
        </template>

        <el-table v-loading="loading" :data="list" style="width: 100%" empty-text="暂无待确认审核">
          <el-table-column label="歌曲" min-width="200">
            <template #default="{ row }">
              <div class="track-info">
                <el-icon class="track-icon"><WarningFilled /></el-icon>
                <div class="track-meta">
                  <span class="track-title">{{ row.trackTitle }}</span>
                  <span class="track-id">ID: {{ row.trackId }}</span>
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
              <el-tag :type="row.verdict === -2 ? 'warning' : 'info'" size="small">
                待确认
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="不通过原因" min-width="300">
            <template #default="{ row }">
              <div class="fail-reasons" v-if="row.failReasons">
                {{ row.failReasons }}
              </div>
              <span v-else class="text-placeholder">-</span>
            </template>
          </el-table-column>

          <el-table-column label="审核时间" width="170" align="center">
            <template #default="{ row }">
              <span>{{ formatTime(row.createdAt) }}</span>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="200" fixed="right" align="center">
            <template #default="{ row }">
              <el-button link type="success" :icon="Check" @click="handleQuickConfirm(row as ReviewListItem, 1)">
                通过
              </el-button>
              <el-button link type="danger" :icon="Close" @click="handleQuickConfirm(row as ReviewListItem, -1)">
                驳回
              </el-button>
              <el-button link type="primary" @click="openConfirmDialog(row as ReviewListItem)">
                附注
              </el-button>
            </template>
          </el-table-column>

          <template #empty>
            <EmptyState icon="CircleCheck" title="全部处理完成" hint="当前没有待人工确认的审核记录" />
          </template>
        </el-table>

        <div class="pagination-wrapper" v-if="total > 0">
          <el-pagination
            v-model:current-page="pageNum"
            v-model:page-size="pageSize"
            :total="total"
            :page-sizes="[10, 20, 50]"
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

    .track-id {
      font-size: $font-size-2xs;
      color: $text-tertiary;
    }
  }
}

.confidence-box {
  display: flex;
  justify-content: center;
}

.fail-reasons {
  font-size: $font-size-xs;
  color: $text-secondary;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-all;
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
