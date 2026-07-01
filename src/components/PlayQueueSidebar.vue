<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '../stores/player.js'
import { useLocalStorageStore } from '../stores/localStorage'
import { useLibraryStore } from '../stores/library'
import AddPlaylistIcon from './AddPlaylistIcon.vue'

const emit = defineEmits(['close'])

const player = usePlayerStore()
const router = useRouter()
const localStorageStore = useLocalStorageStore()
const libraryStore = useLibraryStore()

const activeTab = ref('queue') // 'queue' | 'history' | 'similar'

// 播放队列：当前播放
const currentTrack = computed(() => player.currentTrack)

// 接下来播放
const nextTracks = computed(() => {
  if (!player.currentPlaylist || player.currentPlaylist.length === 0) return []
  if (player.currentIndex < 0 || player.currentIndex >= player.currentPlaylist.length - 1) return []
  return player.currentPlaylist.slice(player.currentIndex + 1)
})

// 最近播放
const historyTracks = computed(() => {
  return [] // TODO: Integrate with backend history API or local history
})

// 相似推荐
const similarTracksList = computed(() => player.similarTracks || [])

// 推荐歌单（当相似曲目为空且当前来源非 similar 时展示）
const similarPlaylistsList = computed(() => player.similarPlaylists || [])

const showSimilarPlaylists = computed(() => {
  const sourceType = player.playbackSource?.type
  return similarTracksList.value.length === 0 && similarPlaylistsList.value.length > 0 && sourceType !== 'similar'
})

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function playQueueTrack(track, indexOffset) {
  const realIndex = player.currentIndex + 1 + indexOffset
  window.dispatchEvent(new CustomEvent('play-track', { 
    detail: { 
      track, 
      playlist: player.currentPlaylist, 
      index: realIndex,
      source: player.playbackSource
    } 
  }))
}

function playSimilarTrack(track, index) {
  window.dispatchEvent(new CustomEvent('play-track', { 
    detail: { 
      track, 
      playlist: similarTracksList.value, 
      index,
      source: { type: 'similar', name: '相似推荐' }
    } 
  }))
}

function addSimilarToPlaylist(track, event) {
  libraryStore.openSelector(track.id, event.clientX, event.clientY)
}

function getArtistsArray(trackObj) {
  if (!trackObj) return []
  if (Array.isArray(trackObj.artists) && trackObj.artists.length > 0) return trackObj.artists;
  if (typeof trackObj.artists === 'string' && trackObj.artists.startsWith('[')) {
    try {
      const parsed = JSON.parse(trackObj.artists);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (e) {
      // ignore
    }
  }
  return [];
}

function goToArtist(artistId) {
  if (!artistId) return;
  router.push(`/artist/${artistId}`);
}

function goToPlaylist(playlistId) {
  if (!playlistId) return
  router.push(`/warehouse/${playlistId}`)
}

// 监听歌单曲目变更，刷新歌单数据以反映最新状态
function onPlaylistTrackToggled() {
  libraryStore.forceSync()
}

onMounted(() => {
  window.addEventListener('playlist-track-toggled', onPlaylistTrackToggled)
})

onUnmounted(() => {
  window.removeEventListener('playlist-track-toggled', onPlaylistTrackToggled)
})
</script>

<template>
  <div class="play-queue-sidebar">
    <div class="queue-header">
      <div class="tabs">
        <button class="tab-btn" :class="{ active: activeTab === 'queue' }" @click="activeTab = 'queue'">Queue</button>
        <button class="tab-btn" :class="{ active: activeTab === 'history' }" @click="activeTab = 'history'">Recently played</button>
        <button class="tab-btn" :class="{ active: activeTab === 'similar' }" @click="activeTab = 'similar'">Similar</button>
      </div>
      <button class="btn-sidebar-close" @click="emit('close')" title="关闭">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>

    <div class="queue-content" v-if="activeTab === 'queue'">
      <div class="section-title">Now playing</div>
      <div class="track-item now-playing" v-if="currentTrack">
        <img v-if="currentTrack.cover" :src="currentTrack.cover" class="track-cover" />
        <div v-else class="track-cover-placeholder">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M9 18V5l12-2v13"></path>
            <circle cx="6" cy="18" r="3"></circle>
            <circle cx="18" cy="16" r="3"></circle>
          </svg>
        </div>
        <div class="track-info">
          <div class="track-name">{{ currentTrack.title || currentTrack.name }}<span v-if="currentTrack.member === 1" class="vip-badge-inline">VIP</span></div>
          <div class="track-artist">
            <template v-if="getArtistsArray(currentTrack).length > 0">
              <span v-for="(a, aIdx) in getArtistsArray(currentTrack)" :key="a.id">
                <span class="hover-artist" @click.stop="goToArtist(a.id)">{{ a.name }}</span>
                <span v-if="aIdx < getArtistsArray(currentTrack).length - 1">, </span>
              </span>
            </template>
            <template v-else>
              <span>{{ currentTrack.artist }}</span>
            </template>
          </div>
        </div>
        <div class="playing-indicator">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16"></rect>
            <rect x="14" y="4" width="4" height="16"></rect>
          </svg>
        </div>
      </div>

      <div class="section-title next-up-title" v-if="nextTracks.length > 0">Next up</div>
      <div class="track-list" v-if="nextTracks.length > 0">
        <div class="track-item" v-for="(t, index) in nextTracks" :key="t.id + '-' + index" @dblclick="playQueueTrack(t, index)">
          <img v-if="t.cover" :src="t.cover" class="track-cover" />
          <div v-else class="track-cover-placeholder">
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M9 18V5l12-2v13"></path>
              <circle cx="6" cy="18" r="3"></circle>
              <circle cx="18" cy="16" r="3"></circle>
            </svg>
          </div>
          <div class="track-info">
            <div class="track-name">{{ t.title || t.name }}<span v-if="t.member === 1" class="vip-badge-inline">VIP</span></div>
            <div class="track-artist">
              <template v-if="getArtistsArray(t).length > 0">
                <span v-for="(a, aIdx) in getArtistsArray(t)" :key="a.id">
                  <span class="hover-artist" @click.stop="goToArtist(a.id)">{{ a.name }}</span>
                  <span v-if="aIdx < getArtistsArray(t).length - 1">, </span>
                </span>
              </template>
              <template v-else>
                <span>{{ t.artist }}</span>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="queue-content" v-if="activeTab === 'history'">
      <div v-if="historyTracks.length > 0" class="track-list">
        <div class="track-item" v-for="(t, index) in historyTracks" :key="t.id + '-' + index" @dblclick="playQueueTrack(t, index)">
          <img v-if="t.cover" :src="t.cover" class="track-cover" />
          <div v-else class="track-cover-placeholder">
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M9 18V5l12-2v13"></path>
              <circle cx="6" cy="18" r="3"></circle>
              <circle cx="18" cy="16" r="3"></circle>
            </svg>
          </div>
          <div class="track-info">
            <div class="track-name">{{ t.title || t.name }}<span v-if="t.member === 1" class="vip-badge-inline">VIP</span></div>
            <div class="track-artist">
              <template v-if="getArtistsArray(t).length > 0">
                <span v-for="(a, aIdx) in getArtistsArray(t)" :key="a.id">
                  <span class="hover-artist" @click.stop="goToArtist(a.id)">{{ a.name }}</span>
                  <span v-if="aIdx < getArtistsArray(t).length - 1">, </span>
                </span>
              </template>
              <template v-else>
                <span>{{ t.artist }}</span>
              </template>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="empty-state">
        <p>No recent tracks</p>
      </div>
    </div>

    <div class="queue-content" v-if="activeTab === 'similar'">
      <div v-if="similarTracksList.length > 0" class="track-list">
        <div class="track-item similar-item" v-for="(t, index) in similarTracksList" :key="t.id + '-' + index" @dblclick="playSimilarTrack(t, index)">
          <img v-if="t.cover" :src="t.cover" class="track-cover" />
          <div v-else class="track-cover-placeholder">
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M9 18V5l12-2v13"></path>
              <circle cx="6" cy="18" r="3"></circle>
              <circle cx="18" cy="16" r="3"></circle>
            </svg>
          </div>
          <div class="track-info">
            <div class="track-name">{{ t.title || t.name }}<span v-if="t.member === 1" class="vip-badge-inline">VIP</span></div>
            <div class="track-artist">
              <template v-if="getArtistsArray(t).length > 0">
                <span v-for="(a, aIdx) in getArtistsArray(t)" :key="a.id">
                  <span class="hover-artist" @click.stop="goToArtist(a.id)">{{ a.name }}</span>
                  <span v-if="aIdx < getArtistsArray(t).length - 1">, </span>
                </span>
              </template>
              <template v-else>
                <span>{{ t.artist }}</span>
              </template>
            </div>
          </div>
          <button
            class="similar-playlist-btn"
            :class="{ 'is-saved': libraryStore.isSavedToAnyPlaylist(t.id) }"
            @click.stop="addSimilarToPlaylist(t, $event)"
            title="添加到歌单"
          >
            <AddPlaylistIcon :isSaved="libraryStore.isSavedToAnyPlaylist(t.id)" />
          </button>
        </div>
      </div>
      <div v-else-if="showSimilarPlaylists" class="playlist-list">
        <div class="section-title">推荐歌单</div>
        <div class="track-item playlist-item" v-for="pl in similarPlaylistsList" :key="pl.id" @click="goToPlaylist(pl.id)">
          <img v-if="pl.coverUrl" :src="pl.coverUrl" class="track-cover" />
          <div v-else class="track-cover-placeholder playlist-cover-placeholder">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M9 18V5l12-2v13"></path>
              <circle cx="6" cy="18" r="3"></circle>
              <circle cx="18" cy="16" r="3"></circle>
            </svg>
          </div>
          <div class="track-info">
            <div class="track-name">{{ pl.name }}</div>
            <div class="track-artist">{{ pl.trackCount || 0 }} 首曲目</div>
          </div>
        </div>
      </div>
      <div v-else class="empty-state">
        <p>No similar tracks</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.play-queue-sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
  color: #b3b3b3;
  background-color: #121212;
}

.queue-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px 8px;
  flex-shrink: 0;
}

.tabs {
  display: flex;
  gap: 16px;
}

.tab-btn {
  background: none;
  border: none;
  color: #b3b3b3;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  padding: 8px 0;
  transition: color 0.2s;
  position: relative;
}

.tab-btn:hover {
  color: #fff;
}

.tab-btn.active {
  color: #fff;
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #1db954;
  border-radius: 2px;
}

.btn-sidebar-close {
  background: rgba(0, 0, 0, 0.3);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #b3b3b3;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-sidebar-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  transform: scale(1.05);
}

.queue-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 16px 20px;
}

.queue-content::-webkit-scrollbar {
  width: 8px;
}
.queue-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}
.queue-content::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.4);
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 12px;
}

.next-up-title {
  margin-top: 32px;
}

.track-item {
  display: flex;
  padding: 8px 12px;
  width: 100%;
  margin: 0;
  box-sizing: border-box;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
  overflow: hidden;
}

.track-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.track-item:hover .track-name {
  color: #fff;
}


.track-cover {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  object-fit: cover;
  flex-shrink: 0;
}

.track-cover-placeholder {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  background: #282828;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #b3b3b3;
}

.track-info {
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 0;
}

.track-name {
  font-size: 14px;
  color: #fff;
  margin-bottom: 4px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-artist {
  font-size: 13px;
  color: #b3b3b3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.playing-indicator {
  color: #1db954;
}

.now-playing .track-name {
  color: #1db954;
}

.empty-state {
  text-align: center;
  color: #b3b3b3;
  font-size: 14px;
  padding: 40px 0;
}

.hover-artist {
  cursor: pointer;
}

.hover-artist:hover {
  text-decoration: underline;
  color: #fff;
}

.similar-item {
  position: relative;
}

.similar-playlist-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #b3b3b3;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s, color 0.2s, background-color 0.2s;
}

.similar-item:hover .similar-playlist-btn {
  opacity: 1;
}

.similar-playlist-btn:hover {
  color: #fff;
  background-color: rgba(255, 255, 255, 0.1);
}

.similar-playlist-btn.is-saved {
  opacity: 1;
  color: #9333ea;
}

.playlist-item {
  cursor: pointer;
}

.playlist-item:hover .track-name {
  color: #fff;
}

.playlist-cover-placeholder {
  background: linear-gradient(135deg, #1db954 0%, #1ed760 100%);
}
</style>
