<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import {
  Search, Refresh, Plus, Delete, Edit,
  Sunny, Moon, Cloudy, Drizzling, WindPower, Lightning,
  Bicycle, Football, Baseball, Basketball,
  OfficeBuilding, Reading, Notebook, Coffee,
  Van, Ship,
  Tickets,
} from '@element-plus/icons-vue'
import PageHeader from '@/components/PageHeader.vue'
import { getAllSceneTags, addSceneTag, updateSceneTag, deleteSceneTag, type SceneTag, type AddSceneTagParams } from '@/api/admin/sceneTagManage'

// ==================== 数据状态 ====================
const allList = ref<SceneTag[]>([])
const loading = ref(false)

const filter = reactive({
  query: '',
  sceneType: undefined as number | undefined,
  status: undefined as number | undefined,
})

// 前端过滤
const filteredList = computed(() => {
  return allList.value.filter((item) => {
    if (filter.query && !item.name.toLowerCase().includes(filter.query.toLowerCase()) && !item.description.toLowerCase().includes(filter.query.toLowerCase())) {
      return false
    }
    if (filter.sceneType !== undefined && item.sceneType !== filter.sceneType) {
      return false
    }
    if (filter.status !== undefined && item.status !== filter.status) {
      return false
    }
    return true
  })
})

// ==================== 数据加载 ====================
async function loadData() {
  loading.value = true
  try {
    allList.value = await getAllSceneTags()
  } finally {
    loading.value = false
  }
}

function handleReset() {
  filter.query = ''
  filter.sceneType = undefined
  filter.status = undefined
}

// ==================== 时区映射 ====================
interface TimezoneOption {
  label: string
  value: string
  offset: number
}

const timezoneOptions: TimezoneOption[] = [
  { label: '中国标准时间 (UTC+8)', value: 'Asia/Shanghai', offset: 8 },
  { label: '东京 (UTC+9)', value: 'Asia/Tokyo', offset: 9 },
  { label: '新加坡 (UTC+8)', value: 'Asia/Singapore', offset: 8 },
  { label: '首尔 (UTC+9)', value: 'Asia/Seoul', offset: 9 },
  { label: '曼谷 (UTC+7)', value: 'Asia/Bangkok', offset: 7 },
  { label: '伦敦 (UTC+0)', value: 'Europe/London', offset: 0 },
  { label: '巴黎 (UTC+1)', value: 'Europe/Paris', offset: 1 },
  { label: '纽约 (UTC-5)', value: 'America/New_York', offset: -5 },
  { label: '洛杉矶 (UTC-8)', value: 'America/Los_Angeles', offset: -8 },
  { label: '悉尼 (UTC+10)', value: 'Australia/Sydney', offset: 10 },
]

function getTimezoneOffset(tz: string): number {
  return timezoneOptions.find((t) => t.value === tz)?.offset ?? 8
}

// ==================== 图标选择器 ====================
interface IconOption {
  name: string
  label: string
  component: unknown
}

const iconOptions: IconOption[] = [
  { name: 'Sunny', label: '晴天', component: Sunny },
  { name: 'Moon', label: '夜晚', component: Moon },
  { name: 'Cloudy', label: '多云', component: Cloudy },
  { name: 'Drizzling', label: '小雨', component: Drizzling },
  { name: 'WindPower', label: '大风', component: WindPower },
  { name: 'Lightning', label: '雷雨', component: Lightning },
  { name: 'Bicycle', label: '骑行', component: Bicycle },
  { name: 'Football', label: '足球', component: Football },
  { name: 'Baseball', label: '运动', component: Baseball },
  { name: 'Basketball', label: '篮球', component: Basketball },
  { name: 'OfficeBuilding', label: '办公', component: OfficeBuilding },
  { name: 'Reading', label: '阅读', component: Reading },
  { name: 'Notebook', label: '学习', component: Notebook },
  { name: 'Coffee', label: '咖啡', component: Coffee },
  { name: 'Van', label: '出行', component: Van },
  { name: 'Ship', label: '航海', component: Ship },
]

const iconPickerVisible = ref(false)

function getIconComponent(name: string): unknown {
  return iconOptions.find((o) => o.name === name)?.component ?? null
}

function getIconLabel(name: string): string {
  return iconOptions.find((o) => o.name === name)?.label ?? '未选择'
}

function selectIcon(name: string) {
  form.icon = name
  iconPickerVisible.value = false
}

// ==================== 天气选项 ====================
const weatherOptions = [
  { label: '雨天', value: '雨天' },
  { label: '晴天', value: '晴天' },
  { label: '阴天', value: '阴天' },
  { label: '雪天', value: '雪天' },
  { label: '大风', value: '大风' },
  { label: '雾霾', value: '雾霾' },
]

const dayOptions = [
  { label: '一', value: 1 },
  { label: '二', value: 2 },
  { label: '三', value: 3 },
  { label: '四', value: 4 },
  { label: '五', value: 5 },
  { label: '六', value: 6 },
  { label: '日', value: 7 },
]

// ==================== 抽屉表单 ====================
const drawerVisible = ref(false)
const drawerLoading = ref(false)
const editId = ref<string | null>(null)
const drawerTitle = computed(() => (editId.value ? '编辑场景标签' : '添加场景标签'))
const formRef = ref<FormInstance>()

interface TimeRange {
  start: string
  end: string
}

const form = reactive({
  name: '',
  description: '',
  icon: '',
  sceneType: 0,
  priority: 5,
  displayOrder: 1,
  status: 1,
  timezone: 'Asia/Shanghai',
  // 时间型条件
  timeRanges: [{ start: '09:00', end: '12:00' }] as TimeRange[],
  daysOfWeek: [1, 2, 3, 4, 5] as number[],
  // 活动型条件
  activityType: '',
  // 天气型条件
  weather: [] as string[],
})

const formRules: FormRules = {
  name: [
    { required: true, message: '标签名称不能为空', trigger: 'blur' },
    { max: 50, message: '不超过 50 个字符', trigger: 'blur' },
  ],
  sceneType: [{ required: true, message: '请选择场景类型', trigger: 'change' }],
}

function buildConditionsJson(): string {
  if (form.sceneType === 0) {
    // 时间型
    const obj: Record<string, unknown> = {
      timeRanges: form.timeRanges.filter((t) => t.start && t.end),
      daysOfWeek: form.daysOfWeek,
      timezone: form.timezone,
    }
    return JSON.stringify(obj)
  } else if (form.sceneType === 1) {
    // 活动型
    return JSON.stringify({ activityType: form.activityType })
  } else {
    // 天气型
    return JSON.stringify({ weather: form.weather })
  }
}

function addTimeRange() {
  form.timeRanges.push({ start: '', end: '' })
}

function removeTimeRange(index: number) {
  if (form.timeRanges.length > 1) {
    form.timeRanges.splice(index, 1)
  }
}

function openCreateDrawer() {
  editId.value = null
  form.name = ''
  form.description = ''
  form.icon = ''
  form.sceneType = 0
  form.priority = 5
  form.displayOrder = filteredList.value.length + 1
  form.status = 1
  form.timezone = 'Asia/Shanghai'
  form.timeRanges = [{ start: '09:00', end: '12:00' }]
  form.daysOfWeek = [1, 2, 3, 4, 5]
  form.activityType = ''
  form.weather = []
  drawerVisible.value = true
}

function openEditDrawer(row: SceneTag) {
  editId.value = row.id
  form.name = row.name
  form.description = row.description
  form.icon = row.icon ?? ''
  form.sceneType = row.sceneType
  form.priority = row.priority
  form.displayOrder = row.displayOrder
  form.status = row.status
  form.timezone = 'Asia/Shanghai'
  form.timeRanges = [{ start: '09:00', end: '12:00' }]
  form.daysOfWeek = [1, 2, 3, 4, 5]
  form.activityType = ''
  form.weather = []
  // 解析 conditionsJson 回填条件字段
  try {
    const cond = JSON.parse(row.conditionsJson)
    if (row.sceneType === 0) {
      if (cond.timeRanges?.length) {
        form.timeRanges = cond.timeRanges
      }
      if (cond.daysOfWeek?.length) {
        form.daysOfWeek = cond.daysOfWeek
      }
      if (cond.timezone) {
        form.timezone = cond.timezone
      }
    } else if (row.sceneType === 1) {
      form.activityType = cond.activityType ?? ''
    } else if (row.sceneType === 2) {
      form.weather = cond.weather ?? []
    }
  } catch { /* ignore parse error */ }
  drawerVisible.value = true
}

// 切换场景类型时重置对应条件
watch(() => form.sceneType, () => {
  form.timeRanges = [{ start: '09:00', end: '12:00' }]
  form.daysOfWeek = [1, 2, 3, 4, 5]
  form.activityType = ''
  form.weather = []
  form.timezone = 'Asia/Shanghai'
})

async function handleSave() {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  // 活动型校验
  if (form.sceneType === 1 && !form.activityType.trim()) {
    ElMessage.warning('请输入活动类型')
    return
  }
  // 天气型校验
  if (form.sceneType === 2 && form.weather.length === 0) {
    ElMessage.warning('请选择至少一种天气')
    return
  }

  drawerLoading.value = true
  try {
    const payload: AddSceneTagParams = {
      name: form.name,
      description: form.description,
      icon: form.icon || '',
      sceneType: form.sceneType,
      conditionsJson: buildConditionsJson(),
      timezoneOffset: getTimezoneOffset(form.timezone),
      priority: form.priority,
      displayOrder: form.displayOrder,
      status: form.status,
    }
    if (editId.value) {
      await updateSceneTag(editId.value, payload)
      ElMessage.success('编辑场景标签成功')
    } else {
      await addSceneTag(payload)
      ElMessage.success('添加场景标签成功')
    }
    drawerVisible.value = false
    loadData()
  } catch (err) {
    console.error('保存场景标签失败:', err)
  } finally {
    drawerLoading.value = false
  }
}

async function handleDelete(row: SceneTag) {
  try {
    await ElMessageBox.confirm(
      `确定要删除场景标签「${row.name}」吗？删除后不可恢复。`,
      '删除确认',
      { confirmButtonText: '确认删除', cancelButtonText: '取消', type: 'warning' },
    )
  } catch {
    return
  }
  try {
    await deleteSceneTag(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (err) {
    console.error('删除失败:', err)
  }
}

async function handleToggleStatus(row: SceneTag) {
  const newStatus = row.status === 1 ? 0 : 1
  const actionText = newStatus === 1 ? '启用' : '禁用'
  try {
    await ElMessageBox.confirm(
      `确定要${actionText}场景标签「${row.name}」吗？`,
      `${actionText}确认`,
      { confirmButtonText: `确认${actionText}`, cancelButtonText: '取消', type: 'info' },
    )
  } catch {
    return
  }
  try {
    // 解析 conditionsJson 构建 payload
    let cond: Record<string, unknown> = {}
    try { cond = JSON.parse(row.conditionsJson) } catch { /* ignore */ }
    const payload: AddSceneTagParams = {
      name: row.name,
      description: row.description,
      icon: row.icon ?? '',
      sceneType: row.sceneType,
      conditionsJson: row.conditionsJson,
      timezoneOffset: row.timezoneOffset,
      priority: row.priority,
      displayOrder: row.displayOrder,
      status: newStatus,
    }
    await updateSceneTag(row.id, payload)
    ElMessage.success(`${actionText}成功`)
    loadData()
  } catch (err) {
    console.error('操作失败:', err)
  }
}

// ==================== 工具函数 ====================
function sceneTypeText(type: number): string {
  switch (type) {
    case 0: return '时间型'
    case 1: return '活动型'
    case 2: return '天气型'
    default: return '未知'
  }
}

function sceneTypeTagType(type: number): 'success' | 'warning' | '' {
  switch (type) {
    case 0: return 'success'
    case 1: return 'warning'
    default: return ''
  }
}

function statusText(status: number): string {
  return status === 1 ? '启用' : '禁用'
}

function statusTagType(status: number): 'success' | 'danger' {
  return status === 1 ? 'success' : 'danger'
}

/** 将 JSON 字符串格式化为可读文本 */
function formatConditions(json: string): string {
  try {
    const obj = JSON.parse(json)
    const parts: string[] = []

    if (obj.timeRanges?.length) {
      const ranges = (obj.timeRanges as Array<{ start: string; end: string }>)
        .map((r) => `${r.start}-${r.end}`)
        .join(', ')
      parts.push(ranges)
    }
    if (obj.daysOfWeek?.length) {
      const dayNames = ['日', '一', '二', '三', '四', '五', '六']
      const days = (obj.daysOfWeek as number[]).map((d: number) => dayNames[d]).join('、')
      parts.push(`周${days}`)
    }
    if (obj.activityType) {
      parts.push(`活动: ${obj.activityType}`)
    }
    if (obj.weather?.length) {
      parts.push(`天气: ${(obj.weather as string[]).join('、')}`)
    }
    if (obj.trigger) {
      parts.push(`触发: ${obj.trigger}`)
    }
    return parts.join(' ｜ ') || json
  } catch {
    return json
  }
}

function formatTime(iso: string): string {
  if (!iso) return '-'
  return iso.replace('T', ' ').substring(0, 19)
}

// ==================== 初始化 ====================
onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="page-scene">
    <PageHeader title="场景标签" subtitle="管理平台场景分类标签，配置自动触发条件" />

    <div class="page-scene__content">
      <!-- 筛选栏 -->
      <div class="filter-bar">
        <el-input
          v-model="filter.query"
          placeholder="搜索名称或描述..."
          clearable
          class="filter-input"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <el-select
          v-model="filter.sceneType"
          placeholder="场景类型"
          clearable
          class="filter-select"
        >
          <el-option label="时间型" :value="0" />
          <el-option label="活动型" :value="1" />
          <el-option label="天气型" :value="2" />
        </el-select>

        <el-select
          v-model="filter.status"
          placeholder="启用状态"
          clearable
          class="filter-select"
        >
          <el-option label="启用" :value="1" />
          <el-option label="禁用" :value="0" />
        </el-select>

        <el-button :icon="Refresh" @click="handleReset">重置</el-button>

        <div class="filter-spacer" />

        <el-button type="primary" class="gradient-btn" :icon="Plus" @click="openCreateDrawer">
          添加标签
        </el-button>
      </div>

      <!-- 标签表格 -->
      <el-card shadow="never" class="page-card">
        <el-table v-loading="loading" :data="filteredList" style="width: 100%">
          <el-table-column prop="displayOrder" label="排序" width="60" align="center" />

          <el-table-column prop="name" label="标签名称" min-width="140">
            <template #default="{ row }">
              <div class="scene-name-cell">
                <div class="scene-icon-box" :class="{ 'scene-icon-box--empty': !row.icon }">
                  <el-icon v-if="row.icon && getIconComponent(row.icon)" :size="20">
                    <component :is="getIconComponent(row.icon)" />
                  </el-icon>
                  <el-icon v-else :size="20">
                    <Tickets />
                  </el-icon>
                </div>
                <div class="scene-name-text">
                  <span class="scene-name">{{ row.name }}</span>
                  <span class="scene-desc">{{ row.description }}</span>
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="sceneType" label="场景类型" width="90" align="center">
            <template #default="{ row }">
              <el-tag :type="sceneTypeTagType(row.sceneType)" size="small">
                {{ sceneTypeText(row.sceneType) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="触发条件" min-width="220">
            <template #default="{ row }">
              <span class="conditions-text">{{ formatConditions(row.conditionsJson) }}</span>
            </template>
          </el-table-column>

          <el-table-column prop="priority" label="优先级" width="80" align="center" />

          <el-table-column prop="status" label="状态" width="80" align="center">
            <template #default="{ row }">
              <el-tag :type="statusTagType(row.status)" size="small">
                {{ statusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="createdAt" label="创建时间" width="170" align="center">
            <template #default="{ row }">
              {{ formatTime(row.createdAt) }}
            </template>
          </el-table-column>

          <el-table-column prop="updatedAt" label="更新时间" width="170" align="center">
            <template #default="{ row }">
              {{ formatTime(row.updatedAt) }}
            </template>
          </el-table-column>

          <el-table-column label="操作" width="200" align="center" fixed="right">
            <template #default="{ row }">
              <el-button :icon="Edit" size="small" plain type="primary" link @click="openEditDrawer(row)">
                编辑
              </el-button>
              <el-button
                size="small"
                plain
                :type="row.status === 1 ? 'warning' : 'success'"
                link
                @click="handleToggleStatus(row)"
              >
                {{ row.status === 1 ? '禁用' : '启用' }}
              </el-button>
              <el-button :icon="Delete" size="small" plain type="danger" link @click="handleDelete(row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-empty v-if="!loading && filteredList.length === 0" description="暂无场景标签数据" />
      </el-card>
    </div>

    <!-- 添加/编辑标签抽屉 -->
    <el-drawer
      v-model="drawerVisible"
      :title="drawerTitle"
      size="520px"
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
        <el-form-item label="标签名称" prop="name">
          <el-input v-model="form.name" placeholder="例如: 工作专注、通勤路上" />
        </el-form-item>

        <el-form-item label="描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="2"
            placeholder="简要描述该场景标签"
          />
        </el-form-item>

        <el-form-item label="图标" prop="icon">
          <el-popover
            v-model:visible="iconPickerVisible"
            placement="bottom-start"
            :width="340"
            trigger="click"
          >
            <template #reference>
              <el-button class="icon-picker-btn">
                <template v-if="form.icon">
                  <el-icon :size="18"><component :is="getIconComponent(form.icon)" /></el-icon>
                  <span>{{ getIconLabel(form.icon) }}</span>
                </template>
                <span v-else class="icon-picker-placeholder">点击选择图标</span>
              </el-button>
            </template>
            <div class="icon-picker-grid">
              <button
                v-for="opt in iconOptions"
                :key="opt.name"
                class="icon-picker-item"
                :class="{ 'icon-picker-item--active': form.icon === opt.name }"
                :title="opt.label"
                @click="selectIcon(opt.name)"
              >
                <el-icon :size="22"><component :is="opt.component" /></el-icon>
              </button>
            </div>
          </el-popover>
        </el-form-item>

        <el-form-item label="场景类型" prop="sceneType">
          <el-select v-model="form.sceneType" style="width: 100%;">
            <el-option label="时间型 — 基于时间段触发" :value="0" />
            <el-option label="活动型 — 基于用户行为触发" :value="1" />
            <el-option label="天气型 — 基于天气条件触发" :value="2" />
          </el-select>
        </el-form-item>

        <!-- 时间型条件 -->
        <template v-if="form.sceneType === 0">
          <el-form-item label="时间段">
            <div class="time-range-list">
              <div
                v-for="(tr, idx) in form.timeRanges"
                :key="idx"
                class="time-range-row"
              >
                <el-time-picker
                  v-model="form.timeRanges[idx].start"
                  format="HH:mm"
                  value-format="HH:mm"
                  placeholder="开始"
                  style="width: 130px;"
                />
                <span class="time-range-sep">至</span>
                <el-time-picker
                  v-model="form.timeRanges[idx].end"
                  format="HH:mm"
                  value-format="HH:mm"
                  placeholder="结束"
                  style="width: 130px;"
                />
                <el-button
                  v-if="form.timeRanges.length > 1"
                  :icon="Delete"
                  circle
                  size="small"
                  type="danger"
                  plain
                  @click="removeTimeRange(idx)"
                />
              </div>
              <el-button size="small" plain @click="addTimeRange">+ 添加时间段</el-button>
            </div>
          </el-form-item>

          <el-form-item label="生效星期">
            <el-checkbox-group v-model="form.daysOfWeek">
              <el-checkbox
                v-for="d in dayOptions"
                :key="d.value"
                :label="d.value"
              >
                {{ d.label }}
              </el-checkbox>
            </el-checkbox-group>
          </el-form-item>

          <el-form-item label="时区">
            <el-select v-model="form.timezone" style="width: 100%;" placeholder="选择时区">
              <el-option
                v-for="tz in timezoneOptions"
                :key="tz.value"
                :label="tz.label"
                :value="tz.value"
              />
            </el-select>
            <span class="form-item-tip">
              偏移量: UTC{{ getTimezoneOffset(form.timezone) >= 0 ? '+' : '' }}{{ getTimezoneOffset(form.timezone) }}
            </span>
          </el-form-item>
        </template>

        <!-- 活动型条件 -->
        <template v-if="form.sceneType === 1">
          <el-form-item label="活动类型" prop="activityType">
            <el-input
              v-model="form.activityType"
              placeholder="例如: 跑步、健身、瑜伽"
            />
          </el-form-item>
        </template>

        <!-- 天气型条件 -->
        <template v-if="form.sceneType === 2">
          <el-form-item label="匹配天气" prop="weather">
            <el-checkbox-group v-model="form.weather">
              <el-checkbox
                v-for="w in weatherOptions"
                :key="w.value"
                :label="w.value"
              >
                {{ w.label }}
              </el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </template>

        <el-divider />

        <el-form-item label="优先级" prop="priority">
          <el-input-number v-model="form.priority" :min="0" :max="100" style="width: 180px;" />
          <span class="form-item-tip">数值越大优先级越高</span>
        </el-form-item>

        <el-form-item label="排序" prop="displayOrder">
          <el-input-number v-model="form.displayOrder" :min="0" style="width: 180px;" />
          <span class="form-item-tip">数值越小越靠前</span>
        </el-form-item>

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
            保存标签
          </el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<style scoped lang="scss">
@use 'sass:color';

.page-scene {
  &__content {
    padding: $spacing-md;
  }
}

// ==================== 筛选栏 ====================
.filter-bar {
  display: flex;
  gap: $spacing-sm;
  margin-bottom: $spacing-md;
  flex-wrap: wrap;
  align-items: center;
}

.filter-input {
  width: 240px;
}

.filter-select {
  width: 150px;
}

.filter-spacer {
  flex: 1;
}

// ==================== 表格 ====================
.page-card {
  border-radius: $radius-md;

  :deep(.el-card__body) {
    padding: $spacing-md;
  }
}

.scene-name-cell {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
}

.scene-icon-box {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: $radius-md;
  background: $primary-soft;
  color: $primary-color;
  display: flex;
  align-items: center;
  justify-content: center;

  &--empty {
    background: $bg-subtle;
    color: $text-tertiary;
  }
}

.scene-name-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.scene-name {
  font-size: $font-size-sm;
  font-weight: 500;
  color: $text-primary;
  line-height: 1.4;
}

.scene-desc {
  font-size: $font-size-xs;
  color: $text-tertiary;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 240px;
}

.conditions-text {
  font-size: $font-size-xs;
  color: $text-secondary;
  line-height: 1.5;
  word-break: break-all;
}

// ==================== 表单 ====================
.form-item-tip {
  margin-left: $spacing-sm;
  font-size: $font-size-xs;
  color: $text-tertiary;
}

.time-range-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.time-range-row {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
}

.time-range-sep {
  color: $text-tertiary;
  font-size: $font-size-sm;
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: $spacing-sm;
}

// ==================== 图标选择器 ====================
.icon-picker-btn {
  display: inline-flex;
  align-items: center;
  gap: $spacing-sm;
  min-width: 160px;
}

.icon-picker-placeholder {
  color: $text-tertiary;
}

.icon-picker-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  padding: 4px;
}

.icon-picker-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  aspect-ratio: 1;
  border: 1px solid $border-subtle;
  border-radius: $radius-sm;
  background: $bg-surface;
  color: $text-secondary;
  cursor: pointer;
  transition: all 0.15s;
  padding: 4px;

  &:hover {
    border-color: $primary-color;
    color: $primary-color;
    background: $primary-soft;
  }

  &--active {
    border-color: $primary-color;
    color: $primary-color;
    background: $primary-soft;
  }
}

// ==================== 公共渐变按钮 ====================
.gradient-btn {
  background: linear-gradient(135deg, $primary-color, color.adjust($primary-color, $lightness: 8%)) !important;
  border: none !important;

  &:hover {
    background: linear-gradient(135deg, color.adjust($primary-color, $lightness: -4%), $primary-color) !important;
  }
}
</style>
