/**
 * 曲目（Track） - 对应 MySQL tracks 表结构
 */
class Track {
  /**
   * @param {Object} params
   * @param {BigInt|string} params.id         - 雪花唯一ID
   * @param {BigInt|string} params.albumId    - 关联专辑ID
   * @param {string} params.title             - 歌曲名称
   * @param {number} params.duration          - 时长（毫秒）
   * @param {string} [params.lyricsUrl]       - 云端LRC歌词文件URL
   * @param {number} [params.status]          - 歌曲状态: 0为正常播放, -1为已下架, -2为暂无版权
   * @param {number} [params.likedCount]      - 被收藏红心总次数
   * @param {BigInt|number} [params.playCount] - 流媒体总播放次数
   * @param {number} params.trackNumber       - 该曲目在专辑中的顺序
   * @param {number} [params.discNumber]      - 碟片序号
   * @param {Date|string} [params.createdAt]
   * @param {Date|string} [params.updatedAt]
   */
  constructor({
    id, albumId, title, duration = 0, lyricsUrl = '',
    status = 0, likedCount = 0, playCount = 0n,
    trackNumber = 1, discNumber = 1, createdAt, updatedAt
  }) {
    this.id = id
    this.albumId = albumId
    this.title = title
    this.duration = duration
    this.lyricsUrl = lyricsUrl
    this.status = status
    this.likedCount = likedCount
    this.playCount = playCount
    this.trackNumber = trackNumber
    this.discNumber = discNumber
    this.createdAt = createdAt || new Date().toISOString()
    this.updatedAt = updatedAt || new Date().toISOString()
  }

  /**
   * 从 plain object 创建实例，支持 snake_case 到 camelCase 映射
   * @param {Object} obj
   * @returns {Track}
   */
  static from(obj) {
    if (!obj) return null
    return new Track({
      id: obj.id,
      albumId: obj.albumId !== undefined ? obj.albumId : obj.album_id,
      title: obj.title,
      duration: obj.duration,
      lyricsUrl: obj.lyricsUrl !== undefined ? obj.lyricsUrl : obj.lyrics_url,
      status: obj.status,
      likedCount: obj.likedCount !== undefined ? obj.likedCount : obj.liked_count,
      playCount: obj.playCount !== undefined ? obj.playCount : obj.play_count,
      trackNumber: obj.trackNumber !== undefined ? obj.trackNumber : obj.track_number,
      discNumber: obj.discNumber !== undefined ? obj.discNumber : obj.disc_number,
      createdAt: obj.createdAt !== undefined ? obj.createdAt : obj.created_at,
      updatedAt: obj.updatedAt !== undefined ? obj.updatedAt : obj.updated_at
    })
  }
}

module.exports = Track
