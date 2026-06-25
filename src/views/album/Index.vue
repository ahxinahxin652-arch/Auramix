<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Search, Refresh, Delete, Edit, Collection } from '@element-plus/icons-vue'
import PageHeader from '@/components/PageHeader.vue'
import {
  listAlbums,
  getAlbum,
  updateAlbum,
  deleteAlbum,
  quickCreateAlbum,
  type AlbumListItem,
  type AlbumDetail,
  type AlbumArtist
} from '@/api/admin/albumManage'
import { searchArtists, type ArtistSearchItem } from '@/api/admin/artistManage'

// ---- 表格数据 ----
const list = ref<AlbumListItem[]>([])
const loading = ref(false)
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)

// ---- 过滤条件 ----
const filter = reactive({
  query: ''
})

// ---- 抽屉状态 ----
const drawerVisible = ref(false)
const activeTab = ref('basic')
const isEdit = ref(false)
const editingId = ref('')
const submitLoading = ref(false)

// ---- 表单状态 ----
const formRef = ref<FormInstance>()
const form = reactive<{
  title: string
  albumType: number
  coverUrl: string
  releaseDate: string
  artists: AlbumArtist[]
}>({
  title: '',
  albumType: 0,
  coverUrl: '',
  releaseDate: '',
  artists: []
})

const formRules = reactive<FormRules>({
  title: [
    { required: true, message: '专辑名称不能为空', trigger: 'blur' },
    { max: 200, message: '专辑名称不能超过 200 个字符', trigger: 'blur' }
  ],
  albumType: [
    { required: true, message: '专辑类型不能为空', trigger: 'change' }
  ],
  releaseDate: [
    { required: true, message: '发布日期不能为空', trigger: 'change' }
  ]
})

// ---- 歌手远程搜索 ----
const artistOptions = ref<ArtistSearchItem[]>([])
const loadingArtists = ref(false)

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

// ---- 快速新建专辑对话框 ----
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

// ---- 数据加载 ----
async function loadData() {
  loading.value = true
  try {
    const res = await listAlbums({
      query: filter.query,
      pageNum: pageNum.value,
      pageSize: pageSize.value
    })
    list.value = res.records
    total.value = res.total
  } catch (err) {
    console.error('加载专辑列表失败:', err)
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

// ---- 类型/日期格式化 ----
function formatAlbumType(type: number): string {
  switch (type) {
    case 0: return '专辑'
    case 1: return '单曲'
    case 2: return 'EP'
    default: return '未知'
  }
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '-'
  return dateStr.substring(0, 10)
}

// ---- 歌手关联行管理 ----
function addArtistRow() {
  form.artists.push({
    artistId: '',
    artistName: ''
  })
}

function removeArtistRow(index: number) {
  form.artists.splice(index, 1)
}

// ---- 表单操作 ----
function openCreateDrawer() {
  isEdit.value = false
  editingId.value = ''
  drawerVisible.value = true
  activeTab.value = 'basic'

  form.title = ''
  form.albumType = 0
  form.coverUrl = ''
  form.releaseDate = ''
  form.artists = []
  artistOptions.value = []
}

async function openEditDrawer(row: AlbumListItem) {
  isEdit.value = true
  editingId.value = row.id
  drawerVisible.value = true
  activeTab.value = 'basic'

  try {
    const detail = await getAlbum(row.id)
    form.title = detail.title
    form.albumType = detail.albumType
    form.coverUrl = detail.coverUrl || ''
    form.releaseDate = detail.releaseDate ? formatDate(detail.releaseDate) : ''
    form.artists = detail.artists ? [...detail.artists] : []

    // 预填歌手选项
    if (detail.artists) {
      artistOptions.value = detail.artists.map(a => ({
        id: a.artistId,
        name: a.artistName || '未知歌手',
        coverImg: ''
      }))
    }
  } catch (err) {
    console.error('获取专辑详情失败:', err)
    ElMessage.error('获取专辑详情失败')
    drawerVisible.value = false
  }
}

async function handleSave() {
  if (!formRef.value) return
  const valid = await formRef.value.validate()
  if (!valid) {
    activeTab.value = 'basic'
    return
  }

  submitLoading.value = true
  try {
    const payload = {
      title: form.title,
      albumType: form.albumType,
      coverUrl: form.coverUrl,
      releaseDate: form.releaseDate,
      artistIds: form.artists.map(a => a.artistId)
    }

    if (isEdit.value) {
      await updateAlbum(editingId.value, payload)
      ElMessage.success('更新专辑成功')
    } else {
      // 新建用 quickCreate，然后再更新歌手关联
      const created = await quickCreateAlbum({
        title: form.title,
        albumType: form.albumType,
        coverUrl: form.coverUrl || undefined,
        releaseDate: form.releaseDate || undefined
      })
      if (payload.artistIds.length > 0) {
        await updateAlbum(created.id, payload)
      }
      ElMessage.success('新建专辑成功')
    }

    drawerVisible.value = false
    loadData()
  } catch (err) {
    console.error('保存专辑失败:', err)
  } finally {
    submitLoading.value = false
  }
}

function handleDelete(row: AlbumListItem) {
  ElMessageBox.confirm(`确认删除专辑《${row.title}》吗？此操作将清理关联的歌手关系。`, '危险警告', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        await deleteAlbum(row.id)
        ElMessage.success('删除成功')
        loadData()
      } catch (err) {
        console.error('删除专辑失败:', err)
      }
    })
    .catch(() => {})
}

// ---- 快速新建专辑 ----
function openQuickAlbumDialog() {
  quickAlbumVisible.value = true
  quickAlbumForm.title = ''
  quickAlbumForm.albumType = 0
  quickAlbumForm.releaseDate = ''
  quickAlbumForm.coverUrl = ''
  quickAlbumFormRef.value?.resetFields()
}

async function handleQuickAlbumSubmit() {
  if (!quickAlbumFormRef.value) return
  quickAlbumFormRef.value.validate(async (valid) => {
    if (!valid) return
    quickAlbumLoading.value = true
    try {
      await quickCreateAlbum({
        title: quickAlbumForm.title,
        albumType: quickAlbumForm.albumType,
        coverUrl: quickAlbumForm.coverUrl || undefined,
        releaseDate: quickAlbumForm.releaseDate || undefined
      })
      ElMessage.success('新专辑创建成功')
      quickAlbumVisible.value = false
      loadData()
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
  <div class="page-album">
    <PageHeader title="专辑管理" subtitle="管理平台所有专辑及其歌手关联">
      <template #actions>
        <el-button type="primary" class="gradient-btn" @click="openCreateDrawer">
          <el-icon><Plus /></el-icon>
          新建专辑
        </el-button>
      </template>
    </PageHeader>

    <div class="page-album__content">
      <!-- 过滤栏 -->
      <div class="page-album__filter">
        <el-input
          v-model="filter.query"
          placeholder="搜索专辑标题..."
          clearable
          class="filter-input"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button :icon="Refresh" @click="handleReset">重置</el-button>
      </div>

      <!-- 数据表格 -->
      <el-card shadow="never" class="page-card">
        <el-table v-loading="loading" :data="list" style="width: 100%">
          <el-table-column label="封面" width="100" align="center">
            <template #default="{ row }">
              <el-image
                class="album-cover-thumb"
                :src="row.coverUrl"
                fit="cover"
                lazy
                v-if="row.coverUrl"
              >
                <template #error>
                  <div class="album-cover-placeholder">
                    <el-icon><Collection /></el-icon>
                  </div>
                </template>
              </el-image>
              <div v-else class="album-cover-placeholder">
                <el-icon><Collection /></el-icon>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="专辑信息" min-width="280">
            <template #default="{ row }">
              <div class="album-info-cell">
                <span class="album-title">{{ row.title }}</span>
                <div class="album-meta">
                  <el-tag size="small" :type="row.albumType === 0 ? 'primary' : row.albumType === 1 ? 'success' : 'warning'">
                    {{ formatAlbumType(row.albumType) }}
                  </el-tag>
                  <span class="album-date">{{ formatDate(row.releaseDate) }}</span>
                  <span class="album-id">ID: {{ row.id }}</span>
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="createdAt" label="创建时间" width="180" align="center">
            <template #default="{ row }">
              <span>{{ formatDate(row.createdAt) }}</span>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="140" fixed="right" align="center">
            <template #default="{ row }">
              <el-button link type="primary" :icon="Edit" @click="openEditDrawer(row)">编辑</el-button>
              <el-button link type="danger" :icon="Delete" @click="handleDelete(row)">删除</el-button>
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
      :title="isEdit ? '编辑专辑' : '新建专辑'"
      size="560px"
      destroy-on-close
    >
      <el-tabs v-model="activeTab" class="drawer-tabs">
        <!-- 基础信息 -->
        <el-tab-pane label="基础信息" name="basic">
          <el-form
            ref="formRef"
            :model="form"
            :rules="formRules"
            label-width="90px"
            label-position="right"
            style="margin-top: 16px;"
          >
            <el-form-item label="专辑标题" prop="title">
              <el-input v-model="form.title" placeholder="请输入专辑名称" />
            </el-form-item>

            <el-form-item label="专辑类型" prop="albumType">
              <el-select v-model="form.albumType" style="width: 100%;">
                <el-option label="合辑/标准专辑" :value="0" />
                <el-option label="单曲" :value="1" />
                <el-option label="EP/迷你专辑" :value="2" />
              </el-select>
            </el-form-item>

            <el-form-item label="发布日期" prop="releaseDate">
              <el-date-picker
                v-model="form.releaseDate"
                type="date"
                placeholder="选择发布日期"
                value-format="YYYY-MM-DD"
                style="width: 100%;"
              />
            </el-form-item>

            <el-form-item label="封面链接" prop="coverUrl">
              <el-input v-model="form.coverUrl" placeholder="输入封面海报图片 URL" />
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 歌手关联 -->
        <el-tab-pane label="歌手关联" name="artists">
          <div style="margin-top: 16px">
            <div class="artists-header">
              <span class="subtitle">关联歌手 (支持多名歌手)</span>
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
                style="flex: 1"
              >
                <el-option
                  v-for="art in artistOptions"
                  :key="art.id"
                  :label="art.name"
                  :value="art.id"
                />
              </el-select>
              <el-button type="danger" :icon="Delete" circle @click="removeArtistRow(index)" />
            </div>

            <el-empty v-if="form.artists.length === 0" description="暂未关联歌手，点击上方按钮添加" :image-size="60" />
          </div>
        </el-tab-pane>
      </el-tabs>

      <template #footer>
        <div class="drawer-footer">
          <el-button @click="drawerVisible = false">取消</el-button>
          <el-button type="primary" class="gradient-btn" :loading="submitLoading" @click="handleSave">
            保存专辑
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
            创建
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.page-album {
  &__content {
    padding: $spacing-md;
  }

  &__filter {
    display: flex;
    gap: $spacing-sm;
    margin-bottom: $spacing-md;

    .filter-input {
      width: 280px;
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

.album-cover-thumb {
  width: 56px;
  height: 56px;
  border-radius: $radius-sm;
  border: 1px solid $border-base;
}

.album-cover-placeholder {
  width: 56px;
  height: 56px;
  border-radius: $radius-sm;
  background-color: $bg-subtle;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $text-tertiary;
  font-size: 22px;
  margin: 0 auto;
}

.album-info-cell {
  display: flex;
  flex-direction: column;
  gap: 6px;

  .album-title {
    font-size: $font-size-sm;
    font-weight: 600;
    color: $text-primary;
  }

  .album-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: $font-size-2xs;
    color: $text-tertiary;

    .album-date {
      color: $text-secondary;
    }
  }
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: $spacing-md;
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: $spacing-sm;
  padding: $spacing-md;
  border-top: 1px solid $border-base;
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
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: $spacing-sm;
}
</style>
