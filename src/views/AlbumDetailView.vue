<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { usePlayerStore } from '../stores/player.js'
import { useMusicLibraryStore } from '../stores/musicLibrary.js'

const router = useRouter()
const route = useRoute()
const player = usePlayerStore()
const library = useMusicLibraryStore()

const albumId = computed(() => route.params.id)
const albumInfo = ref({
  id: '',
  title: '加载中...',
  coverUrl: '',
  releaseDate: null,
  albumType: 'album',
  artists: []
})
const tracks = ref([])
const isLoading = ref(false)

// ---- 编辑专辑对话框状态 ----
const showEditDialog = ref(false)
const editTitle = ref('')
const editCoverUrl = ref('')
const editReleaseDate = ref('')
const editAlbumType = ref('album')
const editLoading = ref(false)
const editCoverHover = ref(false)
const coverInputRef = ref(null)

const ALLOWED_IMG_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/bmp']
const MIN_IMG_SIZE = 600
const MAX_IMG_SIZE = 3000
const COMPRESS_SIZE = 1000

onMounted(async () => {
  await loadAlbumData()
})

async function loadAlbumData() {
  if (!albumId.value) return
  isLoading.value = true
  try {
    const result = await window.electronAPI.getAlbumById(albumId.value)
    if (result.success && result.data && result.data.album) {
      const album = result.data.album
      albumInfo.value = {
        id: album.id,
        title: album.title,
        coverUrl: album.coverUrl || '',
        releaseDate: album.releaseDate,
        albumType: album.albumType || 'album',
        artists: album.artists || []
      }
      tracks.value = album.tracks || []
    } else {
      ElMessage.error('加载专辑失败: ' + (result.message || '未知错误'))
    }
  } catch (err) {
    console.error('加载专辑数据出错:', err)
    ElMessage.error('加载专辑数据出错')
  } finally {
    isLoading.value = false
  }
}

// 模拟每首歌的播放次数 (从歌名哈希生成稳定数据)
function getPlayCount(trackTitle) {
  if (!trackTitle) return 0
  let hash = 0
  for (let i = 0; i < trackTitle.length; i++) {
    hash = trackTitle.charCodeAt(i) + ((hash << 5) - hash)
  }
  const seed = Math.abs(hash)
  const count = (seed % 1000000) + 12000 // 12k - 1M
  return count.toLocaleString()
}

// 专辑发布年份
const releaseYear = computed(() => {
  if (!albumInfo.value.releaseDate) return ''
  const d = new Date(albumInfo.value.releaseDate)
  return isNaN(d.getTime()) ? '' : d.getFullYear()
})

// 专辑总时长
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

// 格式化单曲时长 (秒 -> m:ss)
function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

const isAlbumPlaying = computed(() => {
  if (!player.currentTrack || !player.isPlaying) return false
  return tracks.value.some(t => t.id === player.currentTrack.id)
})

function playAlbumTracks() {
  if (tracks.value.length === 0) return
  player.setPlaylist(tracks.value, 0)
  window.dispatchEvent(new CustomEvent('play-track', {
    detail: {
      track: tracks.value[0],
      playlist: tracks.value,
      index: 0
    }
  }))
}

function togglePlayAlbum() {
  if (tracks.value.length === 0) return
  if (isAlbumPlaying.value) {
    window.dispatchEvent(new CustomEvent('toggle-play'))
  } else {
    playAlbumTracks()
  }
}

function playIndividualTrack(track, index) {
  if (player.currentTrack && player.currentTrack.id === track.id) {
    window.dispatchEvent(new CustomEvent('toggle-play'))
  } else {
    player.setPlaylist(tracks.value, index)
    window.dispatchEvent(new CustomEvent('play-track', {
      detail: {
        track,
        playlist: tracks.value,
        index
      }
    }))
  }
}

function isTrackActive(trackId) {
  return player.currentTrack && player.currentTrack.id === trackId
}

function isTrackPlaying(trackId) {
  return isTrackActive(trackId) && player.isPlaying
}

// ---- 导航 ----
function goToArtist(artistId) {
  if (artistId) {
    router.push(`/artist/${artistId}`)
  }
}

function goBack() {
  router.back()
}

// ---- 编辑功能 ----
function openEditDialog() {
  editTitle.value = albumInfo.value.title
  editCoverUrl.value = albumInfo.value.coverUrl
  if (albumInfo.value.releaseDate) {
    const d = new Date(albumInfo.value.releaseDate)
    editReleaseDate.value = isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0]
  } else {
    editReleaseDate.value = ''
  }
  editAlbumType.value = albumInfo.value.albumType
  showEditDialog.value = true
}

function triggerCoverInput() {
  coverInputRef.value?.click()
}

async function handleCoverUpload(e) {
  const file = e.target.files[0]
  if (!file) return
  if (!ALLOWED_IMG_TYPES.includes(file.type)) {
    ElMessage.error('不支持的图片格式，请选择 PNG/JPG/WEBP/GIF/BMP')
    e.target.value = ''
    return
  }
  try {
    const base64 = await resizeImage(file, COMPRESS_SIZE)
    editCoverUrl.value = base64
  } catch (err) {
    ElMessage.error(err.message || '图片处理失败')
  }
  e.target.value = ''
}

function removeCover() {
  editCoverUrl.value = ''
}

function resizeImage(file, maxPx) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (ev) => {
      const img = new Image()
      img.onload = () => {
        const { width, height } = img
        if (width < MIN_IMG_SIZE || height < MIN_IMG_SIZE) {
          ElMessage.warning(`图片分辨率过小，最小 ${MIN_IMG_SIZE}px x ${MIN_IMG_SIZE}px`)
          reject(new Error('图片分辨率过小'))
          return
        }
        let targetW = width
        let targetH = height
        if (targetW > MAX_IMG_SIZE || targetH > MAX_IMG_SIZE) {
          if (targetW > targetH) {
            targetH = Math.round((targetH / targetW) * MAX_IMG_SIZE)
            targetW = MAX_IMG_SIZE
          } else {
            targetW = Math.round((targetW / targetH) * MAX_IMG_SIZE)
            targetH = MAX_IMG_SIZE
          }
        } else if (targetW > maxPx || targetH > maxPx) {
          if (targetW > targetH) {
            targetH = Math.round((targetH / targetW) * maxPx)
            targetW = maxPx
          } else {
            targetW = Math.round((targetW / targetH) * maxPx)
            targetH = maxPx
          }
        }
        const canvas = document.createElement('canvas')
        canvas.width = targetW
        canvas.height = targetH
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, targetW, targetH)
        resolve(canvas.toDataURL('image/jpeg', 0.85))
      }
      img.onerror = () => reject(new Error('无法加载图片'))
      img.src = ev.target.result
    }
    reader.onerror = () => reject(new Error('读取文件失败'))
    reader.readAsDataURL(file)
  })
}

async function handleSaveEdit() {
  const title = editTitle.value.trim()
  if (!title) {
    ElMessage.warning('专辑名称不能为空')
    return
  }
  editLoading.value = true
  try {
    const updates = {
      title,
      coverUrl: editCoverUrl.value,
      releaseDate: editReleaseDate.value ? new Date(editReleaseDate.value) : null,
      albumType: editAlbumType.value
    }
    const result = await window.electronAPI.updateAlbum(albumInfo.value.id, updates)
    if (result.success) {
      ElMessage.success('专辑信息更新成功')
      showEditDialog.value = false
      await loadAlbumData()
      // 同时通知主页刷新
      await library.loadWarehouses()
    } else {
      ElMessage.error(result.error || '保存失败')
    }
  } catch (err) {
    console.error('更新专辑失败:', err)
    ElMessage.error('更新专辑失败')
  } finally {
    editLoading.value = false
  }
}
</script>

<template>
  <div class="album-detail-view" v-loading="isLoading">
    <!-- 顶部渐变横幅与信息区 -->
    <div class="album-banner">
      <!-- 隐藏的文件选择 input -->
      <input
        ref="coverInputRef"
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/bmp"
        @change="handleCoverUpload"
        style="display: none"
      />
      
      <div class="album-header">
        <!-- 专辑封面 -->
        <div class="album-cover" @click="openEditDialog" title="编辑专辑信息">
          <img v-if="albumInfo.coverUrl" :src="albumInfo.coverUrl" class="cover-img" alt="" />
          <div v-else class="cover-empty">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
              <path d="M9 18V5l12-2v13"/>
              <circle cx="6" cy="18" r="3"/>
              <circle cx="18" cy="16" r="3"/>
            </svg>
          </div>
          <div class="cover-hover-overlay">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 20h9"/>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
            <span>修改专辑</span>
          </div>
        </div>

        <!-- 详细文本 -->
        <div class="album-text-details">
          <span class="album-label">{{ albumInfo.albumType === 'single' ? '单曲' : '专辑' }}</span>
          <h1 class="album-title">{{ albumInfo.title }}</h1>
          <div class="album-meta">
            <!-- 歌手列表 -->
            <span class="album-artists">
              <span v-for="(art, idx) in albumInfo.artists" :key="art.id">
                <span class="artist-link" @click.stop="goToArtist(art.id)">{{ art.name }}</span>
                <span v-if="idx < albumInfo.artists.length - 1">, </span>
              </span>
            </span>
            <span class="meta-dot" v-if="releaseYear">•</span>
            <span class="album-year" v-if="releaseYear">{{ releaseYear }}</span>
            <span class="meta-dot">•</span>
            <span class="album-duration">{{ totalDurationStr }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部操作区与曲目列表 -->
    <div class="album-content">
      <!-- Controls Bar -->
      <div class="controls-bar">
        <!-- Play green circle button -->
        <button class="circle-play-btn" @click="togglePlayAlbum" :title="isAlbumPlaying ? '暂停' : '播放'">
          <svg v-if="isAlbumPlaying" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16" />
            <rect x="14" y="4" width="4" height="16" />
          </svg>
          <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
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

        <!-- Edit Album button -->
        <button class="edit-album-btn-outline" @click="openEditDialog">
          编辑专辑
        </button>

        <!-- More options ellipsis -->
        <el-dropdown trigger="click" @command="(cmd) => cmd === 'edit' ? openEditDialog() : null">
          <button class="options-ellipsis">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="5" cy="12" r="2"/>
              <circle cx="12" cy="12" r="2"/>
              <circle cx="19" cy="12" r="2"/>
            </svg>
          </button>
          <template #dropdown>
            <el-dropdown-menu class="dark-dropdown">
              <el-dropdown-item command="edit">编辑专辑信息</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>

      <!-- 歌曲列表表格 -->
      <div class="tracks-table">
        <div class="table-header">
          <span class="col-index">#</span>
          <span class="col-title">标题</span>
          <span class="col-plays">播放量</span>
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
            <!-- 序号 / 播放按钮 -->
            <span class="col-index">
              <span class="row-num" v-if="!isTrackActive(track.id)">{{ idx + 1 }}</span>
              <button class="row-play-btn" @click.stop="playIndividualTrack(track, idx)">
                <svg v-if="isTrackPlaying(track.id)" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="5" y="4" width="3" height="16" />
                  <rect x="16" y="4" width="3" height="16" />
                </svg>
                <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
              <!-- 播放激活绿音波 -->
              <span class="active-playing-indicator" v-if="isTrackActive(track.id)">
                <span class="bar bar1" :class="{ pause: !player.isPlaying }"></span>
                <span class="bar bar2" :class="{ pause: !player.isPlaying }"></span>
                <span class="bar bar3" :class="{ pause: !player.isPlaying }"></span>
              </span>
            </span>

            <!-- 歌曲标题与歌手 -->
            <span class="col-title">
              <div class="title-details">
                <span class="track-title-text">{{ track.title }}</span>
                <span class="track-artists-links">
                  <span v-for="(tArt, tIdx) in (track.artists ? JSON.parse(track.artists) : [])" :key="tArt.id">
                    <span class="artist-link-small" @click.stop="goToArtist(tArt.id)">{{ tArt.name }}</span>
                    <span v-if="tIdx < JSON.parse(track.artists).length - 1">, </span>
                  </span>
                </span>
              </div>
            </span>

            <!-- 模拟播放量 -->
            <span class="col-plays">{{ getPlayCount(track.title) }}</span>

            <!-- 歌曲时长 -->
            <span class="col-duration">{{ formatDuration(track.duration) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑专辑对话框 -->
    <div v-if="showEditDialog" class="dialog-overlay" @click.self="showEditDialog = false">
      <div class="dialog edit-dialog" @click.stop>
        <h3 class="dialog-title">编辑专辑信息</h3>
        
        <div class="edit-body">
          <!-- 左侧封面区域 -->
          <div
            class="edit-cover-area"
            @click="triggerCoverInput"
            @mouseenter="editCoverHover = true"
            @mouseleave="editCoverHover = false"
          >
            <img v-if="editCoverUrl" :src="editCoverUrl" class="edit-cover-img" alt="" />
            <div v-else class="edit-cover-empty">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M9 18V5l12-2v13"/>
                <circle cx="6" cy="18" r="3"/>
                <circle cx="18" cy="16" r="3"/>
              </svg>
              <span class="cover-add-text">选择图片</span>
            </div>
            <div v-if="editCoverUrl && editCoverHover" class="edit-cover-overlay">
              <button class="cover-remove-btn" @click.stop="removeCover" title="移除封面">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
              <span class="cover-change-text">更改封面</span>
            </div>
          </div>

          <!-- 右侧表单字段 -->
          <div class="edit-fields">
            <div class="form-item">
              <label>专辑名称</label>
              <input
                v-model="editTitle"
                class="dialog-input edit-input"
                placeholder="专辑名称"
                maxlength="50"
              />
            </div>
            
            <div class="form-item">
              <label>发布时间</label>
              <input
                type="date"
                v-model="editReleaseDate"
                class="dialog-input edit-input"
              />
            </div>
            
            <div class="form-item">
              <label>唱片类型</label>
              <select v-model="editAlbumType" class="dialog-select edit-input">
                <option value="album">专辑 (Album)</option>
                <option value="single">单曲 (Single)</option>
                <option value="ep">EP (Extended Play)</option>
                <option value="compilation">精选集 (Compilation)</option>
              </select>
            </div>
          </div>
        </div>

        <div class="edit-footer">
          <button class="btn btn-secondary" @click="showEditDialog = false" :disabled="editLoading">取消</button>
          <button class="btn btn-primary" @click="handleSaveEdit" :disabled="editLoading">
            {{ editLoading ? '保存中...' : '保存' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.album-detail-view {
  min-height: 100%;
  background-color: var(--bg);
  color: var(--text-h);
  font-family: var(--font, sans-serif);
}

/* 顶部横幅 */
.album-banner {
  background: linear-gradient(to bottom, var(--surface-2) 0%, transparent 100%);
  padding: 24px 32px 32px 32px;
  min-height: 280px;
  display: flex;
  align-items: flex-end;
}

.album-header {
  display: flex;
  align-items: flex-end;
  gap: 24px;
  width: 100%;
}

.album-cover {
  width: 232px;
  height: 232px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
  position: relative;
  cursor: pointer;
  flex-shrink: 0;
}

.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-empty {
  width: 100%;
  height: 100%;
  background-color: var(--surface);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text);
}

.cover-hover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s;
}

.album-cover:hover .cover-hover-overlay {
  opacity: 1;
}

.cover-hover-overlay span {
  font-size: 13px;
  font-weight: 700;
  color: #ffffff;
}

.album-text-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.album-label {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.album-title {
  font-size: 64px;
  font-weight: 900;
  margin: 0;
  line-height: 1.1;
  letter-spacing: -2px;
  word-break: break-word;
}

.album-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
}

.artist-link {
  font-weight: 700;
  cursor: pointer;
}

.artist-link:hover {
  text-decoration: underline;
}

.meta-dot {
  color: var(--text);
  opacity: 0.6;
}

.album-year, .album-duration {
  color: var(--text);
  opacity: 0.8;
}

/* 底部操作区与内容 */
.album-content {
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
  background-color: var(--accent);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  cursor: pointer;
  transition: transform 0.2s, background-color 0.2s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.circle-play-btn:hover {
  background-color: var(--accent-hover);
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

.edit-album-btn-outline {
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

.edit-album-btn-outline:hover {
  border-color: var(--accent);
  color: var(--text-h);
  transform: scale(1.04);
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

/* 曲目列表表格 */
.tracks-table {
  display: flex;
  flex-direction: column;
}

.table-header {
  display: grid;
  grid-template-columns: 48px 4fr 2fr 80px;
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

.col-plays {
  text-align: right;
  padding-right: 24px;
}

.col-duration {
  text-align: right;
  display: flex;
  justify-content: flex-end;
  padding-right: 16px;
}

.table-body {
  display: flex;
  flex-direction: column;
  margin-top: 8px;
}

.track-row {
  display: grid;
  grid-template-columns: 48px 4fr 2fr 80px;
  padding: 8px 16px; /* 减少4px的上下padding */
  border-radius: 6px;
  align-items: center;
  transition: background-color 0.2s;
  cursor: default;
}

.track-row:hover {
  background-color: var(--surface-2);
}

.track-row.active {
  background-color: var(--accent-dim);
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
  display: none;
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
  background-color: var(--accent);
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

.title-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
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
  color: var(--accent);
}

.track-artists-links {
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

/* 编辑专辑弹窗 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.dialog {
  background-color: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 8px;
  width: 540px;
  padding: 24px;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.dialog-title {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  color: var(--text-h);
}

.edit-body {
  display: flex;
  gap: 20px;
}

.edit-cover-area {
  width: 180px;
  height: 180px;
  border-radius: 6px;
  overflow: hidden;
  background-color: var(--surface);
  position: relative;
  cursor: pointer;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.edit-cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.edit-cover-empty {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--text);
}

.cover-add-text {
  font-size: 12px;
}

.edit-cover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.cover-change-text {
  font-size: 12px;
  font-weight: 700;
  color: #ffffff;
}

.cover-remove-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: transparent;
  border: none;
  color: var(--text);
  opacity: 0.6;
  cursor: pointer;
  padding: 0;
}

.cover-remove-btn:hover {
  color: var(--text-h);
  opacity: 1;
}

.edit-fields {
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex-grow: 1;
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

.edit-input {
  background: var(--surface-3);
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--text-h);
  font-size: 13px;
  padding: 10px 12px;
  font-family: inherit;
}

.edit-input:focus {
  outline: none;
  border-color: var(--accent);
}

.dialog-select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml;utf8,<svg fill='white' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/><path d='M0 0h24v24H0z' fill='none'/></svg>");
  background-repeat: no-repeat;
  background-position: right 8px center;
  padding-right: 32px;
}

.edit-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
}

.btn {
  padding: 10px 24px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text);
}

.btn-secondary:hover {
  border-color: var(--text-h);
  background-color: var(--surface-2);
}

.btn-primary {
  background: var(--accent);
  border: none;
  color: #ffffff;
}

.btn-primary:hover {
  background: var(--accent-hover);
  transform: scale(1.03);
}

.btn-primary:active {
  transform: scale(0.98);
}
</style>
