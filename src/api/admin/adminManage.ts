import request from '@/utils/request'
import type { AdminProfile } from '@/types/admin'

export interface AdminCreateParams {
  username: string
  password?: string
  email?: string
}

/**
 * 全量获取管理员列表
 * GET /api/admin/manage/admins
 */
export function fetchAdminsApi(): Promise<AdminProfile[]> {
  return request.get('/admin/manage/admins')
}

/**
 * 新增管理员
 * POST /api/admin/manage/admins
 */
export function createAdminApi(data: AdminCreateParams): Promise<AdminProfile> {
  return request.post('/admin/manage/admins', data)
}

/**
 * 重置管理员密码
 * PUT /api/admin/manage/admins/{id}/password
 */
export function resetAdminPasswordApi(id: number, data: { newPassword: string }): Promise<void> {
  return request.put(`/admin/manage/admins/${id}/password`, data)
}

/**
 * 启用/停用管理员状态
 * PUT /api/admin/manage/admins/{id}/status
 */
export function updateAdminStatusApi(id: number, status: number): Promise<void> {
  return request.put(`/api/admin/manage/admins/${id}/status`, { status })
}

/**
 * 删除管理员
 * DELETE /api/admin/manage/admins/{id}
 */
export function deleteAdminApi(id: number): Promise<void> {
  return request.delete(`/admin/manage/admins/${id}`)
}
