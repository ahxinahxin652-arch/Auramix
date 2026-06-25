import request from '@/utils/request'

export interface AlbumSearchItem {
  id: string
  title: string
  albumType: number
  coverUrl: string
}

export interface AlbumListItem {
  id: string
  title: string
  albumType: number
  coverUrl: string
  releaseDate: string
  createdAt: string
  updatedAt: string
}

export interface AlbumArtist {
  artistId: string
  artistName: string
}

export interface AlbumDetail {
  id: string
  title: string
  albumType: number
  coverUrl: string
  releaseDate: string
  createdAt: string
  updatedAt: string
  artists: AlbumArtist[]
}

export interface AlbumQuickCreate {
  title: string
  albumType: number
  coverUrl?: string
  releaseDate?: string
}

export interface AlbumUpdate {
  title: string
  albumType: number
  coverUrl: string
  releaseDate: string
  artistIds: string[]
}

export interface PageResult<T> {
  current: number
  size: number
  total: number
  pages: number
  records: T[]
}

export function searchAlbums(query?: string): Promise<AlbumSearchItem[]> {
  return request.get<unknown, AlbumSearchItem[]>('/admin/manage/albums/search', { params: { query } })
}

export function quickCreateAlbum(data: AlbumQuickCreate): Promise<AlbumSearchItem> {
  return request.post<unknown, AlbumSearchItem>('/admin/manage/albums/quick', data)
}

export function listAlbums(params: { query?: string; pageNum: number; pageSize: number }): Promise<PageResult<AlbumListItem>> {
  return request.get<unknown, PageResult<AlbumListItem>>('/admin/manage/albums', { params })
}

export function getAlbum(id: string): Promise<AlbumDetail> {
  return request.get<unknown, AlbumDetail>(`/admin/manage/albums/${id}`)
}

export function updateAlbum(id: string, data: AlbumUpdate): Promise<void> {
  return request.put<unknown, void>(`/admin/manage/albums/${id}`, data)
}

export function deleteAlbum(id: string): Promise<void> {
  return request.delete<unknown, void>(`/admin/manage/albums/${id}`)
}
