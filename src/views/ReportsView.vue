<script setup>
import { onMounted, ref, reactive, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Document, MagicStick, Calendar, Refresh, View } from '@element-plus/icons-vue'
import {
  listMyReports,
  generateReport,
  statusLabel,
  periodTypeLabel,
} from '../api/reports'

const router = useRouter()

const list = ref([])
const total = ref(0)
const loading = ref(false)
const generating = ref(false)
const pageNum = ref(1)
const pageSize = ref(10)

const filter = reactive({ periodType: undefined })

async function loadData() {
  loading.value = true
  try {
    const params = {
      periodType: filter.periodType,
      pageNum: pageNum.value,
      pageSize: pageSize.value,
    }
    console.log('[Reports] loadData params:', params)
    const res = await listMyReports(params)
    console.log('[Reports] loadData response:', res)
    list.value = res && res.records ? res.records : []
    total.value = Number(res && res.total) || 0
  } catch (err) {
    console.error('[Reports] loadData error:', err)
    ElMessage.error(err.message || '加载报告失败')
    list.value = []
    total.value = 0
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
    console.log('[Reports] generateReport returned id:', reportId)
    ElMessage.success('已提交生成任务')
    if (reportId) {
      await nextTick()
      router.push(`/reports/${reportId}`)
    } else {
      await loadData()
    }
  } catch (err) {
    console.error('[Reports] generate error:', err)
    ElMessage.error(err.message || '生成失败')
  } finally {
    generating.value = false
  }
}

function handleView(row) {
  router.push(`/reports/${row.id}`)
}

onMounted(() => {
  console.log('[Reports] onMounted, route:', router.currentRoute.value)
  loadData()
})
</script>

<template>
  <div class="reports-view">
    <div class="reports-bg" />

    <div class="reports-header">
      <div class="reports-header__title">
        <div class="reports-header__icon">
          <el-icon><Document /></el-icon>
        </div>
        <div>
          <h1>我的报告</h1>
          <p>每周一与每月 1 号自动生成, 也可以手动触发</p>
        </div>
      </div>
      <div class="reports-header__actions">
        <el-button type="primary" :icon="MagicStick" :loading="generating" @click="handleGenerate(1)">
          生成本周报告
        </el-button>
        <el-button type="success" :icon="Calendar" :loading="generating" @click="handleGenerate(2)">
          生成本月报告
        </el-button>
        <el-button :icon="Refresh" @click="loadData">刷新</el-button>
      </div>
    </div>

    <div class="reports-filter">
      <span class="reports-filter__label">周期</span>
      <el-radio-group v-model="filter.periodType" @change="loadData">
        <el-radio-button :value="undefined">全部</el-radio-button>
        <el-radio-button :value="1">周报</el-radio-button>
        <el-radio-button :value="2">月报</el-radio-button>
      </el-radio-group>
    </div>

    <div class="reports-list" v-loading="loading">
      <div v-if="!loading && list.length === 0" class="empty-state">
        <el-icon class="empty-state__icon"><Document /></el-icon>
        <h2>还没有报告</h2>
        <p>点击上方按钮生成你的第一份听歌报告</p>
        <el-button type="primary" :icon="MagicStick" :loading="generating" @click="handleGenerate(1)">
          立即生成
        </el-button>
      </div>

      <div
        v-for="row in list"
        :key="row.id"
        class="report-card"
        @click="handleView(row)"
      >
        <div class="report-card__index">#{{ row.id.toString().slice(-4) }}</div>
        <div class="report-card__body">
          <div class="report-card__title">
            <span>{{ row.title }}</span>
            <el-tag :type="row.periodType === 1 ? 'primary' : 'success'" size="small" effect="dark">
              {{ periodTypeLabel(row.periodType) }}
            </el-tag>
            <el-tag :type="statusType(row.status)" size="small">
              {{ statusLabel(row.status) }}
            </el-tag>
          </div>
          <div class="report-card__meta">
            <span v-if="row.generatedAt">生成于 {{ row.generatedAt }}</span>
            <span v-else class="report-card__pending">生成中...</span>
          </div>
        </div>
        <el-button type="primary" link :icon="View" @click.stop="handleView(row)">
          查看
        </el-button>
      </div>
    </div>

    <div v-if="list.length > 0" class="reports-pagination">
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
/* ================== 黑色主调 ================== */
.reports-view {
  position: relative;
  min-height: 100%;
  padding: 32px 40px;
  background: #000;
  color: #e5e7eb;
  overflow: hidden;
}

/* 极淡的径向发光 (点缀) */
.reports-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255, 255, 255, 0.04) 0%, transparent 60%),
    radial-gradient(ellipse 60% 40% at 50% 100%, rgba(255, 255, 255, 0.02) 0%, transparent 60%);
}

/* ================== Header ================== */
.reports-header {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  margin-bottom: 24px;
  background: #0a0a0a;
  border: 1px solid #1f1f1f;
  border-radius: 8px;
}

.reports-header__title {
  display: flex;
  align-items: center;
  gap: 16px;
}

.reports-header__icon {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  color: #000;
  border-radius: 8px;
  font-size: 28px;
}

.reports-header__title h1 {
  margin: 0 0 4px 0;
  font-size: 22px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 1px;
}

.reports-header__title p {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
}

.reports-header__actions {
  display: flex;
  gap: 10px;
}

/* ================== Filter ================== */
.reports-filter {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding: 0 4px;
}

.reports-filter__label {
  font-size: 13px;
  color: #6b7280;
}

:deep(.reports-filter .el-radio-button__inner) {
  background: #0a0a0a;
  border-color: #1f1f1f;
  color: #9ca3af;
}

:deep(.reports-filter .el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background: #fff;
  color: #000;
  border-color: #fff;
}

/* ================== 列表卡片 ================== */
.reports-list {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.report-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px 24px;
  background: #0a0a0a;
  border: 1px solid #1f1f1f;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.report-card:hover {
  border-color: #fff;
  background: #111;
  transform: translateX(4px);
}

.report-card__index {
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 14px;
  font-weight: 700;
  color: #4b5563;
  min-width: 60px;
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
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 6px;
}

.report-card__title > span:first-child {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.report-card__meta {
  font-size: 12px;
  color: #6b7280;
}

.report-card__pending {
  color: #f59e0b;
}

/* ================== 空状态 ================== */
.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: #0a0a0a;
  border: 1px dashed #1f1f1f;
  border-radius: 8px;
}

.empty-state__icon {
  font-size: 48px;
  color: #4b5563;
  margin-bottom: 16px;
}

.empty-state h2 {
  margin: 0 0 8px;
  font-size: 18px;
  color: #e5e7eb;
}

.empty-state p {
  margin: 0 0 24px;
  font-size: 13px;
  color: #6b7280;
}

/* ================== 分页 ================== */
.reports-pagination {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

:deep(.reports-pagination .el-pagination) {
  --el-pagination-bg-color: #0a0a0a;
  --el-pagination-text-color: #9ca3af;
  --el-pagination-button-bg-color: #0a0a0a;
  --el-pagination-button-color: #9ca3af;
  --el-pagination-button-disabled-bg-color: #050505;
  --el-pagination-hover-color: #fff;
}
</style>