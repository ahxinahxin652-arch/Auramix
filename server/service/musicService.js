const musicDao = require('../dao/musicDao')
const artistDao = require('../dao/artistDao')
const albumDao = require('../dao/albumDao')
const fs = require('fs')
const path = require('path')
const os = require('os')
const { execFile } = require('child_process')
const ApiResult = require('../pojo/vo/ApiResult')
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path

// ========== 音乐仓库 Service ==========

/**
 * 获取所有音乐库
 * @param {string} [sortBy] - 排序方式: 'recent-played' | 'recent-updated' | 'name'
 * @returns {Promise<import('../pojo/vo/ApiResult')<{ warehouses: Array<import('../pojo/vo/ResponseVOs').WarehouseItemVO> }>>}
 */
async function getMusicWarehouses(sortBy) {
  const warehouses = await musicDao.getAllWarehouses(sortBy)
  return ApiResult.ok({ warehouses })
}

/**
 * 创建音乐库
 * @param {string} name
 * @returns {Promise<import('../pojo/vo/ApiResult')<{ warehouse: import('../pojo/vo/ResponseVOs').WarehouseItemVO }>>}
 */
async function createMusicWarehouse(name) {
  if (!name || name.trim() === '') {
    return ApiResult.fail('音乐库名称不能为空')
  }

  // 验证名称不包含非法字符
  const invalidChars = /[<>:"/\\|?*]/
  if (invalidChars.test(name)) {
    return ApiResult.fail('音乐库名称包含非法字符')
  }

  const result = await musicDao.createWarehouse(name.trim())
  if (!result.success) {
    return ApiResult.fail(result.error)
  }
  return ApiResult.ok({ warehouse: result.warehouse })
}

/**
 * 通过 ID 更新音乐库信息
 * @param {string} libraryId - 音乐库 UUID
 * @param {Object} updates - 要更新的字段 { name?, description?, coverPath? }
 * @returns {Promise<import('../pojo/vo/ApiResult')<{ warehouse: import('../pojo/vo/ResponseVOs').WarehouseItemVO }>}
 */
async function updateMusicWarehouseById(libraryId, updates) {
  if (!updates || Object.keys(updates).length === 0) {
    return ApiResult.fail('没有要更新的内容')
  }

  // 如果要改名，做校验
  if (updates.name !== undefined) {
    const newName = updates.name.trim()
    if (!newName) {
      return ApiResult.fail('音乐库名称不能为空')
    }
    const invalidChars = /[<>:"/\\|?*]/
    if (invalidChars.test(newName)) {
      return ApiResult.fail('音乐库名称包含非法字符')
    }
    updates.name = newName
  }

  // 描述处理
  if (updates.description !== undefined) {
    updates.description = (updates.description || '').trim()
  }

  const result = await musicDao.updateWarehouseById(libraryId, updates)
  if (!result.success) {
    return ApiResult.fail(result.error)
  }
  return ApiResult.ok({ warehouse: result.warehouse })
}

/**
 * 通过 ID 删除音乐库
 * @param {string} libraryId
 * @returns {Promise<import('../pojo/vo/ApiResult')<null>>}
 */
async function deleteMusicWarehouseById(libraryId) {
  const result = await musicDao.deleteWarehouseById(libraryId)
  if (!result.success) {
    return ApiResult.fail(result.error || '删除失败')
  }
  return ApiResult.ok(null, '删除成功')
}

/**
 * 通过 ID 获取指定音乐库的曲目列表
 * @param {string} libraryId
 * @returns {Promise<import('../pojo/vo/ApiResult')>}
 */
async function getWarehouseTracksById(libraryId, token) {
  if (token) {
    try {
      const remoteRes = await musicDao.fetchPlaylistDetailRemote(libraryId, token)
      if (remoteRes && remoteRes.success && remoteRes.data) {
        const pd = remoteRes.data
        const validTracks = (pd.tracks || []).map(t => ({
          id: String(t.trackId),
          title: t.title || '',
          name: t.title || '',
          artist: (t.artists || []).map(a => a.name).join(' / '),
          album: t.albumTitle || '',
          albumId: String(t.albumId || ''),
          cover: t.coverUrl || '',
          duration: t.duration ? t.duration : 0,
          path: '', // No local path for remote tracks until downloaded/cached
          format: 'mp3',
          size: 0,
          artists: JSON.stringify((t.artists || []).map(a => ({
            id: a.id,
            name: a.name,
            role: a.role === 1 ? 'Featuring' : (a.role === 2 ? 'Composer/Songwriter' : 'Main Artist')
          }))),
          trackNumber: 1,
          discNumber: 1,
          member: '',
          lyrics: '',
          genres: t.genres || [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }))
        return ApiResult.ok({
          warehouseName: pd.name || '',
          tracks: validTracks,
          libraryId: String(pd.id),
          warehouse: {
            name: pd.name || '',
            description: pd.description || '',
            coverPath: pd.coverUrl || ''
          }
        })
      }
    } catch (err) {
      console.error('[MusicService] Failed to fetch remote playlist detail, fallback to local', err)
    }
  }

  const result = await musicDao.getWarehouseTracksById(libraryId)
  if (!result.success) {
    return ApiResult.fail(result.error)
  }
  return ApiResult.ok({ warehouseName: result.warehouseName, tracks: result.tracks, libraryId: result.libraryId, warehouse: result.warehouse })
}

/**
 * 通过 ID 导入文件到音乐库
 * @param {string} libraryId
 * @param {string[]} filePaths
 * @returns {Promise<import('../pojo/vo/ApiResult')<{ imported: number, skipped: number }>>}
 */
async function importFilesToWarehouseById(libraryId, filePaths) {
  const result = await musicDao.importFilesToWarehouseById(libraryId, filePaths)
  if (!result.success) {
    return ApiResult.fail(result.error || '导入失败')
  }
  return ApiResult.ok({ imported: result.result.imported, skipped: result.result.skipped })
}



/**
 * 校验单个曲目文件是否可播放
 * 如果文件不存在，自动从数据库删除并返回错误
 * @param {string} trackId - 曲目 ID
 * @param {string} filePath - 曲目文件路径
 * @returns {Promise<import('../pojo/vo/ApiResult')<{ playable: true }>>}
 */
async function validateTrackPlayable(trackId, filePath) {
  if (!fs.existsSync(filePath)) {
    try {
      const { getDb } = require('../dao/db')
      const db = getDb()
      await db.track.delete({ where: { id: BigInt(trackId) } })
      console.warn(`[DB Sync] Track "${trackId}" file missing, deleted from database`)
    } catch (e) {
      console.error(`[DB] Failed to delete orphan track "${trackId}":`, e.message)
    }
    return ApiResult.fail('该歌曲已被删除或已损坏')
  }
  return ApiResult.ok({ playable: true })
}

/**
 * 通过 track ID 解析当前最新的 track 信息（含最新 path）
 * @param {string} trackId
 * @returns {Promise<import('../pojo/vo/ApiResult')>}
 */
async function resolveTrackById(trackId, token, contextType, contextId, duration, context) {
  if (token) {
    try {
      const remoteRes = await musicDao.fetchTrackDetailRemote(trackId, token, contextType, contextId, duration, context)
      if (remoteRes && remoteRes.success && remoteRes.data) {
        const t = remoteRes.data
        const track = {
          id: String(t.id),
          title: t.title || '',
          name: t.title || '',
          artist: (t.artists || []).map(a => a.name).join(' / '),
          album: t.albumTitle || 'Unknown Album',
          albumId: String(t.albumId || ''),
          cover: t.coverUrl || '',
          duration: t.duration ? t.duration : 0,
          path: t.audioUrl || '',
          format: t.format || 'mp3',
          size: t.size || 0,
          artists: JSON.stringify((t.artists || []).map(a => ({
            id: a.id,
            name: a.name,
            role: a.role === 1 ? 'Featuring' : (a.role === 2 ? 'Composer/Songwriter' : 'Main Artist')
          }))),
          trackNumber: 1,
          discNumber: 1,
          lyrics: t.lyricsUrl || '',
          genres: t.genres || [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }

        // 提取相似推荐曲目和推荐歌单（仅当 context != 'similar' 时后端返回）
        let similarTracks = []
        let similarPlaylists = []
        if (context !== 'similar') {
          if (Array.isArray(t.similarTracks) && t.similarTracks.length > 0) {
            similarTracks = t.similarTracks.map(st => {
              const audioUrl = st.audioUrl || ''
              const ext = audioUrl.split('.').pop().toLowerCase().split('?')[0]
              return {
                id: String(st.trackId),
                title: st.title || '',
                name: st.title || '',
                artist: (st.artists || []).map(a => a.name).join(' / '),
                album: st.albumTitle || 'Unknown Album',
                cover: st.coverUrl || '',
                duration: st.duration ? st.duration : 0,
                path: audioUrl,
                format: ext || 'mp3',
                artists: JSON.stringify((st.artists || []).map(a => ({
                  id: a.id,
                  name: a.name,
                  role: a.role === 1 ? 'Featuring' : (a.role === 2 ? 'Composer/Songwriter' : 'Main Artist')
                }))),
                score: st.score,
                sources: st.sources || []
              }
            })
          }
          if (Array.isArray(t.similarPlaylists) && t.similarPlaylists.length > 0) {
            similarPlaylists = t.similarPlaylists.map(sp => ({
              id: String(sp.playlistId || sp.id),
              name: sp.name || sp.title || '',
              coverUrl: sp.coverUrl || '',
              trackCount: sp.trackCount || 0,
              description: sp.description || ''
            }))
          }
        }

        return ApiResult.ok({ track, similarTracks, similarPlaylists })
      }
    } catch (err) {
      console.error('[MusicService] Failed to fetch remote track detail, fallback to local', err)
    }
  }

  const result = await musicDao.resolveTrackById(trackId)
  if (!result.success) {
    return ApiResult.fail(result.error)
  }
  return ApiResult.ok({ track: result.track })
}

/**
 * 通过 ID 同步指定音乐库的数据
 * @param {string} libraryId
 * @returns {Promise<import('../pojo/vo/ApiResult')<{ added: number, removed: number }>>}
 */
async function syncWarehouseById(libraryId) {
  const result = await musicDao.syncWarehouseById(libraryId)
  return ApiResult.ok(result)
}

/**
 * 通过 ID 更新音乐库的最近播放时间（名称变更安全）
 * @param {string} libraryId - 音乐库 UUID
 * @returns {Promise<import('../pojo/vo/ApiResult')<null>>}
 */
async function updateRecentPlayedById(libraryId) {
  await musicDao.updateRecentPlayedById(libraryId)
  return ApiResult.ok(null)
}

/**
 * 更新曲目信息
 * @param {string} trackId
 * @param {Object} data - { title?, artist?, album? }
 * @returns {Promise<ApiResult>}
 */
async function updateTrack(trackId, data) {
  const result = await musicDao.updateTrack(trackId, data)
  if (!result.success) return ApiResult.fail(result.error || '更新失败')
  return ApiResult.ok({ track: result.track })
}

/**
 * 删除曲目
 * @param {string} trackId
 * @returns {Promise<ApiResult>}
 */
async function deleteTrack(trackId) {
  const result = await musicDao.deleteTrack(trackId)
  if (!result.success) return ApiResult.fail(result.error || '删除失败')
  return ApiResult.ok(null, '删除成功')
}

/**
 * 标准化图片 MIME 类型
 * music-metadata 可能返回 'jpg'、'png' 等非标准值
 */
function normalizeMimeType(format) {
  if (!format) return 'image/jpeg'
  // 已经是完整 MIME 类型
  if (format.startsWith('image/')) return format
  // 简写 → 标准 MIME
  const map = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', bmp: 'image/bmp', webp: 'image/webp' }
  return map[format.toLowerCase()] || 'image/jpeg'
}

/**
 * 读取独立文件的元数据（使用 music-metadata）
 */
async function getFileMetadata(filePath) {
  if (!filePath) {
    return ApiResult.fail('文件路径为空')
  }
  // 如果是远程 URL，则无法解析本地元数据，直接返回空信息避免报错
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return ApiResult.ok({ lyrics: '', title: '', artist: '', album: '', coverBase64: '' })
  }
  if (!fs.existsSync(filePath)) {
    return ApiResult.fail('文件不存在')
  }
  try {
    const { parseFile } = await import('music-metadata')
    const meta = await parseFile(filePath)
    let coverBase64 = ''
    if (meta.common.picture && meta.common.picture.length > 0) {
      const pic = meta.common.picture[0]
      const mime = normalizeMimeType(pic.format)
      // pic.data 可能是 Uint8Array（music-metadata v11+），需先转为 Buffer 才能正确 base64 编码
      const buf = Buffer.isBuffer(pic.data) ? pic.data : Buffer.from(pic.data)
      coverBase64 = `data:${mime};base64,${buf.toString('base64')}`
    }

    let lyricsStr = '';
    if (meta.native) {
      const id3v23 = meta.native['ID3v2.3'] || [];
      const id3v24 = meta.native['ID3v2.4'] || [];
      for (const tag of [...id3v23, ...id3v24]) {
        if (tag.id === 'TXXX:USLT' || tag.id === 'USLT') {
          lyricsStr = tag.value;
        }
      }
      const vorbis = meta.native.vorbis || [];
      for (const tag of vorbis) {
        if (tag.id === 'LYRICS' || tag.id === 'lyrics') {
          lyricsStr = tag.value;
        }
      }
    }
    if (!lyricsStr && meta.common && meta.common.lyrics) {
      if (Array.isArray(meta.common.lyrics)) {
        if (typeof meta.common.lyrics[0] === 'string') {
          lyricsStr = meta.common.lyrics.join('\n');
        } else if (meta.common.lyrics[0].text) {
          lyricsStr = meta.common.lyrics.map(l => l.text).join('\n');
        }
      } else if (typeof meta.common.lyrics === 'string') {
        lyricsStr = meta.common.lyrics;
      }
    }

    return ApiResult.ok({
      title: meta.common.title || '',
      artist: meta.common.artist || '',
      album: meta.common.album || '',
      albumArtist: meta.common.albumartist || '',
      genre: meta.common.genre ? meta.common.genre.join(', ') : '',
      year: meta.common.year || meta.common.date || '',
      trackNumber: meta.common.track?.no || '',
      totalTracks: meta.common.track?.of || '',
      discNumber: meta.common.disk?.no || '',
      totalDiscs: meta.common.disk?.of || '',
      comment: meta.common.comment ? meta.common.comment.join(', ') : '',
      lyrics: lyricsStr,
      cover: coverBase64
    })
  } catch (err) {
    return ApiResult.fail('解析元数据失败: ' + err.message)
  }
}

/**
 * 写入独立文件的元数据并更新可能关联的数据库记录
 * 使用 child_process.execFile 直接调用 ffmpeg，精确控制流映射
 */
async function updateFileMetadata(filePath, data) {
  if (!filePath || !fs.existsSync(filePath)) {
    return ApiResult.fail('文件不存在')
  }

  // 构建 metadata 键值对
  const metaArgs = []
  const addMeta = (key, value) => {
    if (value !== undefined && value !== null && value !== '') {
      metaArgs.push('-metadata', `${key}=${value}`)
    }
  }
  addMeta('title', data.title)
  addMeta('artist', data.artist)
  addMeta('album', data.album)
  addMeta('album_artist', data.albumArtist)
  addMeta('genre', data.genre)
  addMeta('date', data.year)
  addMeta('comment', data.comment)
  addMeta('lyrics', data.lyrics)

  let trackNo = data.trackNumber ? String(data.trackNumber) : ''
  if (data.totalTracks) trackNo += '/' + data.totalTracks
  addMeta('track', trackNo)

  let discNo = data.discNumber ? String(data.discNumber) : ''
  if (data.totalDiscs) discNo += '/' + data.totalDiscs
  addMeta('disc', discNo)

  // 临时输出路径
  const ext = path.extname(filePath)
  const basename = path.basename(filePath, ext)
  const dst = path.join(path.dirname(filePath), `${basename}.ffmetadata${ext}`)

  let tempCoverPath = null
  const hasNewCover = data.coverBase64 && data.coverBase64.startsWith('data:image')
  // coverBase64 === '' 表示用户主动移除了封面
  const removeCover = data.coverBase64 === ''

  // 如果有新封面，先写入临时文件
  if (hasNewCover) {
    try {
      const matches = data.coverBase64.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/)
      if (matches && matches.length === 3) {
        const imgExt = matches[1] === 'jpeg' ? 'jpg' : matches[1]
        const buffer = Buffer.from(matches[2], 'base64')
        tempCoverPath = path.join(os.tmpdir(), `cover_${Date.now()}.${imgExt}`)
        fs.writeFileSync(tempCoverPath, buffer)
      }
    } catch (e) {
      console.warn('写入临时封面文件失败:', e)
    }
  }

  // 构建 ffmpeg 参数
  const args = ['-y'] // 覆盖输出

  // Input #0: 原始文件
  args.push('-i', filePath)

  if (hasNewCover && tempCoverPath) {
    // Input #1: 新封面图片
    args.push('-i', tempCoverPath)
    // 映射: 原始音频流 + 新封面
    args.push('-map', '0:a', '-map', '1:0')
    // 标记为封面
    args.push('-disposition:v:0', 'attached_pic')
    args.push('-metadata:s:v', 'comment=Cover (front)')
  } else if (removeCover) {
    // 只保留音频流，移除所有视频/图片流
    args.push('-map', '0:a')
  } else {
    // 保留原始所有流（包括已有封面）
    args.push('-map', '0')
  }

  // 不重新编码
  args.push('-c', 'copy')

  // 添加 metadata
  args.push(...metaArgs)

  // 输出到临时文件
  args.push(dst)

  return new Promise((resolve) => {
    execFile(ffmpegPath, args, { maxBuffer: 10 * 1024 * 1024 }, async (err, stdout, stderr) => {
      // 清理临时封面文件
      if (tempCoverPath && fs.existsSync(tempCoverPath)) {
        try { fs.unlinkSync(tempCoverPath) } catch (_) {}
      }

      if (err) {
        // 清理输出文件
        if (fs.existsSync(dst)) {
          try { fs.unlinkSync(dst) } catch (_) {}
        }
        console.error('保存文件元数据失败:', stderr || err.message)
        resolve(ApiResult.fail('保存文件元数据失败: ' + (stderr || err.message)))
        return
      }

      // 用输出文件替换原始文件
      try {
        fs.renameSync(dst, filePath)
      } catch (renameErr) {
        // rename 失败时尝试 copy + delete
        try {
          fs.copyFileSync(dst, filePath)
          fs.unlinkSync(dst)
        } catch (copyErr) {
          console.error('替换原始文件失败:', copyErr)
          resolve(ApiResult.fail('替换原始文件失败: ' + copyErr.message))
          return
        }
      }

      // 如果有对应的数据库记录，同步更新数据库 (使用 absolute path 匹配)
      try {
        const { getDb } = require('../dao/db')
        const db = getDb()
        // Query database via stream_url in track_audio_resources
        const resource = await db.trackAudioResource.findFirst({
          where: { streamUrl: filePath },
          include: { track: { include: { album: true } } }
        })
        const track = resource?.track
        if (track) {
          // 重新从文件提取封面（确保与文件一致）
          let newCover = track.album.coverUrl || ''
          try {
            const { parseFile } = await import('music-metadata')
            const meta = await parseFile(filePath)
            if (meta.common.picture && meta.common.picture.length > 0) {
              const pic = meta.common.picture[0]
              const mime = normalizeMimeType(pic.format)
              const buf = Buffer.isBuffer(pic.data) ? pic.data : Buffer.from(pic.data)
              newCover = `data:${mime};base64,${buf.toString('base64')}`
            } else {
              newCover = ''
            }
          } catch (_) { /* 提取封面失败，保持原值 */ }

          // 更新 Track 标题
          await db.track.update({
            where: { id: track.id },
            data: {
              title: data.title || track.title
            }
          })

          // 更新 Album 信息
          if (data.album !== undefined || newCover !== undefined) {
            await db.album.update({
              where: { id: track.albumId },
              data: {
                ...(data.album !== undefined && { title: data.album }),
                ...(newCover !== undefined && { coverUrl: newCover })
              }
            })
          }

          // 更新歌手关系
          if (data.artist !== undefined) {
            const artistDao = require('../dao/artistDao')
            // 删除旧歌手关联
            await db.trackArtist.deleteMany({
              where: { trackId: track.id }
            })
            // 重新插入新歌手关联
            const artistNames = data.artist.split(/[,/;|&，、\/]/).map(name => name.trim()).filter(Boolean)
            if (artistNames.length === 0) {
              artistNames.push('未知歌手')
            }
            for (const name of artistNames) {
              const artist = await artistDao.createArtistIfNotExist(name)
              await db.trackArtist.create({
                data: {
                  trackId: track.id,
                  artistId: artist.id,
                  role: 0
                }
              })
            }
          }
        }
      } catch (dbErr) {
        console.error('更新数据库记录失败:', dbErr)
        // 即使数据库更新失败，文件也已经更新了
      }

      resolve(ApiResult.ok(null, '保存成功'))
    })
  })
}

/**
 * 根据 ID 获取歌手信息
 * // TODO: 后续歌手管理对接服务端接口
 * @param {string} id
 * @returns {Promise<ApiResult>}
 */
async function getArtistById(id) {
  try {
    const artist = await artistDao.getArtistById(id)
    if (!artist) {
      return ApiResult.fail('歌手不存在')
    }
    return ApiResult.ok({ artist })
  } catch (err) {
    return ApiResult.fail(err.message)
  }
}

/**
 * 更新歌手信息
 * // TODO: 后续歌手管理对接服务端接口
 * @param {string} id
 * @param {Object} updates
 * @returns {Promise<ApiResult>}
 */
async function updateArtist(id, updates) {
  try {
    const artist = await artistDao.updateArtist(id, updates)
    return ApiResult.ok({ artist })
  } catch (err) {
    return ApiResult.fail(err.message)
  }
}

/**
 * 根据 ID 获取专辑详情
 * @param {string} albumId
 * @returns {Promise<import('../pojo/vo/ApiResult')>}
 */
async function getAlbumById(albumId) {
  try {
    const album = await albumDao.getAlbumById(albumId)
    if (!album) {
      return ApiResult.fail('专辑不存在')
    }
    return ApiResult.ok({ album })
  } catch (err) {
    return ApiResult.fail(err.message)
  }
}

/**
 * 更新专辑信息
 * @param {string} albumId
 * @param {Object} updates
 * @returns {Promise<import('../pojo/vo/ApiResult')>}
 */
async function updateAlbum(albumId, updates) {
  try {
    const updated = await albumDao.updateAlbum(albumId, updates)
    return ApiResult.ok({ album: updated })
  } catch (err) {
    return ApiResult.fail(err.message)
  }
}

// ========== 远端 API 歌单管理服务 ==========
// 代理到 Java 后端 (8080端口) 进行歌单 CRUD，使用用户 JWT token 认证。
// 操作成功后同步本地 SQLite 镜像，保证本地 track 操作兼容。

/**
 * 从远端 API 获取当前用户所有歌单列表
 * @param {string} token - 用户 JWT token
 * @param {object} [params] - { keyword?, pageNum?, pageSize? }
 * @returns {Promise<import('../pojo/vo/ApiResult')<{ warehouses: Array, total: number }>>}
 */
async function getMusicWarehousesRemote(token, params) {
  const result = await musicDao.fetchAllPlaylistsRemote({ ...params, token })
  if (!result.success) {
    return ApiResult.fail(result.error || '获取歌单列表失败')
  }
  // user 端返回 PageResult 格式: { records: [...], total, current, size, pages }
  const data = result.data || {}
  return ApiResult.ok({
    warehouses: data.records || [],
    total: data.total || 0,
  })
}

/**
 * 从远端 API 获取歌单详情（含歌曲列表）
 * @param {string} token - 用户 JWT token
 * @param {string|number} playlistId
 * @returns {Promise<import('../pojo/vo/ApiResult')>}
 */
async function getPlaylistDetailRemote(token, playlistId) {
  const result = await musicDao.fetchPlaylistDetailRemote(playlistId, token)
  if (!result.success) {
    return ApiResult.fail(result.error || '获取歌单详情失败')
  }
  return ApiResult.ok(result.data)
}

/**
 * 通过远端 API 创建歌单（使用登录用户的 JWT token）
 * @param {string} token - 用户 JWT token
 * @param {object} body - { name, description?, isPublic? }
 * @returns {Promise<import('../pojo/vo/ApiResult')>}
 */
async function createMusicWarehouseRemote(token, body) {
  if (!body.name || body.name.trim() === '') {
    return ApiResult.fail('歌单名称不能为空')
  }

  const result = await musicDao.createPlaylistRemote({
    name: body.name.trim(),
    description: body.description || '',
    isPublic: body.isPublic !== undefined ? body.isPublic : true,
  }, token)

  if (!result.success) {
    return ApiResult.fail(result.error || '创建歌单失败')
  }

  // 同步本地 SQLite 镜像，保证本地 Track 操作兼容
  const pl = result.data
  if (pl && pl.id) {
    await musicDao.createPlaylistMirror(pl.id, pl.name, pl.description, pl.coverUrl)
  }

  return ApiResult.ok({ playlist: pl }, result.message || '歌单创建成功')
}

/**
 * 通过远端 API 保存歌单（合并信息更新 + 可选封面上传）
 * @param {string} token - 用户 JWT token
 * @param {string|number} playlistId
 * @param {object} info - { name?, description?, isPublic?, clearCover? }
 * @param {object} [coverFile] - multer file object { buffer, originalname, mimetype }
 * @returns {Promise<import('../pojo/vo/ApiResult')>}
 */
async function saveMusicWarehouseRemote(token, playlistId, info, coverFile) {
  if (!info || Object.keys(info).length === 0) {
    return ApiResult.fail('没有要保存的内容')
  }

  const result = await musicDao.savePlaylistRemote(playlistId, info, coverFile, token)
  if (!result.success) {
    return ApiResult.fail(result.error || '保存歌单失败')
  }

  // 同步本地镜像
  const mirrorFields = {}
  if (info.name !== undefined) mirrorFields.name = info.name
  if (info.description !== undefined) mirrorFields.description = info.description
  if (result.data && result.data.coverUrl) mirrorFields.coverUrl = result.data.coverUrl
  if (info.clearCover) mirrorFields.coverUrl = ''
  if (Object.keys(mirrorFields).length > 0) {
    await musicDao.updatePlaylistMirror(playlistId, mirrorFields)
  }

  return ApiResult.ok(result.data, result.message || '歌单已保存')
}

/**
 * 通过远端 API 删除歌单
 * @param {string} token - 用户 JWT token
 * @param {string|number} playlistId
 * @returns {Promise<import('../pojo/vo/ApiResult')>}
 */
async function deleteMusicWarehouseRemote(token, playlistId) {
  const result = await musicDao.deletePlaylistRemote(playlistId, token)
  if (!result.success) {
    return ApiResult.fail(result.error || '删除歌单失败')
  }

  // 同步删除本地镜像
  await musicDao.deletePlaylistMirror(playlistId)

  return ApiResult.ok(null, result.message || '歌单已删除')
}

async function globalSearchRemote(token, params) {
  const result = await musicDao.globalSearchRemote(params, token)
  if (!result.success) {
    return ApiResult.fail(result.error || '搜索失败')
  }
  return ApiResult.ok(result.data)
}

async function getAlbumDetailRemote(token, albumId) {
  const result = await musicDao.fetchAlbumDetailRemote(albumId, token)
  if (!result.success) {
    return ApiResult.fail(result.error || '获取专辑详情失败')
  }
  return ApiResult.ok({ album: result.data })
}

async function getArtistDetailRemote(token, artistId) {
  const result = await musicDao.fetchArtistDetailRemote(artistId, token)
  if (!result.success) {
    return ApiResult.fail(result.error || '获取歌手详情失败')
  }
  return ApiResult.ok({ artist: result.data })
}

module.exports = {
  getMusicWarehouses,
  createMusicWarehouse,
  updateMusicWarehouseById,
  deleteMusicWarehouseById,
  getWarehouseTracksById,
  importFilesToWarehouseById,
  validateTrackPlayable,
  resolveTrackById,
  syncWarehouseById,
  updateRecentPlayedById,
  updateTrack,
  deleteTrack,
  getFileMetadata,
  updateFileMetadata,
  getArtistById,
  updateArtist,
  getAlbumById,
  updateAlbum,
  getMusicWarehousesRemote,
  getPlaylistDetailRemote,
  createMusicWarehouseRemote,
  saveMusicWarehouseRemote,
  deleteMusicWarehouseRemote,
  globalSearchRemote,
  getAlbumDetailRemote,
  getArtistDetailRemote,
}
