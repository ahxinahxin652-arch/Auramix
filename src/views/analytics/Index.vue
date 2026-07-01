<script setup lang="ts">
import { onMounted, ref, computed, defineAsyncComponent } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Download, Histogram, FullScreen, DataLine, User, Headset, Collection, CircleCheck, GoldMedal } from '@element-plus/icons-vue'
import PageHeader from '@/components/PageHeader.vue'
import EChart from '@/components/charts/EChart.vue'
import MetricCard from '@/components/charts/MetricCard.vue'
import { getOverview, buildExportUrl, type OverviewAnalytics } from '@/api/admin/analytics'

// ============= 6 个 Tab 的子页面 (异步加载) =============
// 总览 Tab 直接渲染本页, 不再异步 import 自己 (避免循环引用)
const CastUserPane = defineAsyncComponent(() => import('./User.vue'))
const CastTrackPane = defineAsyncComponent(() => import('./Track.vue'))
const CastCatalogPane = defineAsyncComponent(() => import('./Catalog.vue'))
const CastReviewPane = defineAsyncComponent(() => import('./Review.vue'))
const CastMemberPane = defineAsyncComponent(() => import('./Member.vue'))

// ============= Tab 配置 =============
const activeTab = ref<string>('overview')
const STORAGE_KEY = 'analytics-active-tab'

interface TabItem {
  name: string
  label: string
  icon: unknown
  component: ReturnType<typeof defineAsyncComponent> | null
}

const tabs: TabItem[] = [
  { name: 'overview', label: '总览',     icon: DataLine,    component: null },
  { name: 'user',     label: '用户',     icon: User,        component: CastUserPane },
  { name: 'track',    label: '歌曲',     icon: Headset,     component: CastTrackPane },
  { name: 'catalog',  label: '歌手/专辑', icon: Collection,  component: CastCatalogPane },
  { name: 'review',   label: '审核',     icon: CircleCheck, component: CastReviewPane },
  { name: 'member',   label: '会员',     icon: GoldMedal,   component: CastMemberPane },
]

// 从 localStorage 恢复上次 Tab
try {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved && tabs.some(t => t.name === saved)) {
    activeTab.value = saved
  }
} catch {
  // ignore
}

function handleTabChange(name: string | number | undefined) {
  if (typeof name === 'string') {
    try {
      localStorage.setItem(STORAGE_KEY, name)
    } catch {
      // ignore
    }
  }
}

// ============= 总览页自身 (Overview Tab 顶部) =============
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
  <div class="page-analytics-shell">
    <PageHeader title="数据分析" subtitle="Auramix 全平台核心指标实时概览">
      <template #actions>
        <el-button :icon="Refresh" @click="load(true)">刷新</el-button>
        <el-button type="primary" :icon="Download" @click="handleExport">导出</el-button>
        <el-button type="warning" :icon="FullScreen" @click="handleCast">投屏大屏</el-button>
      </template>
    </PageHeader>

    <!-- 6 Tab 切换器 -->
    <div class="tab-bar">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane
          v-for="t in tabs"
          :key="t.name"
          :name="t.name"
        >
          <template #label>
            <span class="tab-label">
              <el-icon><component :is="t.icon" /></el-icon>
              {{ t.label }}
            </span>
          </template>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 总览 Tab: 原有内容 -->
    <div v-show="activeTab === 'overview'" class="tab-content" v-loading="loading">
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

    <!-- 其他 5 Tab: 子页面组件 -->
    <div v-show="activeTab !== 'overview'" class="tab-content">
      <component
        :is="tabs.find(t => t.name === activeTab)?.component"
        v-if="tabs.find(t => t.name === activeTab)?.component"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.page-analytics-shell {
  &__content { padding: $spacing-md; }
}

.tab-bar {
  padding: 0 $spacing-md;
  background: $bg-surface;
  border-bottom: 1px solid $border-base;
  margin-bottom: 0;

  :deep(.el-tabs__header) {
    margin-bottom: 0;
  }

  :deep(.el-tabs__nav-wrap::after) {
    background: transparent;
  }

  :deep(.el-tabs__item) {
    font-size: $font-size-sm;
    height: 44px;
    line-height: 44px;
  }

  :deep(.el-tabs__item.is-active) {
    color: $primary-color;
    font-weight: 600;
  }
}

.tab-label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.tab-content {
  padding: $spacing-md;

  // 嵌入的子页面不再显示它们自己的 PageHeader
  // (总览页已经有了 PageHeader + Tab 切换器, 重复的 header 会很丑)
  :deep(.page-header) {
    display: none;
  }

  // 嵌入的子页面也去掉自己的 padding (总览页 tab-content 已经给了)
  :deep(.page-analytics-user),
  :deep(.page-analytics-track),
  :deep(.page-analytics-catalog),
  :deep(.page-analytics-review),
  :deep(.page-analytics-member) {
    > .page-header {
      display: none;
    }

    > [class*="__content"] {
      padding: 0;
    }
  }
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