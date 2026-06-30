<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Refresh, MagicStick } from '@element-plus/icons-vue'
import EChart from '@/components/charts/EChart.vue'
import { getReport, regenerateReport, type ReportVO } from '@/api/admin/reports'

const route = useRoute()
const router = useRouter()
const report = ref<ReportVO | null>(null)
const loading = ref(false)
const regenerating = ref(false)
let pollTimer: ReturnType<typeof setInterval> | null = null

const reportId = computed(() => route.params.id as string)

const isGenerating = computed(() => report.value?.status === 0)
const isFailed = computed(() => report.value?.status === 2)
const isNoData = computed(() => report.value?.status === 3)
const isReady = computed(() => report.value?.status === 1)

const stats = computed(() => {
  if (!report.value?.statsSnapshotJson) return null
  try {
    return JSON.parse(report.value.statsSnapshotJson)
  } catch {
    return null
  }
})

const hourlyOption = computed(() => {
  const arr: number[] = stats.value?.hourlyDistribution ?? []
  return {
    tooltip: { trigger: 'axis' },
    grid: { left: 40, right: 20, top: 30, bottom: 30 },
    xAxis: { type: 'category', data: Array.from({ length: 24 }, (_, i) => `${i}:00`) },
    yAxis: { type: 'value' },
    series: [{ name: '播放数', type: 'bar', itemStyle: { color: '#409eff' }, data: arr }],
  }
})

const weekdayOption = computed(() => {
  const arr: number[] = stats.value?.weekdayDistribution ?? []
  const labels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  return {
    tooltip: { trigger: 'axis' },
    grid: { left: 40, right: 20, top: 30, bottom: 30 },
    xAxis: { type: 'category', data: labels },
    yAxis: { type: 'value' },
    series: [{ name: '播放数', type: 'bar', itemStyle: { color: '#67c23a' }, data: arr }],
  }
})

const topTracksItems = computed(() => {
  const list: { id: number; name: string; count: number }[] = stats.value?.topTracks ?? []
  return list.slice(0, 10).map(t => ({ label: t.name || '未知', value: t.count }))
})

const topArtistsItems = computed(() => {
  const list: { id: number; name: string; count: number }[] = stats.value?.topArtists ?? []
  return list.slice(0, 10).map(t => ({ label: t.name || '未知', value: t.count }))
})

async function load() {
  loading.value = true
  try {
    report.value = await getReport(reportId.value)
  } catch (err) {
    console.error('加载报告失败', err)
    ElMessage.error('加载报告失败')
  } finally {
    loading.value = false
  }
}

function startPollingIfNeeded() {
  stopPolling()
  if (isGenerating.value) {
    pollTimer = setInterval(async () => {
      try {
        const latest = await getReport(reportId.value)
        if (latest && latest.status !== 0) {
          report.value = latest
          stopPolling()
          ElMessage.success('报告生成完成')
        }
      } catch {
        // ignore
      }
    }, 3000)
  }
}

function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

async function handleRegenerate() {
  if (!report.value) return
  try {
    await ElMessageBoxRegen()
  } catch {
    return
  }
  regenerating.value = true
  try {
    await regenerateReport(report.value.userId, report.value.periodType)
    ElMessage.success('已提交强制重生成任务')
    await load()
    startPollingIfNeeded()
  } catch (err) {
    console.error('重生成失败', err)
    ElMessage.error('重生成失败')
  } finally {
    regenerating.value = false
  }
}

async function ElMessageBoxRegen() {
  return ElMessageBox.confirm(
    '确认强制重生成这份报告吗？将重新调用 AI（约 5~15 秒）',
    '强制重生成',
    { confirmButtonText: '确认', cancelButtonText: '取消', type: 'warning' },
  )
}

function back() {
  router.push('/admin-reports')
}

onMounted(async () => {
  await load()
  startPollingIfNeeded()
})

onUnmounted(stopPolling)
</script>

<template>
  <div class="page-admin-report-detail" v-loading="loading">
    <div class="page-admin-report-detail__header">
      <el-button :icon="ArrowLeft" link @click="back">返回列表</el-button>
      <el-button :icon="Refresh" link @click="load">刷新</el-button>
    </div>

    <div v-if="report" class="page-admin-report-detail__content">
      <el-card shadow="never" class="header-card">
        <div class="header-content">
          <div>
            <h2 class="title">{{ report.periodTypeLabel }} ({{ report.periodStart }} ~ {{ report.periodEnd }})</h2>
            <p class="subtitle">
              <el-tag :type="report.status === 1 ? 'success' : report.status === 0 ? 'warning' : report.status === 2 ? 'danger' : 'info'" size="small">
                {{ report.statusLabel }}
              </el-tag>
              <span class="time">用户 ID: {{ report.userId }}</span>
              <span v-if="report.generatedAt" class="time">生成于 {{ report.generatedAt }}</span>
            </p>
          </div>
          <div class="header-actions">
            <el-button type="warning" :icon="MagicStick" :loading="regenerating" @click="handleRegenerate">
              强制重生成
            </el-button>
            <el-icon class="header-icon" v-if="isGenerating"><MagicStick /></el-icon>
          </div>
        </div>
      </el-card>

      <el-alert
        v-if="isGenerating"
        title="报告正在生成中…"
        type="warning"
        :closable="false"
        show-icon
        style="margin-top: 16px"
      >
        正在调用 AI，页面会自动刷新状态。
      </el-alert>

      <el-alert
        v-else-if="isFailed"
        title="报告生成失败"
        type="error"
        :closable="false"
        show-icon
        style="margin-top: 16px"
      >
        {{ report.errorMessage || '未知错误' }}
      </el-alert>

      <el-empty
        v-else-if="isNoData"
        description="本周期内暂无听歌数据"
        :image-size="100"
        style="margin-top: 40px"
      />

      <template v-else-if="isReady">
        <el-card shadow="never" class="section-card" style="margin-top: 16px">
          <template #header>
            <span class="section-title">AI 总结</span>
          </template>
          <p class="summary-text">{{ report.summary }}</p>
          <div v-if="report.moodTags && report.moodTags.length > 0" class="mood-tags">
            <el-tag v-for="(tag, idx) in report.moodTags" :key="idx" type="primary" effect="plain" round>
              #{{ tag }}
            </el-tag>
          </div>
        </el-card>

        <el-card v-if="report.highlights && report.highlights.length > 0" shadow="never" class="section-card" style="margin-top: 16px">
          <template #header><span class="section-title">高光时刻</span></template>
          <ul class="highlight-list">
            <li v-for="(h, idx) in report.highlights" :key="idx">{{ h }}</li>
          </ul>
        </el-card>

        <el-row v-if="stats" :gutter="16" style="margin-top: 16px">
          <el-col :span="12">
            <el-card shadow="never" class="section-card">
              <template #header><span class="section-title">时段分布</span></template>
              <EChart :option="hourlyOption" height="280px" />
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card shadow="never" class="section-card">
              <template #header><span class="section-title">周分布</span></template>
              <EChart :option="weekdayOption" height="280px" />
            </el-card>
          </el-col>
        </el-row>

        <el-row v-if="stats" :gutter="16" style="margin-top: 16px">
          <el-col :span="12">
            <el-card shadow="never" class="section-card">
              <template #header><span class="section-title">TOP 歌曲</span></template>
              <ul class="top-list">
                <li v-for="(t, idx) in topTracksItems" :key="idx">
                  <span class="rank">{{ idx + 1 }}</span>
                  <span class="label">{{ t.label }}</span>
                  <span class="value">{{ t.value }} 次</span>
                </li>
                <li v-if="topTracksItems.length === 0" class="empty">暂无数据</li>
              </ul>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card shadow="never" class="section-card">
              <template #header><span class="section-title">TOP 歌手</span></template>
              <ul class="top-list">
                <li v-for="(a, idx) in topArtistsItems" :key="idx">
                  <span class="rank">{{ idx + 1 }}</span>
                  <span class="label">{{ a.label }}</span>
                  <span class="value">{{ a.value }} 次</span>
                </li>
                <li v-if="topArtistsItems.length === 0" class="empty">暂无数据</li>
              </ul>
            </el-card>
          </el-col>
        </el-row>

        <el-card v-if="report.recommendations && report.recommendations.length > 0" shadow="never" class="section-card" style="margin-top: 16px">
          <template #header><span class="section-title">推荐收听</span></template>
          <ul class="highlight-list">
            <li v-for="(r, idx) in report.recommendations" :key="idx">{{ r }}</li>
          </ul>
        </el-card>
      </template>
    </div>
  </div>
</template>

<style scoped lang="scss">
.page-admin-report-detail {
  padding: $spacing-md;

  &__header {
    display: flex;
    gap: $spacing-sm;
    margin-bottom: $spacing-md;
  }
}

.header-card {
  border: 1px solid $border-base;
  border-radius: $radius-md;
  background: linear-gradient(135deg, $primary-color 0%, $primary-dark 100%);
  color: #fff;
  border: none;

  :deep(.el-card__body) { padding: $spacing-lg; }
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: $spacing-md;

  .title {
    font-size: $font-size-lg;
    font-weight: 600;
    margin: 0 0 8px 0;
    color: #fff;
  }

  .subtitle {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    margin: 0;
    font-size: $font-size-sm;
    flex-wrap: wrap;

    .time {
      color: rgba(255, 255, 255, 0.85);
    }
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
  }

  .header-icon {
    font-size: 36px;
    color: rgba(255, 255, 255, 0.6);
    animation: spin 2s linear infinite;
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.section-card {
  border: 1px solid $border-base;
  border-radius: $radius-md;
}

.section-title {
  font-size: $font-size-sm;
  font-weight: 600;
}

.summary-text {
  font-size: $font-size-sm;
  line-height: 1.8;
  color: $text-primary;
  white-space: pre-wrap;
  margin: 0 0 $spacing-sm 0;
}

.mood-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: $spacing-sm;
}

.highlight-list {
  list-style: none;
  margin: 0;
  padding: 0;

  li {
    padding: 8px 12px;
    border-left: 3px solid $primary-color;
    background: $bg-subtle;
    border-radius: $radius-sm;
    margin-bottom: 8px;
    color: $text-primary;
    font-size: $font-size-sm;
    line-height: 1.6;
  }
}

.top-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;

  li {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 6px 0;
  }

  .rank {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: $bg-subtle;
    color: $text-tertiary;
    font-size: 12px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  li:nth-child(1) .rank { background: $primary-color; color: #fff; }
  li:nth-child(2) .rank { background: $warning-color; color: #fff; }
  li:nth-child(3) .rank { background: $success-color; color: #fff; }

  .label {
    flex: 1;
    color: $text-primary;
    font-size: $font-size-sm;
  }

  .value {
    color: $primary-color;
    font-weight: 600;
    font-size: $font-size-sm;
  }

  .empty {
    color: $text-tertiary;
    text-align: center;
    padding: 16px 0;
    justify-content: center;
  }
}
</style>