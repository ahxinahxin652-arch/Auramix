<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import gsap from 'gsap'

interface Props {
  /** 数值 */
  value: number
  /** 字号 */
  size?: number
  /** 颜色 */
  color?: string
  /** 千分位分隔 */
  separator?: boolean
  /** 小数位 */
  decimals?: number
  /** 标签 */
  label?: string
  /** 数字滚动动画时长(秒) */
  duration?: number
}

const props = withDefaults(defineProps<Props>(), {
  size: 56,
  color: '#38bdf8',
  separator: true,
  decimals: 0,
  label: '',
  duration: 1.4,
})

const display = ref(0)

function format(n: number): string {
  const fixed = props.decimals > 0 ? n.toFixed(props.decimals) : String(Math.round(n))
  if (!props.separator) return fixed
  const [intPart, decPart] = fixed.split('.')
  const withSep = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return decPart ? `${withSep}.${decPart}` : withSep
}

function animateTo(target: number) {
  const obj = { v: display.value }
  gsap.to(obj, {
    v: target,
    duration: props.duration,
    ease: 'power2.out',
    onUpdate: () => {
      display.value = obj.v
    },
  })
}

onMounted(() => {
  // 首次进入有数字的话直接跳到目标 (避免长滚动)
  display.value = 0
  setTimeout(() => animateTo(props.value), 200)
})

watch(
  () => props.value,
  (newVal) => {
    animateTo(newVal)
  },
)
</script>

<template>
  <div class="neon-number">
    <div
      v-if="props.label"
      class="neon-number__label"
    >{{ props.label }}</div>
    <div
      class="neon-number__value"
      :style="{ color: props.color, fontSize: props.size + 'px' }"
    >
      {{ format(display) }}
    </div>
  </div>
</template>

<style scoped lang="scss">
.neon-number {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;

  &__label {
    font-size: 13px;
    color: rgba(186, 230, 253, 0.7);
    letter-spacing: 4px;
    text-transform: uppercase;
  }

  &__value {
    font-family: 'Consolas', 'Monaco', 'Menlo', monospace;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    text-shadow:
      0 0 8px currentColor,
      0 0 20px rgba(56, 189, 248, 0.5);
    letter-spacing: 2px;
    line-height: 1;
  }
}
</style>