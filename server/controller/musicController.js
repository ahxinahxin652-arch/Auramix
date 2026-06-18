const express = require('express')
const musicService = require('../service/musicService')

module.exports = function(mainWindow) {
  const router = express.Router()

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

  // 通过 track ID 解析当前最新的 track 信息
  router.get('/tracks/:id', async (req, res) => {
    const { id } = req.params
    res.json(await musicService.resolveTrackById(decodeURIComponent(id)))
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
    res.json(await musicService.getWarehouseTracksById(decodeURIComponent(id)))
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

  return router
}
