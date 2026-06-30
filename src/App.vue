<script setup>
// todo 假设现在播放的音乐库就一首歌曲，但是增加了20首，但是无法切换下一首（内存tracks未更新）
import { ref, onMounted, nextTick, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSidebarStore } from './stores/sidebar'
import { useLeftSidebarStore } from './stores/leftSidebar.js'
import { useLocalStorageStore } from './stores/localStorage'
import { useUserStore } from './stores/user'
import { ElMessage } from 'element-plus'
import { backendFetch } from './utils/backendApi'
import FootBar from './components/FootBar.vue'
import RightSideBar from './components/RightSideBar.vue'
import LeftSideBar from './components/LeftSideBar.vue'
import PlaylistSelectorModal from './components/PlaylistSelectorModal.vue'
import { useLibraryStore } from './stores/library'

const userStore = useUserStore()
const globalLibraryStore = useLibraryStore()

// 会员标识 badge
const membershipBadge = ref('')
const isMembershipActive = ref(false)

function findMemberBadge(benefits) {
  if (!benefits || !Array.isArray(benefits)) return ''
  const badge = benefits.find(b => b.benefitKey === '会员标识' && b.status === 1)
  return badge?.benefitValue || ''
}

const router = useRouter()
const sidebarStore = useSidebarStore()
const leftSidebarStore = useLeftSidebarStore()
const localStorageStore = useLocalStorageStore()
const isMaximized = ref(false)
const sidebarTransition = ref(null)

// ========== 左右侧边栏互斥 (小屏时) ==========
const MIN_WIDTH_FOR_BOTH_SIDEBARS = 1100

// 左侧展开 → 检查是否需要关闭右侧
watch(() => leftSidebarStore.mode, (newMode) => {
  if (newMode === 'expanded' && sidebarStore.isOpen) {
    if (window.innerWidth < MIN_WIDTH_FOR_BOTH_SIDEBARS) {
      sidebarStore.setOpen(false)
      localStorageStore.setRightBarShow(false)
    }
  }
})

// 右侧打开 → 检查是否需要缩回左侧
watch(() => sidebarStore.isOpen, (isOpen) => {
  if (isOpen && leftSidebarStore.mode === 'expanded') {
    if (window.innerWidth < MIN_WIDTH_FOR_BOTH_SIDEBARS) {
      leftSidebarStore.collapse()
    }
  }
})

// 监听窗口大小改变，当窗口变小时，如果两个侧边栏都打开，则关闭其中一个
const handleResize = () => {
  sidebarStore.updateWidthOnResize()
  if (window.innerWidth < MIN_WIDTH_FOR_BOTH_SIDEBARS) {
    if (leftSidebarStore.mode === 'expanded' && sidebarStore.isOpen) {
      // 优先保留右侧（正在播放），缩回左侧
      leftSidebarStore.collapse()
    }
  }
}

const canBack = ref(false)
const canForward = ref(false)
const refreshing = ref(false)
const routerKey = ref(0)
const isGlobalSyncing = ref(false)

function refreshPage() {
  if (refreshing.value) return
  refreshing.value = true
  setTimeout(() => {
    routerKey.value++
    setTimeout(() => {
      refreshing.value = false
    }, 500)
  }, 50)
}

const updateNavButtons = () => {
  nextTick(() => {
    const state = window.history.state
    const hasBack = state && state.back !== null
    const hasForward = state && state.forward !== null
    canBack.value = hasBack && typeof state.back === 'string' && !state.back.includes('login')
    canForward.value = hasForward && typeof state.forward === 'string' && !state.forward.includes('login')
  })
}

async function fetchMembershipBadge() {
  try {
    const membership = await backendFetch('/api/user/manage/member/myMembership').catch(() => null)
    const membershipData = Array.isArray(membership) ? membership[0] : membership
    if (!membershipData) {
      membershipBadge.value = ''
      isMembershipActive.value = false
      return
    }
    const isExpired = new Date(membershipData.endDate).getTime() <= Date.now()
    if (isExpired) {
      // 会员已到期，调用到期接口
      if (membershipData.id) {
        await backendFetch(`/api/user/manage/member/userMemberships/${membershipData.id}/expire`, {
          method: 'PUT'
        }).catch(() => {})
      }
      membershipBadge.value = ''
      isMembershipActive.value = false
      return
    }
    isMembershipActive.value = true
    membershipBadge.value = findMemberBadge(membershipData.benefits)
  } catch {
    membershipBadge.value = ''
    isMembershipActive.value = false
  }
}

onMounted(() => {
  window.electronAPI.onWindowMaximized((val) => {
    isMaximized.value = val
  })

  // 根据 localStorage 恢复右侧边栏状态
  sidebarStore.setOpen(localStorageStore.isRightBarShow)
  
  // 初始化导航按钮状态
  updateNavButtons()

  // 获取会员标识（已登录才执行）
  if (userStore.isLoggedIn) {
    fetchMembershipBadge()
  }

  // 初始化媒体库同步
  globalLibraryStore.initialize()
  
  // 监听全局同步快捷键 (Ctrl+R)
  if (window.electronAPI && window.electronAPI.onAppSyncReload) {
    window.electronAPI.onAppSyncReload(async () => {
      if (isGlobalSyncing.value) return
      isGlobalSyncing.value = true
      refreshing.value = true
      
      try {
        await globalLibraryStore.forceSync()
      } catch (err) {
        console.error('Global sync failed:', err)
      } finally {
        isGlobalSyncing.value = false
        refreshing.value = false
        refreshPage() // Refresh central view
      }
    })
  }
  
  window.addEventListener('resize', handleResize)
  handleResize()
})

// 登录后刷新会员信息
watch(() => userStore.isLoggedIn, (loggedIn) => {
  if (loggedIn) {
    fetchMembershipBadge()
  } else {
    membershipBadge.value = ''
    isMembershipActive.value = false
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
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
  if (currentRoute.value !== 'Search') {
    router.push({ path: '/search', query: { q: searchQuery.value } })
  } else {
    router.replace({ path: '/search', query: { q: searchQuery.value } })
  }
  window.dispatchEvent(new CustomEvent('global-search', { detail: { query: searchQuery.value } }))
}

function clearSearch() {
  searchQuery.value = ''
  handleSearch()
}

function goHome() {
  searchQuery.value = ''
  router.push('/')
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
  } else if (cmd === 'premium') {
    router.push('/premium')
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
  <div v-if="isGlobalSyncing" class="global-sync-overlay">
    <div class="sync-spinner"></div>
  </div>

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
          <button class="arrow-btn refresh-btn" @click="refreshPage" :disabled="refreshing" title="刷新">
            <svg :class="{ spinning: refreshing }" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="23 4 23 10 17 10"/>
              <polyline points="1 20 1 14 7 14"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
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
          <svg class="search-icon clickable" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" @click="handleSearch" title="搜索">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            class="search-input"
            v-model="searchQuery"
            placeholder="想听什么？"
            @keydown.enter.prevent="handleSearch"
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
        <span v-if="membershipBadge" class="membership-badge-gold">{{ membershipBadge }}</span>
        <div class="premium-icon-btn" :class="{ 'has-badge': membershipBadge, 'is-member': isMembershipActive }" @click="router.push('/premium')" title="会员">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :style="isMembershipActive ? { color: '#fbbf24' } : {}">
            <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z"/>
            <path d="M3 20h18"/>
          </svg>
          <span class="premium-hover-text">会员</span>
        </div>

        <!-- AI 聊天机器人入口 -->
        <button class="ai-chat-btn" @click="router.push('/ai-chat')" title="AI 助手">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="10" rx="2" ry="2"></rect>
            <circle cx="12" cy="5" r="2"></circle>
            <path d="M12 7v4"></path>
            <line x1="8" y1="16" x2="8" y2="16.01"></line>
            <line x1="16" y1="16" x2="16" y2="16.01"></line>
          </svg>
        </button>

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
              <el-dropdown-item command="premium" divided>
                {{ isMembershipActive ? 'Premiumed' : 'Upgrade to Premium' }}
              </el-dropdown-item>
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
        <router-view :key="routerKey" />
      </main>

      <!-- 右侧侧栏：滑出式 Spotify 风格面板，闭合时缩小为抽屉样式 -->
      <aside
        class="right-sidebar-wrapper"
        :class="{ collapsed: !sidebarStore.isOpen }"
        :style="{ width: sidebarStore.isOpen ? sidebarStore.width + 'px' : '40px', maxWidth: 'none' }"
      >
        <RightSideBar />
      </aside>
    </div>

    <!-- ===== 底部播放条 ===== -->
    <FootBar @toggle-right-sidebar="toggleRightSidebar" />
  </div>

  <!-- 全局挂载：歌单选择弹窗 -->
  <PlaylistSelectorModal 
    v-if="globalLibraryStore.selectorVisible"
    :track-id="globalLibraryStore.selectorTrackId"
    :x="globalLibraryStore.selectorX"
    :y="globalLibraryStore.selectorY"
    :visible="globalLibraryStore.selectorVisible"
    @update:visible="globalLibraryStore.closeSelector()"
  />
</template>