<script setup>
import { onMounted, ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Document, MagicStick, Calendar, Refresh, View, ArrowRight, Clock } from '@element-plus/icons-vue'
import {
  listMyReports,
  generateReport,
  statusLabel,
  periodTypeLabel,
} from '../api/reports'

const router = useRouter()

// ================== 状态 ==================
const list = ref([])
const total = ref(0)
const loading = ref(false)
const generating = ref(false)
const pageNum = ref(1)
const pageSize = ref(9) // 3 列网格

const filter = reactive({ periodType: undefined })

// ================== 计算属性 ==================
const hasAny = computed(() => list.value.length > 0)

// ================== 加载 ==================
async function loadData() {
  loading.value = true
  try {
    const params = {
      periodType: filter.periodType,
      pageNum: pageNum.value,
      pageSize: pageSize.value,
    }
    console.log('[Reports] loadData -> params:', params)
    const res = await listMyReports(params)
    console.log('[Reports] loadData <- response:', res)
    if (res && Array.isArray(res.records)) {
      list.value = res.records
      total.value = Number(res.total) || 0
    } else {
      console.warn('[Reports] unexpected response shape, res =', res)
      list.value = []
      total.value = 0
    }
  } catch (err) {
    console.error('[Reports] loadData ERROR:', err)
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

function statusDotColor(status) {
  if (status === 1) return '#22c55e' // 绿: 已生成
  if (status === 0) return '#f59e0b' // 黄: 生成中
  if (status === 2) return '#ef4444' // 红: 失败
  return '#6b7280'                    // 灰: 无数据/未知
}

function shortId(id) {
  const s = String(id || '')
  return s.length > 6 ? s.slice(-6) : s
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
  console.log('[Reports] view row:', row)
  router.push(`/reports/${row.id}`)
}

function handlePageChange(p) {
  pageNum.value = p
  loadData()
}

onMounted(() => {
  console.log('[Reports] onMounted, currentRoute:', router.currentRoute.value.fullPath)
  loadData()
})
</script>

<template>
  <div class="reports-view">
    <!-- 顶部 Hero -->
    <section class="reports-hero">
      <div class="reports-hero__bg" />
      <div class="reports-hero__corner reports-hero__corner--tl" />
      <div class="reports-hero__corner reports-hero__corner--tr" />
      <div class="reports-hero__corner reports-hero__corner--bl" />
      <div class="reports-hero__corner reports-hero__corner--br" />

      <div class="reports-hero__content">
        <div class="reports-hero__top">
          <div class="reports-hero__title">
            <span class="reports-hero__chip">AI INSIGHT</span>
            <h1>我的报告</h1>
            <p>每周一与每月 1 号自动生成, 也可以手动触发</p>
          </div>
          <div class="reports-hero__actions">
            <button class="btn btn-primary" :disabled="generating" @click="handleGenerate(1)">
              <el-icon><MagicStick /></el-icon>
              <span>{{ generating ? '提交中...' : '生成本周报告' }}</span>
            </button>
            <button class="btn btn-secondary" :disabled="generating" @click="handleGenerate(2)">
              <el-icon><Calendar /></el-icon>
              <span>生成本月报告</span>
            </button>
            <button class="btn btn-ghost" :disabled="loading" @click="loadData" title="刷新">
              <el-icon><Refresh :class="{ spinning: loading }" /></el-icon>
            </button>
          </div>
        </div>

        <div class="reports-hero__stats">
          <div class="hero-stat">
            <div class="hero-stat__num">{{ total }}</div>
            <div class="hero-stat__label">总报告数</div>
          </div>
          <div class="hero-stat__divider" />
          <div class="hero-stat">
            <div class="hero-stat__num">{{ list.filter(r => r.status === 1).length }}</div>
            <div class="hero-stat__label">已生成</div>
          </div>
          <div class="hero-stat__divider" />
          <div class="hero-stat">
            <div class="hero-stat__num">{{ list.filter(r => r.status === 0).length }}</div>
            <div class="hero-stat__label">生成中</div>
          </div>
          <div class="hero-stat__divider" />
          <div class="hero-stat">
            <div class="hero-stat__num">{{ list.filter(r => r.status === 2).length }}</div>
            <div class="hero-stat__label">失败</div>
          </div>
        </div>
      </div>
    </section>

    <!-- 过滤栏 -->
    <div class="reports-filter">
      <span class="filter-label">周期</span>
      <div class="filter-buttons">
        <button
          :class="['filter-btn', { 'is-active': filter.periodType === undefined }]"
          @click="filter.periodType = undefined; loadData()"
        >全部</button>
        <button
          :class="['filter-btn', { 'is-active': filter.periodType === 1 }]"
          @click="filter.periodType = 1; loadData()"
        >周报</button>
        <button
          :class="['filter-btn', { 'is-active': filter.periodType === 2 }]"
          @click="filter.periodType = 2; loadData()"
        >月报</button>
      </div>
    </div>

    <!-- 主内容 -->
    <main class="reports-main">
      <!-- 空状态 -->
      <div v-if="!loading && !hasAny" class="empty-state">
        <div class="empty-state__inner">
          <div class="empty-state__icon">
            <el-icon><Document /></el-icon>
          </div>
          <h2>还没有报告</h2>
          <p>点击下方按钮, 让 AI 为你生成第一份听歌报告</p>
          <div class="empty-state__actions">
            <button class="btn btn-primary" :disabled="generating" @click="handleGenerate(1)">
              <el-icon><MagicStick /></el-icon>
              <span>生成本周报告</span>
            </button>
            <button class="btn btn-secondary" :disabled="generating" @click="handleGenerate(2)">
              <el-icon><Calendar /></el-icon>
              <span>生成本月报告</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 卡片网格 -->
      <div v-else class="card-grid">
        <div
          v-for="row in list"
          :key="row.id"
          class="report-card"
          @click="handleView(row)"
        >
          <!-- 顶角 ID + 状态点 -->
          <div class="report-card__top">
            <span class="report-card__id">#{{ shortId(row.id) }}</span>
            <span
              class="report-card__status-dot"
              :style="{ background: statusDotColor(row.status) }"
              :title="statusLabel(row.status)"
            />
          </div>

          <!-- 类型徽章 -->
          <div class="report-card__type">
            <span
              :class="['type-badge', row.periodType === 1 ? 'type-badge--weekly' : 'type-badge--monthly']"
            >{{ periodTypeLabel(row.periodType) }}</span>
          </div>

          <!-- 标题 -->
          <h3 class="report-card__title">{{ row.title }}</h3>

          <!-- 状态文字 -->
          <div class="report-card__status">
            <span class="status-text" :style="{ color: statusDotColor(row.status) }">
              {{ statusLabel(row.status) }}
            </span>
          </div>

          <!-- 周期 + 生成时间 -->
          <div class="report-card__meta">
            <div class="meta-item">
              <el-icon><Calendar /></el-icon>
              <span>{{ row.periodStart }} ~ {{ row.periodEnd }}</span>
            </div>
            <div class="meta-item">
              <el-icon><Clock /></el-icon>
              <span v-if="row.generatedAt">{{ row.generatedAt }}</span>
              <span v-else class="meta-pending">生成中...</span>
            </div>
          </div>

          <!-- 底部查看按钮 -->
          <div class="report-card__footer">
            <span class="view-link">
              查看详情
              <el-icon><ArrowRight /></el-icon>
            </span>
            <el-button
              type="primary"
              :icon="View"
              size="small"
              plain
              class="view-btn"
              @click.stop="handleView(row)"
            >查看</el-button>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="hasAny && total > pageSize" class="reports-pagination">
        <el-pagination
          v-model:current-page="pageNum"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[9, 18, 36]"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="handlePageChange"
          @size-change="loadData"
        />
      </div>
    </main>
  </div>
</template>

<style scoped>
/* ================== 黑色主调 全局 ================== */
.reports-view {
  position: relative;
  min-height: 100%;
  padding: 32px 40px;
  background: #000;
  color: #e5e7eb;
}

/* ================== 通用按钮 (黑主调) ================== */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
  border-radius: 4px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.15s ease;
  background: transparent;
  color: #e5e7eb;
  font-family: inherit;
}

.btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-primary {
  background: #fff;
  color: #000;
  border-color: #fff;
}
.btn-primary:hover:not(:disabled) {
  background: #d4d4d4;
  border-color: #d4d4d4;
}

.btn-secondary {
  background: transparent;
  color: #fff;
  border-color: #fff;
}
.btn-secondary:hover:not(:disabled) {
  background: #fff;
  color: #000;
}

.btn-ghost {
  background: transparent;
  color: #9ca3af;
  border-color: #1f1f1f;
  padding: 8px 12px;
}
.btn-ghost:hover:not(:disabled) {
  color: #fff;
  border-color: #4b5563;
  background: #0a0a0a;
}

.spinning {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* ================== Hero ================== */
.reports-hero {
  position: relative;
  padding: 32px 36px 28px;
  margin-bottom: 24px;
  background: linear-gradient(135deg, #0a0a0a 0%, #111 50%, #0a0a0a 100%);
  border: 1px solid #1f1f1f;
  border-radius: 6px;
  overflow: hidden;
}

.reports-hero__bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 600px 200px at 10% 0%, rgba(255, 255, 255, 0.04) 0%, transparent 50%),
    radial-gradient(ellipse 600px 200px at 90% 100%, rgba(255, 255, 255, 0.03) 0%, transparent 50%);
  pointer-events: none;
}

.reports-hero__corner {
  position: absolute;
  width: 18px;
  height: 18px;
  border: 2px solid #fff;
}
.reports-hero__corner--tl { top: -1px; left: -1px; border-right: none; border-bottom: none; }
.reports-hero__corner--tr { top: -1px; right: -1px; border-left: none; border-bottom: none; }
.reports-hero__corner--bl { bottom: -1px; left: -1px; border-right: none; border-top: none; }
.reports-hero__corner--br { bottom: -1px; right: -1px; border-left: none; border-top: none; }

.reports-hero__content {
  position: relative;
  z-index: 1;
}

.reports-hero__top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.reports-hero__title h1 {
  margin: 8px 0 6px;
  font-size: 32px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 2px;
}

.reports-hero__title p {
  margin: 0;
  font-size: 13px;
  color: #9ca3af;
}

.reports-hero__chip {
  display: inline-block;
  padding: 3px 10px;
  font-size: 10px;
  font-weight: 700;
  color: #fff;
  background: transparent;
  border: 1px solid #fff;
  border-radius: 3px;
  letter-spacing: 2px;
}

.reports-hero__actions {
  display: flex;
  gap: 10px;
}

.reports-hero__stats {
  display: flex;
  align-items: center;
  gap: 24px;
  padding-top: 20px;
  border-top: 1px solid #1f1f1f;
}

.hero-stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.hero-stat__num {
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 28px;
  font-weight: 700;
  color: #fff;
  line-height: 1;
}

.hero-stat__label {
  font-size: 11px;
  color: #6b7280;
  letter-spacing: 1.5px;
  text-transform: uppercase;
}

.hero-stat__divider {
  width: 1px;
  height: 36px;
  background: #1f1f1f;
}
.reports-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 28px;
  margin-bottom: 24px;
  background: #0a0a0a;
  border: 1px solid #1f1f1f;
  border-radius: 6px;
}

.reports-header__left {
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
  border-radius: 6px;
  font-size: 26px;
}

.reports-header__left h1 {
  margin: 0 0 4px;
  font-size: 22px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.5px;
}

.reports-header__left p {
  margin: 0;
  font-size: 12px;
  color: #6b7280;
}

.reports-header__actions {
  display: flex;
  gap: 10px;
}

/* ================== Filter ================== */
.reports-filter {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding: 0 4px;
}

.filter-label {
  font-size: 12px;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 1.5px;
}

.filter-buttons {
  display: flex;
  gap: 4px;
}

.filter-btn {
  padding: 6px 14px;
  font-size: 12px;
  color: #9ca3af;
  background: #0a0a0a;
  border: 1px solid #1f1f1f;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
}

.filter-btn:hover {
  color: #fff;
  border-color: #4b5563;
}

.filter-btn.is-active {
  color: #000;
  background: #fff;
  border-color: #fff;
}

/* ================== 卡片网格 ================== */
.reports-main {
  min-height: 200px;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

@media (max-width: 1100px) {
  .card-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 700px) {
  .card-grid { grid-template-columns: 1fr; }
}

.report-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
  background: #0a0a0a;
  border: 1px solid #1f1f1f;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 220px;
}

.report-card:hover {
  border-color: #fff;
  background: #111;
  transform: translateY(-2px);
}

.report-card__top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.report-card__id {
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 11px;
  color: #4b5563;
  letter-spacing: 0.5px;
}

.report-card__status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.15);
}

.report-card__type {
  display: flex;
}

.type-badge {
  display: inline-block;
  padding: 3px 10px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 3px;
  letter-spacing: 1px;
}

.type-badge--weekly {
  background: #fff;
  color: #000;
}

.type-badge--monthly {
  background: transparent;
  color: #fff;
  border: 1px solid #fff;
}

.report-card__title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.report-card__status {
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-text {
  font-size: 12px;
  font-weight: 500;
}

.report-card__meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 11px;
  color: #6b7280;
  flex: 1;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'Consolas', monospace;
}

.meta-pending {
  color: #f59e0b;
}

.report-card__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #1f1f1f;
  margin-top: auto;
}

.view-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #9ca3af;
  transition: color 0.15s;
}

.report-card:hover .view-link {
  color: #fff;
}

.view-btn {
  background: transparent !important;
  color: #fff !important;
  border-color: #1f1f1f !important;
  padding: 4px 12px !important;
  font-size: 12px !important;
}

.view-btn:hover {
  border-color: #fff !important;
  background: #fff !important;
  color: #000 !important;
}

/* ================== 空状态 ================== */
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  background: #0a0a0a;
  border: 1px dashed #1f1f1f;
  border-radius: 6px;
}

.empty-state__inner {
  text-align: center;
  max-width: 400px;
}

.empty-state__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: #111;
  border: 1px solid #1f1f1f;
  border-radius: 50%;
  font-size: 36px;
  color: #4b5563;
  margin-bottom: 24px;
}

.empty-state h2 {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 600;
  color: #fff;
}

.empty-state p {
  margin: 0 0 24px;
  font-size: 13px;
  color: #6b7280;
}

.empty-state__actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

/* ================== 分页 ================== */
.reports-pagination {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}

:deep(.reports-pagination .el-pagination) {
  --el-pagination-bg-color: #0a0a0a;
  --el-pagination-text-color: #9ca3af;
  --el-pagination-button-bg-color: #0a0a0a;
  --el-pagination-button-color: #9ca3af;
  --el-pagination-button-disabled-bg-color: #050505;
  --el-pagination-hover-color: #fff;
}

:deep(.reports-pagination .el-pager li) {
  background: #0a0a0a;
  color: #9ca3af;
}

:deep(.reports-pagination .el-pager li.is-active) {
  background: #fff !important;
  color: #000 !important;
}

:deep(.reports-pagination .btn-prev),
:deep(.reports-pagination .btn-next) {
  background: #0a0a0a;
  color: #9ca3af;
}
</style>