import request from '@/utils/request'

export interface UserListItem {
  id: string
  email: string
  displayName: string
  avatarUrl: string | null
  country: string
  product: number
  status: number
  createdAt: string
}

export interface PageResult<T> {
  current: number
  size: number
  total: number
  pages: number
  records: T[]
}

export interface UserCreateParams {
  email: string
  passwordHash?: string // 适配参数
  password?: string
  displayName: string
  country?: string
}

/**
 * 分页获取用户列表
 * GET /api/admin/manage/users
 */
export function fetchUsersApi(params: {
  query?: string
  status?: number | null
  pageNum: number
  pageSize: number
}): Promise<PageResult<UserListItem>> {
  return request.get('/admin/manage/users', { params })
}

/**
 * 新增用户
 * POST /api/admin/manage/users
 */
export function createUserApi(data: UserCreateParams): Promise<UserListItem> {
  return request.post('/admin/manage/users', data)
}

/**
 * 封禁/解封用户状态
 * PUT /api/admin/manage/users/{id}/status
 */
export function updateUserStatusApi(id: string, status: number): Promise<void> {
  return request.put(`/admin/manage/users/${id}/status`, { status })
}
