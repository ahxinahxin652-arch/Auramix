<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '../stores/player.js'
import { useLibraryStore } from '../stores/library'
import AddPlaylistIcon from '../components/AddPlaylistIcon.vue'

const router = useRouter()
const player = usePlayerStore()
const globalLibraryStore = useLibraryStore()

const tracks = ref([])
const isLoading = ref(false)
const loadError = ref('')

onMounted(async () => {
  await loadDailyRecommend()
})

async function loadDailyRecommend() {
  isLoading.value = true
  loadError.value = ''
  try {
    const res = await window.electronAPI.fetchDailyRecommend()
    if (res.success && Array.isArray(res.data)) {
      tracks.value = res.data.map(t => ({
        id: String(t.trackId),
        trackId: String(t.trackId),
        title: t.title || '',
        name: t.title || '',
        artist: (t.artists || []).map(a => a.name).join(' / '),
        artists: t.artists || [],
        album: t.albumTitle || '',
        cover: t.coverUrl || '',
        coverUrl: t.coverUrl || '',
        duration: t.duration || 0,
        path: t.audioUrl || '',
        audioUrl: t.audioUrl || '',
        member: t.member ?? 0,
      }))
    } else {
      loadError.value = res.message || '加载每日推荐失败'
    }
  } catch (e) {
    console.error('加载每日推荐失败:', e)
    loadError.value = '网络错误，请稍后重试'
  } finally {
    isLoading.value = false
  }
}

// 总时长统计
const totalDurationStr = computed(() => {
  const totalSeconds = tracks.value.reduce((sum, t) => sum + (t.duration || 0), 0)
  if (totalSeconds <= 0) return '0 首歌曲'
  const count = tracks.value.length
  const minutes = Math.floor(totalSeconds / 60)
  if (minutes < 60) {
    return `${count} 首歌曲，${minutes} 分钟`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return `${count} 首歌曲，约 ${hours} 小时 ${remainingMinutes} 分钟`
})

// 格式化时长
function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

// 播放次数（模拟）
function getPlayCount(trackTitle) {
  if (!trackTitle) return 0
  let hash = 0
  for (let i = 0; i < trackTitle.length; i++) {
    hash = trackTitle.charCodeAt(i) + ((hash << 5) - hash)
  }
  const seed = Math.abs(hash)
  const count = (seed % 1000000) + 12000
  return count.toLocaleString()
}

// 解析歌手列表
function parseArtists(track) {
  if (track.artistNames && track.artistIds) {
    return track.artistNames.map((name, i) => ({ id: track.artistIds[i], name }))
  }
  if (!track.artists) return []
  if (Array.isArray(track.artists)) return track.artists
  try {
    return JSON.parse(track.artists)
  } catch (e) {
    return []
  }
}

// 是否正在播放此列表
const isListPlaying = computed(() => {
  if (!player.currentTrack || !player.isPlaying) return false
  if (player.playbackSource?.type === 'recommend') return true
  return false
})

// 播放全部
function playAllTracks() {
  if (tracks.value.length === 0) return
  const source = { type: 'recommend', id: 'daily', name: '每日推荐', route: '/daily' }
  player.setPlaylist(tracks.value, 0)
  window.dispatchEvent(new CustomEvent('play-track', {
    detail: {
      track: tracks.value[0],
      playlist: tracks.value,
      index: 0,
      source
    }
  }))
}

function togglePlayAll() {
  if (tracks.value.length === 0) return
  if (isListPlaying.value) {
    window.dispatchEvent(new CustomEvent('toggle-play'))
  } else {
    playAllTracks()
  }
}

// 播放单曲
function playIndividualTrack(track, index) {
  const source = { type: 'recommend', id: 'daily', name: '每日推荐', route: '/daily' }
  if (isTrackActive(track.id)) {
    window.dispatchEvent(new CustomEvent('toggle-play'))
  } else {
    player.setPlaylist(tracks.value, index)
    window.dispatchEvent(new CustomEvent('play-track', {
      detail: { track, playlist: tracks.value, index, source }
    }))
  }
}

function isTrackActive(trackId) {
  if (!player.currentTrack || player.currentTrack.id !== trackId) return false
  if (player.playbackSource?.type === 'recommend') return true
  return false
}

function isTrackPlaying(trackId) {
  return isTrackActive(trackId) && player.isPlaying
}

function goToArtist(artistId) {
  if (artistId) {
    router.push(`/artist/${artistId}`)
  }
}

function goBack() {
  router.back()
}
</script>

<template>
  <div class="daily-recommend-view">
    <div v-if="isLoading" class="page-loading-state">
      <div class="spinner"></div>
      <span>加载中...</span>
    </div>

    <div v-else-if="loadError" class="page-error-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <p>{{ loadError }}</p>
      <button class="retry-btn" @click="loadDailyRecommend">重新加载</button>
    </div>

    <template v-else>
      <!-- 顶部横幅 -->
      <div class="daily-banner">
        <div class="daily-header">
          <!-- 封面占位 -->
          <div class="daily-cover">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" style="color: #4ade80;">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <line x1="3" y1="9" x2="21" y2="9"/>
              <line x1="9" y1="21" x2="9" y2="9"/>
            </svg>
          </div>

          <!-- 详细文本 -->
          <div class="daily-text-details">
            <span class="daily-label">智能推荐</span>
            <h1 class="daily-title">每日推荐</h1>
            <div class="daily-meta">
              <span class="daily-date">{{ new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }) }}</span>
              <span class="meta-dot">•</span>
              <span class="daily-duration">{{ totalDurationStr }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部操作区与曲目列表 -->
      <div class="daily-content">
        <!-- Controls Bar -->
        <div class="controls-bar">
          <button class="circle-play-btn" @click="togglePlayAll" :title="isListPlaying ? '暂停' : '播放全部'">
            <svg v-if="isListPlaying" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
            <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>

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


        </div>

        <!-- 歌曲表格 -->
        <div class="tracks-table" v-if="tracks.length > 0">
          <div class="table-header">
            <span class="col-index">#</span>
            <span class="col-title">标题</span>
            <span class="col-artist">歌手</span>
            <span class="col-album">专辑</span>
            <span class="col-duration">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </span>
          </div>
          <div class="table-body">
            <div
              v-for="(track, idx) in tracks"
              :key="track.id"
              class="track-row"
              :class="{ active: isTrackActive(track.id) }"
              @dblclick="playIndividualTrack(track, idx)"
            >
              <!-- 序号 -->
              <span class="col-index">
                <span class="row-num" v-if="!isTrackActive(track.id)">{{ idx + 1 }}</span>
                <button class="row-play-btn" @click.stop="playIndividualTrack(track, idx)" v-else-if="!isTrackPlaying(track.id)">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
                <button class="row-play-btn" @click.stop="playIndividualTrack(track, idx)" v-else>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="5" y="4" width="3" height="16" />
                    <rect x="16" y="4" width="3" height="16" />
                  </svg>
                </button>
                <span class="active-playing-indicator" v-if="isTrackActive(track.id)">
                  <span class="bar bar1" :class="{ pause: !player.isPlaying }"></span>
                  <span class="bar bar2" :class="{ pause: !player.isPlaying }"></span>
                  <span class="bar bar3" :class="{ pause: !player.isPlaying }"></span>
                </span>
              </span>

              <!-- 标题 -->
              <span class="col-title">
                <div class="title-details">
                  <div class="track-title-row">
                    <span class="track-title-text">{{ track.title }}</span>
                    <span v-if="track.member === 1" class="vip-badge-inline">VIP</span>
                  </div>
                </div>
              </span>

              <!-- 歌手 -->
              <span class="col-artist">
                <span class="artist-links">
                  <span v-for="(tArt, tIdx) in parseArtists(track)" :key="tArt.id || tIdx">
                    <span class="artist-link-small" @click.stop="goToArtist(tArt.id)">{{ tArt.name }}</span>
                    <span v-if="tIdx < parseArtists(track).length - 1">, </span>
                  </span>
                </span>
              </span>

              <!-- 专辑 -->
              <span class="col-album">
                <span class="album-text">{{ track.album }}</span>
              </span>

              <!-- 时长 -->
              <span class="col-duration">
                <button
                  class="add-to-playlist-btn"
                  :class="{ 'is-saved': globalLibraryStore.isSavedToAnyPlaylist(track.id) }"
                  @click.stop="globalLibraryStore.openSelector(track.id, $event.clientX, $event.clientY, {
                    title: track.title,
                    artist: track.artist,
                    album: track.album,
                    duration: track.duration,
                    coverUrl: track.coverUrl,
                  })"
                  title="添加到歌单"
                >
                  <AddPlaylistIcon :isSaved="globalLibraryStore.isSavedToAnyPlaylist(track.id)" />
                </button>
                {{ formatDuration(track.duration) }}
              </span>
            </div>
          </div>
        </div>

        <div v-else class="empty-state">
          <p>今天还没有推荐，明天再来看看吧</p>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.daily-recommend-view {
  min-height: 100%;
  background-color: var(--bg);
  color: var(--text-h);
  font-family: var(--font, sans-serif);
}

/* 加载状态 */
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
  width: 32px;
  height: 32px;
  border: 3px solid rgba(124, 92, 255, 0.2);
  border-top-color: #7c5cff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 错误状态 */
.page-error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  color: var(--text-secondary);
  gap: 16px;
}

.page-error-state p {
  font-size: 15px;
  color: var(--text);
}

.retry-btn {
  padding: 8px 24px;
  border-radius: 20px;
  background: var(--accent);
  border: none;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.retry-btn:hover {
  background: var(--accent-hover);
}

/* 顶部横幅 */
.daily-banner {
  background: linear-gradient(to bottom, rgba(74, 222, 128, 0.12) 0%, transparent 100%);
  padding: 24px 32px 32px 32px;
  min-height: 260px;
  display: flex;
  align-items: flex-end;
}

.daily-header {
  display: flex;
  align-items: flex-end;
  gap: 24px;
  width: 100%;
}

.daily-cover {
  width: 232px;
  height: 232px;
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(74, 222, 128, 0.2), rgba(74, 222, 128, 0.05));
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
  flex-shrink: 0;
}

.daily-text-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.daily-label {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #4ade80;
}

.daily-title {
  font-size: 64px;
  font-weight: 900;
  margin: 0;
  line-height: 1.1;
  letter-spacing: -2px;
  word-break: break-word;
  background: linear-gradient(135deg, #4ade80, #22c55e);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.daily-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
}

.meta-dot {
  color: var(--text);
  opacity: 0.6;
}

.daily-date, .daily-duration {
  color: var(--text);
  opacity: 0.8;
}

/* 底部内容 */
.daily-content {
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.2) 0%, var(--bg) 200px);
  padding: 24px 32px;
}

.controls-bar {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 24px;
}

.circle-play-btn {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: #4ade80;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #000;
  cursor: pointer;
  transition: transform 0.2s, background-color 0.2s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.circle-play-btn:hover {
  background-color: #22c55e;
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
  color: #4ade80;
  opacity: 1;
}

/* 表格 */
.tracks-table {
  display: flex;
  flex-direction: column;
}

.table-header {
  display: grid;
  grid-template-columns: 48px 3fr 2fr 2fr 80px;
  padding: 8px 16px;
  border-bottom: 1px solid var(--border);
  color: var(--text);
  opacity: 0.8;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  align-items: center;
}

.table-body {
  display: flex;
  flex-direction: column;
  margin-top: 8px;
}

.track-row {
  display: grid;
  grid-template-columns: 48px 3fr 2fr 2fr 80px;
  padding: 10px 16px;
  border-radius: 6px;
  align-items: center;
  transition: background-color 0.2s;
  cursor: default;
}

.track-row:hover {
  background-color: var(--surface-2);
}

.track-row.active {
  background-color: rgba(74, 222, 128, 0.08);
}

.col-index {
  position: relative;
  display: flex;
  align-items: center;
  font-size: 14px;
  color: var(--text);
  opacity: 0.8;
  width: 24px;
}

.row-play-btn {
  display: none;
  background: transparent;
  border: none;
  color: var(--text-h);
  cursor: pointer;
  padding: 0;
  margin-left: 2px;
}

.track-row:hover .row-num {
  display: none;
}

.track-row:hover .row-play-btn {
  display: block;
}

.track-row.active .row-num {
  display: none;
}

.track-row.active .row-play-btn {
  display: block;
}

/* 绿音波 */
.active-playing-indicator {
  display: flex;
  align-items: flex-end;
  gap: 2.5px;
  height: 12px;
  width: 12px;
  margin-left: 1px;
}

.active-playing-indicator .bar {
  width: 2px;
  height: 100%;
  background-color: #4ade80;
  animation: bounce 0.8s ease infinite alternate;
}

.active-playing-indicator .bar1 { animation-delay: 0.1s; }
.active-playing-indicator .bar2 { animation-delay: 0.4s; }
.active-playing-indicator .bar3 { animation-delay: 0.2s; }

.active-playing-indicator .bar.pause {
  animation-play-state: paused;
  height: 3px;
}

@keyframes bounce {
  10% { height: 3px; }
  100% { height: 100%; }
}

.track-row.active .col-index {
  opacity: 1;
}

.col-index {
  min-width: 0;
}

.col-title {
  min-width: 0;
  overflow: hidden;
}

.col-artist {
  min-width: 0;
  overflow: hidden;
}

.col-album {
  min-width: 0;
  overflow: hidden;
  padding-right: 8px;
}

.col-duration {
  text-align: right;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding-right: 16px;
}

.title-details {
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
}

.track-title-row {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 6px;
}

.track-title-text {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-h);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.track-row.active .track-title-text {
  color: #4ade80;
}

.vip-badge-inline {
  display: inline-block;
  font-size: 10px;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 3px;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #000;
  flex-shrink: 0;
}

.artist-links {
  font-size: 13px;
  color: var(--text);
  opacity: 0.7;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.artist-link-small {
  cursor: pointer;
}

.artist-link-small:hover {
  color: var(--text-h);
  text-decoration: underline;
}

.album-text {
  font-size: 13px;
  color: var(--text);
  opacity: 0.7;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.add-to-playlist-btn {
  background: none;
  border: none;
  color: var(--text);
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s, color 0.2s, transform 0.2s;
  display: flex;
  align-items: center;
  padding: 4px;
}

.track-row:hover .add-to-playlist-btn {
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

.empty-state {
  text-align: center;
  color: var(--text);
  opacity: 0.6;
  font-size: 14px;
  padding: 60px 0;
}
</style>
