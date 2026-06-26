<script setup>
// todo 假设现在播放的音乐库就一首歌曲，但是增加了20首，但是无法切换下一首（内存tracks未更新）
import { ref, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useSidebarStore } from './stores/sidebar'
import { useLeftSidebarStore } from './stores/leftSidebar.js'
import { useLocalStorageStore } from './stores/localStorage'
import { useUserStore } from './stores/user'
import { ElMessage } from 'element-plus'
import FootBar from './components/FootBar.vue'
import RightSideBar from './components/RightSideBar.vue'
import LeftSideBar from './components/LeftSideBar.vue'

const userStore = useUserStore()

const router = useRouter()
const sidebarStore = useSidebarStore()
const leftSidebarStore = useLeftSidebarStore()
const localStorageStore = useLocalStorageStore()
const isMaximized = ref(false)
const sidebarTransition = ref(null)

// ========== 左右侧边栏互斥 ==========
// 左侧展开 → 关闭右侧
watch(() => leftSidebarStore.mode, (newMode) => {
  if (newMode === 'expanded' && sidebarStore.isOpen) {
    sidebarStore.setOpen(false)
    localStorageStore.setRightBarShow(false)
  }
})

// 右侧打开 → 缩回左侧
watch(() => sidebarStore.isOpen, (isOpen) => {
  if (isOpen && leftSidebarStore.mode === 'expanded') {
    leftSidebarStore.collapse()
  }
})

const canBack = ref(false)
const canForward = ref(false)

const updateNavButtons = () => {
  nextTick(() => {
    const state = window.history.state
    const hasBack = state && state.back !== null
    const hasForward = state && state.forward !== null
    canBack.value = hasBack && typeof state.back === 'string' && !state.back.includes('login')
    canForward.value = hasForward && typeof state.forward === 'string' && !state.forward.includes('login')
  })
}

onMounted(() => {
  window.electronAPI.onWindowMaximized((val) => {
    isMaximized.value = val
  })

  // 根据 localStorage 恢复右侧边栏状态
  sidebarStore.setOpen(localStorageStore.isRightBarShow)
  
  // 初始化导航按钮状态
  updateNavButtons()
})

function handleMinimize() {
  window.electronAPI.minimizeWindow()
}

function handleMaximize() {
  window.electronAPI.maximizeWindow()
}

function handleClose() {
  window.electronAPI.closeWindow()
}

const getInitialRoute = () => {
  const hash = window.location.hash
  if (hash.includes('/lyrics-widget')) return 'LyricsWidget'
  if (hash.includes('/login')) return 'Login'
  if (!localStorage.getItem('auramix_token')) return 'Login'
  return 'Home'
}
const currentRoute = ref(getInitialRoute())
router.afterEach((to) => {
  currentRoute.value = to.name
  updateNavButtons()
})

// 导航控制
function goBack() {
  if (canBack.value) {
    router.back()
  }
}

// 前进导航
function goForward() {
  if (canForward.value) {
    router.forward()
  }
}

// 搜索逻辑
const searchQuery = ref('')
window.globalSearchQuery = searchQuery

function handleSearch() {
  window.dispatchEvent(new CustomEvent('global-search', { detail: { query: searchQuery.value } }))
}

function clearSearch() {
  searchQuery.value = ''
  handleSearch()
}

function goHome() {
  searchQuery.value = ''
  router.push('/')
  handleSearch()
}

// 用户头像操作
function handleUserCommand(cmd) {
  const labelMap = {
    account: 'Account',
    profile: 'Profile',
    recents: 'Recents',
    premium: 'Upgrade to Premium',
    support: 'Support',
    private: 'Private session',
    settings: 'Settings'
  }
  if (cmd === 'logout') {
    userStore.logout()
    ElMessage.success('已成功登出账号')
  } else {
    ElMessage.success(`点击了: ${labelMap[cmd] || cmd}`)
  }
}

// 切换右侧边栏（动画期间禁止重复点击）
function toggleRightSidebar() {
  if (sidebarStore.isAnimating) return
  const newVal = !sidebarStore.isOpen
  sidebarStore.setOpen(newVal)
  localStorageStore.setRightBarShow(newVal)
}

// 动画钩子：标记动画开始/结束
function onSidebarBeforeEnter() {
  sidebarStore.startAnimation()
}
function onSidebarAfterEnter() {
  sidebarStore.endAnimation()
}
function onSidebarBeforeLeave() {
  sidebarStore.startAnimation()
}
function onSidebarAfterLeave() {
  sidebarStore.endAnimation()
}
</script>

<template>
  <!-- 歌词浮窗模式：无窗口修饰 -->
  <div v-if="currentRoute === 'LyricsWidget'" style="width: 100%; height: 100%;">
    <router-view />
  </div>

  <!-- 登录页模式：只有标题栏拖拽区域与控制，隐藏侧边栏与播放条 -->
  <div v-else-if="currentRoute === 'Login'" class="app login-layout">
    <header class="titlebar" @dblclick="handleMaximize">
      <div class="header-left">
        <span class="logo-text">Auramix</span>
      </div>
      <div class="header-right">
        <div class="traffic-lights">
          <button class="traffic-btn minimize" @click.stop="handleMinimize" title="最小化">
            <svg width="10" height="10" viewBox="0 0 10 10">
              <path d="M1 5h8" stroke="rgba(255,255,255,0.5)" stroke-width="1.2" stroke-linecap="round"/>
            </svg>
          </button>
          <button class="traffic-btn maximize" @click.stop="handleMaximize" title="最大化">
            <svg v-if="!isMaximized" width="10" height="10" viewBox="0 0 10 10">
              <rect x="1.5" y="1.5" width="7" height="7" stroke="rgba(255,255,255,0.5)" stroke-width="1.2" fill="none" rx="0.5"/>
            </svg>
            <svg v-else width="10" height="10" viewBox="0 0 10 10">
              <rect x="2.5" y="2.5" width="5" height="5" stroke="rgba(255,255,255,0.5)" stroke-width="1.2" fill="none" rx="0.5"/>
              <path d="M1.5 4.5h3v3.5h-3.5v-3z" stroke="rgba(255,255,255,0.5)" stroke-width="1.1" fill="none" rx="0.3"/>
            </svg>
          </button>
          <button class="traffic-btn close" @click.stop="handleClose" title="关闭">
            <svg width="10" height="10" viewBox="0 0 10 10">
              <path d="M1 1L9 9M9 1L1 9" stroke="rgba(255,255,255,0.5)" stroke-width="1.2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
      </div>
    </header>
    <div class="app-body" style="height: calc(100vh - var(--titlebar-h)); overflow: hidden;">
      <main class="main-view" style="padding: 0; height: 100%;">
        <router-view />
      </main>
    </div>
  </div>

  <!-- 主播放器界面：完整功能布局 -->
  <div v-else class="app">
    <!-- ===== 自定义标题栏 ===== -->
    <header class="titlebar" @dblclick="handleMaximize">
      <!-- Left: Logo & Navigation arrows -->
      <div class="header-left">
        <span class="logo-text" @click="goHome">Auramix</span>
        <div class="nav-arrows">
          <button class="arrow-btn" @click="goBack" :disabled="!canBack" title="返回">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>
          <button class="arrow-btn" @click="goForward" :disabled="!canForward" title="前进">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        </div>
      </div>

      <!-- Center: Home Button & Search Input -->
      <div class="header-center">
        <button class="home-circle-btn" :class="{ active: currentRoute === 'Home' && !searchQuery }" @click="goHome" title="主页">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
          </svg>
        </button>
        <div class="search-bar-container">
          <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            class="search-input"
            v-model="searchQuery"
            placeholder="想听什么？"
            @input="handleSearch"
            @keyup.enter="handleSearch"
          />
          <button v-if="searchQuery" class="clear-search-btn" @click="clearSearch" title="清除">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>

      <!-- Right: User Avatar Dropdown & Traffic Lights -->
      <div class="header-right">
        <el-dropdown trigger="click" @command="handleUserCommand" popper-class="user-profile-dropdown">
          <div class="user-avatar-btn">
            <img v-if="userStore.profile?.avatarUrl" :src="userStore.profile.avatarUrl" class="user-avatar-img" />
            <div v-else class="user-avatar-placeholder">
              {{ userStore.profile?.displayName?.charAt(0).toUpperCase() || 'U' }}
            </div>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">{{ userStore.profile?.displayName || 'User Profile' }}</el-dropdown-item>
              <el-dropdown-item command="premium" divided>Upgrade to Premium</el-dropdown-item>
              <el-dropdown-item command="settings">Settings</el-dropdown-item>
              <el-dropdown-item command="logout" divided>Log out</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <div class="traffic-lights">
          <button class="traffic-btn minimize" @click.stop="handleMinimize" title="最小化">
            <svg width="10" height="10" viewBox="0 0 10 10">
              <path d="M1 5h8" stroke="rgba(0,0,0,0.5)" stroke-width="1.2" stroke-linecap="round"/>
            </svg>
          </button>
          <button class="traffic-btn maximize" @click.stop="handleMaximize" title="最大化">
            <svg v-if="!isMaximized" width="10" height="10" viewBox="0 0 10 10">
              <rect x="1.5" y="1.5" width="7" height="7" stroke="rgba(0,0,0,0.5)" stroke-width="1.2" fill="none" rx="0.5"/>
            </svg>
            <svg v-else width="10" height="10" viewBox="0 0 10 10">
              <rect x="2.5" y="2.5" width="5" height="5" stroke="rgba(0,0,0,0.5)" stroke-width="1.2" fill="none" rx="0.5"/>
              <path d="M1.5 4.5h3v3.5h-3.5v-3z" stroke="rgba(0,0,0,0.5)" stroke-width="1.1" fill="none" rx="0.3"/>
            </svg>
          </button>
          <button class="traffic-btn close" @click.stop="handleClose" title="关闭">
            <svg width="10" height="10" viewBox="0 0 10 10">
              <path d="M1 1L9 9M9 1L1 9" stroke="rgba(0,0,0,0.5)" stroke-width="1.2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
      </div>
    </header>

    <!-- ===== 主内容区 ===== -->
    <div class="app-body">
      <!-- 左侧歌单边栏：Spotify 风格，可拖拽宽度 -->
      <LeftSideBar />

      <!-- 中心区域：路由视图，可滚动 -->
      <main class="main-view">
        <router-view />
      </main>

      <!-- 右侧侧栏：滑出式 Spotify 风格面板 -->
      <Transition
        name="sidebar-slide"
        @before-enter="onSidebarBeforeEnter"
        @after-enter="onSidebarAfterEnter"
        @before-leave="onSidebarBeforeLeave"
        @after-leave="onSidebarAfterLeave"
      >
        <aside
          class="right-sidebar-wrapper"
          v-show="sidebarStore.isOpen"
          @click.stop
        >
          <RightSideBar />
        </aside>
      </Transition>
    </div>

    <!-- ===== 底部播放条 ===== -->
    <FootBar @toggle-right-sidebar="toggleRightSidebar" />
  </div>
</template>