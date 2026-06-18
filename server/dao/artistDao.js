const crypto = require('crypto')
const { getDb } = require('./db')

/**
 * 根据 ID 获取歌手，包含其演唱的所有曲目（通过 TrackArtist 中间表关联）
 * @param {string} id
 * @returns {Promise<Object|null>}
 */
async function getArtistById(id) {
  const db = getDb()
  try {
    const artist = await db.artist.findUnique({
      where: { id },
      include: {
        tracks: {
          include: {
            track: {
              include: {
                album: true,
                artists: {
                  include: {
                    artist: true
                  }
                },
                audioResources: true
              }
            }
          }
        }
      }
    })

    if (!artist) {
      return null
    }

    // 格式化歌手演唱的曲目列表为前端播放器所期望的 VO 格式
    const tracksList = artist.tracks.map(ta => {
      const track = ta.track
      const artistsList = track.artists.map(tArtist => ({
        id: tArtist.artist.id,
        name: tArtist.artist.name,
        role: tArtist.role
      }))
      const resource = track.audioResources[0] || { streamUrl: '', format: 'mp3', size: 0 }
      return {
        id: track.id,
        title: track.title,
        name: track.title,
        artist: artistsList.filter(a => a.role === 'Main Artist').map(a => a.name).join(' / ') || artistsList.map(a => a.name).join(' / '),
        album: track.album.title,
        albumId: track.albumId,
        cover: track.album.coverUrl || '',
        duration: track.duration / 1000, // 将 ms 转换为秒
        path: resource.streamUrl,
        format: resource.format,
        size: resource.size,
        artists: JSON.stringify(artistsList),
        trackNumber: track.trackNumber,
        discNumber: track.discNumber,
        lyrics: track.lyrics,
        createdAt: track.createdAt,
        updatedAt: track.updatedAt,
      }
    })

    return {
      id: artist.id,
      name: artist.name,
      coverImg: artist.coverImg || '',
      bio: artist.bio || '',
      createdAt: artist.createdAt,
      updatedAt: artist.updatedAt,
      tracks: tracksList
    }
  } catch (err) {
    console.error(`[DB] getArtistById error for ID ${id}:`, err)
    throw err
  }
}

/**
 * 如果歌手不存在则创建
 * @param {string} name
 * @returns {Promise<import('../generated/prisma-client').Artist>}
 */
async function createArtistIfNotExist(name) {
  const db = getDb()
  let artist = await db.artist.findUnique({
    where: { name }
  })
  if (!artist) {
    artist = await db.artist.create({
      data: {
        id: crypto.randomUUID(),
        name,
        coverImg: null,
        bio: ''
      }
    })
  }
  return artist
}

/**
 * 更新歌手信息
 * @param {string} id
 * @param {Object} updates - { name?, coverImg?, bio? }
 * @returns {Promise<import('../generated/prisma-client').Artist>}
 */
async function updateArtist(id, updates) {
  const db = getDb()
  const data = {}
  if (updates.name !== undefined) data.name = updates.name
  if (updates.coverImg !== undefined) data.coverImg = updates.coverImg
  if (updates.bio !== undefined) data.bio = updates.bio

  return await db.artist.update({
    where: { id },
    data
  })
}

module.exports = {
  getArtistById,
  createArtistIfNotExist,
  updateArtist
}
