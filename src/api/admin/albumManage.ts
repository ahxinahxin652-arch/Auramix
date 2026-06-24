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
export function searchAlbums(query?: string): Promise<AlbumSearchItem[]> {
  return request.get<unknown, AlbumSearchItem[]>('/admin/manage/albums/search', { params: { query } })
}
export function quickCreateAlbum(data: AlbumQuickCreate): Promise<AlbumSearchItem> {
  return request.post<unknown, AlbumSearchItem>('/admin/manage/albums/quick', data)
}
