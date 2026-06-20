/**
 * 专辑 (Album) - 对应 MySQL albums 表结构
 */
class Album {
  /**
   * @param {Object} params
   * @param {BigInt|string} params.id
   * @param {string} params.title
   * @param {string} [params.coverUrl]
   * @param {Date|string} params.releaseDate
   * @param {number} [params.albumType]
   * @param {Date|string} [params.createdAt]
   * @param {Date|string} [params.updatedAt]
   */
  constructor({ id, title, coverUrl = '', releaseDate, albumType = 0, createdAt, updatedAt }) {
    this.id = id
    this.title = title
    this.coverUrl = coverUrl
    this.releaseDate = releaseDate || new Date().toISOString()
    this.albumType = albumType
    this.createdAt = createdAt || new Date().toISOString()
    this.updatedAt = updatedAt || new Date().toISOString()
  }

  /**
   * 从 plain object 创建实例，支持 snake_case 到 camelCase 映射
   * @param {Object} obj
   * @returns {Album}
   */
  static from(obj) {
    if (!obj) return null
    return new Album({
      id: obj.id,
      title: obj.title,
      coverUrl: obj.coverUrl !== undefined ? obj.coverUrl : obj.cover_url,
      releaseDate: obj.releaseDate !== undefined ? obj.releaseDate : obj.release_date,
      albumType: obj.albumType !== undefined ? obj.albumType : obj.album_type,
      createdAt: obj.createdAt !== undefined ? obj.createdAt : obj.created_at,
      updatedAt: obj.updatedAt !== undefined ? obj.updatedAt : obj.updated_at
    })
  }
}

module.exports = Album
