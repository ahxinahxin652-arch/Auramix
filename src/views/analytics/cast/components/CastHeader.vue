<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const now = ref(new Date())
let timer: ReturnType<typeof setInterval> | null = null

function pad(n: number) {
  return String(n).padStart(2, '0')
}

const time = ref('')
const date = ref('')

function tick() {
  now.value = new Date()
  time.value = `${pad(now.value.getHours())}:${pad(now.value.getMinutes())}:${pad(now.value.getSeconds())}`
  const w = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][now.value.getDay()]
  date.value = `${now.value.getFullYear()}-${pad(now.value.getMonth() + 1)}-${pad(now.value.getDate())} ${w}`
}

onMounted(() => {
  tick()
  timer = setInterval(tick, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div class="cast-header">
    <!-- 左: 标题 + 数据范围 -->
    <div class="cast-header__left">
      <div class="cast-header__brand">
        <span class="cast-header__bar" />
        <span class="cast-header__title">AURAMIX 数据大屏</span>
      </div>
      <span class="cast-header__subtitle">Streaming Music Platform · Data Center</span>
    </div>

    <!-- 右: 时间 + 装饰 -->
    <div class="cast-header__right">
      <div class="cast-header__date">{{ date }}</div>
      <div class="cast-header__time">{{ time }}</div>
    </div>

    <!-- 装饰线 -->
    <div class="cast-header__line" />
  </div>
</template>

<style scoped lang="scss">
.cast-header {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 36px;
  height: 78px;
  background: linear-gradient(180deg, rgba(8, 22, 56, 0.85) 0%, rgba(5, 12, 30, 0.65) 100%);
  border-bottom: 1px solid rgba(56, 189, 248, 0.25);

  &__left {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__brand {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__bar {
    display: inline-block;
    width: 4px;
    height: 24px;
    background: linear-gradient(180deg, #38bdf8, #0284c7);
    box-shadow: 0 0 8px #38bdf8;
  }

  &__title {
    font-size: 22px;
    font-weight: 700;
    color: #e0f2fe;
    letter-spacing: 4px;
    text-shadow: 0 0 8px rgba(56, 189, 248, 0.4);
  }

  &__subtitle {
    font-size: 11px;
    color: rgba(125, 211, 252, 0.6);
    letter-spacing: 3px;
    padding-left: 14px;
  }

  &__right {
    display: flex;
    align-items: center;
    gap: 18px;
  }

  &__date {
    font-size: 14px;
    color: rgba(186, 230, 253, 0.85);
    letter-spacing: 2px;
    font-family: 'Consolas', 'Monaco', monospace;
  }

  &__time {
    font-size: 30px;
    font-weight: 700;
    color: #38bdf8;
    font-family: 'Consolas', 'Monaco', monospace;
    text-shadow: 0 0 10px rgba(56, 189, 248, 0.7);
    letter-spacing: 2px;
  }

  &__line {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg,
      transparent 0%,
      #38bdf8 20%,
      #38bdf8 80%,
      transparent 100%);
    opacity: 0.6;
  }
}
</style>