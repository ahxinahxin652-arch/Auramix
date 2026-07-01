<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import CastLayout from './CastLayout.vue'
import NeonCard from './components/NeonCard.vue'
import NeonNumber from './components/NeonNumber.vue'
import EChart from '@/components/charts/EChart.vue'
import { getOverview, type OverviewAnalytics } from '@/api/admin/analytics'

const data = ref<OverviewAnalytics | null>(null)
const loading = ref(false)
const range = ref<string>('7d')
let refreshTimer: ReturnType<typeof setInterval> | null = null

async function load(force = false) {
  loading.value = true
  try {
    data.value = await getOverview(range.value, force)
  } catch (err) {
    console.error('加载大屏数据失败', err)
  } finally {
    loading.value = false
  }
}

function startAutoRefresh() {
  stopAutoRefresh()
  // 每 60s 拉一次, forceRefresh=true
  refreshTimer = setInterval(() => load(true), 60_000)
}

function stopAutoRefresh() {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
}

// echarts 主题色: 科技蓝
const NEON_BLUE = '#38bdf8'
const NEON_CYAN = '#22d3ee'
const NEON_GREEN = '#4ade80'
const NEON_PURPLE = '#a78bfa'

const playsOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(2, 6, 23, 0.92)',
    borderColor: NEON_BLUE,
    textStyle: { color: '#e0f2fe' },
  },
  grid: { left: 40, right: 20, top: 30, bottom: 30 },
  xAxis: {
    type: 'category',
    data: data.value?.playsTrend.map(p => p.date.slice(5)) ?? [],
    axisLine: { lineStyle: { color: 'rgba(56, 189, 248, 0.3)' } },
    axisLabel: { color: 'rgba(186, 230, 253, 0.7)', fontSize: 11 },
  },
  yAxis: {
    type: 'value',
    axisLine: { lineStyle: { color: 'rgba(56, 189, 248, 0.3)' } },
    axisLabel: { color: 'rgba(186, 230, 253, 0.7)', fontSize: 11 },
    splitLine: { lineStyle: { color: 'rgba(56, 189, 248, 0.1)' } },
  },
  series: [{
    name: '播放数',
    type: 'line',
    smooth: true,
    symbol: 'circle',
    symbolSize: 6,
    itemStyle: { color: NEON_BLUE },
    lineStyle: { color: NEON_BLUE, width: 2.5, shadowColor: NEON_BLUE, shadowBlur: 10 },
    areaStyle: {
      color: {
        type: 'linear',
        x: 0, y: 0, x2: 0, y2: 1,
        colorStops: [
          { offset: 0, color: 'rgba(56, 189, 248, 0.5)' },
          { offset: 1, color: 'rgba(56, 189, 248, 0)' },
        ],
      },
    },
    data: data.value?.playsTrend.map(p => p.value) ?? [],
  }],
}))

const newUsersOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(2, 6, 23, 0.92)',
    borderColor: NEON_GREEN,
    textStyle: { color: '#e0f2fe' },
  },
  grid: { left: 40, right: 20, top: 30, bottom: 30 },
  xAxis: {
    type: 'category',
    data: data.value?.newUsersTrend.map(p => p.date.slice(5)) ?? [],
    axisLine: { lineStyle: { color: 'rgba(74, 222, 128, 0.3)' } },
    axisLabel: { color: 'rgba(186, 230, 253, 0.7)', fontSize: 11 },
  },
  yAxis: {
    type: 'value',
    axisLine: { lineStyle: { color: 'rgba(74, 222, 128, 0.3)' } },
    axisLabel: { color: 'rgba(186, 230, 253, 0.7)', fontSize: 11 },
    splitLine: { lineStyle: { color: 'rgba(74, 222, 128, 0.1)' } },
  },
  series: [{
    name: '新增用户',
    type: 'bar',
    barWidth: 14,
    itemStyle: {
      color: {
        type: 'linear',
        x: 0, y: 0, x2: 0, y2: 1,
        colorStops: [
          { offset: 0, color: NEON_GREEN },
          { offset: 1, color: 'rgba(34, 197, 94, 0.2)' },
        ],
      },
      borderRadius: [4, 4, 0, 0],
    },
    data: data.value?.newUsersTrend.map(p => p.value) ?? [],
  }],
}))

const distributionOption = computed(() => {
  const items = [
    { name: '专辑', value: data.value?.totalAlbums ?? 0, color: NEON_PURPLE },
    { name: '歌曲', value: data.value?.totalTracks ?? 0, color: NEON_BLUE },
    { name: '歌手', value: data.value?.totalArtists ?? 0, color: NEON_CYAN },
  ]
  return {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(2, 6, 23, 0.92)',
      borderColor: NEON_BLUE,
      textStyle: { color: '#e0f2fe' },
    },
    legend: {
      bottom: 0,
      textStyle: { color: 'rgba(186, 230, 253, 0.85)', fontSize: 12 },
      itemWidth: 12,
      itemHeight: 12,
    },
    series: [{
      name: '内容库',
      type: 'pie',
      radius: ['45%', '70%'],
      center: ['50%', '45%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderColor: 'rgba(2, 6, 23, 0.8)',
        borderWidth: 2,
      },
      label: {
        color: '#e0f2fe',
        fontSize: 12,
        formatter: '{b}\n{c}',
      },
      labelLine: { lineStyle: { color: 'rgba(186, 230, 253, 0.5)' } },
      data: items.map(i => ({ name: i.name, value: i.value, itemStyle: { color: i.color } })),
    }],
  }
})

onMounted(() => {
  load(false)
  startAutoRefresh()
})

onUnmounted(() => {
  stopAutoRefresh()
})
</script>

<template>
  <CastLayout>
    <!-- 顶部 4 个核心指标 -->
    <div class="kpi-row">
      <NeonCard title="总用户" corner="TOTAL USERS" :dot="true" padding="lg">
        <NeonNumber
          :value="data?.totalUsers ?? 0"
          :size="60"
          color="#38bdf8"
          label="平台累计"
        />
      </NeonCard>
      <NeonCard title="周期活跃" corner="ACTIVE USERS" :dot="true" padding="lg">
        <NeonNumber
          :value="data?.activeUsers ?? 0"
          :size="60"
          color="#22d3ee"
          label="7 日活跃"
        />
      </NeonCard>
      <NeonCard title="周期新增" corner="NEW USERS" :dot="true" padding="lg">
        <NeonNumber
          :value="data?.newUsers ?? 0"
          :size="60"
          color="#4ade80"
          label="7 日新增"
        />
      </NeonCard>
      <NeonCard title="总播放" corner="TOTAL PLAYS" :dot="true" padding="lg">
        <NeonNumber
          :value="data?.totalPlays ?? 0"
          :size="60"
          color="#a78bfa"
          label="7 日播放"
        />
      </NeonCard>
    </div>

    <!-- 中部 2 个趋势图 -->
    <div class="chart-row">
      <NeonCard title="播放趋势" corner="PLAYS TREND" :dot="true" padding="md">
        <EChart :option="playsOption" height="320px" />
      </NeonCard>
      <NeonCard title="新增用户" corner="NEW USERS TREND" :dot="true" padding="md">
        <EChart :option="newUsersOption" height="320px" />
      </NeonCard>
    </div>

    <!-- 底部 1 个内容库环形 -->
    <div class="chart-row chart-row--bottom">
      <NeonCard title="内容库分布" corner="CATALOG" :dot="true" padding="md">
        <EChart :option="distributionOption" height="280px" />
      </NeonCard>
    </div>
  </CastLayout>
</template>

<style scoped lang="scss">
.kpi-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
  margin-bottom: 18px;
}

.chart-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18px;
  margin-bottom: 18px;

  &--bottom {
    grid-template-columns: 1fr;
  }
}
</style>