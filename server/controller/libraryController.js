const express = require('express')
const { getDb } = require('../dao/db')

module.exports = function(mainWindow) {
  const router = express.Router()

  // 1. 同步数据：从远端获取，存入本地 SQLite
  router.post('/sync', async (req, res) => {
    try {
      const token = req.headers['x-user-token']
      if (!token) return res.json({ success: false, error: '未登录' })

      const response = await fetch('http://localhost:8080/api/user/library/sync', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (data.code !== 200) {
        return res.json({ success: false, error: data.msg || '同步失败' })
      }

      const syncData = data.data
      const db = getDb()

      // 为了在本地保持引用完整，这里统一给一个本地默认用户ID 1
      const localUserId = 1n

      await db.$transaction(async (tx) => {
        // 清理当前用户的旧数据
        await tx.playlistTrack.deleteMany({
          where: { playlist: { ownerId: localUserId } }
        })
        await tx.playlist.deleteMany({
          where: { ownerId: localUserId }
        })
        await tx.artistFollower.deleteMany({
          where: { userId: localUserId }
        })

        await tx.playlistFollower.deleteMany({
          where: { userId: localUserId }
        })

        // 写入歌单 (自己创建的)
        for (const p of syncData.playlists) {
          const playlistId = BigInt(p.id)
          await tx.playlist.create({
            data: {
              id: playlistId,
              ownerId: localUserId,
              name: p.name,
              coverUrl: p.coverUrl,
              isPublic: 1
            }
          })
          
          // 写入歌单中的歌曲
          if (p.trackIds && p.trackIds.length > 0) {
            let sortOrder = 0
            for (const tid of p.trackIds) {
              const trackId = BigInt(tid)
              // 确保 track 存在（如果在线库未缓存该track，可以插入一个占位track）
              const trackExists = await tx.track.findUnique({ where: { id: trackId } })
              if (!trackExists) {
                // 插入占位专辑
                const albumId = BigInt(Date.now()) + trackId
                await tx.album.upsert({
                  where: { id: albumId },
                  update: {},
                  create: { id: albumId, title: "Unknown Album", releaseDate: new Date() }
                })
                // 插入占位Track
                await tx.track.create({
                  data: {
                    id: trackId,
                    albumId: albumId,
                    title: "Sync Track " + trackId,
                    duration: 0,
                    trackNumber: 1
                  }
                })
              }
              await tx.playlistTrack.create({
                data: {
                  playlistId,
                  trackId,
                  sortOrder: sortOrder++
                }
              })
            }
          }
        }

        // 写入订阅的歌单
        if (syncData.subscribedPlaylists && syncData.subscribedPlaylists.length > 0) {
          // 确保 dummy user 2n 存在，用于存放非自己的歌单
          await tx.user.upsert({
            where: { id: 2n },
            update: {},
            create: { id: 2n, email: "dummy_sub@auramix.com", passwordHash: "", displayName: "Other User" }
          })
          
          for (const p of syncData.subscribedPlaylists) {
            const playlistId = BigInt(p.id)
            await tx.playlist.upsert({
              where: { id: playlistId },
              update: { name: p.name, coverUrl: p.coverUrl },
              create: { id: playlistId, ownerId: 2n, name: p.name, coverUrl: p.coverUrl, isPublic: 1 }
            })

            await tx.playlistFollower.create({
              data: {
                userId: localUserId,
                playlistId
              }
            })

            // 如果有必要也可以缓存歌曲，这里简化处理
          }
        }

        // 写入关注的歌手
        if (syncData.followedArtists && syncData.followedArtists.length > 0) {
          for (const artist of syncData.followedArtists) {
            const artistId = BigInt(artist.id)
            await tx.artist.upsert({
              where: { id: artistId },
              update: { name: artist.name, coverImg: artist.coverImg },
              create: { id: artistId, name: artist.name, coverImg: artist.coverImg }
            })
            await tx.artistFollower.create({
              data: {
                userId: localUserId,
                artistId
              }
            })
          }
        }
      })

      res.json({ success: true, data: syncData })
    } catch (err) {
      console.error('[LibrarySync] Sync error:', err)
      res.json({ success: false, error: err.message })
    }
  })

  // 2. 本地获取歌单列表
  router.get('/playlists', async (req, res) => {
    try {
      const db = getDb()
      const localUserId = 1n
      const playlists = await db.playlist.findMany({
        where: { ownerId: localUserId },
        include: { tracks: true }
      })
      const result = playlists.map(p => ({
        id: p.id.toString(),
        name: p.name,
        coverUrl: p.coverUrl,
        trackIds: p.tracks.map(t => t.trackId.toString())
      }))
      res.json({ success: true, data: result })
    } catch (err) {
      res.json({ success: false, error: err.message })
    }
  })

  // 3. 本地获取订阅的歌单
  router.get('/playlists/subscribed', async (req, res) => {
    try {
      const db = getDb()
      const localUserId = 1n
      const follows = await db.playlistFollower.findMany({
        where: { userId: localUserId },
        include: { playlist: { include: { tracks: true } } }
      })
      res.json({ success: true, data: follows.map(f => ({
        id: f.playlist.id.toString(),
        name: f.playlist.name,
        coverUrl: f.playlist.coverUrl,
        trackIds: f.playlist.tracks.map(t => t.trackId.toString()),
        isSubscribed: true // 标识位
      })) })
    } catch (err) {
      res.json({ success: false, error: err.message })
    }
  })

  // 4. 本地获取关注歌手
  router.get('/artists/followed', async (req, res) => {
    try {
      const db = getDb()
      const localUserId = 1n
      const follows = await db.artistFollower.findMany({
        where: { userId: localUserId },
        include: { artist: true }
      })
      res.json({ success: true, data: follows.map(f => ({
        id: f.artist.id.toString(),
        name: f.artist.name,
        coverImg: f.artist.coverImg
      })) })
    } catch (err) {
      res.json({ success: false, error: err.message })
    }
  })

  // 5. 添加歌曲到本地歌单并转发到云端
  router.post('/playlists/:id/tracks', async (req, res) => {
    try {
      const playlistId = BigInt(req.params.id)
      const trackId = BigInt(req.body.trackId)
      const db = getDb()
      
      // 先插入占位 Track 如果不存在
      const trackExists = await db.track.findUnique({ where: { id: trackId } })
      if (!trackExists) {
        const albumId = BigInt(Date.now()) + trackId
        await db.album.upsert({
          where: { id: albumId },
          update: {},
          create: { id: albumId, title: "Unknown Album", releaseDate: new Date() }
        })
        await db.track.create({
          data: { id: trackId, albumId: albumId, title: "Added Track " + trackId, duration: 0, trackNumber: 1 }
        })
      }

      await db.playlistTrack.upsert({
        where: { playlistId_trackId: { playlistId, trackId } },
        update: {},
        create: { playlistId, trackId, sortOrder: 0 }
      })

      // 异步调用远端 (Optimistic Update)
      const token = req.headers['x-user-token']
      fetch(`http://localhost:8080/api/user/playlists/${req.params.id}/tracks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ trackIds: [req.body.trackId] })
      })
      .then(r => r.json())
      .then(data => console.log('Cloud API POST tracks response:', data))
      .catch(err => console.error('Cloud API POST error:', err))

      res.json({ success: true })
    } catch (err) {
      res.json({ success: false, error: err.message })
    }
  })

  // 6. 从本地歌单移除歌曲并转发到云端
  router.delete('/playlists/:id/tracks/:trackId', async (req, res) => {
    try {
      const playlistId = BigInt(req.params.id)
      const trackId = BigInt(req.params.trackId)
      const db = getDb()

      await db.playlistTrack.deleteMany({
        where: { playlistId, trackId }
      })

      const token = req.headers['x-user-token']
      fetch(`http://localhost:8080/api/user/playlists/${req.params.id}/tracks`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ trackIds: [req.params.trackId] })
      })
      .then(r => r.json())
      .then(data => console.log('Cloud API DELETE tracks response:', data))
      .catch(err => console.error('Cloud API DELETE error:', err))

      res.json({ success: true })
    } catch (err) {
      res.json({ success: false, error: err.message })
    }
  })

  // 7. 关注歌单（本地+云端）
  router.post('/playlists/:id/subscribe', async (req, res) => {
    try {
      const playlistId = BigInt(req.params.id)
      const localUserId = 1n
      const db = getDb()

      // 获取云端歌单详情并存入本地 (这里假设客户端会通过某种方式传递或者之后同步，这里直接用占位)
      // 若是已有歌单，则不需要。
      const playlistExists = await db.playlist.findUnique({ where: { id: playlistId } })
      if (!playlistExists) {
        await db.user.upsert({
          where: { id: 2n },
          update: {},
          create: { id: 2n, email: "dummy_sub@auramix.com", passwordHash: "", displayName: "Other User" }
        })
        await db.playlist.create({ data: { id: playlistId, ownerId: 2n, name: "Subscribed Playlist", isPublic: 1 } })
      }

      await db.playlistFollower.upsert({
        where: { playlistId_userId: { playlistId, userId: localUserId } },
        update: {},
        create: { playlistId, userId: localUserId }
      })

      const token = req.headers['x-user-token']
      fetch(`http://localhost:8080/api/user/playlists/${req.params.id}/follow`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      }).catch(err => console.error('Cloud API error:', err))

      res.json({ success: true })
    } catch (err) {
      res.json({ success: false, error: err.message })
    }
  })

  // 8. 取消关注歌单
  router.delete('/playlists/:id/unsubscribe', async (req, res) => {
    try {
      const playlistId = BigInt(req.params.id)
      const localUserId = 1n
      const db = getDb()

      await db.playlistFollower.deleteMany({
        where: { playlistId, userId: localUserId }
      })

      const token = req.headers['x-user-token']
      fetch(`http://localhost:8080/api/user/playlists/${req.params.id}/follow`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      }).catch(err => console.error('Cloud API error:', err))

      res.json({ success: true })
    } catch (err) {
      res.json({ success: false, error: err.message })
    }
  })

  // 9. 关注歌手（本地+云端）
  router.post('/artists/:id/follow', async (req, res) => {
    try {
      const artistId = BigInt(req.params.id)
      const localUserId = 1n
      const db = getDb()

      const artistExists = await db.artist.findUnique({ where: { id: artistId } })
      if (!artistExists) {
        await db.artist.create({ data: { id: artistId, name: "Followed Artist " + artistId } })
      }

      await db.artistFollower.upsert({
        where: { artistId_userId: { artistId, userId: localUserId } },
        update: {},
        create: { artistId, userId: localUserId }
      })

      const token = req.headers['x-user-token']
      fetch(`http://localhost:8080/api/user/artists/${req.params.id}/follow`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      }).catch(err => console.error('Cloud API error:', err))

      res.json({ success: true })
    } catch (err) {
      res.json({ success: false, error: err.message })
    }
  })

  // 10. 取消关注歌手
  router.delete('/artists/:id/unfollow', async (req, res) => {
    try {
      const artistId = BigInt(req.params.id)
      const localUserId = 1n
      const db = getDb()

      await db.artistFollower.deleteMany({
        where: { artistId, userId: localUserId }
      })

      const token = req.headers['x-user-token']
      fetch(`http://localhost:8080/api/user/artists/${req.params.id}/unfollow`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      }).catch(err => console.error('Cloud API error:', err))

      res.json({ success: true })
    } catch (err) {
      res.json({ success: false, error: err.message })
    }
  })

  return router
}
