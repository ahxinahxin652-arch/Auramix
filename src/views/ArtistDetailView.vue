<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { usePlayerStore } from '../stores/player.js'
import { useLibraryStore } from '../stores/library'

const route = useRoute()
const router = useRouter()
const player = usePlayerStore()
const globalLibraryStore = useLibraryStore()

const artistId = computed(() => route.params.id)
const artistInfo = ref({
  id: '',
  name: '加载中...',
  coverImg: '',
  metadata: {
    birthPlace: '',
    description: '',
    links: []
  }
})

// 最终展示的歌曲列表
const displayTracks = ref([])

// 加载状态
const isLoading = ref(true)

const scrollToTop = () => {
  const mainView = document.querySelector('.main-view')
  if (mainView) {
    mainView.scrollTop = 0
  }
}

onMounted(async () => {
  scrollToTop()
  await loadArtistData()
})

watch(artistId, async () => {
  scrollToTop()
  await loadArtistData()
})

const loadArtistData = async () => {
  if (!artistId.value) return
  isLoading.value = true
  try {
    const result = await window.electronAPI.getArtistById(artistId.value)
    if (result.success && result.data && result.data.artist) {
      const artist = result.data.artist
      let parsedMetadata = { birthPlace: '', description: '', links: [] }
      if (artist.metadata) {
        try {
          parsedMetadata = JSON.parse(artist.metadata)
        } catch (e) {
          parsedMetadata.description = artist.metadata
        }
      }

      artistInfo.value = {
        id: artist.id,
        name: artist.name,
        coverImg: artist.coverImg || '',
        metadata: parsedMetadata
      }
      displayTracks.value = artist.tracks || []
    } else {
      ElMessage.error('歌手加载失败: ' + (result.message || '未知错误'))
    }
  } catch (err) {
    console.error('加载歌手数据出错:', err)
    ElMessage.error('加载歌手数据出错')
  } finally {
    isLoading.value = false
  }
}

const goBack = () => {
  router.back()
}

// 模拟月收听人数 (根据歌手名字哈希生成稳定的数量，更逼真)
const monthlyListeners = computed(() => {
  if (!artistInfo.value.name) return '0'
  let hash = 0
  for (let i = 0; i < artistInfo.value.name.length; i++) {
    hash = artistInfo.value.name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const seed = Math.abs(hash)
  const count = (seed % 2456128) + 1200000 // 1.2M - 3.6M
  return count.toLocaleString()
})

// 最终展示的歌曲列表 (已改为 ref)

// 当前歌手是否有歌正在播放
const isArtistPlaying = computed(() => {
  if (!player.currentTrack || !player.isPlaying) return false
  return displayTracks.value.some(t => t.id === player.currentTrack.id)
})

// 播放整首歌手歌曲
const playArtistTracks = () => {
  if (displayTracks.value.length === 0) return
  const firstTrack = displayTracks.value[0]
  const playEvent = new CustomEvent('play-track', {
    detail: {
      track: firstTrack,
      playlist: displayTracks.value,
      index: 0
    }
  })
  window.dispatchEvent(playEvent)
}

// 播放控制
const togglePlayArtist = () => {
  if (displayTracks.value.length === 0) return
  if (isArtistPlaying.value) {
    const toggleEvent = new CustomEvent('toggle-play')
    window.dispatchEvent(toggleEvent)
  } else {
    playArtistTracks()
  }
}

// 播放单首歌曲
const playIndividualTrack = (track, index) => {
  if (player.currentTrack && player.currentTrack.id === track.id) {
    const toggleEvent = new CustomEvent('toggle-play')
    window.dispatchEvent(toggleEvent)
  } else {
    const playEvent = new CustomEvent('play-track', {
      detail: {
        track,
        playlist: displayTracks.value,
        index
      }
    })
    window.dispatchEvent(playEvent)
  }
}

const isTrackActive = (trackId) => {
  return player.currentTrack && player.currentTrack.id === trackId
}

const isTrackPlaying = (trackId) => {
  return isTrackActive(trackId) && player.isPlaying
}

const formatDuration = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

const formatPlayCount = (num) => {
  if (!num) return '0'
  return num.toLocaleString()
}
</script>

<template>
  <div class="artist-detail">
    <div v-if="isLoading" class="page-loading-state">
      <div class="spinner"></div>
      <span>加载中...</span>
    </div>
    <template v-else>
    <!-- Widescreen Banner Section -->
    <div class="artist-banner">
      <!-- 模糊背景层 -->
      <div 
        class="banner-blur-bg" 
        :style="artistInfo.coverImg ? { backgroundImage: `url(${artistInfo.coverImg})` } : {}"
      ></div>
      <!-- 居中的清晰图片层 -->
      <div 
        class="banner-sharp-img" 
        :style="artistInfo.coverImg ? { backgroundImage: `url(${artistInfo.coverImg})` } : {}"
      ></div>
      

      <div class="artist-banner-content">
        <h1 class="artist-banner-name">{{ artistInfo.name }}</h1>
        <div class="verified-row">
          <svg class="verified-badge" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#3d91ff"/>
          </svg>
          <span class="verified-text">Verified Artist</span>
        </div>
        <span class="listeners-count">{{ monthlyListeners }} monthly listeners</span>
      </div>
    </div>

    <!-- Controls Bar -->
    <div class="controls-bar">
      <!-- Play green circle button -->
      <button class="circle-play-btn" @click="togglePlayArtist" title="播放/暂停">
        <svg v-if="!isArtistPlaying" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="8 5 19 12 8 19 8 5"/>
        </svg>
        <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="4" width="4" height="16"/>
          <rect x="14" y="4" width="4" height="16"/>
        </svg>
      </button>

      <!-- Shuffle toggle button -->
      <button 
        class="shuffle-toggle" 
        :class="{ active: player.shuffle }" 
        @click="player.toggleShuffle()"
        title="随机播放"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="16 3 21 3 21 8"/>
          <line x1="4" y1="20" x2="21" y2="3"/>
          <polyline points="21 16 21 21 16 21"/>
          <line x1="15" y1="15" x2="21" y2="21"/>
          <line x1="4" y1="4" x2="9" y2="9"/>
        </svg>
      </button>

      <!-- Follow button -->
      <button 
        class="follow-btn-outline" 
        :class="{ active: globalLibraryStore.isFollowingArtist(artistInfo.id) }" 
        @click="globalLibraryStore.toggleFollowArtist(artistInfo.id)"
      >
        {{ globalLibraryStore.isFollowingArtist(artistInfo.id) ? 'Following' : 'Follow' }}
      </button>

    </div>

    <!-- Main Content Layout (1 Column, About section removed) -->
    <div class="artist-grid">
      <!-- Popular Tracks -->
      <div class="popular-tracks-section">
        <h2 class="section-title">Popular</h2>
        <div class="tracks-table">
          <div 
            v-for="(track, index) in displayTracks" 
            :key="track.id" 
            class="track-row-item"
            :class="{ active: isTrackActive(track.id) }"
            @click="playIndividualTrack(track, index)"
          >
            <!-- Column 1: Index / Play-Pause Icon -->
            <div class="col-num-cell">
              <span class="index-num" v-show="!isTrackPlaying(track.id)">{{ index + 1 }}</span>
              <span class="active-equalizer" v-show="isTrackPlaying(track.id)">
                <span class="bar bar-1"></span>
                <span class="bar bar-2"></span>
                <span class="bar bar-3"></span>
              </span>
              <button class="row-play-btn">
                <svg v-if="!isTrackPlaying(track.id)" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="6 4 20 12 6 20 6 4"/>
                </svg>
                <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="5" y="4" width="4" height="16"/>
                  <rect x="15" y="4" width="4" height="16"/>
                </svg>
              </button>
            </div>

            <!-- Column 2: Cover image thumbnail -->
            <div class="col-cover-cell">
              <div class="track-thumbnail">
                <img v-if="track.cover" :src="track.cover" class="track-thumbnail-img" alt="" />
                <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M9 18V5l12-2v13"/>
                  <circle cx="6" cy="18" r="3"/>
                  <circle cx="18" cy="16" r="3"/>
                </svg>
              </div>
            </div>

            <!-- Column 3: Song name and optional tag -->
            <div class="col-title-cell">
              <span class="track-row-title" :class="{ green: isTrackActive(track.id) }">
                {{ track.title || track.name }}
              </span>
            </div>

            <!-- Column 4: Play count -->
            <div class="col-playcount-cell">
              {{ formatPlayCount(track.playCount || Math.floor((track.title || '').length * 84218 + (index * 456721) + 204910)) }}
            </div>

            <!-- Column 5: Status indicator -->
            <div class="col-status-cell">
              <svg v-if="isTrackActive(track.id)" class="status-checkmark" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#1db954"/>
              </svg>
            </div>

            <!-- Column 6: Duration -->
            <div class="col-time-cell">
              <button 
                class="add-to-playlist-btn" 
                :class="{ 'is-saved': globalLibraryStore.isSavedToAnyPlaylist(track.id) }"
                @click.stop="globalLibraryStore.openSelector(track.id, $event.clientX, $event.clientY)" 
                title="添加到歌单"
              >
                <svg v-if="globalLibraryStore.isSavedToAnyPlaylist(track.id)" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                </svg>
                <svg v-else viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </button>
              {{ formatDuration(track.duration) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    </template>
  </div>
</template>

<style scoped>
.artist-detail {
  padding: 0 0 40px;
  background: var(--bg);
  min-height: 100%;
  color: var(--text);
  font-family: var(--font);
  box-sizing: border-box;
  overflow-y: auto;
}

/* Widescreen Banner */
.artist-banner {
  position: relative;
  height: 38vh;
  min-height: 280px;
  max-height: 480px;
  background-color: var(--surface-2);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 24px 32px 32px;
  overflow: hidden;
}

.banner-blur-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  filter: blur(35px) brightness(0.4);
  transform: scale(1.1);
  z-index: 1;
}

.banner-sharp-img {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 10%;
  right: 10%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: 2;
  -webkit-mask-image: linear-gradient(to right, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 12%, rgba(0, 0, 0, 1) 88%, rgba(0, 0, 0, 0) 100%);
  mask-image: linear-gradient(to right, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 12%, rgba(0, 0, 0, 1) 88%, rgba(0, 0, 0, 0) 100%);
}

.artist-banner::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(rgba(0, 0, 0, 0.1) 30%, var(--bg));
  z-index: 3;
}

.back-btn {
  position: absolute;
  top: 24px;
  left: 24px;
  z-index: 5;
  width: 40px;
  height: 40px;
  background: rgba(0, 0, 0, 0.7);
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  cursor: pointer;
  transition: transform 0.2s, background-color 0.2s;
}

.back-btn:hover {
  background: rgba(0, 0, 0, 0.9);
  transform: scale(1.05);
}

.artist-banner-content {
  position: relative;
  z-index: 4;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.verified-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.verified-badge {
  flex-shrink: 0;
}

.verified-text {
  font-size: 13px;
  font-weight: 700;
  color: #ffffff;
}

.artist-banner-name {
  font-size: 80px;
  font-weight: 900;
  color: #ffffff;
  margin: 0;
  line-height: 1;
  letter-spacing: -0.02em;
}

.listeners-count {
  font-size: 14px;
  font-weight: 700;
  color: #ffffff;
  margin-top: 4px;
}

/* Controls Bar */
.controls-bar {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 24px 32px;
  background: linear-gradient(rgba(255, 255, 255, 0.02) 0%, rgba(0, 0, 0, 0) 100%);
}

.circle-play-btn {
  width: 56px;
  height: 56px;
  background: var(--accent);
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  cursor: pointer;
  transition: transform 0.2s, background-color 0.2s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.circle-play-btn:hover {
  background: var(--accent-hover);
  transform: scale(1.05);
}

.circle-play-btn:active {
  transform: scale(0.98);
}

.shuffle-toggle {
  background: transparent;
  border: none;
  color: var(--text);
  opacity: 0.6;
  cursor: pointer;
  padding: 4px;
  transition: color 0.2s, opacity 0.2s;
  display: flex;
  align-items: center;
}

.shuffle-toggle:hover {
  color: var(--text-h);
  opacity: 1;
}

.shuffle-toggle.active {
  color: var(--accent);
  opacity: 1;
}

.follow-btn-outline,
.edit-bio-btn-outline {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text);
  font-size: 12px;
  font-weight: 700;
  padding: 7px 18px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.follow-btn-outline:hover,
.edit-bio-btn-outline:hover {
  border-color: var(--accent);
  color: var(--text-h);
  transform: scale(1.04);
}

.follow-btn-outline.active {
  border-color: var(--accent);
  color: var(--accent);
}

.options-ellipsis {
  background: transparent;
  border: none;
  color: var(--text);
  opacity: 0.6;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 4px;
  transition: color 0.2s, opacity 0.2s;
}

.options-ellipsis:hover {
  color: var(--text-h);
  opacity: 1;
}

/* Layout (Now 100% full width, About card removed) */
.artist-grid {
  display: block;
  padding: 16px 32px 32px;
}

.section-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-h);
  margin-top: 0;
  margin-bottom: 20px;
}

/* Tracks Table */
.tracks-table {
  display: flex;
  flex-direction: column;
}

.track-row-item {
  display: grid;
  grid-template-columns: 40px 48px 1fr 1fr 40px 60px;
  align-items: center;
  height: 56px;
  padding: 0 16px;
  border-radius: 4px;
  transition: background-color 0.2s;
  cursor: pointer;
}

.track-row-item:hover {
  background-color: var(--surface-2);
}

.track-row-item:hover .index-num,
.track-row-item:hover .active-equalizer {
  display: none;
}

.track-row-item:hover .row-play-btn {
  display: flex;
}

.track-row-item.active {
  background-color: var(--accent-dim);
}

.col-num-cell {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  color: var(--text);
  opacity: 0.8;
}

.row-play-btn {
  display: none;
  background: transparent;
  border: none;
  color: var(--text-h);
  cursor: pointer;
  align-items: center;
  justify-content: center;
}

/* Active Equalizer animation */
.active-equalizer {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  width: 14px;
  height: 14px;
}

.active-equalizer .bar {
  width: 2px;
  height: 100%;
  background-color: var(--accent);
  animation: bounce-equalizer 0.8s ease-in-out infinite alternate;
  transform-origin: bottom;
}

.active-equalizer .bar-1 { animation-delay: 0.1s; }
.active-equalizer .bar-2 { animation-delay: 0.4s; }
.active-equalizer .bar-3 { animation-delay: 0.2s; }

@keyframes bounce-equalizer {
  0% { transform: scaleY(0.2); }
  100% { transform: scaleY(1); }
}

.col-cover-cell {
  display: flex;
  align-items: center;
}

.track-thumbnail {
  width: 36px;
  height: 36px;
  border-radius: 4px;
  background-color: var(--surface);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  color: var(--text);
}

.track-thumbnail-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.col-title-cell {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding-right: 16px;
}

.track-row-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-h);
}

.track-row-title.green {
  color: var(--accent);
}

.track-row-item:hover .track-row-title {
  color: var(--text-h);
}

.col-playcount-cell {
  font-size: 13px;
  color: var(--text);
  opacity: 0.8;
}

.col-status-cell {
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-checkmark {
  flex-shrink: 0;
}

.col-time-cell {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  font-size: 13px;
  font-family: var(--mono);
  color: var(--text);
  opacity: 0.8;
  padding-right: 8px;
}

.add-to-playlist-btn {
  background: none;
  border: none;
  color: var(--text);
  cursor: pointer;
  margin-right: 16px;
  opacity: 0;
  transition: opacity 0.2s, color 0.2s, transform 0.2s;
  display: flex;
  align-items: center;
  padding: 4px;
}
.track-row-item:hover .add-to-playlist-btn {
  opacity: 0.6;
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

/* Modal form adjustments */
.edit-dialog-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 10px 0;
}

.edit-avatar-upload {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 2px dashed var(--border);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  margin: 0 auto;
  gap: 4px;
  background-color: var(--surface-2);
  transition: border-color 0.2s;
}

.edit-avatar-upload:hover {
  border-color: var(--accent);
}

.upload-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  color: var(--text);
  opacity: 0.8;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-item label {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-h);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-item input, .form-item textarea {
  background: var(--surface-3);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text-h);
  font-size: 13px;
  padding: 8px 12px;
  font-family: var(--font);
  transition: border-color 0.2s;
}

.form-item input:focus, .form-item textarea:focus {
  border-color: var(--accent);
  outline: none;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-btn, .save-btn {
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text);
}

.cancel-btn:hover {
  border-color: var(--text-h);
  background-color: var(--surface-2);
}

.save-btn {
  background: var(--accent);
  border: none;
  color: #ffffff;
}

.save-btn:hover {
  background: var(--accent-hover);
  transform: scale(1.03);
}

:deep(.el-dialog) {
  background: var(--surface-2) !important;
  border: 1px solid var(--border) !important;
  border-radius: 8px !important;
}

:deep(.el-dialog__title) {
  color: var(--text-h) !important;
  font-size: 16px !important;
  font-weight: 700 !important;
}

:deep(.el-dialog__body) {
  padding: 16px 20px !important;
}

.dark-dropdown {
  background-color: var(--surface-2) !important;
  border: 1px solid var(--border) !important;
}

.dark-dropdown :deep(.el-dropdown-menu__item) {
  color: var(--text-h) !important;
}

.dark-dropdown :deep(.el-dropdown-menu__item:hover) {
  background-color: var(--surface-3) !important;
}
.page-loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  color: var(--text-secondary);
  background-color: var(--bg-primary);
  font-size: 14px;
}
.page-loading-state .spinner {
  margin-bottom: 12px;
}
</style>
