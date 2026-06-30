<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Download } from '@element-plus/icons-vue'
import PageHeader from '@/components/PageHeader.vue'
import EChart from '@/components/charts/EChart.vue'
import MetricCard from '@/components/charts/MetricCard.vue'
import RankList from '@/components/charts/RankList.vue'
import { buildExportUrl, getUsers, type UserAnalytics } from '@/api/admin/analytics'

const range = ref<string>('7d')
const loading = ref(false)
const data = ref<UserAnalytics | null>(null)

const rangeOptions = [
  { label: '近 7 天', value: '7d' },
  { label: '近 30 天', value: '30d' },
  { label: '全部', value: 'all' },
]

async function load(force = false) {
  loading.value = true
  try {
    data.value = await getUsers(range.value, force)
  } catch (err) {
    console.error('加载用户分析失败', err)
    ElMessage.error('加载用户分析失败')
  } finally {
    loading.value = false
  }
}

const newUsersOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  grid: { left: 40, right: 20, top: 30, bottom: 30 },
  xAxis: { type: 'category', data: data.value?.newUsersTrend.map(p => p.date) ?? [] },
  yAxis: { type: 'value' },
  series: [{ name: '新增用户', type: 'line', smooth: true, data: data.value?.newUsersTrend.map(p => p.value) ?? [] }],
}))

const countryOption = computed(() => {
  const top10 = (data.value?.countryDist ?? []).slice(0, 10)
  return {
    tooltip: { trigger: 'item' },
    legend: { bottom: 0, type: 'scroll' },
    series: [{
      name: '国家',
      type: 'pie',
      radius: ['40%', '70%'],
      data: top10.map(d => ({ name: d.label, value: d.count })),
    }],
  }
})

const productOption = computed(() => ({
  tooltip: { trigger: 'item' },
  legend: { bottom: 0 },
  series: [{
    name: '产品',
    type: 'pie',
    radius: '60%',
    data: (data.value?.productDist ?? []).map(d => ({ name: d.label, value: d.count })),
  }],
}))

const countryItems = computed(() =>
  (data.value?.countryDist ?? []).slice(0, 10).map(d => ({ label: d.label, value: d.count })),
)

function handleExport() {
  window.open(buildExportUrl('users', range.value), '_blank')
}

onMounted(() => load(false))
</script>

<template>
  <div class="page-analytics-user">
    <PageHeader title="用户分析" subtitle="注册用户、活跃、付费比例与分布">
      <template #actions>
        <el-select v-model="range" style="width: 140px" @change="() => load(false)">
          <el-option v-for="opt in rangeOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
        </el-select>
        <el-button :icon="Refresh" @click="() => load(true)">刷新</el-button>
        <el-button type="primary" :icon="Download" @click="handleExport">导出</el-button>
      </template>
    </PageHeader>

    <div v-loading="loading" class="page-analytics-user__content">
      <el-row v-if="data" :gutter="16">
        <el-col :span="6"><MetricCard label="总用户" :value="data.totalUsers" tone="primary" /></el-col>
        <el-col :span="6"><MetricCard label="周期新增" :value="data.newUsers" tone="success" /></el-col>
        <el-col :span="6"><MetricCard label="周期活跃" :value="data.activeUsers" tone="warning" /></el-col>
        <el-col :span="6"><MetricCard label="付费比例" :value="data.payingRatio + '%'" tone="danger" :hint="`付费用户 ${data.payingUsers}`" /></el-col>
      </el-row>

      <el-row v-if="data" :gutter="16" style="margin-top: 16px">
        <el-col :span="24">
          <el-card shadow="never" class="chart-card">
            <template #header><span>新增用户趋势</span></template>
            <EChart :option="newUsersOption" height="260px" />
          </el-card>
        </el-col>
      </el-row>

      <el-row v-if="data" :gutter="16" style="margin-top: 16px">
        <el-col :span="12">
          <el-card shadow="never" class="chart-card">
            <template #header><span>国家分布 (TOP10)</span></template>
            <EChart :option="countryOption" height="320px" />
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card shadow="never" class="chart-card">
            <template #header><span>产品渠道分布</span></template>
            <EChart :option="productOption" height="320px" />
          </el-card>
        </el-col>
      </el-row>

      <el-row v-if="data" :gutter="16" style="margin-top: 16px">
        <el-col :span="12">
          <el-card shadow="never" class="chart-card">
            <template #header><span>国家排行 (TOP10)</span></template>
            <RankList :items="countryItems" empty-text="暂无国家数据" />
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<style scoped lang="scss">
.page-analytics-user {
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