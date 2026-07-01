<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

interface Props {
  /** 粒子数量 */
  count?: number
  /** 粒子连线距离阈值 (px) */
  linkDistance?: number
  /** 基础色相 (0-360) */
  hue?: number
}

const props = withDefaults(defineProps<Props>(), {
  count: 70,
  linkDistance: 130,
  hue: 200,
})

const canvasRef = ref<HTMLCanvasElement | null>(null)
let rafId: number | null = null
let particles: Array<{ x: number; y: number; vx: number; vy: number; r: number }> = []
let resizeObserver: ResizeObserver | null = null

function resize() {
  const c = canvasRef.value
  if (!c) return
  const rect = c.parentElement?.getBoundingClientRect()
  c.width = rect?.width ?? window.innerWidth
  c.height = rect?.height ?? window.innerHeight
}

function init() {
  particles = Array.from({ length: props.count }, () => ({
    x: Math.random() * (canvasRef.value?.width ?? window.innerWidth),
    y: Math.random() * (canvasRef.value?.height ?? window.innerHeight),
    vx: (Math.random() - 0.5) * 0.35,
    vy: (Math.random() - 0.5) * 0.35,
    r: Math.random() * 1.6 + 0.4,
  }))
}

function step() {
  const c = canvasRef.value
  if (!c) return
  const ctx = c.getContext('2d')
  if (!ctx) return

  const w = c.width
  const h = c.height

  // 全清 (带轻微拖影)
  ctx.fillStyle = 'rgba(5, 12, 30, 0.25)'
  ctx.fillRect(0, 0, w, h)

  // 1. 画粒子 + 移动
  for (const p of particles) {
    p.x += p.vx
    p.y += p.vy
    if (p.x < 0 || p.x > w) p.vx *= -1
    if (p.y < 0 || p.y > h) p.vy *= -1

    ctx.beginPath()
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
    ctx.fillStyle = `hsla(${props.hue}, 90%, 70%, 0.85)`
    ctx.shadowColor = `hsla(${props.hue}, 100%, 60%, 0.9)`
    ctx.shadowBlur = 8
    ctx.fill()
    ctx.shadowBlur = 0
  }

  // 2. 画粒子之间的连线
  ctx.lineWidth = 0.5
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const a = particles[i]
      const b = particles[j]
      const dx = a.x - b.x
      const dy = a.y - b.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < props.linkDistance) {
        const alpha = 1 - dist / props.linkDistance
        ctx.strokeStyle = `hsla(${props.hue}, 90%, 65%, ${alpha * 0.35})`
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.stroke()
      }
    }
  }

  rafId = requestAnimationFrame(step)
}

onMounted(() => {
  resize()
  init()
  step()

  resizeObserver = new ResizeObserver(() => {
    resize()
  })
  if (canvasRef.value?.parentElement) {
    resizeObserver.observe(canvasRef.value.parentElement)
  }
})

onUnmounted(() => {
  if (rafId !== null) cancelAnimationFrame(rafId)
  resizeObserver?.disconnect()
})
</script>

<template>
  <canvas ref="canvasRef" class="particle-bg" />
</template>

<style scoped lang="scss">
.particle-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}
</style>