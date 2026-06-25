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
export interface PageResult<T> {
  current: number
  size: number
  total: number
  pages: number
  records: T[]
}

export function listTracks(params: { query?: string; albumId?: string; status?: number; pageNum: number; pageSize: number }): Promise<PageResult<TrackListItem>> {
  return request.get<unknown, PageResult<TrackListItem>>('/admin/manage/tracks', { params })
}

export function getTrack(id: string): Promise<TrackDetail> {
  return request.get<unknown, TrackDetail>(`/admin/manage/tracks/${id}`)
}

export function createTrack(data: TrackDetail): Promise<void> {
  return request.post<unknown, void>('/admin/manage/tracks', data)
}

export function updateTrack(id: string, data: TrackDetail): Promise<void> {
  return request.put<unknown, void>(`/admin/manage/tracks/${id}`, data)
}

export function deleteTrack(id: string): Promise<void> {
  return request.delete<unknown, void>(`/admin/manage/tracks/${id}`)
}

