import request from '@/utils/request'
export interface ArtistSearchItem {
  id: string
  name: string
  coverImg: string
}
export function searchArtists(query?: string): Promise<ArtistSearchItem[]> {
  return request.get<unknown, ArtistSearchItem[]>('/admin/manage/artists/search', { params: { query } })
}
