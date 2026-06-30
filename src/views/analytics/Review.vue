<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Download } from '@element-plus/icons-vue'
import PageHeader from '@/components/PageHeader.vue'
import EChart from '@/components/charts/EChart.vue'
import MetricCard from '@/components/charts/MetricCard.vue'
import { buildExportUrl, getReviews, type ReviewAnalytics } from '@/api/admin/analytics'

const range = ref<string>('7d')
const loading = ref(false)
const data = ref<ReviewAnalytics | null>(null)

const rangeOptions = [
  { label: '近 7 天', value: '7d' },
  { label: '近 30 天', value: '30d' },
  { label: '全部', value: 'all' },
]

async function load(force = false) {
  loading.value = true
  try {
    data.value = await getReviews(range.value, force)
  } catch (err) {
    console.error('加载审核分析失败', err)
    ElMessage.error('加载审核分析失败')
  } finally {
    loading.value = false
  }
}

const verdictOption = computed(() => ({
  tooltip: { trigger: 'item' },
  legend: { bottom: 0 },
  series: [{
    name: '审核裁决',
    type: 'pie',
    radius: ['40%', '70%'],
    data: (data.value?.verdictDist ?? []).map(d => ({ name: d.label, value: d.count })),
  }],
}))

const trendOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  grid: { left: 40, right: 20, top: 30, bottom: 30 },
  xAxis: { type: 'category', data: data.value?.trend.map(p => p.date) ?? [] },
  yAxis: { type: 'value' },
  series: [{
    name: '审核记录数',
    type: 'bar',
    itemStyle: { color: '#e6a23c' },
    data: data.value?.trend.map(p => p.value) ?? [],
  }],
}))

function handleExport() {
  window.open(buildExportUrl('reviews', range.value), '_blank')
}

onMounted(() => load(false))
</script>

<template>
  <div class="page-analytics-review">
    <PageHeader title="审核分析" subtitle="AI 审核通过率、人工介入与按日趋势">
      <template #actions>
        <el-select v-model="range" style="width: 140px" @change="() => load(false)">
          <el-option v-for="opt in rangeOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
        </el-select>
        <el-button :icon="Refresh" @click="() => load(true)">刷新</el-button>
        <el-button type="primary" :icon="Download" @click="handleExport">导出</el-button>
      </template>
    </PageHeader>

    <div v-loading="loading" class="page-analytics-review__content">
      <el-row v-if="data" :gutter="16">
        <el-col :span="6"><MetricCard label="AI 通过率" :value="data.aiPassRate + '%'" tone="success" :hint="`通过 ${data.aiPassed} / 总 ${data.totalRecords}`" /></el-col>
        <el-col :span="6"><MetricCard label="AI 通过" :value="data.aiPassed" tone="primary" /></el-col>
        <el-col :span="6"><MetricCard label="AI 不通过" :value="data.aiRejected" tone="danger" /></el-col>
        <el-col :span="6"><MetricCard label="人工确认" :value="data.humanConfirmed" tone="warning" /></el-col>
      </el-row>

      <el-row v-if="data" :gutter="16" style="margin-top: 16px">
        <el-col :span="6"><MetricCard label="待审核" :value="data.pending" tone="info" /></el-col>
        <el-col :span="6"><MetricCard label="待人工" :value="data.humanPending" tone="warning" /></el-col>
        <el-col :span="12">
          <el-card shadow="never" class="chart-card">
            <template #header><span>裁决分布</span></template>
            <EChart :option="verdictOption" height="280px" />
          </el-card>
        </el-col>
      </el-row>

      <el-row v-if="data" :gutter="16" style="margin-top: 16px">
        <el-col :span="24">
          <el-card shadow="never" class="chart-card">
            <template #header><span>审核记录趋势</span></template>
            <EChart :option="trendOption" height="280px" />
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<style scoped lang="scss">
.page-analytics-review {
  &__content { padding: $spacing-md; }
}

.chart-card {
  border: 1px solid $border-base;
  border-radius: $radius-md;

  :deep(.el-card__header) {
    font-size: $font-size-sm;
    font-weight: 600;
  }
}
</style>