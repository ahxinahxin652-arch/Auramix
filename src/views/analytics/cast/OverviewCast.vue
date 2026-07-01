<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import CastLayout from './CastLayout.vue'
import NeonCard from './components/NeonCard.vue'
import NeonNumber from './components/NeonNumber.vue'
import EChart from '@/components/charts/EChart.vue'
import {
  getOverview,
  getReviews,
  getMembers,
  getTracks,
  type OverviewAnalytics,
  type ReviewAnalytics,
  type MemberAnalytics,
  type TrackAnalytics,
} from '@/api/admin/analytics'

const overview = ref<OverviewAnalytics | null>(null)
const reviews = ref<ReviewAnalytics | null>(null)
const members = ref<MemberAnalytics | null>(null)
const tracks = ref<TrackAnalytics | null>(null)
const range = ref<string>('7d')
let refreshTimer: ReturnType<typeof setInterval> | null = null

async function load(force = false) {
  try {
    const [o, r, m, t] = await Promise.all([
      getOverview(range.value, force),
      getReviews(range.value, force),
      getMembers(range.value, force),
      getTracks(range.value, 'play', force),
    ])
    overview.value = o
    reviews.value = r
    members.value = m
    tracks.value = t
  } catch (err) {
    console.error('加载大屏数据失败', err)
  }
}

function startAutoRefresh() {
  stopAutoRefresh()
  refreshTimer = setInterval(() => load(true), 60_000)
}

function stopAutoRefresh() {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
}

// ====== 主题色 ======
const BLUE = '#38bdf8'
const CYAN = '#22d3ee'
const GREEN = '#4ade80'
const PURPLE = '#a78bfa'
const YELLOW = '#fbbf24'
const RED = '#f87171'

const tooltipBase = {
  backgroundColor: 'rgba(2, 6, 23, 0.92)',
  borderColor: BLUE,
  textStyle: { color: '#e0f2fe' },
}
const axisStyle = {
  axisLine: { lineStyle: { color: 'rgba(56, 189, 248, 0.3)' } },
  axisLabel: { color: 'rgba(186, 230, 253, 0.7)', fontSize: 11 },
  splitLine: { lineStyle: { color: 'rgba(56, 189, 248, 0.1)' } },
}

// ====== 1. 播放趋势（折线） ======
const playsOption = computed(() => ({
  tooltip: { trigger: 'axis', ...tooltipBase },
  grid: { left: 40, right: 20, top: 30, bottom: 30 },
  xAxis: {
    type: 'category',
    data: overview.value?.playsTrend.map(p => p.date.slice(5)) ?? [],
    ...axisStyle,
  },
  yAxis: { type: 'value', ...axisStyle },
  series: [{
    name: '播放数',
    type: 'line',
    smooth: true,
    symbol: 'circle',
    symbolSize: 6,
    itemStyle: { color: BLUE },
    lineStyle: { color: BLUE, width: 2.5, shadowColor: BLUE, shadowBlur: 10 },
    areaStyle: {
      color: {
        type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
        colorStops: [
          { offset: 0, color: 'rgba(56, 189, 248, 0.5)' },
          { offset: 1, color: 'rgba(56, 189, 248, 0)' },
        ],
      },
    },
    data: overview.value?.playsTrend.map(p => p.value) ?? [],
  }],
}))

// ====== 2. 审核裁决（环形 + 中心数字） ======
const reviewOption = computed(() => {
  const items = reviews.value?.verdictDist ?? []
  return {
    tooltip: { trigger: 'item', ...tooltipBase },
    series: [
      {
        name: '审核',
        type: 'pie',
        radius: ['55%', '75%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: { borderColor: 'rgba(2, 6, 23, 0.8)', borderWidth: 2 },
        label: { show: false },
        labelLine: { show: false },
        data: items.map(d => ({
          name: d.label,
          value: d.count,
          itemStyle: {
            color: d.verdict === 1 ? GREEN
                 : d.verdict === -1 ? RED
                 : d.verdict === 0 ? YELLOW
                 : PURPLE,
          },
        })),
      },
    ],
    graphic: [
      {
        type: 'text',
        left: 'center',
        top: '42%',
        style: {
          text: `${reviews.value?.aiPassRate ?? 0}`,
          fill: GREEN,
          fontSize: 38,
          fontWeight: 700,
          fontFamily: 'Consolas, monospace',
          textShadowColor: GREEN,
          textShadowBlur: 12,
        },
      },
      {
        type: 'text',
        left: 'center',
        top: '60%',
        style: {
          text: 'AI 通过率 %',
          fill: 'rgba(186, 230, 253, 0.7)',
          fontSize: 12,
        },
      },
    ],
  }
})

// ====== 3. 内容库分布（环形） ======
const catalogOption = computed(() => {
  const items = [
    { name: '专辑', value: overview.value?.totalAlbums ?? 0, color: PURPLE },
    { name: '歌曲', value: overview.value?.totalTracks ?? 0, color: BLUE },
    { name: '歌手', value: overview.value?.totalArtists ?? 0, color: CYAN },
  ]
  return {
    tooltip: { trigger: 'item', ...tooltipBase },
    legend: {
      bottom: 0,
      textStyle: { color: 'rgba(186, 230, 253, 0.85)', fontSize: 12 },
      itemWidth: 12, itemHeight: 12,
    },
    series: [{
      name: '内容库',
      type: 'pie',
      radius: ['45%', '70%'],
      center: ['50%', '45%'],
      avoidLabelOverlap: false,
      itemStyle: { borderColor: 'rgba(2, 6, 23, 0.8)', borderWidth: 2 },
      label: { color: '#e0f2fe', fontSize: 12, formatter: '{b}\n{c}' },
      labelLine: { lineStyle: { color: 'rgba(186, 230, 253, 0.5)' } },
      data: items.map(i => ({ name: i.name, value: i.value, itemStyle: { color: i.color } })),
    }],
  }
})

// ====== 4. 新增用户趋势（柱状） ======
const newUsersOption = computed(() => ({
  tooltip: { trigger: 'axis', ...tooltipBase, borderColor: GREEN },
  grid: { left: 40, right: 20, top: 30, bottom: 30 },
  xAxis: {
    type: 'category',
    data: overview.value?.newUsersTrend.map(p => p.date.slice(5)) ?? [],
    ...axisStyle,
    axisLine: { lineStyle: { color: 'rgba(74, 222, 128, 0.3)' } },
  },
  yAxis: { type: 'value', ...axisStyle, splitLine: { lineStyle: { color: 'rgba(74, 222, 128, 0.1)' } } },
  series: [{
    name: '新增用户',
    type: 'bar',
    barWidth: 14,
    itemStyle: {
      color: {
        type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
        colorStops: [
          { offset: 0, color: GREEN },
          { offset: 1, color: 'rgba(34, 197, 94, 0.2)' },
        ],
      },
      borderRadius: [4, 4, 0, 0],
    },
    data: overview.value?.newUsersTrend.map(p => p.value) ?? [],
  }],
}))

// ====== 5. 营收趋势（折线 + 面积） ======
const revenueOption = computed(() => ({
  tooltip: { trigger: 'axis', ...tooltipBase, borderColor: YELLOW },
  grid: { left: 50, right: 20, top: 30, bottom: 30 },
  xAxis: {
    type: 'category',
    data: members.value?.revenueTrend.map(p => p.date.slice(5)) ?? [],
    ...axisStyle,
    axisLine: { lineStyle: { color: 'rgba(251, 191, 36, 0.3)' } },
  },
  yAxis: {
    type: 'value',
    ...axisStyle,
    axisLabel: {
      color: 'rgba(186, 230, 253, 0.7)', fontSize: 11,
      formatter: (v: number) => `¥${v}`,
    },
    splitLine: { lineStyle: { color: 'rgba(251, 191, 36, 0.1)' } },
  },
  series: [{
    name: '营收',
    type: 'line',
    smooth: true,
    symbol: 'circle',
    symbolSize: 5,
    itemStyle: { color: YELLOW },
    lineStyle: { color: YELLOW, width: 2.5, shadowColor: YELLOW, shadowBlur: 8 },
    areaStyle: {
      color: {
        type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
        colorStops: [
          { offset: 0, color: 'rgba(251, 191, 36, 0.4)' },
          { offset: 1, color: 'rgba(251, 191, 36, 0)' },
        ],
      },
    },
    data: members.value?.revenueTrend.map(p => p.amount) ?? [],
  }],
}))

// ====== 6. TOP 歌曲 / TOP 歌手 列表 ======
const topTracks = computed(() => (tracks.value?.topByPlay ?? []).slice(0, 8))
const topArtists = computed(() => {
  // tracks topByPlay 中 artists 字段是字符串, 简单做一下拆分
  return (tracks.value?.topByPlay ?? []).slice(0, 8).map(t => ({
    title: t.artists || '未知',
    sub: t.title,
    value: t.value,
  }))
})

// ====== 7. 活跃 vs 播放 双轴对比 ======
const dualAxisOption = computed(() => ({
  tooltip: { trigger: 'axis', ...tooltipBase },
  legend: {
    data: ['播放数', '新增用户'],
    textStyle: { color: 'rgba(186, 230, 253, 0.85)', fontSize: 11 },
    top: 0, right: 10,
  },
  grid: { left: 50, right: 50, top: 40, bottom: 30 },
  xAxis: {
    type: 'category',
    data: overview.value?.playsTrend.map(p => p.date.slice(5)) ?? [],
    ...axisStyle,
  },
  yAxis: [
    { type: 'value', name: '播放', ...axisStyle, nameTextStyle: { color: BLUE } },
    { type: 'value', name: '新增', ...axisStyle, nameTextStyle: { color: GREEN } },
  ],
  series: [
    {
      name: '播放数', type: 'line', smooth: true, yAxisIndex: 0,
      itemStyle: { color: BLUE },
      lineStyle: { color: BLUE, width: 2 },
      data: overview.value?.playsTrend.map(p => p.value) ?? [],
    },
    {
      name: '新增用户', type: 'bar', yAxisIndex: 1, barWidth: 10,
      itemStyle: { color: GREEN, borderRadius: [3, 3, 0, 0] },
      data: overview.value?.newUsersTrend.map(p => p.value) ?? [],
    },
  ],
}))

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
    <!-- 第 1 行：6 大 KPI -->
    <div class="kpi-row">
      <NeonCard title="总用户" corner="TOTAL USERS" :dot="true" padding="md">
        <NeonNumber :value="overview?.totalUsers ?? 0" :size="42" color="#38bdf8" label="平台累计" />
      </NeonCard>
      <NeonCard title="活跃用户" corner="ACTIVE" :dot="true" padding="md">
        <NeonNumber :value="overview?.activeUsers ?? 0" :size="42" color="#22d3ee" label="周期活跃" />
      </NeonCard>
      <NeonCard title="新增用户" corner="NEW" :dot="true" padding="md">
        <NeonNumber :value="overview?.newUsers ?? 0" :size="42" color="#4ade80" label="周期新增" />
      </NeonCard>
      <NeonCard title="总播放" corner="PLAYS" :dot="true" padding="md">
        <NeonNumber :value="overview?.totalPlays ?? 0" :size="42" color="#a78bfa" label="周期播放" />
      </NeonCard>
      <NeonCard title="活跃会员" corner="VIP" :dot="true" padding="md">
        <NeonNumber :value="members?.activeMembers ?? 0" :size="42" color="#fbbf24" label="有效会员" />
      </NeonCard>
      <NeonCard title="AI 通过率" corner="AI REVIEW" :dot="true" padding="md">
        <NeonNumber
          :value="reviews?.aiPassRate ?? 0"
          :size="42" color="#4ade80" label="通过率 %"
        />
      </NeonCard>
    </div>

    <!-- 第 2 行：3 列（播放趋势 / 审核 / 内容库） -->
    <div class="row-3">
      <NeonCard title="播放趋势" corner="PLAYS TREND" :dot="true" padding="md">
        <EChart :option="playsOption" height="240px" />
      </NeonCard>
      <NeonCard title="AI 审核" corner="REVIEW" :dot="true" padding="md">
        <EChart :option="reviewOption" height="240px" />
      </NeonCard>
      <NeonCard title="内容库" corner="CATALOG" :dot="true" padding="md">
        <EChart :option="catalogOption" height="240px" />
      </NeonCard>
    </div>

    <!-- 第 3 行：3 列（新增用户 / 营收 / 双轴对比） -->
    <div class="row-3">
      <NeonCard title="新增用户" corner="NEW USERS" :dot="true" padding="md">
        <EChart :option="newUsersOption" height="220px" />
      </NeonCard>
      <NeonCard title="营收趋势" corner="REVENUE" :dot="true" padding="md">
        <EChart :option="revenueOption" height="220px" />
      </NeonCard>
      <NeonCard title="播放 vs 新增" corner="DUAL AXIS" :dot="true" padding="md">
        <EChart :option="dualAxisOption" height="220px" />
      </NeonCard>
    </div>

    <!-- 第 4 行：2 列（TOP 歌曲 / TOP 歌手） -->
    <div class="row-2">
      <NeonCard title="TOP 歌曲（周期内）" corner="TOP TRACKS" :dot="true" padding="md">
        <ul class="rank-list">
          <li v-for="(t, idx) in topTracks" :key="idx">
            <span class="rank-num" :class="{ 'is-top': idx < 3 }">{{ idx + 1 }}</span>
            <div class="rank-body">
              <div class="rank-title">{{ t.title }}</div>
              <div class="rank-sub">{{ t.artists || '未知歌手' }} · {{ t.albumTitle || '未分类' }}</div>
            </div>
            <span class="rank-value">{{ t.value }} 次</span>
          </li>
          <li v-if="topTracks.length === 0" class="rank-empty">暂无数据</li>
        </ul>
      </NeonCard>
      <NeonCard title="TOP 歌手" corner="TOP ARTISTS" :dot="true" padding="md">
        <ul class="rank-list">
          <li v-for="(a, idx) in topArtists" :key="idx">
            <span class="rank-num" :class="{ 'is-top': idx < 3 }">{{ idx + 1 }}</span>
            <div class="rank-body">
              <div class="rank-title">{{ a.title }}</div>
              <div class="rank-sub">{{ a.sub }}</div>
            </div>
            <span class="rank-value">{{ a.value }} 次</span>
          </li>
          <li v-if="topArtists.length === 0" class="rank-empty">暂无数据</li>
        </ul>
      </NeonCard>
    </div>
  </CastLayout>
</template>

<style scoped lang="scss">
.kpi-row {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 14px;
  margin-bottom: 14px;
}

.row-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  margin-bottom: 14px;
}

.row-2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
  margin-bottom: 14px;
}

.rank-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 360px;
  overflow-y: auto;

  li {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 6px 8px;
    border-radius: 3px;
    transition: background-color 0.15s;

    &:hover {
      background: rgba(56, 189, 248, 0.08);
    }
  }

  .rank-num {
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    border-radius: 3px;
    background: rgba(56, 189, 248, 0.15);
    color: rgba(186, 230, 253, 0.7);
    font-size: 12px;
    font-weight: 700;
    font-family: 'Consolas', monospace;
    display: inline-flex;
    align-items: center;
    justify-content: center;

    &.is-top {
      background: linear-gradient(135deg, #38bdf8, #0284c7);
      color: #fff;
      box-shadow: 0 0 8px rgba(56, 189, 248, 0.5);
    }
  }

  .rank-body {
    flex: 1;
    min-width: 0;
  }

  .rank-title {
    font-size: 13px;
    color: #e0f2fe;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .rank-sub {
    font-size: 11px;
    color: rgba(125, 211, 252, 0.6);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .rank-value {
    flex-shrink: 0;
    font-size: 13px;
    font-weight: 700;
    color: #38bdf8;
    font-family: 'Consolas', monospace;
  }

  .rank-empty {
    color: rgba(125, 211, 252, 0.5);
    text-align: center;
    padding: 30px 0;
    justify-content: center;
    font-size: 12px;
  }
}
</style>