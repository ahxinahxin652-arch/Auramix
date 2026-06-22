import request from '@/utils/request'
import type { AdminProfile, LoginPayload, LoginResult } from '@/types/admin'

/**
 * 管理员登录
 * POST /api/admin/auth/login
 */
export function loginApi(payload: LoginPayload): Promise<LoginResult> {
  return request.post<unknown, LoginResult>('/admin/auth/login', payload)
}

/**
 * 管理员登出
 * POST /api/admin/auth/logout
 */
export function logoutApi(): Promise<void> {
  return request.post('/admin/auth/logout')
}

/**
 * 获取当前管理员个人信息
 * GET /api/admin/auth/me
 * 返 null 表示未登录
 */
export function fetchProfileApi(): Promise<AdminProfile | null> {
  return request.get<unknown, AdminProfile | null>('/admin/auth/me')
}
