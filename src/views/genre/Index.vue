<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Search, Refresh, Delete, Edit } from '@element-plus/icons-vue'
import PageHeader from '@/components/PageHeader.vue'
import {
  getGenreList, addGenre, updateGenre, deleteGenre,
  type Genre
} from '@/api/admin/genreManage'

// ---- 表格 ----
const list = ref<Genre[]>([])
const loading = ref(false)
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)
const filter = reactive({ query: '' })

// ---- 抽屉 ----
const drawerVisible = ref(false)
const isEdit = ref(false)
const editingId = ref<string>('')
const submitLoading = ref(false)
const formRef = ref<FormInstance>()
const form = reactive({ name: '' })
const formRules = reactive<FormRules>({
  name: [
    { required: true, message: '流派名称不能为空', trigger: 'blur' },
    { max: 100, message: '流派名称不能超过 100 个字符', trigger: 'blur' }
  ]
})

// ---- 数据 ----
async function loadData() {
  loading.value = true
  try {
    const res = await getGenreList({ query: filter.query, pageNum: pageNum.value, pageSize: pageSize.value })
    list.value = res.records
    total.value = Number(res.total) || 0
  } catch (err) {
    console.error('加载流派列表失败:', err)
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

function formatDate(dateStr: string): string {
  if (!dateStr) return '-'
  return dateStr.substring(0, 19).replace('T', ' ')
}

// ---- 表单 ----
function openCreateDrawer() {
  isEdit.value = false
  editingId.value = ''
  drawerVisible.value = true
  form.name = ''
}

function openEditDrawer(row: Genre) {
  isEdit.value = true
  editingId.value = row.id
  drawerVisible.value = true
  form.name = row.name
}

async function handleSave() {
  if (!formRef.value) return
  if (!await formRef.value.validate()) return
  submitLoading.value = true
  try {
    const payload = { name: form.name }
    if (isEdit.value) {
      await updateGenre(editingId.value, payload)
      ElMessage.success('更新流派成功')
    } else {
      await addGenre(payload)
      ElMessage.success('新建流派成功')
    }
    drawerVisible.value = false
    loadData()
  } catch (err) {
    console.error('保存流派失败:', err)
  } finally {
    submitLoading.value = false
  }
}

function handleDelete(row: Genre) {
  ElMessageBox.confirm(`确认删除流派「${row.name}」吗？此操作将清理所有歌曲与该流派的关联关系。`, '危险警告', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteGenre(row.id)
      ElMessage.success('删除成功')
      loadData()
    } catch (err) {
      console.error('删除流派失败:', err)
    }
  }).catch(() => {})
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="page-genre">
    <PageHeader title="流派管理" subtitle="管理音乐流派及其名称">
      <template #actions>
        <el-button type="primary" class="gradient-btn" @click="openCreateDrawer">
          <el-icon><Plus /></el-icon>新建流派
        </el-button>
      </template>
    </PageHeader>

    <div class="page-genre__content">
      <div class="page-genre__filter">
        <el-input v-model="filter.query" placeholder="搜索流派名称..." clearable class="filter-input" @keyup.enter="handleSearch">
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button :icon="Refresh" @click="handleReset">重置</el-button>
      </div>

      <el-card shadow="never" class="page-card">
        <el-table v-loading="loading" :data="list" style="width: 100%">
          <el-table-column prop="id" label="ID" width="120" align="center" />
          <el-table-column label="流派名称" min-width="200">
            <template #default="{ row }">
              <span class="genre-name">{{ row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间" width="200" align="center">
            <template #default="{ row }">
              <span>{{ formatDate(row.createdAt) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" fixed="right" align="center">
            <template #default="{ row }">
              <el-button link type="primary" :icon="Edit" @click="openEditDrawer(row)">编辑</el-button>
              <el-button link type="danger" :icon="Delete" @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination-wrapper">
          <el-pagination v-model:current-page="pageNum" v-model:page-size="pageSize" :total="total" :page-sizes="[10, 20, 50]" layout="total, sizes, prev, pager, next, jumper" @current-change="handlePageChange" @size-change="handleSizeChange" />
        </div>
      </el-card>
    </div>

    <!-- 编辑/新建抽屉 -->
    <el-drawer v-model="drawerVisible" :title="isEdit ? '编辑流派' : '新建流派'" size="400px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="80px" label-position="right" style="margin-top: 16px;">
        <el-form-item label="流派名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入流派名称" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="drawer-footer">
          <el-button @click="drawerVisible = false">取消</el-button>
          <el-button type="primary" class="gradient-btn" :loading="submitLoading" @click="handleSave">保存流派</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<style scoped lang="scss">
.page-genre {
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

.genre-name {
  font-size: $font-size-md;
  font-weight: 500;
  color: $text-primary;
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
