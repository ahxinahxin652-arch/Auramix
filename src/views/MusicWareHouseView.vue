<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { usePlayerStore } from '../stores/player.js'
import { useMusicLibraryStore } from '../stores/musicLibrary.js'
import { useLibraryStore } from '../stores/library'
import AddPlaylistIcon from '../components/AddPlaylistIcon.vue'

const router = useRouter()
const route = useRoute()
const player = usePlayerStore()
const library = useMusicLibraryStore()
const globalLibraryStore = useLibraryStore()

const libraryId = computed(() => route.params.id)  // 直接从路由获取稳定 UUID
const warehouseInfo = ref({ name: '', description: '', coverPath: '' })
const tracks = ref([])
const isLoading = ref(false)
const searchQuery = ref('')
const sortBy = ref('artist') // 'artist' | 'size' | 'modified'
const showSearch = ref(false)
const searchInputRef = ref(null)

function toggleSearch() {
  if (showSearch.value) {
    showSearch.value = false
    searchQuery.value = ''
  } else {
    showSearch.value = true
    nextTick(() => searchInputRef.value?.focus())
  }
}

function closeSearch() {
  showSearch.value = false
  searchQuery.value = ''
}

// ---- 关注歌单逻辑 ----
const isSubscribed = computed(() => {
  return globalLibraryStore.isSubscribedPlaylist(libraryId.value)
})

const computedIsOwner = computed(() => {
  if (warehouseInfo.value.isOwner !== undefined) return warehouseInfo.value.isOwner
  return globalLibraryStore.playlists.some(p => String(p.id) === String(libraryId.value))
})

async function handleToggleSubscribe() {
  if (!warehouseInfo.value) return
  await globalLibraryStore.toggleSubscribePlaylist({
    id: libraryId.value,
    name: warehouseInfo.value.name,
    coverUrl: warehouseInfo.value.coverUrl || warehouseInfo.value.coverPath || ''
  })
}

// ---- 编辑歌曲弹窗状态 ----
const showEditTrackDialog = ref(false)
const editTrackTitle = ref('')
const editTrackArtist = ref('')
const editTrackAlbum = ref('')
const editTrackLoading = ref(false)
const editingTrack = ref(null)

// ---- 编辑音乐库弹窗状态 ----
const showEditDialog = ref(false)
const editName = ref('')
const editDescription = ref('')
const editCoverBase64 = ref('')
const editLoading = ref(false)
const editCoverHover = ref(false)
const coverInputRef = ref(null)
const ALLOWED_IMG_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/bmp']
const MIN_IMG_SIZE = 600
const MAX_IMG_SIZE = 3000
const COMPRESS_SIZE = 1000



onMounted(async () => {
  await loadTracks()
  document.addEventListener('click', onWarehouseDocClick)
  window.addEventListener('playlist-updated', onPlaylistUpdated)
  window.addEventListener('playlist-track-toggled', onPlaylistTrackToggled)
})

onUnmounted(() => {
  document.removeEventListener('click', onWarehouseDocClick)
  window.removeEventListener('playlist-updated', onPlaylistUpdated)
  window.removeEventListener('playlist-track-toggled', onPlaylistTrackToggled)
})

function onPlaylistTrackToggled(e) {
  const { playlistId, trackId, hasTrack } = e.detail
  if (String(playlistId) === String(libraryId.value) && !hasTrack) {
    tracks.value = tracks.value.filter(t => String(t.id) !== String(trackId))
  }
}

// 侧边栏编辑保存后同步刷新当前歌单数据
function onPlaylistUpdated(e) {
  const updatedId = e.detail?.id
  if (updatedId && String(updatedId) === String(libraryId.value)) {
    loadTracks()
  }
}

// 监听路由参数变化，切换歌单时重新加载数据（同路由不同 param 不会 remount 组件）
watch(() => route.params.id, (newId, oldId) => {
  if (newId && newId !== oldId) {
    loadTracks()
  }
})

async function loadTracks() {
  isLoading.value = true
  try {
    if (!libraryId.value) {
      console.error('无法找到音乐库: libraryId 为空')
      return
    }

    // 统一调用获取远端歌单接口
    const result = await window.electronAPI.getRemotePlaylistDetail(libraryId.value)

    if (result.success && result.data) {
      const data = result.data
      
      // 映射新接口的数据字段以兼容原有的模板渲染
      tracks.value = (data.tracks || []).map(t => ({
        ...t,
        id: t.trackId || t.id,
        cover: t.coverUrl || t.cover,
        album: t.albumTitle || t.album,
        artist: (t.artists && Array.isArray(t.artists)) ? t.artists.map(a => a.name).join(', ') : t.artist,
        createdAt: t.addedAt || t.createdAt
      }))
      
      warehouseInfo.value = {
        id: libraryId.value,
        name: data.name,
        description: data.description,
        coverPath: data.coverUrl,
        coverUrl: data.coverUrl,
        isOwner: data.isOwner
      }
    }
  } catch (err) {
    console.error('加载曲目失败:', err)
  } finally {
    isLoading.value = false
  }
}

const filteredTracks = computed(() => {
  let list = [...tracks.value]
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(t => (t.name || t.title || '').toLowerCase().includes(q))
  }
  if (sortBy.value === 'artist') {
    list.sort((a, b) => (a.artist || '未知作者').localeCompare(b.artist || '未知作者'))
  } else if (sortBy.value === 'size') {
    list.sort((a, b) => (b.size || 0) - (a.size || 0))
  } else if (sortBy.value === 'modified') {
    list.sort((a, b) => (b.modified || 0) - (a.modified || 0))
  }
  return list
})

const totalDuration = computed(() => {
  const total = tracks.value.reduce((sum, t) => sum + (t.duration || 0), 0)
  if (total <= 0) return ''
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  if (hours > 0) return `约 ${hours} 小时 ${minutes} 分钟`
  return `约 ${minutes} 分钟`
})

function formatSize(bytes) {
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1024 / 1024).toFixed(2) + ' MB'
}

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '--:--'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}

function playTrack(track, index) {
  const source = { type: 'playlist', id: libraryId.value, name: warehouseInfo.value.name, route: `/warehouse/${libraryId.value}` }
  if (isCurrentTrack(track)) {
    window.dispatchEvent(new CustomEvent('toggle-play'))
  } else {
    player.setPlaylist(filteredTracks.value, index)
    window.dispatchEvent(new CustomEvent('play-track', {
      detail: { track, playlist: filteredTracks.value, index, source }
    }))
  }
}

function playAll() {
  if (filteredTracks.value.length === 0) return
  if (player.shuffle) {
    // 随机模式：随机选一首开始
    const list = [...filteredTracks.value]
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]]
    }
    player.setPlaylist(list, 0)
    const source = { type: 'playlist', id: libraryId.value, name: warehouseInfo.value.name, route: `/warehouse/${libraryId.value}` }
    window.dispatchEvent(new CustomEvent('play-track', {
      detail: { track: list[0], playlist: list, index: 0, source }
    }))
  } else {
    // 顺序模式：从第一首开始
    playTrack(filteredTracks.value[0], 0)
  }
}

function toggleShuffleMode() {
  player.toggleShuffle()
}

function handleDownload() {
  ElMessage.info('下载功能开发中')
}

// ---- 歌单菜单 ----
const showContextMenu = ref(false)
const contextMenuX = ref(0)
const contextMenuY = ref(0)

function openWarehouseMenu(e) {
  e.stopPropagation()
  const btn = e.currentTarget
  const rect = btn.getBoundingClientRect()
  contextMenuX.value = rect.left
  contextMenuY.value = rect.bottom + 4
  showContextMenu.value = true
}

function closeContextMenu() {
  showContextMenu.value = false
}

function handleWarehouseEdit() {
  closeContextMenu()
  openEditDialog()
}

async function handleWarehouseDelete() {
  closeContextMenu()
  try {
    await ElMessageBox.confirm(
      `确定删除歌单「${warehouseInfo.value.name || ''}」？删除后不可恢复。`,
      '删除歌单',
      { confirmButtonText: '删除', cancelButtonText: '取消', type: 'warning' }
    )
    const ok = await library.deleteWarehouse(libraryId.value)
    if (ok) {
      ElMessage.success('已删除')
      router.push('/')
    } else {
      ElMessage.error('删除失败')
    }
  } catch (_) {
    // 用户取消
  }
}

function onWarehouseDocClick() {
  if (showContextMenu.value) {
    closeContextMenu()
  }
}

function isCurrentTrack(track) {
  return player.currentTrack && String(player.currentTrack.id) === String(track.id) && player.playbackSource?.type === 'playlist' && String(player.playbackSource?.id) === String(libraryId.value)
}

async function handleFileDrop(e) {
  e.preventDefault()
  const files = Array.from(e.dataTransfer.files)
  const filePaths = files.map(f => f.path)
  if (!libraryId.value) return
  const result = await window.electronAPI.importFilesToWarehouseById(libraryId.value, filePaths)
  // 导入成功后仍需重载（因为服务端会解析元数据生成新 track 记录）
  if (result.success) {
    await loadTracks()
  }
}

async function handleAddFiles() {
  const filePaths = await window.electronAPI.selectMusicFiles()
  if (filePaths && filePaths.length > 0 && libraryId.value) {
    const result = await window.electronAPI.importFilesToWarehouseById(libraryId.value, filePaths)
    if (result.success) {
      await loadTracks()
    }
  }
}

// ========== 编辑弹窗 ==========
function openEditDialog() {
  editName.value = warehouseInfo.value.name || ''
  editDescription.value = warehouseInfo.value.description || ''
  editCoverBase64.value = warehouseInfo.value.coverUrl || warehouseInfo.value.coverPath || ''
  editCoverHover.value = false
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
    editCoverBase64.value = base64
  } catch (err) {
    ElMessage.error(err.message || '图片处理失败')
  }
  e.target.value = ''
}

function removeCover() {
  editCoverBase64.value = ''
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
  const newName = editName.value.trim()
  if (!newName) {
    ElMessage.warning('音乐库名称不能为空')
    return
  }
  if (newName.length > 30) {
    ElMessage.warning('音乐库名称不能超过 30 个字符')
    return
  }
  if (editDescription.value.length > 100) {
    ElMessage.warning('描述不能超过 100 个字符')
    return
  }
  editLoading.value = true

  const currentName = warehouseInfo.value.name
  const currentCover = warehouseInfo.value.coverUrl || warehouseInfo.value.coverPath || ''
  const coverChanged = editCoverBase64.value !== currentCover

  // 构建保存选项
  const saveOptions = {}
  if (newName !== currentName) saveOptions.name = newName
  if ((editDescription.value.trim() || '') !== (warehouseInfo.value.description || '')) {
    saveOptions.description = editDescription.value.trim()
  }

  if (coverChanged) {
    if (editCoverBase64.value) {
      saveOptions.coverBase64 = editCoverBase64.value
      saveOptions.coverFilename = 'cover.jpg'
    } else {
      saveOptions.clearCover = true
    }
  }

  if (Object.keys(saveOptions).length === 0) {
    showEditDialog.value = false
    editLoading.value = false
    return
  }

  const result = await library.saveWarehouse(libraryId.value, saveOptions)
  editLoading.value = false

  if (result.success) {
    // 更新本地 warehouseInfo
    if (saveOptions.name) warehouseInfo.value.name = saveOptions.name
    if (saveOptions.description !== undefined) warehouseInfo.value.description = saveOptions.description
    if (result.data && result.data.coverUrl) {
      warehouseInfo.value.coverPath = result.data.coverUrl
      warehouseInfo.value.coverUrl = result.data.coverUrl
    } else if (saveOptions.clearCover) {
      warehouseInfo.value.coverPath = ''
      warehouseInfo.value.coverUrl = ''
    }

    showEditDialog.value = false
    ElMessage.success('保存成功')
    library.loadWarehouses()
  } else {
    ElMessage.error(result.error || '保存失败')
  }
}

// ========== 编辑/删除曲目 ==========
function handleTrackAction(cmd, track) {
  if (cmd === 'remove') {
    globalLibraryStore.toggleTrackInPlaylist(libraryId.value, track.id).then(() => {
      tracks.value = tracks.value.filter(t => String(t.id) !== String(track.id))
      ElMessage.success('已从歌单移除')
    })
  } else if (cmd === 'edit') {
    router.push(`/edit?path=${encodeURIComponent(track.path)}`)
  } else if (cmd === 'delete') {
    ElMessageBox.confirm(`确定要删除「${track.title || track.name}」吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }).then(async () => {
      const result = await window.electronAPI.deleteTrack(track.id)
      if (result.success) {
        ElMessage.success('删除成功')
        // 直接从界面移除，不重载
        tracks.value = tracks.value.filter(t => t.id !== track.id)
        // 通知 FootBar 处理播放状态
        window.dispatchEvent(new CustomEvent('track-deleted', {
          detail: { trackId: track.id },
        }))
      } else {
        ElMessage.error(result.error || '删除失败')
      }
    }).catch(() => {})
  }
}

async function handleSaveTrackEdit() {
  const title = editTrackTitle.value.trim()
  if (!title) {
    ElMessage.warning('歌曲名称不能为空')
    return
  }
  editTrackLoading.value = true
  const result = await window.electronAPI.updateTrack(editingTrack.value.id, {
    title,
    artist: editTrackArtist.value.trim(),
    album: editTrackAlbum.value.trim(),
  })
  editTrackLoading.value = false
  if (result.success) {
    showEditTrackDialog.value = false
    ElMessage.success('保存成功')
    // 直接更新内存中的 track 数据，不重载
    const idx = tracks.value.findIndex(t => t.id === editingTrack.value.id)
    if (idx !== -1) {
      tracks.value[idx] = { ...tracks.value[idx], title, artist: editTrackArtist.value.trim(), album: editTrackAlbum.value.trim() }
    }
  } else {
    ElMessage.error(result.error || '保存失败')
  }
}

// ---- 导航与解析助手 ----
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
</script>

<template>
  <div class="warehouse-view">
    <div v-if="isLoading" class="page-loading-state">
      <div class="spinner"></div>
      <span>加载中...</span>
    </div>
    <template v-else>
    <!-- Spotify 风格 Hero 头部 -->
    <div class="warehouse-hero">
      <div class="hero-top-bar">
      </div>
      <div class="hero-content">
        <div class="hero-cover" @click="computedIsOwner !== false ? openEditDialog() : null" :style="{ cursor: computedIsOwner !== false ? 'pointer' : 'default' }" :title="computedIsOwner !== false ? '点击编辑封面' : ''">
          <img
            v-if="warehouseInfo.coverUrl || warehouseInfo.coverPath"
            :src="warehouseInfo.coverUrl || warehouseInfo.coverPath"
            class="hero-cover-img"
            alt=""
          />
          <div v-else class="hero-cover-placeholder">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
              <path d="M9 18V5l12-2v13"/>
              <circle cx="6" cy="18" r="3"/>
              <circle cx="18" cy="16" r="3"/>
            </svg>
          </div>
        </div>
        <div class="hero-info">
          <h1 class="hero-title" @click="computedIsOwner !== false ? openEditDialog() : null" :style="{ cursor: computedIsOwner !== false ? 'pointer' : 'default' }" :title="computedIsOwner !== false ? '点击编辑' : ''">{{ warehouseInfo.name }}</h1>
          <p
            v-if="warehouseInfo.description"
            class="hero-description"
            @click="computedIsOwner !== false ? openEditDialog() : null"
            :style="{ cursor: computedIsOwner !== false ? 'pointer' : 'default' }"
            :title="computedIsOwner !== false ? '点击编辑' : ''"
          >{{ warehouseInfo.description }}</p>
          <div class="hero-meta">
            <span class="meta-item">{{ tracks.length }} 首曲目</span>
            <span v-if="totalDuration" class="meta-separator">&middot;</span>
            <span v-if="totalDuration" class="meta-item">{{ totalDuration }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 操作栏：播放按钮 + 工具按钮 -->
    <div class="warehouse-actions">
      <div class="actions-left">
        <button class="play-btn-large" @click="playAll" :disabled="filteredTracks.length === 0" title="播放全部">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
        </button>
        <button
          class="action-btn shuffle-btn"
          :class="{ active: player.shuffle }"
          @click="toggleShuffleMode"
          :disabled="filteredTracks.length === 0"
          title="随机播放模式"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="16 3 21 3 21 8"/>
            <line x1="4" y1="20" x2="21" y2="3"/>
            <polyline points="21 16 21 21 16 21"/>
            <line x1="15" y1="15" x2="21" y2="21"/>
            <line x1="4" y1="4" x2="9" y2="9"/>
          </svg>
        </button>
        <button
          v-if="computedIsOwner === false"
          class="action-btn subscribe-btn"
          :class="{ active: isSubscribed }"
          @click="handleToggleSubscribe"
          :title="isSubscribed ? 'Remove from Your Library' : 'Save to Your Library'"
        >
          <svg v-if="isSubscribed" width="28" height="28" viewBox="0 0 24 24" fill="currentColor" color="var(--primary-color)">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
          <svg v-else width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
        <button
          class="action-btn"
          @click="handleDownload"
          title="下载"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
        </button>
        <button
          v-if="computedIsOwner !== false"
          class="action-btn"
          @click="openWarehouseMenu"
          title="更多选项"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="5" cy="12" r="2"/>
            <circle cx="12" cy="12" r="2"/>
            <circle cx="19" cy="12" r="2"/>
          </svg>
        </button>
      </div>
      <div class="actions-right">
        <div class="search-inline" :class="{ expanded: showSearch }">
          <div v-if="showSearch" class="search-inline-box">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              ref="searchInputRef"
              v-model="searchQuery"
              placeholder="搜索曲目..."
              @keydown.escape="closeSearch"
            />
            <button v-if="searchQuery" class="search-clear" @click="searchQuery = ''">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <button
            v-if="showSearch"
            class="action-btn"
            @click="closeSearch"
            title="关闭搜索"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          <button
            v-else
            class="action-btn"
            @click="toggleSearch"
            title="搜索"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>
        </div>
        <el-dropdown trigger="click" @command="(cmd) => sortBy = cmd" popper-class="warehouse-dropdown">
          <div class="custom-select-wrapper">
            <div class="sort-select-display">
              {{ sortBy === 'artist' ? '按作者' : (sortBy === 'size' ? '按大小' : '按修改时间') }}
            </div>
            <div class="select-arrow">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="artist" :class="{ 'is-active': sortBy === 'artist' }">按作者</el-dropdown-item>
              <el-dropdown-item command="size" :class="{ 'is-active': sortBy === 'size' }">按大小</el-dropdown-item>
              <el-dropdown-item command="modified" :class="{ 'is-active': sortBy === 'modified' }">按修改时间</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

      </div>
    </div>

    <!-- 曲目列表 -->
    <div
      class="track-list-container"
      @drop="warehouseInfo.isOwner !== false ? handleFileDrop($event) : null"
      @dragover.prevent
    >
      <div v-if="filteredTracks.length === 0" class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
          <path d="M9 18V5l12-2v13"/>
          <circle cx="6" cy="18" r="3"/>
          <circle cx="18" cy="16" r="3"/>
        </svg>
        <p>{{ searchQuery ? '未找到匹配的曲目' : '此音乐库为空，拖拽文件到此处添加曲目' }}</p>
      </div>

      <div v-else class="track-list-wrapper">
        <!-- 曲目表头 -->
        <div class="track-header">
          <span class="th-num">#</span>
          <span class="th-info">歌曲</span>
          <span class="th-album">专辑</span>
          <span class="th-date">添加时间</span>
          <span class="th-duration">时长</span>
          <span class="th-actions"></span>
        </div>
        <ul class="track-list">
          <li
            v-for="(track, index) in filteredTracks"
            :key="track.path"
            class="track-item"
            :class="{ active: isCurrentTrack(track), playing: isCurrentTrack(track) && player.isPlaying }"
          >
            <div class="track-num" @click="playTrack(track, index)">
              <span class="num-text">{{ index + 1 }}</span>
              <svg class="num-play" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              <svg class="num-pause" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16"/>
                <rect x="14" y="4" width="4" height="16"/>
              </svg>
              <div class="equalizer">
                <span></span><span></span><span></span>
              </div>
            </div>
            <div class="track-info-col" @click="playTrack(track, index)">
              <div class="track-cover-sm">
                <img v-if="track.cover" :src="track.cover" class="track-cover-img" alt="" />
                <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M9 18V5l12-2v13"/>
                  <circle cx="6" cy="18" r="3"/>
                  <circle cx="18" cy="16" r="3"/>
                </svg>
              </div>
              <div class="track-text">
                <div class="track-name-row">
                  <span class="track-name" :title="track.title || track.name">{{ track.title || track.name }}</span><span v-if="track.member === 1" class="vip-badge-inline">VIP</span>
                </div>
                <span class="track-artists-links">
                  <template v-if="parseArtists(track).length > 0">
                    <span v-for="(tArt, tIdx) in parseArtists(track)" :key="tArt.id || tIdx">
                      <span class="artist-link-small" @click.stop="goToArtist(tArt.id)">{{ tArt.name }}</span>
                      <span v-if="tIdx < parseArtists(track).length - 1">, </span>
                    </span>
                  </template>
                  <template v-else>
                    <span class="artist-text" :title="track.artist || '未知作者'">{{ track.artist || '未知作者' }}</span>
                  </template>
                </span>
              </div>
            </div>
            <div class="track-album" @click.stop="goToAlbum(track.albumId)" :title="track.album || '未知专辑'">
              <span class="album-link">{{ track.album || '未知专辑' }}</span>
            </div>
            <div class="track-date" @click="playTrack(track, index)">{{ formatDate(track.addedAt || track.createdAt) }}</div>
            <div class="track-duration" @click="playTrack(track, index)">
              <button 
                class="add-to-playlist-btn" 
                :class="{ 'is-saved': globalLibraryStore.isSavedToAnyPlaylist(track.id) }"
                @click.stop="globalLibraryStore.openSelector(track.id, $event.clientX, $event.clientY)" 
                title="添加到歌单"
              >
                <AddPlaylistIcon :isSaved="globalLibraryStore.isSavedToAnyPlaylist(track.id)" />
              </button>
              {{ track.duration ? formatTime(track.duration) : '' }}
            </div>
            <div class="track-actions">
              <el-dropdown trigger="click" @command="(cmd) => handleTrackAction(cmd, track)" popper-class="warehouse-dropdown">
                <button class="track-menu-btn" @click.stop>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="5" cy="12" r="2"/>
                    <circle cx="12" cy="12" r="2"/>
                    <circle cx="19" cy="12" r="2"/>
                  </svg>
                </button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="remove">移除该歌</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </li>
        </ul>
      </div>
    </div>
    </template>

    <!-- 编辑音乐库对话框 -->
    <div v-if="showEditDialog" class="dialog-overlay" @click.self="showEditDialog = false">
      <div class="dialog edit-dialog" @click.stop>
        <h3 class="dialog-title">编辑音乐库</h3>
        <button class="dialog-close-btn" @click="showEditDialog = false" title="关闭">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        <input
          ref="coverInputRef"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,image/bmp"
          @change="handleCoverUpload"
          style="display: none"
        />
        <div class="edit-body">
          <div
            class="edit-cover-area"
            @click="triggerCoverInput"
            @mouseenter="editCoverHover = true"
            @mouseleave="editCoverHover = false"
          >
            <img v-if="editCoverBase64" :src="editCoverBase64" class="edit-cover-img" alt="" />
            <div v-else class="edit-cover-empty">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M9 18V5l12-2v13"/>
                <circle cx="6" cy="18" r="3"/>
                <circle cx="18" cy="16" r="3"/>
              </svg>
              <span class="cover-add-text">选择图片</span>
            </div>
            <div v-if="editCoverBase64 && editCoverHover" class="edit-cover-overlay">
              <button class="cover-remove-btn" @click.stop="removeCover" title="移除封面">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
              <span class="cover-change-text">更换图片</span>
            </div>
          </div>
          <div class="edit-fields">
            <input
              v-model="editName"
              class="dialog-input edit-input"
              placeholder="音乐库名称"
              maxlength="30"
            />
            <input
              v-model="editDescription"
              class="dialog-input edit-input"
              placeholder="描述（可选）"
              maxlength="100"
            />
          </div>
        </div>
        <div class="edit-footer">
          <button class="btn btn-primary" @click="handleSaveEdit" :disabled="editLoading">
            {{ editLoading ? '保存中...' : '保存' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 编辑歌曲对话框 -->
    <div v-if="showEditTrackDialog" class="dialog-overlay" @click.self="showEditTrackDialog = false">
      <div class="dialog edit-track-dialog" @click.stop>
        <h3 class="dialog-title">编辑歌曲</h3>
        <div class="edit-track-body">
          <div class="edit-track-field">
            <label class="field-label">歌曲名称</label>
            <input
              v-model="editTrackTitle"
              class="dialog-input"
              placeholder="歌曲名称"
              maxlength="100"
            />
          </div>
          <div class="edit-track-field">
            <label class="field-label">艺术家</label>
            <input
              v-model="editTrackArtist"
              class="dialog-input"
              placeholder="艺术家（可选）"
              maxlength="100"
            />
          </div>
          <div class="edit-track-field">
            <label class="field-label">专辑</label>
            <input
              v-model="editTrackAlbum"
              class="dialog-input"
              placeholder="专辑（可选）"
              maxlength="100"
            />
          </div>
        </div>
        <div class="edit-footer">
          <button class="btn btn-secondary" @click="showEditTrackDialog = false" :disabled="editTrackLoading">
            取消
          </button>
          <button class="btn btn-primary" @click="handleSaveTrackEdit" :disabled="editTrackLoading">
            {{ editTrackLoading ? '保存中...' : '保存' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 歌单菜单 -->
    <Teleport to="body">
      <div
        v-if="showContextMenu"
        class="playlist-context-menu"
        :style="{ left: contextMenuX + 'px', top: contextMenuY + 'px' }"
        @click.stop
      >
        <div class="context-menu-item" @click="handleWarehouseEdit">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          <span>编辑</span>
        </div>
        <div class="context-menu-item delete" @click="handleWarehouseDelete">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
          <span>删除</span>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.track-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
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
.track-item:hover .add-to-playlist-btn {
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
</style>
