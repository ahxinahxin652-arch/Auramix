<script setup lang="ts">
import { onMounted, ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Calendar, Document, MagicStick, View, Refresh } from '@element-plus/icons-vue'
import PageHeader from '@/components/PageHeader.vue'
import { generateReport, listMyReports, type ReportListItem } from '@/api/user/reports'

const router = useRouter()
const list = ref<ReportListItem[]>([])
const total = ref(0)
const loading = ref(false)
const pageNum = ref(1)
const pageSize = ref(10)

const filter = reactive({
  periodType: undefined as number | undefined,
})

const periodOptions = [
  { label: '全部', value: undefined },
  { label: '周报', value: 1 },
  { label: '月报', value: 2 },
]

async function loadData() {
  loading.value = true
  try {
    const res = await listMyReports(filter.periodType, pageNum.value, pageSize.value)
    list.value = res.records
    total.value = Number(res.total) || 0
  } catch (err) {
    console.error('加载报告列表失败', err)
    ElMessage.error('加载报告列表失败')
  } finally {
    loading.value = false
  }
}

function handlePageChange(p: number) {
  pageNum.value = p
  loadData()
}

function handleSizeChange(s: number) {
  pageSize.value = s
  pageNum.value = 1
  loadData()
}

function handleFilterChange() {
  pageNum.value = 1
  loadData()
}

function statusType(status: number): 'success' | 'warning' | 'danger' | 'info' {
  if (status === 1) return 'success'
  if (status === 0) return 'warning'
  if (status === 2) return 'danger'
  return 'info'
}

async function handleGenerate(periodType: number) {
  try {
    await ElMessageBox.confirm(
      `确认生成本${periodType === 1 ? '周' : '月'}报告吗？生成过程会读取你的听歌数据并调用 AI 大约 5~15 秒。`,
      '生成报告',
      { confirmButtonText: '确认生成', cancelButtonText: '取消', type: 'info' },
    )
  } catch {
    return
  }
  try {
    const reportId = await generateReport(periodType)
    ElMessage.success('报告生成任务已提交，正在处理中…')
    if (reportId) {
      // 2 秒后跳详情页, 让用户看到"生成中"状态
      setTimeout(() => {
        router.push(`/reports/${reportId}`)
      }, 1500)
    } else {
      loadData()
    }
  } catch (err) {
    console.error('生成报告失败', err)
    ElMessage.error('生成报告失败')
  }
}

function handleView(row: ReportListItem) {
  router.push(`/reports/${row.id}`)
}

onMounted(loadData)
</script>

<template>
  <div class="page-reports">
    <PageHeader title="我的报告" subtitle="每周一与每月 1 号自动生成，也可手动触发">
      <template #actions>
        <el-button type="primary" :icon="MagicStick" @click="handleGenerate(1)">
          生成本周报告
        </el-button>
        <el-button type="success" :icon="Calendar" @click="handleGenerate(2)">
          生成本月报告
        </el-button>
        <el-button :icon="Refresh" @click="loadData">刷新</el-button>
      </template>
    </PageHeader>

    <div class="page-reports__content">
      <div class="filter-bar">
        <el-select
          v-model="filter.periodType"
          placeholder="报告类型"
          clearable
          style="width: 180px"
          @change="handleFilterChange"
        >
          <el-option v-for="opt in periodOptions" :key="String(opt.value)" :label="opt.label" :value="opt.value" />
        </el-select>
      </div>

      <el-card shadow="never" class="report-card" v-loading="loading">
        <el-table :data="list" empty-text="还没有报告，点右上角生成本周报告试试" stripe>
          <el-table-column label="报告" min-width="280">
            <template #default="{ row }">
              <div class="report-title">
                <el-icon class="report-icon"><Document /></el-icon>
                <div class="report-meta">
                  <span class="title-text">{{ row.title }}</span>
                  <span class="id-text">ID: {{ row.id }}</span>
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="类型" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="row.periodType === 1 ? 'primary' : 'success'" size="small">
                {{ row.periodType === 1 ? '周报' : '月报' }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="状态" width="120" align="center">
            <template #default="{ row }">
              <el-tag :type="statusType(row.status)" size="small">{{ row.statusLabel }}</el-tag>
            </template>
          </el-table-column>

          <el-table-column label="生成时间" width="200" align="center">
            <template #default="{ row }">
              <span v-if="row.generatedAt">{{ row.generatedAt }}</span>
              <span v-else class="text-placeholder">-</span>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="120" fixed="right" align="center">
            <template #default="{ row }">
              <el-button link type="primary" :icon="View" @click="handleView(row)">查看</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-wrapper">
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
  </div>
</template>

<style scoped lang="scss">
.page-reports {
  &__content {
    padding: $spacing-md;
  }
}

.filter-bar {
  display: flex;
  gap: $spacing-sm;
  margin-bottom: $spacing-md;
}

.report-card {
  border: 1px solid $border-base;
  border-radius: $radius-md;
  box-shadow: $shadow-card;
}

.report-title {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
}

.report-icon {
  font-size: 20px;
  color: $primary-color;
}

.report-meta {
  display: flex;
  flex-direction: column;

  .title-text {
    font-size: $font-size-sm;
    font-weight: 500;
    color: $text-primary;
  }

  .id-text {
    font-size: $font-size-2xs;
    color: $text-tertiary;
  }
}

.text-placeholder {
  color: $text-tertiary;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: $spacing-md;
}
</style>