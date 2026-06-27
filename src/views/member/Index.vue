<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import {
  Search,
  Refresh,
  Plus,
  Edit,
  GoldMedal,
  Wallet,
  Ticket,
  User,
} from '@element-plus/icons-vue'
import PageHeader from '@/components/PageHeader.vue'
import request from '@/utils/request'

const router = useRouter()

// ==================== Tab 切换 ====================
const activeTab = ref<'plans' | 'users' | 'subscriptions'>('plans')

// ==================== 通用类型 ====================
interface UserMembership {
  userId: number
  displayName: string
  email: string
  avatarUrl: string
  planId: number
  planName: string
  planDescription: string
  planLevel: number
  originalPrice: number
  price: number
  durationMonths: number
  startDate: string
  endDate: string
  purchaseCount: number
}

interface BenefitItem {
  id: number
  planId: number
  benefitKey: string
  benefitValue: string
  benefitType: number
  status: number
  sortOrder: number
  createdAt: string
  updatedAt: string
}

// 会员方案：与后端 GET /api/admin/manage/member/plans 响应一致
interface MemberPlan {
  id?: number
  name: string
  description: string
  durationMonths: number
  price: number
  originalPrice: number
  level: number
  status: number
  sortOrder: number
  createdAt?: string
  updatedAt?: string
  benefits?: BenefitItem[]
}

interface PaymentOrder {
  id: number
  orderNo: string
  userId: number
  displayName: string
  email: string
  avatarUrl: string
  planId: number
  planName: string
  amount: number
  currency: string
  payType: number
  status: number
  payTime: string
  expireTime: string
  transactionId: string
  refundTime: string | null
  createdAt: string
  updatedAt: string
}

// ==================== 会员用户：全量数据 + 前端过滤 ====================
const userAllList = ref<UserMembership[]>([])
const userLoading = ref(false)

const userFilter = reactive({
  query: '',
  planLevel: undefined as number | undefined,
})

// ==================== 会员方案：全量数据 + 前端过滤 ====================
const planAllList = ref<MemberPlan[]>([])
const planLoading = ref(false)

const planFilter = reactive({
  query: '',
  status: undefined as number | undefined,
})

// 前端过滤后的方案列表
const planList = computed(() => {
  return planAllList.value.filter((p) => {
    if (planFilter.query && !p.name.toLowerCase().includes(planFilter.query.toLowerCase())) return false
    if (planFilter.status !== undefined && p.status !== planFilter.status) return false
    return true
  })
})

// 方案抽屉
const planDrawerVisible = ref(false)
const planDrawerLoading = ref(false)
const planIsEdit = ref(false)
const planEditingId = ref<number | undefined>(undefined)
const planFormRef = ref<FormInstance>()
const planForm = reactive<MemberPlan>({
  name: '',
  description: '',
  durationMonths: 1,
  price: 0,
  originalPrice: 0,
  level: 1,
  status: 1,
  sortOrder: 0,
})

const planRules = reactive<FormRules>({
  name: [
    { required: true, message: '方案名称不能为空', trigger: 'blur' },
    { max: 50, message: '方案名称不能超过 50 个字符', trigger: 'blur' },
  ],
  durationMonths: [{ required: true, message: '时长不能为空', trigger: 'blur' }],
  price: [{ required: true, message: '价格不能为空', trigger: 'blur' }],
  level: [{ required: true, message: '会员等级不能为空', trigger: 'change' }],
})

// ==================== 订阅记录：全量数据 + 前端过滤 ====================
const subAllList = ref<PaymentOrder[]>([])
const subLoading = ref(false)

const subFilter = reactive({
  query: '',
  status: undefined as number | undefined,
})

const subList = computed(() => {
  return subAllList.value.filter((s) => {
    if (
      subFilter.query &&
      !s.orderNo.toLowerCase().includes(subFilter.query.toLowerCase()) &&
      !s.displayName.toLowerCase().includes(subFilter.query.toLowerCase()) &&
      !s.email.toLowerCase().includes(subFilter.query.toLowerCase())
    )
      return false
    if (subFilter.status !== undefined && s.status !== subFilter.status) return false
    return true
  })
})

// ==================== 会员用户：前端过滤 ====================
const userList = computed(() => {
  return userAllList.value.filter((u) => {
    if (
      userFilter.query &&
      !u.displayName.toLowerCase().includes(userFilter.query.toLowerCase()) &&
      !u.email.toLowerCase().includes(userFilter.query.toLowerCase())
    )
      return false
    if (userFilter.planLevel !== undefined && u.planLevel !== userFilter.planLevel) return false
    return true
  })
})

// ==================== 会员用户：方法 ====================
async function loadUsers() {
  userLoading.value = true
  try {
    const res = await request.get<unknown, UserMembership[]>('/admin/manage/member/userMemberships')
    userAllList.value = Array.isArray(res) ? res : []
  } catch (err) {
    console.error('加载会员用户列表异常:', err)
    userAllList.value = []
  } finally {
    userLoading.value = false
  }
}

function handleUserSearch() {
  // 前端过滤，computed 自动响应
}

function handleUserReset() {
  userFilter.query = ''
  userFilter.planLevel = undefined
}

// ==================== 会员方案：方法 ====================
async function loadPlans() {
  planLoading.value = true
  try {
    // GET /api/admin/manage/member/plans 直接返回 MemberPlan[] 数组
    const res = await request.get<unknown, MemberPlan[]>('/admin/manage/member/plans')
    planAllList.value = Array.isArray(res) ? res : []
  } catch (err) {
    console.error('加载会员方案异常:', err)
    planAllList.value = []
  } finally {
    planLoading.value = false
  }
}

function handlePlanSearch() {
  // 前端过滤，computed 自动响应，无需重新请求
}

function handlePlanReset() {
  planFilter.query = ''
  planFilter.status = undefined
}

function openCreatePlanDrawer() {
  planIsEdit.value = false
  planEditingId.value = undefined
  planDrawerVisible.value = true
  planForm.name = ''
  planForm.description = ''
  planForm.durationMonths = 1
  planForm.price = 0
  planForm.originalPrice = 0
  planForm.level = 1
  planForm.status = 1
  planForm.sortOrder = 0
}

function openEditPlanDrawer(row: MemberPlan) {
  planIsEdit.value = true
  planEditingId.value = row.id
  planDrawerVisible.value = true
  planForm.name = row.name
  planForm.description = row.description
  planForm.durationMonths = row.durationMonths
  planForm.price = row.price
  planForm.originalPrice = row.originalPrice
  planForm.level = row.level
  planForm.status = row.status
  planForm.sortOrder = row.sortOrder
}

async function handlePlanSave() {
  if (!planFormRef.value) return
  const valid = await planFormRef.value.validate().catch(() => false)
  if (!valid) return

  planDrawerLoading.value = true
  try {
    const payload: MemberPlan = { ...planForm }
    if (planIsEdit.value && planEditingId.value !== undefined) {
      await request.put(`/admin/manage/member/editPlans/${planEditingId.value}`, payload)
      ElMessage.success('更新方案成功')
    } else {
      await request.post('/admin/manage/member/addPlans', payload)
      ElMessage.success('新建方案成功')
    }
    planDrawerVisible.value = false
    loadPlans()
  } catch (err) {
    console.error('保存会员方案失败:', err)
  } finally {
    planDrawerLoading.value = false
  }
}

function handlePlanStatusToggle(row: MemberPlan) {
  const isOnline = row.status === 1
  const actionText = isOnline ? '下架' : '上架'
  ElMessageBox.confirm(`确认${actionText}方案【${row.name}】吗？`, `${actionText}确认`, {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: isOnline ? 'warning' : 'info',
  })
    .then(async () => {
      try {
        const nextStatus = isOnline ? 0 : 1
        await request.put(`/admin/manage/member/editPlans/${row.id}`, { status: nextStatus })
        ElMessage.success(`方案已${actionText}`)
        loadPlans()
      } catch (err) {
        console.error(`${actionText}方案异常:`, err)
      }
    })
    .catch(() => {})
}

function goToPerks(row: MemberPlan) {
  router.push({ path: `/member/perks/${row.id}`, query: { name: row.name } })
}

// ==================== 订阅记录：方法 ====================
async function loadSubscriptions() {
  subLoading.value = true
  try {
    const res = await request.get<unknown, PaymentOrder[]>('/admin/manage/member/paymentOrders')
    subAllList.value = Array.isArray(res) ? res : []
  } catch (err) {
    console.error('加载订阅记录异常:', err)
    subAllList.value = []
  } finally {
    subLoading.value = false
  }
}

function handleSubSearch() {
  // 前端过滤，computed 自动响应
}

function handleSubReset() {
  subFilter.query = ''
  subFilter.status = undefined
}

// ==================== Tab 切换加载 ====================
function handleTabChange(name: string | number) {
  const tab = name as 'plans' | 'users' | 'subscriptions'
  if (tab === 'users' && userAllList.value.length === 0) {
    loadUsers()
  } else if (tab === 'subscriptions' && subAllList.value.length === 0) {
    loadSubscriptions()
  }
}

// ==================== 格式化辅助 ====================
function formatDate(dateStr: string): string {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

function formatDateTime(dateStr: string): string {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN')
}

function isExpired(endTime: string): boolean {
  if (!endTime) return false
  return new Date(endTime).getTime() < Date.now()
}

// 价格格式化：单位为元
function formatPlanPrice(price: number): string {
  if (price === undefined || price === null) return '¥0.00'
  return `¥${Number(price).toFixed(2)}`
}

function levelText(level: number): string {
  switch (level) {
    case 1:
      return '月度会员'
    case 2:
      return '季度会员'
    case 3:
      return '年度会员'
    case 4:
      return '终身会员'
    default:
      return '未知'
  }
}

function levelTagType(level: number): 'success' | 'warning' | 'primary' | 'danger' | 'info' {
  switch (level) {
    case 1:
      return 'info'
    case 2:
      return 'success'
    case 3:
      return 'warning'
    case 4:
      return 'danger'
    default:
      return 'info'
  }
}

function payTypeText(type: number): string {
  switch (type) {
    case 1:
      return '微信支付'
    case 2:
      return '支付宝'
    case 3:
      return 'Apple Pay'
    default:
      return '未知'
  }
}

function payStatusText(status: number): string {
  switch (status) {
    case 0:
      return '待支付'
    case 1:
      return '处理中'
    case 2:
      return '已支付'
    case 3:
      return '已退款'
    case 4:
      return '已取消'
    default:
      return '未知'
  }
}

function payStatusTagType(status: number): 'success' | 'warning' | 'danger' | 'info' {
  switch (status) {
    case 0:
      return 'warning'
    case 1:
      return 'info'
    case 2:
      return 'success'
    case 3:
      return 'info'
    case 4:
      return 'danger'
    default:
      return 'info'
  }
}

onMounted(() => {
  loadPlans()
})
</script>

<template>
  <div class="page-member">
    <PageHeader title="会员管理" subtitle="管理 Auramix 平台会员方案、会员用户与订阅记录" />

    <div class="page-member__content">
      <!-- 横向导航栏 -->
      <el-tabs v-model="activeTab" class="member-tabs" @tab-change="handleTabChange">
        <!-- ========== 会员方案 ========== -->
        <el-tab-pane name="plans">
          <template #label>
            <span class="tab-label">
              <el-icon><Ticket /></el-icon>
              <span>会员方案</span>
            </span>
          </template>

          <!-- 筛选栏 -->
          <div class="filter-bar">
            <el-input
              v-model="planFilter.query"
              placeholder="搜索方案名称..."
              clearable
              class="filter-input"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>

            <el-select
              v-model="planFilter.status"
              placeholder="方案状态"
              clearable
              class="filter-select"
            >
              <el-option label="已上架" :value="1" />
              <el-option label="已下架" :value="0" />
            </el-select>

            <el-button :icon="Refresh" @click="handlePlanReset">重置</el-button>

            <div class="filter-spacer" />
            <el-button type="primary" class="gradient-btn" :icon="Plus" @click="openCreatePlanDrawer">
              新建方案
            </el-button>
          </div>

          <!-- 方案表格 -->
          <el-card shadow="never" class="page-card">
            <el-table v-loading="planLoading" :data="planList" style="width: 100%">
              <el-table-column prop="name" label="方案名称" min-width="160">
                <template #default="{ row }">
                  <div class="plan-name-cell">
                    <el-icon class="plan-icon"><GoldMedal /></el-icon>
                    <span class="plan-name">{{ row.name }}</span>
                  </div>
                </template>
              </el-table-column>

              <el-table-column prop="level" label="会员等级" width="120" align="center">
                <template #default="{ row }">
                  <el-tag :type="levelTagType(row.level)" size="small">{{ levelText(row.level) }}</el-tag>
                </template>
              </el-table-column>

              <el-table-column prop="durationMonths" label="时长(月)" width="100" align="center" />

              <el-table-column prop="sortOrder" label="排序" width="70" align="center" />

              <el-table-column label="价格" width="160" align="center">
                <template #default="{ row }">
                  <div class="price-cell">
                    <span class="price-current">{{ formatPlanPrice(row.price) }}</span>
                    <span v-if="row.originalPrice > 0" class="price-original">
                      {{ formatPlanPrice(row.originalPrice) }}
                    </span>
                  </div>
                </template>
              </el-table-column>

              <el-table-column prop="description" label="方案描述" min-width="180" show-overflow-tooltip />

              <el-table-column label="会员权益" width="110" align="center">
                <template #default="{ row }">
                  <el-button link type="primary" size="small" @click="goToPerks(row as MemberPlan)">
                    查看详情
                  </el-button>
                </template>
              </el-table-column>

              <el-table-column prop="status" label="状态" width="100" align="center">
                <template #default="{ row }">
                  <el-tag v-if="row.status === 1" type="success" size="small">已上架</el-tag>
                  <el-tag v-else type="info" size="small">已下架</el-tag>
                </template>
              </el-table-column>

              <el-table-column label="操作" width="160" fixed="right" align="center">
                <template #default="{ row }">
                  <el-button link type="primary" :icon="Edit" @click="openEditPlanDrawer(row as MemberPlan)">
                    编辑
                  </el-button>
                  <el-button
                    link
                    :type="row.status === 1 ? 'warning' : 'success'"
                    @click="handlePlanStatusToggle(row as MemberPlan)"
                  >
                    {{ row.status === 1 ? '下架' : '上架' }}
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-tab-pane>

        <!-- ========== 会员用户 ========== -->
        <el-tab-pane name="users">
          <template #label>
            <span class="tab-label">
              <el-icon><User /></el-icon>
              <span>会员用户</span>
            </span>
          </template>

          <!-- 筛选栏 -->
          <div class="filter-bar">
            <el-input
              v-model="userFilter.query"
              placeholder="搜索用户昵称 / 邮箱..."
              clearable
              class="filter-input"
              @keyup.enter="handleUserSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>

            <el-select
              v-model="userFilter.planLevel"
              placeholder="会员等级"
              clearable
              class="filter-select"
            >
              <el-option label="月度会员" :value="1" />
              <el-option label="季度会员" :value="2" />
              <el-option label="年度会员" :value="3" />
              <el-option label="终身会员" :value="4" />
            </el-select>

            <el-button :icon="Refresh" @click="handleUserReset">重置</el-button>
          </div>

          <!-- 用户表格 -->
          <el-card shadow="never" class="page-card">
            <el-empty v-if="!userLoading && userList.length === 0" description="暂无会员用户数据" />

            <el-table v-else v-loading="userLoading" :data="userList" style="width: 100%">
              <el-table-column label="会员用户" min-width="220">
                <template #default="{ row }">
                  <div class="member-user-info">
                    <el-avatar :size="36" :src="row.avatarUrl">
                      {{ row.displayName?.charAt(0)?.toUpperCase() }}
                    </el-avatar>
                    <div class="member-meta">
                      <span class="member-name">{{ row.displayName }}</span>
                      <span class="member-email">{{ row.email }}</span>
                    </div>
                  </div>
                </template>
              </el-table-column>

              <el-table-column label="会员方案" min-width="180">
                <template #default="{ row }">
                  <div>
                    <el-tag :type="levelTagType(row.planLevel)" size="small">{{ row.planName }}</el-tag>
                  </div>
                </template>
              </el-table-column>

              <el-table-column label="方案描述" min-width="200" show-overflow-tooltip>
                <template #default="{ row }">
                  <span class="desc-text">{{ row.planDescription }}</span>
                </template>
              </el-table-column>

              <el-table-column label="价格" width="140" align="center">
                <template #default="{ row }">
                  <div class="price-cell">
                    <span class="price-current">{{ formatPlanPrice(row.price) }}</span>
                    <span v-if="row.originalPrice > 0" class="price-original">
                      {{ formatPlanPrice(row.originalPrice) }}
                    </span>
                  </div>
                </template>
              </el-table-column>

              <el-table-column label="有效期" min-width="200" align="center">
                <template #default="{ row }">
                  <div class="period-info">
                    <span class="period-date">{{ formatDate(row.startDate) }}</span>
                    <span class="period-sep">~</span>
                    <span class="period-date" :class="{ 'period-expired': isExpired(row.endDate) }">
                      {{ formatDate(row.endDate) }}
                    </span>
                  </div>
                </template>
              </el-table-column>

              <el-table-column prop="durationMonths" label="时长(月)" width="100" align="center" />

              <el-table-column prop="purchaseCount" label="购买次数" width="100" align="center">
                <template #default="{ row }">
                  <el-tag :type="row.purchaseCount > 1 ? 'warning' : 'info'" size="small">
                    {{ row.purchaseCount }} 次
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-tab-pane>

        <!-- ========== 订阅记录 ========== -->
        <el-tab-pane name="subscriptions">
          <template #label>
            <span class="tab-label">
              <el-icon><Wallet /></el-icon>
              <span>订阅记录</span>
            </span>
          </template>

          <!-- 筛选栏 -->
          <div class="filter-bar">
            <el-input
              v-model="subFilter.query"
              placeholder="搜索订单号 / 用户昵称 / 邮箱..."
              clearable
              class="filter-input"
              @keyup.enter="handleSubSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>

            <el-select
              v-model="subFilter.status"
              placeholder="支付状态"
              clearable
              class="filter-select"
            >
              <el-option label="待支付" :value="0" />
              <el-option label="处理中" :value="1" />
              <el-option label="已支付" :value="2" />
              <el-option label="已退款" :value="3" />
              <el-option label="已取消" :value="4" />
            </el-select>

            <el-button :icon="Refresh" @click="handleSubReset">重置</el-button>
          </div>

          <!-- 订阅记录表格 -->
          <el-card shadow="never" class="page-card">
            <el-empty v-if="!subLoading && subList.length === 0" description="暂无订阅记录" />

            <el-table v-else v-loading="subLoading" :data="subList" style="width: 100%">
              <el-table-column prop="orderNo" label="订单号" min-width="180">
                <template #default="{ row }">
                  <span class="order-no">{{ row.orderNo }}</span>
                </template>
              </el-table-column>

              <el-table-column label="用户" min-width="200">
                <template #default="{ row }">
                  <div class="member-user-info">
                    <el-avatar :size="32" :src="row.avatarUrl">
                      {{ row.displayName?.charAt(0)?.toUpperCase() }}
                    </el-avatar>
                    <div class="member-meta">
                      <span class="member-name">{{ row.displayName }}</span>
                      <span class="member-email">{{ row.email }}</span>
                    </div>
                  </div>
                </template>
              </el-table-column>

              <el-table-column prop="planName" label="订阅方案" width="140" align="center" />

              <el-table-column label="支付金额" width="120" align="center">
                <template #default="{ row }">
                  <span class="amount-text">{{ formatPlanPrice(row.amount) }}</span>
                </template>
              </el-table-column>

              <el-table-column label="支付方式" width="100" align="center">
                <template #default="{ row }">
                  <span>{{ payTypeText(row.payType) }}</span>
                </template>
              </el-table-column>

              <el-table-column label="支付状态" width="100" align="center">
                <template #default="{ row }">
                  <el-tag :type="payStatusTagType(row.status)" size="small">
                    {{ payStatusText(row.status) }}
                  </el-tag>
                </template>
              </el-table-column>

              <el-table-column label="交易号" min-width="160" align="center" show-overflow-tooltip>
                <template #default="{ row }">
                  <span class="order-no">{{ row.transactionId || '-' }}</span>
                </template>
              </el-table-column>

              <el-table-column label="支付时间" width="160" align="center">
                <template #default="{ row }">
                  <span>{{ formatDateTime(row.payTime) }}</span>
                </template>
              </el-table-column>

              <el-table-column label="创建时间" width="160" align="center">
                <template #default="{ row }">
                  <span>{{ formatDateTime(row.createdAt) }}</span>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 新建/编辑方案抽屉 -->
    <el-drawer
      v-model="planDrawerVisible"
      :title="planIsEdit ? '编辑会员方案' : '新建会员方案'"
      size="520px"
      destroy-on-close
    >
      <el-form
        ref="planFormRef"
        :model="planForm"
        :rules="planRules"
        label-width="100px"
        label-position="right"
        style="margin-top: 16px;"
      >
        <el-form-item label="方案名称" prop="name">
          <el-input v-model="planForm.name" placeholder="例如: 月度会员 / 年度VIP" />
        </el-form-item>

        <el-form-item label="会员等级" prop="level">
          <el-select v-model="planForm.level" style="width: 100%;">
            <el-option label="月度会员" :value="1" />
            <el-option label="季度会员" :value="2" />
            <el-option label="年度会员" :value="3" />
            <el-option label="终身会员" :value="4" />
          </el-select>
        </el-form-item>

        <el-form-item label="时长(月)" prop="durationMonths">
          <el-input-number v-model="planForm.durationMonths" :min="1" style="width: 180px;" />
          <span class="form-item-tip">订阅有效期月数</span>
        </el-form-item>

        <el-form-item label="现价(元)" prop="price">
          <el-input-number v-model="planForm.price" :min="0" :precision="2" :step="0.01" style="width: 180px;" />
          <span class="form-item-tip">{{ formatPlanPrice(planForm.price) }}</span>
        </el-form-item>

        <el-form-item label="原价(元)" prop="originalPrice">
          <el-input-number v-model="planForm.originalPrice" :min="0" :precision="2" :step="0.01" style="width: 180px;" />
          <span class="form-item-tip">划线价，0 表示不显示</span>
        </el-form-item>

        <el-form-item label="方案描述" prop="description">
          <el-input
            v-model="planForm.description"
            type="textarea"
            :rows="2"
            placeholder="简要描述该方案"
          />
        </el-form-item>

        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="planForm.sortOrder" :min="0" style="width: 180px;" />
          <span class="form-item-tip">数值越小越靠前</span>
        </el-form-item>

        <el-form-item label="上架状态" prop="status">
          <el-switch
            v-model="planForm.status"
            :active-value="1"
            :inactive-value="0"
            active-text="上架"
            inactive-text="下架"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="drawer-footer">
          <el-button @click="planDrawerVisible = false">取消</el-button>
          <el-button type="primary" class="gradient-btn" :loading="planDrawerLoading" @click="handlePlanSave">
            保存方案
          </el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<style scoped lang="scss">
.page-member {
  &__content {
    padding: $spacing-md;
  }
}

.member-tabs {
  :deep(.el-tabs__header) {
    margin-bottom: $spacing-md;
    background: $bg-surface;
    border-bottom: 1px solid $border-subtle;
    padding: 0 $spacing-md;
  }

  :deep(.el-tabs__nav-wrap::after) {
    display: none;
  }

  :deep(.el-tabs__item) {
    height: 48px;
    font-size: $font-size-md;
    font-weight: 500;
  }
}

.tab-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.filter-bar {
  display: flex;
  gap: $spacing-sm;
  margin-bottom: $spacing-md;
  flex-wrap: wrap;
  align-items: center;

  .filter-input {
    width: 240px;
  }

  .filter-select {
    width: 160px;
  }

  .filter-daterange {
    width: 280px;
  }

  .filter-spacer {
    flex: 1;
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $spacing-md;
  margin-bottom: $spacing-md;

  @media (max-width: 992px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
}

.stat-card {
  border: 1px solid $border-base;
  border-radius: $radius-md;
  box-shadow: $shadow-card;

  &__inner {
    display: flex;
    align-items: center;
    gap: $spacing-md;
  }

  &__icon {
    font-size: 36px;
    padding: 12px;
    border-radius: $radius-md;
    flex-shrink: 0;

    &--primary {
      color: $primary-color;
      background-color: rgba($primary-color, 0.1);
    }

    &--success {
      color: $success-color;
      background-color: rgba($success-color, 0.1);
    }

    &--warning {
      color: $warning-color;
      background-color: rgba($warning-color, 0.1);
    }

    &--danger {
      color: $danger-color;
      background-color: rgba($danger-color, 0.1);
    }
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__label {
    font-size: $font-size-sm;
    color: $text-tertiary;
  }

  &__value {
    font-size: $font-size-2xl;
    font-weight: 600;
    color: $text-primary;
  }
}

.page-card {
  border: 1px solid $border-base;
  border-radius: $radius-md;
  box-shadow: $shadow-card;
}

.plan-name-cell {
  display: flex;
  align-items: center;
  gap: $spacing-sm;

  .plan-icon {
    font-size: 18px;
    color: $primary-color;
  }

  .plan-name {
    font-size: $font-size-sm;
    font-weight: 500;
    color: $text-primary;
  }
}

.price-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;

  .price-current {
    font-size: $font-size-md;
    font-weight: 600;
    color: $primary-color;
  }

  .price-original {
    font-size: $font-size-2xs;
    color: $text-tertiary;
    text-decoration: line-through;
  }
}

.member-user-info {
  display: flex;
  align-items: center;
  gap: $spacing-sm;

  .member-meta {
    display: flex;
    flex-direction: column;

    .member-name {
      font-size: $font-size-sm;
      font-weight: 500;
      color: $text-primary;
    }

    .member-email {
      font-size: $font-size-2xs;
      color: $text-tertiary;
    }
  }
}

.period-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;

  .period-date {
    font-size: $font-size-sm;
    color: $text-secondary;
  }

  .period-sep {
    font-size: $font-size-2xs;
    color: $text-tertiary;
  }

  .period-expired {
    color: $danger-color;
    font-weight: 500;
  }
}

.amount-text {
  font-weight: 600;
  color: $primary-color;
}

.order-no {
  font-family: 'Courier New', monospace;
  font-size: $font-size-xs;
  color: $text-secondary;
}

.form-item-tip {
  font-size: $font-size-xs;
  color: $text-tertiary;
  margin-left: $spacing-sm;
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
