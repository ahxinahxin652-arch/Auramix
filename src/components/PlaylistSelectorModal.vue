<template>
  <Teleport to="body">
    <transition name="fade">
      <div v-if="visible" class="playlist-selector-overlay" @click.self="close">
        <transition name="pop">
          <div v-if="visible" class="playlist-selector-modal" :style="modalStyle" @click.stop>
            <div class="modal-header">
              <h4>Add to Playlist</h4>
              <button class="close-btn" @click="close">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>
            <div class="modal-content">
              <div v-if="libraryStore.playlists.length === 0" class="empty-state">
                No playlists available.
              </div>
              <div 
                v-for="playlist in libraryStore.playlists" 
                :key="playlist.id" 
                class="playlist-row"
                @click="togglePlaylist(playlist.id)"
              >
                <div class="checkbox" :class="{ checked: hasTrack(playlist) }">
                  <svg v-if="hasTrack(playlist)" viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                    <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                  </svg>
                </div>
                <div class="playlist-info">
                  <span class="playlist-name">{{ playlist.name }}</span>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import { useLibraryStore } from '../stores/library'

const props = defineProps({
  trackId: { type: [String, Number], required: true },
  visible: { type: Boolean, default: false },
  x: { type: Number, default: 0 },
  y: { type: Number, default: 0 }
})

const emit = defineEmits(['update:visible'])
const libraryStore = useLibraryStore()

const close = () => emit('update:visible', false)

const hasTrack = (playlist) => {
  return playlist.trackIds && playlist.trackIds.includes(String(props.trackId))
}

const togglePlaylist = async (playlistId) => {
  await libraryStore.toggleTrackInPlaylist(playlistId, props.trackId)
}

// 自动计算边界，防止溢出屏幕
const modalStyle = computed(() => {
  const modalWidth = 260
  const modalHeight = 350
  let top = props.y
  let left = props.x

  if (window.innerWidth && left + modalWidth > window.innerWidth) {
    left = window.innerWidth - modalWidth - 20
  }
  if (window.innerHeight && top + modalHeight > window.innerHeight) {
    top = window.innerHeight - modalHeight - 20
  }

  return { top: `${top}px`, left: `${left}px` }
})
</script>

<style scoped>
.playlist-selector-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 10000;
}

.playlist-selector-modal {
  position: absolute;
  width: 260px;
  max-height: 350px;
  background: rgba(30, 30, 30, 0.85);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.modal-header h4 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  letter-spacing: 0.5px;
}

.close-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 50%;
  padding: 4px;
  transition: all 0.2s ease;
}

.close-btn:hover { 
  background: rgba(255, 255, 255, 0.1);
  color: #fff; 
}

.modal-content {
  overflow-y: auto;
  padding: 8px 0;
}

.modal-content::-webkit-scrollbar {
  width: 6px;
}
.modal-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.empty-state {
  padding: 24px;
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
  font-size: 13px;
}

.playlist-row {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.playlist-row:hover {
  background: rgba(255, 255, 255, 0.08);
}

.checkbox {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-radius: 4px;
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: transparent;
  transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.checkbox.checked {
  background: #1db954;
  border-color: #1db954;
  color: #fff;
}

.playlist-name {
  color: #e0e0e0;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
}

/* Animations */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.pop-enter-active {
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.pop-leave-active {
  transition: all 0.2s ease;
}
.pop-enter-from {
  opacity: 0;
  transform: scale(0.9) translateY(10px);
}
.pop-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
