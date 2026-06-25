import { describe, it, expect, vi } from 'vitest'
import request from '@/utils/request'
import { loginApi, logoutApi, fetchProfileApi } from './auth'

vi.mock('@/utils/request', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}))

describe('auth api', () => {
  it('loginApi POSTs to /admin/auth/login with payload', async () => {
    const payload = { username: 'admin', password: 'pass' }
    const mockResult = {
      token: 'tok',
      expiresAt: '2026-06-22T12:00:00',
      profile: {
        id: 1,
        username: 'admin',
        email: 'a@b.c',
        isRoot: 1,
        status: 1,
        lastLoginTime: null,
        lastLoginIp: null,
        createdAt: '2026-06-01',
      },
    }
    vi.mocked(request.post).mockResolvedValue(mockResult)

    const result = await loginApi(payload)

    expect(request.post).toHaveBeenCalledWith('/admin/auth/login', payload)
    expect(result).toEqual(mockResult)
  })

  it('logoutApi POSTs to /admin/auth/logout with no payload', async () => {
    vi.mocked(request.post).mockResolvedValue(undefined)

    await logoutApi()

    expect(request.post).toHaveBeenCalledWith('/admin/auth/logout')
  })

  it('fetchProfileApi GETs /admin/auth/me', async () => {
    const profile = {
      id: 1,
      username: 'admin',
      email: 'a@b.c',
      isRoot: 1,
      status: 1,
      lastLoginTime: null,
      lastLoginIp: null,
      createdAt: '2026-06-01',
    }
    vi.mocked(request.get).mockResolvedValue(profile)

    const result = await fetchProfileApi()

    expect(request.get).toHaveBeenCalledWith('/admin/auth/me')
    expect(result).toEqual(profile)
  })

  it('fetchProfileApi returns null when backend returns null', async () => {
    vi.mocked(request.get).mockResolvedValue(null)

    const result = await fetchProfileApi()

    expect(result).toBeNull()
  })
})
