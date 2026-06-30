<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Download } from '@element-plus/icons-vue'
import PageHeader from '@/components/PageHeader.vue'
import EChart from '@/components/charts/EChart.vue'
import MetricCard from '@/components/charts/MetricCard.vue'
import RankList from '@/components/charts/RankList.vue'
import { buildExportUrl, getMembers, type MemberAnalytics } from '@/api/admin/analytics'

const range = ref<string>('7d')
const loading = ref(false)
const data = ref<MemberAnalytics | null>(null)

const rangeOptions = [
  { label: '近 7 天', value: '7d' },
  { label: '近 30 天', value: '30d' },
  { label: '全部', value: 'all' },
]

async function load(force = false) {
  loading.value = true
  try {
    data.value = await getMembers(range.value, force)
  } catch (err) {
    console.error('加载会员分析失败', err)
    ElMessage.error('加载会员分析失败')
  } finally {
    loading.value = false
  }
}

function formatMoney(n: number | undefined): string {
  if (n === undefined || n === null) return '¥0.00'
  return `¥${n.toFixed(2)}`
}

const revenueOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  grid: { left: 60, right: 20, top: 30, bottom: 30 },
  xAxis: { type: 'category', data: data.value?.revenueTrend.map(p => p.date) ?? [] },
  yAxis: { type: 'value' },
  series: [{
    name: '每日营收',
    type: 'line',
    smooth: true,
    areaStyle: { opacity: 0.2 },
    itemStyle: { color: '#67c23a' },
    data: data.value?.revenueTrend.map(p => p.amount) ?? [],
  }],
}))

const planSalesItems = computed(() =>
  (data.value?.planSales ?? []).map(p => ({
    label: p.planName,
    sub: `销量 ${p.soldCount}`,
    value: formatMoney(p.revenue),
  })),
)

function handleExport() {
  window.open(buildExportUrl('members', range.value), '_blank')
}

onMounted(() => load(false))
</script>

<template>
  <div class="page-analytics-member">
    <PageHeader title="会员分析" subtitle="套餐销售、营收趋势、ARPU">
      <template #actions>
        <el-select v-model="range" style="width: 140px" @change="() => load(false)">
          <el-option v-for="opt in rangeOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
        </el-select>
        <el-button :icon="Refresh" @click="() => load(true)">刷新</el-button>
        <el-button type="primary" :icon="Download" @click="handleExport">导出</el-button>
      </template>
    </PageHeader>

    <div v-loading="loading" class="page-analytics-member__content">
      <el-row v-if="data" :gutter="16">
        <el-col :span="8">
          <MetricCard label="周期总营收" :value="formatMoney(data.totalRevenue)" tone="success" />
        </el-col>
        <el-col :span="8">
          <MetricCard label="ARPU (人均营收)" :value="formatMoney(data.arpu)" tone="warning" hint="营收 / 付费用户" />
        </el-col>
        <el-col :span="8">
          <MetricCard label="活跃会员数" :value="data.activeMembers" tone="primary" />
        </el-col>
      </el-row>

      <el-row v-if="data" :gutter="16" style="margin-top: 16px">
        <el-col :span="16">
          <el-card shadow="never" class="chart-card">
            <template #header><span>每日营收趋势</span></template>
            <EChart :option="revenueOption" height="320px" />
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card shadow="never" class="chart-card">
            <template #header><span>套餐销售排行</span></template>
            <RankList :items="planSalesItems" empty-text="暂无销售数据" />
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<style scoped lang="scss">
.page-analytics-member {
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