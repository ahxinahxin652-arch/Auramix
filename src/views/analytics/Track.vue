<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Download } from '@element-plus/icons-vue'
import PageHeader from '@/components/PageHeader.vue'
import EChart from '@/components/charts/EChart.vue'
import RankList from '@/components/charts/RankList.vue'
import { buildExportUrl, getTracks, type TrackAnalytics } from '@/api/admin/analytics'

const range = ref<string>('7d')
const loading = ref(false)
const data = ref<TrackAnalytics | null>(null)

const rangeOptions = [
  { label: '近 7 天', value: '7d' },
  { label: '近 30 天', value: '30d' },
  { label: '全部', value: 'all' },
]

async function load(force = false) {
  loading.value = true
  try {
    data.value = await getTracks(range.value, 'play', force)
  } catch (err) {
    console.error('加载歌曲分析失败', err)
    ElMessage.error('加载歌曲分析失败')
  } finally {
    loading.value = false
  }
}

const statusOption = computed(() => ({
  tooltip: { trigger: 'item' },
  legend: { bottom: 0 },
  series: [{
    name: '歌曲状态',
    type: 'pie',
    radius: ['40%', '70%'],
    data: (data.value?.statusDist ?? []).map(d => ({ name: d.date, value: d.value })),
  }],
}))

const newTracksOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  grid: { left: 40, right: 20, top: 30, bottom: 30 },
  xAxis: { type: 'category', data: data.value?.newTracksTrend.map(p => p.date) ?? [] },
  yAxis: { type: 'value' },
  series: [{ name: '新增歌曲', type: 'bar', itemStyle: { color: '#409eff' }, data: data.value?.newTracksTrend.map(p => p.value) ?? [] }],
}))

const topByPlayItems = computed(() =>
  (data.value?.topByPlay ?? []).map(t => ({
    label: t.title,
    sub: `${t.artists || '未知'} · ${t.albumTitle || '未分类'}`,
    value: t.value,
  })),
)

const topByLikeItems = computed(() =>
  (data.value?.topByLike ?? []).map(t => ({
    label: t.title,
    sub: `${t.artists || '未知'} · ${t.albumTitle || '未分类'}`,
    value: t.value,
  })),
)

function handleExport() {
  window.open(buildExportUrl('tracks', range.value), '_blank')
}

onMounted(() => load(false))
</script>

<template>
  <div class="page-analytics-track">
    <PageHeader title="歌曲分析" subtitle="歌曲状态分布、新增趋势、播放榜与收藏榜">
      <template #actions>
        <el-select v-model="range" style="width: 140px" @change="() => load(false)">
          <el-option v-for="opt in rangeOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
        </el-select>
        <el-button :icon="Refresh" @click="() => load(true)">刷新</el-button>
        <el-button type="primary" :icon="Download" @click="handleExport">导出</el-button>
      </template>
    </PageHeader>

    <div v-loading="loading" class="page-analytics-track__content">
      <el-row v-if="data" :gutter="16">
        <el-col :span="12">
          <el-card shadow="never" class="chart-card">
            <template #header><span>歌曲状态分布</span></template>
            <EChart :option="statusOption" height="320px" />
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card shadow="never" class="chart-card">
            <template #header><span>新增歌曲趋势</span></template>
            <EChart :option="newTracksOption" height="320px" />
          </el-card>
        </el-col>
      </el-row>

      <el-row v-if="data" :gutter="16" style="margin-top: 16px">
        <el-col :span="12">
          <el-card shadow="never" class="chart-card">
            <template #header><span>TOP 播放榜 (周期内)</span></template>
            <RankList :items="topByPlayItems" empty-text="暂无播放数据" />
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card shadow="never" class="chart-card">
            <template #header><span>TOP 收藏榜</span></template>
            <RankList :items="topByLikeItems" empty-text="暂无收藏数据" />
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<style scoped lang="scss">
.page-analytics-track {
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