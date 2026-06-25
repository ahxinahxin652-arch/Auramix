import request from '@/utils/request'

export interface ArtistSearchItem {
  id: string
  name: string
  coverImg: string
}

export interface ArtistListItem {
  id: string
  name: string
  coverImg: string
  bio: string
  createdAt: string
  updatedAt: string
}

export interface ArtistDetail {
  id: string
  name: string
  coverImg: string
  bio: string
  createdAt: string
  updatedAt: string
}

export interface ArtistCreate {
  name: string
  coverImg?: string
  bio?: string
}

export interface ArtistUpdate {
  name: string
  coverImg: string
  bio: string
}

export interface PageResult<T> {
  current: number
  size: number
  total: number
  pages: number
  records: T[]
}

export function searchArtists(query?: string): Promise<ArtistSearchItem[]> {
  return request.get<unknown, ArtistSearchItem[]>('/admin/manage/artists/search', { params: { query } })
}

export function listArtists(params: { query?: string; pageNum: number; pageSize: number }): Promise<PageResult<ArtistListItem>> {
  return request.get<unknown, PageResult<ArtistListItem>>('/admin/manage/artists', { params })
}

export function getArtist(id: string): Promise<ArtistDetail> {
  return request.get<unknown, ArtistDetail>(`/admin/manage/artists/${id}`)
}

export function createArtist(data: ArtistCreate): Promise<void> {
  return request.post<unknown, void>('/admin/manage/artists', data)
}

export function updateArtist(id: string, data: ArtistUpdate): Promise<void> {
  return request.put<unknown, void>(`/admin/manage/artists/${id}`, data)
}

export function deleteArtist(id: string): Promise<void> {
  return request.delete<unknown, void>(`/admin/manage/artists/${id}`)
}
