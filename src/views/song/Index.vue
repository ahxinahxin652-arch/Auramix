<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Search, Refresh, Delete, Upload, Edit, Document, Headset, VideoCamera, Collection } from '@element-plus/icons-vue'
import PageHeader from '@/components/PageHeader.vue'
import {
  listTracks,
  getTrack,
  createTrack,
  updateTrack,
  deleteTrack,
  type TrackListItem,
  type TrackDetail,
  type TrackArtist,
  type TrackAudioResource,
  type TrackVideoResource
} from '@/api/admin/songManage'
import { searchAlbums, quickCreateAlbum, type AlbumSearchItem } from '@/api/admin/albumManage'
import { searchArtists, type ArtistSearchItem } from '@/api/admin/artistManage'
import { getOssPolicy } from '@/api/admin/oss'
import axios from 'axios'

// ---- Paging & Table data ----
const list = ref<TrackListItem[]>([])
const loading = ref(false)
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)

// ---- Filtering conditions ----
const filter = reactive({
  query: '',
  albumId: undefined as string | undefined,
  status: undefined as number | undefined
})

const filterAlbumOptions = ref<AlbumSearchItem[]>([])
const loadingAlbumsFilter = ref(false)

// ---- Drawer State ----
const drawerVisible = ref(false)
const activeTab = ref('basic')
const isEdit = ref(false)
const editingId = ref<string>('')
const submitLoading = ref(false)

// ---- Form state ----
const formRef = ref<FormInstance>()
const form = reactive<{
  title: string
  albumId: string
  trackNumber: number | undefined
  discNumber: number
  status: number
  lyricsUrl: string
  duration: number
  artists: TrackArtist[]
  audioResources: TrackAudioResource[]
  videoResources: TrackVideoResource[]
}>({
  title: '',
  albumId: '',
  trackNumber: undefined,
  discNumber: 1,
  status: 0,
  lyricsUrl: '',
  duration: 0,
  artists: [],
  audioResources: [],
  videoResources: []
})

const formRules = reactive<FormRules>({
  title: [
    { required: true, message: '歌曲名称不能为空', trigger: 'blur' },
    { max: 200, message: '歌曲名称不能超过 200 个字符', trigger: 'blur' }
  ],
  albumId: [
    { required: true, message: '必须绑定一张专辑', trigger: 'change' }
  ],
  discNumber: [
    { required: true, message: '碟片号不能为空', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '播放状态不能为空', trigger: 'change' }
  ]
})

// ---- Autocomplete options state ----
const albumOptions = ref<AlbumSearchItem[]>([])
const loadingAlbums = ref(false)

const artistOptions = ref<ArtistSearchItem[]>([])
const loadingArtists = ref(false)

// ---- OSS upload state ----
const isUploading = ref(false)
const uploadPercent = ref(0)
const uploadingFile = ref('')

const lyricsInputRef = ref<HTMLInputElement>()
const audioInputRef = ref<HTMLInputElement>()
const videoInputRef = ref<HTMLInputElement>()

function triggerLyricsUpload() {
  lyricsInputRef.value?.click()
}
function triggerAudioUpload() {
  audioInputRef.value?.click()
}
function triggerVideoUpload() {
  videoInputRef.value?.click()
}

// ---- Quick Album Dialog State ----
const quickAlbumVisible = ref(false)
const quickAlbumLoading = ref(false)
const quickAlbumFormRef = ref<FormInstance>()
const quickAlbumForm = reactive({
  title: '',
  albumType: 0,
  releaseDate: '',
  coverUrl: ''
})

const quickAlbumRules = reactive<FormRules>({
  title: [
    { required: true, message: '专辑名称不能为空', trigger: 'blur' }
  ],
  albumType: [
    { required: true, message: '专辑类型不能为空', trigger: 'change' }
  ]
})

// ---- Load Data ----
async function loadData() {
  loading.value = true
  try {
    const res = await listTracks({
      query: filter.query,
      albumId: filter.albumId,
      status: filter.status,
      pageNum: pageNum.value,
      pageSize: pageSize.value
    })
    list.value = res.records
    total.value = res.total
  } catch (err) {
    console.error('加载歌曲列表出错:', err)
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pageNum.value = 1
  loadData()
}

function handleReset() {
  filter.query = ''
  filter.albumId = undefined
  filter.status = undefined
  pageNum.value = 1
  loadData()
}

function handlePageChange(p: number) {
  pageNum.value = p
  loadData()
}

function handleSizeChange(size: number) {
  pageSize.value = size
  pageNum.value = 1
  loadData()
}

// ---- Format Helpers ----
function formatDuration(sec: number): string {
  if (!sec || isNaN(sec)) return '0:00'
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// ---- Remote Select Helpers ----
async function remoteSearchAlbumsFilter(query: string) {
  if (!query) {
    filterAlbumOptions.value = []
    return
  }
  loadingAlbumsFilter.value = true
  try {
    filterAlbumOptions.value = await searchAlbums(query)
  } catch (err) {
    console.error('搜索过滤专辑失败:', err)
  } finally {
    loadingAlbumsFilter.value = false
  }
}

async function remoteSearchAlbums(query: string) {
  if (!query) {
    albumOptions.value = []
    return
  }
  loadingAlbums.value = true
  try {
    albumOptions.value = await searchAlbums(query)
  } catch (err) {
    console.error('搜索专辑失败:', err)
  } finally {
    loadingAlbums.value = false
  }
}

async function remoteSearchArtists(query: string) {
  if (!query) {
    artistOptions.value = []
    return
  }
  loadingArtists.value = true
  try {
    artistOptions.value = await searchArtists(query)
  } catch (err) {
    console.error('搜索歌手失败:', err)
  } finally {
    loadingArtists.value = false
  }
}

// ---- Artist rows management ----
function addArtistRow() {
  form.artists.push({
    artistId: '',
    role: 0
  })
}

function removeArtistRow(index: number) {
  form.artists.splice(index, 1)
}

// ---- OSS direct uploads ----
async function uploadToOss(file: File, type: 'audio' | 'video' | 'lyrics'): Promise<string> {
  const policy = await getOssPolicy(type)
  const ext = file.name.substring(file.name.lastIndexOf('.'))
  const randomSuffix = Math.random().toString(36).substring(2, 8)
  const filename = `${Date.now()}_${randomSuffix}${ext}`
  const key = `${policy.dir}${filename}`

  const formData = new FormData()
  formData.append('key', key)
  formData.append('policy', policy.policy)
  formData.append('OSSAccessKeyId', policy.accessKeyId)
  formData.append('success_action_status', '200')
  formData.append('signature', policy.signature)
  formData.append('file', file)

  uploadingFile.value = file.name
  uploadPercent.value = 0
  isUploading.value = true

  try {
    await axios.post(policy.host, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          uploadPercent.value = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        }
      }
    })
    return `${policy.host}/${key}`
  } catch (err) {
    console.error('OSS上传失败:', err)
    ElMessage.error(`上传文件 ${file.name} 失败，请检查网络后重试`)
    throw err
  } finally {
    isUploading.value = false
    uploadPercent.value = 0
    uploadingFile.value = ''
  }
}

// ---- File change handlers ----
async function handleLyricsFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  try {
    const url = await uploadToOss(file, 'lyrics')
    form.lyricsUrl = url
    ElMessage.success('歌词文件上传成功')
  } catch (e) {
    console.error(e)
  } finally {
    target.value = ''
  }
}

async function handleAudioFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  try {
    // 1. Detect metadata locally
    const meta = await detectAudioMetadata(file)
    if (meta.duration > 0) {
      form.duration = meta.duration
    }

    // 2. Direct upload to OSS
    const url = await uploadToOss(file, 'audio')

    // 3. Save into resource array
    form.audioResources = [
      {
        quality: meta.quality,
        format: meta.format,
        bitrate: meta.bitrate,
        streamUrl: url,
        size: file.size
      }
    ]
    ElMessage.success('音源上传成功')
  } catch (e) {
    console.error(e)
  } finally {
    target.value = ''
  }
}

function detectAudioMetadata(file: File): Promise<{ duration: number; bitrate: number; format: number; quality: number }> {
  return new Promise((resolve) => {
    const audio = new Audio()
    audio.src = URL.createObjectURL(file)
    audio.addEventListener('loadedmetadata', () => {
      const duration = Math.round(audio.duration)
      const size = file.size
      const bitrate = duration > 0 ? Math.round((size * 8) / duration) : 0
      
      const ext = file.name.split('.').pop()?.toLowerCase() || ''
      let format = 0 // mp3
      if (ext === 'flac') format = 1
      else if (ext === 'm4a') format = 2
      else if (ext === 'ogg') format = 3

      let quality = 0 // standard
      if (format === 1) quality = 2 // lossless
      else if (bitrate >= 250000) quality = 1 // high

      resolve({ duration, bitrate, format, quality })
    })
    audio.addEventListener('error', () => {
      resolve({ duration: 0, bitrate: 0, format: 0, quality: 0 })
    })
  })
}

async function handleVideoFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  try {
    const meta = await detectVideoMetadata(file)
    const url = await uploadToOss(file, 'video')

    form.videoResources = [
      {
        quality: meta.quality,
        resolution: meta.resolution,
        fps: meta.fps,
        format: meta.format,
        bitrate: meta.bitrate,
        streamUrl: url,
        size: file.size
      }
    ]
    ElMessage.success('MV视频文件上传成功')
  } catch (e) {
    console.error(e)
  } finally {
    target.value = ''
  }
}

function detectVideoMetadata(file: File): Promise<{ duration: number; bitrate: number; format: number; quality: number; resolution: string; fps: number }> {
  return new Promise((resolve) => {
    const video = document.createElement('video')
    video.src = URL.createObjectURL(file)
    video.addEventListener('loadedmetadata', () => {
      const duration = Math.round(video.duration)
      const size = file.size
      const width = video.videoWidth
      const height = video.videoHeight
      const resolution = `${width}x${height}`
      const bitrate = duration > 0 ? Math.round((size * 8) / duration) : 0

      const ext = file.name.split('.').pop()?.toLowerCase() || ''
      let format = 0 // mp4
      if (ext === 'webm') format = 1
      else if (ext === 'mkv') format = 2

      let quality = 1
      if (height >= 2160) quality = 3
      else if (height >= 1080) quality = 2
      else if (height >= 720) quality = 1
      else quality = 0

      resolve({ duration, bitrate, format, quality, resolution, fps: 30 })
    })
    video.addEventListener('error', () => {
      resolve({ duration: 0, bitrate: 0, format: 0, quality: 1, resolution: '1280x720', fps: 30 })
    })
  })
}

// ---- Form Operations ----
function openCreateDrawer() {
  isEdit.value = false
  editingId.value = ''
  drawerVisible.value = true
  activeTab.value = 'basic'

  // Reset form
  form.title = ''
  form.albumId = ''
  form.trackNumber = undefined
  form.discNumber = 1
  form.status = 0
  form.lyricsUrl = ''
  form.duration = 0
  form.artists = []
  form.audioResources = []
  form.videoResources = []

  albumOptions.value = []
  artistOptions.value = []
}

async function openEditDrawer(row: TrackListItem) {
  isEdit.value = true
  editingId.value = row.id
  drawerVisible.value = true
  activeTab.value = 'basic'

  try {
    const detail = await getTrack(row.id)
    form.title = detail.title
    form.albumId = detail.albumId
    form.trackNumber = detail.trackNumber
    form.discNumber = detail.discNumber
    form.status = detail.status
    form.lyricsUrl = detail.lyricsUrl
    form.duration = detail.duration
    form.artists = detail.artists ? [...detail.artists] : []
    form.audioResources = detail.audioResources ? [...detail.audioResources] : []
    form.videoResources = detail.videoResources ? [...detail.videoResources] : []

    // Pre-populate selects to resolve display names immediately
    if (detail.albumId) {
      albumOptions.value = [
        {
          id: detail.albumId,
          title: detail.albumTitle || '未知专辑',
          albumType: 0,
          coverUrl: ''
        }
      ]
    }

    if (detail.artists) {
      artistOptions.value = detail.artists.map((a) => ({
        id: a.artistId,
        name: a.artistName || '未知歌手',
        coverImg: ''
      }))
    }
  } catch (err) {
    console.error('获取单曲详情异常:', err)
    ElMessage.error('获取单曲详情失败')
    drawerVisible.value = false
  }
}

function handleBeforeCloseDrawer(done: () => void) {
  if (isUploading.value) {
    ElMessageBox.confirm('文件仍在上传中，关闭抽屉将中止上传任务，是否确认关闭？', '放弃上传', {
      type: 'warning',
      confirmButtonText: '强制关闭',
      cancelButtonText: '取消'
    })
      .then(() => done())
      .catch(() => {})
  } else {
    done()
  }
}

async function handleSave() {
  if (isUploading.value) {
    ElMessage.warning('文件正在上传中，请稍候保存')
    return
  }

  // 1. General validations
  if (!formRef.value) return
  const valid = await formRef.value.validate()
  if (!valid) {
    activeTab.value = 'basic'
    return
  }

  // 2. Artists custom validation
  if (form.artists.length === 0) {
    activeTab.value = 'artists'
    ElMessage.warning('请至少关联一名歌手')
    return
  }
  const hasEmptyArtist = form.artists.some((a) => !a.artistId)
  if (hasEmptyArtist) {
    activeTab.value = 'artists'
    ElMessage.warning('关联歌手ID不能为空，请选择或删除空白行')
    return
  }
  if (form.artists[0].role !== 0) {
    activeTab.value = 'artists'
    ElMessage.warning('关联的第一位歌手的角色必须是【主要歌手】')
    return
  }

  // 3. Audio file validation warning
  if (form.audioResources.length === 0) {
    activeTab.value = 'media'
    ElMessage.warning('请上传歌曲音频源文件')
    return
  }

  submitLoading.value = true
  try {
    const payload: TrackDetail = {
      title: form.title,
      albumId: form.albumId,
      trackNumber: form.trackNumber || 1,
      discNumber: form.discNumber,
      status: form.status,
      lyricsUrl: form.lyricsUrl,
      duration: form.duration,
      artists: form.artists,
      audioResources: form.audioResources,
      videoResources: form.videoResources
    }

    if (isEdit.value) {
      await updateTrack(editingId.value, payload)
      ElMessage.success('更新歌曲成功')
    } else {
      await createTrack(payload)
      ElMessage.success('新建歌曲成功')
    }

    drawerVisible.value = false
    loadData()
  } catch (err) {
    console.error('保存歌曲失败:', err)
  } finally {
    submitLoading.value = false
  }
}

function handleDelete(row: TrackListItem) {
  ElMessageBox.confirm(`确认删除歌曲《${row.title}》吗？此操作不可逆，将同步清理相关关联！`, '危险警告', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        await deleteTrack(row.id)
        ElMessage.success('删除成功')
        loadData()
      } catch (err) {
        console.error('删除歌曲异常:', err)
      }
    })
    .catch(() => {})
}

// ---- Quick Album Creation ----
function openQuickAlbumDialog() {
  quickAlbumVisible.value = true
  quickAlbumLoading.value = false
  quickAlbumForm.title = ''
  quickAlbumForm.albumType = 0
  quickAlbumForm.releaseDate = ''
  quickAlbumForm.coverUrl = ''
  quickAlbumFormRef.value?.resetFields()
}

function handleQuickAlbumSubmit() {
  if (!quickAlbumFormRef.value) return
  quickAlbumFormRef.value.validate(async (valid) => {
    if (!valid) return
    quickAlbumLoading.value = true
    try {
      const created = await quickCreateAlbum({
        title: quickAlbumForm.title,
        albumType: quickAlbumForm.albumType,
        coverUrl: quickAlbumForm.coverUrl || undefined,
        releaseDate: quickAlbumForm.releaseDate || undefined
      })
      
      ElMessage.success('新专辑创建成功')
      // Auto select it in the form
      albumOptions.value.push(created)
      form.albumId = created.id
      quickAlbumVisible.value = false
    } catch (err) {
      console.error('快速新建专辑失败:', err)
    } finally {
      quickAlbumLoading.value = false
    }
  })
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="page-song">
    <PageHeader title="歌曲管理" subtitle="管理 Auramix 流媒体音乐平台的所有歌曲、音视频资源与歌词">
      <template #actions>
        <el-button type="primary" class="gradient-btn" @click="openCreateDrawer">
          <el-icon><Plus /></el-icon>
          新建歌曲
        </el-button>
      </template>
    </PageHeader>

    <div class="page-song__content">
      <!-- 过滤栏 -->
      <div class="page-song__filter">
        <el-input
          v-model="filter.query"
          placeholder="搜索歌曲标题..."
          clearable
          class="filter-input"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <!-- 专辑远程搜索 -->
        <el-select
          v-model="filter.albumId"
          placeholder="筛选专辑"
          clearable
          filterable
          remote
          :remote-method="remoteSearchAlbumsFilter"
          :loading="loadingAlbumsFilter"
          class="filter-select"
          @change="handleSearch"
        >
          <el-option
            v-for="album in filterAlbumOptions"
            :key="album.id"
            :label="album.title"
            :value="album.id"
          />
        </el-select>

        <el-select
          v-model="filter.status"
          placeholder="歌曲状态"
          clearable
          class="filter-select"
          @change="handleSearch"
        >
          <el-option label="正常播放" :value="0" />
          <el-option label="已下架" :value="-1" />
          <el-option label="暂无版权" :value="-2" />
        </el-select>

        <el-button type="primary" @click="handleSearch"> 查询 </el-button>
        <el-button :icon="Refresh" @click="handleReset"> 重置 </el-button>
      </div>

      <!-- 数据表格 -->
      <el-card shadow="never" class="page-card">
        <el-table v-loading="loading" :data="list" style="width: 100%">
          <el-table-column label="歌曲标题" min-width="240">
            <template #default="{ row }">
              <div class="song-title-info">
                <el-icon class="song-icon"><Headset /></el-icon>
                <div class="song-meta">
                  <span class="title-text">{{ row.title }}</span>
                  <span class="id-text">ID: {{ row.id }}</span>
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="关联专辑" min-width="180">
            <template #default="{ row }">
              <div class="album-info" v-if="row.albumId">
                <el-image
                  class="album-cover"
                  :src="row.albumCover"
                  fit="cover"
                  lazy
                >
                  <template #error>
                    <div class="album-cover-placeholder">
                      <el-icon><Collection /></el-icon>
                    </div>
                  </template>
                </el-image>
                <span class="album-title">{{ row.albumTitle }}</span>
              </div>
              <span v-else class="text-placeholder">-</span>
            </template>
          </el-table-column>

          <el-table-column label="歌手与角色" min-width="220">
            <template #default="{ row }">
              <div class="artists-list" v-if="row.artists && row.artists.length > 0">
                <el-tag
                  v-for="art in row.artists"
                  :key="art.artistId"
                  size="small"
                  :type="art.role === 0 ? 'primary' : art.role === 1 ? 'success' : 'info'"
                  class="artist-tag"
                >
                  {{ art.artistName }}
                  <span class="role-text">({{ art.role === 0 ? '主唱' : art.role === 1 ? '伴唱' : '词曲' }})</span>
                </el-tag>
              </div>
              <span v-else class="text-placeholder">-</span>
            </template>
          </el-table-column>

          <el-table-column prop="trackNumber" label="序号" width="80" align="center">
            <template #default="{ row }">
              <span v-if="row.trackNumber">#{{ row.trackNumber }}</span>
              <span v-else class="text-placeholder">-</span>
            </template>
          </el-table-column>

          <el-table-column prop="duration" label="时长" width="90" align="center">
            <template #default="{ row }">
              <span>{{ formatDuration(row.duration) }}</span>
            </template>
          </el-table-column>

          <el-table-column label="资源" width="120" align="center">
            <template #default="{ row }">
              <div class="resource-flags">
                <el-tag :type="row.hasAudio ? 'success' : 'danger'" size="small" class="flag-tag">
                  音频
                </el-tag>
                <el-tag :type="row.hasVideo ? 'warning' : 'info'" size="small" class="flag-tag">
                  视频
                </el-tag>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="status" label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag v-if="row.status === 0" type="success" size="small">正常</el-tag>
              <el-tag v-else-if="row.status === -1" type="danger" size="small">下架</el-tag>
              <el-tag v-else-if="row.status === -2" type="warning" size="small">无版权</el-tag>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="140" fixed="right" align="center">
            <template #default="{ row }">
              <el-button link type="primary" :icon="Edit" @click="openEditDrawer(row as any)">编辑</el-button>
              <el-button link type="danger" :icon="Delete" @click="handleDelete(row as any)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="pageNum"
            v-model:page-size="pageSize"
            :total="total"
            :page-sizes="[10, 20, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            @current-change="handlePageChange"
            @size-change="handleSizeChange"
          />
        </div>
      </el-card>
    </div>

    <!-- 编辑/新建抽屉 -->
    <el-drawer
      v-model="drawerVisible"
      :title="isEdit ? '编辑歌曲' : '新建歌曲'"
      size="680px"
      destroy-on-close
      :before-close="handleBeforeCloseDrawer"
    >
      <el-tabs v-model="activeTab" class="drawer-tabs">
        <!-- 基础信息 -->
        <el-tab-pane label="基础信息" name="basic">
          <el-form
            ref="formRef"
            :model="form"
            :rules="formRules"
            label-width="100px"
            label-position="right"
            style="margin-top: 16px;"
          >
            <el-form-item label="歌曲标题" prop="title">
              <el-input v-model="form.title" placeholder="请输入歌曲名称" />
            </el-form-item>

            <el-form-item label="关联专辑" prop="albumId">
              <div class="album-select-row">
                <el-select
                  v-model="form.albumId"
                  placeholder="搜索并选择专辑"
                  filterable
                  remote
                  :remote-method="remoteSearchAlbums"
                  :loading="loadingAlbums"
                  style="flex: 1;"
                >
                  <el-option
                    v-for="album in albumOptions"
                    :key="album.id"
                    :label="album.title"
                    :value="album.id"
                  />
                </el-select>
                <el-button type="success" :icon="Plus" @click="openQuickAlbumDialog">快速创建</el-button>
              </div>
            </el-form-item>

            <el-form-item label="音轨序号" prop="trackNumber">
              <el-input-number v-model="form.trackNumber" :min="1" placeholder="编号" style="width: 150px;" />
              <span class="form-item-tip">在专辑中的歌曲顺序，选填</span>
            </el-form-item>

            <el-form-item label="CD碟片号" prop="discNumber">
              <el-input-number v-model="form.discNumber" :min="1" style="width: 150px;" />
              <span class="form-item-tip">单碟通常为 1</span>
            </el-form-item>

            <el-form-item label="歌曲时长(秒)" prop="duration">
              <el-input-number v-model="form.duration" :min="0" style="width: 150px;" />
              <span class="form-item-tip">歌曲时长，将随音源上传自动更新</span>
            </el-form-item>

            <el-form-item label="播放状态" prop="status">
              <el-select v-model="form.status" style="width: 100%;">
                <el-option label="正常播放" :value="0" />
                <el-option label="下架" :value="-1" />
                <el-option label="暂无版权" :value="-2" />
              </el-select>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 歌手与角色 -->
        <el-tab-pane label="歌手关联" name="artists">
          <div style="margin-top: 16px">
            <div class="artists-header">
              <span class="subtitle">绑定歌手与对应角色 (首位必须为主要歌手)</span>
              <el-button type="primary" size="small" :icon="Plus" @click="addArtistRow">添加歌手</el-button>
            </div>

            <div v-for="(item, index) in form.artists" :key="index" class="artist-row">
              <el-select
                v-model="item.artistId"
                placeholder="搜索选择歌手"
                filterable
                remote
                :remote-method="remoteSearchArtists"
                :loading="loadingArtists"
                style="flex: 2"
              >
                <el-option
                  v-for="art in artistOptions"
                  :key="art.id"
                  :label="art.name"
                  :value="art.id"
                />
              </el-select>

              <el-select v-model="item.role" style="flex: 1">
                <el-option label="主要歌手" :value="0" />
                <el-option label="合作歌手" :value="1" />
                <el-option label="词曲作者" :value="2" />
              </el-select>

              <el-button type="danger" :icon="Delete" circle @click="removeArtistRow(index)" />
            </div>

            <el-empty v-if="form.artists.length === 0" description="暂无关联歌手，请添加" :image-size="60" />
          </div>
        </el-tab-pane>

        <!-- 媒体资源 -->
        <el-tab-pane label="媒体资源" name="media">
          <div class="media-tab-content">
            <!-- 正在上传提示 -->
            <el-alert
              v-if="isUploading"
              title="媒体文件直传阿里云OSS中，请勿关闭抽屉或刷新网页..."
              type="warning"
              show-icon
              :closable="false"
            >
              <div class="upload-progress-box">
                <span class="file-name-text">正在上传: {{ uploadingFile }}</span>
                <el-progress :percentage="uploadPercent" striped striped-flow />
              </div>
            </el-alert>

            <!-- LRC 歌词上传 -->
            <div class="media-box">
              <div class="media-box__header">
                <el-icon><Document /></el-icon>
                <span class="media-title">LRC 歌词</span>
              </div>
              <div class="media-box__body">
                <div v-if="form.lyricsUrl" class="resource-detail success">
                  <span class="url-text">{{ form.lyricsUrl }}</span>
                  <el-button type="danger" size="small" link @click="form.lyricsUrl = ''">移除</el-button>
                </div>
                <div v-else class="uploader-action">
                  <input
                    ref="lyricsInputRef"
                    type="file"
                    accept=".lrc"
                    style="display: none"
                    @change="handleLyricsFileChange"
                  />
                  <el-button type="primary" size="small" :icon="Upload" :disabled="isUploading" @click="triggerLyricsUpload">
                    上传 LRC 歌词
                  </el-button>
                  <span class="upload-tip">支持 .lrc 格式歌词</span>
                </div>
              </div>
            </div>

            <!-- 音频音源上传 -->
            <div class="media-box">
              <div class="media-box__header">
                <el-icon><Headset /></el-icon>
                <span class="media-title">音频资源 (主音源)</span>
              </div>
              <div class="media-box__body">
                <div v-if="form.audioResources.length > 0" class="resource-detail success">
                  <div class="resource-meta-grid">
                    <span class="meta-label">品质:</span>
                    <el-select v-model="form.audioResources[0].quality" size="small" style="width: 110px;">
                      <el-option label="标准音质" :value="0" />
                      <el-option label="高音质" :value="1" />
                      <el-option label="无损音质" :value="2" />
                    </el-select>

                    <span class="meta-label">格式:</span>
                    <el-select v-model="form.audioResources[0].format" size="small" style="width: 110px;">
                      <el-option label="mp3" :value="0" />
                      <el-option label="flac" :value="1" />
                      <el-option label="m4a" :value="2" />
                      <el-option label="ogg" :value="3" />
                    </el-select>

                    <span class="meta-label">大小:</span>
                    <span>{{ formatBytes(form.audioResources[0].size) }}</span>

                    <span class="meta-label">码率:</span>
                    <div style="display: flex; align-items: center; gap: 4px;">
                      <el-input-number v-model="form.audioResources[0].bitrate" :controls="false" size="small" style="width: 80px;" />
                      <span style="font-size: 12px; color: #999;">bps</span>
                    </div>
                  </div>
                  <div class="resource-url-row">
                    <span class="url-text">{{ form.audioResources[0].streamUrl }}</span>
                    <el-button type="danger" size="small" link @click="form.audioResources = []">重新上传</el-button>
                  </div>
                </div>
                <div v-else class="uploader-action">
                  <input
                    ref="audioInputRef"
                    type="file"
                    accept=".mp3,.flac,.m4a,.ogg"
                    style="display: none"
                    @change="handleAudioFileChange"
                  />
                  <el-button type="primary" size="small" :icon="Upload" :disabled="isUploading" @click="triggerAudioUpload">
                    上传音频文件
                  </el-button>
                  <span class="upload-tip">支持 MP3, FLAC, M4A, OGG 格式，将自动提取时长与码率</span>
                </div>
              </div>
            </div>

            <!-- MV 视频上传 -->
            <div class="media-box">
              <div class="media-box__header">
                <el-icon><VideoCamera /></el-icon>
                <span class="media-title">MV 视频资源 (选填)</span>
              </div>
              <div class="media-box__body">
                <div v-if="form.videoResources.length > 0" class="resource-detail success">
                  <div class="resource-meta-grid">
                    <span class="meta-label">画质:</span>
                    <el-select v-model="form.videoResources[0].quality" size="small" style="width: 110px;">
                      <el-option label="360P" :value="0" />
                      <el-option label="720P" :value="1" />
                      <el-option label="1080P" :value="2" />
                      <el-option label="4K" :value="3" />
                    </el-select>

                    <span class="meta-label">分辨率:</span>
                    <el-input v-model="form.videoResources[0].resolution" size="small" style="width: 110px;" />

                    <span class="meta-label">格式:</span>
                    <el-select v-model="form.videoResources[0].format" size="small" style="width: 110px;">
                      <el-option label="mp4" :value="0" />
                      <el-option label="webm" :value="1" />
                      <el-option label="mkv" :value="2" />
                    </el-select>

                    <span class="meta-label">大小:</span>
                    <span>{{ formatBytes(form.videoResources[0].size) }}</span>

                    <span class="meta-label">帧率:</span>
                    <div style="display: flex; align-items: center; gap: 4px;">
                      <el-input-number v-model="form.videoResources[0].fps" :controls="false" size="small" style="width: 80px;" />
                      <span style="font-size: 12px; color: #999;">fps</span>
                    </div>

                    <span class="meta-label">码率:</span>
                    <div style="display: flex; align-items: center; gap: 4px;">
                      <el-input-number v-model="form.videoResources[0].bitrate" :controls="false" size="small" style="width: 80px;" />
                      <span style="font-size: 12px; color: #999;">bps</span>
                    </div>
                  </div>
                  <div class="resource-url-row">
                    <span class="url-text">{{ form.videoResources[0].streamUrl }}</span>
                    <el-button type="danger" size="small" link @click="form.videoResources = []">重新上传</el-button>
                  </div>
                </div>
                <div v-else class="uploader-action">
                  <input
                    ref="videoInputRef"
                    type="file"
                    accept=".mp4,.webm,.mkv"
                    style="display: none"
                    @change="handleVideoFileChange"
                  />
                  <el-button type="primary" size="small" :icon="Upload" :disabled="isUploading" @click="triggerVideoUpload">
                    上传视频文件
                  </el-button>
                  <span class="upload-tip">支持 MP4, WEBM, MKV 格式，将自动分析分辨率与帧率</span>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>

      <template #footer>
        <div class="drawer-footer">
          <el-button @click="drawerVisible = false">取消</el-button>
          <el-button type="primary" class="gradient-btn" :loading="submitLoading" :disabled="isUploading" @click="handleSave">
            保存歌曲
          </el-button>
        </div>
      </template>
    </el-drawer>

    <!-- 快速创建专辑对话框 -->
    <el-dialog
      v-model="quickAlbumVisible"
      title="快速新建专辑"
      width="420px"
      destroy-on-close
      append-to-body
    >
      <el-form
        ref="quickAlbumFormRef"
        :model="quickAlbumForm"
        :rules="quickAlbumRules"
        label-width="90px"
        label-position="right"
      >
        <el-form-item label="专辑标题" prop="title">
          <el-input v-model="quickAlbumForm.title" placeholder="例如: 摩羯座 / 最伟大的作品" />
        </el-form-item>

        <el-form-item label="专辑类型" prop="albumType">
          <el-select v-model="quickAlbumForm.albumType" style="width: 100%;">
            <el-option label="合辑/标准专辑" :value="0" />
            <el-option label="单曲" :value="1" />
            <el-option label="EP/迷你专辑" :value="2" />
          </el-select>
        </el-form-item>

        <el-form-item label="发布日期" prop="releaseDate">
          <el-date-picker
            v-model="quickAlbumForm.releaseDate"
            type="date"
            placeholder="选择发布日期"
            value-format="YYYY-MM-DD"
            style="width: 100%;"
          />
        </el-form-item>

        <el-form-item label="封面链接" prop="coverUrl">
          <el-input v-model="quickAlbumForm.coverUrl" placeholder="输入封面海报图片 URL" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="quickAlbumVisible = false">取消</el-button>
          <el-button type="primary" class="gradient-btn" :loading="quickAlbumLoading" @click="handleQuickAlbumSubmit">
            创建并选择
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.page-song {
  &__content {
    padding: $spacing-md;
  }

  &__filter {
    display: flex;
    gap: $spacing-sm;
    margin-bottom: $spacing-md;
    flex-wrap: wrap;

    .filter-input {
      width: 240px;
    }

    .filter-select {
      width: 180px;
    }
  }
}

.gradient-btn {
  background: linear-gradient(135deg, $primary-color 0%, $primary-dark 100%) !important;
  border: none !important;
  color: white !important;

  &:hover {
    opacity: 0.9;
  }
}

.page-card {
  border: 1px solid $border-base;
  border-radius: $radius-md;
  box-shadow: $shadow-card;
}

.song-title-info {
  display: flex;
  align-items: center;
  gap: $spacing-sm;

  .song-icon {
    font-size: 20px;
    color: $primary-color;
  }

  .song-meta {
    display: flex;
    flex-direction: column;

    .title-text {
      font-size: $font-size-sm;
      font-weight: 500;
      color: $text-primary;
    }

    .id-text {
      font-size: $font-size-2xs;
      color: $text-tertiary;
    }
  }
}

.album-info {
  display: flex;
  align-items: center;
  gap: $spacing-sm;

  .album-cover {
    width: 36px;
    height: 36px;
    border-radius: $radius-sm;
    border: 1px solid $border-base;
  }

  .album-cover-placeholder {
    width: 36px;
    height: 36px;
    border-radius: $radius-sm;
    background-color: $bg-subtle;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $text-tertiary;
    font-size: 18px;
  }

  .album-title {
    font-size: $font-size-sm;
    color: $text-secondary;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 140px;
  }
}

.artists-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;

  .artist-tag {
    .role-text {
      font-size: 10px;
      opacity: 0.8;
    }
  }
}

.text-placeholder {
  color: $text-tertiary;
}

.resource-flags {
  display: flex;
  justify-content: center;
  gap: 4px;

  .flag-tag {
    font-weight: bold;
  }
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: $spacing-md;
}

.album-select-row {
  display: flex;
  gap: $spacing-sm;
  width: 100%;
}

.form-item-tip {
  font-size: $font-size-xs;
  color: $text-tertiary;
  margin-left: $spacing-sm;
}

.artists-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-md;
  border-bottom: 1px solid $border-base;
  padding-bottom: $spacing-sm;

  .subtitle {
    font-size: $font-size-sm;
    color: $text-secondary;
    font-weight: 500;
  }
}

.artist-row {
  display: flex;
  gap: $spacing-sm;
  margin-bottom: $spacing-sm;
  align-items: center;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}

.media-tab-content {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
  margin-top: 16px;
}

.upload-progress-box {
  margin-top: $spacing-sm;
  display: flex;
  flex-direction: column;
  gap: 4px;

  .file-name-text {
    font-size: $font-size-xs;
    color: $text-secondary;
    font-weight: 500;
  }
}

.media-box {
  border: 1px solid $border-base;
  border-radius: $radius-lg;
  background-color: $bg-subtle;
  overflow: hidden;

  &__header {
    background-color: $bg-page;
    padding: $spacing-sm $spacing-md;
    border-bottom: 1px solid $border-base;
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    color: $text-primary;
    font-weight: 600;
    font-size: $font-size-sm;
  }

  &__body {
    padding: $spacing-md;
  }
}

.resource-detail {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
  padding: $spacing-sm $spacing-md;
  border-radius: $radius-md;
  background-color: rgba($success-color, 0.04);
  border: 1px solid rgba($success-color, 0.15);

  .url-text {
    font-size: $font-size-xs;
    color: $text-secondary;
    word-break: break-all;
  }

  .resource-url-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px dashed $border-base;
    padding-top: $spacing-sm;
  }
}

.resource-meta-grid {
  display: grid;
  grid-template-columns: auto 1fr auto 1fr;
  row-gap: 8px;
  column-gap: 16px;
  align-items: center;
  font-size: $font-size-sm;
  color: $text-secondary;

  .meta-label {
    font-weight: 500;
    color: $text-primary;
    text-align: right;
  }
}

.uploader-action {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: $spacing-xs;

  .upload-tip {
    font-size: $font-size-2xs;
    color: $text-tertiary;
  }
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: $spacing-sm;
  padding: $spacing-md;
  border-top: 1px solid $border-base;
}
</style>
