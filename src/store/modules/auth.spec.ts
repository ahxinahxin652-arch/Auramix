import { describe, it, expect, vi, beforeEach } from 'vitest'
import { nextTick, createApp } from 'vue'
import { setActivePinia, createPinia } from 'pinia'
import piniaPersistedstate from 'pinia-plugin-persistedstate'
import { useAuthStore } from './auth'
import * as authApi from '@/api/admin/auth'

vi.mock('@/api/admin/auth', () => ({
  loginApi: vi.fn(),
  logoutApi: vi.fn(),
  fetchProfileApi: vi.fn(),
}))

const fakeProfile = {
  id: 1,
  username: 'admin',
  email: 'a@b.c',
  isRoot: 1 as const,
  status: 1 as const,
  lastLoginTime: null,
  lastLoginIp: null,
  createdAt: '2026-06-01',
}

describe('auth store', () => {
  beforeEach(() => {
    // 关键:必须用 app.use(pinia) 触发 pinia.install(app),
    // 否则 pinia.use(plugin) 注册的插件会卡在 toBeInstalled 队列里,
    // 永远不会进入 _p, 也就不会执行
    const pinia = createPinia()
    pinia.use(piniaPersistedstate)
    const app = createApp({})
    app.use(pinia)
    setActivePinia(pinia)
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('has empty token and null profile', () => {
      const store = useAuthStore()
      expect(store.token).toBe('')
      expect(store.profile).toBeNull()
      expect(store.loading).toBe(false)
    })

    it('isLoggedIn is false initially', () => {
      const store = useAuthStore()
      expect(store.isLoggedIn).toBe(false)
    })

    it('isLoggedIn is true when token is set', () => {
      const store = useAuthStore()
      store.token = 'abc'
      expect(store.isLoggedIn).toBe(true)
    })
  })

  describe('login', () => {
    it('writes state and returns result on success', async () => {
      vi.mocked(authApi.loginApi).mockResolvedValue({
        token: 'tok',
        expiresAt: '2026-06-22T12:00:00',
        profile: fakeProfile,
      })
      const store = useAuthStore()
      const result = await store.login({ username: 'admin', password: 'pass' })

      expect(authApi.loginApi).toHaveBeenCalledWith({ username: 'admin', password: 'pass' })
      expect(store.token).toBe('tok')
      expect(store.profile).toEqual(fakeProfile)
      expect(result.token).toBe('tok')
    })

    it('toggles loading during login', async () => {
      let resolveLogin: (v: any) => void = () => {}
      vi.mocked(authApi.loginApi).mockReturnValue(
        new Promise((r) => {
          resolveLogin = r
        }) as any,
      )
      const store = useAuthStore()
      const promise = store.login({ username: 'a', password: 'b' })
      expect(store.loading).toBe(true)
      resolveLogin({ token: 't', expiresAt: 'e', profile: fakeProfile })
      await promise
      expect(store.loading).toBe(false)
    })

    it('clears loading on login failure', async () => {
      vi.mocked(authApi.loginApi).mockRejectedValue(new Error('wrong'))
      const store = useAuthStore()
      await expect(store.login({ username: 'a', password: 'b' })).rejects.toThrow('wrong')
      expect(store.loading).toBe(false)
      expect(store.token).toBe('')
    })
  })

  describe('logout', () => {
    it('calls logoutApi and clears state', async () => {
      vi.mocked(authApi.logoutApi).mockResolvedValue(undefined)
      const store = useAuthStore()
      store.token = 't'
      store.profile = fakeProfile

      await store.logout()

      expect(authApi.logoutApi).toHaveBeenCalled()
      expect(store.token).toBe('')
      expect(store.profile).toBeNull()
    })

    it('clears state even when logoutApi rejects', async () => {
      vi.mocked(authApi.logoutApi).mockRejectedValue(new Error('network'))
      const store = useAuthStore()
      store.token = 't'

      await store.logout()

      expect(store.token).toBe('')
    })
  })

  describe('fetchProfile', () => {
    it('writes profile on success', async () => {
      vi.mocked(authApi.fetchProfileApi).mockResolvedValue(fakeProfile)
      const store = useAuthStore()

      await store.fetchProfile()

      expect(store.profile).toEqual(fakeProfile)
    })

    it('sets profile to null when api returns null', async () => {
      vi.mocked(authApi.fetchProfileApi).mockResolvedValue(null)
      const store = useAuthStore()
      store.profile = fakeProfile

      await store.fetchProfile()

      expect(store.profile).toBeNull()
    })
  })

  describe('clearAuth', () => {
    it('does not call any api', async () => {
      const store = useAuthStore()
      store.token = 't'
      store.profile = fakeProfile

      store.clearAuth()

      expect(authApi.loginApi).not.toHaveBeenCalled()
      expect(authApi.logoutApi).not.toHaveBeenCalled()
      expect(authApi.fetchProfileApi).not.toHaveBeenCalled()
      expect(store.token).toBe('')
      expect(store.profile).toBeNull()
    })
  })

  describe('persistence', () => {
    it('persists token and profile to localStorage', async () => {
      vi.mocked(authApi.loginApi).mockResolvedValue({
        token: 'persist-tok',
        expiresAt: '2026-06-22T12:00:00',
        profile: fakeProfile,
      })
      const store = useAuthStore()
      await store.login({ username: 'a', password: 'b' })
      await nextTick() // 等待 pinia-plugin-persistedstate v4 的异步 watcher 写入 localStorage

      const stored = localStorage.getItem('auramix-auth')
      expect(stored).toBeTruthy()
      const parsed = JSON.parse(stored!)
      expect(parsed.token).toBe('persist-tok')
      expect(parsed.profile).toEqual(fakeProfile)
    })
  })
})
