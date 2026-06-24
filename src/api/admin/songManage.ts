import request from '@/utils/request'
export interface TrackArtist {
  artistId: string
  artistName?: string
  role: number
}
export interface TrackAudioResource {
  quality: number
  format: number
  bitrate: number
  streamUrl: string
  size: number
}
export interface TrackVideoResource {
  quality: number
  resolution: string
  fps: number
  format: number
  bitrate: number
  streamUrl: string
  size: number
}
export interface TrackListItem {
  id: string
  title: string
  albumId: string
  albumTitle: string
  albumCover: string
  artists: TrackArtist[]
  status: number
  trackNumber: number
  discNumber: number
  duration: number
  likedCount: number
  playCount: number
  hasAudio: boolean
  hasVideo: boolean
  createdAt: string
}
export interface TrackDetail {
  id?: string
  title: string
  albumId: string
  albumTitle?: string
  trackNumber: number
  discNumber: number
  status: number
  lyricsUrl: string
  duration: number
  artists: TrackArtist[]
  audioResources: TrackAudioResource[]
  videoResources: TrackVideoResource[]
}
export function listTracks(params: { query?: string; albumId?: string; status?: number; pageNum: number; pageSize: number }) {
  return request.get<{ list: TrackListItem[]; total: number }>(`/api/admin/manage/tracks`, { params })
}
export function getTrack(id: string) {
  return request.get<TrackDetail>(`/api/admin/manage/tracks/${id}`)
}
export function createTrack(data: TrackDetail) {
  return request.post<void>(`/api/admin/manage/tracks`, data)
}
export function updateTrack(id: string, data: TrackDetail) {
  return request.put<void>(`/api/admin/manage/tracks/${id}`, data)
}
export function deleteTrack(id: string) {
  return request.delete<void>(`/api/admin/manage/tracks/${id}`)
}
