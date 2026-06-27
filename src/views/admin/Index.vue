<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import {
  Plus,
  Delete,
  CircleClose,
  CircleCheck,
  Lock,
  User,
  Refresh,
} from '@element-plus/icons-vue'
import PageHeader from '@/components/PageHeader.vue'
import { useAuthStore } from '@/store/modules/auth'
import {
  fetchAdminsApi,
  createAdminApi,
  resetAdminPasswordApi,
  updateAdminStatusApi,
  deleteAdminApi,
} from '@/api/admin/adminManage'
import type { AdminProfile } from '@/types/admin'

const auth = useAuthStore()

// ---- 数据表格状态 ----
const list = ref<AdminProfile[]>([])
const loading = ref(false)
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)

// ---- 新建管理员弹窗状态 ----
const createDialogVisible = ref(false)
const createLoading = ref(false)
const createFormRef = ref<FormInstance>()
const createForm = reactive({
  username: '',
  password: '',
  email: '',
})

const createRules = reactive<FormRules>({
  username: [
    { required: true, message: '用户名不能为空', trigger: 'blur' },
    { min: 3, max: 50, message: '长度需在 3-50 个字符之间', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '密码不能为空', trigger: 'blur' },
    { min: 8, max: 64, message: '长度需在 8-64 个字符之间', trigger: 'blur' },
  ],
  email: [{ type: 'email', message: '请输入合法的邮箱地址', trigger: 'blur' }],
})

// ---- 重置密码弹窗状态 ----
const pwdDialogVisible = ref(false)
const pwdLoading = ref(false)
const pwdFormRef = ref<FormInstance>()
const pwdForm = reactive({
  adminId: 0,
  username: '',
  newPassword: '',
})

const pwdRules = reactive<FormRules>({
  newPassword: [
    { required: true, message: '新密码不能为空', trigger: 'blur' },
    { min: 8, max: 64, message: '密码长度需在 8-64 个字符之间', trigger: 'blur' },
  ],
})

// ---- 加载管理员列表 ----
async function loadData() {
  loading.value = true
  try {
    const res = await fetchAdminsApi({
      pageNum: pageNum.value,
      pageSize: pageSize.value,
    })
    list.value = res.records
    total.value = res.total
  } catch (err) {
    console.error('加载管理员列表异常:', err)
  } finally {
    loading.value = false
  }
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

// ---- 启用/停用管理员 ----
function handleStatusChange(row: any) {
  const isDisable = row.status === 1
  const actionText = isDisable ? '停用' : '启用'
  const confirmMessage = isDisable
    ? `确认停用管理员【${row.username}】吗？停用后该管理员所有令牌将被立即吊销且不可再登录。`
    : `确认重新启用管理员【${row.username}】吗？`

  ElMessageBox.confirm(confirmMessage, `${actionText}确认`, {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: isDisable ? 'warning' : 'info',
  })
    .then(async () => {
      try {
        const nextStatus = isDisable ? 0 : 1
        await updateAdminStatusApi(row.id, nextStatus)
        ElMessage.success(`管理员已成功${actionText}`)
        loadData()
      } catch (err) {
        console.error(`${actionText}管理员异常:`, err)
      }
    })
    .catch(() => {})
}

// ---- 删除管理员 ----
function handleDelete(row: any) {
  ElMessageBox.confirm(
    `此操作将物理删除管理员【${row.username}】且无法恢复，确定要删除吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    },
  )
    .then(async () => {
      try {
        await deleteAdminApi(row.id)
        ElMessage.success('管理员已成功删除')
        loadData()
      } catch (err) {
        console.error('删除管理员异常:', err)
      }
    })
    .catch(() => {})
}

// ---- 新建管理员弹框 ----
function openCreateDialog() {
  createDialogVisible.value = true
  createLoading.value = false
  createForm.username = ''
  createForm.password = ''
  createForm.email = ''
  createFormRef.value?.resetFields()
}

function handleCreate() {
  createFormRef.value?.validate(async (valid) => {
    if (!valid) return
    createLoading.value = true
    try {
      await createAdminApi(createForm)
      ElMessage.success('新建管理员成功')
      createDialogVisible.value = false
      loadData()
    } catch (err) {
      console.error('新建管理员异常:', err)
    } finally {
      createLoading.value = false
    }
  })
}

// ---- 重置密码弹框 ----
function openPwdDialog(row: any) {
  pwdDialogVisible.value = true
  pwdLoading.value = false
  pwdForm.adminId = row.id
  pwdForm.username = row.username
  pwdForm.newPassword = ''
  pwdFormRef.value?.resetFields()
}

function handleResetPassword() {
  pwdFormRef.value?.validate(async (valid) => {
    if (!valid) return
    pwdLoading.value = true
    try {
      await resetAdminPasswordApi(pwdForm.adminId, { newPassword: pwdForm.newPassword })
      ElMessage.success(`已重置管理员【${pwdForm.username}】的登录密码`)
      pwdDialogVisible.value = false
      loadData()
    } catch (err) {
      console.error('重置密码异常:', err)
    } finally {
      pwdLoading.value = false
    }
  })
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="page-admin">
    <PageHeader
      title="管理员管理"
      subtitle="管理本平台的系统管理员，支持状态管控、密码重置及物理删除(仅超级管理员可见)"
    >
      <template #actions>
        <el-button type="primary" @click="openCreateDialog">
          <el-icon><Plus /></el-icon>
          新建管理员
        </el-button>
      </template>
    </PageHeader>

    <div class="page-admin__content">
      <div class="page-admin__filter">
        <el-button :icon="Refresh" @click="() => { pageNum = 1; loadData() }"> 刷新数据 </el-button>
      </div>

      <el-card shadow="never" class="page-card">
        <el-table v-loading="loading" :data="list" style="width: 100%">
          <el-table-column label="用户名" min-width="150">
            <template #default="{ row }">
              <div class="admin-info">
                <el-avatar :size="32" class="admin-avatar">
                  <el-icon><User /></el-icon>
                </el-avatar>
                <div class="admin-meta">
                  <span class="username">
                    {{ row.username }}
                    <el-tag
                      v-if="row.isRoot === 1"
                      size="small"
                      type="danger"
                      effect="dark"
                      class="role-tag"
                    >
                      超级管理员
                    </el-tag>
                  </span>
                  <span class="email">{{ row.email || '未绑定邮箱' }}</span>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="账号状态" width="120" align="center">
            <template #default="{ row }">
              <el-tag v-if="row.status === 1" type="success" size="small">启用中</el-tag>
              <el-tag v-else type="danger" size="small">已停用</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="lastLoginTime" label="上次登录时间" width="180">
            <template #default="{ row }">
              {{ row.lastLoginTime ? new Date(row.lastLoginTime).toLocaleString() : '从不' }}
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间" width="180">
            <template #default="{ row }">
              {{ new Date(row.createdAt).toLocaleString() }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="240" fixed="right" align="center">
            <template #default="{ row }">
              <!-- 不能对自己进行停用、删除、重置密码 -->
              <template v-if="row.id !== auth.profile?.id && row.isRoot !== 1">
                <el-button
                  v-if="row.status === 1"
                  link
                  type="danger"
                  :icon="CircleClose"
                  @click="handleStatusChange(row)"
                >
                  停用
                </el-button>
                <el-button
                  v-else
                  link
                  type="success"
                  :icon="CircleCheck"
                  @click="handleStatusChange(row)"
                >
                  启用
                </el-button>
                <el-button link type="primary" :icon="Lock" @click="openPwdDialog(row)">
                  重设密码
                </el-button>
                <el-button link type="danger" :icon="Delete" @click="handleDelete(row)">
                  删除
                </el-button>
              </template>
              <span v-else class="text-placeholder">-</span>
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

    <!-- 新建管理员弹窗 -->
    <el-dialog v-model="createDialogVisible" title="新建管理员" width="460px" destroy-on-close>
      <el-form
        ref="createFormRef"
        :model="createForm"
        :rules="createRules"
        label-width="80px"
        label-position="right"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="createForm.username" placeholder="请输入管理员用户名" />
        </el-form-item>
        <el-form-item label="登录密码" prop="password">
          <el-input
            v-model="createForm.password"
            type="password"
            show-password
            placeholder="请输入管理员登录密码"
          />
        </el-form-item>
        <el-form-item label="邮箱地址" prop="email">
          <el-input v-model="createForm.email" placeholder="请输入管理员邮箱(选填)" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="createDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="createLoading" @click="handleCreate">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 重置密码弹窗 -->
    <el-dialog v-model="pwdDialogVisible" title="重置密码" width="440px" destroy-on-close>
      <el-form
        ref="pwdFormRef"
        :model="pwdForm"
        :rules="pwdRules"
        label-width="80px"
        label-position="right"
      >
        <el-form-item label="管理员">
          <el-input v-model="pwdForm.username" disabled />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="pwdForm.newPassword"
            type="password"
            show-password
            placeholder="请输入 8-64 位新密码"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="pwdDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="pwdLoading" @click="handleResetPassword">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.page-admin {
  &__content {
    padding: $spacing-md;
  }

  &__filter {
    margin-bottom: $spacing-md;
  }
}

.page-card {
  border: 1px solid $border-base;
  border-radius: $radius-md;
}

.admin-info {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
}

.admin-meta {
  display: flex;
  flex-direction: column;

  .username {
    font-size: $font-size-sm;
    font-weight: 500;
    color: $text-primary;
    display: flex;
    align-items: center;
    gap: $spacing-xs;
  }

  .email {
    font-size: $font-size-xs;
    color: $text-secondary;
  }
}

.text-placeholder {
  color: $text-tertiary;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: $spacing-md;
}
</style>
