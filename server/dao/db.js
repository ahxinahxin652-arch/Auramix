const { PrismaClient } = require('../generated/prisma-client')
const path = require('path')
const fs = require('fs')
const crypto = require('crypto')

let prisma = null

/**
 * 获取应用数据根目录
 * - 安装后 (isPackaged): exe 同级目录下的 data 文件夹 (如 D:\Music\Satisfy\data)
 * - dev 模式: ~/musicWarehouse  (如 C:\Users\xxx\musicWarehouse)
 * @returns {string}
 */
function getAppDataRoot() {
  const { app } = require('electron')
  if (app.isPackaged) {
    // app.getPath('exe') 返回 exe 的完整路径，如 D:\Music\Satisfy\Satisfy.exe
    // 取其父目录再拼 data
    return path.join(path.dirname(app.getPath('exe')), 'data')
  }
  return path.join(app.getPath('home'), 'musicWarehouse')
}

/**
 * 初始化 Prisma Client
 * 数据库文件路径：{userData}/data/db/music.db
 * @param {string} [customDbPath] - 自定义数据库文件路径（可选）
 * @returns {PrismaClient}
 */
function initDatabase(customDbPath) {
  if (prisma) return prisma

  const appDataRoot = getAppDataRoot()
  const dbDir = path.join(appDataRoot, 'db')
  const dbPath = customDbPath || path.join(dbDir, 'music.db')

  // 确保数据库目录存在
  const dbFileDir = path.dirname(dbPath)
  if (!fs.existsSync(dbFileDir)) {
    fs.mkdirSync(dbFileDir, { recursive: true })
  }

  const dbUrl = `file:${dbPath}`

  prisma = new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: ['error', 'warn'],
  })

  console.log(`[DB] SQLite database initialized at: ${dbPath}`)
  return prisma
}

/**
 * 自动执行数据库迁移（建表）
 * 使用 CREATE TABLE IF NOT EXISTS 确保幂等性
 */
async function autoMigrate() {
  const db = getDb()

  // 1. 创建 users 表
  await db.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "users" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "email" TEXT NOT NULL,
      "password_hash" TEXT NOT NULL,
      "display_name" TEXT NOT NULL,
      "avatar_url" TEXT,
      "country" TEXT NOT NULL DEFAULT 'CN',
      "product" TEXT NOT NULL DEFAULT 'free',
      "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" DATETIME NOT NULL
    )
  `)
  await db.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email")`)

  // 2. 创建 artists 表
  await db.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "artists" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "cover_img" TEXT,
      "bio" TEXT,
      "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" DATETIME NOT NULL
    )
  `)
  await db.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "artists_name_key" ON "artists"("name")`)

  // 3. 创建 albums 表
  await db.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "albums" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "title" TEXT NOT NULL,
      "cover_url" TEXT,
      "release_date" DATETIME NOT NULL,
      "album_type" TEXT NOT NULL DEFAULT 'album',
      "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" DATETIME NOT NULL
    )
  `)

  // 4. 创建 tracks 表
  await db.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "tracks" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "album_id" TEXT NOT NULL,
      "title" TEXT NOT NULL,
      "duration" INTEGER NOT NULL,
      "lyrics" TEXT,
      "track_number" INTEGER NOT NULL,
      "disc_number" INTEGER NOT NULL DEFAULT 1,
      "isrc" TEXT,
      "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" DATETIME NOT NULL,
      CONSTRAINT "tracks_album_id_fkey" FOREIGN KEY ("album_id") REFERENCES "albums" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    )
  `)
  await db.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "tracks_isrc_key" ON "tracks"("isrc")`)
  await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "tracks_album_id_idx" ON "tracks"("album_id")`)

  // 5. 创建 track_artists 中间表
  await db.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "track_artists" (
      "track_id" TEXT NOT NULL,
      "artist_id" TEXT NOT NULL,
      "role" TEXT NOT NULL DEFAULT 'Main Artist',
      PRIMARY KEY ("track_id", "artist_id"),
      CONSTRAINT "track_artists_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "tracks" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT "track_artists_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "artists" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    )
  `)
  await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "track_artists_track_id_idx" ON "track_artists"("track_id")`)
  await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "track_artists_artist_id_idx" ON "track_artists"("artist_id")`)

  // 6. 创建 album_artists 中间表
  await db.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "album_artists" (
      "album_id" TEXT NOT NULL,
      "artist_id" TEXT NOT NULL,
      PRIMARY KEY ("album_id", "artist_id"),
      CONSTRAINT "album_artists_album_id_fkey" FOREIGN KEY ("album_id") REFERENCES "albums" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT "album_artists_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "artists" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    )
  `)
  await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "album_artists_album_id_idx" ON "album_artists"("album_id")`)
  await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "album_artists_artist_id_idx" ON "album_artists"("artist_id")`)

  // 7. 创建 track_audio_resources 表
  await db.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "track_audio_resources" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "track_id" TEXT NOT NULL,
      "quality" TEXT NOT NULL,
      "format" TEXT NOT NULL,
      "bitrate" INTEGER NOT NULL,
      "stream_url" TEXT NOT NULL,
      "size" INTEGER NOT NULL,
      "is_premium_only" BOOLEAN NOT NULL DEFAULT 0,
      "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "track_audio_resources_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "tracks" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    )
  `)
  await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "track_audio_resources_track_id_idx" ON "track_audio_resources"("track_id")`)

  // 8. 创建 genres 表
  await db.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "genres" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)
  await db.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "genres_name_key" ON "genres"("name")`)

  // 9. 创建 track_genres 中间表
  await db.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "track_genres" (
      "track_id" TEXT NOT NULL,
      "genre_id" TEXT NOT NULL,
      PRIMARY KEY ("track_id", "genre_id"),
      CONSTRAINT "track_genres_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "tracks" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT "track_genres_genre_id_fkey" FOREIGN KEY ("genre_id") REFERENCES "genres" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    )
  `)
  await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "track_genres_track_id_idx" ON "track_genres"("track_id")`)
  await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "track_genres_genre_id_idx" ON "track_genres"("genre_id")`)

  // 10. 创建 playlists 表
  await db.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "playlists" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "owner_id" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "description" TEXT,
      "cover_url" TEXT,
      "is_public" BOOLEAN NOT NULL DEFAULT 1,
      "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" DATETIME NOT NULL,
      CONSTRAINT "playlists_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    )
  `)
  await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "playlists_owner_id_idx" ON "playlists"("owner_id")`)

  // 11. 创建 playlist_tracks 中间表
  await db.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "playlist_tracks" (
      "playlist_id" TEXT NOT NULL,
      "track_id" TEXT NOT NULL,
      "sort_order" INTEGER NOT NULL DEFAULT 0,
      "added_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY ("playlist_id", "track_id"),
      CONSTRAINT "playlist_tracks_playlist_id_fkey" FOREIGN KEY ("playlist_id") REFERENCES "playlists" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT "playlist_tracks_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "tracks" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    )
  `)
  await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "playlist_tracks_playlist_id_idx" ON "playlist_tracks"("playlist_id")`)
  await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "playlist_tracks_track_id_idx" ON "playlist_tracks"("track_id")`)

  // 12. 创建 playlist_followers 中间表
  await db.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "playlist_followers" (
      "playlist_id" TEXT NOT NULL,
      "user_id" TEXT NOT NULL,
      "followed_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY ("playlist_id", "user_id"),
      CONSTRAINT "playlist_followers_playlist_id_fkey" FOREIGN KEY ("playlist_id") REFERENCES "playlists" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT "playlist_followers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    )
  `)
  await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "playlist_followers_playlist_id_idx" ON "playlist_followers"("playlist_id")`)
  await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "playlist_followers_user_id_idx" ON "playlist_followers"("user_id")`)

  // 13. 创建 liked_tracks 收藏表
  await db.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "liked_tracks" (
      "user_id" TEXT NOT NULL,
      "track_id" TEXT NOT NULL,
      "liked_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY ("user_id", "track_id"),
      CONSTRAINT "liked_tracks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT "liked_tracks_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "tracks" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    )
  `)
  await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "liked_tracks_user_id_idx" ON "liked_tracks"("user_id")`)
  await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "liked_tracks_track_id_idx" ON "liked_tracks"("track_id")`)

  // 14. 创建 playback_history 历史记录表
  await db.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "playback_history" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "user_id" TEXT NOT NULL,
      "track_id" TEXT NOT NULL,
      "played_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "context_type" TEXT,
      "context_id" TEXT,
      CONSTRAINT "playback_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT "playback_history_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "tracks" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    )
  `)
  await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "playback_history_user_id_idx" ON "playback_history"("user_id")`)
  await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "playback_history_track_id_idx" ON "playback_history"("track_id")`)

  // 15. 创建 _prisma_migrations 兼容表
  await db.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "checksum" TEXT NOT NULL,
      "finished_at" DATETIME,
      "migration_name" TEXT NOT NULL,
      "started_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)

  await seedDatabase(db)

  console.log('[DB] Auramix Refactored auto-migration completed.')
}

/**
 * 获取音乐仓库根目录（与 musicDao.getMusicWarehouseRoot 保持一致）
 * - dev 模式: ~/musicWarehouse
 * - 安装后: {userData}/data/musicWarehouse
 * @returns {string}
 */
function getMusicWarehouseRoot() {
  const { app } = require('electron')
  const appDataRoot = getAppDataRoot()
  if (app.isPackaged) {
    return path.join(appDataRoot, 'musicWarehouse')
  }
  return appDataRoot
}

/**
 * 检查数据库是否为空，如果是则尝试从文件系统恢复
 * 场景：用户删除了 music.db 或首次使用但已有音乐文件
 * 已在在线化版本中废弃/占位
 */
async function autoRecoverFromFiles() {
  console.log('[DB] Auto-recovery skipped (Auramix Online schema refactored)')
}

/**
 * 获取 Prisma Client 实例
 * @returns {PrismaClient}
 */
function getDb() {
  if (!prisma) {
    throw new Error('Database not initialized. Call initDatabase() first.')
  }
  return prisma
}

/**
 * 断开数据库连接
 */
async function disconnectDatabase() {
  if (prisma) {
    await prisma.$disconnect()
    prisma = null
    console.log('[DB] Database disconnected')
  }
}

module.exports = {
  initDatabase,
  autoMigrate,
  autoRecoverFromFiles,
  getDb,
  disconnectDatabase,
}

async function seedDatabase(db) {
  console.log('[DB Seed] Checking if seeding is required...')
  try {
    const albumCount = await db.album.count()
    if (albumCount > 0) {
      console.log('[DB Seed] Database already seeded. Skipping.')
      return
    }

    console.log('[DB Seed] Seeding database with initial artists, albums, and tracks...')

    // Create default admin user
    await db.user.upsert({
      where: { email: 'user@auramix.com' },
      update: {},
      create: {
        id: 'default-user-uuid',
        email: 'user@auramix.com',
        passwordHash: 'no-password-needed',
        displayName: 'Auramix User',
        product: 'premium',
        country: 'CN'
      }
    })

    // 1. Scan and Seed Local Tracks
    const musicWarehouseRoot = getMusicWarehouseRoot()
    const localMusicDir = path.join(musicWarehouseRoot, '1', 'music')
    console.log('[DB Seed] Scanning local music directory:', localMusicDir)
    
    let seededLocalCount = 0
    if (fs.existsSync(localMusicDir)) {
      const files = fs.readdirSync(localMusicDir)
      for (const fileName of files) {
        const ext = path.extname(fileName).toLowerCase()
        if (['.flac', '.mp3', '.ogg', '.wav', '.aac', '.m4a'].includes(ext)) {
          const filePath = path.join(localMusicDir, fileName)
          const stats = fs.statSync(filePath)
          
          // Parse "Artist - Title" from fileName
          const baseName = path.basename(fileName, ext)
          let artistName = '未知歌手'
          let trackTitle = baseName
          if (baseName.includes(' - ')) {
            const parts = baseName.split(' - ')
            artistName = parts[0].trim()
            trackTitle = parts[1].trim()
          }
          
          try {
            // Create Artist
            const artist = await db.artist.upsert({
              where: { name: artistName },
              update: {},
              create: {
                id: crypto.randomUUID(),
                name: artistName,
                coverImg: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=300&auto=format&fit=crop',
                bio: `Local artist: ${artistName}`
              }
            })
            
            // Create Album
            const album = await db.album.create({
              data: {
                id: crypto.randomUUID(),
                title: trackTitle, // Local albums named after the single
                coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=300&auto=format&fit=crop',
                releaseDate: new Date('2024-01-01'),
                albumType: 'single'
              }
            })
            
            // Connect Album and Artist
            await db.albumArtist.create({
              data: {
                albumId: album.id,
                artistId: artist.id
              }
            })
            
            // Create Track
            const track = await db.track.create({
              data: {
                id: crypto.randomUUID(),
                albumId: album.id,
                title: trackTitle,
                duration: 210000, // approximate 3.5 minutes
                trackNumber: 1,
              }
            })
            
            // Connect Track and Artist
            await db.trackArtist.create({
              data: {
                trackId: track.id,
                artistId: artist.id,
                role: 'Main Artist'
              }
            })
            
            // Create Audio Resource
            await db.trackAudioResource.create({
              data: {
                id: crypto.randomUUID(),
                trackId: track.id,
                quality: ext === '.flac' ? 'lossless' : 'high',
                format: ext.replace('.', ''),
                bitrate: ext === '.flac' ? 1411200 : 320000,
                streamUrl: filePath,
                size: stats.size
              }
            })
            
            seededLocalCount++
          } catch (err) {
            console.error(`[DB Seed] Failed to seed local file "${fileName}":`, err.message)
          }
        }
      }
    }
    
    console.log(`[DB Seed] Seeded ${seededLocalCount} local tracks.`)

    // 2. Seed Online Mock Albums
    const onlineAlbums = [
      {
        title: '1989',
        artistName: 'Taylor Swift',
        coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=300&auto=format&fit=crop',
        releaseDate: new Date('2014-10-27'),
        albumType: 'album',
        tracks: [
          { title: 'Blank Space', duration: 231000, streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', format: 'mp3', bitrate: 128000, size: 3600000 },
          { title: 'Style', duration: 231000, streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', format: 'mp3', bitrate: 128000, size: 3600000 }
        ]
      },
      {
        title: 'Divide',
        artistName: 'Ed Sheeran',
        coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=300&auto=format&fit=crop',
        releaseDate: new Date('2017-03-03'),
        albumType: 'album',
        tracks: [
          { title: 'Shape of You', duration: 233000, streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', format: 'mp3', bitrate: 128000, size: 3700000 },
          { title: 'Castle on the Hill', duration: 261000, streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', format: 'mp3', bitrate: 128000, size: 4100000 }
        ]
      },
      {
        title: 'After Hours',
        artistName: 'The Weeknd',
        coverUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?q=80&w=300&auto=format&fit=crop',
        releaseDate: new Date('2020-03-20'),
        albumType: 'album',
        tracks: [
          { title: 'Blinding Lights', duration: 200000, streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', format: 'mp3', bitrate: 128000, size: 3200000 }
        ]
      }
    ]

    for (const albumData of onlineAlbums) {
      try {
        const artist = await db.artist.upsert({
          where: { name: albumData.artistName },
          update: {},
          create: {
            id: crypto.randomUUID(),
            name: albumData.artistName,
            coverImg: albumData.coverUrl,
            bio: `${albumData.artistName} is a globally renowned music artist.`
          }
        })

        const album = await db.album.create({
          data: {
            id: crypto.randomUUID(),
            title: albumData.title,
            coverUrl: albumData.coverUrl,
            releaseDate: albumData.releaseDate,
            albumType: albumData.albumType
          }
        })

        await db.albumArtist.create({
          data: {
            albumId: album.id,
            artistId: artist.id
          }
        })

        for (let i = 0; i < albumData.tracks.length; i++) {
          const trackData = albumData.tracks[i]
          const track = await db.track.create({
            data: {
              id: crypto.randomUUID(),
              albumId: album.id,
              title: trackData.title,
              duration: trackData.duration,
              trackNumber: i + 1
            }
          })

          await db.trackArtist.create({
            data: {
              trackId: track.id,
              artistId: artist.id,
              role: 'Main Artist'
            }
          })

          await db.trackAudioResource.create({
            data: {
              id: crypto.randomUUID(),
              trackId: track.id,
              quality: 'medium',
              format: trackData.format,
              bitrate: trackData.bitrate,
              streamUrl: trackData.streamUrl,
              size: trackData.size
            }
          })
        }
      } catch (err) {
        console.error(`[DB Seed] Failed to seed online album "${albumData.title}":`, err.message)
      }
    }

    console.log('[DB Seed] Seeding completed.')
  } catch (seedErr) {
    console.error('[DB Seed] Seeding encountered an error:', seedErr)
  }
}
