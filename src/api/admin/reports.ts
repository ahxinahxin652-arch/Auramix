import request from '@/utils/request'

// ============= 类型 =============

export interface AdminReportListItem {
  id: string
  userId: string
  userEmail: string
  userDisplayName: string
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

export function listAllReports(params: {
  periodType?: number
  status?: number
  userKeyword?: string
  pageNum: number
  pageSize: number
}): Promise<PageResult<AdminReportListItem>> {
  return request.get<unknown, PageResult<AdminReportListItem>>('/admin/manage/reports', { params })
}

export function getReport(id: string): Promise<ReportVO> {
  return request.get<unknown, ReportVO>(`/admin/manage/reports/${id}`)
}

export function regenerateReport(userId: string, periodType: number): Promise<string> {
  return request.post<unknown, string>('/admin/manage/reports/regenerate', {
    userId,
    periodType,
  })
}