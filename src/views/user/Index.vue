<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Search, Refresh, User, CircleClose, CircleCheck } from '@element-plus/icons-vue'
import PageHeader from '@/components/PageHeader.vue'
import {
  fetchUsersApi,
  createUserApi,
  updateUserStatusApi,
  type UserListItem,
} from '@/api/admin/userManage'

// ---- 数据表格状态 ----
const list = ref<UserListItem[]>([])
const loading = ref(false)
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)

// ---- 搜索条件 ----
const filter = reactive({
  query: '',
  status: null as number | null,
})

// ---- 新建用户弹窗状态 ----
const dialogVisible = ref(false)
const dialogLoading = ref(false)
const formRef = ref<FormInstance>()
const form = reactive({
  email: '',
  displayName: '',
  password: '',
  country: 'CN',
})

const rules = reactive<FormRules>({
  email: [
    { required: true, message: '邮箱不能为空', trigger: 'blur' },
    { type: 'email', message: '请输入合法的邮箱地址', trigger: 'blur' },
  ],
  displayName: [
    { required: true, message: '昵称不能为空', trigger: 'blur' },
    { min: 1, max: 100, message: '长度需在 1-100 个字符之间', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '密码不能为空', trigger: 'blur' },
    { min: 8, max: 64, message: '长度需在 8-64 个字符之间', trigger: 'blur' },
  ],
  country: [{ min: 2, max: 2, message: '请输入 2 位 ISO 国家代码', trigger: 'blur' }],
})

// ---- 获取列表 ----
async function loadData() {
  loading.value = true
  try {
    const res = await fetchUsersApi({
      query: filter.query,
      status: filter.status,
      pageNum: pageNum.value,
      pageSize: pageSize.value,
    })
    list.value = res.records
    total.value = Number(res.total) || 0
  } catch (err) {
    console.error('加载用户列表异常:', err)
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
  filter.status = null
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

// ---- 状态控制：封禁/启用 ----
function handleStatusChange(row: any) {
  const isBan = row.status === 0
  const actionText = isBan ? '封禁' : '解封'
  const confirmMessage = isBan
    ? `确认封禁用户【${row.displayName} (${row.email})】吗？封禁后其会话将被强制吊销且无法登录。`
    : `确认解封用户【${row.displayName} (${row.email})】吗？`

  ElMessageBox.confirm(confirmMessage, `${actionText}确认`, {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: isBan ? 'warning' : 'info',
  })
    .then(async () => {
      try {
        const nextStatus = isBan ? -1 : 0
        await updateUserStatusApi(row.id, nextStatus)
        ElMessage.success(`用户已成功${actionText}`)
        loadData()
      } catch (err) {
        console.error(`${actionText}异常:`, err)
      }
    })
    .catch(() => {})
}

// ---- 新建用户 ----
function openCreateDialog() {
  dialogVisible.value = true
  dialogLoading.value = false
  form.email = ''
  form.displayName = ''
  form.password = ''
  form.country = 'CN'
  formRef.value?.resetFields()
}

function handleCreate() {
  formRef.value?.validate(async (valid) => {
    if (!valid) return
    dialogLoading.value = true
    try {
      await createUserApi(form)
      ElMessage.success('新建用户成功')
      dialogVisible.value = false
      loadData()
    } catch (err) {
      console.error('新建用户异常:', err)
    } finally {
      dialogLoading.value = false
    }
  })
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="page-user">
    <PageHeader title="用户管理" subtitle="管理 Auramix 流媒体音乐平台的所有最终用户">
      <template #actions>
        <el-button type="primary" @click="openCreateDialog">
          <el-icon><Plus /></el-icon>
          新建用户
        </el-button>
      </template>
    </PageHeader>

    <div class="page-user__content">
      <!-- 过滤栏 -->
      <div class="page-user__filter">
        <el-input
          v-model="filter.query"
          placeholder="搜索邮箱或昵称..."
          clearable
          class="filter-input"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select
          v-model="filter.status"
          placeholder="用户状态"
          clearable
          class="filter-select"
          @change="handleSearch"
        >
          <el-option label="正常" :value="0" />
          <el-option label="已封禁" :value="-1" />
        </el-select>
        <el-button type="primary" @click="handleSearch"> 查询 </el-button>
        <el-button :icon="Refresh" @click="handleReset"> 重置 </el-button>
      </div>

      <!-- 表格数据 -->
      <el-card shadow="never" class="page-card">
        <el-table v-loading="loading" :data="list" style="width: 100%">
          <el-table-column label="用户昵称" min-width="280">
            <template #default="{ row }">
              <div class="user-info">
                <el-avatar :size="32" :src="row.avatarUrl" class="user-avatar">
                  <el-icon><User /></el-icon>
                </el-avatar>
                <div class="user-meta">
                  <span class="display-name">{{ row.displayName }}</span>
                  <span class="email">{{ row.email }}</span>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="country" label="地区" width="100" align="center">
            <template #default="{ row }">
              <el-tag size="small" type="info">{{ row.country }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="product" label="订阅级别" width="140" align="center">
            <template #default="{ row }">
              <el-tag v-if="row.product === 1" type="warning" effect="dark" size="small">
                Premium 会员
              </el-tag>
              <el-tag v-else type="info" size="small">Free 免费</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="账号状态" width="140" align="center">
            <template #default="{ row }">
              <el-tag v-if="row.status === 0" type="success" size="small">正常</el-tag>
              <el-tag v-else type="danger" size="small">已封禁</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="注册时间" min-width="180">
            <template #default="{ row }">
              {{ new Date(row.createdAt).toLocaleString() }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" fixed="right" align="center">
            <template #default="{ row }">
              <el-button
                v-if="row.status === 0"
                link
                type="danger"
                :icon="CircleClose"
                @click="handleStatusChange(row)"
              >
                封禁
              </el-button>
              <el-button
                v-else
                link
                type="success"
                :icon="CircleCheck"
                @click="handleStatusChange(row)"
              >
                解封
              </el-button>
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

    <!-- 新建用户弹窗 -->
    <el-dialog v-model="dialogVisible" title="新建用户" width="480px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px" label-position="right">
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱地址" />
        </el-form-item>
        <el-form-item label="昵称" prop="displayName">
          <el-input v-model="form.displayName" placeholder="请输入用户昵称" />
        </el-form-item>
        <el-form-item label="初始密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            show-password
            placeholder="请输入初始密码"
          />
        </el-form-item>
        <el-form-item label="国家/地区" prop="country">
          <el-input v-model="form.country" placeholder="请输入国家代码，如 CN, US" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="dialogLoading" @click="handleCreate">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.page-user {
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
      width: 150px;
    }
  }
}

.page-card {
  border: 1px solid $border-base;
  border-radius: $radius-md;
}

.user-info {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
}

.user-meta {
  display: flex;
  flex-direction: column;

  .display-name {
    font-size: $font-size-sm;
    font-weight: 500;
    color: $text-primary;
  }

  .email {
    font-size: $font-size-xs;
    color: $text-secondary;
  }
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: $spacing-md;
}
</style>
