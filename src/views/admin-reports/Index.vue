<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh, View, MagicStick, Document, Search } from '@element-plus/icons-vue'
import PageHeader from '@/components/PageHeader.vue'
import {
  listAllReports,
  regenerateReport,
  type AdminReportListItem,
} from '@/api/admin/reports'

const router = useRouter()
const list = ref<AdminReportListItem[]>([])
const total = ref(0)
const loading = ref(false)
const regenerating = ref<string | null>(null)
const pageNum = ref(1)
const pageSize = ref(10)

const filter = reactive({
  periodType: undefined as number | undefined,
  status: undefined as number | undefined,
  userKeyword: '',
})

const periodOptions = [
  { label: '全部周期', value: undefined },
  { label: '周报', value: 1 },
  { label: '月报', value: 2 },
]

const statusOptions = [
  { label: '全部状态', value: undefined },
  { label: '生成中', value: 0 },
  { label: '已生成', value: 1 },
  { label: '失败', value: 2 },
  { label: '无数据', value: 3 },
]

async function loadData() {
  loading.value = true
  try {
    const res = await listAllReports({
      periodType: filter.periodType,
      status: filter.status,
      userKeyword: filter.userKeyword || undefined,
      pageNum: pageNum.value,
      pageSize: pageSize.value,
    })
    list.value = res.records
    total.value = Number(res.total) || 0
  } catch (err) {
    console.error('加载报告列表失败', err)
    ElMessage.error('加载报告列表失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pageNum.value = 1
  loadData()
}

function handleReset() {
  filter.periodType = undefined
  filter.status = undefined
  filter.userKeyword = ''
  pageNum.value = 1
  loadData()
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

function statusType(status: number): 'success' | 'warning' | 'danger' | 'info' {
  if (status === 1) return 'success'
  if (status === 0) return 'warning'
  if (status === 2) return 'danger'
  return 'info'
}

function handleView(row: AdminReportListItem) {
  router.push(`/admin-reports/${row.id}`)
}

async function handleRegenerate(row: AdminReportListItem) {
  try {
    await ElMessageBox.confirm(
      `确认强制重新生成 [${row.userDisplayName || row.userEmail || '用户 ' + row.userId}] 的${row.periodType === 1 ? '周' : '月'}报吗？`,
      '强制重生成',
      { confirmButtonText: '确认生成', cancelButtonText: '取消', type: 'warning' },
    )
  } catch {
    return
  }
  regenerating.value = row.id
  try {
    await regenerateReport(row.userId, row.periodType)
    ElMessage.success('已提交重生成任务')
    setTimeout(loadData, 1500)
  } catch (err) {
    console.error('重生成失败', err)
    ElMessage.error('重生成失败')
  } finally {
    regenerating.value = null
  }
}

onMounted(loadData)
</script>

<template>
  <div class="page-admin-reports">
    <PageHeader title="报告管理" subtitle="查看所有用户的周期报告，必要时强制重生成">
      <template #actions>
        <el-button :icon="Refresh" @click="loadData">刷新</el-button>
      </template>
    </PageHeader>

    <div class="page-admin-reports__content">
      <div class="filter-bar">
        <el-select v-model="filter.periodType" placeholder="周期类型" clearable style="width: 140px" @change="handleSearch">
          <el-option v-for="opt in periodOptions" :key="String(opt.value)" :label="opt.label" :value="opt.value" />
        </el-select>

        <el-select v-model="filter.status" placeholder="状态" clearable style="width: 140px" @change="handleSearch">
          <el-option v-for="opt in statusOptions" :key="String(opt.value)" :label="opt.label" :value="opt.value" />
        </el-select>

        <el-input
          v-model="filter.userKeyword"
          placeholder="按邮箱 / 昵称搜索用户"
          clearable
          style="width: 240px"
          @keyup.enter="handleSearch"
        >
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>

        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>

      <el-card shadow="never" class="report-card" v-loading="loading">
        <el-table :data="list" empty-text="暂无报告数据" stripe>
          <el-table-column label="用户" min-width="220">
            <template #default="{ row }">
              <div class="user-info">
                <el-icon class="user-icon"><Document /></el-icon>
                <div class="user-meta">
                  <span class="name-text">{{ row.userDisplayName || '未设置昵称' }}</span>
                  <span class="email-text">{{ row.userEmail || `ID: ${row.userId}` }}</span>
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="报告" min-width="240">
            <template #default="{ row }">
              <div class="report-info">
                <span class="title-text">{{ row.title }}</span>
                <span class="id-text">ID: {{ row.id }}</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="类型" width="90" align="center">
            <template #default="{ row }">
              <el-tag :type="row.periodType === 1 ? 'primary' : 'success'" size="small">
                {{ row.periodType === 1 ? '周报' : '月报' }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="状态" width="110" align="center">
            <template #default="{ row }">
              <el-tag :type="statusType(row.status)" size="small">{{ row.statusLabel }}</el-tag>
            </template>
          </el-table-column>

          <el-table-column label="生成时间" width="180" align="center">
            <template #default="{ row }">
              <span v-if="row.generatedAt">{{ row.generatedAt }}</span>
              <span v-else class="text-placeholder">-</span>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="180" fixed="right" align="center">
            <template #default="{ row }">
              <el-button link type="primary" :icon="View" @click="handleView(row)">查看</el-button>
              <el-button
                link
                type="warning"
                :icon="MagicStick"
                :loading="regenerating === row.id"
                @click="handleRegenerate(row)"
              >
                强制重生成
              </el-button>
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
.page-admin-reports {
  &__content { padding: $spacing-md; }
}

.filter-bar {
  display: flex;
  gap: $spacing-sm;
  margin-bottom: $spacing-md;
  flex-wrap: wrap;
}

.report-card {
  border: 1px solid $border-base;
  border-radius: $radius-md;
  box-shadow: $shadow-card;
}

.user-info {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
}

.user-icon {
  font-size: 20px;
  color: $primary-color;
}

.user-meta {
  display: flex;
  flex-direction: column;
  min-width: 0;

  .name-text {
    font-size: $font-size-sm;
    font-weight: 500;
    color: $text-primary;
  }
  .email-text {
    font-size: $font-size-2xs;
    color: $text-tertiary;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.report-info {
  display: flex;
  flex-direction: column;

  .title-text {
    font-size: $font-size-sm;
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