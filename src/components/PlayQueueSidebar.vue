<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '../stores/player.js'
import { useLocalStorageStore } from '../stores/localStorage'

const emit = defineEmits(['close'])

const player = usePlayerStore()
const router = useRouter()
const localStorageStore = useLocalStorageStore()

const activeTab = ref('queue') // 'queue' | 'history'

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
</script>

<template>
  <div class="play-queue-sidebar">
    <div class="queue-header">
      <div class="tabs">
        <button class="tab-btn" :class="{ active: activeTab === 'queue' }" @click="activeTab = 'queue'">Queue</button>
        <button class="tab-btn" :class="{ active: activeTab === 'history' }" @click="activeTab = 'history'">Recently played</button>
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
          <div class="track-name">{{ currentTrack.title || currentTrack.name }}</div>
          <div class="track-artist">{{ currentTrack.artist }}</div>
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
          <div class="track-index">{{ index + 1 }}</div>
          <img v-if="t.cover" :src="t.cover" class="track-cover" />
          <div v-else class="track-cover-placeholder">
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M9 18V5l12-2v13"></path>
              <circle cx="6" cy="18" r="3"></circle>
              <circle cx="18" cy="16" r="3"></circle>
            </svg>
          </div>
          <div class="track-info">
            <div class="track-name">{{ t.title || t.name }}</div>
            <div class="track-artist">{{ t.artist }}</div>
          </div>
          <div class="track-duration">{{ formatTime(t.duration) }}</div>
        </div>
      </div>
    </div>

    <div class="queue-content" v-if="activeTab === 'history'">
      <div v-if="historyTracks.length > 0" class="track-list">
      </div>
      <div v-else class="empty-state">
        <p>No recent tracks</p>
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
  align-items: center;
  padding: 8px 12px;
  margin: 0 -12px;
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

.track-index {
  width: 24px;
  font-size: 14px;
  color: #b3b3b3;
  text-align: right;
  margin-right: 12px;
}

.track-cover {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  object-fit: cover;
  flex-shrink: 0;
  margin-right: 12px;
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
  margin-right: 12px;
  color: #b3b3b3;
}

.track-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.track-name {
  font-size: 14px;
  color: #fff;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
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

.track-duration {
  font-size: 13px;
  color: #b3b3b3;
  margin-left: 12px;
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
</style>
