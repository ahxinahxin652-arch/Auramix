import { beforeEach, describe, expect, it, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { createApp } from 'vue'
import piniaPersistedstate from 'pinia-plugin-persistedstate'
import { createRouter, createMemoryHistory, type Router } from 'vue-router'
import { useAuthStore } from '@/store/modules/auth'
import { setupPermissionGuard } from '@/permission'
import type { AdminProfile } from '@/types/admin'
import { loginApi, logoutApi, fetchProfileApi } from '@/api/admin/auth'

vi.mock('@/api/admin/auth', () => ({
  loginApi: vi.fn(),
  logoutApi: vi.fn(),
  fetchProfileApi: vi.fn(),
}))

const routes = [
  {
    path: '/',
    component: { template: '<div><router-view /></div>' },
    children: [
      {
        path: 'home',
        name: 'Home',
        component: { template: '<div>home</div>' },
        meta: { requiresAuth: true },
      },
    ],
  },
  { path: '/login', name: 'Login', component: { template: '<div>login</div>' } },
]

function makeRouter(): Router {
  return createRouter({ history: createMemoryHistory(), routes })
}

const fakeProfile: AdminProfile = {
  id: 1,
  username: 'admin',
  email: 'admin@auramix.com',
  isRoot: 1,
  status: 1,
  lastLoginTime: '2026-06-22 10:00:00',
  lastLoginIp: '127.0.0.1',
  createdAt: '2026-01-01 00:00:00',
}

function freshPinia() {
  const pinia = createPinia()
  pinia.use(piniaPersistedstate)
  const app = createApp({})
  app.use(pinia)
  return pinia
}

describe('auth flow integration', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('full flow: login → /home → logout → /login', async () => {
    vi.mocked(loginApi).mockResolvedValue({
      token: 'tok-123',
      expiresAt: '2026-12-31',
      profile: fakeProfile,
    })
    vi.mocked(logoutApi).mockResolvedValue(undefined)
    vi.mocked(fetchProfileApi).mockResolvedValue(fakeProfile)

    const router = makeRouter()
    setupPermissionGuard(router)
    const auth = useAuthStore()

    // 1. 未登录访问 /home → /login
    await router.push('/home')
    await router.isReady()
    expect(router.currentRoute.value.path).toBe('/login')
    expect(auth.isLoggedIn).toBe(false)

    // 2. 登录
    await auth.login({ username: 'admin', password: 'p' })
    expect(auth.token).toBe('tok-123')
    expect(auth.profile).toEqual(fakeProfile)

    // 3. 已登录访问 /login → /home
    await router.push('/login')
    await router.isReady()
    expect(router.currentRoute.value.path).toBe('/home')

    // 4. 退出登录
    await auth.logout()
    expect(auth.token).toBe('')
    expect(auth.profile).toBeNull()

    // 5. 先跳到 /login (不同路由,触发守卫),再访问 /home
    await router.push('/login')
    await router.isReady()
    expect(router.currentRoute.value.path).toBe('/login')

    await router.push('/home')
    await router.isReady()
    expect(router.currentRoute.value.path).toBe('/login')
  })

  it('persists token across pinia rehydration', async () => {
    vi.mocked(loginApi).mockResolvedValue({
      token: 'tok-persist',
      expiresAt: '2026-12-31',
      profile: fakeProfile,
    })

    // 第一次会话:带持久化插件的 pinia
    const pinia1 = freshPinia()
    setActivePinia(pinia1)
    const auth1 = useAuthStore()
    await auth1.login({ username: 'admin', password: 'p' })
    expect(auth1.token).toBe('tok-persist')

    // 模拟刷新:新 pinia 实例(也带持久化插件),从 localStorage rehydrate
    const pinia2 = freshPinia()
    setActivePinia(pinia2)
    const auth2 = useAuthStore()
    expect(auth2.token).toBe('tok-persist')
    expect(auth2.profile).toEqual(fakeProfile)
  })
})
