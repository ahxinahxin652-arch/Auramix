import { beforeEach, describe, expect, it, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/store/modules/auth'

// 必须在 import request 之前 mock router,避免循环
const { routerPush } = vi.hoisted(() => ({ routerPush: vi.fn() }))
vi.mock('@/router', () => ({
  default: { push: routerPush },
}))

// 必须在 import request 之前 mock element-plus,避免副作用
vi.mock('element-plus', () => ({
  ElMessage: { error: vi.fn() },
}))

import service from './request'

function mockReply(data: unknown, status = 200) {
  return {
    data,
    status,
    statusText: 'OK',
    headers: {},
    config: { headers: {} } as any,
  }
}

describe('request interceptors', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    routerPush.mockClear()
    // 替换 adapter,避免真实网络请求
    service.defaults.adapter = vi.fn() as any
  })

  describe('request interceptor', () => {
    it('adds Authorization header when token is set', async () => {
      const auth = useAuthStore()
      auth.token = 'my-token'
      const adapter = vi.fn().mockResolvedValue(mockReply({ code: 200, data: null, message: 'ok' }))
      service.defaults.adapter = adapter

      await service.get('/test')

      const callArg = adapter.mock.calls[0][0]
      expect(callArg.headers.get('Authorization')).toBe('Bearer my-token')
    })

    it('does not add Authorization header when no token', async () => {
      const adapter = vi.fn().mockResolvedValue(mockReply({ code: 200, data: null, message: 'ok' }))
      service.defaults.adapter = adapter

      await service.get('/test')

      const callArg = adapter.mock.calls[0][0]
      expect(callArg.headers.get('Authorization')).toBeUndefined()
    })
  })

  describe('response interceptor', () => {
    it('returns data on code 200', async () => {
      service.defaults.adapter = vi.fn().mockResolvedValue(
        mockReply({ code: 200, data: { foo: 1 }, message: 'ok' }),
      )

      const result = await service.get('/test')

      expect(result).toEqual({ foo: 1 })
    })

    it('clears auth and redirects on 4012', async () => {
      const auth = useAuthStore()
      auth.token = 'old-tok'
      service.defaults.adapter = vi.fn().mockResolvedValue(
        mockReply({ code: 4012, data: null, message: '会话已过期' }),
      )

      await expect(service.get('/test')).rejects.toThrow('会话已过期')
      expect(auth.token).toBe('')
      expect(routerPush).toHaveBeenCalledWith({
        path: '/login',
        query: { expired: '1' },
      })
    })

    it('clears auth and redirects on 4031', async () => {
      const auth = useAuthStore()
      auth.token = 'old-tok'
      service.defaults.adapter = vi.fn().mockResolvedValue(
        mockReply({ code: 4031, data: null, message: '账号已被停用' }),
      )

      await expect(service.get('/test')).rejects.toThrow('账号已被停用')
      expect(auth.token).toBe('')
      expect(routerPush).toHaveBeenCalledWith({
        path: '/login',
        query: { disabled: '1' },
      })
    })

    it('rewrites 5000 message to 服务异常', async () => {
      const { ElMessage } = await import('element-plus')
      service.defaults.adapter = vi.fn().mockResolvedValue(
        mockReply({ code: 5000, data: null, message: 'SQL exception xyz' }),
      )

      await expect(service.get('/test')).rejects.toThrow('服务异常')
      expect(ElMessage.error).toHaveBeenCalledWith('服务异常,请稍后重试')
    })

    it('passes through 400/4011 message', async () => {
      const { ElMessage } = await import('element-plus')
      service.defaults.adapter = vi.fn().mockResolvedValue(
        mockReply({ code: 4011, data: null, message: '用户名或密码错误' }),
      )

      await expect(service.post('/test', {})).rejects.toThrow('用户名或密码错误')
      expect(ElMessage.error).toHaveBeenCalledWith('用户名或密码错误')
    })

    it('handles network error', async () => {
      const { ElMessage } = await import('element-plus')
      service.defaults.adapter = vi.fn().mockRejectedValue(new Error('Network Error'))

      await expect(service.get('/test')).rejects.toThrow()
      expect(ElMessage.error).toHaveBeenCalledWith('网络异常,请检查连接')
    })
  })
})
