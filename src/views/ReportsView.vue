<script setup>
import { onMounted, ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Document, MagicStick, Calendar, Refresh, View } from '@element-plus/icons-vue'
import {
  listMyReports,
  generateReport,
  statusLabel,
  periodTypeLabel,
  type ReportListItem,
} from '../api/reports'

const router = useRouter()

const list = ref([])
const total = ref(0)
const loading = ref(false)
const generating = ref(false)
const pageNum = ref(1)
const pageSize = ref(10)

const filter = reactive({
  periodType: undefined,
})

const hasAny = computed(() => list.value.length > 0)

async function loadData() {
  loading.value = true
  try {
    const res = await listMyReports({
      periodType: filter.periodType,
      pageNum: pageNum.value,
      pageSize: pageSize.value,
    })
    list.value = res.records || []
    total.value = Number(res.total) || 0
  } catch (err) {
    console.error('加载报告失败:', err)
    ElMessage.error(err.message || '加载报告失败')
  } finally {
    loading.value = false
  }
}

function statusType(status) {
  if (status === 1) return 'success'
  if (status === 0) return 'warning'
  if (status === 2) return 'danger'
  return 'info'
}

async function handleGenerate(periodType) {
  try {
    await ElMessageBox.confirm(
      `确定要生成本${periodType === 1 ? '周' : '月'}报告吗？生成约需 5~15 秒。`,
      '生成报告',
      { confirmButtonText: '开始生成', cancelButtonText: '取消', type: 'info' },
    )
  } catch {
    return
  }
  generating.value = true
  try {
    const reportId = await generateReport(periodType)
    ElMessage.success('已提交生成任务')
    if (reportId) {
      // 直接跳详情页, 让用户看到「生成中」轮询
      setTimeout(() => {
        router.push(`/reports/${reportId}`)
      }, 800)
    } else {
      await loadData()
    }
  } catch (err) {
    console.error('生成失败:', err)
    ElMessage.error(err.message || '生成失败')
  } finally {
    generating.value = false
  }
}

function handleView(row) {
  router.push(`/reports/${row.id}`)
}

onMounted(loadData)
</script>

<template>
  <div class="reports-view">
    <!-- 顶部 header 卡片 -->
    <div class="reports-header">
      <div class="reports-header__title">
        <el-icon class="reports-header__icon"><Document /></el-icon>
        <div>
          <h1>我的报告</h1>
          <p>每周一与每月 1 号自动生成, 也可以手动触发</p>
        </div>
      </div>
      <div class="reports-header__actions">
        <el-button
          type="primary"
          :icon="MagicStick"
          :loading="generating"
          @click="handleGenerate(1)"
        >生成本周报告</el-button>
        <el-button
          type="success"
          :icon="Calendar"
          :loading="generating"
          @click="handleGenerate(2)"
        >生成本月报告</el-button>
        <el-button :icon="Refresh" @click="loadData">刷新</el-button>
      </div>
    </div>

    <!-- 过滤栏 -->
    <div class="reports-filter">
      <span class="reports-filter__label">周期类型</span>
      <el-radio-group v-model="filter.periodType" @change="loadData">
        <el-radio-button :value="undefined">全部</el-radio-button>
        <el-radio-button :value="1">周报</el-radio-button>
        <el-radio-button :value="2">月报</el-radio-button>
      </el-radio-group>
    </div>

    <!-- 列表 -->
    <div class="reports-list" v-loading="loading">
      <el-empty
        v-if="!loading && !hasAny"
        description="还没有报告, 点上方按钮生成第一份"
      />
      <div
        v-for="row in list"
        :key="row.id"
        class="report-card"
        @click="handleView(row)"
      >
        <div class="report-card__cover">
          <el-icon><Document /></el-icon>
        </div>
        <div class="report-card__body">
          <div class="report-card__title">
            {{ row.title }}
            <el-tag
              :type="row.periodType === 1 ? 'primary' : 'success'"
              size="small"
              effect="dark"
            >
              {{ periodTypeLabel(row.periodType) }}
            </el-tag>
            <el-tag :type="statusType(row.status)" size="small">
              {{ statusLabel(row.status) }}
            </el-tag>
          </div>
          <div class="report-card__meta">
            <span v-if="row.generatedAt">生成于 {{ row.generatedAt }}</span>
            <span v-else class="report-card__pending">生成中...</span>
            <span class="report-card__id">ID: {{ row.id }}</span>
          </div>
        </div>
        <el-button type="primary" link :icon="View" @click.stop="handleView(row)">
          查看
        </el-button>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="hasAny" class="reports-pagination">
      <el-pagination
        v-model:current-page="pageNum"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="loadData"
        @size-change="loadData"
      />
    </div>
  </div>
</template>

<style scoped>
.reports-view {
  padding: 24px 32px;
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
  color: #e0e7ff;
}

.reports-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 28px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  margin-bottom: 20px;
  backdrop-filter: blur(10px);
}

.reports-header__title {
  display: flex;
  align-items: center;
  gap: 16px;
}

.reports-header__title h1 {
  margin: 0 0 4px 0;
  font-size: 22px;
  font-weight: 600;
  background: linear-gradient(90deg, #60a5fa, #c084fc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.reports-header__title p {
  margin: 0;
  font-size: 13px;
  color: rgba(224, 231, 255, 0.6);
}

.reports-header__icon {
  font-size: 36px;
  color: #c084fc;
}

.reports-header__actions {
  display: flex;
  gap: 12px;
}

.reports-filter {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding: 0 4px;
}

.reports-filter__label {
  font-size: 13px;
  color: rgba(224, 231, 255, 0.7);
}

.reports-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.report-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px 22px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
}

.report-card:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(192, 132, 252, 0.4);
  transform: translateX(4px);
}

.report-card__cover {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #60a5fa, #c084fc);
  border-radius: 12px;
  font-size: 28px;
  color: #fff;
  flex-shrink: 0;
}

.report-card__body {
  flex: 1;
  min-width: 0;
}

.report-card__title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 500;
  color: #e0e7ff;
  margin-bottom: 6px;
}

.report-card__meta {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 12px;
  color: rgba(224, 231, 255, 0.5);
}

.report-card__pending {
  color: #fbbf24;
}

.report-card__id {
  font-family: 'Consolas', monospace;
}

.reports-pagination {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}
</style>