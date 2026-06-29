import { defineStore } from 'pinia'
import { ref } from 'vue'

// ========== 侧栏 Store ==========
// 用于管理右侧侧栏（如 Spotify 风格的曲目详情面板）
export const useSidebarStore = defineStore('sidebar', () => {
  // ---- 状态 ----
  // 是否展开侧栏
  const isOpen = ref(false)
  // 侧栏内容类型：'track-detail' | 'playlist-detail' | ...
  const contentType = ref('')
  // 侧栏数据
  const data = ref(null)
  // 侧栏是否正在执行动画（切换中）
  const isAnimating = ref(false)
  
  // 记录上一个侧栏的状态，用于关闭 play-queue 时恢复
  const previousState = ref({ isOpen: false, contentType: '', data: null })
  
  // 侧栏宽度
  const width = ref(280)
  // 侧栏宽度相对窗口宽度的比例
  const widthRatio = ref(280 / window.innerWidth)

  // ---- Actions ----

  /**
   * 打开侧栏
   * @param {string} type - 侧栏内容类型
   * @param {any} payload - 侧栏数据
   */
  function open(type, payload = null) {
    if (isAnimating.value) return

    if (type === 'play-queue' && contentType.value !== 'play-queue') {
      previousState.value = { isOpen: isOpen.value, contentType: contentType.value, data: data.value }
    } else if (type !== 'play-queue') {
      previousState.value = { isOpen: true, contentType: type, data: payload }
    }

    contentType.value = type
    data.value = payload
    isOpen.value = true
  }

  /**
   * 关闭侧栏
   */
  function close() {
    if (isAnimating.value) return
    if (contentType.value === 'play-queue') {
      isOpen.value = previousState.value.isOpen
      contentType.value = previousState.value.contentType || ''
      data.value = previousState.value.data
    } else {
      isOpen.value = false
    }
  }

  /**
   * 切换侧栏
   */
  function toggle() {
    if (isAnimating.value) return
    isOpen.value = !isOpen.value
  }

  /**
   * 设置侧栏展开状态
   * @param {boolean} val
   */
  function setOpen(val) {
    if (isAnimating.value) return
    isOpen.value = val
  }

  /**
   * 开始动画（由 App.vue 在动画开始时调用）
   */
  function startAnimation() {
    isAnimating.value = true
  }

  /**
   * 结束动画（由 App.vue 在动画结束时调用）
   */
  function endAnimation() {
    isAnimating.value = false
  }

  const MIN_WIDTH = 250
  const ABSOLUTE_MAX_WIDTH = 350
  
  function getDynamicMaxWidth() {
    // 最大宽度由窗口宽度决定，最大不超过 350 (原500的3/5)
    let dynamicMax = Math.min(ABSOLUTE_MAX_WIDTH, window.innerWidth * 0.35)
    return Math.max(dynamicMax, MIN_WIDTH)
  }

  function setWidth(newWidth) {
    const maxW = getDynamicMaxWidth()
    if (newWidth < MIN_WIDTH) newWidth = MIN_WIDTH
    if (newWidth > maxW) newWidth = maxW
    
    width.value = newWidth
    widthRatio.value = newWidth / window.innerWidth
  }
  
  function updateWidthOnResize() {
    const maxW = getDynamicMaxWidth()
    let newWidth = window.innerWidth * widthRatio.value
    
    if (newWidth < MIN_WIDTH) newWidth = MIN_WIDTH
    if (newWidth > maxW) newWidth = maxW
    
    width.value = newWidth
  }

  return {
    isOpen,
    contentType,
    data,
    isAnimating,
    width,
    open,
    close,
    toggle,
    setOpen,
    startAnimation,
    endAnimation,
    setWidth,
    updateWidthOnResize,
  }
})