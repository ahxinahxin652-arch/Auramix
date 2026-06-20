const { getDb } = require('./db')

/**
 * 根据 ID 获取专辑信息，包含关联的曲目、歌手、曲风、音频资源等
 * @param {string} id
 */
async function getAlbumById(id) {
  const db = getDb()
  try {
    const album = await db.album.findUnique({
      where: { id: BigInt(id) },
      include: {
        artists: {
          include: {
            artist: true
          }
        },
        tracks: {
          include: {
            artists: {
              include: {
                artist: true
              }
            },
            audioResources: true
          },
          orderBy: {
            trackNumber: 'asc'
          }
        }
      }
    })

    if (!album) return null

    // 将 Tracks 列表映射为前端播放器所期望的 VO 格式
    const tracksList = album.tracks.map(track => {
      const artistsList = track.artists.map(ta => {
        let roleStr = 'Main Artist'
        if (ta.role === 1) roleStr = 'Featuring'
        else if (ta.role === 2) roleStr = 'Composer/Songwriter'
        return {
          id: ta.artist.id,
          name: ta.artist.name,
          role: roleStr
        }
      })
      const resource = track.audioResources[0] || { streamUrl: '', format: 0, size: 0 }
      const formatStr = resource.format === 1 ? 'flac' : (resource.format === 2 ? 'm4a' : (resource.format === 3 ? 'ogg' : 'mp3'))
      return {
        id: track.id,
        title: track.title,
        name: track.title,
        artist: artistsList.filter(a => a.role === 'Main Artist').map(a => a.name).join(' / ') || artistsList.map(a => a.name).join(' / '),
        album: album.title,
        albumId: track.albumId,
        cover: album.coverUrl || '',
        duration: track.duration / 1000, // 将 ms 转换为秒
        path: resource.streamUrl,
        format: formatStr,
        size: resource.size,
        artists: JSON.stringify(artistsList),
        trackNumber: track.trackNumber,
        discNumber: track.discNumber,
        lyrics: track.lyricsUrl || '',
        createdAt: track.createdAt,
        updatedAt: track.updatedAt,
      }
    })

    const artistsList = album.artists.map(aa => ({
      id: aa.artist.id,
      name: aa.artist.name
    }))

    return {
      id: album.id,
      title: album.title,
      coverUrl: album.coverUrl || '',
      releaseDate: album.releaseDate,
      albumType: album.albumType,
      createdAt: album.createdAt,
      updatedAt: album.updatedAt,
      artists: artistsList,
      tracks: tracksList
    }
  } catch (err) {
    console.error(`[DB] getAlbumById error for ID ${id}:`, err)
    throw err
  }
}

/**
 * 更新专辑信息
 * @param {string} id
 * @param {Object} updates
 */
async function updateAlbum(id, updates) {
  const db = getDb()
  const data = {}
  if (updates.title !== undefined) data.title = updates.title
  if (updates.coverUrl !== undefined) data.coverUrl = updates.coverUrl
  if (updates.releaseDate !== undefined) {
    // 保证有效的日期类型
    data.releaseDate = new Date(updates.releaseDate)
  }
  if (updates.albumType !== undefined) data.albumType = updates.albumType

  return await db.album.update({
    where: { id: BigInt(id) },
    data
  })
}

module.exports = {
  getAlbumById,
  updateAlbum
}
