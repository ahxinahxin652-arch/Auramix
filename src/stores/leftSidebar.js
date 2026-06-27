import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

// ========== 常量 ==========
const STORAGE_KEY = 'auramix_left_sidebar'
const COLLAPSED_WIDTH = 72
const EXPANDED_WIDTH = 280
const MAX_WIDTH = 320
const THRESHOLD = 180

// ========== localStorage 读写 ==========
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        mode: parsed.mode === 'expanded' ? 'expanded' : 'collapsed',
        width: typeof parsed.width === 'number' ? parsed.width : COLLAPSED_WIDTH,
      }
    }
  } catch (e) { /* ignore corrupt data */ }
  return { mode: 'collapsed', width: COLLAPSED_WIDTH }
}

function saveState(mode, width) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ mode, width }))
  } catch (e) { /* ignore */ }
}

// ========== LeftSidebar Store ==========
// 管理左侧歌单边栏的状态：缩略/详细模式、宽度、拖拽状态
// 与右侧边栏（sidebar store）互斥：左侧展开时关闭右侧，右侧打开时缩回左侧
export const useLeftSidebarStore = defineStore('leftSidebar', () => {
  const initial = loadState()
  const mode = ref(initial.mode)       // 'collapsed' | 'expanded'
  const width = ref(initial.width)     // 当前像素宽度
  const isDragging = ref(false)

  // 持久化
  watch([mode, width], () => {
    saveState(mode.value, width.value)
  }, { deep: false })

  // ---- Actions ----

  function toggle() {
    if (isDragging.value) return
    if (mode.value === 'collapsed') {
      mode.value = 'expanded'
      width.value = EXPANDED_WIDTH
    } else {
      mode.value = 'collapsed'
      width.value = COLLAPSED_WIDTH
    }
  }

  function collapse() {
    if (isDragging.value) return
    mode.value = 'collapsed'
    width.value = COLLAPSED_WIDTH
  }

  function expand() {
    if (isDragging.value) return
    mode.value = 'expanded'
    width.value = EXPANDED_WIDTH
  }

  function startDrag() {
    isDragging.value = true
  }

  function endDrag(finalWidth) {
    isDragging.value = false
    if (finalWidth <= THRESHOLD) {
      mode.value = 'collapsed'
      width.value = COLLAPSED_WIDTH
    } else {
      mode.value = 'expanded'
      width.value = Math.max(EXPANDED_WIDTH, Math.min(MAX_WIDTH, finalWidth))
    }
  }

  function updateDragWidth(w) {
    width.value = Math.max(COLLAPSED_WIDTH, Math.min(MAX_WIDTH, w))
  }

  return {
    mode,
    width,
    isDragging,
    toggle,
    collapse,
    expand,
    startDrag,
    endDrag,
    updateDragWidth,
    COLLAPSED_WIDTH,
    EXPANDED_WIDTH,
    MAX_WIDTH,
    THRESHOLD,
  }
})
