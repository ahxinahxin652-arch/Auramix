import request from '@/utils/request'

export interface ReviewListItem {
  id: string
  trackId: string
  trackTitle: string
  verdict: number
  confidence: number
  failReasons: string
  createdAt: string
}

export interface PageResult<T> {
  current: number
  size: number
  total: number
  pages: number
  records: T[]
}

export function listPendingReviews(params: {
  pageNum: number
  pageSize: number
}): Promise<PageResult<ReviewListItem>> {
  return request.get<unknown, PageResult<ReviewListItem>>('/admin/manage/reviews/pending', { params })
}

export function confirmReview(
  id: string,
  data: { adminVerdict: number; adminNote?: string },
): Promise<void> {
  return request.post<unknown, void>(`/admin/manage/reviews/${id}/confirm`, data)
}
