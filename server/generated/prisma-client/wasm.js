
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


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

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

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
  status: 'status',
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
  lyricsUrl: 'lyricsUrl',
  status: 'status',
  likedCount: 'likedCount',
  playCount: 'playCount',
  trackNumber: 'trackNumber',
  discNumber: 'discNumber',
  member: 'member',
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
  createdAt: 'createdAt'
};

exports.Prisma.TrackVideoResourceScalarFieldEnum = {
  id: 'id',
  trackId: 'trackId',
  quality: 'quality',
  resolution: 'resolution',
  fps: 'fps',
  format: 'format',
  bitrate: 'bitrate',
  streamUrl: 'streamUrl',
  size: 'size',
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

exports.Prisma.ArtistFollowerScalarFieldEnum = {
  artistId: 'artistId',
  userId: 'userId',
  followedAt: 'followedAt'
};

exports.Prisma.LikedTrackScalarFieldEnum = {
  userId: 'userId',
  trackId: 'trackId',
  likedAt: 'likedAt'
};

exports.Prisma.LikedAlbumScalarFieldEnum = {
  albumId: 'albumId',
  userId: 'userId',
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

exports.Prisma.AiChatSessionScalarFieldEnum = {
  id: 'id',
  title: 'title',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AiChatMessageScalarFieldEnum = {
  id: 'id',
  sessionId: 'sessionId',
  role: 'role',
  content: 'content',
  createdAt: 'createdAt'
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
  TrackVideoResource: 'TrackVideoResource',
  Genre: 'Genre',
  TrackGenre: 'TrackGenre',
  Playlist: 'Playlist',
  PlaylistTrack: 'PlaylistTrack',
  PlaylistFollower: 'PlaylistFollower',
  ArtistFollower: 'ArtistFollower',
  LikedTrack: 'LikedTrack',
  LikedAlbum: 'LikedAlbum',
  PlaybackHistory: 'PlaybackHistory',
  AiChatSession: 'AiChatSession',
  AiChatMessage: 'AiChatMessage'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
