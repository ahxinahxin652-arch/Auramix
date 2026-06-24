import request from '@/utils/request'
export interface AlbumSearchItem {
  id: string
  title: string
  albumType: number
  coverUrl: string
}
export interface AlbumQuickCreate {
  title: string
  albumType: number
  coverUrl?: string
  releaseDate?: string
}
export function searchAlbums(query?: string) {
  return request.get<AlbumSearchItem[]>(`/api/admin/manage/albums/search`, { params: { query } })
}
export function quickCreateAlbum(data: AlbumQuickCreate) {
  return request.post<AlbumSearchItem>(`/api/admin/manage/albums/quick`, data)
}
