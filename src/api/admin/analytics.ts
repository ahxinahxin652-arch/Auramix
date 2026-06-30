import request from '@/utils/request'

// ============= 类型 =============

export interface TrendPoint {
  date: string
  value: number
}

export interface OverviewAnalytics {
  totalUsers: number
  activeUsers: number
  totalTracks: number
  totalAlbums: number
  totalArtists: number
  totalPlays: number
  newUsers: number
  newTracks: number
  playsTrend: TrendPoint[]
  newUsersTrend: TrendPoint[]
}

export interface UserAnalytics {
  totalUsers: number
  newUsers: number
  activeUsers: number
  payingUsers: number
  payingRatio: number
  countryDist: { label: string; count: number }[]
  productDist: { label: string; count: number }[]
  newUsersTrend: TrendPoint[]
}

export interface TrackRankItem {
  trackId: number
  title: string
  albumTitle: string
  artists: string
  value: number
}

export interface TrackAnalytics {
  statusDist: TrendPoint[]
  newTracksTrend: TrendPoint[]
  topByPlay: TrackRankItem[]
  topByLike: TrackRankItem[]
}

export interface CatalogRankItem {
  id: number
  name: string
  coverUrl: string
  value: number
}

export interface CatalogAnalytics {
  type: string
  total: number
  newTrend: TrendPoint[]
  hotRank: CatalogRankItem[]
  followRank: CatalogRankItem[]
}

export interface ReviewDistItem {
  verdict: number
  label: string
  count: number
}

export interface ReviewAnalytics {
  totalRecords: number
  aiPassed: number
  aiRejected: number
  pending: number
  humanPending: number
  humanConfirmed: number
  aiPassRate: number
  verdictDist: ReviewDistItem[]
  trend: TrendPoint[]
}

export interface PlanSalesItem {
  planId: number
  planName: string
  soldCount: number
  revenue: number
}

export interface RevenuePoint {
  date: string
  amount: number
}

export interface MemberAnalytics {
  planSales: PlanSalesItem[]
  totalRevenue: number
  arpu: number
  activeMembers: number
  revenueTrend: RevenuePoint[]
}

export interface DrillItem {
  module: string
  id: number
  name: string
  extra: string
  value: number
  occurredAt: string
}

// ============= API =============

export function getOverview(range = '7d', forceRefresh = false): Promise<OverviewAnalytics> {
  return request.get<unknown, OverviewAnalytics>('/admin/manage/analytics/overview', {
    params: { range, forceRefresh },
  })
}

export function getUsers(range = '7d', forceRefresh = false): Promise<UserAnalytics> {
  return request.get<unknown, UserAnalytics>('/admin/manage/analytics/users', {
    params: { range, forceRefresh },
  })
}

export function getTracks(
  range = '7d',
  orderBy = 'play',
  forceRefresh = false,
): Promise<TrackAnalytics> {
  return request.get<unknown, TrackAnalytics>('/admin/manage/analytics/tracks', {
    params: { range, orderBy, forceRefresh },
  })
}

export function getCatalog(
  type = 'artist',
  range = '7d',
  forceRefresh = false,
): Promise<CatalogAnalytics> {
  return request.get<unknown, CatalogAnalytics>('/admin/manage/analytics/catalog', {
    params: { type, range, forceRefresh },
  })
}

export function getReviews(range = '7d', forceRefresh = false): Promise<ReviewAnalytics> {
  return request.get<unknown, ReviewAnalytics>('/admin/manage/analytics/reviews', {
    params: { range, forceRefresh },
  })
}

export function getMembers(range = '7d', forceRefresh = false): Promise<MemberAnalytics> {
  return request.get<unknown, MemberAnalytics>('/admin/manage/analytics/members', {
    params: { range, forceRefresh },
  })
}

export function drill(
  module: string,
  range = '7d',
  page = 1,
  size = 10,
  id?: number,
): Promise<{ total: number; records: DrillItem[] }> {
  return request.get<unknown, { total: number; records: DrillItem[] }>(
    '/admin/manage/analytics/drill',
    { params: { module, id, range, page, size } },
  )
}

export function buildExportUrl(module: string, range = '7d'): string {
  const base = import.meta.env.VITE_API_BASE_URL || ''
  const token = localStorage.getItem('auramix-token') || ''
  const sep = base.includes('?') ? '&' : '?'
  return `${base}/admin/manage/analytics/export?module=${encodeURIComponent(
    module,
  )}&range=${encodeURIComponent(range)}${token ? sep + 'token=' + encodeURIComponent(token) : ''}`
}