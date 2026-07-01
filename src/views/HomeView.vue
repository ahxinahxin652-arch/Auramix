<script setup>
import { onMounted, onUnmounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMusicLibraryStore } from '../stores/musicLibrary.js'
import { ElMessage } from 'element-plus'
import { Document, MagicStick, Calendar, View, Headset, Unlock, Brush, ChatLineRound, GoldMedal, Search, Refresh } from '@element-plus/icons-vue'
import { listMyReports, statusLabel, periodTypeLabel, type ReportListItem } from '../api/reports'

const library = useMusicLibraryStore()
const router = useRouter()

const latestReport = ref(null)
const reportLoading = ref(false)

async function loadLatestReport() {
  reportLoading.value = true
  try {
    const res = await listMyReports({ pageNum: 1, pageSize: 1 })
    if (res && res.records && res.records.length > 0) {
      latestReport.value = res.records[0]
    } else {
      latestReport.value = null
    }
  } catch (err) {
    console.warn('加载最新报告失败:', err)
    latestReport.value = null
  } finally {
    reportLoading.value = false
  }
}

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
  loadLatestReport()
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
  <div class="home-view">
    <div class="home-grid">
      <!-- 我的报告卡片 -->
      <div class="home-card home-card--report" @click="router.push('/reports')">
        <div class="home-card__icon">
          <el-icon><Document /></el-icon>
        </div>
        <div class="home-card__body">
          <h2>我的报告</h2>
          <p>每周 / 每月自动生成的个人听歌报告</p>
          <div v-if="latestReport" class="home-card__latest">
            <el-tag
              :type="latestReport.periodType === 1 ? 'primary' : 'success'"
              size="small"
              effect="dark"
            >
              {{ periodTypeLabel(latestReport.periodType) }}
            </el-tag>
            <el-tag
              :type="latestReport.status === 1 ? 'success' : 'info'"
              size="small"
            >
              {{ statusLabel(latestReport.status) }}
            </el-tag>
            <span class="home-card__date">
              {{ latestReport.periodStart }} ~ {{ latestReport.periodEnd }}
            </span>
          </div>
          <div v-else-if="!reportLoading" class="home-card__latest home-card__latest--empty">
            暂无报告, 点击生成第一份
          </div>
          <div class="home-card__cta">
            <el-icon><View /></el-icon>
            <span>查看报告</span>
          </div>
        </div>
      </div>

      <!-- 其他功能入口占位 (后续可扩展) -->
      <div class="home-card home-card--disabled">
        <div class="home-card__icon home-card__icon--muted">
          <el-icon><Headset /></el-icon>
        </div>
        <div class="home-card__body">
          <h2>音乐库</h2>
          <p>本地音乐管理</p>
          <div class="home-card__cta home-card__cta--muted">
            即将上线
          </div>
        </div>
      </div>
      <div class="home-card home-card--disabled">
        <div class="home-card__icon home-card__icon--muted">
          <el-icon><ChatLineRound /></el-icon>
        </div>
        <div class="home-card__body">
          <h2>AI 助手</h2>
          <p>智能对话 / 音乐推荐</p>
          <div class="home-card__cta home-card__cta--muted">
            即将上线
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-view {
  min-height: 100vh;
  padding: 60px 40px;
  background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
}

.home-grid {
  max-width: 1100px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.home-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 28px 32px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.25s ease;
  backdrop-filter: blur(10px);
}

.home-card:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(192, 132, 252, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(96, 165, 250, 0.15);
}

.home-card--disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.home-card--disabled:hover {
  transform: none;
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: none;
}

.home-card__icon {
  width: 72px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #60a5fa, #c084fc);
  border-radius: 16px;
  font-size: 36px;
  color: #fff;
  flex-shrink: 0;
}

.home-card__icon--muted {
  background: rgba(255, 255, 255, 0.06);
  color: rgba(224, 231, 255, 0.4);
}

.home-card__body {
  flex: 1;
  min-width: 0;
}

.home-card__body h2 {
  margin: 0 0 6px 0;
  font-size: 20px;
  font-weight: 600;
  background: linear-gradient(90deg, #60a5fa, #c084fc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.home-card__body p {
  margin: 0 0 12px 0;
  font-size: 13px;
  color: rgba(224, 231, 255, 0.6);
}

.home-card__latest {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 12px;
  font-size: 12px;
}

.home-card__date {
  color: rgba(224, 231, 255, 0.7);
  font-family: 'Consolas', monospace;
}

.home-card__latest--empty {
  color: rgba(224, 231, 255, 0.4);
  font-size: 12px;
  font-style: italic;
}

.home-card__cta {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #c084fc;
  font-weight: 500;
}

.home-card__cta--muted {
  color: rgba(224, 231, 255, 0.4);
  font-weight: 400;
  font-style: italic;
}
</style>
