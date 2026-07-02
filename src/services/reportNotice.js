import { listMyReports } from '../api/reports'

const STORAGE_KEY_READ_ID = 'auramix_report_last_read_id'

/**
 * 从 localStorage 读出用户最后已读的报告 ID
 * @returns {string|null}
 */
export function getLastReadReportId() {
  try {
    return localStorage.getItem(STORAGE_KEY_READ_ID)
  } catch {
    return null
  }
}

/**
 * 记录用户最后已读的报告 ID (详情页打开时调用)
 * @param {string} id
 */
export function markReportRead(id) {
  try {
    localStorage.setItem(STORAGE_KEY_READ_ID, String(id))
  } catch {
    // localStorage 不可用, 静默
  }
}

/**
 * 清除已读记录 (登出时调用)
 */
export function clearReportReadState() {
  try {
    localStorage.removeItem(STORAGE_KEY_READ_ID)
  } catch {
    // ignore
  }
}

/**
 * 查询"是否有未读报告"
 * 策略: 取后端最新一份 status=已生成 的报告, 跟 localStorage 里的 lastReadId 比对.
 * 注意: 只对当前登录用户生效 (后端 /api/user/reports 只能返回自己的报告)
 * @returns {Promise<{ hasUnread: boolean, latest: object|null }>}
 */
export async function checkUnreadReport() {
  let latest = null
  try {
    const res = await listMyReports({ pageNum: 1, pageSize: 1 })
    if (res && Array.isArray(res.records) && res.records.length > 0) {
      // 只关心"已生成"的报告 (status=1), 不然状态=生成中 / 失败的也红点会很烦
      latest = res.records.find(r => r.status === 1) || null
    }
  } catch (err) {
    console.warn('查询最新报告失败:', err)
    return { hasUnread: false, latest: null }
  }

  if (!latest) {
    return { hasUnread: false, latest: null }
  }

  const lastRead = getLastReadReportId()
  // 没读过 或者 最新报告 ID 比上次读的大, 都算未读
  const hasUnread = !lastRead || String(latest.id) !== String(lastRead)
  return { hasUnread, latest }
}