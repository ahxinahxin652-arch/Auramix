<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useLeftSidebarStore } from '../stores/leftSidebar.js'
import { useMusicLibraryStore } from '../stores/musicLibrary.js'
import { useLibraryStore } from '../stores/library.js'
import { useUserStore } from '../stores/user.js'

const router = useRouter()
const route = useRoute()
const leftSidebarStore = useLeftSidebarStore()
const library = useMusicLibraryStore()
const globalLibraryStore = useLibraryStore()
const userStore = useUserStore()

// ---- 侧边栏 Tab 切换 ----
const currentTab = ref('Playlists') // 'Playlists' | 'Artists'


// ---- 拖拽状态 ----
const dragStartX = ref(0)
const dragStartWidth = ref(0)

// ---- 计算属性 ----
const isCollapsed = computed(() => leftSidebarStore.mode === 'collapsed')
const isExpanded = computed(() => leftSidebarStore.mode === 'expanded')
const sidebarStyle = computed(() => ({
  width: leftSidebarStore.width + 'px',
}))

// ---- 悬浮 tooltip（缩略模式）----
// position: fixed 突破 overflow: hidden 裁剪
const tooltip = ref(null) // { name, top, left }

function onCoverMouseEnter(pl, event) {
  const rect = event.currentTarget.querySelector('.playlist-cover-collapsed, .playlist-cover-placeholder')
  if (!rect) return
  const r = rect.getBoundingClientRect()
  tooltip.value = {
    name: pl.name,
    top: r.top + r.height / 2,
    left: r.right + 10,
  }
}

function onCoverMouseLeave() {
  tooltip.value = null
}

// ---- 新建歌单对话框 ----
const showCreateDialog = ref(false)
const newWarehouseName = ref('')
const isCreateLoading = ref(false)

async function handleCreateWarehouse() {
  const name = newWarehouseName.value.trim()
  if (!name) return
  isCreateLoading.value = true
  const result = await library.createWarehouse({ name })
  isCreateLoading.value = false
  if (result.success) {
    showCreateDialog.value = false
    newWarehouseName.value = ''
  } else {
    ElMessage.error(result.error || '创建失败')
  }
}

// ---- 编辑歌单对话框 ----
const showEditDialog = ref(false)
const editingWarehouse = ref(null)
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

function openEditDialog(wh) {
  editingWarehouse.value = wh
  editName.value = wh.name
  editDescription.value = wh.description || ''
  editCoverBase64.value = wh.coverUrl || wh.coverPath || ''
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
    ElMessage.warning('歌单名称不能为空')
    return
  }
  if (newName.length > 30) {
    ElMessage.warning('歌单名称不能超过 30 个字符')
    return
  }
  if (editDescription.value.length > 100) {
    ElMessage.warning('描述不能超过 100 个字符')
    return
  }
  editLoading.value = true

  const currentWh = editingWarehouse.value
  const currentCover = currentWh.coverUrl || currentWh.coverPath || ''
  const coverChanged = editCoverBase64.value !== currentCover

  const saveOptions = {}
  if (newName !== (currentWh.name || '')) saveOptions.name = newName
  if ((editDescription.value.trim() || '') !== (currentWh.description || '')) {
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

  const result = await library.saveWarehouse(currentWh.id, saveOptions)
  editLoading.value = false

  if (result.success) {
    showEditDialog.value = false
    ElMessage.success('保存成功')
    await library.loadWarehouses()
    // 通知歌单页面刷新数据
    window.dispatchEvent(new CustomEvent('playlist-updated', { detail: { id: currentWh.id } }))
  } else {
    ElMessage.error(result.error || '保存失败')
  }
}

// ---- 右键菜单 ----
const contextMenu = ref({ show: false, x: 0, y: 0, playlist: null })

function onPlaylistContextMenu(playlist, event) {
  event.preventDefault()
  contextMenu.value = {
    show: true,
    x: event.clientX,
    y: event.clientY,
    playlist,
  }
}

function closeContextMenu() {
  contextMenu.value = { show: false, x: 0, y: 0, playlist: null }
}

function handleContextEdit() {
  const pl = contextMenu.value.playlist
  closeContextMenu()
  if (pl) openEditDialog(pl)
}

async function handleContextDelete() {
  const pl = contextMenu.value.playlist
  closeContextMenu()
  if (!pl) return
  try {
    await ElMessageBox.confirm(
      `确定删除歌单「${pl.name}」？删除后不可恢复。`,
      '删除歌单',
      { confirmButtonText: '删除', cancelButtonText: '取消', type: 'warning' }
    )
    const ok = await library.deleteWarehouse(pl.id)
    if (ok) {
      ElMessage.success('已删除')
      // 如果当前正在该歌单页面，跳回首页
      if (route.params.id && String(route.params.id) === String(pl.id)) {
        router.push('/')
      }
    } else {
      ElMessage.error('删除失败')
    }
  } catch (_) {
    // 用户取消
  }
}

function onDocumentClick() {
  if (contextMenu.value.show) {
    closeContextMenu()
  }
}

// ---- 数据加载 ----
onMounted(() => {
  library.loadWarehouses()
  document.addEventListener('click', onDocumentClick)
})

// ========== 拖拽处理 ==========
function onHandleMouseDown(e) {
  e.preventDefault()
  dragStartX.value = e.clientX
  dragStartWidth.value = leftSidebarStore.width
  leftSidebarStore.startDrag()

  document.body.classList.add('left-sidebar-resizing')
  document.addEventListener('mousemove', onDragMouseMove)
  document.addEventListener('mouseup', onDragMouseUp)
}

function onDragMouseMove(e) {
  const delta = e.clientX - dragStartX.value
  const newWidth = dragStartWidth.value + delta
  leftSidebarStore.updateDragWidth(newWidth)

  // 跨阈值自动切换模式
  if (leftSidebarStore.mode === 'collapsed' && newWidth > leftSidebarStore.THRESHOLD) {
    leftSidebarStore.mode = 'expanded'
    leftSidebarStore.width = leftSidebarStore.EXPANDED_WIDTH
    dragStartWidth.value = leftSidebarStore.EXPANDED_WIDTH
    dragStartX.value = e.clientX
  } else if (leftSidebarStore.mode === 'expanded' && newWidth < leftSidebarStore.THRESHOLD) {
    leftSidebarStore.mode = 'collapsed'
    leftSidebarStore.width = leftSidebarStore.COLLAPSED_WIDTH
    dragStartWidth.value = leftSidebarStore.COLLAPSED_WIDTH
    dragStartX.value = e.clientX
  }
}

function onDragMouseUp(e) {
  document.body.classList.remove('left-sidebar-resizing')
  document.removeEventListener('mousemove', onDragMouseMove)
  document.removeEventListener('mouseup', onDragMouseUp)

  const delta = e.clientX - dragStartX.value
  const finalWidth = dragStartWidth.value + delta
  leftSidebarStore.endDrag(finalWidth)
}

onUnmounted(() => {
  document.removeEventListener('mousemove', onDragMouseMove)
  document.removeEventListener('mouseup', onDragMouseUp)
  document.body.classList.remove('left-sidebar-resizing')
  document.removeEventListener('click', onDocumentClick)
})

// ========== 按钮操作 ==========
function handleToggle() {
  leftSidebarStore.toggle()
}

function handleAdd() {
  showCreateDialog.value = true
}

function handlePlaylistClick(playlist) {
  library.setCurrentWarehouse(playlist)
  router.push(`/warehouse/${playlist.id}`)
}

// ========== 封面处理 ==========
function getCoverUrl(playlist) {
  return playlist.coverUrl || playlist.coverPath || ''
}

function getOwnerName(playlist) {
  if (playlist.ownerName || playlist.owner) return playlist.ownerName || playlist.owner
  if (userStore.profile && userStore.profile.displayName) return userStore.profile.displayName
  return '未知作者'
}

function handleArtistClick(artist) {
  router.push(`/artist/${artist.id}`)
}

</script>

<template>
  <aside
    class="left-sidebar"
    :class="{
      collapsed: isCollapsed,
      expanded: isExpanded,
      dragging: leftSidebarStore.isDragging,
    }"
    :style="sidebarStyle"
  >
    <!-- === 顶部操作区 === -->
    <div class="sidebar-top">
      <!-- 切换按钮 -->
      <button class="sidebar-toggle-btn" @click="handleToggle" :title="isCollapsed ? '展开歌单' : '收起歌单'">
        <!-- 缩略模式：展开图标（库图标） -->
        <svg v-if="isCollapsed" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          <line x1="10" y1="9" x2="16" y2="9"/>
          <line x1="10" y1="13" x2="14" y2="13"/>
        </svg>
        <!-- 展开模式：收起图标 -->
        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"/>
          <polyline points="12 19 5 12 12 5"/>
        </svg>
      </button>

      <!-- 展开模式下的标题 -->
      <span v-if="isExpanded" class="sidebar-title-text">你的歌单</span>

      <!-- 添加按钮 -->
      <button class="sidebar-add-btn" @click="handleAdd" title="新建歌单">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>
    </div>

    <!-- === 过滤标签 === -->
    <div v-if="isExpanded" class="sidebar-filters">
      <button class="filter-chip" :class="{ active: currentTab === 'Playlists' }" @click="currentTab = 'Playlists'">Playlists</button>
      <button class="filter-chip" :class="{ active: currentTab === 'Artists' }" @click="currentTab = 'Artists'">Artists</button>
    </div>

    <!-- === 列表区 === -->
    <div class="sidebar-playlists">
      <!-- 缩略模式 -->
      <template v-if="isCollapsed">
        <div
          v-for="pl in library.warehouses"
          :key="pl.id"
          class="playlist-item-collapsed"
          @click="handlePlaylistClick(pl)"
          @contextmenu="onPlaylistContextMenu(pl, $event)"
          @mouseenter="onCoverMouseEnter(pl, $event)"
          @mouseleave="onCoverMouseLeave"
        >
          <img
            v-if="getCoverUrl(pl)"
            :src="getCoverUrl(pl)"
            class="playlist-cover-collapsed"
            alt=""
          />
          <div v-else class="playlist-cover-placeholder">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M9 18V5l12-2v13"/>
              <circle cx="6" cy="18" r="3"/>
              <circle cx="18" cy="16" r="3"/>
            </svg>
          </div>
        </div>
        <div v-if="library.warehouses.length === 0" class="sidebar-empty-collapsed">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
            <path d="M9 18V5l12-2v13"/>
            <circle cx="6" cy="18" r="3"/>
            <circle cx="18" cy="16" r="3"/>
          </svg>
        </div>
      </template>

      <template v-if="isExpanded">
        <!-- 歌单列表 -->
        <template v-if="currentTab === 'Playlists'">
          <div
            v-for="pl in library.warehouses"
            :key="pl.id"
            class="playlist-item-expanded"
            @click="handlePlaylistClick(pl)"
            @contextmenu="onPlaylistContextMenu(pl, $event)"
          >
            <img
              v-if="getCoverUrl(pl)"
              :src="getCoverUrl(pl)"
              class="playlist-cover-expanded"
              alt=""
            />
            <div v-else class="playlist-cover-expanded-placeholder">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M9 18V5l12-2v13"/>
                <circle cx="6" cy="18" r="3"/>
                <circle cx="18" cy="16" r="3"/>
              </svg>
            </div>
            <div class="playlist-info">
              <span class="playlist-name">{{ pl.name }}</span>
              <span class="playlist-owner">{{ getOwnerName(pl) }}</span>
            </div>
          </div>
          <div v-if="library.warehouses.length === 0" class="sidebar-empty-expanded">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
              <path d="M9 18V5l12-2v13"/>
              <circle cx="6" cy="18" r="3"/>
              <circle cx="18" cy="16" r="3"/>
            </svg>
            <p>暂无歌单<br>点击 + 创建你的第一个歌单</p>
          </div>
        </template>

        <!-- 歌手列表 -->
        <template v-if="currentTab === 'Artists'">
          <div
            v-for="artist in globalLibraryStore.followedArtists"
            :key="artist.id"
            class="playlist-item-expanded"
            @click="handleArtistClick(artist)"
          >
            <img
              v-if="artist.coverImg"
              :src="artist.coverImg"
              class="playlist-cover-expanded artist-avatar"
              alt=""
            />
            <div v-else class="playlist-cover-expanded-placeholder artist-avatar-placeholder">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div class="playlist-info">
              <span class="playlist-name">{{ artist.name }}</span>
              <span class="playlist-owner">Artist</span>
            </div>
          </div>
          <div v-if="globalLibraryStore.followedArtists.length === 0" class="sidebar-empty-expanded">
            <p>暂无关注的歌手</p>
          </div>
        </template>
      </template>
    </div>

    <!-- === 拖拽手柄 === -->
    <div
      class="resize-handle"
      @mousedown="onHandleMouseDown"
    ></div>

    <!-- === 缩略模式悬浮 tooltip（position: fixed，不受 overflow 裁剪）=== -->
    <div
      v-if="tooltip"
      class="playlist-tooltip-fixed"
      :style="{ top: tooltip.top + 'px', left: tooltip.left + 'px' }"
    >{{ tooltip.name }}</div>

    <!-- === 右键菜单 === -->
    <Teleport to="body">
      <div
        v-if="contextMenu.show"
        class="playlist-context-menu"
        :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
        @click.stop
      >
        <div class="context-menu-item" @click="handleContextEdit">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          <span>编辑</span>
        </div>
        <div class="context-menu-item delete" @click="handleContextDelete">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
          <span>删除</span>
        </div>
      </div>
    </Teleport>
  </aside>

  <!-- 新建歌单对话框 -->
  <div v-if="showCreateDialog" class="dialog-overlay" @click.self="showCreateDialog = false">
    <div class="dialog">
      <h3 class="dialog-title">新建歌单</h3>
      <input
        v-model="newWarehouseName"
        class="dialog-input"
        placeholder="请输入歌单名称"
        maxlength="30"
        @keyup.enter="handleCreateWarehouse"
        autofocus
      />
      <div class="dialog-actions">
        <button class="btn btn-secondary" @click="showCreateDialog = false">取消</button>
        <button class="btn btn-primary" @click="handleCreateWarehouse" :disabled="!newWarehouseName.trim() || isCreateLoading">
          {{ isCreateLoading ? '创建中...' : '创建' }}
        </button>
      </div>
    </div>
  </div>

  <!-- 编辑歌单对话框 -->
  <div v-if="showEditDialog" class="dialog-overlay" @click.self="showEditDialog = false">
    <div class="dialog edit-dialog" @click.stop>
      <h3 class="dialog-title">编辑歌单</h3>
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
            placeholder="歌单名称"
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
</template>
