import request from '@/utils/request'

export interface Genre {
  id: string
  name: string
  createdAt: string
}

export interface PageResult<T> {
  current: number
  size: number
  total: number
  pages: number
  records: T[]
}

// 获取流派分页列表
export function getGenreList(params?: { query?: string; pageNum?: number; pageSize?: number }) {
  return request<PageResult<Genre>>({
    url: '/admin/genre/list',
    method: 'get',
    params
  })
}

// 获取所有流派（用于下拉列表等）
export function getAllGenres() {
  return request<Genre[]>({
    url: '/admin/genre/all',
    method: 'get'
  })
}

// 新增流派
export function addGenre(data: { name: string }) {
  return request<void>({
    url: '/admin/genre/add',
    method: 'post',
    data
  })
}

// 更新流派
export function updateGenre(id: string, data: { name: string }) {
  return request<void>({
    url: `/admin/genre/update/${id}`,
    method: 'put',
    data
  })
}

// 删除流派
export function deleteGenre(id: string) {
  return request<void>({
    url: `/admin/genre/delete/${id}`,
    method: 'delete'
  })
}

// 获取歌曲绑定的流派
export function getTrackGenres(trackId: string) {
  return request<Genre[]>({
    url: `/admin/genre/track/${trackId}`,
    method: 'get'
  })
}

// 绑定流派到歌曲
export function bindGenresToTrack(data: { trackId: string; genreIds: string[] }) {
  return request<void>({
    url: '/admin/genre/track/bind',
    method: 'post',
    data
  })
}

// 解绑流派
export function unbindGenreFromTrack(params: { trackId: string; genreId: string }) {
  return request<void>({
    url: '/admin/genre/track/unbind',
    method: 'post',
    params // Using RequestParam on backend
  })
}
