<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerStore, RepeatMode } from '../stores/player.js'
import { useSidebarStore } from '../stores/sidebar.js'
import { useLibraryStore } from '../stores/library'
import { Howl } from 'howler'

// ========== 状态 ==========
let currentBlobUrl = null
let howl = null
let currentLyrics = ''

const player = usePlayerStore()
const sidebarStore = useSidebarStore()
const globalLibraryStore = useLibraryStore()
const router = useRouter()

const parsedArtists = computed(() => {
  const track = player.currentTrack
  if (!track) return []
  if (track.artistNames && track.artistIds) {
    return track.artistNames.map((name, i) => ({ id: track.artistIds[i], name, role: 'Main Artist' }))
  }
  if (!track.artists) return []
  try {
    const list = typeof track.artists === 'string'
      ? JSON.parse(track.artists)
      : track.artists
    return Array.isArray(list) ? list : []
  } catch (e) {
    return []
  }
})

const footBarArtists = computed(() => {
  return parsedArtists.value.filter(
    art => art.role === 'Main Artist' || art.role === 'Featured Artist'
  )
})

function goToArtist(artistId) {
  if (artistId) {
    router.push(`/artist/${artistId}`)
  }
}

function goToAlbum(albumId) {
  if (albumId) {
    router.push(`/album/${albumId}`)
  }
}

const isDragging = ref(false)
const isLyricsOpen = ref(false)

// ========== 滚动溢出检测 ==========
const nameWrapRef = ref(null)
const artistWrapRef = ref(null)
const canScrollName = ref(false)
const canScrollArtist = ref(false)

function checkOverflow() {
  canScrollName.value = false
  canScrollArtist.value = false
  nextTick(() => {
    if (nameWrapRef.value) {
      const nameEl = nameWrapRef.value.querySelector('.track-name')
      canScrollName.value = nameEl ? nameEl.offsetWidth > nameWrapRef.value.clientWidth : false
    }
    if (artistWrapRef.value) {
      const artistEl = artistWrapRef.value.querySelector('.track-artist')
      canScrollArtist.value = artistEl ? artistEl.offsetWidth > artistWrapRef.value.clientWidth : false
    }
  })
}

function refreshOverflow() {
  nextTick(() => {
    if (nameWrapRef.value) {
      const nameEl = nameWrapRef.value.querySelector('.track-name')
      canScrollName.value = nameEl ? nameEl.offsetWidth > nameWrapRef.value.clientWidth : false
    }
    if (artistWrapRef.value) {
      const artistEl = artistWrapRef.value.querySelector('.track-artist')
      canScrollArtist.value = artistEl ? artistEl.offsetWidth > artistWrapRef.value.clientWidth : false
    }
  })
}

watch(() => player.currentTrack, () => {
  checkOverflow()
})

function handleSeekTrack(e) {
  const seekTime = e.detail?.time
  if (typeof seekTime === 'number') {
    if (howl && player.duration) {
      howl.seek(seekTime)
      player.setCurrentTime(seekTime)
    }
  }
}

onMounted(() => {
  checkOverflow()
  window.addEventListener('resize', refreshOverflow)
  window.addEventListener('seek-track', handleSeekTrack)
  
  // 监听歌词悬浮窗状态
  if (window.electronAPI && window.electronAPI.onLyricsWindowStateChange) {
    window.electronAPI.onLyricsWindowStateChange(isOpen => {
      isLyricsOpen.value = isOpen
    })
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', refreshOverflow)
  window.removeEventListener('seek-track', handleSeekTrack)
})

// ========== emit ==========
const emit = defineEmits(['toggle-right-sidebar'])

function handleToggleSidebar() {
  emit('toggle-right-sidebar')
}

function handleToggleLyrics() {
  if (window.electronAPI && window.electronAPI.toggleLyricsWindow) {
    window.electronAPI.toggleLyricsWindow()
  }
}

const isMainLyricsRoute = computed(() => router.currentRoute.value.path === '/lyrics')

function toggleMainLyrics() {
  if (isMainLyricsRoute.value) {
    router.push('/')
  } else {
    router.push('/lyrics')
  }
}

// ========== 监听外部播放事件 ==========
function handlePlayTrackEvent(e) {
  const { track, playlist, index } = e.detail
  playTrack(track, playlist, index)
}

// ========== 监听曲目删除事件 ==========
function handleTrackDeletedEvent(e) {
  const { trackId } = e.detail
  const result = player.removeTrack(trackId)
  if (result.action === 'stop') {
    stopCurrent()
    player.reset()
  } else if (result.action === 'play') {
    playTrack(result.track, player.currentPlaylist, result.index)
  }
}

function handleTogglePlayEvent() {
  togglePlay()
}

function handleStopPlayerEvent() {
  stopCurrent()
  player.reset()
}

onMounted(() => {
  window.addEventListener('play-track', handlePlayTrackEvent)
  window.addEventListener('track-deleted', handleTrackDeletedEvent)
  window.addEventListener('toggle-play', handleTogglePlayEvent)
  window.addEventListener('stop-player', handleStopPlayerEvent)
})

onUnmounted(() => {
  window.removeEventListener('play-track', handlePlayTrackEvent)
  window.removeEventListener('track-deleted', handleTrackDeletedEvent)
  window.removeEventListener('toggle-play', handleTogglePlayEvent)
  window.removeEventListener('stop-player', handleStopPlayerEvent)
  window.removeEventListener('resize', refreshOverflow)
  stopCurrent()
})

// 格式化时间
function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

// 播放指定曲目
async function playTrack(track, playlist = [], index = -1) {
  stopCurrent()
  player.setTrack(track, playlist, index)

  // 通过 track ID 从数据库解析最新的文件路径（防止改名后路径失效）
  let currentTrack = track
  if (track.id) {
    try {
      const resolved = await window.electronAPI.resolveTrackById(track.id)
      if (resolved.success && resolved.data && resolved.data.track) {
        currentTrack = resolved.data.track
        // 同步更新 playlist 中对应的 track 对象
        if (playlist.length > 0 && index >= 0 && index < playlist.length) {
          playlist[index] = currentTrack
        }
        player.setTrack(currentTrack, playlist, index)
      }
    } catch (e) {
      // 解析失败，回退使用内存中的 track 数据
      console.warn('解析 track 最新路径失败，使用内存数据:', e)
    }
  }

  // 更新音乐库的最近播放时间（使用稳定的 warehouseId）
  if (currentTrack.warehouseId) {
    window.electronAPI.updateRecentPlayedById(currentTrack.warehouseId).catch(() => {})
  }
  
  // 异步获取歌词信息并推送给悬浮窗
  currentLyrics = ''
  player.setCurrentLyrics('')
  window.electronAPI.getFileMetadata(currentTrack.path).then(res => {
    if (res.success && res.data) {
      currentLyrics = res.data.lyrics || ''
      player.setCurrentLyrics(currentLyrics)
      if (window.electronAPI.sendLyricsStatus) {
        window.electronAPI.sendLyricsStatus({
          lyrics: currentLyrics,
          currentTime: 0,
          isNew: true
        })
      }
    }
  }).catch(() => {})

  // 通过 Electron IPC 读取文件为 Blob，绕过 file:// 限制
  let audioBlob
  try {
    audioBlob = await window.electronAPI.readFileAsBlob(currentTrack.path)
  } catch (err) {
    console.error('读取音频文件失败:', err)
    player.setPlaying(false)
    return
  }

  currentBlobUrl = URL.createObjectURL(audioBlob)

  // 读取真实的后缀名
  const fileExtension = currentTrack.path.split('.').pop().toLowerCase()

  howl = new Howl({
    src: [currentBlobUrl],
    format: [fileExtension],
    html5: true,
    volume: player.isMuted ? 0 : player.volume,
    onplay: () => {
      player.setPlaying(true)
      startProgressLoop()
    },
    onpause: () => {
      player.setPlaying(false)
    },
    onstop: () => {
      player.setPlaying(false)
      player.setCurrentTime(0)
    },
    onend: () => {
      handleTrackEnd()
    },
    onload: () => {
      player.setDuration(howl.duration())
    },
    onloaderror: (id, err) => {
      console.error('加载失败:', err)
      player.setPlaying(false)
    },
    onplayerror: (id, err) => {
      console.error('播放失败:', err)
      player.setPlaying(false)
    },
  })

  howl.play()
}

/**
 * 处理曲目播放结束 - 根据循环模式和随机模式决定行为
 */
function handleTrackEnd() {
  // 循环单曲：重新播放当前曲目
  if (player.repeatMode === RepeatMode.TRACK) {
    const track = player.currentPlaylist[player.currentIndex]
    if (track) {
      playTrack(track, player.currentPlaylist, player.currentIndex)
    }
    return
  }

  // 尝试获取下一首
  const next = player.playNext()
  if (next) {
    playTrack(next, player.currentPlaylist, player.currentIndex)
  } else {
    // 不循环 (OFF) 且到达末尾
    player.setPlaying(false)
  }
}

function stopCurrent() {
  if (howl) {
    howl.unload()
    howl = null
  }
  if (currentBlobUrl) {
    URL.revokeObjectURL(currentBlobUrl)
    currentBlobUrl = null
  }
  stopProgressLoop()
}

// 播放/暂停
function togglePlay() {
  if (!howl) return
  if (player.isPlaying) {
    howl.pause()
  } else {
    howl.play()
  }
}

// 上一首
function prevTrack() {
  const prev = player.playPrev()
  if (prev) {
    playTrack(prev, player.currentPlaylist, player.currentIndex)
  }
}

// 下一首
function nextTrack() {
  const next = player.playNext()
  if (next) {
    playTrack(next, player.currentPlaylist, player.currentIndex)
  }
}

// 进度条拖动

function seekTo(e) {
  if (!howl || !player.duration) return
  const rect = e.currentTarget.getBoundingClientRect()
  const x = e.clientX - rect.left
  const percent = Math.max(0, Math.min(1, x / rect.width))
  const seekTime = percent * player.duration
  howl.seek(seekTime)
  player.setCurrentTime(seekTime)
}

// 音量
function setVolume(e) {
  const val = parseFloat(e.target.value)
  player.setVolume(val)
  if (howl) {
    howl.volume(player.isMuted ? 0 : val)
  }
}

function toggleMute() {
  player.setMuted(!player.isMuted)
  if (howl) {
    howl.volume(player.isMuted ? 0 : player.volume)
  }
}

// 进度更新循环
let progressTimer = null
function startProgressLoop() {
  stopProgressLoop()
  progressTimer = setInterval(() => {
    if (howl && player.isPlaying && !isDragging.value) {
      const t = howl.seek()
      player.setCurrentTime(t)
      
      // 同步给歌词悬浮窗
      if (window.electronAPI && window.electronAPI.sendLyricsStatus) {
        window.electronAPI.sendLyricsStatus({
          currentTime: t,
          isNew: false
        })
      }
    }
  }, 250)
}

function stopProgressLoop() {
  if (progressTimer) {
    clearInterval(progressTimer)
    progressTimer = null
  }
}

// 暴露给外部调用（通过事件）

onUnmounted(() => {
  stopCurrent()
})
</script>

<template>
  <footer class="footbar">
    <!-- 左侧：当前曲目信息 -->
    <div class="foot-left">
      <div v-if="player.currentTrack" class="track-info">
        <div class="track-cover" @click="goToAlbum(player.currentTrack.albumId)" style="cursor: pointer;">
          <img v-if="player.currentTrack.cover" :src="player.currentTrack.cover" class="track-cover-img" alt="" />
          <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18V5l12-2v13"/>
            <circle cx="6" cy="18" r="3"/>
            <circle cx="18" cy="16" r="3"/>
          </svg>
        </div>
        <div class="track-detail">
          <div class="track-name-wrap" ref="nameWrapRef" :title="player.currentTrack.title || player.currentTrack.name" @click="goToAlbum(player.currentTrack.albumId)" style="cursor: pointer;">
            <div class="track-name-inner" :class="{ scrolling: canScrollName }">
              <span class="track-name" style="font-weight: 700;">{{ player.currentTrack.title || player.currentTrack.name }}</span>
              <span class="track-name track-name-clone">{{ player.currentTrack.title || player.currentTrack.name }}</span>
            </div>
          </div>
          <div class="track-artist-wrap" ref="artistWrapRef" :title="player.currentTrack.artist || '未知作者'">
            <div class="track-artist-inner" :class="{ scrolling: canScrollArtist }">
              <template v-if="footBarArtists.length > 0">
                <span class="track-artist">
                  <span v-for="(art, idx) in footBarArtists" :key="art.id">
                    <span class="artist-link" @click.stop="goToArtist(art.id)">{{ art.name }}</span>
                    <span v-if="idx < footBarArtists.length - 1">, </span>
                  </span>
                </span>
                <span class="track-artist track-artist-clone">
                  <span v-for="(art, idx) in footBarArtists" :key="art.id">
                    <span class="artist-link" @click.stop="goToArtist(art.id)">{{ art.name }}</span>
                    <span v-if="idx < footBarArtists.length - 1">, </span>
                  </span>
                </span>
              </template>
              <template v-else>
                <span class="track-artist">{{ player.currentTrack.artist || '未知作者' }}</span>
                <span class="track-artist track-artist-clone">{{ player.currentTrack.artist || '未知作者' }}</span>
              </template>
            </div>
          </div>
        </div>
        <button 
          v-if="player.currentTrack"
          class="add-to-playlist-btn" 
          :class="{ 'is-saved': globalLibraryStore.isSavedToAnyPlaylist(player.currentTrack.id) }"
          @click.stop="globalLibraryStore.openSelector(player.currentTrack.id, $event.clientX, $event.clientY)" 
          title="添加到歌单"
        >
          <svg v-if="globalLibraryStore.isSavedToAnyPlaylist(player.currentTrack.id)" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>
      <div v-else class="track-info">
        <div class="track-cover empty">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18V5l12-2v13"/>
            <circle cx="6" cy="18" r="3"/>
            <circle cx="18" cy="16" r="3"/>
          </svg>
        </div>
        <div class="track-detail">
          <span class="track-name empty-text">未播放任何曲目</span>
        </div>
      </div>
    </div>

    <!-- 中间：播放控制 -->
    <div class="foot-center">
      <div class="controls">
        <!-- 随机播放按钮（左侧） -->
        <button
          class="ctrl-btn shuffle-btn"
          :class="{ active: player.shuffle }"
          @click="player.toggleShuffle()"
          :disabled="player.currentPlaylist.length === 0"
          title="随机播放"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="16 3 21 3 21 8"/>
            <line x1="4" y1="20" x2="21" y2="3"/>
            <polyline points="21 16 21 21 16 21"/>
            <line x1="15" y1="15" x2="21" y2="21"/>
            <line x1="4" y1="4" x2="9" y2="9"/>
          </svg>
        </button>

        <button class="ctrl-btn" @click="prevTrack" :disabled="!player.hasPrev" title="上一首">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
          </svg>
        </button>
        <button class="ctrl-btn play-btn" @click="togglePlay" :disabled="!player.currentTrack" title="播放/暂停">
          <svg v-if="!player.isPlaying" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
          <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16"/>
            <rect x="14" y="4" width="4" height="16"/>
          </svg>
        </button>
        <button class="ctrl-btn" @click="nextTrack" :disabled="!player.hasNext" title="下一首">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
          </svg>
        </button>

        <!-- 循环播放按钮（右侧） -->
        <button
          class="ctrl-btn repeat-btn"
          :class="{ active: player.repeatMode !== RepeatMode.OFF }"
          @click="player.toggleRepeatMode()"
          :disabled="player.currentPlaylist.length === 0"
          :title="player.repeatMode === RepeatMode.OFF ? '循环播放' : player.repeatMode === RepeatMode.LIST ? '循环歌单' : '循环单曲'"
        >
          <!-- 循环歌单图标 -->
          <svg v-if="player.repeatMode === RepeatMode.LIST" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="17 1 21 5 17 9"/>
            <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
            <polyline points="7 23 3 19 7 15"/>
            <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
          </svg>
          <!-- 循环单曲图标（带 1 标记） -->
          <svg v-else-if="player.repeatMode === RepeatMode.TRACK" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="17 1 21 5 17 9"/>
            <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
            <polyline points="7 23 3 19 7 15"/>
            <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
            <text x="12" y="14" text-anchor="middle" fill="currentColor" stroke="none" font-size="8" font-weight="bold">1</text>
          </svg>
          <!-- 不循环图标（灰色） -->
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="17 1 21 5 17 9"/>
            <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
            <polyline points="7 23 3 19 7 15"/>
            <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
          </svg>
        </button>
      </div>

      <!-- 进度条 -->
      <div class="progress-area">
        <span class="time-label">{{ formatTime(player.currentTime) }}</span>
        <div class="progress-track" @click="seekTo">
          <div class="progress-bg"></div>
          <div class="progress-fill" :style="{ width: (player.duration > 0 ? player.currentTime / player.duration * 100 : 0) + '%' }"></div>
          <div class="progress-thumb"></div>
        </div>
        <span class="time-label">{{ formatTime(player.duration) }}</span>
      </div>
    </div>

    <!-- 右侧：音量 + 侧栏开关 -->
    <div class="foot-right">
      <button
        class="ctrl-btn main-lyrics-btn"
        :class="{ active: isMainLyricsRoute }"
        @click="toggleMainLyrics"
        title="歌词"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
          <path d="M19 10v1a7 7 0 0 1-14 0v-1"/>
          <line x1="12" y1="19" x2="12" y2="22"/>
        </svg>
      </button>

      <button
        class="ctrl-btn lyrics-btn"
        :class="{ active: isLyricsOpen }"
        @click="handleToggleLyrics"
        title="桌面歌词"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
      </button>

      <button
        class="ctrl-btn sidebar-toggle-btn"
        :class="{
          active: sidebarStore.isOpen,
          disabled: sidebarStore.isAnimating,
        }"
        :disabled="sidebarStore.isAnimating"
        @click="handleToggleSidebar"
        :title="sidebarStore.isOpen ? '隐藏详情' : '显示详情'"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <line x1="9" y1="3" x2="9" y2="21"/>
        </svg>
      </button>

      <button class="ctrl-btn vol-btn" @click="toggleMute" :title="player.isMuted ? '取消静音' : '静音'">
        <svg v-if="!player.isMuted && player.volume > 0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
        </svg>
        <svg v-else-if="!player.isMuted && player.volume > 0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
        </svg>
        <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
          <line x1="23" y1="9" x2="17" y2="15"/>
          <line x1="17" y1="9" x2="23" y2="15"/>
        </svg>
      </button>
      <input
        type="range"
        class="volume-slider"
        min="0"
        max="1"
        step="0.01"
        :value="player.volume"
        @input="setVolume"
      />
    </div>
  </footer>
</template>

<style scoped>
.add-to-playlist-btn {
  background: none;
  border: none;
  color: var(--text);
  cursor: pointer;
  margin-left: 16px;
  opacity: 0.7;
  transition: opacity 0.2s, color 0.2s, transform 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
}
.foot-left:hover .add-to-playlist-btn {
  opacity: 1;
}
.add-to-playlist-btn.is-saved {
  opacity: 1 !important;
  color: #1db954;
}
.add-to-playlist-btn:hover {
  opacity: 1 !important;
  color: #fff;
  transform: scale(1.1);
}
</style>
