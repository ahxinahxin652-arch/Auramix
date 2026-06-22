import { beforeEach, describe, expect, it, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { createRouter, createMemoryHistory, type Router } from 'vue-router'
import { setupPermissionGuard } from './permission'
import { useAuthStore } from '@/store/modules/auth'

vi.mock('@/api/admin/auth', () => ({
  fetchProfileApi: vi.fn(),
}))

import { fetchProfileApi } from '@/api/admin/auth'

const routes = [
  { path: '/', redirect: '/home' },
  {
    path: '/home',
    component: { template: '<div>home</div>' },
    meta: { requiresAuth: true },
  },
  { path: '/login', component: { template: '<div>login</div>' } },
  { path: '/404', component: { template: '<div>404</div>' } },
]

function makeRouter(): Router {
  return createRouter({ history: createMemoryHistory(), routes })
}

const fakeProfile = {
  id: 1, username: 'u', email: 'e', isRoot: 1, status: 1,
  lastLoginTime: null, lastLoginIp: null, createdAt: '2026-06-01',
}

describe('permission guard', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('redirects to /login when protected page accessed without auth', async () => {
    const router = makeRouter()
    setupPermissionGuard(router)
    router.push('/home')
    await router.isReady()

    expect(router.currentRoute.value.path).toBe('/login')
    expect(router.currentRoute.value.query.redirect).toBe('/home')
  })

  it('redirects to /home when /login accessed while logged in', async () => {
    const router = makeRouter()
    setupPermissionGuard(router)
    const auth = useAuthStore()
    auth.token = 'tok'
    auth.profile = { ...fakeProfile }
    await router.push('/login')
    await router.isReady()

    expect(router.currentRoute.value.path).toBe('/home')
  })

  it('fetches /me when entering protected page with token but no profile', async () => {
    vi.mocked(fetchProfileApi).mockResolvedValue({ ...fakeProfile })
    const router = makeRouter()
    setupPermissionGuard(router)
    const auth = useAuthStore()
    auth.token = 'tok'
    await router.push('/home')
    await router.isReady()

    expect(fetchProfileApi).toHaveBeenCalled()
    expect(auth.profile).toEqual({ ...fakeProfile })
  })

  it('redirects to /login when /me fails', async () => {
    vi.mocked(fetchProfileApi).mockRejectedValue(new Error('expired'))
    const router = makeRouter()
    setupPermissionGuard(router)
    const auth = useAuthStore()
    auth.token = 'tok'
    await router.push('/home')
    await router.isReady()

    expect(router.currentRoute.value.path).toBe('/login')
  })

  it('allows public pages without auth', async () => {
    const router = makeRouter()
    setupPermissionGuard(router)
    await router.push('/login')
    await router.isReady()

    expect(router.currentRoute.value.path).toBe('/login')
  })

  it('allows protected page when fully authenticated with profile', async () => {
    const router = makeRouter()
    setupPermissionGuard(router)
    const auth = useAuthStore()
    auth.token = 'tok'
    auth.profile = { ...fakeProfile }
    await router.push('/home')
    await router.isReady()

    expect(router.currentRoute.value.path).toBe('/home')
    expect(fetchProfileApi).not.toHaveBeenCalled()
  })
})
