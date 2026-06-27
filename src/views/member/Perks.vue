<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { ArrowLeft, Plus, Edit, Delete } from '@element-plus/icons-vue'
import PageHeader from '@/components/PageHeader.vue'
import request from '@/utils/request'

const router = useRouter()
const route = useRoute()

const currentPlanId = ref<number>(0)
const planName = (route.query.name as string) || '会员方案'

interface PlanBenefit {
  id?: number
  planId: number
  benefitKey: string
  benefitValue: string
  benefitType: number
  status: number
  sortOrder: number
  createdAt?: string
  updatedAt?: string
}

// 预定义权益 key 映射：{ 标签, key, 类型(0=开关,1=数字,2=文本) }
interface BenefitKeyOption {
  label: string
  key: string
  type: number
}

const benefitKeyOptions: BenefitKeyOption[] = [
  { label: '无损音质', key: 'lossless_audio', type: 0 },
  { label: '下载限额', key: 'download_limit', type: 1 },
  { label: '专属标识', key: 'exclusive_badge', type: 2 },
  { label: '高清MV', key: 'hd_mv', type: 0 },
]

function getBenefitLabel(key: string): string {
  return benefitKeyOptions.find((o) => o.key === key)?.label ?? key
}

function getBenefitType(key: string): number {
  return benefitKeyOptions.find((o) => o.key === key)?.type ?? -1
}

// 过滤掉已添加的权益标识（编辑模式下保留当前项）
const availableBenefitKeys = computed(() => {
  const usedKeys = benefitList.value
    .filter((b) => !isEdit.value || b.id !== editingId.value)
    .map((b) => b.benefitKey)
  return benefitKeyOptions.filter((opt) => !usedKeys.includes(opt.key))
})

// ==================== 数据 ====================
const benefitList = ref<PlanBenefit[]>([])
const benefitLoading = ref(false)
const statusFilter = ref<number | null>(null) // null=全部, 1=启用, 0=禁用

const filteredBenefitList = computed(() => {
  if (statusFilter.value === null) return benefitList.value
  return benefitList.value.filter((b) => b.status === statusFilter.value)
})

// ==================== 抽屉 ====================
const drawerVisible = ref(false)
const drawerLoading = ref(false)
const isEdit = ref(false)
const editingId = ref<number | undefined>(undefined)
const formRef = ref<FormInstance>()
const form = reactive<PlanBenefit>({
  planId: currentPlanId.value,
  benefitKey: '',
  benefitValue: '',
  benefitType: 0,
  sortOrder: 0,
  status: 0,
})

// type=1 时用的数字绑定
const benefitInputNumber = ref<number>(0)

// 当前选中权益的类型
const currentBenefitType = computed(() => getBenefitType(form.benefitKey))

// 选择权益标识后自动同步类型并重置内容
watch(
  () => form.benefitKey,
  (key) => {
    const t = getBenefitType(key)
    form.benefitType = t
    if (t === 0) {
      form.benefitValue = '1'
    } else if (t === 1) {
      benefitInputNumber.value = 0
      form.benefitValue = '0'
    } else {
      form.benefitValue = ''
    }
  },
)

// 数字输入同步到 benefitValue
watch(benefitInputNumber, (val) => {
  form.benefitValue = String(val)
})

// 路由参数变化时重新加载权益（currentPlanId 会随之更新）
watch(
  () => route.params.planId,
  () => {
    loadBenefits()
  },
)

// 动态校验规则：类型 1 要求填写数字，类型 2 要求填写文本
const benefitValueRequired = (_rule: any, _value: string, callback: any) => {
  const t = currentBenefitType.value
  if (t === 0) {
    callback()
  } else if (t === 1) {
    if (benefitInputNumber.value <= 0) {
      callback(new Error('请填写有效的限额数字'))
    } else {
      callback()
    }
  } else if (t === 2) {
    if (!form.benefitValue.trim()) {
      callback(new Error('权益内容不能为空'))
    } else {
      callback()
    }
  } else {
    callback()
  }
}

const formRules = reactive<FormRules>({
  benefitKey: [{ required: true, message: '请选择权益标识', trigger: 'change' }],
  benefitValue: [{ validator: benefitValueRequired, trigger: 'change' }],
})

// ==================== 方法 ====================
async function loadBenefits() {
  benefitLoading.value = true
  try {
    const res = await request.get<unknown, { planId: number; benefits: PlanBenefit[] }>(
      `/admin/manage/member/plans/${route.params.planId}/benefits`,
    )
    currentPlanId.value = res?.planId ?? 0
    form.planId = currentPlanId.value
    benefitList.value = Array.isArray(res?.benefits) ? res.benefits : []
  } catch (err) {
    console.error('加载权益列表异常:', err)
    benefitList.value = []
  } finally {
    benefitLoading.value = false
  }
}

function goBack() {
  router.push('/member')
}

function openCreateDrawer() {
  isEdit.value = false
  editingId.value = undefined
  drawerVisible.value = true
  form.planId = currentPlanId.value
  form.benefitKey = ''
  form.benefitValue = '1'
  form.benefitType = 0
  form.sortOrder = 0
  form.status = 1
  benefitInputNumber.value = 0
}

function openEditDrawer(row: PlanBenefit) {
  isEdit.value = true
  editingId.value = row.id
  drawerVisible.value = true
  form.benefitKey = row.benefitKey
  form.benefitType = row.benefitType
  form.sortOrder = row.sortOrder
  form.status = row.status
  if (row.benefitType === 1) {
    benefitInputNumber.value = Number(row.benefitValue) || 0
  }
  form.benefitValue = row.benefitValue
}

async function handleSave() {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  drawerLoading.value = true
  try {
    // type=1 时从数字输入同步最终值
    if (currentBenefitType.value === 1) {
      form.benefitValue = String(benefitInputNumber.value)
    }

    if (isEdit.value && editingId.value !== undefined) {
      // 编辑模式：如果启用，检查同 benefitKey 是否已有其他启用项
      if (form.status === 1) {
        const conflicting = benefitList.value.find(
          (b) => b.benefitKey === form.benefitKey && b.status === 1 && b.id !== editingId.value,
        )
        if (conflicting) {
          ElMessage.warning(`权益标识【${getBenefitLabel(form.benefitKey)}】已有启用项，不能重复启用`)
          drawerLoading.value = false
          return
        }
      }
      await request.put(`/api/admin/manage/member/editBenefits/${editingId.value}`, {
        benefitKey: form.benefitKey,
        benefitValue: form.benefitValue,
        status: form.status,
        sortOrder: form.sortOrder,
      })
      ElMessage.success('更新权益成功')
    } else {
      // 新增模式：如果启用，检查同 benefitKey 是否已有其他启用项
      if (form.status === 1) {
        const conflicting = benefitList.value.find(
          (b) => b.benefitKey === form.benefitKey && b.status === 1,
        )
        if (conflicting) {
          ElMessage.warning(`权益标识【${getBenefitLabel(form.benefitKey)}】已有启用项，不能重复启用`)
          drawerLoading.value = false
          return
        }
      }
      const payload = { ...form, planId: currentPlanId.value }
      await request.post('/admin/manage/member/addBenefits', payload)
      ElMessage.success('新增权益成功')
    }
    drawerVisible.value = false
    loadBenefits()
  } catch (err) {
    console.error('保存权益异常:', err)
  } finally {
    drawerLoading.value = false
  }
}

function handleToggleStatus(row: PlanBenefit) {
  const isActive = row.status === 1
  const actionText = isActive ? '禁用' : '启用'

  // 启用前检查：同 benefitKey 只能有一个启用
  if (!isActive) {
    const conflicting = benefitList.value.find(
      (b) => b.benefitKey === row.benefitKey && b.status === 1 && b.id !== row.id,
    )
    if (conflicting) {
      ElMessage.warning(`权益标识【${getBenefitLabel(row.benefitKey)}】已有启用项，不能重复启用`)
      return
    }
  }

  ElMessageBox.confirm(`确认${actionText}权益【${getBenefitLabel(row.benefitKey)}】吗？`, `${actionText}确认`, {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: isActive ? 'warning' : 'info',
  })
    .then(async () => {
      try {
        const nextStatus = isActive ? 0 : 1
        await request.put(`/api/admin/manage/member/editBenefits/${row.id}`, {
          benefitKey: row.benefitKey,
          benefitValue: row.benefitValue,
          status: nextStatus,
          sortOrder: row.sortOrder,
        })
        ElMessage.success(`权益已${actionText}`)
        loadBenefits()
      } catch (err) {
        console.error(`${actionText}权益异常:`, err)
      }
    })
    .catch(() => {})
}

function handleDelete(row: PlanBenefit) {
  ElMessageBox.confirm(`确认删除权益【${getBenefitLabel(row.benefitKey)}】吗？此操作不可逆！`, '危险警告', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      try {
        await request.delete(`/admin/manage/member/plans/${currentPlanId.value}/benefits/${row.id}`)
        ElMessage.success('删除成功')
        loadBenefits()
      } catch (err) {
        console.error('删除权益异常:', err)
      }
    })
    .catch(() => {})
}

function formatBenefitValue(row: PlanBenefit): string {
  if (row.benefitType === 0) return row.benefitValue === '1' ? '拥有' : '不拥有'
  if (row.benefitType === 1) return `限额 ${row.benefitValue}`
  return row.benefitValue
}

function formatDateTime(dateStr: string): string {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN')
}

onMounted(() => {
  loadBenefits()
})
</script>

<template>
  <div class="page-perks">
    <PageHeader :title="`${planName} - 会员权益`" subtitle="管理该会员方案的所有权益项" />

    <div class="page-perks__content">
      <!-- 顶部操作栏 -->
      <div class="perks-toolbar">
        <el-button :icon="ArrowLeft" @click="goBack">返回方案列表</el-button>
        <el-select
          v-model="statusFilter"
          placeholder="状态筛选"
          clearable
          style="width: 140px; margin-left: 12px;"
        >
          <el-option :value="null" label="全部状态" />
          <el-option :value="1" label="已启用" />
          <el-option :value="0" label="已禁用" />
        </el-select>
        <div class="filter-spacer" />
        <el-button type="primary" class="gradient-btn" :icon="Plus" @click="openCreateDrawer">
          新增权益
        </el-button>
      </div>

      <!-- 权益列表 -->
      <el-card v-loading="benefitLoading" shadow="never" class="page-card">
        <el-empty v-if="!benefitLoading && filteredBenefitList.length === 0" description="暂无权益项，点击上方按钮新增" />

        <el-table v-else :data="filteredBenefitList" style="width: 100%">
          <el-table-column label="权益标识" min-width="140">
            <template #default="{ row }">
              <span class="benefit-key">{{ getBenefitLabel(row.benefitKey) }}</span>
            </template>
          </el-table-column>

          <el-table-column label="权益内容" min-width="200" align="center">
            <template #default="{ row }">
              <span>{{ formatBenefitValue(row as PlanBenefit) }}</span>
            </template>
          </el-table-column>

          <el-table-column prop="sortOrder" label="排序" width="80" align="center" />

          <el-table-column prop="status" label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag v-if="row.status === 1" type="success" size="small">启用</el-tag>
              <el-tag v-else type="info" size="small">禁用</el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="createdAt" label="创建时间" width="160" align="center">
            <template #default="{ row }">
              <span class="time-text">{{ formatDateTime(row.createdAt) }}</span>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="200" fixed="right" align="center">
            <template #default="{ row }">
              <el-button link type="primary" :icon="Edit" @click="openEditDrawer(row as PlanBenefit)">
                编辑
              </el-button>
              <el-button
                link
                :type="row.status === 1 ? 'warning' : 'success'"
                @click="handleToggleStatus(row as PlanBenefit)"
              >
                {{ row.status === 1 ? '禁用' : '启用' }}
              </el-button>
              <el-button link type="danger" :icon="Delete" @click="handleDelete(row as PlanBenefit)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <!-- 新建/编辑抽屉 -->
    <el-drawer
      v-model="drawerVisible"
      :title="isEdit ? '编辑权益' : '新增权益'"
      size="500px"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-width="100px"
        label-position="right"
        style="margin-top: 16px;"
      >
        <el-form-item label="权益标识" prop="benefitKey">
          <el-select
            v-model="form.benefitKey"
            style="width: 100%"
            placeholder="请选择权益"
            :disabled="isEdit"
          >
            <el-option
              v-for="opt in availableBenefitKeys"
              :key="opt.key"
              :label="opt.label"
              :value="opt.key"
            />
          </el-select>
        </el-form-item>

        <!-- type=0: 开关（拥有/不拥有） -->
        <el-form-item v-if="currentBenefitType === 0" label="权益内容" prop="benefitValue">
          <el-switch
            v-model="form.benefitValue"
            active-value="1"
            inactive-value="0"
            active-text="拥有"
            inactive-text="不拥有"
          />
        </el-form-item>

        <!-- type=1: 数字输入（限额） -->
        <el-form-item v-if="currentBenefitType === 1" label="填写限额" prop="benefitValue">
          <el-input-number v-model="benefitInputNumber" :min="0" :step="1" style="width: 240px;" />
          <span class="form-item-tip">填写该权益的数值上限</span>
        </el-form-item>

        <!-- type=2: 文本输入 -->
        <el-form-item v-if="currentBenefitType === 2" label="权益内容" prop="benefitValue">
          <el-input
            v-model="form.benefitValue"
            type="textarea"
            :rows="3"
            placeholder="请输入权益文本内容"
          />
        </el-form-item>

        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="form.sortOrder" :min="0" style="width: 180px;" />
          <span class="form-item-tip">数值越小越靠前</span>
        </el-form-item>

        <!-- 启用状态 -->
        <el-form-item label="启用状态" prop="status">
          <el-switch
            v-model="form.status"
            :active-value="1"
            :inactive-value="0"
            active-text="启用"
            inactive-text="禁用"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="drawer-footer">
          <el-button @click="drawerVisible = false">取消</el-button>
          <el-button type="primary" class="gradient-btn" :loading="drawerLoading" @click="handleSave">
            保存权益
          </el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<style scoped lang="scss">
.page-perks {
  &__content {
    padding: $spacing-md;
  }
}

.perks-toolbar {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  margin-bottom: $spacing-md;

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

.page-card {
  border: 1px solid $border-base;
  border-radius: $radius-md;
  box-shadow: $shadow-card;
}

.benefit-key {
  font-size: $font-size-sm;
  font-weight: 500;
  color: $text-primary;
}

.time-text {
  font-size: $font-size-xs;
  color: $text-tertiary;
}

.form-item-tip {
  font-size: $font-size-xs;
  color: $text-tertiary;
  margin-left: $spacing-sm;
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: $spacing-sm;
  padding: $spacing-md;
  border-top: 1px solid $border-base;
}
</style>
