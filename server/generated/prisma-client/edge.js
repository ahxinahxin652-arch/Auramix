
Object.defineProperty(exports, "__esModule", { value: true });

const {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
  PrismaClientValidationError,
  NotFoundError,
  getPrismaClient,
  sqltag,
  empty,
  join,
  raw,
  skip,
  Decimal,
  Debug,
  objectEnumValues,
  makeStrictEnum,
  Extensions,
  warnOnce,
  defineDmmfProperty,
  Public,
  getRuntime
} = require('./runtime/edge.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = PrismaClientKnownRequestError;
Prisma.PrismaClientUnknownRequestError = PrismaClientUnknownRequestError
Prisma.PrismaClientRustPanicError = PrismaClientRustPanicError
Prisma.PrismaClientInitializationError = PrismaClientInitializationError
Prisma.PrismaClientValidationError = PrismaClientValidationError
Prisma.NotFoundError = NotFoundError
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = sqltag
Prisma.empty = empty
Prisma.join = join
Prisma.raw = raw
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = Extensions.getExtensionContext
Prisma.defineExtension = Extensions.defineExtension

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}





/**
 * Enums
 */
exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  email: 'email',
  passwordHash: 'passwordHash',
  displayName: 'displayName',
  avatarUrl: 'avatarUrl',
  country: 'country',
  product: 'product',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ArtistScalarFieldEnum = {
  id: 'id',
  name: 'name',
  coverImg: 'coverImg',
  bio: 'bio',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AlbumScalarFieldEnum = {
  id: 'id',
  title: 'title',
  coverUrl: 'coverUrl',
  releaseDate: 'releaseDate',
  albumType: 'albumType',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TrackScalarFieldEnum = {
  id: 'id',
  albumId: 'albumId',
  title: 'title',
  duration: 'duration',
  lyrics: 'lyrics',
  trackNumber: 'trackNumber',
  discNumber: 'discNumber',
  isrc: 'isrc',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TrackArtistScalarFieldEnum = {
  trackId: 'trackId',
  artistId: 'artistId',
  role: 'role'
};

exports.Prisma.AlbumArtistScalarFieldEnum = {
  albumId: 'albumId',
  artistId: 'artistId'
};

exports.Prisma.TrackAudioResourceScalarFieldEnum = {
  id: 'id',
  trackId: 'trackId',
  quality: 'quality',
  format: 'format',
  bitrate: 'bitrate',
  streamUrl: 'streamUrl',
  size: 'size',
  isPremiumOnly: 'isPremiumOnly',
  createdAt: 'createdAt'
};

exports.Prisma.GenreScalarFieldEnum = {
  id: 'id',
  name: 'name',
  createdAt: 'createdAt'
};

exports.Prisma.TrackGenreScalarFieldEnum = {
  trackId: 'trackId',
  genreId: 'genreId'
};

exports.Prisma.PlaylistScalarFieldEnum = {
  id: 'id',
  ownerId: 'ownerId',
  name: 'name',
  description: 'description',
  coverUrl: 'coverUrl',
  isPublic: 'isPublic',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PlaylistTrackScalarFieldEnum = {
  playlistId: 'playlistId',
  trackId: 'trackId',
  sortOrder: 'sortOrder',
  addedAt: 'addedAt'
};

exports.Prisma.PlaylistFollowerScalarFieldEnum = {
  playlistId: 'playlistId',
  userId: 'userId',
  followedAt: 'followedAt'
};

exports.Prisma.LikedTrackScalarFieldEnum = {
  userId: 'userId',
  trackId: 'trackId',
  likedAt: 'likedAt'
};

exports.Prisma.PlaybackHistoryScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  trackId: 'trackId',
  playedAt: 'playedAt',
  contextType: 'contextType',
  contextId: 'contextId'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};


exports.Prisma.ModelName = {
  User: 'User',
  Artist: 'Artist',
  Album: 'Album',
  Track: 'Track',
  TrackArtist: 'TrackArtist',
  AlbumArtist: 'AlbumArtist',
  TrackAudioResource: 'TrackAudioResource',
  Genre: 'Genre',
  TrackGenre: 'TrackGenre',
  Playlist: 'Playlist',
  PlaylistTrack: 'PlaylistTrack',
  PlaylistFollower: 'PlaylistFollower',
  LikedTrack: 'LikedTrack',
  PlaybackHistory: 'PlaybackHistory'
};
/**
 * Create the Client
 */
const config = {
  "generator": {
    "name": "client",
    "provider": {
      "fromEnvVar": null,
      "value": "prisma-client-js"
    },
    "output": {
      "value": "D:\\Code\\Project\\MyTools\\FlacConverter\\server\\generated\\prisma-client",
      "fromEnvVar": null
    },
    "config": {
      "engineType": "library"
    },
    "binaryTargets": [
      {
        "fromEnvVar": null,
        "value": "windows",
        "native": true
      }
    ],
    "previewFeatures": [],
    "sourceFilePath": "D:\\Code\\Project\\MyTools\\FlacConverter\\prisma\\schema.prisma",
    "isCustomOutput": true
  },
  "relativeEnvPaths": {
    "rootEnvPath": null,
    "schemaEnvPath": "../../../.env"
  },
  "relativePath": "../../../prisma",
  "clientVersion": "5.22.0",
  "engineVersion": "605197351a3c8bdd595af2d2a9bc3025bca48ea2",
  "datasourceNames": [
    "db"
  ],
  "activeProvider": "sqlite",
  "postinstall": false,
  "inlineDatasources": {
    "db": {
      "url": {
        "fromEnvVar": "DATABASE_URL",
        "value": null
      }
    }
  },
  "inlineSchema": "// Prisma Schema for FlacConverter (Auramix Online Refactored)\n// 使用 SQLite 作为本地开发与缓存数据库，模型结构支持平滑迁移至 PostgreSQL\n\ngenerator client {\n  provider = \"prisma-client-js\"\n  output   = \"../server/generated/prisma-client\"\n}\n\ndatasource db {\n  provider = \"sqlite\"\n  url      = env(\"DATABASE_URL\")\n}\n\n// ==========================================\n// 1. 用户与权限控制模块\n// ==========================================\n\nmodel User {\n  id           String   @id @default(uuid())\n  email        String   @unique\n  passwordHash String   @map(\"password_hash\") // 密码哈希 (bcrypt)\n  displayName  String   @map(\"display_name\") // 用户昵称，对应 Spotify displayName\n  avatarUrl    String?  @map(\"avatar_url\") // 用户头像云存储 S3 URL\n  country      String   @default(\"CN\") // 国家地区编码，用于音乐版权国家过滤限制\n  product      String   @default(\"free\") // 订阅产品等级: \"free\" | \"premium\"\n  createdAt    DateTime @default(now()) @map(\"created_at\")\n  updatedAt    DateTime @updatedAt @map(\"updated_at\")\n\n  // 关系映射\n  ownedPlaylists    Playlist[]         @relation(\"PlaylistOwner\") // 用户拥有的自建歌单\n  followedPlaylists PlaylistFollower[] // 用户收藏的别人的歌单\n  likedTracks       LikedTrack[] // 用户喜爱的歌曲\n  playbackHistories PlaybackHistory[] // 用户的播放记录历史\n\n  @@map(\"users\")\n}\n\n// ==========================================\n// 2. 音乐核心实体与多码率媒体模块\n// ==========================================\n\n// 2.1 歌手表\nmodel Artist {\n  id        String   @id @default(uuid())\n  name      String   @unique\n  coverImg  String?  @map(\"cover_img\") // 歌手背景/大头像图片 URL\n  bio       String? // 歌手小传简介\n  createdAt DateTime @default(now()) @map(\"created_at\")\n  updatedAt DateTime @updatedAt @map(\"updated_at\")\n\n  // 关系映射\n  tracks TrackArtist[] // 歌手演唱的音轨（多对多关系）\n  albums AlbumArtist[] // 歌手发行的唱片专辑（多对多关系）\n\n  @@map(\"artists\")\n}\n\n// 2.2 唱片专辑表\nmodel Album {\n  id          String   @id @default(uuid())\n  title       String\n  coverUrl    String?  @map(\"cover_url\") // 专辑封面图片 URL\n  releaseDate DateTime @map(\"release_date\") // 发行时间\n  albumType   String   @default(\"album\") @map(\"album_type\") // 唱片类型: \"album\" | \"single\" (单曲) | \"ep\" | \"compilation\" (精选集)\n  createdAt   DateTime @default(now()) @map(\"created_at\")\n  updatedAt   DateTime @updatedAt @map(\"updated_at\")\n\n  // 关系映射\n  tracks  Track[] // 专辑内的音轨（一对多）\n  artists AlbumArtist[] // 发行该专辑的歌手群（多对多）\n\n  @@map(\"albums\")\n}\n\n// 2.3 歌曲曲目表\nmodel Track {\n  id          String   @id @default(uuid())\n  albumId     String   @map(\"album_id\")\n  title       String\n  duration    Int // 歌曲时长，单位为“毫秒”(Spotify 标准)\n  lyrics      String? // 歌词（存放 LRC 文本或云端歌词 JSON 链接）\n  trackNumber Int      @map(\"track_number\") // 在专辑中的音轨序列号\n  discNumber  Int      @default(1) @map(\"disc_number\") // 多 CD 专辑中的碟片号\n  isrc        String?  @unique // 国际标准录音制品编码 (ISRC)\n  createdAt   DateTime @default(now()) @map(\"created_at\")\n  updatedAt   DateTime @updatedAt @map(\"updated_at\")\n\n  // 关系映射\n  album          Album                @relation(fields: [albumId], references: [id], onDelete: Cascade)\n  artists        TrackArtist[] // 歌曲所属歌手（多对多，即 Credits 数据源）\n  audioResources TrackAudioResource[] // 歌曲拥有的不同码率流媒体资源（一对多）\n  playlistTracks PlaylistTrack[] // 关联的歌单明细记录（多对多）\n  likedUsers     LikedTrack[] // 喜欢该歌曲的用户列表（多对多）\n  playbacks      PlaybackHistory[] // 播放历史记录\n  genres         TrackGenre[] // 歌曲流派分类（多对多关系）\n\n  @@index([albumId])\n  @@map(\"tracks\")\n}\n\n// 2.4 [多对多中间表] 歌曲-歌手关联表 (支持 Credits 角色控制)\nmodel TrackArtist {\n  trackId  String @map(\"track_id\")\n  artistId String @map(\"artist_id\")\n  role     String @default(\"Main Artist\") // 担当角色: \"Main Artist\" | \"Featured Artist\" | \"Producer\" | \"Writer\"\n\n  track  Track  @relation(fields: [trackId], references: [id], onDelete: Cascade)\n  artist Artist @relation(fields: [artistId], references: [id], onDelete: Cascade)\n\n  @@id([trackId, artistId])\n  @@index([trackId])\n  @@index([artistId])\n  @@map(\"track_artists\")\n}\n\n// 2.5 [多对多中间表] 专辑-歌手关联表\nmodel AlbumArtist {\n  albumId  String @map(\"album_id\")\n  artistId String @map(\"artist_id\")\n\n  album  Album  @relation(fields: [albumId], references: [id], onDelete: Cascade)\n  artist Artist @relation(fields: [artistId], references: [id], onDelete: Cascade)\n\n  @@id([albumId, artistId])\n  @@index([albumId])\n  @@index([artistId])\n  @@map(\"album_artists\")\n}\n\n// 2.6 音频流媒体资源表 (支持不同音质与码率的在线流式播放)\nmodel TrackAudioResource {\n  id            String   @id @default(uuid())\n  trackId       String   @map(\"track_id\")\n  quality       String // 音质等级: \"low\" (96k) | \"medium\" (160k) | \"high\" (320k) | \"lossless\"\n  format        String // 音频容器格式: \"mp3\" | \"ogg\" | \"aac\" | \"flac\"\n  bitrate       Int // 真实码率，例如 320000\n  streamUrl     String   @map(\"stream_url\") // 云端对象存储 S3 的流式播放 HTTP 地址\n  size          Int // 音频文件字节大小\n  isPremiumOnly Boolean  @default(false) @map(\"is_premium_only\") // 是否仅 Premium 付费会员可听\n  createdAt     DateTime @default(now()) @map(\"created_at\")\n\n  track Track @relation(fields: [trackId], references: [id], onDelete: Cascade)\n\n  @@index([trackId])\n  @@map(\"track_audio_resources\")\n}\n\n// 2.7 流派/曲风表 (流派独立建表以支撑多曲风检索与 AI 召回)\nmodel Genre {\n  id        String   @id @default(uuid())\n  name      String   @unique // 曲风名称，例如 \"Pop\" | \"Hip-Hop\" | \"K-Pop\" | \"Blues\"\n  createdAt DateTime @default(now()) @map(\"created_at\")\n\n  tracks TrackGenre[] // 拥有此流派分类的所有歌曲（多对多）\n\n  @@map(\"genres\")\n}\n\n// 2.8 [多对多中间表] 歌曲-流派关联表\nmodel TrackGenre {\n  trackId String @map(\"track_id\")\n  genreId String @map(\"genre_id\")\n\n  track Track @relation(fields: [trackId], references: [id], onDelete: Cascade)\n  genre Genre @relation(fields: [genreId], references: [id], onDelete: Cascade)\n\n  @@id([trackId, genreId])\n  @@index([trackId])\n  @@index([genreId])\n  @@map(\"track_genres\")\n}\n\n// ==========================================\n// 3. 歌单与收藏用户交互模块\n// ==========================================\n\n// 3.1 歌单元数据表\nmodel Playlist {\n  id          String   @id @default(uuid())\n  ownerId     String   @map(\"owner_id\")\n  name        String\n  description String?\n  coverUrl    String?  @map(\"cover_url\") // 歌单封面大图 URL\n  isPublic    Boolean  @default(true) @map(\"is_public\") // 是否公开（公开后可被他人检索和关注）\n  createdAt   DateTime @default(now()) @map(\"created_at\")\n  updatedAt   DateTime @updatedAt @map(\"updated_at\")\n\n  // 关系映射\n  owner     User               @relation(\"PlaylistOwner\", fields: [ownerId], references: [id], onDelete: Cascade)\n  tracks    PlaylistTrack[] // 歌单含有的歌曲明细\n  followers PlaylistFollower[] // 关注/收藏了该公开歌单的粉丝群（多对多关系）\n\n  @@index([ownerId])\n  @@map(\"playlists\")\n}\n\n// 3.2 [多对多中间表] 歌单-歌曲关系表 (支持用户对歌曲在歌单内自由拖拽排序)\nmodel PlaylistTrack {\n  playlistId String   @map(\"playlist_id\")\n  trackId    String   @map(\"track_id\")\n  sortOrder  Int      @default(0) @map(\"sort_order\") // 歌曲在歌单内的排位序列号 (从 0 开始)\n  addedAt    DateTime @default(now()) @map(\"added_at\") // 添加到该歌单的时刻\n\n  playlist Playlist @relation(fields: [playlistId], references: [id], onDelete: Cascade)\n  track    Track    @relation(fields: [trackId], references: [id], onDelete: Cascade)\n\n  @@id([playlistId, trackId])\n  @@index([playlistId])\n  @@index([trackId])\n  @@map(\"playlist_tracks\")\n}\n\n// 3.3 [多对多中间表] 歌单-收藏粉丝关联表 (用于追踪用户收藏别人创建的公开歌单)\nmodel PlaylistFollower {\n  playlistId String   @map(\"playlist_id\")\n  userId     String   @map(\"user_id\")\n  followedAt DateTime @default(now()) @map(\"followed_at\")\n\n  playlist Playlist @relation(fields: [playlistId], references: [id], onDelete: Cascade)\n  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@id([playlistId, userId])\n  @@index([playlistId])\n  @@index([userId])\n  @@map(\"playlist_followers\")\n}\n\n// 3.4 [多对多中间表] 用户-喜爱歌曲关联表 (独立分表用于存储 Spotify 核心“Liked Songs”列表)\nmodel LikedTrack {\n  userId  String   @map(\"user_id\")\n  trackId String   @map(\"track_id\")\n  likedAt DateTime @default(now()) @map(\"liked_at\") // 标记喜爱的时刻（用于列表倒序排列）\n\n  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)\n  track Track @relation(fields: [trackId], references: [id], onDelete: Cascade)\n\n  @@id([userId, trackId])\n  @@index([userId])\n  @@index([trackId])\n  @@map(\"liked_tracks\")\n}\n\n// ==========================================\n// 4. 播放历史模块\n// ==========================================\n\n// 4.1 播放记录表\nmodel PlaybackHistory {\n  id       String   @id @default(uuid())\n  userId   String   @map(\"user_id\")\n  trackId  String   @map(\"track_id\")\n  playedAt DateTime @default(now()) @map(\"played_at\") // 播放时刻\n\n  // 记录播放的上下文，用以支撑个性化算法和“最近播放 (Recently Played)”模块的快速还原\n  contextType String? @map(\"context_type\") // 播放来源上下文: \"playlist\" (歌单) | \"album\" (专辑) | \"artist\" (歌手页) | \"recommendation\" (电台算法)\n  contextId   String? @map(\"context_id\") // 上下文来源 ID (例如对应的 playlistId 或 albumId)\n\n  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)\n  track Track @relation(fields: [trackId], references: [id], onDelete: Cascade)\n\n  @@index([userId])\n  @@index([trackId])\n  @@map(\"playback_history\")\n}\n",
  "inlineSchemaHash": "bc25d6f08d7d92fe70bf17a1a9c5422b6559d7d8591a3b3c17534485e32efe6d",
  "copyEngine": true
}
config.dirname = '/'

config.runtimeDataModel = JSON.parse("{\"models\":{\"User\":{\"dbName\":\"users\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"email\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"passwordHash\",\"dbName\":\"password_hash\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"displayName\",\"dbName\":\"display_name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"avatarUrl\",\"dbName\":\"avatar_url\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"country\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"CN\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"product\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"free\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"dbName\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"ownedPlaylists\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Playlist\",\"relationName\":\"PlaylistOwner\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"followedPlaylists\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"PlaylistFollower\",\"relationName\":\"PlaylistFollowerToUser\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"likedTracks\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"LikedTrack\",\"relationName\":\"LikedTrackToUser\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"playbackHistories\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"PlaybackHistory\",\"relationName\":\"PlaybackHistoryToUser\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Artist\":{\"dbName\":\"artists\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"coverImg\",\"dbName\":\"cover_img\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"bio\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"dbName\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"tracks\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"TrackArtist\",\"relationName\":\"ArtistToTrackArtist\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"albums\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"AlbumArtist\",\"relationName\":\"AlbumArtistToArtist\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Album\":{\"dbName\":\"albums\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"title\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"coverUrl\",\"dbName\":\"cover_url\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"releaseDate\",\"dbName\":\"release_date\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"albumType\",\"dbName\":\"album_type\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"album\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"dbName\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"tracks\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Track\",\"relationName\":\"AlbumToTrack\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"artists\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"AlbumArtist\",\"relationName\":\"AlbumToAlbumArtist\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Track\":{\"dbName\":\"tracks\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"albumId\",\"dbName\":\"album_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"title\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"duration\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"lyrics\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"trackNumber\",\"dbName\":\"track_number\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"discNumber\",\"dbName\":\"disc_number\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":1,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isrc\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"dbName\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"album\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Album\",\"relationName\":\"AlbumToTrack\",\"relationFromFields\":[\"albumId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"artists\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"TrackArtist\",\"relationName\":\"TrackToTrackArtist\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"audioResources\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"TrackAudioResource\",\"relationName\":\"TrackToTrackAudioResource\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"playlistTracks\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"PlaylistTrack\",\"relationName\":\"PlaylistTrackToTrack\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"likedUsers\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"LikedTrack\",\"relationName\":\"LikedTrackToTrack\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"playbacks\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"PlaybackHistory\",\"relationName\":\"PlaybackHistoryToTrack\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"genres\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"TrackGenre\",\"relationName\":\"TrackToTrackGenre\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"TrackArtist\":{\"dbName\":\"track_artists\",\"fields\":[{\"name\":\"trackId\",\"dbName\":\"track_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"artistId\",\"dbName\":\"artist_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"role\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"Main Artist\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"track\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Track\",\"relationName\":\"TrackToTrackArtist\",\"relationFromFields\":[\"trackId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"artist\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Artist\",\"relationName\":\"ArtistToTrackArtist\",\"relationFromFields\":[\"artistId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"trackId\",\"artistId\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"AlbumArtist\":{\"dbName\":\"album_artists\",\"fields\":[{\"name\":\"albumId\",\"dbName\":\"album_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"artistId\",\"dbName\":\"artist_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"album\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Album\",\"relationName\":\"AlbumToAlbumArtist\",\"relationFromFields\":[\"albumId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"artist\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Artist\",\"relationName\":\"AlbumArtistToArtist\",\"relationFromFields\":[\"artistId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"albumId\",\"artistId\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"TrackAudioResource\":{\"dbName\":\"track_audio_resources\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"trackId\",\"dbName\":\"track_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"quality\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"format\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"bitrate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"streamUrl\",\"dbName\":\"stream_url\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"size\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isPremiumOnly\",\"dbName\":\"is_premium_only\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"track\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Track\",\"relationName\":\"TrackToTrackAudioResource\",\"relationFromFields\":[\"trackId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Genre\":{\"dbName\":\"genres\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tracks\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"TrackGenre\",\"relationName\":\"GenreToTrackGenre\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"TrackGenre\":{\"dbName\":\"track_genres\",\"fields\":[{\"name\":\"trackId\",\"dbName\":\"track_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"genreId\",\"dbName\":\"genre_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"track\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Track\",\"relationName\":\"TrackToTrackGenre\",\"relationFromFields\":[\"trackId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"genre\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Genre\",\"relationName\":\"GenreToTrackGenre\",\"relationFromFields\":[\"genreId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"trackId\",\"genreId\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Playlist\":{\"dbName\":\"playlists\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ownerId\",\"dbName\":\"owner_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"description\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"coverUrl\",\"dbName\":\"cover_url\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isPublic\",\"dbName\":\"is_public\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"dbName\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"owner\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"User\",\"relationName\":\"PlaylistOwner\",\"relationFromFields\":[\"ownerId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tracks\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"PlaylistTrack\",\"relationName\":\"PlaylistToPlaylistTrack\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"followers\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"PlaylistFollower\",\"relationName\":\"PlaylistToPlaylistFollower\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"PlaylistTrack\":{\"dbName\":\"playlist_tracks\",\"fields\":[{\"name\":\"playlistId\",\"dbName\":\"playlist_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"trackId\",\"dbName\":\"track_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"sortOrder\",\"dbName\":\"sort_order\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"addedAt\",\"dbName\":\"added_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"playlist\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Playlist\",\"relationName\":\"PlaylistToPlaylistTrack\",\"relationFromFields\":[\"playlistId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"track\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Track\",\"relationName\":\"PlaylistTrackToTrack\",\"relationFromFields\":[\"trackId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"playlistId\",\"trackId\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"PlaylistFollower\":{\"dbName\":\"playlist_followers\",\"fields\":[{\"name\":\"playlistId\",\"dbName\":\"playlist_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userId\",\"dbName\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"followedAt\",\"dbName\":\"followed_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"playlist\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Playlist\",\"relationName\":\"PlaylistToPlaylistFollower\",\"relationFromFields\":[\"playlistId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"User\",\"relationName\":\"PlaylistFollowerToUser\",\"relationFromFields\":[\"userId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"playlistId\",\"userId\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"LikedTrack\":{\"dbName\":\"liked_tracks\",\"fields\":[{\"name\":\"userId\",\"dbName\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"trackId\",\"dbName\":\"track_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"likedAt\",\"dbName\":\"liked_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"User\",\"relationName\":\"LikedTrackToUser\",\"relationFromFields\":[\"userId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"track\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Track\",\"relationName\":\"LikedTrackToTrack\",\"relationFromFields\":[\"trackId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"userId\",\"trackId\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"PlaybackHistory\":{\"dbName\":\"playback_history\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userId\",\"dbName\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"trackId\",\"dbName\":\"track_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"playedAt\",\"dbName\":\"played_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"contextType\",\"dbName\":\"context_type\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"contextId\",\"dbName\":\"context_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"User\",\"relationName\":\"PlaybackHistoryToUser\",\"relationFromFields\":[\"userId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"track\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Track\",\"relationName\":\"PlaybackHistoryToTrack\",\"relationFromFields\":[\"trackId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false}},\"enums\":{},\"types\":{}}")
defineDmmfProperty(exports.Prisma, config.runtimeDataModel)
config.engineWasm = undefined

config.injectableEdgeEnv = () => ({
  parsed: {
    DATABASE_URL: typeof globalThis !== 'undefined' && globalThis['DATABASE_URL'] || typeof process !== 'undefined' && process.env && process.env.DATABASE_URL || undefined
  }
})

if (typeof globalThis !== 'undefined' && globalThis['DEBUG'] || typeof process !== 'undefined' && process.env && process.env.DEBUG || undefined) {
  Debug.enable(typeof globalThis !== 'undefined' && globalThis['DEBUG'] || typeof process !== 'undefined' && process.env && process.env.DEBUG || undefined)
}

const PrismaClient = getPrismaClient(config)
exports.PrismaClient = PrismaClient
Object.assign(exports, Prisma)

