import request from '@/utils/request'
export interface ArtistSearchItem {
  id: string
  name: string
  coverImg: string
}
export function searchArtists(query?: string) {
  return request.get<ArtistSearchItem[]>(`/api/admin/manage/artists/search`, { params: { query } })
}
