const express = require('express')
const remoteApi = require('../dao/remoteApiClient')

module.exports = function() {
  const router = express.Router()

  /**
   * GET /api/intelligent/recommend/similar/:trackId
   * 获取相似歌曲
   */
  router.get('/recommend/similar/:trackId', async (req, res) => {
    try {
      const { trackId } = req.params
      // 与 musicController 保持一致，从 x-user-token 取 token（preload 会自动注入）
      const token = req.headers['x-user-token'] || ''
      console.log('[intelligentController] GET /recommend/similar/:trackId', { trackId, token: token ? 'present' : 'absent' })

      const result = await remoteApi.fetchSimilarTracks(trackId, token)
      res.json(result)
    } catch (err) {
      console.error('[Express] GET /intelligent/recommend/similar error:', err)
      res.json({ success: false, error: err.message || '服务器内部错误' })
    }
  })

  /**
   * GET /api/intelligent/recommend/daily
   * 获取每日推荐
   */
  router.get('/recommend/daily', async (req, res) => {
    try {
      const token = req.headers['x-user-token'] || ''
      console.log('[intelligentController] GET /recommend/daily', { token: token ? 'present' : 'absent' })

      const result = await remoteApi.fetchDailyRecommend(token)
      res.json(result)
    } catch (err) {
      console.error('[Express] GET /intelligent/recommend/daily error:', err)
      res.json({ success: false, error: err.message || '服务器内部错误' })
    }
  })

  return router
}
