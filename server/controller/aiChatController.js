const express = require('express')
const { getDb } = require('../dao/db')

module.exports = function(mainWindow) {
  const router = express.Router()

  // 1. 获取所有会话
  router.get('/sessions', async (req, res) => {
    try {
      const db = getDb()
      const sessions = await db.aiChatSession.findMany({
        orderBy: { updatedAt: 'desc' }
      })
      res.json({ success: true, data: sessions })
    } catch (err) {
      console.error('[AiChat] Get sessions error:', err)
      res.json({ success: false, error: err.message })
    }
  })

  // 2. 创建新会话
  router.post('/sessions', async (req, res) => {
    try {
      const { title } = req.body
      const db = getDb()
      const session = await db.aiChatSession.create({
        data: { title: title || '新对话' }
      })
      res.json({ success: true, data: session })
    } catch (err) {
      console.error('[AiChat] Create session error:', err)
      res.json({ success: false, error: err.message })
    }
  })

  // 3. 删除会话
  router.delete('/sessions/:id', async (req, res) => {
    try {
      const db = getDb()
      await db.aiChatSession.delete({
        where: { id: req.params.id }
      })
      res.json({ success: true })
    } catch (err) {
      console.error('[AiChat] Delete session error:', err)
      res.json({ success: false, error: err.message })
    }
  })

  // 4. 获取某个会话的所有消息
  router.get('/sessions/:id/messages', async (req, res) => {
    try {
      const db = getDb()
      const messages = await db.aiChatMessage.findMany({
        where: { sessionId: req.params.id },
        orderBy: { createdAt: 'asc' }
      })
      res.json({ success: true, data: messages })
    } catch (err) {
      console.error('[AiChat] Get messages error:', err)
      res.json({ success: false, error: err.message })
    }
  })

  // 5. 保存一条新消息 (用户发送的或 AI 返回的最终内容)
  router.post('/sessions/:id/messages', async (req, res) => {
    try {
      const { role, content } = req.body
      const db = getDb()
      const message = await db.aiChatMessage.create({
        data: {
          sessionId: req.params.id,
          role: role,
          content: content
        }
      })
      // 更新会话最后活跃时间
      await db.aiChatSession.update({
        where: { id: req.params.id },
        data: { updatedAt: new Date() }
      })
      res.json({ success: true, data: message })
    } catch (err) {
      console.error('[AiChat] Create message error:', err)
      res.json({ success: false, error: err.message })
    }
  })

  return router
}
