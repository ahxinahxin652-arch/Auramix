import { backendFetch } from '../utils/backendApi'

// ============= 类型 =============

/**
 * @typedef {Object} ReportListItem
 * @property {string} id
 * @property {string} userId
 * @property {number} periodType      // 1=周报 2=月报
 * @property {string} periodStart     // yyyy-MM-dd
 * @property {string} periodEnd
 * @property {number} status          // 0=生成中 1=已生成 2=失败 3=无数据
 * @property {string} statusLabel
 * @property {string} generatedAt     // yyyy-MM-dd HH:mm:ss
 * @property {string} title
 */

/**
 * @typedef {Object} ReportDetail
 * @property {string} id
 * @property {string} userId
 * @property {number} periodType
 * @property {string} periodTypeLabel
 * @property {string} periodStart
 * @property {string} periodEnd
 * @property {number} status
 * @property {string} statusLabel
 * @property {string} errorMessage
 * @property {string} summary
 * @property {string[]} moodTags
 * @property {string[]} highlights
 * @property {string[]} recommendations
 * @property {string} statsSnapshotJson
 * @property {string} generatedAt
 * @property {string} createdAt
 */

/**
 * @typedef {Object} PageResult
 * @property {number} current
 * @property {number} size
 * @property {number} total
 * @property {number} pages
 * @property {ReportListItem[]} records
 */

// ============= API =============

/**
 * 分页查询我的报告
 * @param {{ periodType?: number, pageNum?: number, pageSize?: number }} params
 * @returns {Promise<PageResult>}
 */
export function listMyReports(params = {}) {
  const search = new URLSearchParams()
  if (params.periodType !== undefined && params.periodType !== null) {
    search.set('periodType', String(params.periodType))
  }
  search.set('pageNum', String(params.pageNum ?? 1))
  search.set('pageSize', String(params.pageSize ?? 10))
  return backendFetch(`/api/user/reports?${search.toString()}`)
}

/**
 * 报告详情
 * @param {string} id
 * @returns {Promise<ReportDetail>}
 */
export function getReport(id) {
  return backendFetch(`/api/user/reports/${encodeURIComponent(id)}`)
}

/**
 * 手动触发生成报告 (异步)
 * @param {number} periodType  1=周报 2=月报
 * @returns {Promise<string>} 返回 reportId
 */
export function generateReport(periodType) {
  return backendFetch('/api/user/reports/generate', {
    method: 'POST',
    body: { periodType },
  })
}

/**
 * 提交反馈
 * @param {string} reportId
 * @param {number} rating  1=赞 2=踩
 * @param {string} [comment]
 * @returns {Promise<void>}
 */
export function submitFeedback(reportId, rating, comment) {
  return backendFetch('/api/user/reports/feedback', {
    method: 'POST',
    body: { reportId, rating, comment },
  })
}

/**
 * 把 statsSnapshotJson 解析成结构化对象
 * @param {string} jsonStr
 */
export function parseStats(jsonStr) {
  if (!jsonStr) return null
  try {
    return JSON.parse(jsonStr)
  } catch {
    return null
  }
}

/**
 * 报告状态文案
 * @param {number} status
 * @returns {string}
 */
export function statusLabel(status) {
  return ({ 0: '生成中', 1: '已生成', 2: '失败', 3: '无数据' })[status] || '未知'
}

/**
 * 周期类型文案
 * @param {number} periodType
 * @returns {string}
 */
export function periodTypeLabel(periodType) {
  return periodType === 1 ? '周报' : periodType === 2 ? '月报' : '未知'
}
