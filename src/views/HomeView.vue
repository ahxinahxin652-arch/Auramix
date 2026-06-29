<script setup>
import { onMounted, onUnmounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMusicLibraryStore } from '../stores/musicLibrary.js'
import { ElMessage } from 'element-plus'

const library = useMusicLibraryStore()
const router = useRouter()

// ---- 常量 ----
const ALLOWED_IMG_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/bmp']
const COMPRESS_SIZE = 400
const MIN_IMG_SIZE = 100
const MAX_IMG_SIZE = 800

// ---- 新建对话框 ----
const showCreateDialog = ref(false)
const newWarehouseName = ref('')
const isLoading = ref(false)

// ---- 编辑对话框 ----
const showEditDialog = ref(false)
const editLoading = ref(false)
const editingWarehouse = ref(null)
const editName = ref('')
const editDescription = ref('')
const editCoverBase64 = ref('')
const editCoverHover = ref(false)
const coverInputRef = ref(null)

onMounted(() => {
  // library.loadWarehouses() // Removed startup redundant load
  document.addEventListener('click', handleClickOutside)
})
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

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
    // await library.loadWarehouses() // Removed redundant load
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
    // library.loadWarehouses() // Removed redundant load
  }
}
</script>

<template>
  <div class="home-view" style="display: flex; align-items: center; justify-content: center; height: 100vh;">
    <h1 style="color: #fff; font-size: 48px; font-weight: bold;">主界面</h1>
  </div>
</template>
