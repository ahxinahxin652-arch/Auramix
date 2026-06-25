<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Search, Refresh, Delete, Edit, Avatar } from '@element-plus/icons-vue'
import PageHeader from '@/components/PageHeader.vue'
import {
  listArtists,
  getArtist,
  createArtist,
  updateArtist,
  deleteArtist,
  type ArtistListItem,
  type ArtistDetail
} from '@/api/admin/artistManage'

// ---- 表格数据 ----
const list = ref<ArtistListItem[]>([])
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
const isEdit = ref(false)
const editingId = ref('')
const submitLoading = ref(false)

// ---- 表单状态 ----
const formRef = ref<FormInstance>()
const form = reactive<{
  name: string
  coverImg: string
  bio: string
}>({
  name: '',
  coverImg: '',
  bio: ''
})

const formRules = reactive<FormRules>({
  name: [
    { required: true, message: '歌手名称不能为空', trigger: 'blur' },
    { max: 200, message: '歌手名称不能超过 200 个字符', trigger: 'blur' }
  ]
})

// ---- 数据加载 ----
async function loadData() {
  loading.value = true
  try {
    const res = await listArtists({
      query: filter.query,
      pageNum: pageNum.value,
      pageSize: pageSize.value
    })
    list.value = res.records
    total.value = res.total
  } catch (err) {
    console.error('加载歌手列表失败:', err)
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

// ---- 格式化 ----
function formatDate(dateStr: string): string {
  if (!dateStr) return '-'
  return dateStr.substring(0, 10)
}

function truncateBio(bio: string, maxLen: number = 80): string {
  if (!bio) return '-'
  if (bio.length <= maxLen) return bio
  return bio.substring(0, maxLen) + '...'
}

// ---- 表单操作 ----
function openCreateDrawer() {
  isEdit.value = false
  editingId.value = ''
  drawerVisible.value = true

  form.name = ''
  form.coverImg = ''
  form.bio = ''
}

async function openEditDrawer(row: ArtistListItem) {
  isEdit.value = true
  editingId.value = row.id
  drawerVisible.value = true

  try {
    const detail = await getArtist(row.id)
    form.name = detail.name
    form.coverImg = detail.coverImg || ''
    form.bio = detail.bio || ''
  } catch (err) {
    console.error('获取歌手详情失败:', err)
    ElMessage.error('获取歌手详情失败')
    drawerVisible.value = false
  }
}

async function handleSave() {
  if (!formRef.value) return
  const valid = await formRef.value.validate()
  if (!valid) return

  submitLoading.value = true
  try {
    const payload = {
      name: form.name,
      coverImg: form.coverImg,
      bio: form.bio
    }

    if (isEdit.value) {
      await updateArtist(editingId.value, payload)
      ElMessage.success('更新歌手成功')
    } else {
      await createArtist(payload)
      ElMessage.success('新建歌手成功')
    }

    drawerVisible.value = false
    loadData()
  } catch (err) {
    console.error('保存歌手失败:', err)
  } finally {
    submitLoading.value = false
  }
}

function handleDelete(row: ArtistListItem) {
  ElMessageBox.confirm(`确认删除歌手「${row.name}」吗？此操作将清理该歌手的所有关联关系（歌曲、专辑、关注等）。`, '危险警告', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        await deleteArtist(row.id)
        ElMessage.success('删除成功')
        loadData()
      } catch (err) {
        console.error('删除歌手失败:', err)
      }
    })
    .catch(() => {})
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="page-artist">
    <PageHeader title="歌手管理" subtitle="管理平台所有歌手/艺人信息">
      <template #actions>
        <el-button type="primary" class="gradient-btn" @click="openCreateDrawer">
          <el-icon><Plus /></el-icon>
          新建歌手
        </el-button>
      </template>
    </PageHeader>

    <div class="page-artist__content">
      <!-- 过滤栏 -->
      <div class="page-artist__filter">
        <el-input
          v-model="filter.query"
          placeholder="搜索歌手名称..."
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
          <el-table-column label="头像" width="80" align="center">
            <template #default="{ row }">
              <el-avatar v-if="row.coverImg" :src="row.coverImg" :size="48" shape="square" />
              <el-avatar v-else :size="48" shape="square" :icon="Avatar" />
            </template>
          </el-table-column>

          <el-table-column label="歌手信息" min-width="320">
            <template #default="{ row }">
              <div class="artist-info-cell">
                <span class="artist-name">{{ row.name }}</span>
                <span class="artist-bio">{{ truncateBio(row.bio) }}</span>
                <span class="artist-id">ID: {{ row.id }}</span>
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
      :title="isEdit ? '编辑歌手' : '新建歌手'"
      size="500px"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-width="90px"
        label-position="right"
        style="margin-top: 16px;"
      >
        <el-form-item label="歌手名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入歌手/艺人名称" />
        </el-form-item>

        <el-form-item label="头像链接" prop="coverImg">
          <el-input v-model="form.coverImg" placeholder="输入头像/照片图片 URL" />
        </el-form-item>

        <el-form-item label="简介" prop="bio">
          <el-input
            v-model="form.bio"
            type="textarea"
            :rows="6"
            placeholder="歌手简介 / 个人描述"
            maxlength="2000"
            show-word-limit
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="drawer-footer">
          <el-button @click="drawerVisible = false">取消</el-button>
          <el-button type="primary" class="gradient-btn" :loading="submitLoading" @click="handleSave">
            保存歌手
          </el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<style scoped lang="scss">
.page-artist {
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

.artist-info-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;

  .artist-name {
    font-size: $font-size-sm;
    font-weight: 600;
    color: $text-primary;
  }

  .artist-bio {
    font-size: $font-size-2xs;
    color: $text-secondary;
    line-height: 1.4;
  }

  .artist-id {
    font-size: $font-size-2xs;
    color: $text-tertiary;
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
</style>
