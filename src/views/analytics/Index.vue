<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Download, Histogram, FullScreen } from '@element-plus/icons-vue'
import PageHeader from '@/components/PageHeader.vue'
import EChart from '@/components/charts/EChart.vue'
import MetricCard from '@/components/charts/MetricCard.vue'
import { getOverview, buildExportUrl, type OverviewAnalytics } from '@/api/admin/analytics'

const range = ref<string>('7d')
const loading = ref(false)
const data = ref<OverviewAnalytics | null>(null)

const rangeOptions = [
  { label: '近 7 天', value: '7d' },
  { label: '近 30 天', value: '30d' },
  { label: '全部', value: 'all' },
]

async function load(force = false) {
  loading.value = true
  try {
    data.value = await getOverview(range.value, force)
  } catch (err) {
    console.error('加载总览数据失败', err)
    ElMessage.error('加载总览数据失败')
  } finally {
    loading.value = false
  }
}

const playsOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  grid: { left: 40, right: 20, top: 30, bottom: 30 },
  xAxis: { type: 'category', data: data.value?.playsTrend.map(p => p.date) ?? [] },
  yAxis: { type: 'value' },
  series: [{
    name: '播放数',
    type: 'line',
    smooth: true,
    areaStyle: { opacity: 0.2 },
    data: data.value?.playsTrend.map(p => p.value) ?? [],
  }],
}))

const newUsersOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  grid: { left: 40, right: 20, top: 30, bottom: 30 },
  xAxis: { type: 'category', data: data.value?.newUsersTrend.map(p => p.date) ?? [] },
  yAxis: { type: 'value' },
  series: [{
    name: '新增用户',
    type: 'bar',
    itemStyle: { color: '#67c23a' },
    data: data.value?.newUsersTrend.map(p => p.value) ?? [],
  }],
}))

function handleExport() {
  const url = buildExportUrl('overview', range.value)
  window.open(url, '_blank')
}

function handleCast() {
  window.open('/cast/overview', '_blank')
}

onMounted(() => load(false))
</script>

<template>
  <div class="page-analytics-overview">
    <PageHeader title="数据看板" subtitle="Auramix 全平台核心指标实时概览">
      <template #actions>
        <el-select v-model="range" style="width: 140px" @change="() => load(false)">
          <el-option v-for="opt in rangeOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
        </el-select>
        <el-button :icon="Refresh" @click="() => load(true)">刷新</el-button>
        <el-button type="primary" :icon="Download" @click="handleExport">导出</el-button>
        <el-button type="warning" :icon="FullScreen" @click="handleCast">投屏大屏</el-button>
      </template>
    </PageHeader>

    <div v-loading="loading" class="page-analytics-overview__content">
      <el-row v-if="data" :gutter="16">
        <el-col :span="6">
          <MetricCard label="总用户数" :value="data.totalUsers" tone="primary" hint="平台累计注册用户" />
        </el-col>
        <el-col :span="6">
          <MetricCard label="周期活跃用户" :value="data.activeUsers" tone="success" hint="周期内有播放记录" />
        </el-col>
        <el-col :span="6">
          <MetricCard label="周期新增用户" :value="data.newUsers" tone="info" hint="周期内注册" />
        </el-col>
        <el-col :span="6">
          <MetricCard label="周期总播放" :value="data.totalPlays" tone="warning" hint="所有歌曲播放次数之和" />
        </el-col>

        <el-col :span="6" style="margin-top: 16px">
          <MetricCard label="歌曲总数" :value="data.totalTracks" tone="primary" />
        </el-col>
        <el-col :span="6" style="margin-top: 16px">
          <MetricCard label="专辑总数" :value="data.totalAlbums" tone="primary" />
        </el-col>
        <el-col :span="6" style="margin-top: 16px">
          <MetricCard label="歌手总数" :value="data.totalArtists" tone="primary" />
        </el-col>
        <el-col :span="6" style="margin-top: 16px">
          <MetricCard label="周期新增歌曲" :value="data.newTracks" tone="success" />
        </el-col>
      </el-row>

      <el-row v-if="data" :gutter="16" style="margin-top: 16px">
        <el-col :span="12">
          <el-card shadow="never" class="chart-card">
            <template #header>
              <div class="chart-card__header">
                <span><el-icon><Histogram /></el-icon> 播放趋势</span>
                <span class="text-hint">按日聚合</span>
              </div>
            </template>
            <EChart :option="playsOption" height="280px" />
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card shadow="never" class="chart-card">
            <template #header>
              <div class="chart-card__header">
                <span>新增用户趋势</span>
                <span class="text-hint">按日聚合</span>
              </div>
            </template>
            <EChart :option="newUsersOption" height="280px" />
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<style scoped lang="scss">
.page-analytics-overview {
  &__content { padding: $spacing-md; }
}

.chart-card {
  border: 1px solid $border-base;
  border-radius: $radius-md;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: $font-size-sm;
    font-weight: 600;
    color: $text-primary;

    .text-hint {
      font-size: $font-size-2xs;
      color: $text-tertiary;
      font-weight: 400;
    }
  }
}
</style>