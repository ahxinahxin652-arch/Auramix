import request from '@/utils/request'

// ==================== 公共类型 ====================

export interface PageResult<T> {
  current: number
  size: number
  total: number
  pages: number
  records: T[]
}

// ==================== 5.1 待处理审核列表 ====================

/** 维度 Agent 名称 */
export type AgentName =
  | 'PoliticalSensitivity'
  | 'ViolenceTerror'
  | 'ExplicitContent'
  | 'AntiSocial'

/** 审核裁决 verdict（TrackReviewRecord.verdict） */
export enum ReviewVerdict {
  /** 待审核（AI 审核中） */
  PENDING = 0,
  /** 通过 */
  PASS = 1,
  /** 不通过 */
  FAIL = -1,
  /** 待人工确认（低置信度） */
  WAITING_MANUAL = -2,
}

/** 审核处理状态 status（TrackReviewRecord.status） */
export enum ReviewStatus {
  /** AI 审核中 */
  REVIEWING = 0,
  /** AI 审核完成，待自动处理（高置信度） */
  PENDING_AUTO = 1,
  /** 已自动处理 */
  AUTO_DONE = 2,
  /** 待人工确认（低置信度） */
  PENDING_MANUAL = 3,
  /** 人工已确认 */
  MANUAL_DONE = 4,
  /** 失败/异常 */
  FAILED = 5,
}

export interface ReviewListItem {
  /** 审核记录 ID（后端 Long，JS 用 string 承载避免精度丢失） */
  id: string
  /** 关联歌曲 ID */
  trackId: string
  /** 歌曲标题（快照） */
  trackTitle: string
  /** 裁决，见 ReviewVerdict */
  verdict: number
  /** AI 最终置信度 0–100 */
  confidence: number
  /** 不通过原因（裁决 Agent 汇总） */
  failReasons: string
  /** 各维度审核明细（中文拼接） */
  dimensionDetails: string
  /** 处理状态，见 ReviewStatus */
  status: number
  /** 审核记录创建时间（ISO 8601） */
  createdAt: string
}

/**
 * 分页获取审核列表。
 *
 * - 不传 status：获取所有状态的审核记录
 * - status=0：只看审核中
 * - status=4：只看人工已确认
 *
 * 对应 `GET /api/admin/manage/reviews` 或 `GET /api/admin/manage/reviews?status={n}`
 */
export function listReviews(params: {
  pageNum: number
  pageSize: number
  status?: number
}): Promise<PageResult<ReviewListItem>> {
  return request.get<unknown, PageResult<ReviewListItem>>(
    '/admin/manage/reviews',
    { params },
  )
}

// ==================== 5.2 人工确认审核结果 ====================

export function confirmReview(
  id: string,
  data: { adminVerdict: number; adminNote?: string },
): Promise<void> {
  return request.post<unknown, void>(
    `/admin/manage/reviews/${id}/confirm`,
    data,
  )
}

// ==================== 5.3 审核进度快照 ====================

/** 维度进度状态 */
export type DimensionStatus = 'PENDING' | 'DONE'

/** 维度判定结果 */
export type DimensionVerdict = 'PASS' | 'FAIL'

/** 维度 Agent 进度（DimensionProgressVO） */
export interface DimensionProgress {
  agentName: AgentName
  displayName: string
  /** 执行顺序 1-4 */
  order: number
  status: DimensionStatus
  /** PASS / FAIL，未完成为 null */
  verdict: DimensionVerdict | null
  /** 置信度 0-100，未完成为 null */
  confidence: number | null
  /** 不通过原因，PASS 或未完成为 null */
  reason: string | null
  /** 维度开始时间（ISO 8601），并行执行可能未记录 */
  startedAt: string | null
  /** 维度完成时间 */
  finishedAt: string | null
  /** 执行耗时（毫秒） */
  durationMs: number | null
}

/** 裁决 Agent 进度（JudgeProgressVO） */
export interface JudgeProgress {
  status: DimensionStatus
  verdict: DimensionVerdict | null
  confidence: number | null
  /** 汇总的失败原因 */
  reason: string | null
  startedAt: string | null
  finishedAt: string | null
  durationMs: number | null
}

/** SSE 事件类型 */
export type SSEEventType =
  | 'SNAPSHOT'
  | 'STARTED'
  | 'DIMENSION_DONE'
  | 'JUDGE_DONE'
  | 'FINISHED'

/** 审核进度快照（ReviewProgressVO） */
export interface ReviewProgress {
  /** SSE 事件才有，同步快照中为 undefined */
  eventType?: SSEEventType
  recordId: string
  trackId: string
  trackTitle: string
  /** 流水线开始时间 */
  startedAt: string | null
  /** 4 维度进度，按 order 升序 */
  dimensions: DimensionProgress[]
  /** 裁决 Agent 进度 */
  judge: JudgeProgress
  /** 流水线完结时间，未完结为 null */
  finishedAt: string | null
  /** 最终处理状态（FINISHED 时回填） */
  finalStatus: number | null
  /** 最终裁决（FINISHED 时回填） */
  finalVerdict: number | null
  /** 最终置信度（FINISHED 时回填） */
  finalConfidence: number | null
}

export function getReviewProgress(id: string): Promise<ReviewProgress> {
  return request.get<unknown, ReviewProgress>(
    `/admin/manage/reviews/${id}/progress`,
  )
}

// ==================== 5.4 SSE 订阅 ====================

/** 维度 Agent 中文显示名映射（与后端 4.4 一致） */
export const DIMENSION_DISPLAY_NAME: Record<AgentName, string> = {
  PoliticalSensitivity: '政治敏感',
  ViolenceTerror: '暴力恐怖',
  ExplicitContent: '色情低俗',
  AntiSocial: '反社会',
}

/**
 * 订阅审核进度 SSE 流。
 *
 * 浏览器 EventSource 不支持自定义请求头，按接口文档要求通过 `?token=` query 参数传 JWT。
 * 订阅后服务端立即推一次 SNAPSHOT 全量事件；FINISHED 事件后服务端主动关闭连接，
 * 调用方应在 FINISHED 回调中调用 `es.close()` 双保险。
 *
 * @param id     审核记录 ID
 * @param token  管理员 JWT Token
 * @returns      EventSource 实例（调用方负责 close）
 */
export function subscribeReviewProgress(
  id: string,
  token: string,
): EventSource {
  const url = `/api/admin/manage/reviews/${id}/progress/stream?token=${encodeURIComponent(token)}`
  return new EventSource(url)
}
