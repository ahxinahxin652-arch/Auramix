<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Bell,
  Expand,
  Fold,
  House,
  User,
  UserFilled,
  Headset,
  Collection,
  CircleCheck,
  Avatar,
  GoldMedal,
} from '@element-plus/icons-vue'
import { useAuthStore } from '@/store/modules/auth'
import UserDropdown from '@/components/UserDropdown.vue'
import AppSearch from '@/components/AppSearch.vue'
import Breadcrumb from '@/components/Breadcrumb.vue'

const STORAGE_KEY = 'admin-sidebar-collapsed'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const collapsed = ref(false)
const isMobile = ref(false)
const drawerVisible = ref(false)

function readCollapsedFromStorage(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

function writeCollapsedToStorage(v: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, v ? '1' : '0')
  } catch {
    // localStorage 不可用时静默忽略
  }
}

onMounted(() => {
  collapsed.value = readCollapsedFromStorage()
  isMobile.value = window.innerWidth < 768
  window.addEventListener('resize', onResize)
})

function onResize() {
  const next = window.innerWidth < 768
  if (next !== isMobile.value) {
    isMobile.value = next
    if (!next) drawerVisible.value = false
  }
}

function toggleCollapsed() {
  if (isMobile.value) {
    drawerVisible.value = !drawerVisible.value
  } else {
    collapsed.value = !collapsed.value
    writeCollapsedToStorage(collapsed.value)
  }
}

async function handleLogout() {
  await auth.logout()
  router.push('/login')
}

interface MenuItem {
  path: string
  label: string
  icon: unknown
  rootOnly?: boolean
}

const allMenus: MenuItem[] = [
  { path: '/home', label: '主页', icon: House },
  { path: '/admin', label: '管理员管理', icon: UserFilled, rootOnly: true },
  { path: '/user', label: '用户管理', icon: User },
  { path: '/song', label: '歌曲管理', icon: Headset },
  { path: '/album', label: '专辑管理', icon: Collection },
  { path: '/artist', label: '歌手管理', icon: Avatar },
  { path: '/member', label: '会员管理', icon: GoldMedal },
  { path: '/approval', label: '智能审批', icon: CircleCheck },
]

const visibleMenus = computed(() =>
  allMenus.filter((m) => !m.rootOnly || auth.profile?.isRoot === 1),
)

const SIDEBAR_WIDTH = 220
const SIDEBAR_COLLAPSED_WIDTH = 64

const sidebarWidth = computed(() => (collapsed.value ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH))
</script>

<template>
  <div class="admin-layout">
    <!-- 顶栏 -->
    <header class="admin-header">
      <div class="admin-header__left">
        <button
          class="admin-header__toggle"
          :aria-label="collapsed ? '展开侧栏' : '折叠侧栏'"
          @click="toggleCollapsed"
        >
          <el-icon :size="18">
            <Fold v-if="!isMobile && !collapsed" />
            <Expand v-else />
          </el-icon>
        </button>
        <span class="admin-header__brand">♪ Auramix</span>
        <AppSearch class="admin-header__search" />
      </div>
      <div class="admin-header__right">
        <el-badge :value="0" :show-zero="false" class="admin-header__bell">
          <el-icon :size="18"><Bell /></el-icon>
        </el-badge>
        <UserDropdown
          :username="auth.profile?.username ?? ''"
          :email="auth.profile?.email ?? ''"
          :is-root="(auth.profile?.isRoot ?? 0) as 0 | 1"
          @logout="handleLogout"
        />
      </div>
    </header>

    <div class="admin-body">
      <!-- 桌面侧栏 -->
      <aside
        v-if="!isMobile"
        class="admin-sidebar"
        :class="{ 'admin-sidebar--collapsed': collapsed }"
        :style="{ width: `${sidebarWidth}px` }"
      >
        <el-menu
          :default-active="route.path"
          :collapse="collapsed"
          :collapse-transition="false"
          router
          class="admin-menu"
        >
          <el-menu-item v-for="m in visibleMenus" :key="m.path" :index="m.path">
            <el-icon><component :is="m.icon" /></el-icon>
            <template #title>{{ m.label }}</template>
          </el-menu-item>
        </el-menu>
      </aside>

      <!-- 移动端 drawer -->
      <el-drawer
        v-if="isMobile"
        v-model="drawerVisible"
        direction="ltr"
        :with-header="false"
        size="220px"
      >
        <el-menu
          :default-active="route.path"
          router
          class="admin-menu"
          @select="drawerVisible = false"
        >
          <el-menu-item v-for="m in visibleMenus" :key="m.path" :index="m.path">
            <el-icon><component :is="m.icon" /></el-icon>
            <template #title>{{ m.label }}</template>
          </el-menu-item>
        </el-menu>
      </el-drawer>

      <!-- 主区 -->
      <main class="admin-main">
        <Breadcrumb class="admin-main__crumb" />
        <div class="admin-main__content">
          <router-view />
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped lang="scss">
.admin-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: $bg-page;
}

.admin-header {
  position: sticky;
  top: 0;
  z-index: 10;
  height: $header-height;
  padding: 0 $spacing-lg;
  background: $bg-surface;
  border-bottom: 1px solid $border-subtle;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;

  &__left {
    display: flex;
    align-items: center;
    gap: $spacing-md;
    flex: 1;
    min-width: 0;
  }

  &__toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    background: transparent;
    color: $text-secondary;
    cursor: pointer;
    border-radius: $radius-md;
    transition: background 150ms;

    &:hover {
      background: $bg-subtle;
      color: $text-primary;
    }
  }

  &__brand {
    font-size: $font-size-md;
    font-weight: 600;
    color: $text-primary;
    flex-shrink: 0;
  }

  &__search {
    margin-left: $spacing-md;
    flex: 1;
    max-width: 320px;
  }

  &__right {
    display: flex;
    align-items: center;
    gap: $spacing-md;
    flex-shrink: 0;
  }

  &__bell {
    color: $text-secondary;
    cursor: pointer;
    display: flex;
    align-items: center;
  }
}

.admin-body {
  flex: 1;
  display: flex;
  min-height: 0;
}

.admin-sidebar {
  background: $bg-surface;
  border-right: 1px solid $border-subtle;
  flex-shrink: 0;
  transition: width 200ms ease-out;
  overflow: hidden;

  &--collapsed {
    :deep(.el-menu-item) {
      padding: 0 !important;
      justify-content: center;
    }
  }
}

.admin-menu {
  height: 100%;
  border-right: none;

  // 主色只点缀:激活态用深色背景 + 白字
  :deep(.el-menu-item.is-active) {
    background: $text-primary !important;
    color: #fff !important;

    .el-icon {
      color: #fff !important;
    }
  }
}

.admin-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: auto;

  &__content {
    flex: 1;
    padding: 0;
  }
}
</style>
