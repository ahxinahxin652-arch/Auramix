import request from '@/utils/request'

// ============= 类型 =============

export interface ReportListItem {
  id: string
  userId: string
  periodType: number
  periodStart: string
  periodEnd: string
  status: number
  statusLabel: string
  generatedAt: string
  title: string
}

export interface ReportVO {
  id: string
  userId: string
  periodType: number
  periodTypeLabel: string
  periodStart: string
  periodEnd: string
  status: number
  statusLabel: string
  errorMessage: string
  summary: string
  moodTags: string[]
  highlights: string[]
  recommendations: string[]
  /** 统计快照 JSON 字符串 (前端再解析可视化) */
  statsSnapshotJson: string
  generatedAt: string
  createdAt: string
}

export interface PageResult<T> {
  current: number
  size: number
  total: number
  pages: number
  records: T[]
}

// ============= API =============

export function listMyReports(
  periodType?: number,
  pageNum = 1,
  pageSize = 10,
): Promise<PageResult<ReportListItem>> {
  return request.get<unknown, PageResult<ReportListItem>>('/user/reports', {
    params: { periodType, pageNum, pageSize },
  })
}

export function getReport(id: string): Promise<ReportVO> {
  return request.get<unknown, ReportVO>(`/user/reports/${id}`)
}

export function generateReport(periodType: number): Promise<string> {
  return request.post<unknown, string>('/user/reports/generate', { periodType })
}

export function submitFeedback(
  reportId: string,
  rating: number,
  comment?: string,
): Promise<void> {
  return request.post<unknown, void>('/user/reports/feedback', {
    reportId,
    rating,
    comment,
  })
}