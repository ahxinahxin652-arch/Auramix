<script setup lang="ts">
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart, PieChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from 'echarts/components'

use([CanvasRenderer, LineChart, BarChart, PieChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent])

interface Props {
  option: Record<string, unknown>
  height?: string
}

const props = withDefaults(defineProps<Props>(), {
  height: '320px',
})

const styleObj = computed(() => ({ height: props.height, width: '100%' }))
</script>

<template>
  <VChart :option="props.option" :style="styleObj" autoresize />
</template>