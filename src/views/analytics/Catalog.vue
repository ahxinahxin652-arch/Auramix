<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Download } from '@element-plus/icons-vue'
import PageHeader from '@/components/PageHeader.vue'
import EChart from '@/components/charts/EChart.vue'
import MetricCard from '@/components/charts/MetricCard.vue'
import RankList from '@/components/charts/RankList.vue'
import { buildExportUrl, getCatalog, type CatalogAnalytics } from '@/api/admin/analytics'

const range = ref<string>('7d')
const type = ref<'artist' | 'album'>('artist')
const loading = ref(false)
const data = ref<CatalogAnalytics | null>(null)

const rangeOptions = [
  { label: '近 7 天', value: '7d' },
  { label: '近 30 天', value: '30d' },
  { label: '全部', value: 'all' },
]

async function load(force = false) {
  loading.value = true
  try {
    data.value = await getCatalog(type.value, range.value, force)
  } catch (err) {
    console.error('加载歌手/专辑分析失败', err)
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
}

const newTrendOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  grid: { left: 40, right: 20, top: 30, bottom: 30 },
  xAxis: { type: 'category', data: data.value?.newTrend.map(p => p.date) ?? [] },
  yAxis: { type: 'value' },
  series: [{
    name: type.value === 'artist' ? '新增歌手' : '新增专辑',
    type: 'line', smooth: true,
    data: data.value?.newTrend.map(p => p.value) ?? [],
  }],
}))

const hotItems = computed(() =>
  (data.value?.hotRank ?? []).map(t => ({
    label: t.name,
    sub: t.coverUrl ? '已上传封面' : '无封面',
    value: t.value,
  })),
)

const followItems = computed(() =>
  (data.value?.followRank ?? []).map(t => ({
    label: t.name,
    sub: t.coverUrl ? '已上传头像' : '无头像',
    value: t.value,
  })),
)

function handleExport() {
  window.open(buildExportUrl('catalog', range.value), '_blank')
}

onMounted(() => load(false))
</script>

<template>
  <div class="page-analytics-catalog">
    <PageHeader :title="type === 'artist' ? '歌手分析' : '专辑分析'" :subtitle="type === 'artist' ? '歌手热度、关注趋势与新增' : '专辑热度与新增趋势'">
      <template #actions>
        <el-radio-group v-model="type" @change="() => load(false)">
          <el-radio-button label="artist">歌手</el-radio-button>
          <el-radio-button label="album">专辑</el-radio-button>
        </el-radio-group>
        <el-select v-model="range" style="width: 140px" @change="() => load(false)">
          <el-option v-for="opt in rangeOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
        </el-select>
        <el-button :icon="Refresh" @click="() => load(true)">刷新</el-button>
        <el-button type="primary" :icon="Download" @click="handleExport">导出</el-button>
      </template>
    </PageHeader>

    <div v-loading="loading" class="page-analytics-catalog__content">
      <el-row v-if="data" :gutter="16">
        <el-col :span="24">
          <MetricCard :label="type === 'artist' ? '歌手总数' : '专辑总数'" :value="data.total" tone="primary" />
        </el-col>
      </el-row>

      <el-row v-if="data" :gutter="16" style="margin-top: 16px">
        <el-col :span="24">
          <el-card shadow="never" class="chart-card">
            <template #header>
              <span>{{ type === 'artist' ? '新增歌手趋势' : '新增专辑趋势' }}</span>
            </template>
            <EChart :option="newTrendOption" height="260px" />
          </el-card>
        </el-col>
      </el-row>

      <el-row v-if="data" :gutter="16" style="margin-top: 16px">
        <el-col :span="type === 'artist' ? 12 : 24">
          <el-card shadow="never" class="chart-card">
            <template #header><span>热度榜 (周期内播放)</span></template>
            <RankList :items="hotItems" empty-text="暂无热度数据" />
          </el-card>
        </el-col>
        <el-col v-if="type === 'artist'" :span="12">
          <el-card shadow="never" class="chart-card">
            <template #header><span>关注榜</span></template>
            <RankList :items="followItems" empty-text="暂无关注数据" />
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<style scoped lang="scss">
.page-analytics-catalog {
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