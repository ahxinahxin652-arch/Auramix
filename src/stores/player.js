import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * 循环播放模式枚举
 * - OFF:    不循环，播放到列表末尾停止
 * - LIST:   循环播放整个歌单
 * - TRACK:  循环播放当前单首曲目
 */
export const RepeatMode = Object.freeze({
  OFF: 'off',
  LIST: 'list',
  TRACK: 'track',
})

export const usePlayerStore = defineStore('player', () => {
  // ---- 状态 ----
  const currentTrack = ref(null)        // 当前播放曲目 { name, path, warehouse, duration }
  const currentPlaylist = ref([])         // 当前播放列表
  const currentIndex = ref(-1)           // 当前播放索引
  const isPlaying = ref(false)          // 是否正在播放
  const progress = ref(0)               // 播放进度 0-100
  const currentTime = ref(0)             // 当前时间（秒）
  const duration = ref(0)                // 总时长（秒）
  const volume = ref(0.8)                // 音量 0-1
  const isMuted = ref(false)             // 是否静音
  const shuffle = ref(false)             // 随机播放
  const repeatMode = ref(RepeatMode.OFF) // 循环模式: off / list / track
  const currentLyrics = ref('')          // 当前歌词
  const lyricsUrl = ref('')              // 歌词文件 URL
  const playbackSource = ref(null)       // 播放来源 context: { type: 'playlist'|'album'|'artist'|'search', id: string, name: string, route: string }

  // 随机播放历史（用于随机模式下的"上一首"功能）
  const shuffleHistory = ref([])
  const shuffleHistoryIndex = ref(-1)

  // ---- 计算属性 ----
  const hasPrev = computed(() => {
    if (shuffle.value) {
      return shuffleHistoryIndex.value > 0 || shuffleHistory.value.length > 0
    }
    if (repeatMode.value === RepeatMode.LIST) return currentPlaylist.value.length > 0
    if (repeatMode.value === RepeatMode.TRACK) return currentPlaylist.value.length > 0
    return currentIndex.value > 0
  })

  const hasNext = computed(() => {
    if (repeatMode.value === RepeatMode.TRACK) return currentPlaylist.value.length > 0
    if (repeatMode.value === RepeatMode.LIST) return currentPlaylist.value.length > 0
    if (shuffle.value) return currentPlaylist.value.length > 0
    return currentIndex.value < currentPlaylist.value.length - 1
  })

  const progressPercent = computed(() => {
    if (duration.value === 0) return 0
    return Math.round((currentTime.value / duration.value) * 100)
  })

  // ---- Actions ----
  function setPlaybackSource(source) {
    playbackSource.value = source
  }

  function setTrack(track, playlist = [], index = -1, source = null) {
    currentTrack.value = track
    currentLyrics.value = ''
    lyricsUrl.value = ''
    if (playlist.length > 0) {
      currentPlaylist.value = playlist
      currentIndex.value = index
    }
    if (source) {
      setPlaybackSource(source)
    }
    // 记录随机历史
    if (shuffle.value && index >= 0) {
      shuffleHistory.value.push(index)
      shuffleHistoryIndex.value = shuffleHistory.value.length - 1
    }
  }

  function setPlaylist(list, startIndex = 0) {
    currentPlaylist.value = list
    currentIndex.value = startIndex
    // 重置随机历史
    shuffleHistory.value = []
    shuffleHistoryIndex.value = -1
  }

  function setPlaying(val) {
    isPlaying.value = val
  }

  function setProgress(val) {
    progress.value = val
  }

  function setCurrentTime(val) {
    currentTime.value = val
  }

  function setDuration(val) {
    duration.value = val
  }

  function setVolume(val) {
    volume.value = Math.max(0, Math.min(1, val))
  }

  function setMuted(val) {
    isMuted.value = val
  }

  function setCurrentLyrics(val) {
    currentLyrics.value = val
  }

  function setLyricsUrl(val) {
    lyricsUrl.value = val
  }

  /**
   * 切换随机播放
   */
  function toggleShuffle() {
    shuffle.value = !shuffle.value
    if (shuffle.value) {
      // 开启随机时，将当前曲目作为历史起点
      if (currentIndex.value >= 0) {
        shuffleHistory.value = [currentIndex.value]
        shuffleHistoryIndex.value = 0
      }
    } else {
      // 关闭随机时，清空历史
      shuffleHistory.value = []
      shuffleHistoryIndex.value = -1
    }
  }

  /**
   * 切换循环模式: off -> list -> track -> off
   */
  function toggleRepeatMode() {
    switch (repeatMode.value) {
      case RepeatMode.OFF:
        repeatMode.value = RepeatMode.LIST
        break
      case RepeatMode.LIST:
        repeatMode.value = RepeatMode.TRACK
        break
      case RepeatMode.TRACK:
        repeatMode.value = RepeatMode.OFF
        break
    }
  }

  /**
   * 获取随机索引（排除当前索引）
   */
  function getRandomIndex() {
    if (currentPlaylist.value.length <= 1) return 0
    let newIndex
    do {
      newIndex = Math.floor(Math.random() * currentPlaylist.value.length)
    } while (newIndex === currentIndex.value)
    return newIndex
  }

  /**
   * 播放下一首
   * @returns {Object|null} 下一首 track，或 null
   */
  function playNext() {
    const list = currentPlaylist.value
    if (list.length === 0) return null

    // 循环播放单曲：返回当前 track
    if (repeatMode.value === RepeatMode.TRACK) {
      return list[currentIndex.value]
    }

    // 随机播放模式
    if (shuffle.value) {
      const nextIdx = getRandomIndex()
      currentIndex.value = nextIdx
      shuffleHistory.value.push(nextIdx)
      shuffleHistoryIndex.value = shuffleHistory.value.length - 1
      return list[nextIdx]
    }

    // 顺序播放
    const nextIndex = currentIndex.value + 1
    if (nextIndex < list.length) {
      currentIndex.value = nextIndex
      return list[nextIndex]
    }

    // 到达列表末尾
    if (repeatMode.value === RepeatMode.LIST) {
      currentIndex.value = 0
      return list[0]
    }

    // 不循环 (OFF)：到末尾停止
    return null
  }

  /**
   * 播放上一首
   * @returns {Object|null} 上一首 track，或 null
   */
  function playPrev() {
    const list = currentPlaylist.value
    if (list.length === 0) return null

    // 循环播放单曲：返回当前 track
    if (repeatMode.value === RepeatMode.TRACK) {
      return list[currentIndex.value]
    }

    // 随机播放模式：回溯历史
    if (shuffle.value) {
      if (shuffleHistoryIndex.value > 0) {
        shuffleHistoryIndex.value--
        const prevIdx = shuffleHistory.value[shuffleHistoryIndex.value]
        currentIndex.value = prevIdx
        return list[prevIdx]
      }
      // 无历史，随机选一个
      const randIdx = getRandomIndex()
      currentIndex.value = randIdx
      shuffleHistory.value.unshift(randIdx)
      shuffleHistoryIndex.value = 0
      return list[randIdx]
    }

    // 顺序播放
    const prevIndex = currentIndex.value - 1
    if (prevIndex >= 0) {
      currentIndex.value = prevIndex
      return list[prevIndex]
    }

    // 到达列表开头
    if (repeatMode.value === RepeatMode.LIST) {
      currentIndex.value = list.length - 1
      return list[list.length - 1]
    }

    // 不循环 (OFF)：到开头停止
    return null
  }

  /**
   * 从播放列表中移除指定 track（用于删除曲目后同步播放状态）
   * @param {string} trackId - 被删除的 track ID
   * @returns {{ action: 'stop'|'play'|'noop', track?: Object, index?: number }}
   *   - 'noop':  被删 track 不在当前播放列表，无需操作
   *   - 'stop':  需要停止播放并清除状态
   *   - 'play':  需要播放返回的 track
   */
  function removeTrack(trackId) {
    const list = currentPlaylist.value
    const deletedIndex = list.findIndex(t => t.id === trackId)

    // 不在当前播放列表
    if (deletedIndex === -1) {
      return { action: 'noop' }
    }

    const isCurrentlyPlaying = deletedIndex === currentIndex.value &&
      currentTrack.value?.id === trackId

    // 从 playlist 中移除
    list.splice(deletedIndex, 1)

    // 清理随机历史中对该索引的引用
    if (shuffle.value) {
      shuffleHistory.value = shuffleHistory.value
        .map(idx => idx > deletedIndex ? idx - 1 : idx)
        .filter(idx => idx !== deletedIndex && idx >= 0 && idx < list.length)
      shuffleHistoryIndex.value = Math.min(
        shuffleHistoryIndex.value,
        shuffleHistory.value.length - 1
      )
    }

    if (!isCurrentlyPlaying) {
      // 被删 track 不在播放：只需修正 currentIndex
      if (deletedIndex < currentIndex.value) {
        currentIndex.value--
      }
      return { action: 'noop' }
    }

    // === 以下处理：被删 track 正在播放 ===

    // 播放列表为空
    if (list.length === 0) {
      return { action: 'stop' }
    }

    // 随机模式：播放随机下一首
    if (shuffle.value) {
      const nextIdx = getRandomIndex()
      currentIndex.value = nextIdx
      shuffleHistory.value.push(nextIdx)
      shuffleHistoryIndex.value = shuffleHistory.value.length - 1
      return { action: 'play', track: list[nextIdx], index: nextIdx }
    }

    // 循环单曲：切换到下一首（不再循环已删除的曲目）
    if (repeatMode.value === RepeatMode.TRACK) {
      // 删除后 currentIndex 可能越界
      const nextIdx = currentIndex.value >= list.length ? 0 : currentIndex.value
      currentIndex.value = nextIdx
      return { action: 'play', track: list[nextIdx], index: nextIdx }
    }

    // 顺序播放 / 循环列表
    if (currentIndex.value >= list.length) {
      // 被删的是最后一首
      if (repeatMode.value === RepeatMode.LIST) {
        // 循环列表：回到第一首
        currentIndex.value = 0
        return { action: 'play', track: list[0], index: 0 }
      }
      // 不循环：停止
      return { action: 'stop' }
    }

    // 删除后 currentIndex 位置自动对应下一首
    return { action: 'play', track: list[currentIndex.value], index: currentIndex.value }
  }

  function setCurrentLyrics(val) {
    currentLyrics.value = val || ''
  }


  function reset() {
    currentTrack.value = null
    currentPlaylist.value = []
    currentIndex.value = -1
    isPlaying.value = false
    progress.value = 0
    currentTime.value = 0
    duration.value = 0
    currentLyrics.value = ''
    shuffleHistory.value = []
    shuffleHistoryIndex.value = -1
  }

  return {
    // 状态
    currentTrack,
    currentPlaylist,
    currentIndex,
    isPlaying,
    progress,
    currentTime,
    duration,
    volume,
    isMuted,
    shuffle,
    repeatMode,
    currentLyrics,
    lyricsUrl,
    playbackSource,
    // 计算属性
    hasPrev,
    hasNext,
    progressPercent,
    // Actions
    setTrack,
    setPlaylist,
    setPlaying,
    setProgress,
    setCurrentTime,
    setDuration,
    setVolume,
    setMuted,
    setPlaybackSource,
    toggleShuffle,
    toggleRepeatMode,
    playNext,
    playPrev,
    removeTrack,
    reset,
    setCurrentLyrics,
    setLyricsUrl,
  }
})
