const express = require('express')
const multer = require('multer')
const musicService = require('../service/musicService')

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } })

module.exports = function(mainWindow) {
  const router = express.Router()

  /**
   * 从请求头中提取用户 JWT token
   */
  function getToken(req) {
    return req.headers['x-user-token'] || null
  }

  // 获取所有音乐库
  router.get('/warehouses', async (req, res) => {
    const sortBy = req.query.sortBy || 'recent-played'
    res.json(await musicService.getMusicWarehouses(sortBy))
  })

  // 创建音乐库
  router.post('/warehouses', async (req, res) => {
    const { name } = req.body
    res.json(await musicService.createMusicWarehouse(name))
  })

  // 校验曲目是否可播放
  router.post('/validate-track', async (req, res) => {
    const { trackId, filePath } = req.body
    res.json(await musicService.validateTrackPlayable(trackId, filePath))
  })

  // 通过 ID 更新最近播放时间
  router.post('/libraries/:id/recent-played', async (req, res) => {
    const { id } = req.params
    res.json(await musicService.updateRecentPlayedById(decodeURIComponent(id)))
  })

  // 通过 track ID 解析当前最新的 track 信息 // 获取曲目详情及音频文件信息
  router.get('/tracks/:id', async (req, res) => {
    const { id } = req.params
    res.json(await musicService.resolveTrackById(decodeURIComponent(id), getToken(req)))
  })

  // 更新曲目信息
  router.put('/tracks/:id', async (req, res) => {
    const { id } = req.params
    res.json(await musicService.updateTrack(decodeURIComponent(id), req.body))
  })

  // 删除曲目
  router.delete('/tracks/:id', async (req, res) => {
    const { id } = req.params
    res.json(await musicService.deleteTrack(decodeURIComponent(id)))
  })

  // 通过 library ID 获取曲目列表
  router.get('/libraries/:id/tracks', async (req, res) => {
    const { id } = req.params
    res.json(await musicService.getWarehouseTracksById(decodeURIComponent(id), getToken(req)))
  })

  // 通过 library ID 导入文件
  router.post('/libraries/:id/import', async (req, res) => {
    const { id } = req.params
    const { filePaths } = req.body
    res.json(await musicService.importFilesToWarehouseById(decodeURIComponent(id), filePaths))
  })

  // 通过 library ID 同步音乐库
  router.post('/libraries/:id/sync', async (req, res) => {
    const { id } = req.params
    res.json(await musicService.syncWarehouseById(decodeURIComponent(id)))
  })

  // 通过 library ID 更新音乐库信息
  router.put('/libraries/:id', async (req, res) => {
    const { id } = req.params
    res.json(await musicService.updateMusicWarehouseById(decodeURIComponent(id), req.body))
  })

  // 通过 library ID 删除音乐库
  router.delete('/libraries/:id', async (req, res) => {
    const { id } = req.params
    res.json(await musicService.deleteMusicWarehouseById(decodeURIComponent(id)))
  })

  // 读取文件的元数据
  router.get('/metadata', async (req, res) => {
    const { path } = req.query
    res.json(await musicService.getFileMetadata(path))
  })

  // 更新文件的元数据
  router.post('/metadata', async (req, res) => {
    res.json(await musicService.updateFileMetadata(req.body.path, req.body))
  })

  // 获取歌手信息
  router.get('/artists/:id', async (req, res) => {
    const { id } = req.params
    res.json(await musicService.getArtistById(decodeURIComponent(id)))
  })

  // 更新歌手信息
  router.put('/artists/:id', async (req, res) => {
    const { id } = req.params
    res.json(await musicService.updateArtist(decodeURIComponent(id), req.body))
  })

  // 获取专辑信息
  router.get('/albums/:id', async (req, res) => {
    const { id } = req.params
    res.json(await musicService.getAlbumById(decodeURIComponent(id)))
  })

  // 更新专辑信息
  router.put('/albums/:id', async (req, res) => {
    const { id } = req.params
    res.json(await musicService.updateAlbum(decodeURIComponent(id), req.body))
  })

  // ========== 远端 API 歌单管理路由（代理到 8080 端口） ==========

  // 获取远端歌单列表
  router.get('/remote/playlists', async (req, res) => {
    try {
      const { keyword, pageNum, pageSize } = req.query
      res.json(await musicService.getMusicWarehousesRemote(getToken(req), { keyword, pageNum, pageSize }))
    } catch (err) {
      console.error('[Express] GET /remote/playlists error:', err)
      res.json({ success: false, error: err.message || '服务器内部错误' })
    }
  })

  // 获取远端歌单详情
  router.get('/remote/playlists/:id', async (req, res) => {
    try {
      const { id } = req.params
      res.json(await musicService.getPlaylistDetailRemote(getToken(req), decodeURIComponent(id)))
    } catch (err) {
      console.error('[Express] GET /remote/playlists/:id error:', err)
      res.json({ success: false, error: err.message || '服务器内部错误' })
    }
  })

  // 创建远端歌单
  router.post('/remote/playlists', async (req, res) => {
    try {
      res.json(await musicService.createMusicWarehouseRemote(getToken(req), req.body))
    } catch (err) {
      console.error('[Express] POST /remote/playlists error:', err)
      res.json({ success: false, error: err.message || '服务器内部错误' })
    }
  })

  // 保存远端歌单（合并信息更新 + 可选封面上传）— multipart
  router.put('/remote/playlists/:id', upload.single('cover'), async (req, res) => {
    try {
      const { id } = req.params
      const info = req.body.info ? JSON.parse(req.body.info) : {}
      const coverFile = req.file
      res.json(await musicService.saveMusicWarehouseRemote(getToken(req), decodeURIComponent(id), info, coverFile))
    } catch (err) {
      console.error('[Express] PUT /remote/playlists/:id error:', err)
      res.json({ success: false, error: err.message || '服务器内部错误' })
    }
  })

  // 删除远端歌单
  router.delete('/remote/playlists/:id', async (req, res) => {
    try {
      const { id } = req.params
      res.json(await musicService.deleteMusicWarehouseRemote(getToken(req), decodeURIComponent(id)))
    } catch (err) {
      console.error('[Express] DELETE /remote/playlists/:id error:', err)
      res.json({ success: false, error: err.message || '服务器内部错误' })
    }
  })

  // 远端全局搜索
  router.get('/remote/search', async (req, res) => {
    try {
      res.json(await musicService.globalSearchRemote(getToken(req), req.query))
    } catch (err) {
      console.error('[Express] GET /remote/search error:', err)
      res.json({ success: false, error: err.message || '服务器内部错误' })
    }
  })

  // 获取远端专辑信息
  router.get('/remote/albums/:id', async (req, res) => {
    try {
      const { id } = req.params
      res.json(await musicService.getAlbumDetailRemote(getToken(req), decodeURIComponent(id)))
    } catch (err) {
      console.error('[Express] GET /remote/albums/:id error:', err)
      res.json({ success: false, error: err.message || '服务器内部错误' })
    }
  })

  // 获取远端歌手信息
  router.get('/remote/artists/:id', async (req, res) => {
    try {
      const { id } = req.params
      res.json(await musicService.getArtistDetailRemote(getToken(req), decodeURIComponent(id)))
    } catch (err) {
      console.error('[Express] GET /remote/artists/:id error:', err)
      res.json({ success: false, error: err.message || '服务器内部错误' })
    }
  })

  return router
}
