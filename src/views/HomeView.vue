<script setup>
import { onMounted } from 'vue'
import { useMusicLibraryStore } from '../stores/musicLibrary.js'

const library = useMusicLibraryStore()

onMounted(() => {
  library.loadWarehouses()
  document.addEventListener('click', handleClickOutside)
})
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
<<<<<<< HEAD

// ---- 排序 ----
const sortOptions = [
  { value: 'recent-played', label: '最近播放' },
  { value: 'recent-updated', label: '最近更新' },
  { value: 'name', label: '首字母排序' },
]
const sortOpen = ref(false)

const currentSortLabel = computed(() => {
  const opt = sortOptions.find(o => o.value === library.sortBy)
  return opt ? opt.label : '排序'
})

function handleSortSelect(value) {
  library.setSortBy(value)
  sortOpen.value = false
}

// 点击外部关闭下拉
const sortRef = ref(null)
function handleClickOutside(e) {
  if (sortRef.value && !sortRef.value.contains(e.target)) {
    sortOpen.value = false
  }
}

// ---- 新建 ----
async function handleCreateWarehouse() {
  const name = newWarehouseName.value.trim()
  if (!name) return
  isLoading.value = true
  const result = await library.createWarehouse(name)
  isLoading.value = false
  if (result.success) {
    showCreateDialog.value = false
    newWarehouseName.value = ''
  } else {
    ElMessage.error(result.error || '创建失败')
  }
}

// ---- 编辑 ----
function openEditDialog(wh) {
  editingWarehouse.value = wh
  editName.value = wh.name
  editDescription.value = wh.description || ''
  editCoverBase64.value = wh.coverPath || ''
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

  const updates = {}
  if (newName !== editingWarehouse.value.name) updates.name = newName
  if ((editDescription.value.trim() || '') !== (editingWarehouse.value.description || '')) {
    updates.description = editDescription.value.trim()
  }
  if (editCoverBase64.value !== (editingWarehouse.value.coverPath || '')) {
    updates.coverPath = editCoverBase64.value
  }

  if (Object.keys(updates).length === 0) {
    showEditDialog.value = false
    editLoading.value = false
    return
  }

  const result = await library.updateWarehouse(editingWarehouse.value.id, updates)
  editLoading.value = false

  if (result.success) {
    showEditDialog.value = false
    ElMessage.success('保存成功')
    await library.loadWarehouses()
  } else {
    ElMessage.error(result.error || '保存失败')
  }
}

// ---- 删除 ----
async function handleDeleteWarehouse(warehouse) {
  if (confirm(`确定要删除音乐库 "${warehouse.name}" 吗？对应文件会被删除。`)) {
    await library.deleteWarehouse(warehouse.id)
  }
}
  
function enterWarehouse(warehouse) {
  library.setCurrentWarehouse(warehouse)
  router.push(`/warehouse/${warehouse.id}`)
}

function handleDrop(e) {
  e.preventDefault()
  const warehouseId = e.currentTarget.dataset.warehouseId
  if (!warehouseId) return
  const files = Array.from(e.dataTransfer.files)
  handleImportFiles(warehouseId, files)
}

async function handleImportFiles(warehouseId, files) {
  const filePaths = files.map(f => f.path)
  const result = await window.electronAPI.importFilesToWarehouseById(warehouseId, filePaths)
  if (result.success) {
    library.loadWarehouses()
  }
}
</script>

<template>
  <div class="home-view">
    <!-- 音乐库区域 -->
    <section class="section section-warehouse">
      <div class="section-header">
        <h2 class="section-title">音乐库</h2>
        <div class="header-right">
          <div class="sort-dropdown" ref="sortRef">
            <button class="sort-trigger" @click="sortOpen = !sortOpen">
              <span>{{ currentSortLabel }}</span>
              <svg class="sort-arrow" :class="{ open: sortOpen }" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            <Transition name="dropdown">
              <div v-if="sortOpen" class="sort-menu">
                <button
                  v-for="opt in sortOptions"
                  :key="opt.value"
                  class="sort-option"
                  :class="{ active: library.sortBy === opt.value }"
                  @click="handleSortSelect(opt.value)"
                >
                  {{ opt.label }}
                </button>
              </div>
            </Transition>
          </div>
          <button class="btn btn-primary" @click="showCreateDialog = true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            新建音乐库
          </button>
        </div>
      </div>

      <div class="warehouse-grid-wrapper" v-if="library.warehouses.length > 0">
        <div class="warehouse-grid">
          <div
            v-for="wh in library.warehouses"
            :key="wh.name"
            class="warehouse-card"
            @click="enterWarehouse(wh)"
            @drop="handleDrop"
            @dragover.prevent
            @dragenter.prevent
            :data-warehouse-id="wh.id"
          >
            <div class="warehouse-cover" :style="wh.coverPath ? { background: 'none' } : {}">
              <img
                v-if="wh.coverPath"
                :src="wh.coverPath"
                class="cover-img"
                alt=""
              />
              <svg v-else width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M9 18V5l12-2v13"/>
                <circle cx="6" cy="18" r="3"/>
                <circle cx="18" cy="16" r="3"/>
              </svg>
            </div>
            <div class="warehouse-info">
              <span class="warehouse-name">{{ wh.name }}</span>
              <span class="warehouse-count">{{ wh.trackCount }} 首曲目</span>
            </div>
            <button
              class="btn-edit"
              @click.stop="openEditDialog(wh)"
              title="编辑音乐库"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button
              class="btn-delete"
              @click.stop="handleDeleteWarehouse(wh)"
              title="删除音乐库"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div v-else class="empty-home-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
          <path d="M9 18V5l12-2v13"/>
          <circle cx="6" cy="18" r="3"/>
          <circle cx="18" cy="16" r="3"/>
        </svg>
        <p>暂无音乐库，点击"新建音乐库"开始</p>
      </div>
    </section>

    <!-- 工具区域 -->
    <section class="section section-tools">
      <h2 class="section-title">工具</h2>
      <div class="tools-grid">
        <div class="tool-card" @click="router.push('/unlock')">
          <div class="tool-icon unlock">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <div class="tool-info">
            <span class="tool-name">解密音乐</span>
            <span class="tool-desc">解密酷狗/QQ音乐/网易云/酷我等加密格式</span>
          </div>
        </div>

        <div class="tool-card" @click="router.push('/lyrics-unlock')">
          <div class="tool-icon lyrics-unlock" style="background: rgba(236, 72, 153, 0.1); color: #ec4899;">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              <path d="M8 10h8"/>
              <path d="M8 14h4"/>
            </svg>
          </div>
          <div class="tool-info">
            <span class="tool-name">解密歌词</span>
            <span class="tool-desc">解密酷狗等平台的专属加密歌词文件为lrc</span>
          </div>
        </div>

        <div class="tool-card" @click="router.push('/converter')">
          <div class="tool-icon converter">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="16 3 21 3 21 8"/>
              <line x1="4" y1="20" x2="21" y2="3"/>
              <polyline points="21 16 21 21 16 21"/>
              <line x1="15" y1="15" x2="21" y2="21"/>
            </svg>
          </div>
          <div class="tool-info">
            <span class="tool-name">格式转换</span>
            <span class="tool-desc">将 FLAC 等无损格式转换为 MP3</span>
          </div>
        </div>

        <div class="tool-card" @click="router.push('/edit')">
          <div class="tool-icon edit">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </div>
          <div class="tool-info">
            <span class="tool-name">编辑歌曲</span>
            <span class="tool-desc">编辑音乐文件的封面和详细信息</span>
          </div>
        </div>

      </div>
    </section>

    <!-- 新建音乐库对话框 -->
    <div v-if="showCreateDialog" class="dialog-overlay" @click.self="showCreateDialog = false">
      <div class="dialog">
        <h3 class="dialog-title">新建音乐库</h3>
        <input
          v-model="newWarehouseName"
          class="dialog-input"
          placeholder="请输入音乐库名称"
          maxlength="30"
          @keyup.enter="handleCreateWarehouse"
          autofocus
        />
        <div class="dialog-actions">
          <button class="btn btn-secondary" @click="showCreateDialog = false">取消</button>
          <button class="btn btn-primary" @click="handleCreateWarehouse" :disabled="!newWarehouseName.trim() || isLoading">
            {{ isLoading ? '创建中...' : '创建' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 编辑音乐库对话框 -->
    <div v-if="showEditDialog" class="dialog-overlay" @click.self="showEditDialog = false">
      <div class="dialog edit-dialog" @click.stop>
        <h3 class="dialog-title">编辑音乐库</h3>
        <!-- 隐藏的文件选择 input -->
        <input
          ref="coverInputRef"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,image/bmp"
          @change="handleCoverUpload"
          style="display: none"
        />

        <!-- 主体内容：封面 + 名称/描述 -->
        <div class="edit-body">
          <!-- 左侧封面区域 -->
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
            <!-- 有封面时 hover 显示的遮罩 -->
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

          <!-- 右侧名称 + 描述 -->
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

        <!-- 底部保存按钮 -->
        <div class="edit-footer">
          <button class="btn btn-primary" @click="handleSaveEdit" :disabled="editLoading">
            {{ editLoading ? '保存中...' : '保存' }}
          </button>
        </div>
      </div>
    </div>
  </div>
=======
</script>

<template>
  <div class="home-view"></div>
>>>>>>> 33fb2b48e728f903becf2a77b0aab4e3f9ec28ba
</template>
