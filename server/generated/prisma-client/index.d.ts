
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model Artist
 * 
 */
export type Artist = $Result.DefaultSelection<Prisma.$ArtistPayload>
/**
 * Model Album
 * 
 */
export type Album = $Result.DefaultSelection<Prisma.$AlbumPayload>
/**
 * Model Track
 * 
 */
export type Track = $Result.DefaultSelection<Prisma.$TrackPayload>
/**
 * Model TrackArtist
 * 
 */
export type TrackArtist = $Result.DefaultSelection<Prisma.$TrackArtistPayload>
/**
 * Model AlbumArtist
 * 
 */
export type AlbumArtist = $Result.DefaultSelection<Prisma.$AlbumArtistPayload>
/**
 * Model TrackAudioResource
 * 
 */
export type TrackAudioResource = $Result.DefaultSelection<Prisma.$TrackAudioResourcePayload>
/**
 * Model Genre
 * 
 */
export type Genre = $Result.DefaultSelection<Prisma.$GenrePayload>
/**
 * Model TrackGenre
 * 
 */
export type TrackGenre = $Result.DefaultSelection<Prisma.$TrackGenrePayload>
/**
 * Model Playlist
 * 
 */
export type Playlist = $Result.DefaultSelection<Prisma.$PlaylistPayload>
/**
 * Model PlaylistTrack
 * 
 */
export type PlaylistTrack = $Result.DefaultSelection<Prisma.$PlaylistTrackPayload>
/**
 * Model PlaylistFollower
 * 
 */
export type PlaylistFollower = $Result.DefaultSelection<Prisma.$PlaylistFollowerPayload>
/**
 * Model LikedTrack
 * 
 */
export type LikedTrack = $Result.DefaultSelection<Prisma.$LikedTrackPayload>
/**
 * Model PlaybackHistory
 * 
 */
export type PlaybackHistory = $Result.DefaultSelection<Prisma.$PlaybackHistoryPayload>

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 * 
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   * 
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   *
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): void;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb, ExtArgs>

      /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs>;

  /**
   * `prisma.artist`: Exposes CRUD operations for the **Artist** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Artists
    * const artists = await prisma.artist.findMany()
    * ```
    */
  get artist(): Prisma.ArtistDelegate<ExtArgs>;

  /**
   * `prisma.album`: Exposes CRUD operations for the **Album** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Albums
    * const albums = await prisma.album.findMany()
    * ```
    */
  get album(): Prisma.AlbumDelegate<ExtArgs>;

  /**
   * `prisma.track`: Exposes CRUD operations for the **Track** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Tracks
    * const tracks = await prisma.track.findMany()
    * ```
    */
  get track(): Prisma.TrackDelegate<ExtArgs>;

  /**
   * `prisma.trackArtist`: Exposes CRUD operations for the **TrackArtist** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more TrackArtists
    * const trackArtists = await prisma.trackArtist.findMany()
    * ```
    */
  get trackArtist(): Prisma.TrackArtistDelegate<ExtArgs>;

  /**
   * `prisma.albumArtist`: Exposes CRUD operations for the **AlbumArtist** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AlbumArtists
    * const albumArtists = await prisma.albumArtist.findMany()
    * ```
    */
  get albumArtist(): Prisma.AlbumArtistDelegate<ExtArgs>;

  /**
   * `prisma.trackAudioResource`: Exposes CRUD operations for the **TrackAudioResource** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more TrackAudioResources
    * const trackAudioResources = await prisma.trackAudioResource.findMany()
    * ```
    */
  get trackAudioResource(): Prisma.TrackAudioResourceDelegate<ExtArgs>;

  /**
   * `prisma.genre`: Exposes CRUD operations for the **Genre** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Genres
    * const genres = await prisma.genre.findMany()
    * ```
    */
  get genre(): Prisma.GenreDelegate<ExtArgs>;

  /**
   * `prisma.trackGenre`: Exposes CRUD operations for the **TrackGenre** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more TrackGenres
    * const trackGenres = await prisma.trackGenre.findMany()
    * ```
    */
  get trackGenre(): Prisma.TrackGenreDelegate<ExtArgs>;

  /**
   * `prisma.playlist`: Exposes CRUD operations for the **Playlist** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Playlists
    * const playlists = await prisma.playlist.findMany()
    * ```
    */
  get playlist(): Prisma.PlaylistDelegate<ExtArgs>;

  /**
   * `prisma.playlistTrack`: Exposes CRUD operations for the **PlaylistTrack** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PlaylistTracks
    * const playlistTracks = await prisma.playlistTrack.findMany()
    * ```
    */
  get playlistTrack(): Prisma.PlaylistTrackDelegate<ExtArgs>;

  /**
   * `prisma.playlistFollower`: Exposes CRUD operations for the **PlaylistFollower** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PlaylistFollowers
    * const playlistFollowers = await prisma.playlistFollower.findMany()
    * ```
    */
  get playlistFollower(): Prisma.PlaylistFollowerDelegate<ExtArgs>;

  /**
   * `prisma.likedTrack`: Exposes CRUD operations for the **LikedTrack** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more LikedTracks
    * const likedTracks = await prisma.likedTrack.findMany()
    * ```
    */
  get likedTrack(): Prisma.LikedTrackDelegate<ExtArgs>;

  /**
   * `prisma.playbackHistory`: Exposes CRUD operations for the **PlaybackHistory** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PlaybackHistories
    * const playbackHistories = await prisma.playbackHistory.findMany()
    * ```
    */
  get playbackHistory(): Prisma.PlaybackHistoryDelegate<ExtArgs>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError
  export import NotFoundError = runtime.NotFoundError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics 
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 5.22.0
   * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion 

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? K : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
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

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb extends $Utils.Fn<{extArgs: $Extensions.InternalArgs, clientOptions: PrismaClientOptions }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], this['params']['clientOptions']>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> = {
    meta: {
      modelProps: "user" | "artist" | "album" | "track" | "trackArtist" | "albumArtist" | "trackAudioResource" | "genre" | "trackGenre" | "playlist" | "playlistTrack" | "playlistFollower" | "likedTrack" | "playbackHistory"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      Artist: {
        payload: Prisma.$ArtistPayload<ExtArgs>
        fields: Prisma.ArtistFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ArtistFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ArtistPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ArtistFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ArtistPayload>
          }
          findFirst: {
            args: Prisma.ArtistFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ArtistPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ArtistFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ArtistPayload>
          }
          findMany: {
            args: Prisma.ArtistFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ArtistPayload>[]
          }
          create: {
            args: Prisma.ArtistCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ArtistPayload>
          }
          createMany: {
            args: Prisma.ArtistCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ArtistCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ArtistPayload>[]
          }
          delete: {
            args: Prisma.ArtistDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ArtistPayload>
          }
          update: {
            args: Prisma.ArtistUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ArtistPayload>
          }
          deleteMany: {
            args: Prisma.ArtistDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ArtistUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ArtistUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ArtistPayload>
          }
          aggregate: {
            args: Prisma.ArtistAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateArtist>
          }
          groupBy: {
            args: Prisma.ArtistGroupByArgs<ExtArgs>
            result: $Utils.Optional<ArtistGroupByOutputType>[]
          }
          count: {
            args: Prisma.ArtistCountArgs<ExtArgs>
            result: $Utils.Optional<ArtistCountAggregateOutputType> | number
          }
        }
      }
      Album: {
        payload: Prisma.$AlbumPayload<ExtArgs>
        fields: Prisma.AlbumFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AlbumFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AlbumPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AlbumFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AlbumPayload>
          }
          findFirst: {
            args: Prisma.AlbumFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AlbumPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AlbumFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AlbumPayload>
          }
          findMany: {
            args: Prisma.AlbumFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AlbumPayload>[]
          }
          create: {
            args: Prisma.AlbumCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AlbumPayload>
          }
          createMany: {
            args: Prisma.AlbumCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AlbumCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AlbumPayload>[]
          }
          delete: {
            args: Prisma.AlbumDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AlbumPayload>
          }
          update: {
            args: Prisma.AlbumUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AlbumPayload>
          }
          deleteMany: {
            args: Prisma.AlbumDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AlbumUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.AlbumUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AlbumPayload>
          }
          aggregate: {
            args: Prisma.AlbumAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAlbum>
          }
          groupBy: {
            args: Prisma.AlbumGroupByArgs<ExtArgs>
            result: $Utils.Optional<AlbumGroupByOutputType>[]
          }
          count: {
            args: Prisma.AlbumCountArgs<ExtArgs>
            result: $Utils.Optional<AlbumCountAggregateOutputType> | number
          }
        }
      }
      Track: {
        payload: Prisma.$TrackPayload<ExtArgs>
        fields: Prisma.TrackFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TrackFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrackPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TrackFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrackPayload>
          }
          findFirst: {
            args: Prisma.TrackFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrackPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TrackFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrackPayload>
          }
          findMany: {
            args: Prisma.TrackFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrackPayload>[]
          }
          create: {
            args: Prisma.TrackCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrackPayload>
          }
          createMany: {
            args: Prisma.TrackCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TrackCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrackPayload>[]
          }
          delete: {
            args: Prisma.TrackDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrackPayload>
          }
          update: {
            args: Prisma.TrackUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrackPayload>
          }
          deleteMany: {
            args: Prisma.TrackDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TrackUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.TrackUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrackPayload>
          }
          aggregate: {
            args: Prisma.TrackAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTrack>
          }
          groupBy: {
            args: Prisma.TrackGroupByArgs<ExtArgs>
            result: $Utils.Optional<TrackGroupByOutputType>[]
          }
          count: {
            args: Prisma.TrackCountArgs<ExtArgs>
            result: $Utils.Optional<TrackCountAggregateOutputType> | number
          }
        }
      }
      TrackArtist: {
        payload: Prisma.$TrackArtistPayload<ExtArgs>
        fields: Prisma.TrackArtistFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TrackArtistFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrackArtistPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TrackArtistFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrackArtistPayload>
          }
          findFirst: {
            args: Prisma.TrackArtistFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrackArtistPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TrackArtistFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrackArtistPayload>
          }
          findMany: {
            args: Prisma.TrackArtistFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrackArtistPayload>[]
          }
          create: {
            args: Prisma.TrackArtistCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrackArtistPayload>
          }
          createMany: {
            args: Prisma.TrackArtistCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TrackArtistCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrackArtistPayload>[]
          }
          delete: {
            args: Prisma.TrackArtistDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrackArtistPayload>
          }
          update: {
            args: Prisma.TrackArtistUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrackArtistPayload>
          }
          deleteMany: {
            args: Prisma.TrackArtistDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TrackArtistUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.TrackArtistUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrackArtistPayload>
          }
          aggregate: {
            args: Prisma.TrackArtistAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTrackArtist>
          }
          groupBy: {
            args: Prisma.TrackArtistGroupByArgs<ExtArgs>
            result: $Utils.Optional<TrackArtistGroupByOutputType>[]
          }
          count: {
            args: Prisma.TrackArtistCountArgs<ExtArgs>
            result: $Utils.Optional<TrackArtistCountAggregateOutputType> | number
          }
        }
      }
      AlbumArtist: {
        payload: Prisma.$AlbumArtistPayload<ExtArgs>
        fields: Prisma.AlbumArtistFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AlbumArtistFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AlbumArtistPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AlbumArtistFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AlbumArtistPayload>
          }
          findFirst: {
            args: Prisma.AlbumArtistFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AlbumArtistPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AlbumArtistFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AlbumArtistPayload>
          }
          findMany: {
            args: Prisma.AlbumArtistFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AlbumArtistPayload>[]
          }
          create: {
            args: Prisma.AlbumArtistCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AlbumArtistPayload>
          }
          createMany: {
            args: Prisma.AlbumArtistCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AlbumArtistCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AlbumArtistPayload>[]
          }
          delete: {
            args: Prisma.AlbumArtistDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AlbumArtistPayload>
          }
          update: {
            args: Prisma.AlbumArtistUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AlbumArtistPayload>
          }
          deleteMany: {
            args: Prisma.AlbumArtistDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AlbumArtistUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.AlbumArtistUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AlbumArtistPayload>
          }
          aggregate: {
            args: Prisma.AlbumArtistAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAlbumArtist>
          }
          groupBy: {
            args: Prisma.AlbumArtistGroupByArgs<ExtArgs>
            result: $Utils.Optional<AlbumArtistGroupByOutputType>[]
          }
          count: {
            args: Prisma.AlbumArtistCountArgs<ExtArgs>
            result: $Utils.Optional<AlbumArtistCountAggregateOutputType> | number
          }
        }
      }
      TrackAudioResource: {
        payload: Prisma.$TrackAudioResourcePayload<ExtArgs>
        fields: Prisma.TrackAudioResourceFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TrackAudioResourceFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrackAudioResourcePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TrackAudioResourceFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrackAudioResourcePayload>
          }
          findFirst: {
            args: Prisma.TrackAudioResourceFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrackAudioResourcePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TrackAudioResourceFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrackAudioResourcePayload>
          }
          findMany: {
            args: Prisma.TrackAudioResourceFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrackAudioResourcePayload>[]
          }
          create: {
            args: Prisma.TrackAudioResourceCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrackAudioResourcePayload>
          }
          createMany: {
            args: Prisma.TrackAudioResourceCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TrackAudioResourceCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrackAudioResourcePayload>[]
          }
          delete: {
            args: Prisma.TrackAudioResourceDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrackAudioResourcePayload>
          }
          update: {
            args: Prisma.TrackAudioResourceUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrackAudioResourcePayload>
          }
          deleteMany: {
            args: Prisma.TrackAudioResourceDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TrackAudioResourceUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.TrackAudioResourceUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrackAudioResourcePayload>
          }
          aggregate: {
            args: Prisma.TrackAudioResourceAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTrackAudioResource>
          }
          groupBy: {
            args: Prisma.TrackAudioResourceGroupByArgs<ExtArgs>
            result: $Utils.Optional<TrackAudioResourceGroupByOutputType>[]
          }
          count: {
            args: Prisma.TrackAudioResourceCountArgs<ExtArgs>
            result: $Utils.Optional<TrackAudioResourceCountAggregateOutputType> | number
          }
        }
      }
      Genre: {
        payload: Prisma.$GenrePayload<ExtArgs>
        fields: Prisma.GenreFieldRefs
        operations: {
          findUnique: {
            args: Prisma.GenreFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GenrePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.GenreFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GenrePayload>
          }
          findFirst: {
            args: Prisma.GenreFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GenrePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.GenreFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GenrePayload>
          }
          findMany: {
            args: Prisma.GenreFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GenrePayload>[]
          }
          create: {
            args: Prisma.GenreCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GenrePayload>
          }
          createMany: {
            args: Prisma.GenreCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.GenreCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GenrePayload>[]
          }
          delete: {
            args: Prisma.GenreDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GenrePayload>
          }
          update: {
            args: Prisma.GenreUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GenrePayload>
          }
          deleteMany: {
            args: Prisma.GenreDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.GenreUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.GenreUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GenrePayload>
          }
          aggregate: {
            args: Prisma.GenreAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateGenre>
          }
          groupBy: {
            args: Prisma.GenreGroupByArgs<ExtArgs>
            result: $Utils.Optional<GenreGroupByOutputType>[]
          }
          count: {
            args: Prisma.GenreCountArgs<ExtArgs>
            result: $Utils.Optional<GenreCountAggregateOutputType> | number
          }
        }
      }
      TrackGenre: {
        payload: Prisma.$TrackGenrePayload<ExtArgs>
        fields: Prisma.TrackGenreFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TrackGenreFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrackGenrePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TrackGenreFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrackGenrePayload>
          }
          findFirst: {
            args: Prisma.TrackGenreFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrackGenrePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TrackGenreFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrackGenrePayload>
          }
          findMany: {
            args: Prisma.TrackGenreFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrackGenrePayload>[]
          }
          create: {
            args: Prisma.TrackGenreCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrackGenrePayload>
          }
          createMany: {
            args: Prisma.TrackGenreCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TrackGenreCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrackGenrePayload>[]
          }
          delete: {
            args: Prisma.TrackGenreDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrackGenrePayload>
          }
          update: {
            args: Prisma.TrackGenreUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrackGenrePayload>
          }
          deleteMany: {
            args: Prisma.TrackGenreDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TrackGenreUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.TrackGenreUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrackGenrePayload>
          }
          aggregate: {
            args: Prisma.TrackGenreAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTrackGenre>
          }
          groupBy: {
            args: Prisma.TrackGenreGroupByArgs<ExtArgs>
            result: $Utils.Optional<TrackGenreGroupByOutputType>[]
          }
          count: {
            args: Prisma.TrackGenreCountArgs<ExtArgs>
            result: $Utils.Optional<TrackGenreCountAggregateOutputType> | number
          }
        }
      }
      Playlist: {
        payload: Prisma.$PlaylistPayload<ExtArgs>
        fields: Prisma.PlaylistFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PlaylistFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlaylistPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PlaylistFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlaylistPayload>
          }
          findFirst: {
            args: Prisma.PlaylistFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlaylistPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PlaylistFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlaylistPayload>
          }
          findMany: {
            args: Prisma.PlaylistFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlaylistPayload>[]
          }
          create: {
            args: Prisma.PlaylistCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlaylistPayload>
          }
          createMany: {
            args: Prisma.PlaylistCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PlaylistCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlaylistPayload>[]
          }
          delete: {
            args: Prisma.PlaylistDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlaylistPayload>
          }
          update: {
            args: Prisma.PlaylistUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlaylistPayload>
          }
          deleteMany: {
            args: Prisma.PlaylistDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PlaylistUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.PlaylistUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlaylistPayload>
          }
          aggregate: {
            args: Prisma.PlaylistAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePlaylist>
          }
          groupBy: {
            args: Prisma.PlaylistGroupByArgs<ExtArgs>
            result: $Utils.Optional<PlaylistGroupByOutputType>[]
          }
          count: {
            args: Prisma.PlaylistCountArgs<ExtArgs>
            result: $Utils.Optional<PlaylistCountAggregateOutputType> | number
          }
        }
      }
      PlaylistTrack: {
        payload: Prisma.$PlaylistTrackPayload<ExtArgs>
        fields: Prisma.PlaylistTrackFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PlaylistTrackFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlaylistTrackPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PlaylistTrackFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlaylistTrackPayload>
          }
          findFirst: {
            args: Prisma.PlaylistTrackFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlaylistTrackPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PlaylistTrackFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlaylistTrackPayload>
          }
          findMany: {
            args: Prisma.PlaylistTrackFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlaylistTrackPayload>[]
          }
          create: {
            args: Prisma.PlaylistTrackCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlaylistTrackPayload>
          }
          createMany: {
            args: Prisma.PlaylistTrackCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PlaylistTrackCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlaylistTrackPayload>[]
          }
          delete: {
            args: Prisma.PlaylistTrackDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlaylistTrackPayload>
          }
          update: {
            args: Prisma.PlaylistTrackUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlaylistTrackPayload>
          }
          deleteMany: {
            args: Prisma.PlaylistTrackDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PlaylistTrackUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.PlaylistTrackUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlaylistTrackPayload>
          }
          aggregate: {
            args: Prisma.PlaylistTrackAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePlaylistTrack>
          }
          groupBy: {
            args: Prisma.PlaylistTrackGroupByArgs<ExtArgs>
            result: $Utils.Optional<PlaylistTrackGroupByOutputType>[]
          }
          count: {
            args: Prisma.PlaylistTrackCountArgs<ExtArgs>
            result: $Utils.Optional<PlaylistTrackCountAggregateOutputType> | number
          }
        }
      }
      PlaylistFollower: {
        payload: Prisma.$PlaylistFollowerPayload<ExtArgs>
        fields: Prisma.PlaylistFollowerFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PlaylistFollowerFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlaylistFollowerPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PlaylistFollowerFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlaylistFollowerPayload>
          }
          findFirst: {
            args: Prisma.PlaylistFollowerFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlaylistFollowerPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PlaylistFollowerFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlaylistFollowerPayload>
          }
          findMany: {
            args: Prisma.PlaylistFollowerFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlaylistFollowerPayload>[]
          }
          create: {
            args: Prisma.PlaylistFollowerCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlaylistFollowerPayload>
          }
          createMany: {
            args: Prisma.PlaylistFollowerCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PlaylistFollowerCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlaylistFollowerPayload>[]
          }
          delete: {
            args: Prisma.PlaylistFollowerDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlaylistFollowerPayload>
          }
          update: {
            args: Prisma.PlaylistFollowerUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlaylistFollowerPayload>
          }
          deleteMany: {
            args: Prisma.PlaylistFollowerDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PlaylistFollowerUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.PlaylistFollowerUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlaylistFollowerPayload>
          }
          aggregate: {
            args: Prisma.PlaylistFollowerAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePlaylistFollower>
          }
          groupBy: {
            args: Prisma.PlaylistFollowerGroupByArgs<ExtArgs>
            result: $Utils.Optional<PlaylistFollowerGroupByOutputType>[]
          }
          count: {
            args: Prisma.PlaylistFollowerCountArgs<ExtArgs>
            result: $Utils.Optional<PlaylistFollowerCountAggregateOutputType> | number
          }
        }
      }
      LikedTrack: {
        payload: Prisma.$LikedTrackPayload<ExtArgs>
        fields: Prisma.LikedTrackFieldRefs
        operations: {
          findUnique: {
            args: Prisma.LikedTrackFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LikedTrackPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.LikedTrackFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LikedTrackPayload>
          }
          findFirst: {
            args: Prisma.LikedTrackFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LikedTrackPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.LikedTrackFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LikedTrackPayload>
          }
          findMany: {
            args: Prisma.LikedTrackFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LikedTrackPayload>[]
          }
          create: {
            args: Prisma.LikedTrackCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LikedTrackPayload>
          }
          createMany: {
            args: Prisma.LikedTrackCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.LikedTrackCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LikedTrackPayload>[]
          }
          delete: {
            args: Prisma.LikedTrackDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LikedTrackPayload>
          }
          update: {
            args: Prisma.LikedTrackUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LikedTrackPayload>
          }
          deleteMany: {
            args: Prisma.LikedTrackDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.LikedTrackUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.LikedTrackUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LikedTrackPayload>
          }
          aggregate: {
            args: Prisma.LikedTrackAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateLikedTrack>
          }
          groupBy: {
            args: Prisma.LikedTrackGroupByArgs<ExtArgs>
            result: $Utils.Optional<LikedTrackGroupByOutputType>[]
          }
          count: {
            args: Prisma.LikedTrackCountArgs<ExtArgs>
            result: $Utils.Optional<LikedTrackCountAggregateOutputType> | number
          }
        }
      }
      PlaybackHistory: {
        payload: Prisma.$PlaybackHistoryPayload<ExtArgs>
        fields: Prisma.PlaybackHistoryFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PlaybackHistoryFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlaybackHistoryPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PlaybackHistoryFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlaybackHistoryPayload>
          }
          findFirst: {
            args: Prisma.PlaybackHistoryFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlaybackHistoryPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PlaybackHistoryFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlaybackHistoryPayload>
          }
          findMany: {
            args: Prisma.PlaybackHistoryFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlaybackHistoryPayload>[]
          }
          create: {
            args: Prisma.PlaybackHistoryCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlaybackHistoryPayload>
          }
          createMany: {
            args: Prisma.PlaybackHistoryCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PlaybackHistoryCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlaybackHistoryPayload>[]
          }
          delete: {
            args: Prisma.PlaybackHistoryDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlaybackHistoryPayload>
          }
          update: {
            args: Prisma.PlaybackHistoryUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlaybackHistoryPayload>
          }
          deleteMany: {
            args: Prisma.PlaybackHistoryDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PlaybackHistoryUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.PlaybackHistoryUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlaybackHistoryPayload>
          }
          aggregate: {
            args: Prisma.PlaybackHistoryAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePlaybackHistory>
          }
          groupBy: {
            args: Prisma.PlaybackHistoryGroupByArgs<ExtArgs>
            result: $Utils.Optional<PlaybackHistoryGroupByOutputType>[]
          }
          count: {
            args: Prisma.PlaybackHistoryCountArgs<ExtArgs>
            result: $Utils.Optional<PlaybackHistoryCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
  }


  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    ownedPlaylists: number
    followedPlaylists: number
    likedTracks: number
    playbackHistories: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    ownedPlaylists?: boolean | UserCountOutputTypeCountOwnedPlaylistsArgs
    followedPlaylists?: boolean | UserCountOutputTypeCountFollowedPlaylistsArgs
    likedTracks?: boolean | UserCountOutputTypeCountLikedTracksArgs
    playbackHistories?: boolean | UserCountOutputTypeCountPlaybackHistoriesArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountOwnedPlaylistsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PlaylistWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountFollowedPlaylistsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PlaylistFollowerWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountLikedTracksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: LikedTrackWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountPlaybackHistoriesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PlaybackHistoryWhereInput
  }


  /**
   * Count Type ArtistCountOutputType
   */

  export type ArtistCountOutputType = {
    tracks: number
    albums: number
  }

  export type ArtistCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tracks?: boolean | ArtistCountOutputTypeCountTracksArgs
    albums?: boolean | ArtistCountOutputTypeCountAlbumsArgs
  }

  // Custom InputTypes
  /**
   * ArtistCountOutputType without action
   */
  export type ArtistCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ArtistCountOutputType
     */
    select?: ArtistCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ArtistCountOutputType without action
   */
  export type ArtistCountOutputTypeCountTracksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TrackArtistWhereInput
  }

  /**
   * ArtistCountOutputType without action
   */
  export type ArtistCountOutputTypeCountAlbumsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AlbumArtistWhereInput
  }


  /**
   * Count Type AlbumCountOutputType
   */

  export type AlbumCountOutputType = {
    tracks: number
    artists: number
  }

  export type AlbumCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tracks?: boolean | AlbumCountOutputTypeCountTracksArgs
    artists?: boolean | AlbumCountOutputTypeCountArtistsArgs
  }

  // Custom InputTypes
  /**
   * AlbumCountOutputType without action
   */
  export type AlbumCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AlbumCountOutputType
     */
    select?: AlbumCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * AlbumCountOutputType without action
   */
  export type AlbumCountOutputTypeCountTracksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TrackWhereInput
  }

  /**
   * AlbumCountOutputType without action
   */
  export type AlbumCountOutputTypeCountArtistsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AlbumArtistWhereInput
  }


  /**
   * Count Type TrackCountOutputType
   */

  export type TrackCountOutputType = {
    artists: number
    audioResources: number
    playlistTracks: number
    likedUsers: number
    playbacks: number
    genres: number
  }

  export type TrackCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    artists?: boolean | TrackCountOutputTypeCountArtistsArgs
    audioResources?: boolean | TrackCountOutputTypeCountAudioResourcesArgs
    playlistTracks?: boolean | TrackCountOutputTypeCountPlaylistTracksArgs
    likedUsers?: boolean | TrackCountOutputTypeCountLikedUsersArgs
    playbacks?: boolean | TrackCountOutputTypeCountPlaybacksArgs
    genres?: boolean | TrackCountOutputTypeCountGenresArgs
  }

  // Custom InputTypes
  /**
   * TrackCountOutputType without action
   */
  export type TrackCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrackCountOutputType
     */
    select?: TrackCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * TrackCountOutputType without action
   */
  export type TrackCountOutputTypeCountArtistsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TrackArtistWhereInput
  }

  /**
   * TrackCountOutputType without action
   */
  export type TrackCountOutputTypeCountAudioResourcesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TrackAudioResourceWhereInput
  }

  /**
   * TrackCountOutputType without action
   */
  export type TrackCountOutputTypeCountPlaylistTracksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PlaylistTrackWhereInput
  }

  /**
   * TrackCountOutputType without action
   */
  export type TrackCountOutputTypeCountLikedUsersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: LikedTrackWhereInput
  }

  /**
   * TrackCountOutputType without action
   */
  export type TrackCountOutputTypeCountPlaybacksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PlaybackHistoryWhereInput
  }

  /**
   * TrackCountOutputType without action
   */
  export type TrackCountOutputTypeCountGenresArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TrackGenreWhereInput
  }


  /**
   * Count Type GenreCountOutputType
   */

  export type GenreCountOutputType = {
    tracks: number
  }

  export type GenreCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tracks?: boolean | GenreCountOutputTypeCountTracksArgs
  }

  // Custom InputTypes
  /**
   * GenreCountOutputType without action
   */
  export type GenreCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GenreCountOutputType
     */
    select?: GenreCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * GenreCountOutputType without action
   */
  export type GenreCountOutputTypeCountTracksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TrackGenreWhereInput
  }


  /**
   * Count Type PlaylistCountOutputType
   */

  export type PlaylistCountOutputType = {
    tracks: number
    followers: number
  }

  export type PlaylistCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tracks?: boolean | PlaylistCountOutputTypeCountTracksArgs
    followers?: boolean | PlaylistCountOutputTypeCountFollowersArgs
  }

  // Custom InputTypes
  /**
   * PlaylistCountOutputType without action
   */
  export type PlaylistCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlaylistCountOutputType
     */
    select?: PlaylistCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * PlaylistCountOutputType without action
   */
  export type PlaylistCountOutputTypeCountTracksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PlaylistTrackWhereInput
  }

  /**
   * PlaylistCountOutputType without action
   */
  export type PlaylistCountOutputTypeCountFollowersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PlaylistFollowerWhereInput
  }


  /**
   * Models
   */

  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserMinAggregateOutputType = {
    id: string | null
    email: string | null
    passwordHash: string | null
    displayName: string | null
    avatarUrl: string | null
    country: string | null
    product: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    email: string | null
    passwordHash: string | null
    displayName: string | null
    avatarUrl: string | null
    country: string | null
    product: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    email: number
    passwordHash: number
    displayName: number
    avatarUrl: number
    country: number
    product: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type UserMinAggregateInputType = {
    id?: true
    email?: true
    passwordHash?: true
    displayName?: true
    avatarUrl?: true
    country?: true
    product?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    email?: true
    passwordHash?: true
    displayName?: true
    avatarUrl?: true
    country?: true
    product?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    email?: true
    passwordHash?: true
    displayName?: true
    avatarUrl?: true
    country?: true
    product?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: string
    email: string
    passwordHash: string
    displayName: string
    avatarUrl: string | null
    country: string
    product: string
    createdAt: Date
    updatedAt: Date
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    passwordHash?: boolean
    displayName?: boolean
    avatarUrl?: boolean
    country?: boolean
    product?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    ownedPlaylists?: boolean | User$ownedPlaylistsArgs<ExtArgs>
    followedPlaylists?: boolean | User$followedPlaylistsArgs<ExtArgs>
    likedTracks?: boolean | User$likedTracksArgs<ExtArgs>
    playbackHistories?: boolean | User$playbackHistoriesArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    passwordHash?: boolean
    displayName?: boolean
    avatarUrl?: boolean
    country?: boolean
    product?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    email?: boolean
    passwordHash?: boolean
    displayName?: boolean
    avatarUrl?: boolean
    country?: boolean
    product?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    ownedPlaylists?: boolean | User$ownedPlaylistsArgs<ExtArgs>
    followedPlaylists?: boolean | User$followedPlaylistsArgs<ExtArgs>
    likedTracks?: boolean | User$likedTracksArgs<ExtArgs>
    playbackHistories?: boolean | User$playbackHistoriesArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      ownedPlaylists: Prisma.$PlaylistPayload<ExtArgs>[]
      followedPlaylists: Prisma.$PlaylistFollowerPayload<ExtArgs>[]
      likedTracks: Prisma.$LikedTrackPayload<ExtArgs>[]
      playbackHistories: Prisma.$PlaybackHistoryPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      email: string
      passwordHash: string
      displayName: string
      avatarUrl: string | null
      country: string
      product: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    ownedPlaylists<T extends User$ownedPlaylistsArgs<ExtArgs> = {}>(args?: Subset<T, User$ownedPlaylistsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PlaylistPayload<ExtArgs>, T, "findMany"> | Null>
    followedPlaylists<T extends User$followedPlaylistsArgs<ExtArgs> = {}>(args?: Subset<T, User$followedPlaylistsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PlaylistFollowerPayload<ExtArgs>, T, "findMany"> | Null>
    likedTracks<T extends User$likedTracksArgs<ExtArgs> = {}>(args?: Subset<T, User$likedTracksArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LikedTrackPayload<ExtArgs>, T, "findMany"> | Null>
    playbackHistories<T extends User$playbackHistoriesArgs<ExtArgs> = {}>(args?: Subset<T, User$playbackHistoriesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PlaybackHistoryPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */ 
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'String'>
    readonly email: FieldRef<"User", 'String'>
    readonly passwordHash: FieldRef<"User", 'String'>
    readonly displayName: FieldRef<"User", 'String'>
    readonly avatarUrl: FieldRef<"User", 'String'>
    readonly country: FieldRef<"User", 'String'>
    readonly product: FieldRef<"User", 'String'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
    readonly updatedAt: FieldRef<"User", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
  }

  /**
   * User.ownedPlaylists
   */
  export type User$ownedPlaylistsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Playlist
     */
    select?: PlaylistSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlaylistInclude<ExtArgs> | null
    where?: PlaylistWhereInput
    orderBy?: PlaylistOrderByWithRelationInput | PlaylistOrderByWithRelationInput[]
    cursor?: PlaylistWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PlaylistScalarFieldEnum | PlaylistScalarFieldEnum[]
  }

  /**
   * User.followedPlaylists
   */
  export type User$followedPlaylistsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlaylistFollower
     */
    select?: PlaylistFollowerSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlaylistFollowerInclude<ExtArgs> | null
    where?: PlaylistFollowerWhereInput
    orderBy?: PlaylistFollowerOrderByWithRelationInput | PlaylistFollowerOrderByWithRelationInput[]
    cursor?: PlaylistFollowerWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PlaylistFollowerScalarFieldEnum | PlaylistFollowerScalarFieldEnum[]
  }

  /**
   * User.likedTracks
   */
  export type User$likedTracksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LikedTrack
     */
    select?: LikedTrackSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LikedTrackInclude<ExtArgs> | null
    where?: LikedTrackWhereInput
    orderBy?: LikedTrackOrderByWithRelationInput | LikedTrackOrderByWithRelationInput[]
    cursor?: LikedTrackWhereUniqueInput
    take?: number
    skip?: number
    distinct?: LikedTrackScalarFieldEnum | LikedTrackScalarFieldEnum[]
  }

  /**
   * User.playbackHistories
   */
  export type User$playbackHistoriesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlaybackHistory
     */
    select?: PlaybackHistorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlaybackHistoryInclude<ExtArgs> | null
    where?: PlaybackHistoryWhereInput
    orderBy?: PlaybackHistoryOrderByWithRelationInput | PlaybackHistoryOrderByWithRelationInput[]
    cursor?: PlaybackHistoryWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PlaybackHistoryScalarFieldEnum | PlaybackHistoryScalarFieldEnum[]
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model Artist
   */

  export type AggregateArtist = {
    _count: ArtistCountAggregateOutputType | null
    _min: ArtistMinAggregateOutputType | null
    _max: ArtistMaxAggregateOutputType | null
  }

  export type ArtistMinAggregateOutputType = {
    id: string | null
    name: string | null
    coverImg: string | null
    bio: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ArtistMaxAggregateOutputType = {
    id: string | null
    name: string | null
    coverImg: string | null
    bio: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ArtistCountAggregateOutputType = {
    id: number
    name: number
    coverImg: number
    bio: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type ArtistMinAggregateInputType = {
    id?: true
    name?: true
    coverImg?: true
    bio?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ArtistMaxAggregateInputType = {
    id?: true
    name?: true
    coverImg?: true
    bio?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ArtistCountAggregateInputType = {
    id?: true
    name?: true
    coverImg?: true
    bio?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type ArtistAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Artist to aggregate.
     */
    where?: ArtistWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Artists to fetch.
     */
    orderBy?: ArtistOrderByWithRelationInput | ArtistOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ArtistWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Artists from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Artists.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Artists
    **/
    _count?: true | ArtistCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ArtistMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ArtistMaxAggregateInputType
  }

  export type GetArtistAggregateType<T extends ArtistAggregateArgs> = {
        [P in keyof T & keyof AggregateArtist]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateArtist[P]>
      : GetScalarType<T[P], AggregateArtist[P]>
  }




  export type ArtistGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ArtistWhereInput
    orderBy?: ArtistOrderByWithAggregationInput | ArtistOrderByWithAggregationInput[]
    by: ArtistScalarFieldEnum[] | ArtistScalarFieldEnum
    having?: ArtistScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ArtistCountAggregateInputType | true
    _min?: ArtistMinAggregateInputType
    _max?: ArtistMaxAggregateInputType
  }

  export type ArtistGroupByOutputType = {
    id: string
    name: string
    coverImg: string | null
    bio: string | null
    createdAt: Date
    updatedAt: Date
    _count: ArtistCountAggregateOutputType | null
    _min: ArtistMinAggregateOutputType | null
    _max: ArtistMaxAggregateOutputType | null
  }

  type GetArtistGroupByPayload<T extends ArtistGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ArtistGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ArtistGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ArtistGroupByOutputType[P]>
            : GetScalarType<T[P], ArtistGroupByOutputType[P]>
        }
      >
    >


  export type ArtistSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    coverImg?: boolean
    bio?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tracks?: boolean | Artist$tracksArgs<ExtArgs>
    albums?: boolean | Artist$albumsArgs<ExtArgs>
    _count?: boolean | ArtistCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["artist"]>

  export type ArtistSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    coverImg?: boolean
    bio?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["artist"]>

  export type ArtistSelectScalar = {
    id?: boolean
    name?: boolean
    coverImg?: boolean
    bio?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type ArtistInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tracks?: boolean | Artist$tracksArgs<ExtArgs>
    albums?: boolean | Artist$albumsArgs<ExtArgs>
    _count?: boolean | ArtistCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ArtistIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $ArtistPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Artist"
    objects: {
      tracks: Prisma.$TrackArtistPayload<ExtArgs>[]
      albums: Prisma.$AlbumArtistPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      coverImg: string | null
      bio: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["artist"]>
    composites: {}
  }

  type ArtistGetPayload<S extends boolean | null | undefined | ArtistDefaultArgs> = $Result.GetResult<Prisma.$ArtistPayload, S>

  type ArtistCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ArtistFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ArtistCountAggregateInputType | true
    }

  export interface ArtistDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Artist'], meta: { name: 'Artist' } }
    /**
     * Find zero or one Artist that matches the filter.
     * @param {ArtistFindUniqueArgs} args - Arguments to find a Artist
     * @example
     * // Get one Artist
     * const artist = await prisma.artist.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ArtistFindUniqueArgs>(args: SelectSubset<T, ArtistFindUniqueArgs<ExtArgs>>): Prisma__ArtistClient<$Result.GetResult<Prisma.$ArtistPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Artist that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ArtistFindUniqueOrThrowArgs} args - Arguments to find a Artist
     * @example
     * // Get one Artist
     * const artist = await prisma.artist.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ArtistFindUniqueOrThrowArgs>(args: SelectSubset<T, ArtistFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ArtistClient<$Result.GetResult<Prisma.$ArtistPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Artist that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ArtistFindFirstArgs} args - Arguments to find a Artist
     * @example
     * // Get one Artist
     * const artist = await prisma.artist.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ArtistFindFirstArgs>(args?: SelectSubset<T, ArtistFindFirstArgs<ExtArgs>>): Prisma__ArtistClient<$Result.GetResult<Prisma.$ArtistPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Artist that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ArtistFindFirstOrThrowArgs} args - Arguments to find a Artist
     * @example
     * // Get one Artist
     * const artist = await prisma.artist.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ArtistFindFirstOrThrowArgs>(args?: SelectSubset<T, ArtistFindFirstOrThrowArgs<ExtArgs>>): Prisma__ArtistClient<$Result.GetResult<Prisma.$ArtistPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Artists that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ArtistFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Artists
     * const artists = await prisma.artist.findMany()
     * 
     * // Get first 10 Artists
     * const artists = await prisma.artist.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const artistWithIdOnly = await prisma.artist.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ArtistFindManyArgs>(args?: SelectSubset<T, ArtistFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ArtistPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Artist.
     * @param {ArtistCreateArgs} args - Arguments to create a Artist.
     * @example
     * // Create one Artist
     * const Artist = await prisma.artist.create({
     *   data: {
     *     // ... data to create a Artist
     *   }
     * })
     * 
     */
    create<T extends ArtistCreateArgs>(args: SelectSubset<T, ArtistCreateArgs<ExtArgs>>): Prisma__ArtistClient<$Result.GetResult<Prisma.$ArtistPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Artists.
     * @param {ArtistCreateManyArgs} args - Arguments to create many Artists.
     * @example
     * // Create many Artists
     * const artist = await prisma.artist.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ArtistCreateManyArgs>(args?: SelectSubset<T, ArtistCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Artists and returns the data saved in the database.
     * @param {ArtistCreateManyAndReturnArgs} args - Arguments to create many Artists.
     * @example
     * // Create many Artists
     * const artist = await prisma.artist.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Artists and only return the `id`
     * const artistWithIdOnly = await prisma.artist.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ArtistCreateManyAndReturnArgs>(args?: SelectSubset<T, ArtistCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ArtistPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Artist.
     * @param {ArtistDeleteArgs} args - Arguments to delete one Artist.
     * @example
     * // Delete one Artist
     * const Artist = await prisma.artist.delete({
     *   where: {
     *     // ... filter to delete one Artist
     *   }
     * })
     * 
     */
    delete<T extends ArtistDeleteArgs>(args: SelectSubset<T, ArtistDeleteArgs<ExtArgs>>): Prisma__ArtistClient<$Result.GetResult<Prisma.$ArtistPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Artist.
     * @param {ArtistUpdateArgs} args - Arguments to update one Artist.
     * @example
     * // Update one Artist
     * const artist = await prisma.artist.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ArtistUpdateArgs>(args: SelectSubset<T, ArtistUpdateArgs<ExtArgs>>): Prisma__ArtistClient<$Result.GetResult<Prisma.$ArtistPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Artists.
     * @param {ArtistDeleteManyArgs} args - Arguments to filter Artists to delete.
     * @example
     * // Delete a few Artists
     * const { count } = await prisma.artist.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ArtistDeleteManyArgs>(args?: SelectSubset<T, ArtistDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Artists.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ArtistUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Artists
     * const artist = await prisma.artist.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ArtistUpdateManyArgs>(args: SelectSubset<T, ArtistUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Artist.
     * @param {ArtistUpsertArgs} args - Arguments to update or create a Artist.
     * @example
     * // Update or create a Artist
     * const artist = await prisma.artist.upsert({
     *   create: {
     *     // ... data to create a Artist
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Artist we want to update
     *   }
     * })
     */
    upsert<T extends ArtistUpsertArgs>(args: SelectSubset<T, ArtistUpsertArgs<ExtArgs>>): Prisma__ArtistClient<$Result.GetResult<Prisma.$ArtistPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Artists.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ArtistCountArgs} args - Arguments to filter Artists to count.
     * @example
     * // Count the number of Artists
     * const count = await prisma.artist.count({
     *   where: {
     *     // ... the filter for the Artists we want to count
     *   }
     * })
    **/
    count<T extends ArtistCountArgs>(
      args?: Subset<T, ArtistCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ArtistCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Artist.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ArtistAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ArtistAggregateArgs>(args: Subset<T, ArtistAggregateArgs>): Prisma.PrismaPromise<GetArtistAggregateType<T>>

    /**
     * Group by Artist.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ArtistGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ArtistGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ArtistGroupByArgs['orderBy'] }
        : { orderBy?: ArtistGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ArtistGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetArtistGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Artist model
   */
  readonly fields: ArtistFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Artist.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ArtistClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    tracks<T extends Artist$tracksArgs<ExtArgs> = {}>(args?: Subset<T, Artist$tracksArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TrackArtistPayload<ExtArgs>, T, "findMany"> | Null>
    albums<T extends Artist$albumsArgs<ExtArgs> = {}>(args?: Subset<T, Artist$albumsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AlbumArtistPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Artist model
   */ 
  interface ArtistFieldRefs {
    readonly id: FieldRef<"Artist", 'String'>
    readonly name: FieldRef<"Artist", 'String'>
    readonly coverImg: FieldRef<"Artist", 'String'>
    readonly bio: FieldRef<"Artist", 'String'>
    readonly createdAt: FieldRef<"Artist", 'DateTime'>
    readonly updatedAt: FieldRef<"Artist", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Artist findUnique
   */
  export type ArtistFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Artist
     */
    select?: ArtistSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ArtistInclude<ExtArgs> | null
    /**
     * Filter, which Artist to fetch.
     */
    where: ArtistWhereUniqueInput
  }

  /**
   * Artist findUniqueOrThrow
   */
  export type ArtistFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Artist
     */
    select?: ArtistSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ArtistInclude<ExtArgs> | null
    /**
     * Filter, which Artist to fetch.
     */
    where: ArtistWhereUniqueInput
  }

  /**
   * Artist findFirst
   */
  export type ArtistFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Artist
     */
    select?: ArtistSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ArtistInclude<ExtArgs> | null
    /**
     * Filter, which Artist to fetch.
     */
    where?: ArtistWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Artists to fetch.
     */
    orderBy?: ArtistOrderByWithRelationInput | ArtistOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Artists.
     */
    cursor?: ArtistWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Artists from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Artists.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Artists.
     */
    distinct?: ArtistScalarFieldEnum | ArtistScalarFieldEnum[]
  }

  /**
   * Artist findFirstOrThrow
   */
  export type ArtistFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Artist
     */
    select?: ArtistSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ArtistInclude<ExtArgs> | null
    /**
     * Filter, which Artist to fetch.
     */
    where?: ArtistWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Artists to fetch.
     */
    orderBy?: ArtistOrderByWithRelationInput | ArtistOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Artists.
     */
    cursor?: ArtistWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Artists from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Artists.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Artists.
     */
    distinct?: ArtistScalarFieldEnum | ArtistScalarFieldEnum[]
  }

  /**
   * Artist findMany
   */
  export type ArtistFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Artist
     */
    select?: ArtistSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ArtistInclude<ExtArgs> | null
    /**
     * Filter, which Artists to fetch.
     */
    where?: ArtistWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Artists to fetch.
     */
    orderBy?: ArtistOrderByWithRelationInput | ArtistOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Artists.
     */
    cursor?: ArtistWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Artists from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Artists.
     */
    skip?: number
    distinct?: ArtistScalarFieldEnum | ArtistScalarFieldEnum[]
  }

  /**
   * Artist create
   */
  export type ArtistCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Artist
     */
    select?: ArtistSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ArtistInclude<ExtArgs> | null
    /**
     * The data needed to create a Artist.
     */
    data: XOR<ArtistCreateInput, ArtistUncheckedCreateInput>
  }

  /**
   * Artist createMany
   */
  export type ArtistCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Artists.
     */
    data: ArtistCreateManyInput | ArtistCreateManyInput[]
  }

  /**
   * Artist createManyAndReturn
   */
  export type ArtistCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Artist
     */
    select?: ArtistSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Artists.
     */
    data: ArtistCreateManyInput | ArtistCreateManyInput[]
  }

  /**
   * Artist update
   */
  export type ArtistUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Artist
     */
    select?: ArtistSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ArtistInclude<ExtArgs> | null
    /**
     * The data needed to update a Artist.
     */
    data: XOR<ArtistUpdateInput, ArtistUncheckedUpdateInput>
    /**
     * Choose, which Artist to update.
     */
    where: ArtistWhereUniqueInput
  }

  /**
   * Artist updateMany
   */
  export type ArtistUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Artists.
     */
    data: XOR<ArtistUpdateManyMutationInput, ArtistUncheckedUpdateManyInput>
    /**
     * Filter which Artists to update
     */
    where?: ArtistWhereInput
  }

  /**
   * Artist upsert
   */
  export type ArtistUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Artist
     */
    select?: ArtistSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ArtistInclude<ExtArgs> | null
    /**
     * The filter to search for the Artist to update in case it exists.
     */
    where: ArtistWhereUniqueInput
    /**
     * In case the Artist found by the `where` argument doesn't exist, create a new Artist with this data.
     */
    create: XOR<ArtistCreateInput, ArtistUncheckedCreateInput>
    /**
     * In case the Artist was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ArtistUpdateInput, ArtistUncheckedUpdateInput>
  }

  /**
   * Artist delete
   */
  export type ArtistDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Artist
     */
    select?: ArtistSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ArtistInclude<ExtArgs> | null
    /**
     * Filter which Artist to delete.
     */
    where: ArtistWhereUniqueInput
  }

  /**
   * Artist deleteMany
   */
  export type ArtistDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Artists to delete
     */
    where?: ArtistWhereInput
  }

  /**
   * Artist.tracks
   */
  export type Artist$tracksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrackArtist
     */
    select?: TrackArtistSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrackArtistInclude<ExtArgs> | null
    where?: TrackArtistWhereInput
    orderBy?: TrackArtistOrderByWithRelationInput | TrackArtistOrderByWithRelationInput[]
    cursor?: TrackArtistWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TrackArtistScalarFieldEnum | TrackArtistScalarFieldEnum[]
  }

  /**
   * Artist.albums
   */
  export type Artist$albumsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AlbumArtist
     */
    select?: AlbumArtistSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AlbumArtistInclude<ExtArgs> | null
    where?: AlbumArtistWhereInput
    orderBy?: AlbumArtistOrderByWithRelationInput | AlbumArtistOrderByWithRelationInput[]
    cursor?: AlbumArtistWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AlbumArtistScalarFieldEnum | AlbumArtistScalarFieldEnum[]
  }

  /**
   * Artist without action
   */
  export type ArtistDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Artist
     */
    select?: ArtistSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ArtistInclude<ExtArgs> | null
  }


  /**
   * Model Album
   */

  export type AggregateAlbum = {
    _count: AlbumCountAggregateOutputType | null
    _min: AlbumMinAggregateOutputType | null
    _max: AlbumMaxAggregateOutputType | null
  }

  export type AlbumMinAggregateOutputType = {
    id: string | null
    title: string | null
    coverUrl: string | null
    releaseDate: Date | null
    albumType: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AlbumMaxAggregateOutputType = {
    id: string | null
    title: string | null
    coverUrl: string | null
    releaseDate: Date | null
    albumType: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AlbumCountAggregateOutputType = {
    id: number
    title: number
    coverUrl: number
    releaseDate: number
    albumType: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type AlbumMinAggregateInputType = {
    id?: true
    title?: true
    coverUrl?: true
    releaseDate?: true
    albumType?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AlbumMaxAggregateInputType = {
    id?: true
    title?: true
    coverUrl?: true
    releaseDate?: true
    albumType?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AlbumCountAggregateInputType = {
    id?: true
    title?: true
    coverUrl?: true
    releaseDate?: true
    albumType?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type AlbumAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Album to aggregate.
     */
    where?: AlbumWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Albums to fetch.
     */
    orderBy?: AlbumOrderByWithRelationInput | AlbumOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AlbumWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Albums from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Albums.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Albums
    **/
    _count?: true | AlbumCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AlbumMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AlbumMaxAggregateInputType
  }

  export type GetAlbumAggregateType<T extends AlbumAggregateArgs> = {
        [P in keyof T & keyof AggregateAlbum]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAlbum[P]>
      : GetScalarType<T[P], AggregateAlbum[P]>
  }




  export type AlbumGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AlbumWhereInput
    orderBy?: AlbumOrderByWithAggregationInput | AlbumOrderByWithAggregationInput[]
    by: AlbumScalarFieldEnum[] | AlbumScalarFieldEnum
    having?: AlbumScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AlbumCountAggregateInputType | true
    _min?: AlbumMinAggregateInputType
    _max?: AlbumMaxAggregateInputType
  }

  export type AlbumGroupByOutputType = {
    id: string
    title: string
    coverUrl: string | null
    releaseDate: Date
    albumType: string
    createdAt: Date
    updatedAt: Date
    _count: AlbumCountAggregateOutputType | null
    _min: AlbumMinAggregateOutputType | null
    _max: AlbumMaxAggregateOutputType | null
  }

  type GetAlbumGroupByPayload<T extends AlbumGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AlbumGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AlbumGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AlbumGroupByOutputType[P]>
            : GetScalarType<T[P], AlbumGroupByOutputType[P]>
        }
      >
    >


  export type AlbumSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    coverUrl?: boolean
    releaseDate?: boolean
    albumType?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tracks?: boolean | Album$tracksArgs<ExtArgs>
    artists?: boolean | Album$artistsArgs<ExtArgs>
    _count?: boolean | AlbumCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["album"]>

  export type AlbumSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    coverUrl?: boolean
    releaseDate?: boolean
    albumType?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["album"]>

  export type AlbumSelectScalar = {
    id?: boolean
    title?: boolean
    coverUrl?: boolean
    releaseDate?: boolean
    albumType?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type AlbumInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tracks?: boolean | Album$tracksArgs<ExtArgs>
    artists?: boolean | Album$artistsArgs<ExtArgs>
    _count?: boolean | AlbumCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type AlbumIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $AlbumPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Album"
    objects: {
      tracks: Prisma.$TrackPayload<ExtArgs>[]
      artists: Prisma.$AlbumArtistPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      title: string
      coverUrl: string | null
      releaseDate: Date
      albumType: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["album"]>
    composites: {}
  }

  type AlbumGetPayload<S extends boolean | null | undefined | AlbumDefaultArgs> = $Result.GetResult<Prisma.$AlbumPayload, S>

  type AlbumCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<AlbumFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: AlbumCountAggregateInputType | true
    }

  export interface AlbumDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Album'], meta: { name: 'Album' } }
    /**
     * Find zero or one Album that matches the filter.
     * @param {AlbumFindUniqueArgs} args - Arguments to find a Album
     * @example
     * // Get one Album
     * const album = await prisma.album.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AlbumFindUniqueArgs>(args: SelectSubset<T, AlbumFindUniqueArgs<ExtArgs>>): Prisma__AlbumClient<$Result.GetResult<Prisma.$AlbumPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Album that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {AlbumFindUniqueOrThrowArgs} args - Arguments to find a Album
     * @example
     * // Get one Album
     * const album = await prisma.album.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AlbumFindUniqueOrThrowArgs>(args: SelectSubset<T, AlbumFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AlbumClient<$Result.GetResult<Prisma.$AlbumPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Album that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AlbumFindFirstArgs} args - Arguments to find a Album
     * @example
     * // Get one Album
     * const album = await prisma.album.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AlbumFindFirstArgs>(args?: SelectSubset<T, AlbumFindFirstArgs<ExtArgs>>): Prisma__AlbumClient<$Result.GetResult<Prisma.$AlbumPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Album that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AlbumFindFirstOrThrowArgs} args - Arguments to find a Album
     * @example
     * // Get one Album
     * const album = await prisma.album.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AlbumFindFirstOrThrowArgs>(args?: SelectSubset<T, AlbumFindFirstOrThrowArgs<ExtArgs>>): Prisma__AlbumClient<$Result.GetResult<Prisma.$AlbumPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Albums that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AlbumFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Albums
     * const albums = await prisma.album.findMany()
     * 
     * // Get first 10 Albums
     * const albums = await prisma.album.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const albumWithIdOnly = await prisma.album.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AlbumFindManyArgs>(args?: SelectSubset<T, AlbumFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AlbumPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Album.
     * @param {AlbumCreateArgs} args - Arguments to create a Album.
     * @example
     * // Create one Album
     * const Album = await prisma.album.create({
     *   data: {
     *     // ... data to create a Album
     *   }
     * })
     * 
     */
    create<T extends AlbumCreateArgs>(args: SelectSubset<T, AlbumCreateArgs<ExtArgs>>): Prisma__AlbumClient<$Result.GetResult<Prisma.$AlbumPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Albums.
     * @param {AlbumCreateManyArgs} args - Arguments to create many Albums.
     * @example
     * // Create many Albums
     * const album = await prisma.album.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AlbumCreateManyArgs>(args?: SelectSubset<T, AlbumCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Albums and returns the data saved in the database.
     * @param {AlbumCreateManyAndReturnArgs} args - Arguments to create many Albums.
     * @example
     * // Create many Albums
     * const album = await prisma.album.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Albums and only return the `id`
     * const albumWithIdOnly = await prisma.album.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AlbumCreateManyAndReturnArgs>(args?: SelectSubset<T, AlbumCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AlbumPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Album.
     * @param {AlbumDeleteArgs} args - Arguments to delete one Album.
     * @example
     * // Delete one Album
     * const Album = await prisma.album.delete({
     *   where: {
     *     // ... filter to delete one Album
     *   }
     * })
     * 
     */
    delete<T extends AlbumDeleteArgs>(args: SelectSubset<T, AlbumDeleteArgs<ExtArgs>>): Prisma__AlbumClient<$Result.GetResult<Prisma.$AlbumPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Album.
     * @param {AlbumUpdateArgs} args - Arguments to update one Album.
     * @example
     * // Update one Album
     * const album = await prisma.album.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AlbumUpdateArgs>(args: SelectSubset<T, AlbumUpdateArgs<ExtArgs>>): Prisma__AlbumClient<$Result.GetResult<Prisma.$AlbumPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Albums.
     * @param {AlbumDeleteManyArgs} args - Arguments to filter Albums to delete.
     * @example
     * // Delete a few Albums
     * const { count } = await prisma.album.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AlbumDeleteManyArgs>(args?: SelectSubset<T, AlbumDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Albums.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AlbumUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Albums
     * const album = await prisma.album.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AlbumUpdateManyArgs>(args: SelectSubset<T, AlbumUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Album.
     * @param {AlbumUpsertArgs} args - Arguments to update or create a Album.
     * @example
     * // Update or create a Album
     * const album = await prisma.album.upsert({
     *   create: {
     *     // ... data to create a Album
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Album we want to update
     *   }
     * })
     */
    upsert<T extends AlbumUpsertArgs>(args: SelectSubset<T, AlbumUpsertArgs<ExtArgs>>): Prisma__AlbumClient<$Result.GetResult<Prisma.$AlbumPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Albums.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AlbumCountArgs} args - Arguments to filter Albums to count.
     * @example
     * // Count the number of Albums
     * const count = await prisma.album.count({
     *   where: {
     *     // ... the filter for the Albums we want to count
     *   }
     * })
    **/
    count<T extends AlbumCountArgs>(
      args?: Subset<T, AlbumCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AlbumCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Album.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AlbumAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AlbumAggregateArgs>(args: Subset<T, AlbumAggregateArgs>): Prisma.PrismaPromise<GetAlbumAggregateType<T>>

    /**
     * Group by Album.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AlbumGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AlbumGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AlbumGroupByArgs['orderBy'] }
        : { orderBy?: AlbumGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AlbumGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAlbumGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Album model
   */
  readonly fields: AlbumFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Album.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AlbumClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    tracks<T extends Album$tracksArgs<ExtArgs> = {}>(args?: Subset<T, Album$tracksArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TrackPayload<ExtArgs>, T, "findMany"> | Null>
    artists<T extends Album$artistsArgs<ExtArgs> = {}>(args?: Subset<T, Album$artistsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AlbumArtistPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Album model
   */ 
  interface AlbumFieldRefs {
    readonly id: FieldRef<"Album", 'String'>
    readonly title: FieldRef<"Album", 'String'>
    readonly coverUrl: FieldRef<"Album", 'String'>
    readonly releaseDate: FieldRef<"Album", 'DateTime'>
    readonly albumType: FieldRef<"Album", 'String'>
    readonly createdAt: FieldRef<"Album", 'DateTime'>
    readonly updatedAt: FieldRef<"Album", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Album findUnique
   */
  export type AlbumFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Album
     */
    select?: AlbumSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AlbumInclude<ExtArgs> | null
    /**
     * Filter, which Album to fetch.
     */
    where: AlbumWhereUniqueInput
  }

  /**
   * Album findUniqueOrThrow
   */
  export type AlbumFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Album
     */
    select?: AlbumSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AlbumInclude<ExtArgs> | null
    /**
     * Filter, which Album to fetch.
     */
    where: AlbumWhereUniqueInput
  }

  /**
   * Album findFirst
   */
  export type AlbumFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Album
     */
    select?: AlbumSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AlbumInclude<ExtArgs> | null
    /**
     * Filter, which Album to fetch.
     */
    where?: AlbumWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Albums to fetch.
     */
    orderBy?: AlbumOrderByWithRelationInput | AlbumOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Albums.
     */
    cursor?: AlbumWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Albums from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Albums.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Albums.
     */
    distinct?: AlbumScalarFieldEnum | AlbumScalarFieldEnum[]
  }

  /**
   * Album findFirstOrThrow
   */
  export type AlbumFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Album
     */
    select?: AlbumSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AlbumInclude<ExtArgs> | null
    /**
     * Filter, which Album to fetch.
     */
    where?: AlbumWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Albums to fetch.
     */
    orderBy?: AlbumOrderByWithRelationInput | AlbumOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Albums.
     */
    cursor?: AlbumWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Albums from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Albums.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Albums.
     */
    distinct?: AlbumScalarFieldEnum | AlbumScalarFieldEnum[]
  }

  /**
   * Album findMany
   */
  export type AlbumFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Album
     */
    select?: AlbumSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AlbumInclude<ExtArgs> | null
    /**
     * Filter, which Albums to fetch.
     */
    where?: AlbumWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Albums to fetch.
     */
    orderBy?: AlbumOrderByWithRelationInput | AlbumOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Albums.
     */
    cursor?: AlbumWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Albums from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Albums.
     */
    skip?: number
    distinct?: AlbumScalarFieldEnum | AlbumScalarFieldEnum[]
  }

  /**
   * Album create
   */
  export type AlbumCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Album
     */
    select?: AlbumSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AlbumInclude<ExtArgs> | null
    /**
     * The data needed to create a Album.
     */
    data: XOR<AlbumCreateInput, AlbumUncheckedCreateInput>
  }

  /**
   * Album createMany
   */
  export type AlbumCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Albums.
     */
    data: AlbumCreateManyInput | AlbumCreateManyInput[]
  }

  /**
   * Album createManyAndReturn
   */
  export type AlbumCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Album
     */
    select?: AlbumSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Albums.
     */
    data: AlbumCreateManyInput | AlbumCreateManyInput[]
  }

  /**
   * Album update
   */
  export type AlbumUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Album
     */
    select?: AlbumSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AlbumInclude<ExtArgs> | null
    /**
     * The data needed to update a Album.
     */
    data: XOR<AlbumUpdateInput, AlbumUncheckedUpdateInput>
    /**
     * Choose, which Album to update.
     */
    where: AlbumWhereUniqueInput
  }

  /**
   * Album updateMany
   */
  export type AlbumUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Albums.
     */
    data: XOR<AlbumUpdateManyMutationInput, AlbumUncheckedUpdateManyInput>
    /**
     * Filter which Albums to update
     */
    where?: AlbumWhereInput
  }

  /**
   * Album upsert
   */
  export type AlbumUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Album
     */
    select?: AlbumSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AlbumInclude<ExtArgs> | null
    /**
     * The filter to search for the Album to update in case it exists.
     */
    where: AlbumWhereUniqueInput
    /**
     * In case the Album found by the `where` argument doesn't exist, create a new Album with this data.
     */
    create: XOR<AlbumCreateInput, AlbumUncheckedCreateInput>
    /**
     * In case the Album was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AlbumUpdateInput, AlbumUncheckedUpdateInput>
  }

  /**
   * Album delete
   */
  export type AlbumDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Album
     */
    select?: AlbumSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AlbumInclude<ExtArgs> | null
    /**
     * Filter which Album to delete.
     */
    where: AlbumWhereUniqueInput
  }

  /**
   * Album deleteMany
   */
  export type AlbumDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Albums to delete
     */
    where?: AlbumWhereInput
  }

  /**
   * Album.tracks
   */
  export type Album$tracksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Track
     */
    select?: TrackSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrackInclude<ExtArgs> | null
    where?: TrackWhereInput
    orderBy?: TrackOrderByWithRelationInput | TrackOrderByWithRelationInput[]
    cursor?: TrackWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TrackScalarFieldEnum | TrackScalarFieldEnum[]
  }

  /**
   * Album.artists
   */
  export type Album$artistsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AlbumArtist
     */
    select?: AlbumArtistSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AlbumArtistInclude<ExtArgs> | null
    where?: AlbumArtistWhereInput
    orderBy?: AlbumArtistOrderByWithRelationInput | AlbumArtistOrderByWithRelationInput[]
    cursor?: AlbumArtistWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AlbumArtistScalarFieldEnum | AlbumArtistScalarFieldEnum[]
  }

  /**
   * Album without action
   */
  export type AlbumDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Album
     */
    select?: AlbumSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AlbumInclude<ExtArgs> | null
  }


  /**
   * Model Track
   */

  export type AggregateTrack = {
    _count: TrackCountAggregateOutputType | null
    _avg: TrackAvgAggregateOutputType | null
    _sum: TrackSumAggregateOutputType | null
    _min: TrackMinAggregateOutputType | null
    _max: TrackMaxAggregateOutputType | null
  }

  export type TrackAvgAggregateOutputType = {
    duration: number | null
    trackNumber: number | null
    discNumber: number | null
  }

  export type TrackSumAggregateOutputType = {
    duration: number | null
    trackNumber: number | null
    discNumber: number | null
  }

  export type TrackMinAggregateOutputType = {
    id: string | null
    albumId: string | null
    title: string | null
    duration: number | null
    lyrics: string | null
    trackNumber: number | null
    discNumber: number | null
    isrc: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TrackMaxAggregateOutputType = {
    id: string | null
    albumId: string | null
    title: string | null
    duration: number | null
    lyrics: string | null
    trackNumber: number | null
    discNumber: number | null
    isrc: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TrackCountAggregateOutputType = {
    id: number
    albumId: number
    title: number
    duration: number
    lyrics: number
    trackNumber: number
    discNumber: number
    isrc: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type TrackAvgAggregateInputType = {
    duration?: true
    trackNumber?: true
    discNumber?: true
  }

  export type TrackSumAggregateInputType = {
    duration?: true
    trackNumber?: true
    discNumber?: true
  }

  export type TrackMinAggregateInputType = {
    id?: true
    albumId?: true
    title?: true
    duration?: true
    lyrics?: true
    trackNumber?: true
    discNumber?: true
    isrc?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TrackMaxAggregateInputType = {
    id?: true
    albumId?: true
    title?: true
    duration?: true
    lyrics?: true
    trackNumber?: true
    discNumber?: true
    isrc?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TrackCountAggregateInputType = {
    id?: true
    albumId?: true
    title?: true
    duration?: true
    lyrics?: true
    trackNumber?: true
    discNumber?: true
    isrc?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type TrackAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Track to aggregate.
     */
    where?: TrackWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tracks to fetch.
     */
    orderBy?: TrackOrderByWithRelationInput | TrackOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TrackWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tracks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tracks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Tracks
    **/
    _count?: true | TrackCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: TrackAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: TrackSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TrackMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TrackMaxAggregateInputType
  }

  export type GetTrackAggregateType<T extends TrackAggregateArgs> = {
        [P in keyof T & keyof AggregateTrack]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTrack[P]>
      : GetScalarType<T[P], AggregateTrack[P]>
  }




  export type TrackGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TrackWhereInput
    orderBy?: TrackOrderByWithAggregationInput | TrackOrderByWithAggregationInput[]
    by: TrackScalarFieldEnum[] | TrackScalarFieldEnum
    having?: TrackScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TrackCountAggregateInputType | true
    _avg?: TrackAvgAggregateInputType
    _sum?: TrackSumAggregateInputType
    _min?: TrackMinAggregateInputType
    _max?: TrackMaxAggregateInputType
  }

  export type TrackGroupByOutputType = {
    id: string
    albumId: string
    title: string
    duration: number
    lyrics: string | null
    trackNumber: number
    discNumber: number
    isrc: string | null
    createdAt: Date
    updatedAt: Date
    _count: TrackCountAggregateOutputType | null
    _avg: TrackAvgAggregateOutputType | null
    _sum: TrackSumAggregateOutputType | null
    _min: TrackMinAggregateOutputType | null
    _max: TrackMaxAggregateOutputType | null
  }

  type GetTrackGroupByPayload<T extends TrackGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TrackGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TrackGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TrackGroupByOutputType[P]>
            : GetScalarType<T[P], TrackGroupByOutputType[P]>
        }
      >
    >


  export type TrackSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    albumId?: boolean
    title?: boolean
    duration?: boolean
    lyrics?: boolean
    trackNumber?: boolean
    discNumber?: boolean
    isrc?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    album?: boolean | AlbumDefaultArgs<ExtArgs>
    artists?: boolean | Track$artistsArgs<ExtArgs>
    audioResources?: boolean | Track$audioResourcesArgs<ExtArgs>
    playlistTracks?: boolean | Track$playlistTracksArgs<ExtArgs>
    likedUsers?: boolean | Track$likedUsersArgs<ExtArgs>
    playbacks?: boolean | Track$playbacksArgs<ExtArgs>
    genres?: boolean | Track$genresArgs<ExtArgs>
    _count?: boolean | TrackCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["track"]>

  export type TrackSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    albumId?: boolean
    title?: boolean
    duration?: boolean
    lyrics?: boolean
    trackNumber?: boolean
    discNumber?: boolean
    isrc?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    album?: boolean | AlbumDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["track"]>

  export type TrackSelectScalar = {
    id?: boolean
    albumId?: boolean
    title?: boolean
    duration?: boolean
    lyrics?: boolean
    trackNumber?: boolean
    discNumber?: boolean
    isrc?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type TrackInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    album?: boolean | AlbumDefaultArgs<ExtArgs>
    artists?: boolean | Track$artistsArgs<ExtArgs>
    audioResources?: boolean | Track$audioResourcesArgs<ExtArgs>
    playlistTracks?: boolean | Track$playlistTracksArgs<ExtArgs>
    likedUsers?: boolean | Track$likedUsersArgs<ExtArgs>
    playbacks?: boolean | Track$playbacksArgs<ExtArgs>
    genres?: boolean | Track$genresArgs<ExtArgs>
    _count?: boolean | TrackCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type TrackIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    album?: boolean | AlbumDefaultArgs<ExtArgs>
  }

  export type $TrackPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Track"
    objects: {
      album: Prisma.$AlbumPayload<ExtArgs>
      artists: Prisma.$TrackArtistPayload<ExtArgs>[]
      audioResources: Prisma.$TrackAudioResourcePayload<ExtArgs>[]
      playlistTracks: Prisma.$PlaylistTrackPayload<ExtArgs>[]
      likedUsers: Prisma.$LikedTrackPayload<ExtArgs>[]
      playbacks: Prisma.$PlaybackHistoryPayload<ExtArgs>[]
      genres: Prisma.$TrackGenrePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      albumId: string
      title: string
      duration: number
      lyrics: string | null
      trackNumber: number
      discNumber: number
      isrc: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["track"]>
    composites: {}
  }

  type TrackGetPayload<S extends boolean | null | undefined | TrackDefaultArgs> = $Result.GetResult<Prisma.$TrackPayload, S>

  type TrackCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<TrackFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: TrackCountAggregateInputType | true
    }

  export interface TrackDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Track'], meta: { name: 'Track' } }
    /**
     * Find zero or one Track that matches the filter.
     * @param {TrackFindUniqueArgs} args - Arguments to find a Track
     * @example
     * // Get one Track
     * const track = await prisma.track.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TrackFindUniqueArgs>(args: SelectSubset<T, TrackFindUniqueArgs<ExtArgs>>): Prisma__TrackClient<$Result.GetResult<Prisma.$TrackPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Track that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {TrackFindUniqueOrThrowArgs} args - Arguments to find a Track
     * @example
     * // Get one Track
     * const track = await prisma.track.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TrackFindUniqueOrThrowArgs>(args: SelectSubset<T, TrackFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TrackClient<$Result.GetResult<Prisma.$TrackPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Track that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrackFindFirstArgs} args - Arguments to find a Track
     * @example
     * // Get one Track
     * const track = await prisma.track.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TrackFindFirstArgs>(args?: SelectSubset<T, TrackFindFirstArgs<ExtArgs>>): Prisma__TrackClient<$Result.GetResult<Prisma.$TrackPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Track that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrackFindFirstOrThrowArgs} args - Arguments to find a Track
     * @example
     * // Get one Track
     * const track = await prisma.track.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TrackFindFirstOrThrowArgs>(args?: SelectSubset<T, TrackFindFirstOrThrowArgs<ExtArgs>>): Prisma__TrackClient<$Result.GetResult<Prisma.$TrackPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Tracks that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrackFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Tracks
     * const tracks = await prisma.track.findMany()
     * 
     * // Get first 10 Tracks
     * const tracks = await prisma.track.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const trackWithIdOnly = await prisma.track.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TrackFindManyArgs>(args?: SelectSubset<T, TrackFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TrackPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Track.
     * @param {TrackCreateArgs} args - Arguments to create a Track.
     * @example
     * // Create one Track
     * const Track = await prisma.track.create({
     *   data: {
     *     // ... data to create a Track
     *   }
     * })
     * 
     */
    create<T extends TrackCreateArgs>(args: SelectSubset<T, TrackCreateArgs<ExtArgs>>): Prisma__TrackClient<$Result.GetResult<Prisma.$TrackPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Tracks.
     * @param {TrackCreateManyArgs} args - Arguments to create many Tracks.
     * @example
     * // Create many Tracks
     * const track = await prisma.track.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TrackCreateManyArgs>(args?: SelectSubset<T, TrackCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Tracks and returns the data saved in the database.
     * @param {TrackCreateManyAndReturnArgs} args - Arguments to create many Tracks.
     * @example
     * // Create many Tracks
     * const track = await prisma.track.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Tracks and only return the `id`
     * const trackWithIdOnly = await prisma.track.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TrackCreateManyAndReturnArgs>(args?: SelectSubset<T, TrackCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TrackPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Track.
     * @param {TrackDeleteArgs} args - Arguments to delete one Track.
     * @example
     * // Delete one Track
     * const Track = await prisma.track.delete({
     *   where: {
     *     // ... filter to delete one Track
     *   }
     * })
     * 
     */
    delete<T extends TrackDeleteArgs>(args: SelectSubset<T, TrackDeleteArgs<ExtArgs>>): Prisma__TrackClient<$Result.GetResult<Prisma.$TrackPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Track.
     * @param {TrackUpdateArgs} args - Arguments to update one Track.
     * @example
     * // Update one Track
     * const track = await prisma.track.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TrackUpdateArgs>(args: SelectSubset<T, TrackUpdateArgs<ExtArgs>>): Prisma__TrackClient<$Result.GetResult<Prisma.$TrackPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Tracks.
     * @param {TrackDeleteManyArgs} args - Arguments to filter Tracks to delete.
     * @example
     * // Delete a few Tracks
     * const { count } = await prisma.track.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TrackDeleteManyArgs>(args?: SelectSubset<T, TrackDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tracks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrackUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Tracks
     * const track = await prisma.track.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TrackUpdateManyArgs>(args: SelectSubset<T, TrackUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Track.
     * @param {TrackUpsertArgs} args - Arguments to update or create a Track.
     * @example
     * // Update or create a Track
     * const track = await prisma.track.upsert({
     *   create: {
     *     // ... data to create a Track
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Track we want to update
     *   }
     * })
     */
    upsert<T extends TrackUpsertArgs>(args: SelectSubset<T, TrackUpsertArgs<ExtArgs>>): Prisma__TrackClient<$Result.GetResult<Prisma.$TrackPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Tracks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrackCountArgs} args - Arguments to filter Tracks to count.
     * @example
     * // Count the number of Tracks
     * const count = await prisma.track.count({
     *   where: {
     *     // ... the filter for the Tracks we want to count
     *   }
     * })
    **/
    count<T extends TrackCountArgs>(
      args?: Subset<T, TrackCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TrackCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Track.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrackAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TrackAggregateArgs>(args: Subset<T, TrackAggregateArgs>): Prisma.PrismaPromise<GetTrackAggregateType<T>>

    /**
     * Group by Track.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrackGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TrackGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TrackGroupByArgs['orderBy'] }
        : { orderBy?: TrackGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TrackGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTrackGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Track model
   */
  readonly fields: TrackFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Track.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TrackClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    album<T extends AlbumDefaultArgs<ExtArgs> = {}>(args?: Subset<T, AlbumDefaultArgs<ExtArgs>>): Prisma__AlbumClient<$Result.GetResult<Prisma.$AlbumPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    artists<T extends Track$artistsArgs<ExtArgs> = {}>(args?: Subset<T, Track$artistsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TrackArtistPayload<ExtArgs>, T, "findMany"> | Null>
    audioResources<T extends Track$audioResourcesArgs<ExtArgs> = {}>(args?: Subset<T, Track$audioResourcesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TrackAudioResourcePayload<ExtArgs>, T, "findMany"> | Null>
    playlistTracks<T extends Track$playlistTracksArgs<ExtArgs> = {}>(args?: Subset<T, Track$playlistTracksArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PlaylistTrackPayload<ExtArgs>, T, "findMany"> | Null>
    likedUsers<T extends Track$likedUsersArgs<ExtArgs> = {}>(args?: Subset<T, Track$likedUsersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LikedTrackPayload<ExtArgs>, T, "findMany"> | Null>
    playbacks<T extends Track$playbacksArgs<ExtArgs> = {}>(args?: Subset<T, Track$playbacksArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PlaybackHistoryPayload<ExtArgs>, T, "findMany"> | Null>
    genres<T extends Track$genresArgs<ExtArgs> = {}>(args?: Subset<T, Track$genresArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TrackGenrePayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Track model
   */ 
  interface TrackFieldRefs {
    readonly id: FieldRef<"Track", 'String'>
    readonly albumId: FieldRef<"Track", 'String'>
    readonly title: FieldRef<"Track", 'String'>
    readonly duration: FieldRef<"Track", 'Int'>
    readonly lyrics: FieldRef<"Track", 'String'>
    readonly trackNumber: FieldRef<"Track", 'Int'>
    readonly discNumber: FieldRef<"Track", 'Int'>
    readonly isrc: FieldRef<"Track", 'String'>
    readonly createdAt: FieldRef<"Track", 'DateTime'>
    readonly updatedAt: FieldRef<"Track", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Track findUnique
   */
  export type TrackFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Track
     */
    select?: TrackSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrackInclude<ExtArgs> | null
    /**
     * Filter, which Track to fetch.
     */
    where: TrackWhereUniqueInput
  }

  /**
   * Track findUniqueOrThrow
   */
  export type TrackFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Track
     */
    select?: TrackSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrackInclude<ExtArgs> | null
    /**
     * Filter, which Track to fetch.
     */
    where: TrackWhereUniqueInput
  }

  /**
   * Track findFirst
   */
  export type TrackFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Track
     */
    select?: TrackSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrackInclude<ExtArgs> | null
    /**
     * Filter, which Track to fetch.
     */
    where?: TrackWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tracks to fetch.
     */
    orderBy?: TrackOrderByWithRelationInput | TrackOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Tracks.
     */
    cursor?: TrackWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tracks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tracks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Tracks.
     */
    distinct?: TrackScalarFieldEnum | TrackScalarFieldEnum[]
  }

  /**
   * Track findFirstOrThrow
   */
  export type TrackFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Track
     */
    select?: TrackSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrackInclude<ExtArgs> | null
    /**
     * Filter, which Track to fetch.
     */
    where?: TrackWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tracks to fetch.
     */
    orderBy?: TrackOrderByWithRelationInput | TrackOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Tracks.
     */
    cursor?: TrackWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tracks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tracks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Tracks.
     */
    distinct?: TrackScalarFieldEnum | TrackScalarFieldEnum[]
  }

  /**
   * Track findMany
   */
  export type TrackFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Track
     */
    select?: TrackSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrackInclude<ExtArgs> | null
    /**
     * Filter, which Tracks to fetch.
     */
    where?: TrackWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tracks to fetch.
     */
    orderBy?: TrackOrderByWithRelationInput | TrackOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Tracks.
     */
    cursor?: TrackWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tracks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tracks.
     */
    skip?: number
    distinct?: TrackScalarFieldEnum | TrackScalarFieldEnum[]
  }

  /**
   * Track create
   */
  export type TrackCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Track
     */
    select?: TrackSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrackInclude<ExtArgs> | null
    /**
     * The data needed to create a Track.
     */
    data: XOR<TrackCreateInput, TrackUncheckedCreateInput>
  }

  /**
   * Track createMany
   */
  export type TrackCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Tracks.
     */
    data: TrackCreateManyInput | TrackCreateManyInput[]
  }

  /**
   * Track createManyAndReturn
   */
  export type TrackCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Track
     */
    select?: TrackSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Tracks.
     */
    data: TrackCreateManyInput | TrackCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrackIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Track update
   */
  export type TrackUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Track
     */
    select?: TrackSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrackInclude<ExtArgs> | null
    /**
     * The data needed to update a Track.
     */
    data: XOR<TrackUpdateInput, TrackUncheckedUpdateInput>
    /**
     * Choose, which Track to update.
     */
    where: TrackWhereUniqueInput
  }

  /**
   * Track updateMany
   */
  export type TrackUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Tracks.
     */
    data: XOR<TrackUpdateManyMutationInput, TrackUncheckedUpdateManyInput>
    /**
     * Filter which Tracks to update
     */
    where?: TrackWhereInput
  }

  /**
   * Track upsert
   */
  export type TrackUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Track
     */
    select?: TrackSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrackInclude<ExtArgs> | null
    /**
     * The filter to search for the Track to update in case it exists.
     */
    where: TrackWhereUniqueInput
    /**
     * In case the Track found by the `where` argument doesn't exist, create a new Track with this data.
     */
    create: XOR<TrackCreateInput, TrackUncheckedCreateInput>
    /**
     * In case the Track was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TrackUpdateInput, TrackUncheckedUpdateInput>
  }

  /**
   * Track delete
   */
  export type TrackDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Track
     */
    select?: TrackSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrackInclude<ExtArgs> | null
    /**
     * Filter which Track to delete.
     */
    where: TrackWhereUniqueInput
  }

  /**
   * Track deleteMany
   */
  export type TrackDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Tracks to delete
     */
    where?: TrackWhereInput
  }

  /**
   * Track.artists
   */
  export type Track$artistsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrackArtist
     */
    select?: TrackArtistSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrackArtistInclude<ExtArgs> | null
    where?: TrackArtistWhereInput
    orderBy?: TrackArtistOrderByWithRelationInput | TrackArtistOrderByWithRelationInput[]
    cursor?: TrackArtistWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TrackArtistScalarFieldEnum | TrackArtistScalarFieldEnum[]
  }

  /**
   * Track.audioResources
   */
  export type Track$audioResourcesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrackAudioResource
     */
    select?: TrackAudioResourceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrackAudioResourceInclude<ExtArgs> | null
    where?: TrackAudioResourceWhereInput
    orderBy?: TrackAudioResourceOrderByWithRelationInput | TrackAudioResourceOrderByWithRelationInput[]
    cursor?: TrackAudioResourceWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TrackAudioResourceScalarFieldEnum | TrackAudioResourceScalarFieldEnum[]
  }

  /**
   * Track.playlistTracks
   */
  export type Track$playlistTracksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlaylistTrack
     */
    select?: PlaylistTrackSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlaylistTrackInclude<ExtArgs> | null
    where?: PlaylistTrackWhereInput
    orderBy?: PlaylistTrackOrderByWithRelationInput | PlaylistTrackOrderByWithRelationInput[]
    cursor?: PlaylistTrackWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PlaylistTrackScalarFieldEnum | PlaylistTrackScalarFieldEnum[]
  }

  /**
   * Track.likedUsers
   */
  export type Track$likedUsersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LikedTrack
     */
    select?: LikedTrackSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LikedTrackInclude<ExtArgs> | null
    where?: LikedTrackWhereInput
    orderBy?: LikedTrackOrderByWithRelationInput | LikedTrackOrderByWithRelationInput[]
    cursor?: LikedTrackWhereUniqueInput
    take?: number
    skip?: number
    distinct?: LikedTrackScalarFieldEnum | LikedTrackScalarFieldEnum[]
  }

  /**
   * Track.playbacks
   */
  export type Track$playbacksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlaybackHistory
     */
    select?: PlaybackHistorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlaybackHistoryInclude<ExtArgs> | null
    where?: PlaybackHistoryWhereInput
    orderBy?: PlaybackHistoryOrderByWithRelationInput | PlaybackHistoryOrderByWithRelationInput[]
    cursor?: PlaybackHistoryWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PlaybackHistoryScalarFieldEnum | PlaybackHistoryScalarFieldEnum[]
  }

  /**
   * Track.genres
   */
  export type Track$genresArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrackGenre
     */
    select?: TrackGenreSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrackGenreInclude<ExtArgs> | null
    where?: TrackGenreWhereInput
    orderBy?: TrackGenreOrderByWithRelationInput | TrackGenreOrderByWithRelationInput[]
    cursor?: TrackGenreWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TrackGenreScalarFieldEnum | TrackGenreScalarFieldEnum[]
  }

  /**
   * Track without action
   */
  export type TrackDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Track
     */
    select?: TrackSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrackInclude<ExtArgs> | null
  }


  /**
   * Model TrackArtist
   */

  export type AggregateTrackArtist = {
    _count: TrackArtistCountAggregateOutputType | null
    _min: TrackArtistMinAggregateOutputType | null
    _max: TrackArtistMaxAggregateOutputType | null
  }

  export type TrackArtistMinAggregateOutputType = {
    trackId: string | null
    artistId: string | null
    role: string | null
  }

  export type TrackArtistMaxAggregateOutputType = {
    trackId: string | null
    artistId: string | null
    role: string | null
  }

  export type TrackArtistCountAggregateOutputType = {
    trackId: number
    artistId: number
    role: number
    _all: number
  }


  export type TrackArtistMinAggregateInputType = {
    trackId?: true
    artistId?: true
    role?: true
  }

  export type TrackArtistMaxAggregateInputType = {
    trackId?: true
    artistId?: true
    role?: true
  }

  export type TrackArtistCountAggregateInputType = {
    trackId?: true
    artistId?: true
    role?: true
    _all?: true
  }

  export type TrackArtistAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TrackArtist to aggregate.
     */
    where?: TrackArtistWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TrackArtists to fetch.
     */
    orderBy?: TrackArtistOrderByWithRelationInput | TrackArtistOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TrackArtistWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TrackArtists from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TrackArtists.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned TrackArtists
    **/
    _count?: true | TrackArtistCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TrackArtistMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TrackArtistMaxAggregateInputType
  }

  export type GetTrackArtistAggregateType<T extends TrackArtistAggregateArgs> = {
        [P in keyof T & keyof AggregateTrackArtist]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTrackArtist[P]>
      : GetScalarType<T[P], AggregateTrackArtist[P]>
  }




  export type TrackArtistGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TrackArtistWhereInput
    orderBy?: TrackArtistOrderByWithAggregationInput | TrackArtistOrderByWithAggregationInput[]
    by: TrackArtistScalarFieldEnum[] | TrackArtistScalarFieldEnum
    having?: TrackArtistScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TrackArtistCountAggregateInputType | true
    _min?: TrackArtistMinAggregateInputType
    _max?: TrackArtistMaxAggregateInputType
  }

  export type TrackArtistGroupByOutputType = {
    trackId: string
    artistId: string
    role: string
    _count: TrackArtistCountAggregateOutputType | null
    _min: TrackArtistMinAggregateOutputType | null
    _max: TrackArtistMaxAggregateOutputType | null
  }

  type GetTrackArtistGroupByPayload<T extends TrackArtistGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TrackArtistGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TrackArtistGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TrackArtistGroupByOutputType[P]>
            : GetScalarType<T[P], TrackArtistGroupByOutputType[P]>
        }
      >
    >


  export type TrackArtistSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    trackId?: boolean
    artistId?: boolean
    role?: boolean
    track?: boolean | TrackDefaultArgs<ExtArgs>
    artist?: boolean | ArtistDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["trackArtist"]>

  export type TrackArtistSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    trackId?: boolean
    artistId?: boolean
    role?: boolean
    track?: boolean | TrackDefaultArgs<ExtArgs>
    artist?: boolean | ArtistDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["trackArtist"]>

  export type TrackArtistSelectScalar = {
    trackId?: boolean
    artistId?: boolean
    role?: boolean
  }

  export type TrackArtistInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    track?: boolean | TrackDefaultArgs<ExtArgs>
    artist?: boolean | ArtistDefaultArgs<ExtArgs>
  }
  export type TrackArtistIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    track?: boolean | TrackDefaultArgs<ExtArgs>
    artist?: boolean | ArtistDefaultArgs<ExtArgs>
  }

  export type $TrackArtistPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "TrackArtist"
    objects: {
      track: Prisma.$TrackPayload<ExtArgs>
      artist: Prisma.$ArtistPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      trackId: string
      artistId: string
      role: string
    }, ExtArgs["result"]["trackArtist"]>
    composites: {}
  }

  type TrackArtistGetPayload<S extends boolean | null | undefined | TrackArtistDefaultArgs> = $Result.GetResult<Prisma.$TrackArtistPayload, S>

  type TrackArtistCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<TrackArtistFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: TrackArtistCountAggregateInputType | true
    }

  export interface TrackArtistDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['TrackArtist'], meta: { name: 'TrackArtist' } }
    /**
     * Find zero or one TrackArtist that matches the filter.
     * @param {TrackArtistFindUniqueArgs} args - Arguments to find a TrackArtist
     * @example
     * // Get one TrackArtist
     * const trackArtist = await prisma.trackArtist.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TrackArtistFindUniqueArgs>(args: SelectSubset<T, TrackArtistFindUniqueArgs<ExtArgs>>): Prisma__TrackArtistClient<$Result.GetResult<Prisma.$TrackArtistPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one TrackArtist that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {TrackArtistFindUniqueOrThrowArgs} args - Arguments to find a TrackArtist
     * @example
     * // Get one TrackArtist
     * const trackArtist = await prisma.trackArtist.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TrackArtistFindUniqueOrThrowArgs>(args: SelectSubset<T, TrackArtistFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TrackArtistClient<$Result.GetResult<Prisma.$TrackArtistPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first TrackArtist that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrackArtistFindFirstArgs} args - Arguments to find a TrackArtist
     * @example
     * // Get one TrackArtist
     * const trackArtist = await prisma.trackArtist.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TrackArtistFindFirstArgs>(args?: SelectSubset<T, TrackArtistFindFirstArgs<ExtArgs>>): Prisma__TrackArtistClient<$Result.GetResult<Prisma.$TrackArtistPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first TrackArtist that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrackArtistFindFirstOrThrowArgs} args - Arguments to find a TrackArtist
     * @example
     * // Get one TrackArtist
     * const trackArtist = await prisma.trackArtist.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TrackArtistFindFirstOrThrowArgs>(args?: SelectSubset<T, TrackArtistFindFirstOrThrowArgs<ExtArgs>>): Prisma__TrackArtistClient<$Result.GetResult<Prisma.$TrackArtistPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more TrackArtists that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrackArtistFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all TrackArtists
     * const trackArtists = await prisma.trackArtist.findMany()
     * 
     * // Get first 10 TrackArtists
     * const trackArtists = await prisma.trackArtist.findMany({ take: 10 })
     * 
     * // Only select the `trackId`
     * const trackArtistWithTrackIdOnly = await prisma.trackArtist.findMany({ select: { trackId: true } })
     * 
     */
    findMany<T extends TrackArtistFindManyArgs>(args?: SelectSubset<T, TrackArtistFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TrackArtistPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a TrackArtist.
     * @param {TrackArtistCreateArgs} args - Arguments to create a TrackArtist.
     * @example
     * // Create one TrackArtist
     * const TrackArtist = await prisma.trackArtist.create({
     *   data: {
     *     // ... data to create a TrackArtist
     *   }
     * })
     * 
     */
    create<T extends TrackArtistCreateArgs>(args: SelectSubset<T, TrackArtistCreateArgs<ExtArgs>>): Prisma__TrackArtistClient<$Result.GetResult<Prisma.$TrackArtistPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many TrackArtists.
     * @param {TrackArtistCreateManyArgs} args - Arguments to create many TrackArtists.
     * @example
     * // Create many TrackArtists
     * const trackArtist = await prisma.trackArtist.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TrackArtistCreateManyArgs>(args?: SelectSubset<T, TrackArtistCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many TrackArtists and returns the data saved in the database.
     * @param {TrackArtistCreateManyAndReturnArgs} args - Arguments to create many TrackArtists.
     * @example
     * // Create many TrackArtists
     * const trackArtist = await prisma.trackArtist.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many TrackArtists and only return the `trackId`
     * const trackArtistWithTrackIdOnly = await prisma.trackArtist.createManyAndReturn({ 
     *   select: { trackId: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TrackArtistCreateManyAndReturnArgs>(args?: SelectSubset<T, TrackArtistCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TrackArtistPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a TrackArtist.
     * @param {TrackArtistDeleteArgs} args - Arguments to delete one TrackArtist.
     * @example
     * // Delete one TrackArtist
     * const TrackArtist = await prisma.trackArtist.delete({
     *   where: {
     *     // ... filter to delete one TrackArtist
     *   }
     * })
     * 
     */
    delete<T extends TrackArtistDeleteArgs>(args: SelectSubset<T, TrackArtistDeleteArgs<ExtArgs>>): Prisma__TrackArtistClient<$Result.GetResult<Prisma.$TrackArtistPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one TrackArtist.
     * @param {TrackArtistUpdateArgs} args - Arguments to update one TrackArtist.
     * @example
     * // Update one TrackArtist
     * const trackArtist = await prisma.trackArtist.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TrackArtistUpdateArgs>(args: SelectSubset<T, TrackArtistUpdateArgs<ExtArgs>>): Prisma__TrackArtistClient<$Result.GetResult<Prisma.$TrackArtistPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more TrackArtists.
     * @param {TrackArtistDeleteManyArgs} args - Arguments to filter TrackArtists to delete.
     * @example
     * // Delete a few TrackArtists
     * const { count } = await prisma.trackArtist.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TrackArtistDeleteManyArgs>(args?: SelectSubset<T, TrackArtistDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TrackArtists.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrackArtistUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many TrackArtists
     * const trackArtist = await prisma.trackArtist.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TrackArtistUpdateManyArgs>(args: SelectSubset<T, TrackArtistUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one TrackArtist.
     * @param {TrackArtistUpsertArgs} args - Arguments to update or create a TrackArtist.
     * @example
     * // Update or create a TrackArtist
     * const trackArtist = await prisma.trackArtist.upsert({
     *   create: {
     *     // ... data to create a TrackArtist
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the TrackArtist we want to update
     *   }
     * })
     */
    upsert<T extends TrackArtistUpsertArgs>(args: SelectSubset<T, TrackArtistUpsertArgs<ExtArgs>>): Prisma__TrackArtistClient<$Result.GetResult<Prisma.$TrackArtistPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of TrackArtists.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrackArtistCountArgs} args - Arguments to filter TrackArtists to count.
     * @example
     * // Count the number of TrackArtists
     * const count = await prisma.trackArtist.count({
     *   where: {
     *     // ... the filter for the TrackArtists we want to count
     *   }
     * })
    **/
    count<T extends TrackArtistCountArgs>(
      args?: Subset<T, TrackArtistCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TrackArtistCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a TrackArtist.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrackArtistAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TrackArtistAggregateArgs>(args: Subset<T, TrackArtistAggregateArgs>): Prisma.PrismaPromise<GetTrackArtistAggregateType<T>>

    /**
     * Group by TrackArtist.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrackArtistGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TrackArtistGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TrackArtistGroupByArgs['orderBy'] }
        : { orderBy?: TrackArtistGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TrackArtistGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTrackArtistGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the TrackArtist model
   */
  readonly fields: TrackArtistFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for TrackArtist.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TrackArtistClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    track<T extends TrackDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TrackDefaultArgs<ExtArgs>>): Prisma__TrackClient<$Result.GetResult<Prisma.$TrackPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    artist<T extends ArtistDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ArtistDefaultArgs<ExtArgs>>): Prisma__ArtistClient<$Result.GetResult<Prisma.$ArtistPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the TrackArtist model
   */ 
  interface TrackArtistFieldRefs {
    readonly trackId: FieldRef<"TrackArtist", 'String'>
    readonly artistId: FieldRef<"TrackArtist", 'String'>
    readonly role: FieldRef<"TrackArtist", 'String'>
  }
    

  // Custom InputTypes
  /**
   * TrackArtist findUnique
   */
  export type TrackArtistFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrackArtist
     */
    select?: TrackArtistSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrackArtistInclude<ExtArgs> | null
    /**
     * Filter, which TrackArtist to fetch.
     */
    where: TrackArtistWhereUniqueInput
  }

  /**
   * TrackArtist findUniqueOrThrow
   */
  export type TrackArtistFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrackArtist
     */
    select?: TrackArtistSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrackArtistInclude<ExtArgs> | null
    /**
     * Filter, which TrackArtist to fetch.
     */
    where: TrackArtistWhereUniqueInput
  }

  /**
   * TrackArtist findFirst
   */
  export type TrackArtistFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrackArtist
     */
    select?: TrackArtistSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrackArtistInclude<ExtArgs> | null
    /**
     * Filter, which TrackArtist to fetch.
     */
    where?: TrackArtistWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TrackArtists to fetch.
     */
    orderBy?: TrackArtistOrderByWithRelationInput | TrackArtistOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TrackArtists.
     */
    cursor?: TrackArtistWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TrackArtists from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TrackArtists.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TrackArtists.
     */
    distinct?: TrackArtistScalarFieldEnum | TrackArtistScalarFieldEnum[]
  }

  /**
   * TrackArtist findFirstOrThrow
   */
  export type TrackArtistFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrackArtist
     */
    select?: TrackArtistSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrackArtistInclude<ExtArgs> | null
    /**
     * Filter, which TrackArtist to fetch.
     */
    where?: TrackArtistWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TrackArtists to fetch.
     */
    orderBy?: TrackArtistOrderByWithRelationInput | TrackArtistOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TrackArtists.
     */
    cursor?: TrackArtistWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TrackArtists from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TrackArtists.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TrackArtists.
     */
    distinct?: TrackArtistScalarFieldEnum | TrackArtistScalarFieldEnum[]
  }

  /**
   * TrackArtist findMany
   */
  export type TrackArtistFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrackArtist
     */
    select?: TrackArtistSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrackArtistInclude<ExtArgs> | null
    /**
     * Filter, which TrackArtists to fetch.
     */
    where?: TrackArtistWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TrackArtists to fetch.
     */
    orderBy?: TrackArtistOrderByWithRelationInput | TrackArtistOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing TrackArtists.
     */
    cursor?: TrackArtistWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TrackArtists from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TrackArtists.
     */
    skip?: number
    distinct?: TrackArtistScalarFieldEnum | TrackArtistScalarFieldEnum[]
  }

  /**
   * TrackArtist create
   */
  export type TrackArtistCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrackArtist
     */
    select?: TrackArtistSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrackArtistInclude<ExtArgs> | null
    /**
     * The data needed to create a TrackArtist.
     */
    data: XOR<TrackArtistCreateInput, TrackArtistUncheckedCreateInput>
  }

  /**
   * TrackArtist createMany
   */
  export type TrackArtistCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many TrackArtists.
     */
    data: TrackArtistCreateManyInput | TrackArtistCreateManyInput[]
  }

  /**
   * TrackArtist createManyAndReturn
   */
  export type TrackArtistCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrackArtist
     */
    select?: TrackArtistSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many TrackArtists.
     */
    data: TrackArtistCreateManyInput | TrackArtistCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrackArtistIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * TrackArtist update
   */
  export type TrackArtistUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrackArtist
     */
    select?: TrackArtistSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrackArtistInclude<ExtArgs> | null
    /**
     * The data needed to update a TrackArtist.
     */
    data: XOR<TrackArtistUpdateInput, TrackArtistUncheckedUpdateInput>
    /**
     * Choose, which TrackArtist to update.
     */
    where: TrackArtistWhereUniqueInput
  }

  /**
   * TrackArtist updateMany
   */
  export type TrackArtistUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update TrackArtists.
     */
    data: XOR<TrackArtistUpdateManyMutationInput, TrackArtistUncheckedUpdateManyInput>
    /**
     * Filter which TrackArtists to update
     */
    where?: TrackArtistWhereInput
  }

  /**
   * TrackArtist upsert
   */
  export type TrackArtistUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrackArtist
     */
    select?: TrackArtistSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrackArtistInclude<ExtArgs> | null
    /**
     * The filter to search for the TrackArtist to update in case it exists.
     */
    where: TrackArtistWhereUniqueInput
    /**
     * In case the TrackArtist found by the `where` argument doesn't exist, create a new TrackArtist with this data.
     */
    create: XOR<TrackArtistCreateInput, TrackArtistUncheckedCreateInput>
    /**
     * In case the TrackArtist was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TrackArtistUpdateInput, TrackArtistUncheckedUpdateInput>
  }

  /**
   * TrackArtist delete
   */
  export type TrackArtistDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrackArtist
     */
    select?: TrackArtistSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrackArtistInclude<ExtArgs> | null
    /**
     * Filter which TrackArtist to delete.
     */
    where: TrackArtistWhereUniqueInput
  }

  /**
   * TrackArtist deleteMany
   */
  export type TrackArtistDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TrackArtists to delete
     */
    where?: TrackArtistWhereInput
  }

  /**
   * TrackArtist without action
   */
  export type TrackArtistDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrackArtist
     */
    select?: TrackArtistSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrackArtistInclude<ExtArgs> | null
  }


  /**
   * Model AlbumArtist
   */

  export type AggregateAlbumArtist = {
    _count: AlbumArtistCountAggregateOutputType | null
    _min: AlbumArtistMinAggregateOutputType | null
    _max: AlbumArtistMaxAggregateOutputType | null
  }

  export type AlbumArtistMinAggregateOutputType = {
    albumId: string | null
    artistId: string | null
  }

  export type AlbumArtistMaxAggregateOutputType = {
    albumId: string | null
    artistId: string | null
  }

  export type AlbumArtistCountAggregateOutputType = {
    albumId: number
    artistId: number
    _all: number
  }


  export type AlbumArtistMinAggregateInputType = {
    albumId?: true
    artistId?: true
  }

  export type AlbumArtistMaxAggregateInputType = {
    albumId?: true
    artistId?: true
  }

  export type AlbumArtistCountAggregateInputType = {
    albumId?: true
    artistId?: true
    _all?: true
  }

  export type AlbumArtistAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AlbumArtist to aggregate.
     */
    where?: AlbumArtistWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AlbumArtists to fetch.
     */
    orderBy?: AlbumArtistOrderByWithRelationInput | AlbumArtistOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AlbumArtistWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AlbumArtists from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AlbumArtists.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AlbumArtists
    **/
    _count?: true | AlbumArtistCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AlbumArtistMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AlbumArtistMaxAggregateInputType
  }

  export type GetAlbumArtistAggregateType<T extends AlbumArtistAggregateArgs> = {
        [P in keyof T & keyof AggregateAlbumArtist]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAlbumArtist[P]>
      : GetScalarType<T[P], AggregateAlbumArtist[P]>
  }




  export type AlbumArtistGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AlbumArtistWhereInput
    orderBy?: AlbumArtistOrderByWithAggregationInput | AlbumArtistOrderByWithAggregationInput[]
    by: AlbumArtistScalarFieldEnum[] | AlbumArtistScalarFieldEnum
    having?: AlbumArtistScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AlbumArtistCountAggregateInputType | true
    _min?: AlbumArtistMinAggregateInputType
    _max?: AlbumArtistMaxAggregateInputType
  }

  export type AlbumArtistGroupByOutputType = {
    albumId: string
    artistId: string
    _count: AlbumArtistCountAggregateOutputType | null
    _min: AlbumArtistMinAggregateOutputType | null
    _max: AlbumArtistMaxAggregateOutputType | null
  }

  type GetAlbumArtistGroupByPayload<T extends AlbumArtistGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AlbumArtistGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AlbumArtistGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AlbumArtistGroupByOutputType[P]>
            : GetScalarType<T[P], AlbumArtistGroupByOutputType[P]>
        }
      >
    >


  export type AlbumArtistSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    albumId?: boolean
    artistId?: boolean
    album?: boolean | AlbumDefaultArgs<ExtArgs>
    artist?: boolean | ArtistDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["albumArtist"]>

  export type AlbumArtistSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    albumId?: boolean
    artistId?: boolean
    album?: boolean | AlbumDefaultArgs<ExtArgs>
    artist?: boolean | ArtistDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["albumArtist"]>

  export type AlbumArtistSelectScalar = {
    albumId?: boolean
    artistId?: boolean
  }

  export type AlbumArtistInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    album?: boolean | AlbumDefaultArgs<ExtArgs>
    artist?: boolean | ArtistDefaultArgs<ExtArgs>
  }
  export type AlbumArtistIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    album?: boolean | AlbumDefaultArgs<ExtArgs>
    artist?: boolean | ArtistDefaultArgs<ExtArgs>
  }

  export type $AlbumArtistPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AlbumArtist"
    objects: {
      album: Prisma.$AlbumPayload<ExtArgs>
      artist: Prisma.$ArtistPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      albumId: string
      artistId: string
    }, ExtArgs["result"]["albumArtist"]>
    composites: {}
  }

  type AlbumArtistGetPayload<S extends boolean | null | undefined | AlbumArtistDefaultArgs> = $Result.GetResult<Prisma.$AlbumArtistPayload, S>

  type AlbumArtistCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<AlbumArtistFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: AlbumArtistCountAggregateInputType | true
    }

  export interface AlbumArtistDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AlbumArtist'], meta: { name: 'AlbumArtist' } }
    /**
     * Find zero or one AlbumArtist that matches the filter.
     * @param {AlbumArtistFindUniqueArgs} args - Arguments to find a AlbumArtist
     * @example
     * // Get one AlbumArtist
     * const albumArtist = await prisma.albumArtist.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AlbumArtistFindUniqueArgs>(args: SelectSubset<T, AlbumArtistFindUniqueArgs<ExtArgs>>): Prisma__AlbumArtistClient<$Result.GetResult<Prisma.$AlbumArtistPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one AlbumArtist that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {AlbumArtistFindUniqueOrThrowArgs} args - Arguments to find a AlbumArtist
     * @example
     * // Get one AlbumArtist
     * const albumArtist = await prisma.albumArtist.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AlbumArtistFindUniqueOrThrowArgs>(args: SelectSubset<T, AlbumArtistFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AlbumArtistClient<$Result.GetResult<Prisma.$AlbumArtistPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first AlbumArtist that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AlbumArtistFindFirstArgs} args - Arguments to find a AlbumArtist
     * @example
     * // Get one AlbumArtist
     * const albumArtist = await prisma.albumArtist.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AlbumArtistFindFirstArgs>(args?: SelectSubset<T, AlbumArtistFindFirstArgs<ExtArgs>>): Prisma__AlbumArtistClient<$Result.GetResult<Prisma.$AlbumArtistPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first AlbumArtist that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AlbumArtistFindFirstOrThrowArgs} args - Arguments to find a AlbumArtist
     * @example
     * // Get one AlbumArtist
     * const albumArtist = await prisma.albumArtist.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AlbumArtistFindFirstOrThrowArgs>(args?: SelectSubset<T, AlbumArtistFindFirstOrThrowArgs<ExtArgs>>): Prisma__AlbumArtistClient<$Result.GetResult<Prisma.$AlbumArtistPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more AlbumArtists that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AlbumArtistFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AlbumArtists
     * const albumArtists = await prisma.albumArtist.findMany()
     * 
     * // Get first 10 AlbumArtists
     * const albumArtists = await prisma.albumArtist.findMany({ take: 10 })
     * 
     * // Only select the `albumId`
     * const albumArtistWithAlbumIdOnly = await prisma.albumArtist.findMany({ select: { albumId: true } })
     * 
     */
    findMany<T extends AlbumArtistFindManyArgs>(args?: SelectSubset<T, AlbumArtistFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AlbumArtistPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a AlbumArtist.
     * @param {AlbumArtistCreateArgs} args - Arguments to create a AlbumArtist.
     * @example
     * // Create one AlbumArtist
     * const AlbumArtist = await prisma.albumArtist.create({
     *   data: {
     *     // ... data to create a AlbumArtist
     *   }
     * })
     * 
     */
    create<T extends AlbumArtistCreateArgs>(args: SelectSubset<T, AlbumArtistCreateArgs<ExtArgs>>): Prisma__AlbumArtistClient<$Result.GetResult<Prisma.$AlbumArtistPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many AlbumArtists.
     * @param {AlbumArtistCreateManyArgs} args - Arguments to create many AlbumArtists.
     * @example
     * // Create many AlbumArtists
     * const albumArtist = await prisma.albumArtist.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AlbumArtistCreateManyArgs>(args?: SelectSubset<T, AlbumArtistCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many AlbumArtists and returns the data saved in the database.
     * @param {AlbumArtistCreateManyAndReturnArgs} args - Arguments to create many AlbumArtists.
     * @example
     * // Create many AlbumArtists
     * const albumArtist = await prisma.albumArtist.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many AlbumArtists and only return the `albumId`
     * const albumArtistWithAlbumIdOnly = await prisma.albumArtist.createManyAndReturn({ 
     *   select: { albumId: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AlbumArtistCreateManyAndReturnArgs>(args?: SelectSubset<T, AlbumArtistCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AlbumArtistPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a AlbumArtist.
     * @param {AlbumArtistDeleteArgs} args - Arguments to delete one AlbumArtist.
     * @example
     * // Delete one AlbumArtist
     * const AlbumArtist = await prisma.albumArtist.delete({
     *   where: {
     *     // ... filter to delete one AlbumArtist
     *   }
     * })
     * 
     */
    delete<T extends AlbumArtistDeleteArgs>(args: SelectSubset<T, AlbumArtistDeleteArgs<ExtArgs>>): Prisma__AlbumArtistClient<$Result.GetResult<Prisma.$AlbumArtistPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one AlbumArtist.
     * @param {AlbumArtistUpdateArgs} args - Arguments to update one AlbumArtist.
     * @example
     * // Update one AlbumArtist
     * const albumArtist = await prisma.albumArtist.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AlbumArtistUpdateArgs>(args: SelectSubset<T, AlbumArtistUpdateArgs<ExtArgs>>): Prisma__AlbumArtistClient<$Result.GetResult<Prisma.$AlbumArtistPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more AlbumArtists.
     * @param {AlbumArtistDeleteManyArgs} args - Arguments to filter AlbumArtists to delete.
     * @example
     * // Delete a few AlbumArtists
     * const { count } = await prisma.albumArtist.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AlbumArtistDeleteManyArgs>(args?: SelectSubset<T, AlbumArtistDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AlbumArtists.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AlbumArtistUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AlbumArtists
     * const albumArtist = await prisma.albumArtist.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AlbumArtistUpdateManyArgs>(args: SelectSubset<T, AlbumArtistUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one AlbumArtist.
     * @param {AlbumArtistUpsertArgs} args - Arguments to update or create a AlbumArtist.
     * @example
     * // Update or create a AlbumArtist
     * const albumArtist = await prisma.albumArtist.upsert({
     *   create: {
     *     // ... data to create a AlbumArtist
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AlbumArtist we want to update
     *   }
     * })
     */
    upsert<T extends AlbumArtistUpsertArgs>(args: SelectSubset<T, AlbumArtistUpsertArgs<ExtArgs>>): Prisma__AlbumArtistClient<$Result.GetResult<Prisma.$AlbumArtistPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of AlbumArtists.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AlbumArtistCountArgs} args - Arguments to filter AlbumArtists to count.
     * @example
     * // Count the number of AlbumArtists
     * const count = await prisma.albumArtist.count({
     *   where: {
     *     // ... the filter for the AlbumArtists we want to count
     *   }
     * })
    **/
    count<T extends AlbumArtistCountArgs>(
      args?: Subset<T, AlbumArtistCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AlbumArtistCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AlbumArtist.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AlbumArtistAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AlbumArtistAggregateArgs>(args: Subset<T, AlbumArtistAggregateArgs>): Prisma.PrismaPromise<GetAlbumArtistAggregateType<T>>

    /**
     * Group by AlbumArtist.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AlbumArtistGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AlbumArtistGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AlbumArtistGroupByArgs['orderBy'] }
        : { orderBy?: AlbumArtistGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AlbumArtistGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAlbumArtistGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AlbumArtist model
   */
  readonly fields: AlbumArtistFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AlbumArtist.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AlbumArtistClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    album<T extends AlbumDefaultArgs<ExtArgs> = {}>(args?: Subset<T, AlbumDefaultArgs<ExtArgs>>): Prisma__AlbumClient<$Result.GetResult<Prisma.$AlbumPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    artist<T extends ArtistDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ArtistDefaultArgs<ExtArgs>>): Prisma__ArtistClient<$Result.GetResult<Prisma.$ArtistPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the AlbumArtist model
   */ 
  interface AlbumArtistFieldRefs {
    readonly albumId: FieldRef<"AlbumArtist", 'String'>
    readonly artistId: FieldRef<"AlbumArtist", 'String'>
  }
    

  // Custom InputTypes
  /**
   * AlbumArtist findUnique
   */
  export type AlbumArtistFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AlbumArtist
     */
    select?: AlbumArtistSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AlbumArtistInclude<ExtArgs> | null
    /**
     * Filter, which AlbumArtist to fetch.
     */
    where: AlbumArtistWhereUniqueInput
  }

  /**
   * AlbumArtist findUniqueOrThrow
   */
  export type AlbumArtistFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AlbumArtist
     */
    select?: AlbumArtistSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AlbumArtistInclude<ExtArgs> | null
    /**
     * Filter, which AlbumArtist to fetch.
     */
    where: AlbumArtistWhereUniqueInput
  }

  /**
   * AlbumArtist findFirst
   */
  export type AlbumArtistFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AlbumArtist
     */
    select?: AlbumArtistSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AlbumArtistInclude<ExtArgs> | null
    /**
     * Filter, which AlbumArtist to fetch.
     */
    where?: AlbumArtistWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AlbumArtists to fetch.
     */
    orderBy?: AlbumArtistOrderByWithRelationInput | AlbumArtistOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AlbumArtists.
     */
    cursor?: AlbumArtistWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AlbumArtists from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AlbumArtists.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AlbumArtists.
     */
    distinct?: AlbumArtistScalarFieldEnum | AlbumArtistScalarFieldEnum[]
  }

  /**
   * AlbumArtist findFirstOrThrow
   */
  export type AlbumArtistFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AlbumArtist
     */
    select?: AlbumArtistSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AlbumArtistInclude<ExtArgs> | null
    /**
     * Filter, which AlbumArtist to fetch.
     */
    where?: AlbumArtistWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AlbumArtists to fetch.
     */
    orderBy?: AlbumArtistOrderByWithRelationInput | AlbumArtistOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AlbumArtists.
     */
    cursor?: AlbumArtistWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AlbumArtists from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AlbumArtists.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AlbumArtists.
     */
    distinct?: AlbumArtistScalarFieldEnum | AlbumArtistScalarFieldEnum[]
  }

  /**
   * AlbumArtist findMany
   */
  export type AlbumArtistFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AlbumArtist
     */
    select?: AlbumArtistSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AlbumArtistInclude<ExtArgs> | null
    /**
     * Filter, which AlbumArtists to fetch.
     */
    where?: AlbumArtistWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AlbumArtists to fetch.
     */
    orderBy?: AlbumArtistOrderByWithRelationInput | AlbumArtistOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AlbumArtists.
     */
    cursor?: AlbumArtistWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AlbumArtists from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AlbumArtists.
     */
    skip?: number
    distinct?: AlbumArtistScalarFieldEnum | AlbumArtistScalarFieldEnum[]
  }

  /**
   * AlbumArtist create
   */
  export type AlbumArtistCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AlbumArtist
     */
    select?: AlbumArtistSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AlbumArtistInclude<ExtArgs> | null
    /**
     * The data needed to create a AlbumArtist.
     */
    data: XOR<AlbumArtistCreateInput, AlbumArtistUncheckedCreateInput>
  }

  /**
   * AlbumArtist createMany
   */
  export type AlbumArtistCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AlbumArtists.
     */
    data: AlbumArtistCreateManyInput | AlbumArtistCreateManyInput[]
  }

  /**
   * AlbumArtist createManyAndReturn
   */
  export type AlbumArtistCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AlbumArtist
     */
    select?: AlbumArtistSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many AlbumArtists.
     */
    data: AlbumArtistCreateManyInput | AlbumArtistCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AlbumArtistIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * AlbumArtist update
   */
  export type AlbumArtistUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AlbumArtist
     */
    select?: AlbumArtistSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AlbumArtistInclude<ExtArgs> | null
    /**
     * The data needed to update a AlbumArtist.
     */
    data: XOR<AlbumArtistUpdateInput, AlbumArtistUncheckedUpdateInput>
    /**
     * Choose, which AlbumArtist to update.
     */
    where: AlbumArtistWhereUniqueInput
  }

  /**
   * AlbumArtist updateMany
   */
  export type AlbumArtistUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AlbumArtists.
     */
    data: XOR<AlbumArtistUpdateManyMutationInput, AlbumArtistUncheckedUpdateManyInput>
    /**
     * Filter which AlbumArtists to update
     */
    where?: AlbumArtistWhereInput
  }

  /**
   * AlbumArtist upsert
   */
  export type AlbumArtistUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AlbumArtist
     */
    select?: AlbumArtistSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AlbumArtistInclude<ExtArgs> | null
    /**
     * The filter to search for the AlbumArtist to update in case it exists.
     */
    where: AlbumArtistWhereUniqueInput
    /**
     * In case the AlbumArtist found by the `where` argument doesn't exist, create a new AlbumArtist with this data.
     */
    create: XOR<AlbumArtistCreateInput, AlbumArtistUncheckedCreateInput>
    /**
     * In case the AlbumArtist was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AlbumArtistUpdateInput, AlbumArtistUncheckedUpdateInput>
  }

  /**
   * AlbumArtist delete
   */
  export type AlbumArtistDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AlbumArtist
     */
    select?: AlbumArtistSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AlbumArtistInclude<ExtArgs> | null
    /**
     * Filter which AlbumArtist to delete.
     */
    where: AlbumArtistWhereUniqueInput
  }

  /**
   * AlbumArtist deleteMany
   */
  export type AlbumArtistDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AlbumArtists to delete
     */
    where?: AlbumArtistWhereInput
  }

  /**
   * AlbumArtist without action
   */
  export type AlbumArtistDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AlbumArtist
     */
    select?: AlbumArtistSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AlbumArtistInclude<ExtArgs> | null
  }


  /**
   * Model TrackAudioResource
   */

  export type AggregateTrackAudioResource = {
    _count: TrackAudioResourceCountAggregateOutputType | null
    _avg: TrackAudioResourceAvgAggregateOutputType | null
    _sum: TrackAudioResourceSumAggregateOutputType | null
    _min: TrackAudioResourceMinAggregateOutputType | null
    _max: TrackAudioResourceMaxAggregateOutputType | null
  }

  export type TrackAudioResourceAvgAggregateOutputType = {
    bitrate: number | null
    size: number | null
  }

  export type TrackAudioResourceSumAggregateOutputType = {
    bitrate: number | null
    size: number | null
  }

  export type TrackAudioResourceMinAggregateOutputType = {
    id: string | null
    trackId: string | null
    quality: string | null
    format: string | null
    bitrate: number | null
    streamUrl: string | null
    size: number | null
    isPremiumOnly: boolean | null
    createdAt: Date | null
  }

  export type TrackAudioResourceMaxAggregateOutputType = {
    id: string | null
    trackId: string | null
    quality: string | null
    format: string | null
    bitrate: number | null
    streamUrl: string | null
    size: number | null
    isPremiumOnly: boolean | null
    createdAt: Date | null
  }

  export type TrackAudioResourceCountAggregateOutputType = {
    id: number
    trackId: number
    quality: number
    format: number
    bitrate: number
    streamUrl: number
    size: number
    isPremiumOnly: number
    createdAt: number
    _all: number
  }


  export type TrackAudioResourceAvgAggregateInputType = {
    bitrate?: true
    size?: true
  }

  export type TrackAudioResourceSumAggregateInputType = {
    bitrate?: true
    size?: true
  }

  export type TrackAudioResourceMinAggregateInputType = {
    id?: true
    trackId?: true
    quality?: true
    format?: true
    bitrate?: true
    streamUrl?: true
    size?: true
    isPremiumOnly?: true
    createdAt?: true
  }

  export type TrackAudioResourceMaxAggregateInputType = {
    id?: true
    trackId?: true
    quality?: true
    format?: true
    bitrate?: true
    streamUrl?: true
    size?: true
    isPremiumOnly?: true
    createdAt?: true
  }

  export type TrackAudioResourceCountAggregateInputType = {
    id?: true
    trackId?: true
    quality?: true
    format?: true
    bitrate?: true
    streamUrl?: true
    size?: true
    isPremiumOnly?: true
    createdAt?: true
    _all?: true
  }

  export type TrackAudioResourceAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TrackAudioResource to aggregate.
     */
    where?: TrackAudioResourceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TrackAudioResources to fetch.
     */
    orderBy?: TrackAudioResourceOrderByWithRelationInput | TrackAudioResourceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TrackAudioResourceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TrackAudioResources from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TrackAudioResources.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned TrackAudioResources
    **/
    _count?: true | TrackAudioResourceCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: TrackAudioResourceAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: TrackAudioResourceSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TrackAudioResourceMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TrackAudioResourceMaxAggregateInputType
  }

  export type GetTrackAudioResourceAggregateType<T extends TrackAudioResourceAggregateArgs> = {
        [P in keyof T & keyof AggregateTrackAudioResource]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTrackAudioResource[P]>
      : GetScalarType<T[P], AggregateTrackAudioResource[P]>
  }




  export type TrackAudioResourceGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TrackAudioResourceWhereInput
    orderBy?: TrackAudioResourceOrderByWithAggregationInput | TrackAudioResourceOrderByWithAggregationInput[]
    by: TrackAudioResourceScalarFieldEnum[] | TrackAudioResourceScalarFieldEnum
    having?: TrackAudioResourceScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TrackAudioResourceCountAggregateInputType | true
    _avg?: TrackAudioResourceAvgAggregateInputType
    _sum?: TrackAudioResourceSumAggregateInputType
    _min?: TrackAudioResourceMinAggregateInputType
    _max?: TrackAudioResourceMaxAggregateInputType
  }

  export type TrackAudioResourceGroupByOutputType = {
    id: string
    trackId: string
    quality: string
    format: string
    bitrate: number
    streamUrl: string
    size: number
    isPremiumOnly: boolean
    createdAt: Date
    _count: TrackAudioResourceCountAggregateOutputType | null
    _avg: TrackAudioResourceAvgAggregateOutputType | null
    _sum: TrackAudioResourceSumAggregateOutputType | null
    _min: TrackAudioResourceMinAggregateOutputType | null
    _max: TrackAudioResourceMaxAggregateOutputType | null
  }

  type GetTrackAudioResourceGroupByPayload<T extends TrackAudioResourceGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TrackAudioResourceGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TrackAudioResourceGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TrackAudioResourceGroupByOutputType[P]>
            : GetScalarType<T[P], TrackAudioResourceGroupByOutputType[P]>
        }
      >
    >


  export type TrackAudioResourceSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    trackId?: boolean
    quality?: boolean
    format?: boolean
    bitrate?: boolean
    streamUrl?: boolean
    size?: boolean
    isPremiumOnly?: boolean
    createdAt?: boolean
    track?: boolean | TrackDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["trackAudioResource"]>

  export type TrackAudioResourceSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    trackId?: boolean
    quality?: boolean
    format?: boolean
    bitrate?: boolean
    streamUrl?: boolean
    size?: boolean
    isPremiumOnly?: boolean
    createdAt?: boolean
    track?: boolean | TrackDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["trackAudioResource"]>

  export type TrackAudioResourceSelectScalar = {
    id?: boolean
    trackId?: boolean
    quality?: boolean
    format?: boolean
    bitrate?: boolean
    streamUrl?: boolean
    size?: boolean
    isPremiumOnly?: boolean
    createdAt?: boolean
  }

  export type TrackAudioResourceInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    track?: boolean | TrackDefaultArgs<ExtArgs>
  }
  export type TrackAudioResourceIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    track?: boolean | TrackDefaultArgs<ExtArgs>
  }

  export type $TrackAudioResourcePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "TrackAudioResource"
    objects: {
      track: Prisma.$TrackPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      trackId: string
      quality: string
      format: string
      bitrate: number
      streamUrl: string
      size: number
      isPremiumOnly: boolean
      createdAt: Date
    }, ExtArgs["result"]["trackAudioResource"]>
    composites: {}
  }

  type TrackAudioResourceGetPayload<S extends boolean | null | undefined | TrackAudioResourceDefaultArgs> = $Result.GetResult<Prisma.$TrackAudioResourcePayload, S>

  type TrackAudioResourceCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<TrackAudioResourceFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: TrackAudioResourceCountAggregateInputType | true
    }

  export interface TrackAudioResourceDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['TrackAudioResource'], meta: { name: 'TrackAudioResource' } }
    /**
     * Find zero or one TrackAudioResource that matches the filter.
     * @param {TrackAudioResourceFindUniqueArgs} args - Arguments to find a TrackAudioResource
     * @example
     * // Get one TrackAudioResource
     * const trackAudioResource = await prisma.trackAudioResource.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TrackAudioResourceFindUniqueArgs>(args: SelectSubset<T, TrackAudioResourceFindUniqueArgs<ExtArgs>>): Prisma__TrackAudioResourceClient<$Result.GetResult<Prisma.$TrackAudioResourcePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one TrackAudioResource that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {TrackAudioResourceFindUniqueOrThrowArgs} args - Arguments to find a TrackAudioResource
     * @example
     * // Get one TrackAudioResource
     * const trackAudioResource = await prisma.trackAudioResource.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TrackAudioResourceFindUniqueOrThrowArgs>(args: SelectSubset<T, TrackAudioResourceFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TrackAudioResourceClient<$Result.GetResult<Prisma.$TrackAudioResourcePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first TrackAudioResource that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrackAudioResourceFindFirstArgs} args - Arguments to find a TrackAudioResource
     * @example
     * // Get one TrackAudioResource
     * const trackAudioResource = await prisma.trackAudioResource.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TrackAudioResourceFindFirstArgs>(args?: SelectSubset<T, TrackAudioResourceFindFirstArgs<ExtArgs>>): Prisma__TrackAudioResourceClient<$Result.GetResult<Prisma.$TrackAudioResourcePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first TrackAudioResource that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrackAudioResourceFindFirstOrThrowArgs} args - Arguments to find a TrackAudioResource
     * @example
     * // Get one TrackAudioResource
     * const trackAudioResource = await prisma.trackAudioResource.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TrackAudioResourceFindFirstOrThrowArgs>(args?: SelectSubset<T, TrackAudioResourceFindFirstOrThrowArgs<ExtArgs>>): Prisma__TrackAudioResourceClient<$Result.GetResult<Prisma.$TrackAudioResourcePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more TrackAudioResources that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrackAudioResourceFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all TrackAudioResources
     * const trackAudioResources = await prisma.trackAudioResource.findMany()
     * 
     * // Get first 10 TrackAudioResources
     * const trackAudioResources = await prisma.trackAudioResource.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const trackAudioResourceWithIdOnly = await prisma.trackAudioResource.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TrackAudioResourceFindManyArgs>(args?: SelectSubset<T, TrackAudioResourceFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TrackAudioResourcePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a TrackAudioResource.
     * @param {TrackAudioResourceCreateArgs} args - Arguments to create a TrackAudioResource.
     * @example
     * // Create one TrackAudioResource
     * const TrackAudioResource = await prisma.trackAudioResource.create({
     *   data: {
     *     // ... data to create a TrackAudioResource
     *   }
     * })
     * 
     */
    create<T extends TrackAudioResourceCreateArgs>(args: SelectSubset<T, TrackAudioResourceCreateArgs<ExtArgs>>): Prisma__TrackAudioResourceClient<$Result.GetResult<Prisma.$TrackAudioResourcePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many TrackAudioResources.
     * @param {TrackAudioResourceCreateManyArgs} args - Arguments to create many TrackAudioResources.
     * @example
     * // Create many TrackAudioResources
     * const trackAudioResource = await prisma.trackAudioResource.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TrackAudioResourceCreateManyArgs>(args?: SelectSubset<T, TrackAudioResourceCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many TrackAudioResources and returns the data saved in the database.
     * @param {TrackAudioResourceCreateManyAndReturnArgs} args - Arguments to create many TrackAudioResources.
     * @example
     * // Create many TrackAudioResources
     * const trackAudioResource = await prisma.trackAudioResource.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many TrackAudioResources and only return the `id`
     * const trackAudioResourceWithIdOnly = await prisma.trackAudioResource.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TrackAudioResourceCreateManyAndReturnArgs>(args?: SelectSubset<T, TrackAudioResourceCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TrackAudioResourcePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a TrackAudioResource.
     * @param {TrackAudioResourceDeleteArgs} args - Arguments to delete one TrackAudioResource.
     * @example
     * // Delete one TrackAudioResource
     * const TrackAudioResource = await prisma.trackAudioResource.delete({
     *   where: {
     *     // ... filter to delete one TrackAudioResource
     *   }
     * })
     * 
     */
    delete<T extends TrackAudioResourceDeleteArgs>(args: SelectSubset<T, TrackAudioResourceDeleteArgs<ExtArgs>>): Prisma__TrackAudioResourceClient<$Result.GetResult<Prisma.$TrackAudioResourcePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one TrackAudioResource.
     * @param {TrackAudioResourceUpdateArgs} args - Arguments to update one TrackAudioResource.
     * @example
     * // Update one TrackAudioResource
     * const trackAudioResource = await prisma.trackAudioResource.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TrackAudioResourceUpdateArgs>(args: SelectSubset<T, TrackAudioResourceUpdateArgs<ExtArgs>>): Prisma__TrackAudioResourceClient<$Result.GetResult<Prisma.$TrackAudioResourcePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more TrackAudioResources.
     * @param {TrackAudioResourceDeleteManyArgs} args - Arguments to filter TrackAudioResources to delete.
     * @example
     * // Delete a few TrackAudioResources
     * const { count } = await prisma.trackAudioResource.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TrackAudioResourceDeleteManyArgs>(args?: SelectSubset<T, TrackAudioResourceDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TrackAudioResources.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrackAudioResourceUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many TrackAudioResources
     * const trackAudioResource = await prisma.trackAudioResource.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TrackAudioResourceUpdateManyArgs>(args: SelectSubset<T, TrackAudioResourceUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one TrackAudioResource.
     * @param {TrackAudioResourceUpsertArgs} args - Arguments to update or create a TrackAudioResource.
     * @example
     * // Update or create a TrackAudioResource
     * const trackAudioResource = await prisma.trackAudioResource.upsert({
     *   create: {
     *     // ... data to create a TrackAudioResource
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the TrackAudioResource we want to update
     *   }
     * })
     */
    upsert<T extends TrackAudioResourceUpsertArgs>(args: SelectSubset<T, TrackAudioResourceUpsertArgs<ExtArgs>>): Prisma__TrackAudioResourceClient<$Result.GetResult<Prisma.$TrackAudioResourcePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of TrackAudioResources.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrackAudioResourceCountArgs} args - Arguments to filter TrackAudioResources to count.
     * @example
     * // Count the number of TrackAudioResources
     * const count = await prisma.trackAudioResource.count({
     *   where: {
     *     // ... the filter for the TrackAudioResources we want to count
     *   }
     * })
    **/
    count<T extends TrackAudioResourceCountArgs>(
      args?: Subset<T, TrackAudioResourceCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TrackAudioResourceCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a TrackAudioResource.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrackAudioResourceAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TrackAudioResourceAggregateArgs>(args: Subset<T, TrackAudioResourceAggregateArgs>): Prisma.PrismaPromise<GetTrackAudioResourceAggregateType<T>>

    /**
     * Group by TrackAudioResource.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrackAudioResourceGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TrackAudioResourceGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TrackAudioResourceGroupByArgs['orderBy'] }
        : { orderBy?: TrackAudioResourceGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TrackAudioResourceGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTrackAudioResourceGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the TrackAudioResource model
   */
  readonly fields: TrackAudioResourceFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for TrackAudioResource.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TrackAudioResourceClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    track<T extends TrackDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TrackDefaultArgs<ExtArgs>>): Prisma__TrackClient<$Result.GetResult<Prisma.$TrackPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the TrackAudioResource model
   */ 
  interface TrackAudioResourceFieldRefs {
    readonly id: FieldRef<"TrackAudioResource", 'String'>
    readonly trackId: FieldRef<"TrackAudioResource", 'String'>
    readonly quality: FieldRef<"TrackAudioResource", 'String'>
    readonly format: FieldRef<"TrackAudioResource", 'String'>
    readonly bitrate: FieldRef<"TrackAudioResource", 'Int'>
    readonly streamUrl: FieldRef<"TrackAudioResource", 'String'>
    readonly size: FieldRef<"TrackAudioResource", 'Int'>
    readonly isPremiumOnly: FieldRef<"TrackAudioResource", 'Boolean'>
    readonly createdAt: FieldRef<"TrackAudioResource", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * TrackAudioResource findUnique
   */
  export type TrackAudioResourceFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrackAudioResource
     */
    select?: TrackAudioResourceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrackAudioResourceInclude<ExtArgs> | null
    /**
     * Filter, which TrackAudioResource to fetch.
     */
    where: TrackAudioResourceWhereUniqueInput
  }

  /**
   * TrackAudioResource findUniqueOrThrow
   */
  export type TrackAudioResourceFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrackAudioResource
     */
    select?: TrackAudioResourceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrackAudioResourceInclude<ExtArgs> | null
    /**
     * Filter, which TrackAudioResource to fetch.
     */
    where: TrackAudioResourceWhereUniqueInput
  }

  /**
   * TrackAudioResource findFirst
   */
  export type TrackAudioResourceFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrackAudioResource
     */
    select?: TrackAudioResourceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrackAudioResourceInclude<ExtArgs> | null
    /**
     * Filter, which TrackAudioResource to fetch.
     */
    where?: TrackAudioResourceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TrackAudioResources to fetch.
     */
    orderBy?: TrackAudioResourceOrderByWithRelationInput | TrackAudioResourceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TrackAudioResources.
     */
    cursor?: TrackAudioResourceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TrackAudioResources from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TrackAudioResources.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TrackAudioResources.
     */
    distinct?: TrackAudioResourceScalarFieldEnum | TrackAudioResourceScalarFieldEnum[]
  }

  /**
   * TrackAudioResource findFirstOrThrow
   */
  export type TrackAudioResourceFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrackAudioResource
     */
    select?: TrackAudioResourceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrackAudioResourceInclude<ExtArgs> | null
    /**
     * Filter, which TrackAudioResource to fetch.
     */
    where?: TrackAudioResourceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TrackAudioResources to fetch.
     */
    orderBy?: TrackAudioResourceOrderByWithRelationInput | TrackAudioResourceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TrackAudioResources.
     */
    cursor?: TrackAudioResourceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TrackAudioResources from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TrackAudioResources.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TrackAudioResources.
     */
    distinct?: TrackAudioResourceScalarFieldEnum | TrackAudioResourceScalarFieldEnum[]
  }

  /**
   * TrackAudioResource findMany
   */
  export type TrackAudioResourceFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrackAudioResource
     */
    select?: TrackAudioResourceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrackAudioResourceInclude<ExtArgs> | null
    /**
     * Filter, which TrackAudioResources to fetch.
     */
    where?: TrackAudioResourceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TrackAudioResources to fetch.
     */
    orderBy?: TrackAudioResourceOrderByWithRelationInput | TrackAudioResourceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing TrackAudioResources.
     */
    cursor?: TrackAudioResourceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TrackAudioResources from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TrackAudioResources.
     */
    skip?: number
    distinct?: TrackAudioResourceScalarFieldEnum | TrackAudioResourceScalarFieldEnum[]
  }

  /**
   * TrackAudioResource create
   */
  export type TrackAudioResourceCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrackAudioResource
     */
    select?: TrackAudioResourceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrackAudioResourceInclude<ExtArgs> | null
    /**
     * The data needed to create a TrackAudioResource.
     */
    data: XOR<TrackAudioResourceCreateInput, TrackAudioResourceUncheckedCreateInput>
  }

  /**
   * TrackAudioResource createMany
   */
  export type TrackAudioResourceCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many TrackAudioResources.
     */
    data: TrackAudioResourceCreateManyInput | TrackAudioResourceCreateManyInput[]
  }

  /**
   * TrackAudioResource createManyAndReturn
   */
  export type TrackAudioResourceCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrackAudioResource
     */
    select?: TrackAudioResourceSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many TrackAudioResources.
     */
    data: TrackAudioResourceCreateManyInput | TrackAudioResourceCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrackAudioResourceIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * TrackAudioResource update
   */
  export type TrackAudioResourceUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrackAudioResource
     */
    select?: TrackAudioResourceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrackAudioResourceInclude<ExtArgs> | null
    /**
     * The data needed to update a TrackAudioResource.
     */
    data: XOR<TrackAudioResourceUpdateInput, TrackAudioResourceUncheckedUpdateInput>
    /**
     * Choose, which TrackAudioResource to update.
     */
    where: TrackAudioResourceWhereUniqueInput
  }

  /**
   * TrackAudioResource updateMany
   */
  export type TrackAudioResourceUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update TrackAudioResources.
     */
    data: XOR<TrackAudioResourceUpdateManyMutationInput, TrackAudioResourceUncheckedUpdateManyInput>
    /**
     * Filter which TrackAudioResources to update
     */
    where?: TrackAudioResourceWhereInput
  }

  /**
   * TrackAudioResource upsert
   */
  export type TrackAudioResourceUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrackAudioResource
     */
    select?: TrackAudioResourceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrackAudioResourceInclude<ExtArgs> | null
    /**
     * The filter to search for the TrackAudioResource to update in case it exists.
     */
    where: TrackAudioResourceWhereUniqueInput
    /**
     * In case the TrackAudioResource found by the `where` argument doesn't exist, create a new TrackAudioResource with this data.
     */
    create: XOR<TrackAudioResourceCreateInput, TrackAudioResourceUncheckedCreateInput>
    /**
     * In case the TrackAudioResource was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TrackAudioResourceUpdateInput, TrackAudioResourceUncheckedUpdateInput>
  }

  /**
   * TrackAudioResource delete
   */
  export type TrackAudioResourceDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrackAudioResource
     */
    select?: TrackAudioResourceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrackAudioResourceInclude<ExtArgs> | null
    /**
     * Filter which TrackAudioResource to delete.
     */
    where: TrackAudioResourceWhereUniqueInput
  }

  /**
   * TrackAudioResource deleteMany
   */
  export type TrackAudioResourceDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TrackAudioResources to delete
     */
    where?: TrackAudioResourceWhereInput
  }

  /**
   * TrackAudioResource without action
   */
  export type TrackAudioResourceDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrackAudioResource
     */
    select?: TrackAudioResourceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrackAudioResourceInclude<ExtArgs> | null
  }


  /**
   * Model Genre
   */

  export type AggregateGenre = {
    _count: GenreCountAggregateOutputType | null
    _min: GenreMinAggregateOutputType | null
    _max: GenreMaxAggregateOutputType | null
  }

  export type GenreMinAggregateOutputType = {
    id: string | null
    name: string | null
    createdAt: Date | null
  }

  export type GenreMaxAggregateOutputType = {
    id: string | null
    name: string | null
    createdAt: Date | null
  }

  export type GenreCountAggregateOutputType = {
    id: number
    name: number
    createdAt: number
    _all: number
  }


  export type GenreMinAggregateInputType = {
    id?: true
    name?: true
    createdAt?: true
  }

  export type GenreMaxAggregateInputType = {
    id?: true
    name?: true
    createdAt?: true
  }

  export type GenreCountAggregateInputType = {
    id?: true
    name?: true
    createdAt?: true
    _all?: true
  }

  export type GenreAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Genre to aggregate.
     */
    where?: GenreWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Genres to fetch.
     */
    orderBy?: GenreOrderByWithRelationInput | GenreOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: GenreWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Genres from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Genres.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Genres
    **/
    _count?: true | GenreCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: GenreMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: GenreMaxAggregateInputType
  }

  export type GetGenreAggregateType<T extends GenreAggregateArgs> = {
        [P in keyof T & keyof AggregateGenre]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateGenre[P]>
      : GetScalarType<T[P], AggregateGenre[P]>
  }




  export type GenreGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: GenreWhereInput
    orderBy?: GenreOrderByWithAggregationInput | GenreOrderByWithAggregationInput[]
    by: GenreScalarFieldEnum[] | GenreScalarFieldEnum
    having?: GenreScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: GenreCountAggregateInputType | true
    _min?: GenreMinAggregateInputType
    _max?: GenreMaxAggregateInputType
  }

  export type GenreGroupByOutputType = {
    id: string
    name: string
    createdAt: Date
    _count: GenreCountAggregateOutputType | null
    _min: GenreMinAggregateOutputType | null
    _max: GenreMaxAggregateOutputType | null
  }

  type GetGenreGroupByPayload<T extends GenreGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<GenreGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof GenreGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], GenreGroupByOutputType[P]>
            : GetScalarType<T[P], GenreGroupByOutputType[P]>
        }
      >
    >


  export type GenreSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    createdAt?: boolean
    tracks?: boolean | Genre$tracksArgs<ExtArgs>
    _count?: boolean | GenreCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["genre"]>

  export type GenreSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["genre"]>

  export type GenreSelectScalar = {
    id?: boolean
    name?: boolean
    createdAt?: boolean
  }

  export type GenreInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tracks?: boolean | Genre$tracksArgs<ExtArgs>
    _count?: boolean | GenreCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type GenreIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $GenrePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Genre"
    objects: {
      tracks: Prisma.$TrackGenrePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      createdAt: Date
    }, ExtArgs["result"]["genre"]>
    composites: {}
  }

  type GenreGetPayload<S extends boolean | null | undefined | GenreDefaultArgs> = $Result.GetResult<Prisma.$GenrePayload, S>

  type GenreCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<GenreFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: GenreCountAggregateInputType | true
    }

  export interface GenreDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Genre'], meta: { name: 'Genre' } }
    /**
     * Find zero or one Genre that matches the filter.
     * @param {GenreFindUniqueArgs} args - Arguments to find a Genre
     * @example
     * // Get one Genre
     * const genre = await prisma.genre.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends GenreFindUniqueArgs>(args: SelectSubset<T, GenreFindUniqueArgs<ExtArgs>>): Prisma__GenreClient<$Result.GetResult<Prisma.$GenrePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Genre that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {GenreFindUniqueOrThrowArgs} args - Arguments to find a Genre
     * @example
     * // Get one Genre
     * const genre = await prisma.genre.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends GenreFindUniqueOrThrowArgs>(args: SelectSubset<T, GenreFindUniqueOrThrowArgs<ExtArgs>>): Prisma__GenreClient<$Result.GetResult<Prisma.$GenrePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Genre that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GenreFindFirstArgs} args - Arguments to find a Genre
     * @example
     * // Get one Genre
     * const genre = await prisma.genre.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends GenreFindFirstArgs>(args?: SelectSubset<T, GenreFindFirstArgs<ExtArgs>>): Prisma__GenreClient<$Result.GetResult<Prisma.$GenrePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Genre that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GenreFindFirstOrThrowArgs} args - Arguments to find a Genre
     * @example
     * // Get one Genre
     * const genre = await prisma.genre.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends GenreFindFirstOrThrowArgs>(args?: SelectSubset<T, GenreFindFirstOrThrowArgs<ExtArgs>>): Prisma__GenreClient<$Result.GetResult<Prisma.$GenrePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Genres that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GenreFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Genres
     * const genres = await prisma.genre.findMany()
     * 
     * // Get first 10 Genres
     * const genres = await prisma.genre.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const genreWithIdOnly = await prisma.genre.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends GenreFindManyArgs>(args?: SelectSubset<T, GenreFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GenrePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Genre.
     * @param {GenreCreateArgs} args - Arguments to create a Genre.
     * @example
     * // Create one Genre
     * const Genre = await prisma.genre.create({
     *   data: {
     *     // ... data to create a Genre
     *   }
     * })
     * 
     */
    create<T extends GenreCreateArgs>(args: SelectSubset<T, GenreCreateArgs<ExtArgs>>): Prisma__GenreClient<$Result.GetResult<Prisma.$GenrePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Genres.
     * @param {GenreCreateManyArgs} args - Arguments to create many Genres.
     * @example
     * // Create many Genres
     * const genre = await prisma.genre.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends GenreCreateManyArgs>(args?: SelectSubset<T, GenreCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Genres and returns the data saved in the database.
     * @param {GenreCreateManyAndReturnArgs} args - Arguments to create many Genres.
     * @example
     * // Create many Genres
     * const genre = await prisma.genre.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Genres and only return the `id`
     * const genreWithIdOnly = await prisma.genre.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends GenreCreateManyAndReturnArgs>(args?: SelectSubset<T, GenreCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GenrePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Genre.
     * @param {GenreDeleteArgs} args - Arguments to delete one Genre.
     * @example
     * // Delete one Genre
     * const Genre = await prisma.genre.delete({
     *   where: {
     *     // ... filter to delete one Genre
     *   }
     * })
     * 
     */
    delete<T extends GenreDeleteArgs>(args: SelectSubset<T, GenreDeleteArgs<ExtArgs>>): Prisma__GenreClient<$Result.GetResult<Prisma.$GenrePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Genre.
     * @param {GenreUpdateArgs} args - Arguments to update one Genre.
     * @example
     * // Update one Genre
     * const genre = await prisma.genre.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends GenreUpdateArgs>(args: SelectSubset<T, GenreUpdateArgs<ExtArgs>>): Prisma__GenreClient<$Result.GetResult<Prisma.$GenrePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Genres.
     * @param {GenreDeleteManyArgs} args - Arguments to filter Genres to delete.
     * @example
     * // Delete a few Genres
     * const { count } = await prisma.genre.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends GenreDeleteManyArgs>(args?: SelectSubset<T, GenreDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Genres.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GenreUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Genres
     * const genre = await prisma.genre.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends GenreUpdateManyArgs>(args: SelectSubset<T, GenreUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Genre.
     * @param {GenreUpsertArgs} args - Arguments to update or create a Genre.
     * @example
     * // Update or create a Genre
     * const genre = await prisma.genre.upsert({
     *   create: {
     *     // ... data to create a Genre
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Genre we want to update
     *   }
     * })
     */
    upsert<T extends GenreUpsertArgs>(args: SelectSubset<T, GenreUpsertArgs<ExtArgs>>): Prisma__GenreClient<$Result.GetResult<Prisma.$GenrePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Genres.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GenreCountArgs} args - Arguments to filter Genres to count.
     * @example
     * // Count the number of Genres
     * const count = await prisma.genre.count({
     *   where: {
     *     // ... the filter for the Genres we want to count
     *   }
     * })
    **/
    count<T extends GenreCountArgs>(
      args?: Subset<T, GenreCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], GenreCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Genre.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GenreAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends GenreAggregateArgs>(args: Subset<T, GenreAggregateArgs>): Prisma.PrismaPromise<GetGenreAggregateType<T>>

    /**
     * Group by Genre.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GenreGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends GenreGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: GenreGroupByArgs['orderBy'] }
        : { orderBy?: GenreGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, GenreGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetGenreGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Genre model
   */
  readonly fields: GenreFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Genre.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__GenreClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    tracks<T extends Genre$tracksArgs<ExtArgs> = {}>(args?: Subset<T, Genre$tracksArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TrackGenrePayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Genre model
   */ 
  interface GenreFieldRefs {
    readonly id: FieldRef<"Genre", 'String'>
    readonly name: FieldRef<"Genre", 'String'>
    readonly createdAt: FieldRef<"Genre", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Genre findUnique
   */
  export type GenreFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Genre
     */
    select?: GenreSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GenreInclude<ExtArgs> | null
    /**
     * Filter, which Genre to fetch.
     */
    where: GenreWhereUniqueInput
  }

  /**
   * Genre findUniqueOrThrow
   */
  export type GenreFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Genre
     */
    select?: GenreSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GenreInclude<ExtArgs> | null
    /**
     * Filter, which Genre to fetch.
     */
    where: GenreWhereUniqueInput
  }

  /**
   * Genre findFirst
   */
  export type GenreFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Genre
     */
    select?: GenreSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GenreInclude<ExtArgs> | null
    /**
     * Filter, which Genre to fetch.
     */
    where?: GenreWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Genres to fetch.
     */
    orderBy?: GenreOrderByWithRelationInput | GenreOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Genres.
     */
    cursor?: GenreWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Genres from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Genres.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Genres.
     */
    distinct?: GenreScalarFieldEnum | GenreScalarFieldEnum[]
  }

  /**
   * Genre findFirstOrThrow
   */
  export type GenreFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Genre
     */
    select?: GenreSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GenreInclude<ExtArgs> | null
    /**
     * Filter, which Genre to fetch.
     */
    where?: GenreWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Genres to fetch.
     */
    orderBy?: GenreOrderByWithRelationInput | GenreOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Genres.
     */
    cursor?: GenreWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Genres from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Genres.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Genres.
     */
    distinct?: GenreScalarFieldEnum | GenreScalarFieldEnum[]
  }

  /**
   * Genre findMany
   */
  export type GenreFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Genre
     */
    select?: GenreSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GenreInclude<ExtArgs> | null
    /**
     * Filter, which Genres to fetch.
     */
    where?: GenreWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Genres to fetch.
     */
    orderBy?: GenreOrderByWithRelationInput | GenreOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Genres.
     */
    cursor?: GenreWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Genres from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Genres.
     */
    skip?: number
    distinct?: GenreScalarFieldEnum | GenreScalarFieldEnum[]
  }

  /**
   * Genre create
   */
  export type GenreCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Genre
     */
    select?: GenreSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GenreInclude<ExtArgs> | null
    /**
     * The data needed to create a Genre.
     */
    data: XOR<GenreCreateInput, GenreUncheckedCreateInput>
  }

  /**
   * Genre createMany
   */
  export type GenreCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Genres.
     */
    data: GenreCreateManyInput | GenreCreateManyInput[]
  }

  /**
   * Genre createManyAndReturn
   */
  export type GenreCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Genre
     */
    select?: GenreSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Genres.
     */
    data: GenreCreateManyInput | GenreCreateManyInput[]
  }

  /**
   * Genre update
   */
  export type GenreUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Genre
     */
    select?: GenreSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GenreInclude<ExtArgs> | null
    /**
     * The data needed to update a Genre.
     */
    data: XOR<GenreUpdateInput, GenreUncheckedUpdateInput>
    /**
     * Choose, which Genre to update.
     */
    where: GenreWhereUniqueInput
  }

  /**
   * Genre updateMany
   */
  export type GenreUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Genres.
     */
    data: XOR<GenreUpdateManyMutationInput, GenreUncheckedUpdateManyInput>
    /**
     * Filter which Genres to update
     */
    where?: GenreWhereInput
  }

  /**
   * Genre upsert
   */
  export type GenreUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Genre
     */
    select?: GenreSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GenreInclude<ExtArgs> | null
    /**
     * The filter to search for the Genre to update in case it exists.
     */
    where: GenreWhereUniqueInput
    /**
     * In case the Genre found by the `where` argument doesn't exist, create a new Genre with this data.
     */
    create: XOR<GenreCreateInput, GenreUncheckedCreateInput>
    /**
     * In case the Genre was found with the provided `where` argument, update it with this data.
     */
    update: XOR<GenreUpdateInput, GenreUncheckedUpdateInput>
  }

  /**
   * Genre delete
   */
  export type GenreDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Genre
     */
    select?: GenreSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GenreInclude<ExtArgs> | null
    /**
     * Filter which Genre to delete.
     */
    where: GenreWhereUniqueInput
  }

  /**
   * Genre deleteMany
   */
  export type GenreDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Genres to delete
     */
    where?: GenreWhereInput
  }

  /**
   * Genre.tracks
   */
  export type Genre$tracksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrackGenre
     */
    select?: TrackGenreSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrackGenreInclude<ExtArgs> | null
    where?: TrackGenreWhereInput
    orderBy?: TrackGenreOrderByWithRelationInput | TrackGenreOrderByWithRelationInput[]
    cursor?: TrackGenreWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TrackGenreScalarFieldEnum | TrackGenreScalarFieldEnum[]
  }

  /**
   * Genre without action
   */
  export type GenreDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Genre
     */
    select?: GenreSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GenreInclude<ExtArgs> | null
  }


  /**
   * Model TrackGenre
   */

  export type AggregateTrackGenre = {
    _count: TrackGenreCountAggregateOutputType | null
    _min: TrackGenreMinAggregateOutputType | null
    _max: TrackGenreMaxAggregateOutputType | null
  }

  export type TrackGenreMinAggregateOutputType = {
    trackId: string | null
    genreId: string | null
  }

  export type TrackGenreMaxAggregateOutputType = {
    trackId: string | null
    genreId: string | null
  }

  export type TrackGenreCountAggregateOutputType = {
    trackId: number
    genreId: number
    _all: number
  }


  export type TrackGenreMinAggregateInputType = {
    trackId?: true
    genreId?: true
  }

  export type TrackGenreMaxAggregateInputType = {
    trackId?: true
    genreId?: true
  }

  export type TrackGenreCountAggregateInputType = {
    trackId?: true
    genreId?: true
    _all?: true
  }

  export type TrackGenreAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TrackGenre to aggregate.
     */
    where?: TrackGenreWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TrackGenres to fetch.
     */
    orderBy?: TrackGenreOrderByWithRelationInput | TrackGenreOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TrackGenreWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TrackGenres from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TrackGenres.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned TrackGenres
    **/
    _count?: true | TrackGenreCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TrackGenreMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TrackGenreMaxAggregateInputType
  }

  export type GetTrackGenreAggregateType<T extends TrackGenreAggregateArgs> = {
        [P in keyof T & keyof AggregateTrackGenre]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTrackGenre[P]>
      : GetScalarType<T[P], AggregateTrackGenre[P]>
  }




  export type TrackGenreGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TrackGenreWhereInput
    orderBy?: TrackGenreOrderByWithAggregationInput | TrackGenreOrderByWithAggregationInput[]
    by: TrackGenreScalarFieldEnum[] | TrackGenreScalarFieldEnum
    having?: TrackGenreScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TrackGenreCountAggregateInputType | true
    _min?: TrackGenreMinAggregateInputType
    _max?: TrackGenreMaxAggregateInputType
  }

  export type TrackGenreGroupByOutputType = {
    trackId: string
    genreId: string
    _count: TrackGenreCountAggregateOutputType | null
    _min: TrackGenreMinAggregateOutputType | null
    _max: TrackGenreMaxAggregateOutputType | null
  }

  type GetTrackGenreGroupByPayload<T extends TrackGenreGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TrackGenreGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TrackGenreGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TrackGenreGroupByOutputType[P]>
            : GetScalarType<T[P], TrackGenreGroupByOutputType[P]>
        }
      >
    >


  export type TrackGenreSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    trackId?: boolean
    genreId?: boolean
    track?: boolean | TrackDefaultArgs<ExtArgs>
    genre?: boolean | GenreDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["trackGenre"]>

  export type TrackGenreSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    trackId?: boolean
    genreId?: boolean
    track?: boolean | TrackDefaultArgs<ExtArgs>
    genre?: boolean | GenreDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["trackGenre"]>

  export type TrackGenreSelectScalar = {
    trackId?: boolean
    genreId?: boolean
  }

  export type TrackGenreInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    track?: boolean | TrackDefaultArgs<ExtArgs>
    genre?: boolean | GenreDefaultArgs<ExtArgs>
  }
  export type TrackGenreIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    track?: boolean | TrackDefaultArgs<ExtArgs>
    genre?: boolean | GenreDefaultArgs<ExtArgs>
  }

  export type $TrackGenrePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "TrackGenre"
    objects: {
      track: Prisma.$TrackPayload<ExtArgs>
      genre: Prisma.$GenrePayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      trackId: string
      genreId: string
    }, ExtArgs["result"]["trackGenre"]>
    composites: {}
  }

  type TrackGenreGetPayload<S extends boolean | null | undefined | TrackGenreDefaultArgs> = $Result.GetResult<Prisma.$TrackGenrePayload, S>

  type TrackGenreCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<TrackGenreFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: TrackGenreCountAggregateInputType | true
    }

  export interface TrackGenreDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['TrackGenre'], meta: { name: 'TrackGenre' } }
    /**
     * Find zero or one TrackGenre that matches the filter.
     * @param {TrackGenreFindUniqueArgs} args - Arguments to find a TrackGenre
     * @example
     * // Get one TrackGenre
     * const trackGenre = await prisma.trackGenre.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TrackGenreFindUniqueArgs>(args: SelectSubset<T, TrackGenreFindUniqueArgs<ExtArgs>>): Prisma__TrackGenreClient<$Result.GetResult<Prisma.$TrackGenrePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one TrackGenre that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {TrackGenreFindUniqueOrThrowArgs} args - Arguments to find a TrackGenre
     * @example
     * // Get one TrackGenre
     * const trackGenre = await prisma.trackGenre.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TrackGenreFindUniqueOrThrowArgs>(args: SelectSubset<T, TrackGenreFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TrackGenreClient<$Result.GetResult<Prisma.$TrackGenrePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first TrackGenre that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrackGenreFindFirstArgs} args - Arguments to find a TrackGenre
     * @example
     * // Get one TrackGenre
     * const trackGenre = await prisma.trackGenre.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TrackGenreFindFirstArgs>(args?: SelectSubset<T, TrackGenreFindFirstArgs<ExtArgs>>): Prisma__TrackGenreClient<$Result.GetResult<Prisma.$TrackGenrePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first TrackGenre that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrackGenreFindFirstOrThrowArgs} args - Arguments to find a TrackGenre
     * @example
     * // Get one TrackGenre
     * const trackGenre = await prisma.trackGenre.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TrackGenreFindFirstOrThrowArgs>(args?: SelectSubset<T, TrackGenreFindFirstOrThrowArgs<ExtArgs>>): Prisma__TrackGenreClient<$Result.GetResult<Prisma.$TrackGenrePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more TrackGenres that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrackGenreFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all TrackGenres
     * const trackGenres = await prisma.trackGenre.findMany()
     * 
     * // Get first 10 TrackGenres
     * const trackGenres = await prisma.trackGenre.findMany({ take: 10 })
     * 
     * // Only select the `trackId`
     * const trackGenreWithTrackIdOnly = await prisma.trackGenre.findMany({ select: { trackId: true } })
     * 
     */
    findMany<T extends TrackGenreFindManyArgs>(args?: SelectSubset<T, TrackGenreFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TrackGenrePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a TrackGenre.
     * @param {TrackGenreCreateArgs} args - Arguments to create a TrackGenre.
     * @example
     * // Create one TrackGenre
     * const TrackGenre = await prisma.trackGenre.create({
     *   data: {
     *     // ... data to create a TrackGenre
     *   }
     * })
     * 
     */
    create<T extends TrackGenreCreateArgs>(args: SelectSubset<T, TrackGenreCreateArgs<ExtArgs>>): Prisma__TrackGenreClient<$Result.GetResult<Prisma.$TrackGenrePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many TrackGenres.
     * @param {TrackGenreCreateManyArgs} args - Arguments to create many TrackGenres.
     * @example
     * // Create many TrackGenres
     * const trackGenre = await prisma.trackGenre.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TrackGenreCreateManyArgs>(args?: SelectSubset<T, TrackGenreCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many TrackGenres and returns the data saved in the database.
     * @param {TrackGenreCreateManyAndReturnArgs} args - Arguments to create many TrackGenres.
     * @example
     * // Create many TrackGenres
     * const trackGenre = await prisma.trackGenre.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many TrackGenres and only return the `trackId`
     * const trackGenreWithTrackIdOnly = await prisma.trackGenre.createManyAndReturn({ 
     *   select: { trackId: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TrackGenreCreateManyAndReturnArgs>(args?: SelectSubset<T, TrackGenreCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TrackGenrePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a TrackGenre.
     * @param {TrackGenreDeleteArgs} args - Arguments to delete one TrackGenre.
     * @example
     * // Delete one TrackGenre
     * const TrackGenre = await prisma.trackGenre.delete({
     *   where: {
     *     // ... filter to delete one TrackGenre
     *   }
     * })
     * 
     */
    delete<T extends TrackGenreDeleteArgs>(args: SelectSubset<T, TrackGenreDeleteArgs<ExtArgs>>): Prisma__TrackGenreClient<$Result.GetResult<Prisma.$TrackGenrePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one TrackGenre.
     * @param {TrackGenreUpdateArgs} args - Arguments to update one TrackGenre.
     * @example
     * // Update one TrackGenre
     * const trackGenre = await prisma.trackGenre.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TrackGenreUpdateArgs>(args: SelectSubset<T, TrackGenreUpdateArgs<ExtArgs>>): Prisma__TrackGenreClient<$Result.GetResult<Prisma.$TrackGenrePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more TrackGenres.
     * @param {TrackGenreDeleteManyArgs} args - Arguments to filter TrackGenres to delete.
     * @example
     * // Delete a few TrackGenres
     * const { count } = await prisma.trackGenre.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TrackGenreDeleteManyArgs>(args?: SelectSubset<T, TrackGenreDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TrackGenres.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrackGenreUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many TrackGenres
     * const trackGenre = await prisma.trackGenre.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TrackGenreUpdateManyArgs>(args: SelectSubset<T, TrackGenreUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one TrackGenre.
     * @param {TrackGenreUpsertArgs} args - Arguments to update or create a TrackGenre.
     * @example
     * // Update or create a TrackGenre
     * const trackGenre = await prisma.trackGenre.upsert({
     *   create: {
     *     // ... data to create a TrackGenre
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the TrackGenre we want to update
     *   }
     * })
     */
    upsert<T extends TrackGenreUpsertArgs>(args: SelectSubset<T, TrackGenreUpsertArgs<ExtArgs>>): Prisma__TrackGenreClient<$Result.GetResult<Prisma.$TrackGenrePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of TrackGenres.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrackGenreCountArgs} args - Arguments to filter TrackGenres to count.
     * @example
     * // Count the number of TrackGenres
     * const count = await prisma.trackGenre.count({
     *   where: {
     *     // ... the filter for the TrackGenres we want to count
     *   }
     * })
    **/
    count<T extends TrackGenreCountArgs>(
      args?: Subset<T, TrackGenreCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TrackGenreCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a TrackGenre.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrackGenreAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TrackGenreAggregateArgs>(args: Subset<T, TrackGenreAggregateArgs>): Prisma.PrismaPromise<GetTrackGenreAggregateType<T>>

    /**
     * Group by TrackGenre.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrackGenreGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TrackGenreGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TrackGenreGroupByArgs['orderBy'] }
        : { orderBy?: TrackGenreGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TrackGenreGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTrackGenreGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the TrackGenre model
   */
  readonly fields: TrackGenreFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for TrackGenre.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TrackGenreClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    track<T extends TrackDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TrackDefaultArgs<ExtArgs>>): Prisma__TrackClient<$Result.GetResult<Prisma.$TrackPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    genre<T extends GenreDefaultArgs<ExtArgs> = {}>(args?: Subset<T, GenreDefaultArgs<ExtArgs>>): Prisma__GenreClient<$Result.GetResult<Prisma.$GenrePayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the TrackGenre model
   */ 
  interface TrackGenreFieldRefs {
    readonly trackId: FieldRef<"TrackGenre", 'String'>
    readonly genreId: FieldRef<"TrackGenre", 'String'>
  }
    

  // Custom InputTypes
  /**
   * TrackGenre findUnique
   */
  export type TrackGenreFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrackGenre
     */
    select?: TrackGenreSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrackGenreInclude<ExtArgs> | null
    /**
     * Filter, which TrackGenre to fetch.
     */
    where: TrackGenreWhereUniqueInput
  }

  /**
   * TrackGenre findUniqueOrThrow
   */
  export type TrackGenreFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrackGenre
     */
    select?: TrackGenreSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrackGenreInclude<ExtArgs> | null
    /**
     * Filter, which TrackGenre to fetch.
     */
    where: TrackGenreWhereUniqueInput
  }

  /**
   * TrackGenre findFirst
   */
  export type TrackGenreFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrackGenre
     */
    select?: TrackGenreSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrackGenreInclude<ExtArgs> | null
    /**
     * Filter, which TrackGenre to fetch.
     */
    where?: TrackGenreWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TrackGenres to fetch.
     */
    orderBy?: TrackGenreOrderByWithRelationInput | TrackGenreOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TrackGenres.
     */
    cursor?: TrackGenreWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TrackGenres from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TrackGenres.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TrackGenres.
     */
    distinct?: TrackGenreScalarFieldEnum | TrackGenreScalarFieldEnum[]
  }

  /**
   * TrackGenre findFirstOrThrow
   */
  export type TrackGenreFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrackGenre
     */
    select?: TrackGenreSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrackGenreInclude<ExtArgs> | null
    /**
     * Filter, which TrackGenre to fetch.
     */
    where?: TrackGenreWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TrackGenres to fetch.
     */
    orderBy?: TrackGenreOrderByWithRelationInput | TrackGenreOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TrackGenres.
     */
    cursor?: TrackGenreWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TrackGenres from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TrackGenres.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TrackGenres.
     */
    distinct?: TrackGenreScalarFieldEnum | TrackGenreScalarFieldEnum[]
  }

  /**
   * TrackGenre findMany
   */
  export type TrackGenreFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrackGenre
     */
    select?: TrackGenreSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrackGenreInclude<ExtArgs> | null
    /**
     * Filter, which TrackGenres to fetch.
     */
    where?: TrackGenreWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TrackGenres to fetch.
     */
    orderBy?: TrackGenreOrderByWithRelationInput | TrackGenreOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing TrackGenres.
     */
    cursor?: TrackGenreWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TrackGenres from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TrackGenres.
     */
    skip?: number
    distinct?: TrackGenreScalarFieldEnum | TrackGenreScalarFieldEnum[]
  }

  /**
   * TrackGenre create
   */
  export type TrackGenreCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrackGenre
     */
    select?: TrackGenreSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrackGenreInclude<ExtArgs> | null
    /**
     * The data needed to create a TrackGenre.
     */
    data: XOR<TrackGenreCreateInput, TrackGenreUncheckedCreateInput>
  }

  /**
   * TrackGenre createMany
   */
  export type TrackGenreCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many TrackGenres.
     */
    data: TrackGenreCreateManyInput | TrackGenreCreateManyInput[]
  }

  /**
   * TrackGenre createManyAndReturn
   */
  export type TrackGenreCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrackGenre
     */
    select?: TrackGenreSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many TrackGenres.
     */
    data: TrackGenreCreateManyInput | TrackGenreCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrackGenreIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * TrackGenre update
   */
  export type TrackGenreUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrackGenre
     */
    select?: TrackGenreSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrackGenreInclude<ExtArgs> | null
    /**
     * The data needed to update a TrackGenre.
     */
    data: XOR<TrackGenreUpdateInput, TrackGenreUncheckedUpdateInput>
    /**
     * Choose, which TrackGenre to update.
     */
    where: TrackGenreWhereUniqueInput
  }

  /**
   * TrackGenre updateMany
   */
  export type TrackGenreUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update TrackGenres.
     */
    data: XOR<TrackGenreUpdateManyMutationInput, TrackGenreUncheckedUpdateManyInput>
    /**
     * Filter which TrackGenres to update
     */
    where?: TrackGenreWhereInput
  }

  /**
   * TrackGenre upsert
   */
  export type TrackGenreUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrackGenre
     */
    select?: TrackGenreSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrackGenreInclude<ExtArgs> | null
    /**
     * The filter to search for the TrackGenre to update in case it exists.
     */
    where: TrackGenreWhereUniqueInput
    /**
     * In case the TrackGenre found by the `where` argument doesn't exist, create a new TrackGenre with this data.
     */
    create: XOR<TrackGenreCreateInput, TrackGenreUncheckedCreateInput>
    /**
     * In case the TrackGenre was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TrackGenreUpdateInput, TrackGenreUncheckedUpdateInput>
  }

  /**
   * TrackGenre delete
   */
  export type TrackGenreDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrackGenre
     */
    select?: TrackGenreSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrackGenreInclude<ExtArgs> | null
    /**
     * Filter which TrackGenre to delete.
     */
    where: TrackGenreWhereUniqueInput
  }

  /**
   * TrackGenre deleteMany
   */
  export type TrackGenreDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TrackGenres to delete
     */
    where?: TrackGenreWhereInput
  }

  /**
   * TrackGenre without action
   */
  export type TrackGenreDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrackGenre
     */
    select?: TrackGenreSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrackGenreInclude<ExtArgs> | null
  }


  /**
   * Model Playlist
   */

  export type AggregatePlaylist = {
    _count: PlaylistCountAggregateOutputType | null
    _min: PlaylistMinAggregateOutputType | null
    _max: PlaylistMaxAggregateOutputType | null
  }

  export type PlaylistMinAggregateOutputType = {
    id: string | null
    ownerId: string | null
    name: string | null
    description: string | null
    coverUrl: string | null
    isPublic: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type PlaylistMaxAggregateOutputType = {
    id: string | null
    ownerId: string | null
    name: string | null
    description: string | null
    coverUrl: string | null
    isPublic: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type PlaylistCountAggregateOutputType = {
    id: number
    ownerId: number
    name: number
    description: number
    coverUrl: number
    isPublic: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type PlaylistMinAggregateInputType = {
    id?: true
    ownerId?: true
    name?: true
    description?: true
    coverUrl?: true
    isPublic?: true
    createdAt?: true
    updatedAt?: true
  }

  export type PlaylistMaxAggregateInputType = {
    id?: true
    ownerId?: true
    name?: true
    description?: true
    coverUrl?: true
    isPublic?: true
    createdAt?: true
    updatedAt?: true
  }

  export type PlaylistCountAggregateInputType = {
    id?: true
    ownerId?: true
    name?: true
    description?: true
    coverUrl?: true
    isPublic?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type PlaylistAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Playlist to aggregate.
     */
    where?: PlaylistWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Playlists to fetch.
     */
    orderBy?: PlaylistOrderByWithRelationInput | PlaylistOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PlaylistWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Playlists from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Playlists.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Playlists
    **/
    _count?: true | PlaylistCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PlaylistMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PlaylistMaxAggregateInputType
  }

  export type GetPlaylistAggregateType<T extends PlaylistAggregateArgs> = {
        [P in keyof T & keyof AggregatePlaylist]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePlaylist[P]>
      : GetScalarType<T[P], AggregatePlaylist[P]>
  }




  export type PlaylistGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PlaylistWhereInput
    orderBy?: PlaylistOrderByWithAggregationInput | PlaylistOrderByWithAggregationInput[]
    by: PlaylistScalarFieldEnum[] | PlaylistScalarFieldEnum
    having?: PlaylistScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PlaylistCountAggregateInputType | true
    _min?: PlaylistMinAggregateInputType
    _max?: PlaylistMaxAggregateInputType
  }

  export type PlaylistGroupByOutputType = {
    id: string
    ownerId: string
    name: string
    description: string | null
    coverUrl: string | null
    isPublic: boolean
    createdAt: Date
    updatedAt: Date
    _count: PlaylistCountAggregateOutputType | null
    _min: PlaylistMinAggregateOutputType | null
    _max: PlaylistMaxAggregateOutputType | null
  }

  type GetPlaylistGroupByPayload<T extends PlaylistGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PlaylistGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PlaylistGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PlaylistGroupByOutputType[P]>
            : GetScalarType<T[P], PlaylistGroupByOutputType[P]>
        }
      >
    >


  export type PlaylistSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    ownerId?: boolean
    name?: boolean
    description?: boolean
    coverUrl?: boolean
    isPublic?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    owner?: boolean | UserDefaultArgs<ExtArgs>
    tracks?: boolean | Playlist$tracksArgs<ExtArgs>
    followers?: boolean | Playlist$followersArgs<ExtArgs>
    _count?: boolean | PlaylistCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["playlist"]>

  export type PlaylistSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    ownerId?: boolean
    name?: boolean
    description?: boolean
    coverUrl?: boolean
    isPublic?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    owner?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["playlist"]>

  export type PlaylistSelectScalar = {
    id?: boolean
    ownerId?: boolean
    name?: boolean
    description?: boolean
    coverUrl?: boolean
    isPublic?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type PlaylistInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    owner?: boolean | UserDefaultArgs<ExtArgs>
    tracks?: boolean | Playlist$tracksArgs<ExtArgs>
    followers?: boolean | Playlist$followersArgs<ExtArgs>
    _count?: boolean | PlaylistCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type PlaylistIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    owner?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $PlaylistPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Playlist"
    objects: {
      owner: Prisma.$UserPayload<ExtArgs>
      tracks: Prisma.$PlaylistTrackPayload<ExtArgs>[]
      followers: Prisma.$PlaylistFollowerPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      ownerId: string
      name: string
      description: string | null
      coverUrl: string | null
      isPublic: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["playlist"]>
    composites: {}
  }

  type PlaylistGetPayload<S extends boolean | null | undefined | PlaylistDefaultArgs> = $Result.GetResult<Prisma.$PlaylistPayload, S>

  type PlaylistCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<PlaylistFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: PlaylistCountAggregateInputType | true
    }

  export interface PlaylistDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Playlist'], meta: { name: 'Playlist' } }
    /**
     * Find zero or one Playlist that matches the filter.
     * @param {PlaylistFindUniqueArgs} args - Arguments to find a Playlist
     * @example
     * // Get one Playlist
     * const playlist = await prisma.playlist.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PlaylistFindUniqueArgs>(args: SelectSubset<T, PlaylistFindUniqueArgs<ExtArgs>>): Prisma__PlaylistClient<$Result.GetResult<Prisma.$PlaylistPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Playlist that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {PlaylistFindUniqueOrThrowArgs} args - Arguments to find a Playlist
     * @example
     * // Get one Playlist
     * const playlist = await prisma.playlist.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PlaylistFindUniqueOrThrowArgs>(args: SelectSubset<T, PlaylistFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PlaylistClient<$Result.GetResult<Prisma.$PlaylistPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Playlist that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlaylistFindFirstArgs} args - Arguments to find a Playlist
     * @example
     * // Get one Playlist
     * const playlist = await prisma.playlist.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PlaylistFindFirstArgs>(args?: SelectSubset<T, PlaylistFindFirstArgs<ExtArgs>>): Prisma__PlaylistClient<$Result.GetResult<Prisma.$PlaylistPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Playlist that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlaylistFindFirstOrThrowArgs} args - Arguments to find a Playlist
     * @example
     * // Get one Playlist
     * const playlist = await prisma.playlist.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PlaylistFindFirstOrThrowArgs>(args?: SelectSubset<T, PlaylistFindFirstOrThrowArgs<ExtArgs>>): Prisma__PlaylistClient<$Result.GetResult<Prisma.$PlaylistPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Playlists that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlaylistFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Playlists
     * const playlists = await prisma.playlist.findMany()
     * 
     * // Get first 10 Playlists
     * const playlists = await prisma.playlist.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const playlistWithIdOnly = await prisma.playlist.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PlaylistFindManyArgs>(args?: SelectSubset<T, PlaylistFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PlaylistPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Playlist.
     * @param {PlaylistCreateArgs} args - Arguments to create a Playlist.
     * @example
     * // Create one Playlist
     * const Playlist = await prisma.playlist.create({
     *   data: {
     *     // ... data to create a Playlist
     *   }
     * })
     * 
     */
    create<T extends PlaylistCreateArgs>(args: SelectSubset<T, PlaylistCreateArgs<ExtArgs>>): Prisma__PlaylistClient<$Result.GetResult<Prisma.$PlaylistPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Playlists.
     * @param {PlaylistCreateManyArgs} args - Arguments to create many Playlists.
     * @example
     * // Create many Playlists
     * const playlist = await prisma.playlist.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PlaylistCreateManyArgs>(args?: SelectSubset<T, PlaylistCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Playlists and returns the data saved in the database.
     * @param {PlaylistCreateManyAndReturnArgs} args - Arguments to create many Playlists.
     * @example
     * // Create many Playlists
     * const playlist = await prisma.playlist.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Playlists and only return the `id`
     * const playlistWithIdOnly = await prisma.playlist.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PlaylistCreateManyAndReturnArgs>(args?: SelectSubset<T, PlaylistCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PlaylistPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Playlist.
     * @param {PlaylistDeleteArgs} args - Arguments to delete one Playlist.
     * @example
     * // Delete one Playlist
     * const Playlist = await prisma.playlist.delete({
     *   where: {
     *     // ... filter to delete one Playlist
     *   }
     * })
     * 
     */
    delete<T extends PlaylistDeleteArgs>(args: SelectSubset<T, PlaylistDeleteArgs<ExtArgs>>): Prisma__PlaylistClient<$Result.GetResult<Prisma.$PlaylistPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Playlist.
     * @param {PlaylistUpdateArgs} args - Arguments to update one Playlist.
     * @example
     * // Update one Playlist
     * const playlist = await prisma.playlist.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PlaylistUpdateArgs>(args: SelectSubset<T, PlaylistUpdateArgs<ExtArgs>>): Prisma__PlaylistClient<$Result.GetResult<Prisma.$PlaylistPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Playlists.
     * @param {PlaylistDeleteManyArgs} args - Arguments to filter Playlists to delete.
     * @example
     * // Delete a few Playlists
     * const { count } = await prisma.playlist.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PlaylistDeleteManyArgs>(args?: SelectSubset<T, PlaylistDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Playlists.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlaylistUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Playlists
     * const playlist = await prisma.playlist.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PlaylistUpdateManyArgs>(args: SelectSubset<T, PlaylistUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Playlist.
     * @param {PlaylistUpsertArgs} args - Arguments to update or create a Playlist.
     * @example
     * // Update or create a Playlist
     * const playlist = await prisma.playlist.upsert({
     *   create: {
     *     // ... data to create a Playlist
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Playlist we want to update
     *   }
     * })
     */
    upsert<T extends PlaylistUpsertArgs>(args: SelectSubset<T, PlaylistUpsertArgs<ExtArgs>>): Prisma__PlaylistClient<$Result.GetResult<Prisma.$PlaylistPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Playlists.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlaylistCountArgs} args - Arguments to filter Playlists to count.
     * @example
     * // Count the number of Playlists
     * const count = await prisma.playlist.count({
     *   where: {
     *     // ... the filter for the Playlists we want to count
     *   }
     * })
    **/
    count<T extends PlaylistCountArgs>(
      args?: Subset<T, PlaylistCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PlaylistCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Playlist.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlaylistAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PlaylistAggregateArgs>(args: Subset<T, PlaylistAggregateArgs>): Prisma.PrismaPromise<GetPlaylistAggregateType<T>>

    /**
     * Group by Playlist.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlaylistGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PlaylistGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PlaylistGroupByArgs['orderBy'] }
        : { orderBy?: PlaylistGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PlaylistGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPlaylistGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Playlist model
   */
  readonly fields: PlaylistFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Playlist.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PlaylistClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    owner<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    tracks<T extends Playlist$tracksArgs<ExtArgs> = {}>(args?: Subset<T, Playlist$tracksArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PlaylistTrackPayload<ExtArgs>, T, "findMany"> | Null>
    followers<T extends Playlist$followersArgs<ExtArgs> = {}>(args?: Subset<T, Playlist$followersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PlaylistFollowerPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Playlist model
   */ 
  interface PlaylistFieldRefs {
    readonly id: FieldRef<"Playlist", 'String'>
    readonly ownerId: FieldRef<"Playlist", 'String'>
    readonly name: FieldRef<"Playlist", 'String'>
    readonly description: FieldRef<"Playlist", 'String'>
    readonly coverUrl: FieldRef<"Playlist", 'String'>
    readonly isPublic: FieldRef<"Playlist", 'Boolean'>
    readonly createdAt: FieldRef<"Playlist", 'DateTime'>
    readonly updatedAt: FieldRef<"Playlist", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Playlist findUnique
   */
  export type PlaylistFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Playlist
     */
    select?: PlaylistSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlaylistInclude<ExtArgs> | null
    /**
     * Filter, which Playlist to fetch.
     */
    where: PlaylistWhereUniqueInput
  }

  /**
   * Playlist findUniqueOrThrow
   */
  export type PlaylistFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Playlist
     */
    select?: PlaylistSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlaylistInclude<ExtArgs> | null
    /**
     * Filter, which Playlist to fetch.
     */
    where: PlaylistWhereUniqueInput
  }

  /**
   * Playlist findFirst
   */
  export type PlaylistFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Playlist
     */
    select?: PlaylistSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlaylistInclude<ExtArgs> | null
    /**
     * Filter, which Playlist to fetch.
     */
    where?: PlaylistWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Playlists to fetch.
     */
    orderBy?: PlaylistOrderByWithRelationInput | PlaylistOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Playlists.
     */
    cursor?: PlaylistWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Playlists from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Playlists.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Playlists.
     */
    distinct?: PlaylistScalarFieldEnum | PlaylistScalarFieldEnum[]
  }

  /**
   * Playlist findFirstOrThrow
   */
  export type PlaylistFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Playlist
     */
    select?: PlaylistSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlaylistInclude<ExtArgs> | null
    /**
     * Filter, which Playlist to fetch.
     */
    where?: PlaylistWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Playlists to fetch.
     */
    orderBy?: PlaylistOrderByWithRelationInput | PlaylistOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Playlists.
     */
    cursor?: PlaylistWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Playlists from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Playlists.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Playlists.
     */
    distinct?: PlaylistScalarFieldEnum | PlaylistScalarFieldEnum[]
  }

  /**
   * Playlist findMany
   */
  export type PlaylistFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Playlist
     */
    select?: PlaylistSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlaylistInclude<ExtArgs> | null
    /**
     * Filter, which Playlists to fetch.
     */
    where?: PlaylistWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Playlists to fetch.
     */
    orderBy?: PlaylistOrderByWithRelationInput | PlaylistOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Playlists.
     */
    cursor?: PlaylistWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Playlists from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Playlists.
     */
    skip?: number
    distinct?: PlaylistScalarFieldEnum | PlaylistScalarFieldEnum[]
  }

  /**
   * Playlist create
   */
  export type PlaylistCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Playlist
     */
    select?: PlaylistSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlaylistInclude<ExtArgs> | null
    /**
     * The data needed to create a Playlist.
     */
    data: XOR<PlaylistCreateInput, PlaylistUncheckedCreateInput>
  }

  /**
   * Playlist createMany
   */
  export type PlaylistCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Playlists.
     */
    data: PlaylistCreateManyInput | PlaylistCreateManyInput[]
  }

  /**
   * Playlist createManyAndReturn
   */
  export type PlaylistCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Playlist
     */
    select?: PlaylistSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Playlists.
     */
    data: PlaylistCreateManyInput | PlaylistCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlaylistIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Playlist update
   */
  export type PlaylistUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Playlist
     */
    select?: PlaylistSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlaylistInclude<ExtArgs> | null
    /**
     * The data needed to update a Playlist.
     */
    data: XOR<PlaylistUpdateInput, PlaylistUncheckedUpdateInput>
    /**
     * Choose, which Playlist to update.
     */
    where: PlaylistWhereUniqueInput
  }

  /**
   * Playlist updateMany
   */
  export type PlaylistUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Playlists.
     */
    data: XOR<PlaylistUpdateManyMutationInput, PlaylistUncheckedUpdateManyInput>
    /**
     * Filter which Playlists to update
     */
    where?: PlaylistWhereInput
  }

  /**
   * Playlist upsert
   */
  export type PlaylistUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Playlist
     */
    select?: PlaylistSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlaylistInclude<ExtArgs> | null
    /**
     * The filter to search for the Playlist to update in case it exists.
     */
    where: PlaylistWhereUniqueInput
    /**
     * In case the Playlist found by the `where` argument doesn't exist, create a new Playlist with this data.
     */
    create: XOR<PlaylistCreateInput, PlaylistUncheckedCreateInput>
    /**
     * In case the Playlist was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PlaylistUpdateInput, PlaylistUncheckedUpdateInput>
  }

  /**
   * Playlist delete
   */
  export type PlaylistDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Playlist
     */
    select?: PlaylistSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlaylistInclude<ExtArgs> | null
    /**
     * Filter which Playlist to delete.
     */
    where: PlaylistWhereUniqueInput
  }

  /**
   * Playlist deleteMany
   */
  export type PlaylistDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Playlists to delete
     */
    where?: PlaylistWhereInput
  }

  /**
   * Playlist.tracks
   */
  export type Playlist$tracksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlaylistTrack
     */
    select?: PlaylistTrackSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlaylistTrackInclude<ExtArgs> | null
    where?: PlaylistTrackWhereInput
    orderBy?: PlaylistTrackOrderByWithRelationInput | PlaylistTrackOrderByWithRelationInput[]
    cursor?: PlaylistTrackWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PlaylistTrackScalarFieldEnum | PlaylistTrackScalarFieldEnum[]
  }

  /**
   * Playlist.followers
   */
  export type Playlist$followersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlaylistFollower
     */
    select?: PlaylistFollowerSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlaylistFollowerInclude<ExtArgs> | null
    where?: PlaylistFollowerWhereInput
    orderBy?: PlaylistFollowerOrderByWithRelationInput | PlaylistFollowerOrderByWithRelationInput[]
    cursor?: PlaylistFollowerWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PlaylistFollowerScalarFieldEnum | PlaylistFollowerScalarFieldEnum[]
  }

  /**
   * Playlist without action
   */
  export type PlaylistDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Playlist
     */
    select?: PlaylistSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlaylistInclude<ExtArgs> | null
  }


  /**
   * Model PlaylistTrack
   */

  export type AggregatePlaylistTrack = {
    _count: PlaylistTrackCountAggregateOutputType | null
    _avg: PlaylistTrackAvgAggregateOutputType | null
    _sum: PlaylistTrackSumAggregateOutputType | null
    _min: PlaylistTrackMinAggregateOutputType | null
    _max: PlaylistTrackMaxAggregateOutputType | null
  }

  export type PlaylistTrackAvgAggregateOutputType = {
    sortOrder: number | null
  }

  export type PlaylistTrackSumAggregateOutputType = {
    sortOrder: number | null
  }

  export type PlaylistTrackMinAggregateOutputType = {
    playlistId: string | null
    trackId: string | null
    sortOrder: number | null
    addedAt: Date | null
  }

  export type PlaylistTrackMaxAggregateOutputType = {
    playlistId: string | null
    trackId: string | null
    sortOrder: number | null
    addedAt: Date | null
  }

  export type PlaylistTrackCountAggregateOutputType = {
    playlistId: number
    trackId: number
    sortOrder: number
    addedAt: number
    _all: number
  }


  export type PlaylistTrackAvgAggregateInputType = {
    sortOrder?: true
  }

  export type PlaylistTrackSumAggregateInputType = {
    sortOrder?: true
  }

  export type PlaylistTrackMinAggregateInputType = {
    playlistId?: true
    trackId?: true
    sortOrder?: true
    addedAt?: true
  }

  export type PlaylistTrackMaxAggregateInputType = {
    playlistId?: true
    trackId?: true
    sortOrder?: true
    addedAt?: true
  }

  export type PlaylistTrackCountAggregateInputType = {
    playlistId?: true
    trackId?: true
    sortOrder?: true
    addedAt?: true
    _all?: true
  }

  export type PlaylistTrackAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PlaylistTrack to aggregate.
     */
    where?: PlaylistTrackWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PlaylistTracks to fetch.
     */
    orderBy?: PlaylistTrackOrderByWithRelationInput | PlaylistTrackOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PlaylistTrackWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PlaylistTracks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PlaylistTracks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PlaylistTracks
    **/
    _count?: true | PlaylistTrackCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PlaylistTrackAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PlaylistTrackSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PlaylistTrackMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PlaylistTrackMaxAggregateInputType
  }

  export type GetPlaylistTrackAggregateType<T extends PlaylistTrackAggregateArgs> = {
        [P in keyof T & keyof AggregatePlaylistTrack]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePlaylistTrack[P]>
      : GetScalarType<T[P], AggregatePlaylistTrack[P]>
  }




  export type PlaylistTrackGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PlaylistTrackWhereInput
    orderBy?: PlaylistTrackOrderByWithAggregationInput | PlaylistTrackOrderByWithAggregationInput[]
    by: PlaylistTrackScalarFieldEnum[] | PlaylistTrackScalarFieldEnum
    having?: PlaylistTrackScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PlaylistTrackCountAggregateInputType | true
    _avg?: PlaylistTrackAvgAggregateInputType
    _sum?: PlaylistTrackSumAggregateInputType
    _min?: PlaylistTrackMinAggregateInputType
    _max?: PlaylistTrackMaxAggregateInputType
  }

  export type PlaylistTrackGroupByOutputType = {
    playlistId: string
    trackId: string
    sortOrder: number
    addedAt: Date
    _count: PlaylistTrackCountAggregateOutputType | null
    _avg: PlaylistTrackAvgAggregateOutputType | null
    _sum: PlaylistTrackSumAggregateOutputType | null
    _min: PlaylistTrackMinAggregateOutputType | null
    _max: PlaylistTrackMaxAggregateOutputType | null
  }

  type GetPlaylistTrackGroupByPayload<T extends PlaylistTrackGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PlaylistTrackGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PlaylistTrackGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PlaylistTrackGroupByOutputType[P]>
            : GetScalarType<T[P], PlaylistTrackGroupByOutputType[P]>
        }
      >
    >


  export type PlaylistTrackSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    playlistId?: boolean
    trackId?: boolean
    sortOrder?: boolean
    addedAt?: boolean
    playlist?: boolean | PlaylistDefaultArgs<ExtArgs>
    track?: boolean | TrackDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["playlistTrack"]>

  export type PlaylistTrackSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    playlistId?: boolean
    trackId?: boolean
    sortOrder?: boolean
    addedAt?: boolean
    playlist?: boolean | PlaylistDefaultArgs<ExtArgs>
    track?: boolean | TrackDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["playlistTrack"]>

  export type PlaylistTrackSelectScalar = {
    playlistId?: boolean
    trackId?: boolean
    sortOrder?: boolean
    addedAt?: boolean
  }

  export type PlaylistTrackInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    playlist?: boolean | PlaylistDefaultArgs<ExtArgs>
    track?: boolean | TrackDefaultArgs<ExtArgs>
  }
  export type PlaylistTrackIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    playlist?: boolean | PlaylistDefaultArgs<ExtArgs>
    track?: boolean | TrackDefaultArgs<ExtArgs>
  }

  export type $PlaylistTrackPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PlaylistTrack"
    objects: {
      playlist: Prisma.$PlaylistPayload<ExtArgs>
      track: Prisma.$TrackPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      playlistId: string
      trackId: string
      sortOrder: number
      addedAt: Date
    }, ExtArgs["result"]["playlistTrack"]>
    composites: {}
  }

  type PlaylistTrackGetPayload<S extends boolean | null | undefined | PlaylistTrackDefaultArgs> = $Result.GetResult<Prisma.$PlaylistTrackPayload, S>

  type PlaylistTrackCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<PlaylistTrackFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: PlaylistTrackCountAggregateInputType | true
    }

  export interface PlaylistTrackDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PlaylistTrack'], meta: { name: 'PlaylistTrack' } }
    /**
     * Find zero or one PlaylistTrack that matches the filter.
     * @param {PlaylistTrackFindUniqueArgs} args - Arguments to find a PlaylistTrack
     * @example
     * // Get one PlaylistTrack
     * const playlistTrack = await prisma.playlistTrack.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PlaylistTrackFindUniqueArgs>(args: SelectSubset<T, PlaylistTrackFindUniqueArgs<ExtArgs>>): Prisma__PlaylistTrackClient<$Result.GetResult<Prisma.$PlaylistTrackPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one PlaylistTrack that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {PlaylistTrackFindUniqueOrThrowArgs} args - Arguments to find a PlaylistTrack
     * @example
     * // Get one PlaylistTrack
     * const playlistTrack = await prisma.playlistTrack.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PlaylistTrackFindUniqueOrThrowArgs>(args: SelectSubset<T, PlaylistTrackFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PlaylistTrackClient<$Result.GetResult<Prisma.$PlaylistTrackPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first PlaylistTrack that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlaylistTrackFindFirstArgs} args - Arguments to find a PlaylistTrack
     * @example
     * // Get one PlaylistTrack
     * const playlistTrack = await prisma.playlistTrack.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PlaylistTrackFindFirstArgs>(args?: SelectSubset<T, PlaylistTrackFindFirstArgs<ExtArgs>>): Prisma__PlaylistTrackClient<$Result.GetResult<Prisma.$PlaylistTrackPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first PlaylistTrack that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlaylistTrackFindFirstOrThrowArgs} args - Arguments to find a PlaylistTrack
     * @example
     * // Get one PlaylistTrack
     * const playlistTrack = await prisma.playlistTrack.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PlaylistTrackFindFirstOrThrowArgs>(args?: SelectSubset<T, PlaylistTrackFindFirstOrThrowArgs<ExtArgs>>): Prisma__PlaylistTrackClient<$Result.GetResult<Prisma.$PlaylistTrackPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more PlaylistTracks that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlaylistTrackFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PlaylistTracks
     * const playlistTracks = await prisma.playlistTrack.findMany()
     * 
     * // Get first 10 PlaylistTracks
     * const playlistTracks = await prisma.playlistTrack.findMany({ take: 10 })
     * 
     * // Only select the `playlistId`
     * const playlistTrackWithPlaylistIdOnly = await prisma.playlistTrack.findMany({ select: { playlistId: true } })
     * 
     */
    findMany<T extends PlaylistTrackFindManyArgs>(args?: SelectSubset<T, PlaylistTrackFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PlaylistTrackPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a PlaylistTrack.
     * @param {PlaylistTrackCreateArgs} args - Arguments to create a PlaylistTrack.
     * @example
     * // Create one PlaylistTrack
     * const PlaylistTrack = await prisma.playlistTrack.create({
     *   data: {
     *     // ... data to create a PlaylistTrack
     *   }
     * })
     * 
     */
    create<T extends PlaylistTrackCreateArgs>(args: SelectSubset<T, PlaylistTrackCreateArgs<ExtArgs>>): Prisma__PlaylistTrackClient<$Result.GetResult<Prisma.$PlaylistTrackPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many PlaylistTracks.
     * @param {PlaylistTrackCreateManyArgs} args - Arguments to create many PlaylistTracks.
     * @example
     * // Create many PlaylistTracks
     * const playlistTrack = await prisma.playlistTrack.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PlaylistTrackCreateManyArgs>(args?: SelectSubset<T, PlaylistTrackCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many PlaylistTracks and returns the data saved in the database.
     * @param {PlaylistTrackCreateManyAndReturnArgs} args - Arguments to create many PlaylistTracks.
     * @example
     * // Create many PlaylistTracks
     * const playlistTrack = await prisma.playlistTrack.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many PlaylistTracks and only return the `playlistId`
     * const playlistTrackWithPlaylistIdOnly = await prisma.playlistTrack.createManyAndReturn({ 
     *   select: { playlistId: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PlaylistTrackCreateManyAndReturnArgs>(args?: SelectSubset<T, PlaylistTrackCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PlaylistTrackPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a PlaylistTrack.
     * @param {PlaylistTrackDeleteArgs} args - Arguments to delete one PlaylistTrack.
     * @example
     * // Delete one PlaylistTrack
     * const PlaylistTrack = await prisma.playlistTrack.delete({
     *   where: {
     *     // ... filter to delete one PlaylistTrack
     *   }
     * })
     * 
     */
    delete<T extends PlaylistTrackDeleteArgs>(args: SelectSubset<T, PlaylistTrackDeleteArgs<ExtArgs>>): Prisma__PlaylistTrackClient<$Result.GetResult<Prisma.$PlaylistTrackPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one PlaylistTrack.
     * @param {PlaylistTrackUpdateArgs} args - Arguments to update one PlaylistTrack.
     * @example
     * // Update one PlaylistTrack
     * const playlistTrack = await prisma.playlistTrack.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PlaylistTrackUpdateArgs>(args: SelectSubset<T, PlaylistTrackUpdateArgs<ExtArgs>>): Prisma__PlaylistTrackClient<$Result.GetResult<Prisma.$PlaylistTrackPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more PlaylistTracks.
     * @param {PlaylistTrackDeleteManyArgs} args - Arguments to filter PlaylistTracks to delete.
     * @example
     * // Delete a few PlaylistTracks
     * const { count } = await prisma.playlistTrack.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PlaylistTrackDeleteManyArgs>(args?: SelectSubset<T, PlaylistTrackDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PlaylistTracks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlaylistTrackUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PlaylistTracks
     * const playlistTrack = await prisma.playlistTrack.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PlaylistTrackUpdateManyArgs>(args: SelectSubset<T, PlaylistTrackUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one PlaylistTrack.
     * @param {PlaylistTrackUpsertArgs} args - Arguments to update or create a PlaylistTrack.
     * @example
     * // Update or create a PlaylistTrack
     * const playlistTrack = await prisma.playlistTrack.upsert({
     *   create: {
     *     // ... data to create a PlaylistTrack
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PlaylistTrack we want to update
     *   }
     * })
     */
    upsert<T extends PlaylistTrackUpsertArgs>(args: SelectSubset<T, PlaylistTrackUpsertArgs<ExtArgs>>): Prisma__PlaylistTrackClient<$Result.GetResult<Prisma.$PlaylistTrackPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of PlaylistTracks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlaylistTrackCountArgs} args - Arguments to filter PlaylistTracks to count.
     * @example
     * // Count the number of PlaylistTracks
     * const count = await prisma.playlistTrack.count({
     *   where: {
     *     // ... the filter for the PlaylistTracks we want to count
     *   }
     * })
    **/
    count<T extends PlaylistTrackCountArgs>(
      args?: Subset<T, PlaylistTrackCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PlaylistTrackCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PlaylistTrack.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlaylistTrackAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PlaylistTrackAggregateArgs>(args: Subset<T, PlaylistTrackAggregateArgs>): Prisma.PrismaPromise<GetPlaylistTrackAggregateType<T>>

    /**
     * Group by PlaylistTrack.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlaylistTrackGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PlaylistTrackGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PlaylistTrackGroupByArgs['orderBy'] }
        : { orderBy?: PlaylistTrackGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PlaylistTrackGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPlaylistTrackGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PlaylistTrack model
   */
  readonly fields: PlaylistTrackFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PlaylistTrack.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PlaylistTrackClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    playlist<T extends PlaylistDefaultArgs<ExtArgs> = {}>(args?: Subset<T, PlaylistDefaultArgs<ExtArgs>>): Prisma__PlaylistClient<$Result.GetResult<Prisma.$PlaylistPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    track<T extends TrackDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TrackDefaultArgs<ExtArgs>>): Prisma__TrackClient<$Result.GetResult<Prisma.$TrackPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the PlaylistTrack model
   */ 
  interface PlaylistTrackFieldRefs {
    readonly playlistId: FieldRef<"PlaylistTrack", 'String'>
    readonly trackId: FieldRef<"PlaylistTrack", 'String'>
    readonly sortOrder: FieldRef<"PlaylistTrack", 'Int'>
    readonly addedAt: FieldRef<"PlaylistTrack", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * PlaylistTrack findUnique
   */
  export type PlaylistTrackFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlaylistTrack
     */
    select?: PlaylistTrackSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlaylistTrackInclude<ExtArgs> | null
    /**
     * Filter, which PlaylistTrack to fetch.
     */
    where: PlaylistTrackWhereUniqueInput
  }

  /**
   * PlaylistTrack findUniqueOrThrow
   */
  export type PlaylistTrackFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlaylistTrack
     */
    select?: PlaylistTrackSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlaylistTrackInclude<ExtArgs> | null
    /**
     * Filter, which PlaylistTrack to fetch.
     */
    where: PlaylistTrackWhereUniqueInput
  }

  /**
   * PlaylistTrack findFirst
   */
  export type PlaylistTrackFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlaylistTrack
     */
    select?: PlaylistTrackSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlaylistTrackInclude<ExtArgs> | null
    /**
     * Filter, which PlaylistTrack to fetch.
     */
    where?: PlaylistTrackWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PlaylistTracks to fetch.
     */
    orderBy?: PlaylistTrackOrderByWithRelationInput | PlaylistTrackOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PlaylistTracks.
     */
    cursor?: PlaylistTrackWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PlaylistTracks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PlaylistTracks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PlaylistTracks.
     */
    distinct?: PlaylistTrackScalarFieldEnum | PlaylistTrackScalarFieldEnum[]
  }

  /**
   * PlaylistTrack findFirstOrThrow
   */
  export type PlaylistTrackFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlaylistTrack
     */
    select?: PlaylistTrackSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlaylistTrackInclude<ExtArgs> | null
    /**
     * Filter, which PlaylistTrack to fetch.
     */
    where?: PlaylistTrackWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PlaylistTracks to fetch.
     */
    orderBy?: PlaylistTrackOrderByWithRelationInput | PlaylistTrackOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PlaylistTracks.
     */
    cursor?: PlaylistTrackWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PlaylistTracks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PlaylistTracks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PlaylistTracks.
     */
    distinct?: PlaylistTrackScalarFieldEnum | PlaylistTrackScalarFieldEnum[]
  }

  /**
   * PlaylistTrack findMany
   */
  export type PlaylistTrackFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlaylistTrack
     */
    select?: PlaylistTrackSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlaylistTrackInclude<ExtArgs> | null
    /**
     * Filter, which PlaylistTracks to fetch.
     */
    where?: PlaylistTrackWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PlaylistTracks to fetch.
     */
    orderBy?: PlaylistTrackOrderByWithRelationInput | PlaylistTrackOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PlaylistTracks.
     */
    cursor?: PlaylistTrackWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PlaylistTracks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PlaylistTracks.
     */
    skip?: number
    distinct?: PlaylistTrackScalarFieldEnum | PlaylistTrackScalarFieldEnum[]
  }

  /**
   * PlaylistTrack create
   */
  export type PlaylistTrackCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlaylistTrack
     */
    select?: PlaylistTrackSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlaylistTrackInclude<ExtArgs> | null
    /**
     * The data needed to create a PlaylistTrack.
     */
    data: XOR<PlaylistTrackCreateInput, PlaylistTrackUncheckedCreateInput>
  }

  /**
   * PlaylistTrack createMany
   */
  export type PlaylistTrackCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PlaylistTracks.
     */
    data: PlaylistTrackCreateManyInput | PlaylistTrackCreateManyInput[]
  }

  /**
   * PlaylistTrack createManyAndReturn
   */
  export type PlaylistTrackCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlaylistTrack
     */
    select?: PlaylistTrackSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many PlaylistTracks.
     */
    data: PlaylistTrackCreateManyInput | PlaylistTrackCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlaylistTrackIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * PlaylistTrack update
   */
  export type PlaylistTrackUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlaylistTrack
     */
    select?: PlaylistTrackSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlaylistTrackInclude<ExtArgs> | null
    /**
     * The data needed to update a PlaylistTrack.
     */
    data: XOR<PlaylistTrackUpdateInput, PlaylistTrackUncheckedUpdateInput>
    /**
     * Choose, which PlaylistTrack to update.
     */
    where: PlaylistTrackWhereUniqueInput
  }

  /**
   * PlaylistTrack updateMany
   */
  export type PlaylistTrackUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PlaylistTracks.
     */
    data: XOR<PlaylistTrackUpdateManyMutationInput, PlaylistTrackUncheckedUpdateManyInput>
    /**
     * Filter which PlaylistTracks to update
     */
    where?: PlaylistTrackWhereInput
  }

  /**
   * PlaylistTrack upsert
   */
  export type PlaylistTrackUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlaylistTrack
     */
    select?: PlaylistTrackSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlaylistTrackInclude<ExtArgs> | null
    /**
     * The filter to search for the PlaylistTrack to update in case it exists.
     */
    where: PlaylistTrackWhereUniqueInput
    /**
     * In case the PlaylistTrack found by the `where` argument doesn't exist, create a new PlaylistTrack with this data.
     */
    create: XOR<PlaylistTrackCreateInput, PlaylistTrackUncheckedCreateInput>
    /**
     * In case the PlaylistTrack was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PlaylistTrackUpdateInput, PlaylistTrackUncheckedUpdateInput>
  }

  /**
   * PlaylistTrack delete
   */
  export type PlaylistTrackDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlaylistTrack
     */
    select?: PlaylistTrackSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlaylistTrackInclude<ExtArgs> | null
    /**
     * Filter which PlaylistTrack to delete.
     */
    where: PlaylistTrackWhereUniqueInput
  }

  /**
   * PlaylistTrack deleteMany
   */
  export type PlaylistTrackDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PlaylistTracks to delete
     */
    where?: PlaylistTrackWhereInput
  }

  /**
   * PlaylistTrack without action
   */
  export type PlaylistTrackDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlaylistTrack
     */
    select?: PlaylistTrackSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlaylistTrackInclude<ExtArgs> | null
  }


  /**
   * Model PlaylistFollower
   */

  export type AggregatePlaylistFollower = {
    _count: PlaylistFollowerCountAggregateOutputType | null
    _min: PlaylistFollowerMinAggregateOutputType | null
    _max: PlaylistFollowerMaxAggregateOutputType | null
  }

  export type PlaylistFollowerMinAggregateOutputType = {
    playlistId: string | null
    userId: string | null
    followedAt: Date | null
  }

  export type PlaylistFollowerMaxAggregateOutputType = {
    playlistId: string | null
    userId: string | null
    followedAt: Date | null
  }

  export type PlaylistFollowerCountAggregateOutputType = {
    playlistId: number
    userId: number
    followedAt: number
    _all: number
  }


  export type PlaylistFollowerMinAggregateInputType = {
    playlistId?: true
    userId?: true
    followedAt?: true
  }

  export type PlaylistFollowerMaxAggregateInputType = {
    playlistId?: true
    userId?: true
    followedAt?: true
  }

  export type PlaylistFollowerCountAggregateInputType = {
    playlistId?: true
    userId?: true
    followedAt?: true
    _all?: true
  }

  export type PlaylistFollowerAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PlaylistFollower to aggregate.
     */
    where?: PlaylistFollowerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PlaylistFollowers to fetch.
     */
    orderBy?: PlaylistFollowerOrderByWithRelationInput | PlaylistFollowerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PlaylistFollowerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PlaylistFollowers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PlaylistFollowers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PlaylistFollowers
    **/
    _count?: true | PlaylistFollowerCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PlaylistFollowerMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PlaylistFollowerMaxAggregateInputType
  }

  export type GetPlaylistFollowerAggregateType<T extends PlaylistFollowerAggregateArgs> = {
        [P in keyof T & keyof AggregatePlaylistFollower]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePlaylistFollower[P]>
      : GetScalarType<T[P], AggregatePlaylistFollower[P]>
  }




  export type PlaylistFollowerGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PlaylistFollowerWhereInput
    orderBy?: PlaylistFollowerOrderByWithAggregationInput | PlaylistFollowerOrderByWithAggregationInput[]
    by: PlaylistFollowerScalarFieldEnum[] | PlaylistFollowerScalarFieldEnum
    having?: PlaylistFollowerScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PlaylistFollowerCountAggregateInputType | true
    _min?: PlaylistFollowerMinAggregateInputType
    _max?: PlaylistFollowerMaxAggregateInputType
  }

  export type PlaylistFollowerGroupByOutputType = {
    playlistId: string
    userId: string
    followedAt: Date
    _count: PlaylistFollowerCountAggregateOutputType | null
    _min: PlaylistFollowerMinAggregateOutputType | null
    _max: PlaylistFollowerMaxAggregateOutputType | null
  }

  type GetPlaylistFollowerGroupByPayload<T extends PlaylistFollowerGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PlaylistFollowerGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PlaylistFollowerGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PlaylistFollowerGroupByOutputType[P]>
            : GetScalarType<T[P], PlaylistFollowerGroupByOutputType[P]>
        }
      >
    >


  export type PlaylistFollowerSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    playlistId?: boolean
    userId?: boolean
    followedAt?: boolean
    playlist?: boolean | PlaylistDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["playlistFollower"]>

  export type PlaylistFollowerSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    playlistId?: boolean
    userId?: boolean
    followedAt?: boolean
    playlist?: boolean | PlaylistDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["playlistFollower"]>

  export type PlaylistFollowerSelectScalar = {
    playlistId?: boolean
    userId?: boolean
    followedAt?: boolean
  }

  export type PlaylistFollowerInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    playlist?: boolean | PlaylistDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type PlaylistFollowerIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    playlist?: boolean | PlaylistDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $PlaylistFollowerPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PlaylistFollower"
    objects: {
      playlist: Prisma.$PlaylistPayload<ExtArgs>
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      playlistId: string
      userId: string
      followedAt: Date
    }, ExtArgs["result"]["playlistFollower"]>
    composites: {}
  }

  type PlaylistFollowerGetPayload<S extends boolean | null | undefined | PlaylistFollowerDefaultArgs> = $Result.GetResult<Prisma.$PlaylistFollowerPayload, S>

  type PlaylistFollowerCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<PlaylistFollowerFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: PlaylistFollowerCountAggregateInputType | true
    }

  export interface PlaylistFollowerDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PlaylistFollower'], meta: { name: 'PlaylistFollower' } }
    /**
     * Find zero or one PlaylistFollower that matches the filter.
     * @param {PlaylistFollowerFindUniqueArgs} args - Arguments to find a PlaylistFollower
     * @example
     * // Get one PlaylistFollower
     * const playlistFollower = await prisma.playlistFollower.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PlaylistFollowerFindUniqueArgs>(args: SelectSubset<T, PlaylistFollowerFindUniqueArgs<ExtArgs>>): Prisma__PlaylistFollowerClient<$Result.GetResult<Prisma.$PlaylistFollowerPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one PlaylistFollower that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {PlaylistFollowerFindUniqueOrThrowArgs} args - Arguments to find a PlaylistFollower
     * @example
     * // Get one PlaylistFollower
     * const playlistFollower = await prisma.playlistFollower.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PlaylistFollowerFindUniqueOrThrowArgs>(args: SelectSubset<T, PlaylistFollowerFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PlaylistFollowerClient<$Result.GetResult<Prisma.$PlaylistFollowerPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first PlaylistFollower that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlaylistFollowerFindFirstArgs} args - Arguments to find a PlaylistFollower
     * @example
     * // Get one PlaylistFollower
     * const playlistFollower = await prisma.playlistFollower.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PlaylistFollowerFindFirstArgs>(args?: SelectSubset<T, PlaylistFollowerFindFirstArgs<ExtArgs>>): Prisma__PlaylistFollowerClient<$Result.GetResult<Prisma.$PlaylistFollowerPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first PlaylistFollower that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlaylistFollowerFindFirstOrThrowArgs} args - Arguments to find a PlaylistFollower
     * @example
     * // Get one PlaylistFollower
     * const playlistFollower = await prisma.playlistFollower.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PlaylistFollowerFindFirstOrThrowArgs>(args?: SelectSubset<T, PlaylistFollowerFindFirstOrThrowArgs<ExtArgs>>): Prisma__PlaylistFollowerClient<$Result.GetResult<Prisma.$PlaylistFollowerPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more PlaylistFollowers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlaylistFollowerFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PlaylistFollowers
     * const playlistFollowers = await prisma.playlistFollower.findMany()
     * 
     * // Get first 10 PlaylistFollowers
     * const playlistFollowers = await prisma.playlistFollower.findMany({ take: 10 })
     * 
     * // Only select the `playlistId`
     * const playlistFollowerWithPlaylistIdOnly = await prisma.playlistFollower.findMany({ select: { playlistId: true } })
     * 
     */
    findMany<T extends PlaylistFollowerFindManyArgs>(args?: SelectSubset<T, PlaylistFollowerFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PlaylistFollowerPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a PlaylistFollower.
     * @param {PlaylistFollowerCreateArgs} args - Arguments to create a PlaylistFollower.
     * @example
     * // Create one PlaylistFollower
     * const PlaylistFollower = await prisma.playlistFollower.create({
     *   data: {
     *     // ... data to create a PlaylistFollower
     *   }
     * })
     * 
     */
    create<T extends PlaylistFollowerCreateArgs>(args: SelectSubset<T, PlaylistFollowerCreateArgs<ExtArgs>>): Prisma__PlaylistFollowerClient<$Result.GetResult<Prisma.$PlaylistFollowerPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many PlaylistFollowers.
     * @param {PlaylistFollowerCreateManyArgs} args - Arguments to create many PlaylistFollowers.
     * @example
     * // Create many PlaylistFollowers
     * const playlistFollower = await prisma.playlistFollower.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PlaylistFollowerCreateManyArgs>(args?: SelectSubset<T, PlaylistFollowerCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many PlaylistFollowers and returns the data saved in the database.
     * @param {PlaylistFollowerCreateManyAndReturnArgs} args - Arguments to create many PlaylistFollowers.
     * @example
     * // Create many PlaylistFollowers
     * const playlistFollower = await prisma.playlistFollower.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many PlaylistFollowers and only return the `playlistId`
     * const playlistFollowerWithPlaylistIdOnly = await prisma.playlistFollower.createManyAndReturn({ 
     *   select: { playlistId: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PlaylistFollowerCreateManyAndReturnArgs>(args?: SelectSubset<T, PlaylistFollowerCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PlaylistFollowerPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a PlaylistFollower.
     * @param {PlaylistFollowerDeleteArgs} args - Arguments to delete one PlaylistFollower.
     * @example
     * // Delete one PlaylistFollower
     * const PlaylistFollower = await prisma.playlistFollower.delete({
     *   where: {
     *     // ... filter to delete one PlaylistFollower
     *   }
     * })
     * 
     */
    delete<T extends PlaylistFollowerDeleteArgs>(args: SelectSubset<T, PlaylistFollowerDeleteArgs<ExtArgs>>): Prisma__PlaylistFollowerClient<$Result.GetResult<Prisma.$PlaylistFollowerPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one PlaylistFollower.
     * @param {PlaylistFollowerUpdateArgs} args - Arguments to update one PlaylistFollower.
     * @example
     * // Update one PlaylistFollower
     * const playlistFollower = await prisma.playlistFollower.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PlaylistFollowerUpdateArgs>(args: SelectSubset<T, PlaylistFollowerUpdateArgs<ExtArgs>>): Prisma__PlaylistFollowerClient<$Result.GetResult<Prisma.$PlaylistFollowerPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more PlaylistFollowers.
     * @param {PlaylistFollowerDeleteManyArgs} args - Arguments to filter PlaylistFollowers to delete.
     * @example
     * // Delete a few PlaylistFollowers
     * const { count } = await prisma.playlistFollower.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PlaylistFollowerDeleteManyArgs>(args?: SelectSubset<T, PlaylistFollowerDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PlaylistFollowers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlaylistFollowerUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PlaylistFollowers
     * const playlistFollower = await prisma.playlistFollower.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PlaylistFollowerUpdateManyArgs>(args: SelectSubset<T, PlaylistFollowerUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one PlaylistFollower.
     * @param {PlaylistFollowerUpsertArgs} args - Arguments to update or create a PlaylistFollower.
     * @example
     * // Update or create a PlaylistFollower
     * const playlistFollower = await prisma.playlistFollower.upsert({
     *   create: {
     *     // ... data to create a PlaylistFollower
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PlaylistFollower we want to update
     *   }
     * })
     */
    upsert<T extends PlaylistFollowerUpsertArgs>(args: SelectSubset<T, PlaylistFollowerUpsertArgs<ExtArgs>>): Prisma__PlaylistFollowerClient<$Result.GetResult<Prisma.$PlaylistFollowerPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of PlaylistFollowers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlaylistFollowerCountArgs} args - Arguments to filter PlaylistFollowers to count.
     * @example
     * // Count the number of PlaylistFollowers
     * const count = await prisma.playlistFollower.count({
     *   where: {
     *     // ... the filter for the PlaylistFollowers we want to count
     *   }
     * })
    **/
    count<T extends PlaylistFollowerCountArgs>(
      args?: Subset<T, PlaylistFollowerCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PlaylistFollowerCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PlaylistFollower.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlaylistFollowerAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PlaylistFollowerAggregateArgs>(args: Subset<T, PlaylistFollowerAggregateArgs>): Prisma.PrismaPromise<GetPlaylistFollowerAggregateType<T>>

    /**
     * Group by PlaylistFollower.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlaylistFollowerGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PlaylistFollowerGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PlaylistFollowerGroupByArgs['orderBy'] }
        : { orderBy?: PlaylistFollowerGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PlaylistFollowerGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPlaylistFollowerGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PlaylistFollower model
   */
  readonly fields: PlaylistFollowerFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PlaylistFollower.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PlaylistFollowerClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    playlist<T extends PlaylistDefaultArgs<ExtArgs> = {}>(args?: Subset<T, PlaylistDefaultArgs<ExtArgs>>): Prisma__PlaylistClient<$Result.GetResult<Prisma.$PlaylistPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the PlaylistFollower model
   */ 
  interface PlaylistFollowerFieldRefs {
    readonly playlistId: FieldRef<"PlaylistFollower", 'String'>
    readonly userId: FieldRef<"PlaylistFollower", 'String'>
    readonly followedAt: FieldRef<"PlaylistFollower", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * PlaylistFollower findUnique
   */
  export type PlaylistFollowerFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlaylistFollower
     */
    select?: PlaylistFollowerSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlaylistFollowerInclude<ExtArgs> | null
    /**
     * Filter, which PlaylistFollower to fetch.
     */
    where: PlaylistFollowerWhereUniqueInput
  }

  /**
   * PlaylistFollower findUniqueOrThrow
   */
  export type PlaylistFollowerFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlaylistFollower
     */
    select?: PlaylistFollowerSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlaylistFollowerInclude<ExtArgs> | null
    /**
     * Filter, which PlaylistFollower to fetch.
     */
    where: PlaylistFollowerWhereUniqueInput
  }

  /**
   * PlaylistFollower findFirst
   */
  export type PlaylistFollowerFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlaylistFollower
     */
    select?: PlaylistFollowerSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlaylistFollowerInclude<ExtArgs> | null
    /**
     * Filter, which PlaylistFollower to fetch.
     */
    where?: PlaylistFollowerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PlaylistFollowers to fetch.
     */
    orderBy?: PlaylistFollowerOrderByWithRelationInput | PlaylistFollowerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PlaylistFollowers.
     */
    cursor?: PlaylistFollowerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PlaylistFollowers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PlaylistFollowers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PlaylistFollowers.
     */
    distinct?: PlaylistFollowerScalarFieldEnum | PlaylistFollowerScalarFieldEnum[]
  }

  /**
   * PlaylistFollower findFirstOrThrow
   */
  export type PlaylistFollowerFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlaylistFollower
     */
    select?: PlaylistFollowerSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlaylistFollowerInclude<ExtArgs> | null
    /**
     * Filter, which PlaylistFollower to fetch.
     */
    where?: PlaylistFollowerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PlaylistFollowers to fetch.
     */
    orderBy?: PlaylistFollowerOrderByWithRelationInput | PlaylistFollowerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PlaylistFollowers.
     */
    cursor?: PlaylistFollowerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PlaylistFollowers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PlaylistFollowers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PlaylistFollowers.
     */
    distinct?: PlaylistFollowerScalarFieldEnum | PlaylistFollowerScalarFieldEnum[]
  }

  /**
   * PlaylistFollower findMany
   */
  export type PlaylistFollowerFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlaylistFollower
     */
    select?: PlaylistFollowerSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlaylistFollowerInclude<ExtArgs> | null
    /**
     * Filter, which PlaylistFollowers to fetch.
     */
    where?: PlaylistFollowerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PlaylistFollowers to fetch.
     */
    orderBy?: PlaylistFollowerOrderByWithRelationInput | PlaylistFollowerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PlaylistFollowers.
     */
    cursor?: PlaylistFollowerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PlaylistFollowers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PlaylistFollowers.
     */
    skip?: number
    distinct?: PlaylistFollowerScalarFieldEnum | PlaylistFollowerScalarFieldEnum[]
  }

  /**
   * PlaylistFollower create
   */
  export type PlaylistFollowerCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlaylistFollower
     */
    select?: PlaylistFollowerSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlaylistFollowerInclude<ExtArgs> | null
    /**
     * The data needed to create a PlaylistFollower.
     */
    data: XOR<PlaylistFollowerCreateInput, PlaylistFollowerUncheckedCreateInput>
  }

  /**
   * PlaylistFollower createMany
   */
  export type PlaylistFollowerCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PlaylistFollowers.
     */
    data: PlaylistFollowerCreateManyInput | PlaylistFollowerCreateManyInput[]
  }

  /**
   * PlaylistFollower createManyAndReturn
   */
  export type PlaylistFollowerCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlaylistFollower
     */
    select?: PlaylistFollowerSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many PlaylistFollowers.
     */
    data: PlaylistFollowerCreateManyInput | PlaylistFollowerCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlaylistFollowerIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * PlaylistFollower update
   */
  export type PlaylistFollowerUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlaylistFollower
     */
    select?: PlaylistFollowerSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlaylistFollowerInclude<ExtArgs> | null
    /**
     * The data needed to update a PlaylistFollower.
     */
    data: XOR<PlaylistFollowerUpdateInput, PlaylistFollowerUncheckedUpdateInput>
    /**
     * Choose, which PlaylistFollower to update.
     */
    where: PlaylistFollowerWhereUniqueInput
  }

  /**
   * PlaylistFollower updateMany
   */
  export type PlaylistFollowerUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PlaylistFollowers.
     */
    data: XOR<PlaylistFollowerUpdateManyMutationInput, PlaylistFollowerUncheckedUpdateManyInput>
    /**
     * Filter which PlaylistFollowers to update
     */
    where?: PlaylistFollowerWhereInput
  }

  /**
   * PlaylistFollower upsert
   */
  export type PlaylistFollowerUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlaylistFollower
     */
    select?: PlaylistFollowerSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlaylistFollowerInclude<ExtArgs> | null
    /**
     * The filter to search for the PlaylistFollower to update in case it exists.
     */
    where: PlaylistFollowerWhereUniqueInput
    /**
     * In case the PlaylistFollower found by the `where` argument doesn't exist, create a new PlaylistFollower with this data.
     */
    create: XOR<PlaylistFollowerCreateInput, PlaylistFollowerUncheckedCreateInput>
    /**
     * In case the PlaylistFollower was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PlaylistFollowerUpdateInput, PlaylistFollowerUncheckedUpdateInput>
  }

  /**
   * PlaylistFollower delete
   */
  export type PlaylistFollowerDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlaylistFollower
     */
    select?: PlaylistFollowerSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlaylistFollowerInclude<ExtArgs> | null
    /**
     * Filter which PlaylistFollower to delete.
     */
    where: PlaylistFollowerWhereUniqueInput
  }

  /**
   * PlaylistFollower deleteMany
   */
  export type PlaylistFollowerDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PlaylistFollowers to delete
     */
    where?: PlaylistFollowerWhereInput
  }

  /**
   * PlaylistFollower without action
   */
  export type PlaylistFollowerDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlaylistFollower
     */
    select?: PlaylistFollowerSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlaylistFollowerInclude<ExtArgs> | null
  }


  /**
   * Model LikedTrack
   */

  export type AggregateLikedTrack = {
    _count: LikedTrackCountAggregateOutputType | null
    _min: LikedTrackMinAggregateOutputType | null
    _max: LikedTrackMaxAggregateOutputType | null
  }

  export type LikedTrackMinAggregateOutputType = {
    userId: string | null
    trackId: string | null
    likedAt: Date | null
  }

  export type LikedTrackMaxAggregateOutputType = {
    userId: string | null
    trackId: string | null
    likedAt: Date | null
  }

  export type LikedTrackCountAggregateOutputType = {
    userId: number
    trackId: number
    likedAt: number
    _all: number
  }


  export type LikedTrackMinAggregateInputType = {
    userId?: true
    trackId?: true
    likedAt?: true
  }

  export type LikedTrackMaxAggregateInputType = {
    userId?: true
    trackId?: true
    likedAt?: true
  }

  export type LikedTrackCountAggregateInputType = {
    userId?: true
    trackId?: true
    likedAt?: true
    _all?: true
  }

  export type LikedTrackAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which LikedTrack to aggregate.
     */
    where?: LikedTrackWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LikedTracks to fetch.
     */
    orderBy?: LikedTrackOrderByWithRelationInput | LikedTrackOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: LikedTrackWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LikedTracks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LikedTracks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned LikedTracks
    **/
    _count?: true | LikedTrackCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: LikedTrackMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: LikedTrackMaxAggregateInputType
  }

  export type GetLikedTrackAggregateType<T extends LikedTrackAggregateArgs> = {
        [P in keyof T & keyof AggregateLikedTrack]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateLikedTrack[P]>
      : GetScalarType<T[P], AggregateLikedTrack[P]>
  }




  export type LikedTrackGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: LikedTrackWhereInput
    orderBy?: LikedTrackOrderByWithAggregationInput | LikedTrackOrderByWithAggregationInput[]
    by: LikedTrackScalarFieldEnum[] | LikedTrackScalarFieldEnum
    having?: LikedTrackScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: LikedTrackCountAggregateInputType | true
    _min?: LikedTrackMinAggregateInputType
    _max?: LikedTrackMaxAggregateInputType
  }

  export type LikedTrackGroupByOutputType = {
    userId: string
    trackId: string
    likedAt: Date
    _count: LikedTrackCountAggregateOutputType | null
    _min: LikedTrackMinAggregateOutputType | null
    _max: LikedTrackMaxAggregateOutputType | null
  }

  type GetLikedTrackGroupByPayload<T extends LikedTrackGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<LikedTrackGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof LikedTrackGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], LikedTrackGroupByOutputType[P]>
            : GetScalarType<T[P], LikedTrackGroupByOutputType[P]>
        }
      >
    >


  export type LikedTrackSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    userId?: boolean
    trackId?: boolean
    likedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    track?: boolean | TrackDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["likedTrack"]>

  export type LikedTrackSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    userId?: boolean
    trackId?: boolean
    likedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    track?: boolean | TrackDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["likedTrack"]>

  export type LikedTrackSelectScalar = {
    userId?: boolean
    trackId?: boolean
    likedAt?: boolean
  }

  export type LikedTrackInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    track?: boolean | TrackDefaultArgs<ExtArgs>
  }
  export type LikedTrackIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    track?: boolean | TrackDefaultArgs<ExtArgs>
  }

  export type $LikedTrackPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "LikedTrack"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
      track: Prisma.$TrackPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      userId: string
      trackId: string
      likedAt: Date
    }, ExtArgs["result"]["likedTrack"]>
    composites: {}
  }

  type LikedTrackGetPayload<S extends boolean | null | undefined | LikedTrackDefaultArgs> = $Result.GetResult<Prisma.$LikedTrackPayload, S>

  type LikedTrackCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<LikedTrackFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: LikedTrackCountAggregateInputType | true
    }

  export interface LikedTrackDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['LikedTrack'], meta: { name: 'LikedTrack' } }
    /**
     * Find zero or one LikedTrack that matches the filter.
     * @param {LikedTrackFindUniqueArgs} args - Arguments to find a LikedTrack
     * @example
     * // Get one LikedTrack
     * const likedTrack = await prisma.likedTrack.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends LikedTrackFindUniqueArgs>(args: SelectSubset<T, LikedTrackFindUniqueArgs<ExtArgs>>): Prisma__LikedTrackClient<$Result.GetResult<Prisma.$LikedTrackPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one LikedTrack that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {LikedTrackFindUniqueOrThrowArgs} args - Arguments to find a LikedTrack
     * @example
     * // Get one LikedTrack
     * const likedTrack = await prisma.likedTrack.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends LikedTrackFindUniqueOrThrowArgs>(args: SelectSubset<T, LikedTrackFindUniqueOrThrowArgs<ExtArgs>>): Prisma__LikedTrackClient<$Result.GetResult<Prisma.$LikedTrackPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first LikedTrack that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LikedTrackFindFirstArgs} args - Arguments to find a LikedTrack
     * @example
     * // Get one LikedTrack
     * const likedTrack = await prisma.likedTrack.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends LikedTrackFindFirstArgs>(args?: SelectSubset<T, LikedTrackFindFirstArgs<ExtArgs>>): Prisma__LikedTrackClient<$Result.GetResult<Prisma.$LikedTrackPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first LikedTrack that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LikedTrackFindFirstOrThrowArgs} args - Arguments to find a LikedTrack
     * @example
     * // Get one LikedTrack
     * const likedTrack = await prisma.likedTrack.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends LikedTrackFindFirstOrThrowArgs>(args?: SelectSubset<T, LikedTrackFindFirstOrThrowArgs<ExtArgs>>): Prisma__LikedTrackClient<$Result.GetResult<Prisma.$LikedTrackPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more LikedTracks that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LikedTrackFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all LikedTracks
     * const likedTracks = await prisma.likedTrack.findMany()
     * 
     * // Get first 10 LikedTracks
     * const likedTracks = await prisma.likedTrack.findMany({ take: 10 })
     * 
     * // Only select the `userId`
     * const likedTrackWithUserIdOnly = await prisma.likedTrack.findMany({ select: { userId: true } })
     * 
     */
    findMany<T extends LikedTrackFindManyArgs>(args?: SelectSubset<T, LikedTrackFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LikedTrackPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a LikedTrack.
     * @param {LikedTrackCreateArgs} args - Arguments to create a LikedTrack.
     * @example
     * // Create one LikedTrack
     * const LikedTrack = await prisma.likedTrack.create({
     *   data: {
     *     // ... data to create a LikedTrack
     *   }
     * })
     * 
     */
    create<T extends LikedTrackCreateArgs>(args: SelectSubset<T, LikedTrackCreateArgs<ExtArgs>>): Prisma__LikedTrackClient<$Result.GetResult<Prisma.$LikedTrackPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many LikedTracks.
     * @param {LikedTrackCreateManyArgs} args - Arguments to create many LikedTracks.
     * @example
     * // Create many LikedTracks
     * const likedTrack = await prisma.likedTrack.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends LikedTrackCreateManyArgs>(args?: SelectSubset<T, LikedTrackCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many LikedTracks and returns the data saved in the database.
     * @param {LikedTrackCreateManyAndReturnArgs} args - Arguments to create many LikedTracks.
     * @example
     * // Create many LikedTracks
     * const likedTrack = await prisma.likedTrack.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many LikedTracks and only return the `userId`
     * const likedTrackWithUserIdOnly = await prisma.likedTrack.createManyAndReturn({ 
     *   select: { userId: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends LikedTrackCreateManyAndReturnArgs>(args?: SelectSubset<T, LikedTrackCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LikedTrackPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a LikedTrack.
     * @param {LikedTrackDeleteArgs} args - Arguments to delete one LikedTrack.
     * @example
     * // Delete one LikedTrack
     * const LikedTrack = await prisma.likedTrack.delete({
     *   where: {
     *     // ... filter to delete one LikedTrack
     *   }
     * })
     * 
     */
    delete<T extends LikedTrackDeleteArgs>(args: SelectSubset<T, LikedTrackDeleteArgs<ExtArgs>>): Prisma__LikedTrackClient<$Result.GetResult<Prisma.$LikedTrackPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one LikedTrack.
     * @param {LikedTrackUpdateArgs} args - Arguments to update one LikedTrack.
     * @example
     * // Update one LikedTrack
     * const likedTrack = await prisma.likedTrack.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends LikedTrackUpdateArgs>(args: SelectSubset<T, LikedTrackUpdateArgs<ExtArgs>>): Prisma__LikedTrackClient<$Result.GetResult<Prisma.$LikedTrackPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more LikedTracks.
     * @param {LikedTrackDeleteManyArgs} args - Arguments to filter LikedTracks to delete.
     * @example
     * // Delete a few LikedTracks
     * const { count } = await prisma.likedTrack.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends LikedTrackDeleteManyArgs>(args?: SelectSubset<T, LikedTrackDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more LikedTracks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LikedTrackUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many LikedTracks
     * const likedTrack = await prisma.likedTrack.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends LikedTrackUpdateManyArgs>(args: SelectSubset<T, LikedTrackUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one LikedTrack.
     * @param {LikedTrackUpsertArgs} args - Arguments to update or create a LikedTrack.
     * @example
     * // Update or create a LikedTrack
     * const likedTrack = await prisma.likedTrack.upsert({
     *   create: {
     *     // ... data to create a LikedTrack
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the LikedTrack we want to update
     *   }
     * })
     */
    upsert<T extends LikedTrackUpsertArgs>(args: SelectSubset<T, LikedTrackUpsertArgs<ExtArgs>>): Prisma__LikedTrackClient<$Result.GetResult<Prisma.$LikedTrackPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of LikedTracks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LikedTrackCountArgs} args - Arguments to filter LikedTracks to count.
     * @example
     * // Count the number of LikedTracks
     * const count = await prisma.likedTrack.count({
     *   where: {
     *     // ... the filter for the LikedTracks we want to count
     *   }
     * })
    **/
    count<T extends LikedTrackCountArgs>(
      args?: Subset<T, LikedTrackCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], LikedTrackCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a LikedTrack.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LikedTrackAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends LikedTrackAggregateArgs>(args: Subset<T, LikedTrackAggregateArgs>): Prisma.PrismaPromise<GetLikedTrackAggregateType<T>>

    /**
     * Group by LikedTrack.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LikedTrackGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends LikedTrackGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: LikedTrackGroupByArgs['orderBy'] }
        : { orderBy?: LikedTrackGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, LikedTrackGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetLikedTrackGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the LikedTrack model
   */
  readonly fields: LikedTrackFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for LikedTrack.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__LikedTrackClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    track<T extends TrackDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TrackDefaultArgs<ExtArgs>>): Prisma__TrackClient<$Result.GetResult<Prisma.$TrackPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the LikedTrack model
   */ 
  interface LikedTrackFieldRefs {
    readonly userId: FieldRef<"LikedTrack", 'String'>
    readonly trackId: FieldRef<"LikedTrack", 'String'>
    readonly likedAt: FieldRef<"LikedTrack", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * LikedTrack findUnique
   */
  export type LikedTrackFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LikedTrack
     */
    select?: LikedTrackSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LikedTrackInclude<ExtArgs> | null
    /**
     * Filter, which LikedTrack to fetch.
     */
    where: LikedTrackWhereUniqueInput
  }

  /**
   * LikedTrack findUniqueOrThrow
   */
  export type LikedTrackFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LikedTrack
     */
    select?: LikedTrackSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LikedTrackInclude<ExtArgs> | null
    /**
     * Filter, which LikedTrack to fetch.
     */
    where: LikedTrackWhereUniqueInput
  }

  /**
   * LikedTrack findFirst
   */
  export type LikedTrackFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LikedTrack
     */
    select?: LikedTrackSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LikedTrackInclude<ExtArgs> | null
    /**
     * Filter, which LikedTrack to fetch.
     */
    where?: LikedTrackWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LikedTracks to fetch.
     */
    orderBy?: LikedTrackOrderByWithRelationInput | LikedTrackOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for LikedTracks.
     */
    cursor?: LikedTrackWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LikedTracks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LikedTracks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of LikedTracks.
     */
    distinct?: LikedTrackScalarFieldEnum | LikedTrackScalarFieldEnum[]
  }

  /**
   * LikedTrack findFirstOrThrow
   */
  export type LikedTrackFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LikedTrack
     */
    select?: LikedTrackSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LikedTrackInclude<ExtArgs> | null
    /**
     * Filter, which LikedTrack to fetch.
     */
    where?: LikedTrackWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LikedTracks to fetch.
     */
    orderBy?: LikedTrackOrderByWithRelationInput | LikedTrackOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for LikedTracks.
     */
    cursor?: LikedTrackWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LikedTracks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LikedTracks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of LikedTracks.
     */
    distinct?: LikedTrackScalarFieldEnum | LikedTrackScalarFieldEnum[]
  }

  /**
   * LikedTrack findMany
   */
  export type LikedTrackFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LikedTrack
     */
    select?: LikedTrackSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LikedTrackInclude<ExtArgs> | null
    /**
     * Filter, which LikedTracks to fetch.
     */
    where?: LikedTrackWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LikedTracks to fetch.
     */
    orderBy?: LikedTrackOrderByWithRelationInput | LikedTrackOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing LikedTracks.
     */
    cursor?: LikedTrackWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LikedTracks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LikedTracks.
     */
    skip?: number
    distinct?: LikedTrackScalarFieldEnum | LikedTrackScalarFieldEnum[]
  }

  /**
   * LikedTrack create
   */
  export type LikedTrackCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LikedTrack
     */
    select?: LikedTrackSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LikedTrackInclude<ExtArgs> | null
    /**
     * The data needed to create a LikedTrack.
     */
    data: XOR<LikedTrackCreateInput, LikedTrackUncheckedCreateInput>
  }

  /**
   * LikedTrack createMany
   */
  export type LikedTrackCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many LikedTracks.
     */
    data: LikedTrackCreateManyInput | LikedTrackCreateManyInput[]
  }

  /**
   * LikedTrack createManyAndReturn
   */
  export type LikedTrackCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LikedTrack
     */
    select?: LikedTrackSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many LikedTracks.
     */
    data: LikedTrackCreateManyInput | LikedTrackCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LikedTrackIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * LikedTrack update
   */
  export type LikedTrackUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LikedTrack
     */
    select?: LikedTrackSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LikedTrackInclude<ExtArgs> | null
    /**
     * The data needed to update a LikedTrack.
     */
    data: XOR<LikedTrackUpdateInput, LikedTrackUncheckedUpdateInput>
    /**
     * Choose, which LikedTrack to update.
     */
    where: LikedTrackWhereUniqueInput
  }

  /**
   * LikedTrack updateMany
   */
  export type LikedTrackUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update LikedTracks.
     */
    data: XOR<LikedTrackUpdateManyMutationInput, LikedTrackUncheckedUpdateManyInput>
    /**
     * Filter which LikedTracks to update
     */
    where?: LikedTrackWhereInput
  }

  /**
   * LikedTrack upsert
   */
  export type LikedTrackUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LikedTrack
     */
    select?: LikedTrackSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LikedTrackInclude<ExtArgs> | null
    /**
     * The filter to search for the LikedTrack to update in case it exists.
     */
    where: LikedTrackWhereUniqueInput
    /**
     * In case the LikedTrack found by the `where` argument doesn't exist, create a new LikedTrack with this data.
     */
    create: XOR<LikedTrackCreateInput, LikedTrackUncheckedCreateInput>
    /**
     * In case the LikedTrack was found with the provided `where` argument, update it with this data.
     */
    update: XOR<LikedTrackUpdateInput, LikedTrackUncheckedUpdateInput>
  }

  /**
   * LikedTrack delete
   */
  export type LikedTrackDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LikedTrack
     */
    select?: LikedTrackSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LikedTrackInclude<ExtArgs> | null
    /**
     * Filter which LikedTrack to delete.
     */
    where: LikedTrackWhereUniqueInput
  }

  /**
   * LikedTrack deleteMany
   */
  export type LikedTrackDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which LikedTracks to delete
     */
    where?: LikedTrackWhereInput
  }

  /**
   * LikedTrack without action
   */
  export type LikedTrackDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LikedTrack
     */
    select?: LikedTrackSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LikedTrackInclude<ExtArgs> | null
  }


  /**
   * Model PlaybackHistory
   */

  export type AggregatePlaybackHistory = {
    _count: PlaybackHistoryCountAggregateOutputType | null
    _min: PlaybackHistoryMinAggregateOutputType | null
    _max: PlaybackHistoryMaxAggregateOutputType | null
  }

  export type PlaybackHistoryMinAggregateOutputType = {
    id: string | null
    userId: string | null
    trackId: string | null
    playedAt: Date | null
    contextType: string | null
    contextId: string | null
  }

  export type PlaybackHistoryMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    trackId: string | null
    playedAt: Date | null
    contextType: string | null
    contextId: string | null
  }

  export type PlaybackHistoryCountAggregateOutputType = {
    id: number
    userId: number
    trackId: number
    playedAt: number
    contextType: number
    contextId: number
    _all: number
  }


  export type PlaybackHistoryMinAggregateInputType = {
    id?: true
    userId?: true
    trackId?: true
    playedAt?: true
    contextType?: true
    contextId?: true
  }

  export type PlaybackHistoryMaxAggregateInputType = {
    id?: true
    userId?: true
    trackId?: true
    playedAt?: true
    contextType?: true
    contextId?: true
  }

  export type PlaybackHistoryCountAggregateInputType = {
    id?: true
    userId?: true
    trackId?: true
    playedAt?: true
    contextType?: true
    contextId?: true
    _all?: true
  }

  export type PlaybackHistoryAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PlaybackHistory to aggregate.
     */
    where?: PlaybackHistoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PlaybackHistories to fetch.
     */
    orderBy?: PlaybackHistoryOrderByWithRelationInput | PlaybackHistoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PlaybackHistoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PlaybackHistories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PlaybackHistories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PlaybackHistories
    **/
    _count?: true | PlaybackHistoryCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PlaybackHistoryMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PlaybackHistoryMaxAggregateInputType
  }

  export type GetPlaybackHistoryAggregateType<T extends PlaybackHistoryAggregateArgs> = {
        [P in keyof T & keyof AggregatePlaybackHistory]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePlaybackHistory[P]>
      : GetScalarType<T[P], AggregatePlaybackHistory[P]>
  }




  export type PlaybackHistoryGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PlaybackHistoryWhereInput
    orderBy?: PlaybackHistoryOrderByWithAggregationInput | PlaybackHistoryOrderByWithAggregationInput[]
    by: PlaybackHistoryScalarFieldEnum[] | PlaybackHistoryScalarFieldEnum
    having?: PlaybackHistoryScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PlaybackHistoryCountAggregateInputType | true
    _min?: PlaybackHistoryMinAggregateInputType
    _max?: PlaybackHistoryMaxAggregateInputType
  }

  export type PlaybackHistoryGroupByOutputType = {
    id: string
    userId: string
    trackId: string
    playedAt: Date
    contextType: string | null
    contextId: string | null
    _count: PlaybackHistoryCountAggregateOutputType | null
    _min: PlaybackHistoryMinAggregateOutputType | null
    _max: PlaybackHistoryMaxAggregateOutputType | null
  }

  type GetPlaybackHistoryGroupByPayload<T extends PlaybackHistoryGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PlaybackHistoryGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PlaybackHistoryGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PlaybackHistoryGroupByOutputType[P]>
            : GetScalarType<T[P], PlaybackHistoryGroupByOutputType[P]>
        }
      >
    >


  export type PlaybackHistorySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    trackId?: boolean
    playedAt?: boolean
    contextType?: boolean
    contextId?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    track?: boolean | TrackDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["playbackHistory"]>

  export type PlaybackHistorySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    trackId?: boolean
    playedAt?: boolean
    contextType?: boolean
    contextId?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    track?: boolean | TrackDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["playbackHistory"]>

  export type PlaybackHistorySelectScalar = {
    id?: boolean
    userId?: boolean
    trackId?: boolean
    playedAt?: boolean
    contextType?: boolean
    contextId?: boolean
  }

  export type PlaybackHistoryInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    track?: boolean | TrackDefaultArgs<ExtArgs>
  }
  export type PlaybackHistoryIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    track?: boolean | TrackDefaultArgs<ExtArgs>
  }

  export type $PlaybackHistoryPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PlaybackHistory"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
      track: Prisma.$TrackPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      trackId: string
      playedAt: Date
      contextType: string | null
      contextId: string | null
    }, ExtArgs["result"]["playbackHistory"]>
    composites: {}
  }

  type PlaybackHistoryGetPayload<S extends boolean | null | undefined | PlaybackHistoryDefaultArgs> = $Result.GetResult<Prisma.$PlaybackHistoryPayload, S>

  type PlaybackHistoryCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<PlaybackHistoryFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: PlaybackHistoryCountAggregateInputType | true
    }

  export interface PlaybackHistoryDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PlaybackHistory'], meta: { name: 'PlaybackHistory' } }
    /**
     * Find zero or one PlaybackHistory that matches the filter.
     * @param {PlaybackHistoryFindUniqueArgs} args - Arguments to find a PlaybackHistory
     * @example
     * // Get one PlaybackHistory
     * const playbackHistory = await prisma.playbackHistory.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PlaybackHistoryFindUniqueArgs>(args: SelectSubset<T, PlaybackHistoryFindUniqueArgs<ExtArgs>>): Prisma__PlaybackHistoryClient<$Result.GetResult<Prisma.$PlaybackHistoryPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one PlaybackHistory that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {PlaybackHistoryFindUniqueOrThrowArgs} args - Arguments to find a PlaybackHistory
     * @example
     * // Get one PlaybackHistory
     * const playbackHistory = await prisma.playbackHistory.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PlaybackHistoryFindUniqueOrThrowArgs>(args: SelectSubset<T, PlaybackHistoryFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PlaybackHistoryClient<$Result.GetResult<Prisma.$PlaybackHistoryPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first PlaybackHistory that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlaybackHistoryFindFirstArgs} args - Arguments to find a PlaybackHistory
     * @example
     * // Get one PlaybackHistory
     * const playbackHistory = await prisma.playbackHistory.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PlaybackHistoryFindFirstArgs>(args?: SelectSubset<T, PlaybackHistoryFindFirstArgs<ExtArgs>>): Prisma__PlaybackHistoryClient<$Result.GetResult<Prisma.$PlaybackHistoryPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first PlaybackHistory that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlaybackHistoryFindFirstOrThrowArgs} args - Arguments to find a PlaybackHistory
     * @example
     * // Get one PlaybackHistory
     * const playbackHistory = await prisma.playbackHistory.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PlaybackHistoryFindFirstOrThrowArgs>(args?: SelectSubset<T, PlaybackHistoryFindFirstOrThrowArgs<ExtArgs>>): Prisma__PlaybackHistoryClient<$Result.GetResult<Prisma.$PlaybackHistoryPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more PlaybackHistories that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlaybackHistoryFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PlaybackHistories
     * const playbackHistories = await prisma.playbackHistory.findMany()
     * 
     * // Get first 10 PlaybackHistories
     * const playbackHistories = await prisma.playbackHistory.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const playbackHistoryWithIdOnly = await prisma.playbackHistory.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PlaybackHistoryFindManyArgs>(args?: SelectSubset<T, PlaybackHistoryFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PlaybackHistoryPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a PlaybackHistory.
     * @param {PlaybackHistoryCreateArgs} args - Arguments to create a PlaybackHistory.
     * @example
     * // Create one PlaybackHistory
     * const PlaybackHistory = await prisma.playbackHistory.create({
     *   data: {
     *     // ... data to create a PlaybackHistory
     *   }
     * })
     * 
     */
    create<T extends PlaybackHistoryCreateArgs>(args: SelectSubset<T, PlaybackHistoryCreateArgs<ExtArgs>>): Prisma__PlaybackHistoryClient<$Result.GetResult<Prisma.$PlaybackHistoryPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many PlaybackHistories.
     * @param {PlaybackHistoryCreateManyArgs} args - Arguments to create many PlaybackHistories.
     * @example
     * // Create many PlaybackHistories
     * const playbackHistory = await prisma.playbackHistory.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PlaybackHistoryCreateManyArgs>(args?: SelectSubset<T, PlaybackHistoryCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many PlaybackHistories and returns the data saved in the database.
     * @param {PlaybackHistoryCreateManyAndReturnArgs} args - Arguments to create many PlaybackHistories.
     * @example
     * // Create many PlaybackHistories
     * const playbackHistory = await prisma.playbackHistory.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many PlaybackHistories and only return the `id`
     * const playbackHistoryWithIdOnly = await prisma.playbackHistory.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PlaybackHistoryCreateManyAndReturnArgs>(args?: SelectSubset<T, PlaybackHistoryCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PlaybackHistoryPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a PlaybackHistory.
     * @param {PlaybackHistoryDeleteArgs} args - Arguments to delete one PlaybackHistory.
     * @example
     * // Delete one PlaybackHistory
     * const PlaybackHistory = await prisma.playbackHistory.delete({
     *   where: {
     *     // ... filter to delete one PlaybackHistory
     *   }
     * })
     * 
     */
    delete<T extends PlaybackHistoryDeleteArgs>(args: SelectSubset<T, PlaybackHistoryDeleteArgs<ExtArgs>>): Prisma__PlaybackHistoryClient<$Result.GetResult<Prisma.$PlaybackHistoryPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one PlaybackHistory.
     * @param {PlaybackHistoryUpdateArgs} args - Arguments to update one PlaybackHistory.
     * @example
     * // Update one PlaybackHistory
     * const playbackHistory = await prisma.playbackHistory.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PlaybackHistoryUpdateArgs>(args: SelectSubset<T, PlaybackHistoryUpdateArgs<ExtArgs>>): Prisma__PlaybackHistoryClient<$Result.GetResult<Prisma.$PlaybackHistoryPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more PlaybackHistories.
     * @param {PlaybackHistoryDeleteManyArgs} args - Arguments to filter PlaybackHistories to delete.
     * @example
     * // Delete a few PlaybackHistories
     * const { count } = await prisma.playbackHistory.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PlaybackHistoryDeleteManyArgs>(args?: SelectSubset<T, PlaybackHistoryDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PlaybackHistories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlaybackHistoryUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PlaybackHistories
     * const playbackHistory = await prisma.playbackHistory.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PlaybackHistoryUpdateManyArgs>(args: SelectSubset<T, PlaybackHistoryUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one PlaybackHistory.
     * @param {PlaybackHistoryUpsertArgs} args - Arguments to update or create a PlaybackHistory.
     * @example
     * // Update or create a PlaybackHistory
     * const playbackHistory = await prisma.playbackHistory.upsert({
     *   create: {
     *     // ... data to create a PlaybackHistory
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PlaybackHistory we want to update
     *   }
     * })
     */
    upsert<T extends PlaybackHistoryUpsertArgs>(args: SelectSubset<T, PlaybackHistoryUpsertArgs<ExtArgs>>): Prisma__PlaybackHistoryClient<$Result.GetResult<Prisma.$PlaybackHistoryPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of PlaybackHistories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlaybackHistoryCountArgs} args - Arguments to filter PlaybackHistories to count.
     * @example
     * // Count the number of PlaybackHistories
     * const count = await prisma.playbackHistory.count({
     *   where: {
     *     // ... the filter for the PlaybackHistories we want to count
     *   }
     * })
    **/
    count<T extends PlaybackHistoryCountArgs>(
      args?: Subset<T, PlaybackHistoryCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PlaybackHistoryCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PlaybackHistory.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlaybackHistoryAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PlaybackHistoryAggregateArgs>(args: Subset<T, PlaybackHistoryAggregateArgs>): Prisma.PrismaPromise<GetPlaybackHistoryAggregateType<T>>

    /**
     * Group by PlaybackHistory.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlaybackHistoryGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PlaybackHistoryGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PlaybackHistoryGroupByArgs['orderBy'] }
        : { orderBy?: PlaybackHistoryGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PlaybackHistoryGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPlaybackHistoryGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PlaybackHistory model
   */
  readonly fields: PlaybackHistoryFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PlaybackHistory.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PlaybackHistoryClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    track<T extends TrackDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TrackDefaultArgs<ExtArgs>>): Prisma__TrackClient<$Result.GetResult<Prisma.$TrackPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the PlaybackHistory model
   */ 
  interface PlaybackHistoryFieldRefs {
    readonly id: FieldRef<"PlaybackHistory", 'String'>
    readonly userId: FieldRef<"PlaybackHistory", 'String'>
    readonly trackId: FieldRef<"PlaybackHistory", 'String'>
    readonly playedAt: FieldRef<"PlaybackHistory", 'DateTime'>
    readonly contextType: FieldRef<"PlaybackHistory", 'String'>
    readonly contextId: FieldRef<"PlaybackHistory", 'String'>
  }
    

  // Custom InputTypes
  /**
   * PlaybackHistory findUnique
   */
  export type PlaybackHistoryFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlaybackHistory
     */
    select?: PlaybackHistorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlaybackHistoryInclude<ExtArgs> | null
    /**
     * Filter, which PlaybackHistory to fetch.
     */
    where: PlaybackHistoryWhereUniqueInput
  }

  /**
   * PlaybackHistory findUniqueOrThrow
   */
  export type PlaybackHistoryFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlaybackHistory
     */
    select?: PlaybackHistorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlaybackHistoryInclude<ExtArgs> | null
    /**
     * Filter, which PlaybackHistory to fetch.
     */
    where: PlaybackHistoryWhereUniqueInput
  }

  /**
   * PlaybackHistory findFirst
   */
  export type PlaybackHistoryFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlaybackHistory
     */
    select?: PlaybackHistorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlaybackHistoryInclude<ExtArgs> | null
    /**
     * Filter, which PlaybackHistory to fetch.
     */
    where?: PlaybackHistoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PlaybackHistories to fetch.
     */
    orderBy?: PlaybackHistoryOrderByWithRelationInput | PlaybackHistoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PlaybackHistories.
     */
    cursor?: PlaybackHistoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PlaybackHistories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PlaybackHistories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PlaybackHistories.
     */
    distinct?: PlaybackHistoryScalarFieldEnum | PlaybackHistoryScalarFieldEnum[]
  }

  /**
   * PlaybackHistory findFirstOrThrow
   */
  export type PlaybackHistoryFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlaybackHistory
     */
    select?: PlaybackHistorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlaybackHistoryInclude<ExtArgs> | null
    /**
     * Filter, which PlaybackHistory to fetch.
     */
    where?: PlaybackHistoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PlaybackHistories to fetch.
     */
    orderBy?: PlaybackHistoryOrderByWithRelationInput | PlaybackHistoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PlaybackHistories.
     */
    cursor?: PlaybackHistoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PlaybackHistories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PlaybackHistories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PlaybackHistories.
     */
    distinct?: PlaybackHistoryScalarFieldEnum | PlaybackHistoryScalarFieldEnum[]
  }

  /**
   * PlaybackHistory findMany
   */
  export type PlaybackHistoryFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlaybackHistory
     */
    select?: PlaybackHistorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlaybackHistoryInclude<ExtArgs> | null
    /**
     * Filter, which PlaybackHistories to fetch.
     */
    where?: PlaybackHistoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PlaybackHistories to fetch.
     */
    orderBy?: PlaybackHistoryOrderByWithRelationInput | PlaybackHistoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PlaybackHistories.
     */
    cursor?: PlaybackHistoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PlaybackHistories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PlaybackHistories.
     */
    skip?: number
    distinct?: PlaybackHistoryScalarFieldEnum | PlaybackHistoryScalarFieldEnum[]
  }

  /**
   * PlaybackHistory create
   */
  export type PlaybackHistoryCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlaybackHistory
     */
    select?: PlaybackHistorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlaybackHistoryInclude<ExtArgs> | null
    /**
     * The data needed to create a PlaybackHistory.
     */
    data: XOR<PlaybackHistoryCreateInput, PlaybackHistoryUncheckedCreateInput>
  }

  /**
   * PlaybackHistory createMany
   */
  export type PlaybackHistoryCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PlaybackHistories.
     */
    data: PlaybackHistoryCreateManyInput | PlaybackHistoryCreateManyInput[]
  }

  /**
   * PlaybackHistory createManyAndReturn
   */
  export type PlaybackHistoryCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlaybackHistory
     */
    select?: PlaybackHistorySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many PlaybackHistories.
     */
    data: PlaybackHistoryCreateManyInput | PlaybackHistoryCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlaybackHistoryIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * PlaybackHistory update
   */
  export type PlaybackHistoryUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlaybackHistory
     */
    select?: PlaybackHistorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlaybackHistoryInclude<ExtArgs> | null
    /**
     * The data needed to update a PlaybackHistory.
     */
    data: XOR<PlaybackHistoryUpdateInput, PlaybackHistoryUncheckedUpdateInput>
    /**
     * Choose, which PlaybackHistory to update.
     */
    where: PlaybackHistoryWhereUniqueInput
  }

  /**
   * PlaybackHistory updateMany
   */
  export type PlaybackHistoryUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PlaybackHistories.
     */
    data: XOR<PlaybackHistoryUpdateManyMutationInput, PlaybackHistoryUncheckedUpdateManyInput>
    /**
     * Filter which PlaybackHistories to update
     */
    where?: PlaybackHistoryWhereInput
  }

  /**
   * PlaybackHistory upsert
   */
  export type PlaybackHistoryUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlaybackHistory
     */
    select?: PlaybackHistorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlaybackHistoryInclude<ExtArgs> | null
    /**
     * The filter to search for the PlaybackHistory to update in case it exists.
     */
    where: PlaybackHistoryWhereUniqueInput
    /**
     * In case the PlaybackHistory found by the `where` argument doesn't exist, create a new PlaybackHistory with this data.
     */
    create: XOR<PlaybackHistoryCreateInput, PlaybackHistoryUncheckedCreateInput>
    /**
     * In case the PlaybackHistory was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PlaybackHistoryUpdateInput, PlaybackHistoryUncheckedUpdateInput>
  }

  /**
   * PlaybackHistory delete
   */
  export type PlaybackHistoryDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlaybackHistory
     */
    select?: PlaybackHistorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlaybackHistoryInclude<ExtArgs> | null
    /**
     * Filter which PlaybackHistory to delete.
     */
    where: PlaybackHistoryWhereUniqueInput
  }

  /**
   * PlaybackHistory deleteMany
   */
  export type PlaybackHistoryDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PlaybackHistories to delete
     */
    where?: PlaybackHistoryWhereInput
  }

  /**
   * PlaybackHistory without action
   */
  export type PlaybackHistoryDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlaybackHistory
     */
    select?: PlaybackHistorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlaybackHistoryInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const UserScalarFieldEnum: {
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

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const ArtistScalarFieldEnum: {
    id: 'id',
    name: 'name',
    coverImg: 'coverImg',
    bio: 'bio',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type ArtistScalarFieldEnum = (typeof ArtistScalarFieldEnum)[keyof typeof ArtistScalarFieldEnum]


  export const AlbumScalarFieldEnum: {
    id: 'id',
    title: 'title',
    coverUrl: 'coverUrl',
    releaseDate: 'releaseDate',
    albumType: 'albumType',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type AlbumScalarFieldEnum = (typeof AlbumScalarFieldEnum)[keyof typeof AlbumScalarFieldEnum]


  export const TrackScalarFieldEnum: {
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

  export type TrackScalarFieldEnum = (typeof TrackScalarFieldEnum)[keyof typeof TrackScalarFieldEnum]


  export const TrackArtistScalarFieldEnum: {
    trackId: 'trackId',
    artistId: 'artistId',
    role: 'role'
  };

  export type TrackArtistScalarFieldEnum = (typeof TrackArtistScalarFieldEnum)[keyof typeof TrackArtistScalarFieldEnum]


  export const AlbumArtistScalarFieldEnum: {
    albumId: 'albumId',
    artistId: 'artistId'
  };

  export type AlbumArtistScalarFieldEnum = (typeof AlbumArtistScalarFieldEnum)[keyof typeof AlbumArtistScalarFieldEnum]


  export const TrackAudioResourceScalarFieldEnum: {
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

  export type TrackAudioResourceScalarFieldEnum = (typeof TrackAudioResourceScalarFieldEnum)[keyof typeof TrackAudioResourceScalarFieldEnum]


  export const GenreScalarFieldEnum: {
    id: 'id',
    name: 'name',
    createdAt: 'createdAt'
  };

  export type GenreScalarFieldEnum = (typeof GenreScalarFieldEnum)[keyof typeof GenreScalarFieldEnum]


  export const TrackGenreScalarFieldEnum: {
    trackId: 'trackId',
    genreId: 'genreId'
  };

  export type TrackGenreScalarFieldEnum = (typeof TrackGenreScalarFieldEnum)[keyof typeof TrackGenreScalarFieldEnum]


  export const PlaylistScalarFieldEnum: {
    id: 'id',
    ownerId: 'ownerId',
    name: 'name',
    description: 'description',
    coverUrl: 'coverUrl',
    isPublic: 'isPublic',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type PlaylistScalarFieldEnum = (typeof PlaylistScalarFieldEnum)[keyof typeof PlaylistScalarFieldEnum]


  export const PlaylistTrackScalarFieldEnum: {
    playlistId: 'playlistId',
    trackId: 'trackId',
    sortOrder: 'sortOrder',
    addedAt: 'addedAt'
  };

  export type PlaylistTrackScalarFieldEnum = (typeof PlaylistTrackScalarFieldEnum)[keyof typeof PlaylistTrackScalarFieldEnum]


  export const PlaylistFollowerScalarFieldEnum: {
    playlistId: 'playlistId',
    userId: 'userId',
    followedAt: 'followedAt'
  };

  export type PlaylistFollowerScalarFieldEnum = (typeof PlaylistFollowerScalarFieldEnum)[keyof typeof PlaylistFollowerScalarFieldEnum]


  export const LikedTrackScalarFieldEnum: {
    userId: 'userId',
    trackId: 'trackId',
    likedAt: 'likedAt'
  };

  export type LikedTrackScalarFieldEnum = (typeof LikedTrackScalarFieldEnum)[keyof typeof LikedTrackScalarFieldEnum]


  export const PlaybackHistoryScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    trackId: 'trackId',
    playedAt: 'playedAt',
    contextType: 'contextType',
    contextId: 'contextId'
  };

  export type PlaybackHistoryScalarFieldEnum = (typeof PlaybackHistoryScalarFieldEnum)[keyof typeof PlaybackHistoryScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references 
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    
  /**
   * Deep Input Types
   */


  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: StringFilter<"User"> | string
    email?: StringFilter<"User"> | string
    passwordHash?: StringFilter<"User"> | string
    displayName?: StringFilter<"User"> | string
    avatarUrl?: StringNullableFilter<"User"> | string | null
    country?: StringFilter<"User"> | string
    product?: StringFilter<"User"> | string
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    ownedPlaylists?: PlaylistListRelationFilter
    followedPlaylists?: PlaylistFollowerListRelationFilter
    likedTracks?: LikedTrackListRelationFilter
    playbackHistories?: PlaybackHistoryListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    displayName?: SortOrder
    avatarUrl?: SortOrderInput | SortOrder
    country?: SortOrder
    product?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    ownedPlaylists?: PlaylistOrderByRelationAggregateInput
    followedPlaylists?: PlaylistFollowerOrderByRelationAggregateInput
    likedTracks?: LikedTrackOrderByRelationAggregateInput
    playbackHistories?: PlaybackHistoryOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    passwordHash?: StringFilter<"User"> | string
    displayName?: StringFilter<"User"> | string
    avatarUrl?: StringNullableFilter<"User"> | string | null
    country?: StringFilter<"User"> | string
    product?: StringFilter<"User"> | string
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    ownedPlaylists?: PlaylistListRelationFilter
    followedPlaylists?: PlaylistFollowerListRelationFilter
    likedTracks?: LikedTrackListRelationFilter
    playbackHistories?: PlaybackHistoryListRelationFilter
  }, "id" | "email">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    displayName?: SortOrder
    avatarUrl?: SortOrderInput | SortOrder
    country?: SortOrder
    product?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: UserCountOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"User"> | string
    email?: StringWithAggregatesFilter<"User"> | string
    passwordHash?: StringWithAggregatesFilter<"User"> | string
    displayName?: StringWithAggregatesFilter<"User"> | string
    avatarUrl?: StringNullableWithAggregatesFilter<"User"> | string | null
    country?: StringWithAggregatesFilter<"User"> | string
    product?: StringWithAggregatesFilter<"User"> | string
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
  }

  export type ArtistWhereInput = {
    AND?: ArtistWhereInput | ArtistWhereInput[]
    OR?: ArtistWhereInput[]
    NOT?: ArtistWhereInput | ArtistWhereInput[]
    id?: StringFilter<"Artist"> | string
    name?: StringFilter<"Artist"> | string
    coverImg?: StringNullableFilter<"Artist"> | string | null
    bio?: StringNullableFilter<"Artist"> | string | null
    createdAt?: DateTimeFilter<"Artist"> | Date | string
    updatedAt?: DateTimeFilter<"Artist"> | Date | string
    tracks?: TrackArtistListRelationFilter
    albums?: AlbumArtistListRelationFilter
  }

  export type ArtistOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    coverImg?: SortOrderInput | SortOrder
    bio?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    tracks?: TrackArtistOrderByRelationAggregateInput
    albums?: AlbumArtistOrderByRelationAggregateInput
  }

  export type ArtistWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    name?: string
    AND?: ArtistWhereInput | ArtistWhereInput[]
    OR?: ArtistWhereInput[]
    NOT?: ArtistWhereInput | ArtistWhereInput[]
    coverImg?: StringNullableFilter<"Artist"> | string | null
    bio?: StringNullableFilter<"Artist"> | string | null
    createdAt?: DateTimeFilter<"Artist"> | Date | string
    updatedAt?: DateTimeFilter<"Artist"> | Date | string
    tracks?: TrackArtistListRelationFilter
    albums?: AlbumArtistListRelationFilter
  }, "id" | "name">

  export type ArtistOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    coverImg?: SortOrderInput | SortOrder
    bio?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ArtistCountOrderByAggregateInput
    _max?: ArtistMaxOrderByAggregateInput
    _min?: ArtistMinOrderByAggregateInput
  }

  export type ArtistScalarWhereWithAggregatesInput = {
    AND?: ArtistScalarWhereWithAggregatesInput | ArtistScalarWhereWithAggregatesInput[]
    OR?: ArtistScalarWhereWithAggregatesInput[]
    NOT?: ArtistScalarWhereWithAggregatesInput | ArtistScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Artist"> | string
    name?: StringWithAggregatesFilter<"Artist"> | string
    coverImg?: StringNullableWithAggregatesFilter<"Artist"> | string | null
    bio?: StringNullableWithAggregatesFilter<"Artist"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Artist"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Artist"> | Date | string
  }

  export type AlbumWhereInput = {
    AND?: AlbumWhereInput | AlbumWhereInput[]
    OR?: AlbumWhereInput[]
    NOT?: AlbumWhereInput | AlbumWhereInput[]
    id?: StringFilter<"Album"> | string
    title?: StringFilter<"Album"> | string
    coverUrl?: StringNullableFilter<"Album"> | string | null
    releaseDate?: DateTimeFilter<"Album"> | Date | string
    albumType?: StringFilter<"Album"> | string
    createdAt?: DateTimeFilter<"Album"> | Date | string
    updatedAt?: DateTimeFilter<"Album"> | Date | string
    tracks?: TrackListRelationFilter
    artists?: AlbumArtistListRelationFilter
  }

  export type AlbumOrderByWithRelationInput = {
    id?: SortOrder
    title?: SortOrder
    coverUrl?: SortOrderInput | SortOrder
    releaseDate?: SortOrder
    albumType?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    tracks?: TrackOrderByRelationAggregateInput
    artists?: AlbumArtistOrderByRelationAggregateInput
  }

  export type AlbumWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: AlbumWhereInput | AlbumWhereInput[]
    OR?: AlbumWhereInput[]
    NOT?: AlbumWhereInput | AlbumWhereInput[]
    title?: StringFilter<"Album"> | string
    coverUrl?: StringNullableFilter<"Album"> | string | null
    releaseDate?: DateTimeFilter<"Album"> | Date | string
    albumType?: StringFilter<"Album"> | string
    createdAt?: DateTimeFilter<"Album"> | Date | string
    updatedAt?: DateTimeFilter<"Album"> | Date | string
    tracks?: TrackListRelationFilter
    artists?: AlbumArtistListRelationFilter
  }, "id">

  export type AlbumOrderByWithAggregationInput = {
    id?: SortOrder
    title?: SortOrder
    coverUrl?: SortOrderInput | SortOrder
    releaseDate?: SortOrder
    albumType?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: AlbumCountOrderByAggregateInput
    _max?: AlbumMaxOrderByAggregateInput
    _min?: AlbumMinOrderByAggregateInput
  }

  export type AlbumScalarWhereWithAggregatesInput = {
    AND?: AlbumScalarWhereWithAggregatesInput | AlbumScalarWhereWithAggregatesInput[]
    OR?: AlbumScalarWhereWithAggregatesInput[]
    NOT?: AlbumScalarWhereWithAggregatesInput | AlbumScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Album"> | string
    title?: StringWithAggregatesFilter<"Album"> | string
    coverUrl?: StringNullableWithAggregatesFilter<"Album"> | string | null
    releaseDate?: DateTimeWithAggregatesFilter<"Album"> | Date | string
    albumType?: StringWithAggregatesFilter<"Album"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Album"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Album"> | Date | string
  }

  export type TrackWhereInput = {
    AND?: TrackWhereInput | TrackWhereInput[]
    OR?: TrackWhereInput[]
    NOT?: TrackWhereInput | TrackWhereInput[]
    id?: StringFilter<"Track"> | string
    albumId?: StringFilter<"Track"> | string
    title?: StringFilter<"Track"> | string
    duration?: IntFilter<"Track"> | number
    lyrics?: StringNullableFilter<"Track"> | string | null
    trackNumber?: IntFilter<"Track"> | number
    discNumber?: IntFilter<"Track"> | number
    isrc?: StringNullableFilter<"Track"> | string | null
    createdAt?: DateTimeFilter<"Track"> | Date | string
    updatedAt?: DateTimeFilter<"Track"> | Date | string
    album?: XOR<AlbumRelationFilter, AlbumWhereInput>
    artists?: TrackArtistListRelationFilter
    audioResources?: TrackAudioResourceListRelationFilter
    playlistTracks?: PlaylistTrackListRelationFilter
    likedUsers?: LikedTrackListRelationFilter
    playbacks?: PlaybackHistoryListRelationFilter
    genres?: TrackGenreListRelationFilter
  }

  export type TrackOrderByWithRelationInput = {
    id?: SortOrder
    albumId?: SortOrder
    title?: SortOrder
    duration?: SortOrder
    lyrics?: SortOrderInput | SortOrder
    trackNumber?: SortOrder
    discNumber?: SortOrder
    isrc?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    album?: AlbumOrderByWithRelationInput
    artists?: TrackArtistOrderByRelationAggregateInput
    audioResources?: TrackAudioResourceOrderByRelationAggregateInput
    playlistTracks?: PlaylistTrackOrderByRelationAggregateInput
    likedUsers?: LikedTrackOrderByRelationAggregateInput
    playbacks?: PlaybackHistoryOrderByRelationAggregateInput
    genres?: TrackGenreOrderByRelationAggregateInput
  }

  export type TrackWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    isrc?: string
    AND?: TrackWhereInput | TrackWhereInput[]
    OR?: TrackWhereInput[]
    NOT?: TrackWhereInput | TrackWhereInput[]
    albumId?: StringFilter<"Track"> | string
    title?: StringFilter<"Track"> | string
    duration?: IntFilter<"Track"> | number
    lyrics?: StringNullableFilter<"Track"> | string | null
    trackNumber?: IntFilter<"Track"> | number
    discNumber?: IntFilter<"Track"> | number
    createdAt?: DateTimeFilter<"Track"> | Date | string
    updatedAt?: DateTimeFilter<"Track"> | Date | string
    album?: XOR<AlbumRelationFilter, AlbumWhereInput>
    artists?: TrackArtistListRelationFilter
    audioResources?: TrackAudioResourceListRelationFilter
    playlistTracks?: PlaylistTrackListRelationFilter
    likedUsers?: LikedTrackListRelationFilter
    playbacks?: PlaybackHistoryListRelationFilter
    genres?: TrackGenreListRelationFilter
  }, "id" | "isrc">

  export type TrackOrderByWithAggregationInput = {
    id?: SortOrder
    albumId?: SortOrder
    title?: SortOrder
    duration?: SortOrder
    lyrics?: SortOrderInput | SortOrder
    trackNumber?: SortOrder
    discNumber?: SortOrder
    isrc?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: TrackCountOrderByAggregateInput
    _avg?: TrackAvgOrderByAggregateInput
    _max?: TrackMaxOrderByAggregateInput
    _min?: TrackMinOrderByAggregateInput
    _sum?: TrackSumOrderByAggregateInput
  }

  export type TrackScalarWhereWithAggregatesInput = {
    AND?: TrackScalarWhereWithAggregatesInput | TrackScalarWhereWithAggregatesInput[]
    OR?: TrackScalarWhereWithAggregatesInput[]
    NOT?: TrackScalarWhereWithAggregatesInput | TrackScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Track"> | string
    albumId?: StringWithAggregatesFilter<"Track"> | string
    title?: StringWithAggregatesFilter<"Track"> | string
    duration?: IntWithAggregatesFilter<"Track"> | number
    lyrics?: StringNullableWithAggregatesFilter<"Track"> | string | null
    trackNumber?: IntWithAggregatesFilter<"Track"> | number
    discNumber?: IntWithAggregatesFilter<"Track"> | number
    isrc?: StringNullableWithAggregatesFilter<"Track"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Track"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Track"> | Date | string
  }

  export type TrackArtistWhereInput = {
    AND?: TrackArtistWhereInput | TrackArtistWhereInput[]
    OR?: TrackArtistWhereInput[]
    NOT?: TrackArtistWhereInput | TrackArtistWhereInput[]
    trackId?: StringFilter<"TrackArtist"> | string
    artistId?: StringFilter<"TrackArtist"> | string
    role?: StringFilter<"TrackArtist"> | string
    track?: XOR<TrackRelationFilter, TrackWhereInput>
    artist?: XOR<ArtistRelationFilter, ArtistWhereInput>
  }

  export type TrackArtistOrderByWithRelationInput = {
    trackId?: SortOrder
    artistId?: SortOrder
    role?: SortOrder
    track?: TrackOrderByWithRelationInput
    artist?: ArtistOrderByWithRelationInput
  }

  export type TrackArtistWhereUniqueInput = Prisma.AtLeast<{
    trackId_artistId?: TrackArtistTrackIdArtistIdCompoundUniqueInput
    AND?: TrackArtistWhereInput | TrackArtistWhereInput[]
    OR?: TrackArtistWhereInput[]
    NOT?: TrackArtistWhereInput | TrackArtistWhereInput[]
    trackId?: StringFilter<"TrackArtist"> | string
    artistId?: StringFilter<"TrackArtist"> | string
    role?: StringFilter<"TrackArtist"> | string
    track?: XOR<TrackRelationFilter, TrackWhereInput>
    artist?: XOR<ArtistRelationFilter, ArtistWhereInput>
  }, "trackId_artistId">

  export type TrackArtistOrderByWithAggregationInput = {
    trackId?: SortOrder
    artistId?: SortOrder
    role?: SortOrder
    _count?: TrackArtistCountOrderByAggregateInput
    _max?: TrackArtistMaxOrderByAggregateInput
    _min?: TrackArtistMinOrderByAggregateInput
  }

  export type TrackArtistScalarWhereWithAggregatesInput = {
    AND?: TrackArtistScalarWhereWithAggregatesInput | TrackArtistScalarWhereWithAggregatesInput[]
    OR?: TrackArtistScalarWhereWithAggregatesInput[]
    NOT?: TrackArtistScalarWhereWithAggregatesInput | TrackArtistScalarWhereWithAggregatesInput[]
    trackId?: StringWithAggregatesFilter<"TrackArtist"> | string
    artistId?: StringWithAggregatesFilter<"TrackArtist"> | string
    role?: StringWithAggregatesFilter<"TrackArtist"> | string
  }

  export type AlbumArtistWhereInput = {
    AND?: AlbumArtistWhereInput | AlbumArtistWhereInput[]
    OR?: AlbumArtistWhereInput[]
    NOT?: AlbumArtistWhereInput | AlbumArtistWhereInput[]
    albumId?: StringFilter<"AlbumArtist"> | string
    artistId?: StringFilter<"AlbumArtist"> | string
    album?: XOR<AlbumRelationFilter, AlbumWhereInput>
    artist?: XOR<ArtistRelationFilter, ArtistWhereInput>
  }

  export type AlbumArtistOrderByWithRelationInput = {
    albumId?: SortOrder
    artistId?: SortOrder
    album?: AlbumOrderByWithRelationInput
    artist?: ArtistOrderByWithRelationInput
  }

  export type AlbumArtistWhereUniqueInput = Prisma.AtLeast<{
    albumId_artistId?: AlbumArtistAlbumIdArtistIdCompoundUniqueInput
    AND?: AlbumArtistWhereInput | AlbumArtistWhereInput[]
    OR?: AlbumArtistWhereInput[]
    NOT?: AlbumArtistWhereInput | AlbumArtistWhereInput[]
    albumId?: StringFilter<"AlbumArtist"> | string
    artistId?: StringFilter<"AlbumArtist"> | string
    album?: XOR<AlbumRelationFilter, AlbumWhereInput>
    artist?: XOR<ArtistRelationFilter, ArtistWhereInput>
  }, "albumId_artistId">

  export type AlbumArtistOrderByWithAggregationInput = {
    albumId?: SortOrder
    artistId?: SortOrder
    _count?: AlbumArtistCountOrderByAggregateInput
    _max?: AlbumArtistMaxOrderByAggregateInput
    _min?: AlbumArtistMinOrderByAggregateInput
  }

  export type AlbumArtistScalarWhereWithAggregatesInput = {
    AND?: AlbumArtistScalarWhereWithAggregatesInput | AlbumArtistScalarWhereWithAggregatesInput[]
    OR?: AlbumArtistScalarWhereWithAggregatesInput[]
    NOT?: AlbumArtistScalarWhereWithAggregatesInput | AlbumArtistScalarWhereWithAggregatesInput[]
    albumId?: StringWithAggregatesFilter<"AlbumArtist"> | string
    artistId?: StringWithAggregatesFilter<"AlbumArtist"> | string
  }

  export type TrackAudioResourceWhereInput = {
    AND?: TrackAudioResourceWhereInput | TrackAudioResourceWhereInput[]
    OR?: TrackAudioResourceWhereInput[]
    NOT?: TrackAudioResourceWhereInput | TrackAudioResourceWhereInput[]
    id?: StringFilter<"TrackAudioResource"> | string
    trackId?: StringFilter<"TrackAudioResource"> | string
    quality?: StringFilter<"TrackAudioResource"> | string
    format?: StringFilter<"TrackAudioResource"> | string
    bitrate?: IntFilter<"TrackAudioResource"> | number
    streamUrl?: StringFilter<"TrackAudioResource"> | string
    size?: IntFilter<"TrackAudioResource"> | number
    isPremiumOnly?: BoolFilter<"TrackAudioResource"> | boolean
    createdAt?: DateTimeFilter<"TrackAudioResource"> | Date | string
    track?: XOR<TrackRelationFilter, TrackWhereInput>
  }

  export type TrackAudioResourceOrderByWithRelationInput = {
    id?: SortOrder
    trackId?: SortOrder
    quality?: SortOrder
    format?: SortOrder
    bitrate?: SortOrder
    streamUrl?: SortOrder
    size?: SortOrder
    isPremiumOnly?: SortOrder
    createdAt?: SortOrder
    track?: TrackOrderByWithRelationInput
  }

  export type TrackAudioResourceWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: TrackAudioResourceWhereInput | TrackAudioResourceWhereInput[]
    OR?: TrackAudioResourceWhereInput[]
    NOT?: TrackAudioResourceWhereInput | TrackAudioResourceWhereInput[]
    trackId?: StringFilter<"TrackAudioResource"> | string
    quality?: StringFilter<"TrackAudioResource"> | string
    format?: StringFilter<"TrackAudioResource"> | string
    bitrate?: IntFilter<"TrackAudioResource"> | number
    streamUrl?: StringFilter<"TrackAudioResource"> | string
    size?: IntFilter<"TrackAudioResource"> | number
    isPremiumOnly?: BoolFilter<"TrackAudioResource"> | boolean
    createdAt?: DateTimeFilter<"TrackAudioResource"> | Date | string
    track?: XOR<TrackRelationFilter, TrackWhereInput>
  }, "id">

  export type TrackAudioResourceOrderByWithAggregationInput = {
    id?: SortOrder
    trackId?: SortOrder
    quality?: SortOrder
    format?: SortOrder
    bitrate?: SortOrder
    streamUrl?: SortOrder
    size?: SortOrder
    isPremiumOnly?: SortOrder
    createdAt?: SortOrder
    _count?: TrackAudioResourceCountOrderByAggregateInput
    _avg?: TrackAudioResourceAvgOrderByAggregateInput
    _max?: TrackAudioResourceMaxOrderByAggregateInput
    _min?: TrackAudioResourceMinOrderByAggregateInput
    _sum?: TrackAudioResourceSumOrderByAggregateInput
  }

  export type TrackAudioResourceScalarWhereWithAggregatesInput = {
    AND?: TrackAudioResourceScalarWhereWithAggregatesInput | TrackAudioResourceScalarWhereWithAggregatesInput[]
    OR?: TrackAudioResourceScalarWhereWithAggregatesInput[]
    NOT?: TrackAudioResourceScalarWhereWithAggregatesInput | TrackAudioResourceScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"TrackAudioResource"> | string
    trackId?: StringWithAggregatesFilter<"TrackAudioResource"> | string
    quality?: StringWithAggregatesFilter<"TrackAudioResource"> | string
    format?: StringWithAggregatesFilter<"TrackAudioResource"> | string
    bitrate?: IntWithAggregatesFilter<"TrackAudioResource"> | number
    streamUrl?: StringWithAggregatesFilter<"TrackAudioResource"> | string
    size?: IntWithAggregatesFilter<"TrackAudioResource"> | number
    isPremiumOnly?: BoolWithAggregatesFilter<"TrackAudioResource"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"TrackAudioResource"> | Date | string
  }

  export type GenreWhereInput = {
    AND?: GenreWhereInput | GenreWhereInput[]
    OR?: GenreWhereInput[]
    NOT?: GenreWhereInput | GenreWhereInput[]
    id?: StringFilter<"Genre"> | string
    name?: StringFilter<"Genre"> | string
    createdAt?: DateTimeFilter<"Genre"> | Date | string
    tracks?: TrackGenreListRelationFilter
  }

  export type GenreOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    tracks?: TrackGenreOrderByRelationAggregateInput
  }

  export type GenreWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    name?: string
    AND?: GenreWhereInput | GenreWhereInput[]
    OR?: GenreWhereInput[]
    NOT?: GenreWhereInput | GenreWhereInput[]
    createdAt?: DateTimeFilter<"Genre"> | Date | string
    tracks?: TrackGenreListRelationFilter
  }, "id" | "name">

  export type GenreOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    _count?: GenreCountOrderByAggregateInput
    _max?: GenreMaxOrderByAggregateInput
    _min?: GenreMinOrderByAggregateInput
  }

  export type GenreScalarWhereWithAggregatesInput = {
    AND?: GenreScalarWhereWithAggregatesInput | GenreScalarWhereWithAggregatesInput[]
    OR?: GenreScalarWhereWithAggregatesInput[]
    NOT?: GenreScalarWhereWithAggregatesInput | GenreScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Genre"> | string
    name?: StringWithAggregatesFilter<"Genre"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Genre"> | Date | string
  }

  export type TrackGenreWhereInput = {
    AND?: TrackGenreWhereInput | TrackGenreWhereInput[]
    OR?: TrackGenreWhereInput[]
    NOT?: TrackGenreWhereInput | TrackGenreWhereInput[]
    trackId?: StringFilter<"TrackGenre"> | string
    genreId?: StringFilter<"TrackGenre"> | string
    track?: XOR<TrackRelationFilter, TrackWhereInput>
    genre?: XOR<GenreRelationFilter, GenreWhereInput>
  }

  export type TrackGenreOrderByWithRelationInput = {
    trackId?: SortOrder
    genreId?: SortOrder
    track?: TrackOrderByWithRelationInput
    genre?: GenreOrderByWithRelationInput
  }

  export type TrackGenreWhereUniqueInput = Prisma.AtLeast<{
    trackId_genreId?: TrackGenreTrackIdGenreIdCompoundUniqueInput
    AND?: TrackGenreWhereInput | TrackGenreWhereInput[]
    OR?: TrackGenreWhereInput[]
    NOT?: TrackGenreWhereInput | TrackGenreWhereInput[]
    trackId?: StringFilter<"TrackGenre"> | string
    genreId?: StringFilter<"TrackGenre"> | string
    track?: XOR<TrackRelationFilter, TrackWhereInput>
    genre?: XOR<GenreRelationFilter, GenreWhereInput>
  }, "trackId_genreId">

  export type TrackGenreOrderByWithAggregationInput = {
    trackId?: SortOrder
    genreId?: SortOrder
    _count?: TrackGenreCountOrderByAggregateInput
    _max?: TrackGenreMaxOrderByAggregateInput
    _min?: TrackGenreMinOrderByAggregateInput
  }

  export type TrackGenreScalarWhereWithAggregatesInput = {
    AND?: TrackGenreScalarWhereWithAggregatesInput | TrackGenreScalarWhereWithAggregatesInput[]
    OR?: TrackGenreScalarWhereWithAggregatesInput[]
    NOT?: TrackGenreScalarWhereWithAggregatesInput | TrackGenreScalarWhereWithAggregatesInput[]
    trackId?: StringWithAggregatesFilter<"TrackGenre"> | string
    genreId?: StringWithAggregatesFilter<"TrackGenre"> | string
  }

  export type PlaylistWhereInput = {
    AND?: PlaylistWhereInput | PlaylistWhereInput[]
    OR?: PlaylistWhereInput[]
    NOT?: PlaylistWhereInput | PlaylistWhereInput[]
    id?: StringFilter<"Playlist"> | string
    ownerId?: StringFilter<"Playlist"> | string
    name?: StringFilter<"Playlist"> | string
    description?: StringNullableFilter<"Playlist"> | string | null
    coverUrl?: StringNullableFilter<"Playlist"> | string | null
    isPublic?: BoolFilter<"Playlist"> | boolean
    createdAt?: DateTimeFilter<"Playlist"> | Date | string
    updatedAt?: DateTimeFilter<"Playlist"> | Date | string
    owner?: XOR<UserRelationFilter, UserWhereInput>
    tracks?: PlaylistTrackListRelationFilter
    followers?: PlaylistFollowerListRelationFilter
  }

  export type PlaylistOrderByWithRelationInput = {
    id?: SortOrder
    ownerId?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    coverUrl?: SortOrderInput | SortOrder
    isPublic?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    owner?: UserOrderByWithRelationInput
    tracks?: PlaylistTrackOrderByRelationAggregateInput
    followers?: PlaylistFollowerOrderByRelationAggregateInput
  }

  export type PlaylistWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: PlaylistWhereInput | PlaylistWhereInput[]
    OR?: PlaylistWhereInput[]
    NOT?: PlaylistWhereInput | PlaylistWhereInput[]
    ownerId?: StringFilter<"Playlist"> | string
    name?: StringFilter<"Playlist"> | string
    description?: StringNullableFilter<"Playlist"> | string | null
    coverUrl?: StringNullableFilter<"Playlist"> | string | null
    isPublic?: BoolFilter<"Playlist"> | boolean
    createdAt?: DateTimeFilter<"Playlist"> | Date | string
    updatedAt?: DateTimeFilter<"Playlist"> | Date | string
    owner?: XOR<UserRelationFilter, UserWhereInput>
    tracks?: PlaylistTrackListRelationFilter
    followers?: PlaylistFollowerListRelationFilter
  }, "id">

  export type PlaylistOrderByWithAggregationInput = {
    id?: SortOrder
    ownerId?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    coverUrl?: SortOrderInput | SortOrder
    isPublic?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: PlaylistCountOrderByAggregateInput
    _max?: PlaylistMaxOrderByAggregateInput
    _min?: PlaylistMinOrderByAggregateInput
  }

  export type PlaylistScalarWhereWithAggregatesInput = {
    AND?: PlaylistScalarWhereWithAggregatesInput | PlaylistScalarWhereWithAggregatesInput[]
    OR?: PlaylistScalarWhereWithAggregatesInput[]
    NOT?: PlaylistScalarWhereWithAggregatesInput | PlaylistScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Playlist"> | string
    ownerId?: StringWithAggregatesFilter<"Playlist"> | string
    name?: StringWithAggregatesFilter<"Playlist"> | string
    description?: StringNullableWithAggregatesFilter<"Playlist"> | string | null
    coverUrl?: StringNullableWithAggregatesFilter<"Playlist"> | string | null
    isPublic?: BoolWithAggregatesFilter<"Playlist"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"Playlist"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Playlist"> | Date | string
  }

  export type PlaylistTrackWhereInput = {
    AND?: PlaylistTrackWhereInput | PlaylistTrackWhereInput[]
    OR?: PlaylistTrackWhereInput[]
    NOT?: PlaylistTrackWhereInput | PlaylistTrackWhereInput[]
    playlistId?: StringFilter<"PlaylistTrack"> | string
    trackId?: StringFilter<"PlaylistTrack"> | string
    sortOrder?: IntFilter<"PlaylistTrack"> | number
    addedAt?: DateTimeFilter<"PlaylistTrack"> | Date | string
    playlist?: XOR<PlaylistRelationFilter, PlaylistWhereInput>
    track?: XOR<TrackRelationFilter, TrackWhereInput>
  }

  export type PlaylistTrackOrderByWithRelationInput = {
    playlistId?: SortOrder
    trackId?: SortOrder
    sortOrder?: SortOrder
    addedAt?: SortOrder
    playlist?: PlaylistOrderByWithRelationInput
    track?: TrackOrderByWithRelationInput
  }

  export type PlaylistTrackWhereUniqueInput = Prisma.AtLeast<{
    playlistId_trackId?: PlaylistTrackPlaylistIdTrackIdCompoundUniqueInput
    AND?: PlaylistTrackWhereInput | PlaylistTrackWhereInput[]
    OR?: PlaylistTrackWhereInput[]
    NOT?: PlaylistTrackWhereInput | PlaylistTrackWhereInput[]
    playlistId?: StringFilter<"PlaylistTrack"> | string
    trackId?: StringFilter<"PlaylistTrack"> | string
    sortOrder?: IntFilter<"PlaylistTrack"> | number
    addedAt?: DateTimeFilter<"PlaylistTrack"> | Date | string
    playlist?: XOR<PlaylistRelationFilter, PlaylistWhereInput>
    track?: XOR<TrackRelationFilter, TrackWhereInput>
  }, "playlistId_trackId">

  export type PlaylistTrackOrderByWithAggregationInput = {
    playlistId?: SortOrder
    trackId?: SortOrder
    sortOrder?: SortOrder
    addedAt?: SortOrder
    _count?: PlaylistTrackCountOrderByAggregateInput
    _avg?: PlaylistTrackAvgOrderByAggregateInput
    _max?: PlaylistTrackMaxOrderByAggregateInput
    _min?: PlaylistTrackMinOrderByAggregateInput
    _sum?: PlaylistTrackSumOrderByAggregateInput
  }

  export type PlaylistTrackScalarWhereWithAggregatesInput = {
    AND?: PlaylistTrackScalarWhereWithAggregatesInput | PlaylistTrackScalarWhereWithAggregatesInput[]
    OR?: PlaylistTrackScalarWhereWithAggregatesInput[]
    NOT?: PlaylistTrackScalarWhereWithAggregatesInput | PlaylistTrackScalarWhereWithAggregatesInput[]
    playlistId?: StringWithAggregatesFilter<"PlaylistTrack"> | string
    trackId?: StringWithAggregatesFilter<"PlaylistTrack"> | string
    sortOrder?: IntWithAggregatesFilter<"PlaylistTrack"> | number
    addedAt?: DateTimeWithAggregatesFilter<"PlaylistTrack"> | Date | string
  }

  export type PlaylistFollowerWhereInput = {
    AND?: PlaylistFollowerWhereInput | PlaylistFollowerWhereInput[]
    OR?: PlaylistFollowerWhereInput[]
    NOT?: PlaylistFollowerWhereInput | PlaylistFollowerWhereInput[]
    playlistId?: StringFilter<"PlaylistFollower"> | string
    userId?: StringFilter<"PlaylistFollower"> | string
    followedAt?: DateTimeFilter<"PlaylistFollower"> | Date | string
    playlist?: XOR<PlaylistRelationFilter, PlaylistWhereInput>
    user?: XOR<UserRelationFilter, UserWhereInput>
  }

  export type PlaylistFollowerOrderByWithRelationInput = {
    playlistId?: SortOrder
    userId?: SortOrder
    followedAt?: SortOrder
    playlist?: PlaylistOrderByWithRelationInput
    user?: UserOrderByWithRelationInput
  }

  export type PlaylistFollowerWhereUniqueInput = Prisma.AtLeast<{
    playlistId_userId?: PlaylistFollowerPlaylistIdUserIdCompoundUniqueInput
    AND?: PlaylistFollowerWhereInput | PlaylistFollowerWhereInput[]
    OR?: PlaylistFollowerWhereInput[]
    NOT?: PlaylistFollowerWhereInput | PlaylistFollowerWhereInput[]
    playlistId?: StringFilter<"PlaylistFollower"> | string
    userId?: StringFilter<"PlaylistFollower"> | string
    followedAt?: DateTimeFilter<"PlaylistFollower"> | Date | string
    playlist?: XOR<PlaylistRelationFilter, PlaylistWhereInput>
    user?: XOR<UserRelationFilter, UserWhereInput>
  }, "playlistId_userId">

  export type PlaylistFollowerOrderByWithAggregationInput = {
    playlistId?: SortOrder
    userId?: SortOrder
    followedAt?: SortOrder
    _count?: PlaylistFollowerCountOrderByAggregateInput
    _max?: PlaylistFollowerMaxOrderByAggregateInput
    _min?: PlaylistFollowerMinOrderByAggregateInput
  }

  export type PlaylistFollowerScalarWhereWithAggregatesInput = {
    AND?: PlaylistFollowerScalarWhereWithAggregatesInput | PlaylistFollowerScalarWhereWithAggregatesInput[]
    OR?: PlaylistFollowerScalarWhereWithAggregatesInput[]
    NOT?: PlaylistFollowerScalarWhereWithAggregatesInput | PlaylistFollowerScalarWhereWithAggregatesInput[]
    playlistId?: StringWithAggregatesFilter<"PlaylistFollower"> | string
    userId?: StringWithAggregatesFilter<"PlaylistFollower"> | string
    followedAt?: DateTimeWithAggregatesFilter<"PlaylistFollower"> | Date | string
  }

  export type LikedTrackWhereInput = {
    AND?: LikedTrackWhereInput | LikedTrackWhereInput[]
    OR?: LikedTrackWhereInput[]
    NOT?: LikedTrackWhereInput | LikedTrackWhereInput[]
    userId?: StringFilter<"LikedTrack"> | string
    trackId?: StringFilter<"LikedTrack"> | string
    likedAt?: DateTimeFilter<"LikedTrack"> | Date | string
    user?: XOR<UserRelationFilter, UserWhereInput>
    track?: XOR<TrackRelationFilter, TrackWhereInput>
  }

  export type LikedTrackOrderByWithRelationInput = {
    userId?: SortOrder
    trackId?: SortOrder
    likedAt?: SortOrder
    user?: UserOrderByWithRelationInput
    track?: TrackOrderByWithRelationInput
  }

  export type LikedTrackWhereUniqueInput = Prisma.AtLeast<{
    userId_trackId?: LikedTrackUserIdTrackIdCompoundUniqueInput
    AND?: LikedTrackWhereInput | LikedTrackWhereInput[]
    OR?: LikedTrackWhereInput[]
    NOT?: LikedTrackWhereInput | LikedTrackWhereInput[]
    userId?: StringFilter<"LikedTrack"> | string
    trackId?: StringFilter<"LikedTrack"> | string
    likedAt?: DateTimeFilter<"LikedTrack"> | Date | string
    user?: XOR<UserRelationFilter, UserWhereInput>
    track?: XOR<TrackRelationFilter, TrackWhereInput>
  }, "userId_trackId">

  export type LikedTrackOrderByWithAggregationInput = {
    userId?: SortOrder
    trackId?: SortOrder
    likedAt?: SortOrder
    _count?: LikedTrackCountOrderByAggregateInput
    _max?: LikedTrackMaxOrderByAggregateInput
    _min?: LikedTrackMinOrderByAggregateInput
  }

  export type LikedTrackScalarWhereWithAggregatesInput = {
    AND?: LikedTrackScalarWhereWithAggregatesInput | LikedTrackScalarWhereWithAggregatesInput[]
    OR?: LikedTrackScalarWhereWithAggregatesInput[]
    NOT?: LikedTrackScalarWhereWithAggregatesInput | LikedTrackScalarWhereWithAggregatesInput[]
    userId?: StringWithAggregatesFilter<"LikedTrack"> | string
    trackId?: StringWithAggregatesFilter<"LikedTrack"> | string
    likedAt?: DateTimeWithAggregatesFilter<"LikedTrack"> | Date | string
  }

  export type PlaybackHistoryWhereInput = {
    AND?: PlaybackHistoryWhereInput | PlaybackHistoryWhereInput[]
    OR?: PlaybackHistoryWhereInput[]
    NOT?: PlaybackHistoryWhereInput | PlaybackHistoryWhereInput[]
    id?: StringFilter<"PlaybackHistory"> | string
    userId?: StringFilter<"PlaybackHistory"> | string
    trackId?: StringFilter<"PlaybackHistory"> | string
    playedAt?: DateTimeFilter<"PlaybackHistory"> | Date | string
    contextType?: StringNullableFilter<"PlaybackHistory"> | string | null
    contextId?: StringNullableFilter<"PlaybackHistory"> | string | null
    user?: XOR<UserRelationFilter, UserWhereInput>
    track?: XOR<TrackRelationFilter, TrackWhereInput>
  }

  export type PlaybackHistoryOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    trackId?: SortOrder
    playedAt?: SortOrder
    contextType?: SortOrderInput | SortOrder
    contextId?: SortOrderInput | SortOrder
    user?: UserOrderByWithRelationInput
    track?: TrackOrderByWithRelationInput
  }

  export type PlaybackHistoryWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: PlaybackHistoryWhereInput | PlaybackHistoryWhereInput[]
    OR?: PlaybackHistoryWhereInput[]
    NOT?: PlaybackHistoryWhereInput | PlaybackHistoryWhereInput[]
    userId?: StringFilter<"PlaybackHistory"> | string
    trackId?: StringFilter<"PlaybackHistory"> | string
    playedAt?: DateTimeFilter<"PlaybackHistory"> | Date | string
    contextType?: StringNullableFilter<"PlaybackHistory"> | string | null
    contextId?: StringNullableFilter<"PlaybackHistory"> | string | null
    user?: XOR<UserRelationFilter, UserWhereInput>
    track?: XOR<TrackRelationFilter, TrackWhereInput>
  }, "id">

  export type PlaybackHistoryOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    trackId?: SortOrder
    playedAt?: SortOrder
    contextType?: SortOrderInput | SortOrder
    contextId?: SortOrderInput | SortOrder
    _count?: PlaybackHistoryCountOrderByAggregateInput
    _max?: PlaybackHistoryMaxOrderByAggregateInput
    _min?: PlaybackHistoryMinOrderByAggregateInput
  }

  export type PlaybackHistoryScalarWhereWithAggregatesInput = {
    AND?: PlaybackHistoryScalarWhereWithAggregatesInput | PlaybackHistoryScalarWhereWithAggregatesInput[]
    OR?: PlaybackHistoryScalarWhereWithAggregatesInput[]
    NOT?: PlaybackHistoryScalarWhereWithAggregatesInput | PlaybackHistoryScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"PlaybackHistory"> | string
    userId?: StringWithAggregatesFilter<"PlaybackHistory"> | string
    trackId?: StringWithAggregatesFilter<"PlaybackHistory"> | string
    playedAt?: DateTimeWithAggregatesFilter<"PlaybackHistory"> | Date | string
    contextType?: StringNullableWithAggregatesFilter<"PlaybackHistory"> | string | null
    contextId?: StringNullableWithAggregatesFilter<"PlaybackHistory"> | string | null
  }

  export type UserCreateInput = {
    id?: string
    email: string
    passwordHash: string
    displayName: string
    avatarUrl?: string | null
    country?: string
    product?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    ownedPlaylists?: PlaylistCreateNestedManyWithoutOwnerInput
    followedPlaylists?: PlaylistFollowerCreateNestedManyWithoutUserInput
    likedTracks?: LikedTrackCreateNestedManyWithoutUserInput
    playbackHistories?: PlaybackHistoryCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateInput = {
    id?: string
    email: string
    passwordHash: string
    displayName: string
    avatarUrl?: string | null
    country?: string
    product?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    ownedPlaylists?: PlaylistUncheckedCreateNestedManyWithoutOwnerInput
    followedPlaylists?: PlaylistFollowerUncheckedCreateNestedManyWithoutUserInput
    likedTracks?: LikedTrackUncheckedCreateNestedManyWithoutUserInput
    playbackHistories?: PlaybackHistoryUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    country?: StringFieldUpdateOperationsInput | string
    product?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    ownedPlaylists?: PlaylistUpdateManyWithoutOwnerNestedInput
    followedPlaylists?: PlaylistFollowerUpdateManyWithoutUserNestedInput
    likedTracks?: LikedTrackUpdateManyWithoutUserNestedInput
    playbackHistories?: PlaybackHistoryUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    country?: StringFieldUpdateOperationsInput | string
    product?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    ownedPlaylists?: PlaylistUncheckedUpdateManyWithoutOwnerNestedInput
    followedPlaylists?: PlaylistFollowerUncheckedUpdateManyWithoutUserNestedInput
    likedTracks?: LikedTrackUncheckedUpdateManyWithoutUserNestedInput
    playbackHistories?: PlaybackHistoryUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateManyInput = {
    id?: string
    email: string
    passwordHash: string
    displayName: string
    avatarUrl?: string | null
    country?: string
    product?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    country?: StringFieldUpdateOperationsInput | string
    product?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    country?: StringFieldUpdateOperationsInput | string
    product?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ArtistCreateInput = {
    id?: string
    name: string
    coverImg?: string | null
    bio?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    tracks?: TrackArtistCreateNestedManyWithoutArtistInput
    albums?: AlbumArtistCreateNestedManyWithoutArtistInput
  }

  export type ArtistUncheckedCreateInput = {
    id?: string
    name: string
    coverImg?: string | null
    bio?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    tracks?: TrackArtistUncheckedCreateNestedManyWithoutArtistInput
    albums?: AlbumArtistUncheckedCreateNestedManyWithoutArtistInput
  }

  export type ArtistUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    coverImg?: NullableStringFieldUpdateOperationsInput | string | null
    bio?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tracks?: TrackArtistUpdateManyWithoutArtistNestedInput
    albums?: AlbumArtistUpdateManyWithoutArtistNestedInput
  }

  export type ArtistUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    coverImg?: NullableStringFieldUpdateOperationsInput | string | null
    bio?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tracks?: TrackArtistUncheckedUpdateManyWithoutArtistNestedInput
    albums?: AlbumArtistUncheckedUpdateManyWithoutArtistNestedInput
  }

  export type ArtistCreateManyInput = {
    id?: string
    name: string
    coverImg?: string | null
    bio?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ArtistUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    coverImg?: NullableStringFieldUpdateOperationsInput | string | null
    bio?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ArtistUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    coverImg?: NullableStringFieldUpdateOperationsInput | string | null
    bio?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AlbumCreateInput = {
    id?: string
    title: string
    coverUrl?: string | null
    releaseDate: Date | string
    albumType?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    tracks?: TrackCreateNestedManyWithoutAlbumInput
    artists?: AlbumArtistCreateNestedManyWithoutAlbumInput
  }

  export type AlbumUncheckedCreateInput = {
    id?: string
    title: string
    coverUrl?: string | null
    releaseDate: Date | string
    albumType?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    tracks?: TrackUncheckedCreateNestedManyWithoutAlbumInput
    artists?: AlbumArtistUncheckedCreateNestedManyWithoutAlbumInput
  }

  export type AlbumUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    coverUrl?: NullableStringFieldUpdateOperationsInput | string | null
    releaseDate?: DateTimeFieldUpdateOperationsInput | Date | string
    albumType?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tracks?: TrackUpdateManyWithoutAlbumNestedInput
    artists?: AlbumArtistUpdateManyWithoutAlbumNestedInput
  }

  export type AlbumUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    coverUrl?: NullableStringFieldUpdateOperationsInput | string | null
    releaseDate?: DateTimeFieldUpdateOperationsInput | Date | string
    albumType?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tracks?: TrackUncheckedUpdateManyWithoutAlbumNestedInput
    artists?: AlbumArtistUncheckedUpdateManyWithoutAlbumNestedInput
  }

  export type AlbumCreateManyInput = {
    id?: string
    title: string
    coverUrl?: string | null
    releaseDate: Date | string
    albumType?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AlbumUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    coverUrl?: NullableStringFieldUpdateOperationsInput | string | null
    releaseDate?: DateTimeFieldUpdateOperationsInput | Date | string
    albumType?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AlbumUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    coverUrl?: NullableStringFieldUpdateOperationsInput | string | null
    releaseDate?: DateTimeFieldUpdateOperationsInput | Date | string
    albumType?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TrackCreateInput = {
    id?: string
    title: string
    duration: number
    lyrics?: string | null
    trackNumber: number
    discNumber?: number
    isrc?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    album: AlbumCreateNestedOneWithoutTracksInput
    artists?: TrackArtistCreateNestedManyWithoutTrackInput
    audioResources?: TrackAudioResourceCreateNestedManyWithoutTrackInput
    playlistTracks?: PlaylistTrackCreateNestedManyWithoutTrackInput
    likedUsers?: LikedTrackCreateNestedManyWithoutTrackInput
    playbacks?: PlaybackHistoryCreateNestedManyWithoutTrackInput
    genres?: TrackGenreCreateNestedManyWithoutTrackInput
  }

  export type TrackUncheckedCreateInput = {
    id?: string
    albumId: string
    title: string
    duration: number
    lyrics?: string | null
    trackNumber: number
    discNumber?: number
    isrc?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    artists?: TrackArtistUncheckedCreateNestedManyWithoutTrackInput
    audioResources?: TrackAudioResourceUncheckedCreateNestedManyWithoutTrackInput
    playlistTracks?: PlaylistTrackUncheckedCreateNestedManyWithoutTrackInput
    likedUsers?: LikedTrackUncheckedCreateNestedManyWithoutTrackInput
    playbacks?: PlaybackHistoryUncheckedCreateNestedManyWithoutTrackInput
    genres?: TrackGenreUncheckedCreateNestedManyWithoutTrackInput
  }

  export type TrackUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    duration?: IntFieldUpdateOperationsInput | number
    lyrics?: NullableStringFieldUpdateOperationsInput | string | null
    trackNumber?: IntFieldUpdateOperationsInput | number
    discNumber?: IntFieldUpdateOperationsInput | number
    isrc?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    album?: AlbumUpdateOneRequiredWithoutTracksNestedInput
    artists?: TrackArtistUpdateManyWithoutTrackNestedInput
    audioResources?: TrackAudioResourceUpdateManyWithoutTrackNestedInput
    playlistTracks?: PlaylistTrackUpdateManyWithoutTrackNestedInput
    likedUsers?: LikedTrackUpdateManyWithoutTrackNestedInput
    playbacks?: PlaybackHistoryUpdateManyWithoutTrackNestedInput
    genres?: TrackGenreUpdateManyWithoutTrackNestedInput
  }

  export type TrackUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    albumId?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    duration?: IntFieldUpdateOperationsInput | number
    lyrics?: NullableStringFieldUpdateOperationsInput | string | null
    trackNumber?: IntFieldUpdateOperationsInput | number
    discNumber?: IntFieldUpdateOperationsInput | number
    isrc?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    artists?: TrackArtistUncheckedUpdateManyWithoutTrackNestedInput
    audioResources?: TrackAudioResourceUncheckedUpdateManyWithoutTrackNestedInput
    playlistTracks?: PlaylistTrackUncheckedUpdateManyWithoutTrackNestedInput
    likedUsers?: LikedTrackUncheckedUpdateManyWithoutTrackNestedInput
    playbacks?: PlaybackHistoryUncheckedUpdateManyWithoutTrackNestedInput
    genres?: TrackGenreUncheckedUpdateManyWithoutTrackNestedInput
  }

  export type TrackCreateManyInput = {
    id?: string
    albumId: string
    title: string
    duration: number
    lyrics?: string | null
    trackNumber: number
    discNumber?: number
    isrc?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TrackUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    duration?: IntFieldUpdateOperationsInput | number
    lyrics?: NullableStringFieldUpdateOperationsInput | string | null
    trackNumber?: IntFieldUpdateOperationsInput | number
    discNumber?: IntFieldUpdateOperationsInput | number
    isrc?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TrackUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    albumId?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    duration?: IntFieldUpdateOperationsInput | number
    lyrics?: NullableStringFieldUpdateOperationsInput | string | null
    trackNumber?: IntFieldUpdateOperationsInput | number
    discNumber?: IntFieldUpdateOperationsInput | number
    isrc?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TrackArtistCreateInput = {
    role?: string
    track: TrackCreateNestedOneWithoutArtistsInput
    artist: ArtistCreateNestedOneWithoutTracksInput
  }

  export type TrackArtistUncheckedCreateInput = {
    trackId: string
    artistId: string
    role?: string
  }

  export type TrackArtistUpdateInput = {
    role?: StringFieldUpdateOperationsInput | string
    track?: TrackUpdateOneRequiredWithoutArtistsNestedInput
    artist?: ArtistUpdateOneRequiredWithoutTracksNestedInput
  }

  export type TrackArtistUncheckedUpdateInput = {
    trackId?: StringFieldUpdateOperationsInput | string
    artistId?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
  }

  export type TrackArtistCreateManyInput = {
    trackId: string
    artistId: string
    role?: string
  }

  export type TrackArtistUpdateManyMutationInput = {
    role?: StringFieldUpdateOperationsInput | string
  }

  export type TrackArtistUncheckedUpdateManyInput = {
    trackId?: StringFieldUpdateOperationsInput | string
    artistId?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
  }

  export type AlbumArtistCreateInput = {
    album: AlbumCreateNestedOneWithoutArtistsInput
    artist: ArtistCreateNestedOneWithoutAlbumsInput
  }

  export type AlbumArtistUncheckedCreateInput = {
    albumId: string
    artistId: string
  }

  export type AlbumArtistUpdateInput = {
    album?: AlbumUpdateOneRequiredWithoutArtistsNestedInput
    artist?: ArtistUpdateOneRequiredWithoutAlbumsNestedInput
  }

  export type AlbumArtistUncheckedUpdateInput = {
    albumId?: StringFieldUpdateOperationsInput | string
    artistId?: StringFieldUpdateOperationsInput | string
  }

  export type AlbumArtistCreateManyInput = {
    albumId: string
    artistId: string
  }

  export type AlbumArtistUpdateManyMutationInput = {

  }

  export type AlbumArtistUncheckedUpdateManyInput = {
    albumId?: StringFieldUpdateOperationsInput | string
    artistId?: StringFieldUpdateOperationsInput | string
  }

  export type TrackAudioResourceCreateInput = {
    id?: string
    quality: string
    format: string
    bitrate: number
    streamUrl: string
    size: number
    isPremiumOnly?: boolean
    createdAt?: Date | string
    track: TrackCreateNestedOneWithoutAudioResourcesInput
  }

  export type TrackAudioResourceUncheckedCreateInput = {
    id?: string
    trackId: string
    quality: string
    format: string
    bitrate: number
    streamUrl: string
    size: number
    isPremiumOnly?: boolean
    createdAt?: Date | string
  }

  export type TrackAudioResourceUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    quality?: StringFieldUpdateOperationsInput | string
    format?: StringFieldUpdateOperationsInput | string
    bitrate?: IntFieldUpdateOperationsInput | number
    streamUrl?: StringFieldUpdateOperationsInput | string
    size?: IntFieldUpdateOperationsInput | number
    isPremiumOnly?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    track?: TrackUpdateOneRequiredWithoutAudioResourcesNestedInput
  }

  export type TrackAudioResourceUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    trackId?: StringFieldUpdateOperationsInput | string
    quality?: StringFieldUpdateOperationsInput | string
    format?: StringFieldUpdateOperationsInput | string
    bitrate?: IntFieldUpdateOperationsInput | number
    streamUrl?: StringFieldUpdateOperationsInput | string
    size?: IntFieldUpdateOperationsInput | number
    isPremiumOnly?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TrackAudioResourceCreateManyInput = {
    id?: string
    trackId: string
    quality: string
    format: string
    bitrate: number
    streamUrl: string
    size: number
    isPremiumOnly?: boolean
    createdAt?: Date | string
  }

  export type TrackAudioResourceUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    quality?: StringFieldUpdateOperationsInput | string
    format?: StringFieldUpdateOperationsInput | string
    bitrate?: IntFieldUpdateOperationsInput | number
    streamUrl?: StringFieldUpdateOperationsInput | string
    size?: IntFieldUpdateOperationsInput | number
    isPremiumOnly?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TrackAudioResourceUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    trackId?: StringFieldUpdateOperationsInput | string
    quality?: StringFieldUpdateOperationsInput | string
    format?: StringFieldUpdateOperationsInput | string
    bitrate?: IntFieldUpdateOperationsInput | number
    streamUrl?: StringFieldUpdateOperationsInput | string
    size?: IntFieldUpdateOperationsInput | number
    isPremiumOnly?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GenreCreateInput = {
    id?: string
    name: string
    createdAt?: Date | string
    tracks?: TrackGenreCreateNestedManyWithoutGenreInput
  }

  export type GenreUncheckedCreateInput = {
    id?: string
    name: string
    createdAt?: Date | string
    tracks?: TrackGenreUncheckedCreateNestedManyWithoutGenreInput
  }

  export type GenreUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tracks?: TrackGenreUpdateManyWithoutGenreNestedInput
  }

  export type GenreUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tracks?: TrackGenreUncheckedUpdateManyWithoutGenreNestedInput
  }

  export type GenreCreateManyInput = {
    id?: string
    name: string
    createdAt?: Date | string
  }

  export type GenreUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GenreUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TrackGenreCreateInput = {
    track: TrackCreateNestedOneWithoutGenresInput
    genre: GenreCreateNestedOneWithoutTracksInput
  }

  export type TrackGenreUncheckedCreateInput = {
    trackId: string
    genreId: string
  }

  export type TrackGenreUpdateInput = {
    track?: TrackUpdateOneRequiredWithoutGenresNestedInput
    genre?: GenreUpdateOneRequiredWithoutTracksNestedInput
  }

  export type TrackGenreUncheckedUpdateInput = {
    trackId?: StringFieldUpdateOperationsInput | string
    genreId?: StringFieldUpdateOperationsInput | string
  }

  export type TrackGenreCreateManyInput = {
    trackId: string
    genreId: string
  }

  export type TrackGenreUpdateManyMutationInput = {

  }

  export type TrackGenreUncheckedUpdateManyInput = {
    trackId?: StringFieldUpdateOperationsInput | string
    genreId?: StringFieldUpdateOperationsInput | string
  }

  export type PlaylistCreateInput = {
    id?: string
    name: string
    description?: string | null
    coverUrl?: string | null
    isPublic?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    owner: UserCreateNestedOneWithoutOwnedPlaylistsInput
    tracks?: PlaylistTrackCreateNestedManyWithoutPlaylistInput
    followers?: PlaylistFollowerCreateNestedManyWithoutPlaylistInput
  }

  export type PlaylistUncheckedCreateInput = {
    id?: string
    ownerId: string
    name: string
    description?: string | null
    coverUrl?: string | null
    isPublic?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    tracks?: PlaylistTrackUncheckedCreateNestedManyWithoutPlaylistInput
    followers?: PlaylistFollowerUncheckedCreateNestedManyWithoutPlaylistInput
  }

  export type PlaylistUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    coverUrl?: NullableStringFieldUpdateOperationsInput | string | null
    isPublic?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    owner?: UserUpdateOneRequiredWithoutOwnedPlaylistsNestedInput
    tracks?: PlaylistTrackUpdateManyWithoutPlaylistNestedInput
    followers?: PlaylistFollowerUpdateManyWithoutPlaylistNestedInput
  }

  export type PlaylistUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    ownerId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    coverUrl?: NullableStringFieldUpdateOperationsInput | string | null
    isPublic?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tracks?: PlaylistTrackUncheckedUpdateManyWithoutPlaylistNestedInput
    followers?: PlaylistFollowerUncheckedUpdateManyWithoutPlaylistNestedInput
  }

  export type PlaylistCreateManyInput = {
    id?: string
    ownerId: string
    name: string
    description?: string | null
    coverUrl?: string | null
    isPublic?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PlaylistUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    coverUrl?: NullableStringFieldUpdateOperationsInput | string | null
    isPublic?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PlaylistUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    ownerId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    coverUrl?: NullableStringFieldUpdateOperationsInput | string | null
    isPublic?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PlaylistTrackCreateInput = {
    sortOrder?: number
    addedAt?: Date | string
    playlist: PlaylistCreateNestedOneWithoutTracksInput
    track: TrackCreateNestedOneWithoutPlaylistTracksInput
  }

  export type PlaylistTrackUncheckedCreateInput = {
    playlistId: string
    trackId: string
    sortOrder?: number
    addedAt?: Date | string
  }

  export type PlaylistTrackUpdateInput = {
    sortOrder?: IntFieldUpdateOperationsInput | number
    addedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    playlist?: PlaylistUpdateOneRequiredWithoutTracksNestedInput
    track?: TrackUpdateOneRequiredWithoutPlaylistTracksNestedInput
  }

  export type PlaylistTrackUncheckedUpdateInput = {
    playlistId?: StringFieldUpdateOperationsInput | string
    trackId?: StringFieldUpdateOperationsInput | string
    sortOrder?: IntFieldUpdateOperationsInput | number
    addedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PlaylistTrackCreateManyInput = {
    playlistId: string
    trackId: string
    sortOrder?: number
    addedAt?: Date | string
  }

  export type PlaylistTrackUpdateManyMutationInput = {
    sortOrder?: IntFieldUpdateOperationsInput | number
    addedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PlaylistTrackUncheckedUpdateManyInput = {
    playlistId?: StringFieldUpdateOperationsInput | string
    trackId?: StringFieldUpdateOperationsInput | string
    sortOrder?: IntFieldUpdateOperationsInput | number
    addedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PlaylistFollowerCreateInput = {
    followedAt?: Date | string
    playlist: PlaylistCreateNestedOneWithoutFollowersInput
    user: UserCreateNestedOneWithoutFollowedPlaylistsInput
  }

  export type PlaylistFollowerUncheckedCreateInput = {
    playlistId: string
    userId: string
    followedAt?: Date | string
  }

  export type PlaylistFollowerUpdateInput = {
    followedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    playlist?: PlaylistUpdateOneRequiredWithoutFollowersNestedInput
    user?: UserUpdateOneRequiredWithoutFollowedPlaylistsNestedInput
  }

  export type PlaylistFollowerUncheckedUpdateInput = {
    playlistId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    followedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PlaylistFollowerCreateManyInput = {
    playlistId: string
    userId: string
    followedAt?: Date | string
  }

  export type PlaylistFollowerUpdateManyMutationInput = {
    followedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PlaylistFollowerUncheckedUpdateManyInput = {
    playlistId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    followedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LikedTrackCreateInput = {
    likedAt?: Date | string
    user: UserCreateNestedOneWithoutLikedTracksInput
    track: TrackCreateNestedOneWithoutLikedUsersInput
  }

  export type LikedTrackUncheckedCreateInput = {
    userId: string
    trackId: string
    likedAt?: Date | string
  }

  export type LikedTrackUpdateInput = {
    likedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutLikedTracksNestedInput
    track?: TrackUpdateOneRequiredWithoutLikedUsersNestedInput
  }

  export type LikedTrackUncheckedUpdateInput = {
    userId?: StringFieldUpdateOperationsInput | string
    trackId?: StringFieldUpdateOperationsInput | string
    likedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LikedTrackCreateManyInput = {
    userId: string
    trackId: string
    likedAt?: Date | string
  }

  export type LikedTrackUpdateManyMutationInput = {
    likedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LikedTrackUncheckedUpdateManyInput = {
    userId?: StringFieldUpdateOperationsInput | string
    trackId?: StringFieldUpdateOperationsInput | string
    likedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PlaybackHistoryCreateInput = {
    id?: string
    playedAt?: Date | string
    contextType?: string | null
    contextId?: string | null
    user: UserCreateNestedOneWithoutPlaybackHistoriesInput
    track: TrackCreateNestedOneWithoutPlaybacksInput
  }

  export type PlaybackHistoryUncheckedCreateInput = {
    id?: string
    userId: string
    trackId: string
    playedAt?: Date | string
    contextType?: string | null
    contextId?: string | null
  }

  export type PlaybackHistoryUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    playedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    contextType?: NullableStringFieldUpdateOperationsInput | string | null
    contextId?: NullableStringFieldUpdateOperationsInput | string | null
    user?: UserUpdateOneRequiredWithoutPlaybackHistoriesNestedInput
    track?: TrackUpdateOneRequiredWithoutPlaybacksNestedInput
  }

  export type PlaybackHistoryUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    trackId?: StringFieldUpdateOperationsInput | string
    playedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    contextType?: NullableStringFieldUpdateOperationsInput | string | null
    contextId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type PlaybackHistoryCreateManyInput = {
    id?: string
    userId: string
    trackId: string
    playedAt?: Date | string
    contextType?: string | null
    contextId?: string | null
  }

  export type PlaybackHistoryUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    playedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    contextType?: NullableStringFieldUpdateOperationsInput | string | null
    contextId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type PlaybackHistoryUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    trackId?: StringFieldUpdateOperationsInput | string
    playedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    contextType?: NullableStringFieldUpdateOperationsInput | string | null
    contextId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type PlaylistListRelationFilter = {
    every?: PlaylistWhereInput
    some?: PlaylistWhereInput
    none?: PlaylistWhereInput
  }

  export type PlaylistFollowerListRelationFilter = {
    every?: PlaylistFollowerWhereInput
    some?: PlaylistFollowerWhereInput
    none?: PlaylistFollowerWhereInput
  }

  export type LikedTrackListRelationFilter = {
    every?: LikedTrackWhereInput
    some?: LikedTrackWhereInput
    none?: LikedTrackWhereInput
  }

  export type PlaybackHistoryListRelationFilter = {
    every?: PlaybackHistoryWhereInput
    some?: PlaybackHistoryWhereInput
    none?: PlaybackHistoryWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type PlaylistOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type PlaylistFollowerOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type LikedTrackOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type PlaybackHistoryOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    displayName?: SortOrder
    avatarUrl?: SortOrder
    country?: SortOrder
    product?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    displayName?: SortOrder
    avatarUrl?: SortOrder
    country?: SortOrder
    product?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    displayName?: SortOrder
    avatarUrl?: SortOrder
    country?: SortOrder
    product?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type TrackArtistListRelationFilter = {
    every?: TrackArtistWhereInput
    some?: TrackArtistWhereInput
    none?: TrackArtistWhereInput
  }

  export type AlbumArtistListRelationFilter = {
    every?: AlbumArtistWhereInput
    some?: AlbumArtistWhereInput
    none?: AlbumArtistWhereInput
  }

  export type TrackArtistOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type AlbumArtistOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ArtistCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    coverImg?: SortOrder
    bio?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ArtistMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    coverImg?: SortOrder
    bio?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ArtistMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    coverImg?: SortOrder
    bio?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TrackListRelationFilter = {
    every?: TrackWhereInput
    some?: TrackWhereInput
    none?: TrackWhereInput
  }

  export type TrackOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type AlbumCountOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    coverUrl?: SortOrder
    releaseDate?: SortOrder
    albumType?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AlbumMaxOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    coverUrl?: SortOrder
    releaseDate?: SortOrder
    albumType?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AlbumMinOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    coverUrl?: SortOrder
    releaseDate?: SortOrder
    albumType?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type AlbumRelationFilter = {
    is?: AlbumWhereInput
    isNot?: AlbumWhereInput
  }

  export type TrackAudioResourceListRelationFilter = {
    every?: TrackAudioResourceWhereInput
    some?: TrackAudioResourceWhereInput
    none?: TrackAudioResourceWhereInput
  }

  export type PlaylistTrackListRelationFilter = {
    every?: PlaylistTrackWhereInput
    some?: PlaylistTrackWhereInput
    none?: PlaylistTrackWhereInput
  }

  export type TrackGenreListRelationFilter = {
    every?: TrackGenreWhereInput
    some?: TrackGenreWhereInput
    none?: TrackGenreWhereInput
  }

  export type TrackAudioResourceOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type PlaylistTrackOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type TrackGenreOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type TrackCountOrderByAggregateInput = {
    id?: SortOrder
    albumId?: SortOrder
    title?: SortOrder
    duration?: SortOrder
    lyrics?: SortOrder
    trackNumber?: SortOrder
    discNumber?: SortOrder
    isrc?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TrackAvgOrderByAggregateInput = {
    duration?: SortOrder
    trackNumber?: SortOrder
    discNumber?: SortOrder
  }

  export type TrackMaxOrderByAggregateInput = {
    id?: SortOrder
    albumId?: SortOrder
    title?: SortOrder
    duration?: SortOrder
    lyrics?: SortOrder
    trackNumber?: SortOrder
    discNumber?: SortOrder
    isrc?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TrackMinOrderByAggregateInput = {
    id?: SortOrder
    albumId?: SortOrder
    title?: SortOrder
    duration?: SortOrder
    lyrics?: SortOrder
    trackNumber?: SortOrder
    discNumber?: SortOrder
    isrc?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TrackSumOrderByAggregateInput = {
    duration?: SortOrder
    trackNumber?: SortOrder
    discNumber?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type TrackRelationFilter = {
    is?: TrackWhereInput
    isNot?: TrackWhereInput
  }

  export type ArtistRelationFilter = {
    is?: ArtistWhereInput
    isNot?: ArtistWhereInput
  }

  export type TrackArtistTrackIdArtistIdCompoundUniqueInput = {
    trackId: string
    artistId: string
  }

  export type TrackArtistCountOrderByAggregateInput = {
    trackId?: SortOrder
    artistId?: SortOrder
    role?: SortOrder
  }

  export type TrackArtistMaxOrderByAggregateInput = {
    trackId?: SortOrder
    artistId?: SortOrder
    role?: SortOrder
  }

  export type TrackArtistMinOrderByAggregateInput = {
    trackId?: SortOrder
    artistId?: SortOrder
    role?: SortOrder
  }

  export type AlbumArtistAlbumIdArtistIdCompoundUniqueInput = {
    albumId: string
    artistId: string
  }

  export type AlbumArtistCountOrderByAggregateInput = {
    albumId?: SortOrder
    artistId?: SortOrder
  }

  export type AlbumArtistMaxOrderByAggregateInput = {
    albumId?: SortOrder
    artistId?: SortOrder
  }

  export type AlbumArtistMinOrderByAggregateInput = {
    albumId?: SortOrder
    artistId?: SortOrder
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type TrackAudioResourceCountOrderByAggregateInput = {
    id?: SortOrder
    trackId?: SortOrder
    quality?: SortOrder
    format?: SortOrder
    bitrate?: SortOrder
    streamUrl?: SortOrder
    size?: SortOrder
    isPremiumOnly?: SortOrder
    createdAt?: SortOrder
  }

  export type TrackAudioResourceAvgOrderByAggregateInput = {
    bitrate?: SortOrder
    size?: SortOrder
  }

  export type TrackAudioResourceMaxOrderByAggregateInput = {
    id?: SortOrder
    trackId?: SortOrder
    quality?: SortOrder
    format?: SortOrder
    bitrate?: SortOrder
    streamUrl?: SortOrder
    size?: SortOrder
    isPremiumOnly?: SortOrder
    createdAt?: SortOrder
  }

  export type TrackAudioResourceMinOrderByAggregateInput = {
    id?: SortOrder
    trackId?: SortOrder
    quality?: SortOrder
    format?: SortOrder
    bitrate?: SortOrder
    streamUrl?: SortOrder
    size?: SortOrder
    isPremiumOnly?: SortOrder
    createdAt?: SortOrder
  }

  export type TrackAudioResourceSumOrderByAggregateInput = {
    bitrate?: SortOrder
    size?: SortOrder
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type GenreCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
  }

  export type GenreMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
  }

  export type GenreMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
  }

  export type GenreRelationFilter = {
    is?: GenreWhereInput
    isNot?: GenreWhereInput
  }

  export type TrackGenreTrackIdGenreIdCompoundUniqueInput = {
    trackId: string
    genreId: string
  }

  export type TrackGenreCountOrderByAggregateInput = {
    trackId?: SortOrder
    genreId?: SortOrder
  }

  export type TrackGenreMaxOrderByAggregateInput = {
    trackId?: SortOrder
    genreId?: SortOrder
  }

  export type TrackGenreMinOrderByAggregateInput = {
    trackId?: SortOrder
    genreId?: SortOrder
  }

  export type UserRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type PlaylistCountOrderByAggregateInput = {
    id?: SortOrder
    ownerId?: SortOrder
    name?: SortOrder
    description?: SortOrder
    coverUrl?: SortOrder
    isPublic?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PlaylistMaxOrderByAggregateInput = {
    id?: SortOrder
    ownerId?: SortOrder
    name?: SortOrder
    description?: SortOrder
    coverUrl?: SortOrder
    isPublic?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PlaylistMinOrderByAggregateInput = {
    id?: SortOrder
    ownerId?: SortOrder
    name?: SortOrder
    description?: SortOrder
    coverUrl?: SortOrder
    isPublic?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PlaylistRelationFilter = {
    is?: PlaylistWhereInput
    isNot?: PlaylistWhereInput
  }

  export type PlaylistTrackPlaylistIdTrackIdCompoundUniqueInput = {
    playlistId: string
    trackId: string
  }

  export type PlaylistTrackCountOrderByAggregateInput = {
    playlistId?: SortOrder
    trackId?: SortOrder
    sortOrder?: SortOrder
    addedAt?: SortOrder
  }

  export type PlaylistTrackAvgOrderByAggregateInput = {
    sortOrder?: SortOrder
  }

  export type PlaylistTrackMaxOrderByAggregateInput = {
    playlistId?: SortOrder
    trackId?: SortOrder
    sortOrder?: SortOrder
    addedAt?: SortOrder
  }

  export type PlaylistTrackMinOrderByAggregateInput = {
    playlistId?: SortOrder
    trackId?: SortOrder
    sortOrder?: SortOrder
    addedAt?: SortOrder
  }

  export type PlaylistTrackSumOrderByAggregateInput = {
    sortOrder?: SortOrder
  }

  export type PlaylistFollowerPlaylistIdUserIdCompoundUniqueInput = {
    playlistId: string
    userId: string
  }

  export type PlaylistFollowerCountOrderByAggregateInput = {
    playlistId?: SortOrder
    userId?: SortOrder
    followedAt?: SortOrder
  }

  export type PlaylistFollowerMaxOrderByAggregateInput = {
    playlistId?: SortOrder
    userId?: SortOrder
    followedAt?: SortOrder
  }

  export type PlaylistFollowerMinOrderByAggregateInput = {
    playlistId?: SortOrder
    userId?: SortOrder
    followedAt?: SortOrder
  }

  export type LikedTrackUserIdTrackIdCompoundUniqueInput = {
    userId: string
    trackId: string
  }

  export type LikedTrackCountOrderByAggregateInput = {
    userId?: SortOrder
    trackId?: SortOrder
    likedAt?: SortOrder
  }

  export type LikedTrackMaxOrderByAggregateInput = {
    userId?: SortOrder
    trackId?: SortOrder
    likedAt?: SortOrder
  }

  export type LikedTrackMinOrderByAggregateInput = {
    userId?: SortOrder
    trackId?: SortOrder
    likedAt?: SortOrder
  }

  export type PlaybackHistoryCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    trackId?: SortOrder
    playedAt?: SortOrder
    contextType?: SortOrder
    contextId?: SortOrder
  }

  export type PlaybackHistoryMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    trackId?: SortOrder
    playedAt?: SortOrder
    contextType?: SortOrder
    contextId?: SortOrder
  }

  export type PlaybackHistoryMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    trackId?: SortOrder
    playedAt?: SortOrder
    contextType?: SortOrder
    contextId?: SortOrder
  }

  export type PlaylistCreateNestedManyWithoutOwnerInput = {
    create?: XOR<PlaylistCreateWithoutOwnerInput, PlaylistUncheckedCreateWithoutOwnerInput> | PlaylistCreateWithoutOwnerInput[] | PlaylistUncheckedCreateWithoutOwnerInput[]
    connectOrCreate?: PlaylistCreateOrConnectWithoutOwnerInput | PlaylistCreateOrConnectWithoutOwnerInput[]
    createMany?: PlaylistCreateManyOwnerInputEnvelope
    connect?: PlaylistWhereUniqueInput | PlaylistWhereUniqueInput[]
  }

  export type PlaylistFollowerCreateNestedManyWithoutUserInput = {
    create?: XOR<PlaylistFollowerCreateWithoutUserInput, PlaylistFollowerUncheckedCreateWithoutUserInput> | PlaylistFollowerCreateWithoutUserInput[] | PlaylistFollowerUncheckedCreateWithoutUserInput[]
    connectOrCreate?: PlaylistFollowerCreateOrConnectWithoutUserInput | PlaylistFollowerCreateOrConnectWithoutUserInput[]
    createMany?: PlaylistFollowerCreateManyUserInputEnvelope
    connect?: PlaylistFollowerWhereUniqueInput | PlaylistFollowerWhereUniqueInput[]
  }

  export type LikedTrackCreateNestedManyWithoutUserInput = {
    create?: XOR<LikedTrackCreateWithoutUserInput, LikedTrackUncheckedCreateWithoutUserInput> | LikedTrackCreateWithoutUserInput[] | LikedTrackUncheckedCreateWithoutUserInput[]
    connectOrCreate?: LikedTrackCreateOrConnectWithoutUserInput | LikedTrackCreateOrConnectWithoutUserInput[]
    createMany?: LikedTrackCreateManyUserInputEnvelope
    connect?: LikedTrackWhereUniqueInput | LikedTrackWhereUniqueInput[]
  }

  export type PlaybackHistoryCreateNestedManyWithoutUserInput = {
    create?: XOR<PlaybackHistoryCreateWithoutUserInput, PlaybackHistoryUncheckedCreateWithoutUserInput> | PlaybackHistoryCreateWithoutUserInput[] | PlaybackHistoryUncheckedCreateWithoutUserInput[]
    connectOrCreate?: PlaybackHistoryCreateOrConnectWithoutUserInput | PlaybackHistoryCreateOrConnectWithoutUserInput[]
    createMany?: PlaybackHistoryCreateManyUserInputEnvelope
    connect?: PlaybackHistoryWhereUniqueInput | PlaybackHistoryWhereUniqueInput[]
  }

  export type PlaylistUncheckedCreateNestedManyWithoutOwnerInput = {
    create?: XOR<PlaylistCreateWithoutOwnerInput, PlaylistUncheckedCreateWithoutOwnerInput> | PlaylistCreateWithoutOwnerInput[] | PlaylistUncheckedCreateWithoutOwnerInput[]
    connectOrCreate?: PlaylistCreateOrConnectWithoutOwnerInput | PlaylistCreateOrConnectWithoutOwnerInput[]
    createMany?: PlaylistCreateManyOwnerInputEnvelope
    connect?: PlaylistWhereUniqueInput | PlaylistWhereUniqueInput[]
  }

  export type PlaylistFollowerUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<PlaylistFollowerCreateWithoutUserInput, PlaylistFollowerUncheckedCreateWithoutUserInput> | PlaylistFollowerCreateWithoutUserInput[] | PlaylistFollowerUncheckedCreateWithoutUserInput[]
    connectOrCreate?: PlaylistFollowerCreateOrConnectWithoutUserInput | PlaylistFollowerCreateOrConnectWithoutUserInput[]
    createMany?: PlaylistFollowerCreateManyUserInputEnvelope
    connect?: PlaylistFollowerWhereUniqueInput | PlaylistFollowerWhereUniqueInput[]
  }

  export type LikedTrackUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<LikedTrackCreateWithoutUserInput, LikedTrackUncheckedCreateWithoutUserInput> | LikedTrackCreateWithoutUserInput[] | LikedTrackUncheckedCreateWithoutUserInput[]
    connectOrCreate?: LikedTrackCreateOrConnectWithoutUserInput | LikedTrackCreateOrConnectWithoutUserInput[]
    createMany?: LikedTrackCreateManyUserInputEnvelope
    connect?: LikedTrackWhereUniqueInput | LikedTrackWhereUniqueInput[]
  }

  export type PlaybackHistoryUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<PlaybackHistoryCreateWithoutUserInput, PlaybackHistoryUncheckedCreateWithoutUserInput> | PlaybackHistoryCreateWithoutUserInput[] | PlaybackHistoryUncheckedCreateWithoutUserInput[]
    connectOrCreate?: PlaybackHistoryCreateOrConnectWithoutUserInput | PlaybackHistoryCreateOrConnectWithoutUserInput[]
    createMany?: PlaybackHistoryCreateManyUserInputEnvelope
    connect?: PlaybackHistoryWhereUniqueInput | PlaybackHistoryWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type PlaylistUpdateManyWithoutOwnerNestedInput = {
    create?: XOR<PlaylistCreateWithoutOwnerInput, PlaylistUncheckedCreateWithoutOwnerInput> | PlaylistCreateWithoutOwnerInput[] | PlaylistUncheckedCreateWithoutOwnerInput[]
    connectOrCreate?: PlaylistCreateOrConnectWithoutOwnerInput | PlaylistCreateOrConnectWithoutOwnerInput[]
    upsert?: PlaylistUpsertWithWhereUniqueWithoutOwnerInput | PlaylistUpsertWithWhereUniqueWithoutOwnerInput[]
    createMany?: PlaylistCreateManyOwnerInputEnvelope
    set?: PlaylistWhereUniqueInput | PlaylistWhereUniqueInput[]
    disconnect?: PlaylistWhereUniqueInput | PlaylistWhereUniqueInput[]
    delete?: PlaylistWhereUniqueInput | PlaylistWhereUniqueInput[]
    connect?: PlaylistWhereUniqueInput | PlaylistWhereUniqueInput[]
    update?: PlaylistUpdateWithWhereUniqueWithoutOwnerInput | PlaylistUpdateWithWhereUniqueWithoutOwnerInput[]
    updateMany?: PlaylistUpdateManyWithWhereWithoutOwnerInput | PlaylistUpdateManyWithWhereWithoutOwnerInput[]
    deleteMany?: PlaylistScalarWhereInput | PlaylistScalarWhereInput[]
  }

  export type PlaylistFollowerUpdateManyWithoutUserNestedInput = {
    create?: XOR<PlaylistFollowerCreateWithoutUserInput, PlaylistFollowerUncheckedCreateWithoutUserInput> | PlaylistFollowerCreateWithoutUserInput[] | PlaylistFollowerUncheckedCreateWithoutUserInput[]
    connectOrCreate?: PlaylistFollowerCreateOrConnectWithoutUserInput | PlaylistFollowerCreateOrConnectWithoutUserInput[]
    upsert?: PlaylistFollowerUpsertWithWhereUniqueWithoutUserInput | PlaylistFollowerUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: PlaylistFollowerCreateManyUserInputEnvelope
    set?: PlaylistFollowerWhereUniqueInput | PlaylistFollowerWhereUniqueInput[]
    disconnect?: PlaylistFollowerWhereUniqueInput | PlaylistFollowerWhereUniqueInput[]
    delete?: PlaylistFollowerWhereUniqueInput | PlaylistFollowerWhereUniqueInput[]
    connect?: PlaylistFollowerWhereUniqueInput | PlaylistFollowerWhereUniqueInput[]
    update?: PlaylistFollowerUpdateWithWhereUniqueWithoutUserInput | PlaylistFollowerUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: PlaylistFollowerUpdateManyWithWhereWithoutUserInput | PlaylistFollowerUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: PlaylistFollowerScalarWhereInput | PlaylistFollowerScalarWhereInput[]
  }

  export type LikedTrackUpdateManyWithoutUserNestedInput = {
    create?: XOR<LikedTrackCreateWithoutUserInput, LikedTrackUncheckedCreateWithoutUserInput> | LikedTrackCreateWithoutUserInput[] | LikedTrackUncheckedCreateWithoutUserInput[]
    connectOrCreate?: LikedTrackCreateOrConnectWithoutUserInput | LikedTrackCreateOrConnectWithoutUserInput[]
    upsert?: LikedTrackUpsertWithWhereUniqueWithoutUserInput | LikedTrackUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: LikedTrackCreateManyUserInputEnvelope
    set?: LikedTrackWhereUniqueInput | LikedTrackWhereUniqueInput[]
    disconnect?: LikedTrackWhereUniqueInput | LikedTrackWhereUniqueInput[]
    delete?: LikedTrackWhereUniqueInput | LikedTrackWhereUniqueInput[]
    connect?: LikedTrackWhereUniqueInput | LikedTrackWhereUniqueInput[]
    update?: LikedTrackUpdateWithWhereUniqueWithoutUserInput | LikedTrackUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: LikedTrackUpdateManyWithWhereWithoutUserInput | LikedTrackUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: LikedTrackScalarWhereInput | LikedTrackScalarWhereInput[]
  }

  export type PlaybackHistoryUpdateManyWithoutUserNestedInput = {
    create?: XOR<PlaybackHistoryCreateWithoutUserInput, PlaybackHistoryUncheckedCreateWithoutUserInput> | PlaybackHistoryCreateWithoutUserInput[] | PlaybackHistoryUncheckedCreateWithoutUserInput[]
    connectOrCreate?: PlaybackHistoryCreateOrConnectWithoutUserInput | PlaybackHistoryCreateOrConnectWithoutUserInput[]
    upsert?: PlaybackHistoryUpsertWithWhereUniqueWithoutUserInput | PlaybackHistoryUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: PlaybackHistoryCreateManyUserInputEnvelope
    set?: PlaybackHistoryWhereUniqueInput | PlaybackHistoryWhereUniqueInput[]
    disconnect?: PlaybackHistoryWhereUniqueInput | PlaybackHistoryWhereUniqueInput[]
    delete?: PlaybackHistoryWhereUniqueInput | PlaybackHistoryWhereUniqueInput[]
    connect?: PlaybackHistoryWhereUniqueInput | PlaybackHistoryWhereUniqueInput[]
    update?: PlaybackHistoryUpdateWithWhereUniqueWithoutUserInput | PlaybackHistoryUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: PlaybackHistoryUpdateManyWithWhereWithoutUserInput | PlaybackHistoryUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: PlaybackHistoryScalarWhereInput | PlaybackHistoryScalarWhereInput[]
  }

  export type PlaylistUncheckedUpdateManyWithoutOwnerNestedInput = {
    create?: XOR<PlaylistCreateWithoutOwnerInput, PlaylistUncheckedCreateWithoutOwnerInput> | PlaylistCreateWithoutOwnerInput[] | PlaylistUncheckedCreateWithoutOwnerInput[]
    connectOrCreate?: PlaylistCreateOrConnectWithoutOwnerInput | PlaylistCreateOrConnectWithoutOwnerInput[]
    upsert?: PlaylistUpsertWithWhereUniqueWithoutOwnerInput | PlaylistUpsertWithWhereUniqueWithoutOwnerInput[]
    createMany?: PlaylistCreateManyOwnerInputEnvelope
    set?: PlaylistWhereUniqueInput | PlaylistWhereUniqueInput[]
    disconnect?: PlaylistWhereUniqueInput | PlaylistWhereUniqueInput[]
    delete?: PlaylistWhereUniqueInput | PlaylistWhereUniqueInput[]
    connect?: PlaylistWhereUniqueInput | PlaylistWhereUniqueInput[]
    update?: PlaylistUpdateWithWhereUniqueWithoutOwnerInput | PlaylistUpdateWithWhereUniqueWithoutOwnerInput[]
    updateMany?: PlaylistUpdateManyWithWhereWithoutOwnerInput | PlaylistUpdateManyWithWhereWithoutOwnerInput[]
    deleteMany?: PlaylistScalarWhereInput | PlaylistScalarWhereInput[]
  }

  export type PlaylistFollowerUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<PlaylistFollowerCreateWithoutUserInput, PlaylistFollowerUncheckedCreateWithoutUserInput> | PlaylistFollowerCreateWithoutUserInput[] | PlaylistFollowerUncheckedCreateWithoutUserInput[]
    connectOrCreate?: PlaylistFollowerCreateOrConnectWithoutUserInput | PlaylistFollowerCreateOrConnectWithoutUserInput[]
    upsert?: PlaylistFollowerUpsertWithWhereUniqueWithoutUserInput | PlaylistFollowerUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: PlaylistFollowerCreateManyUserInputEnvelope
    set?: PlaylistFollowerWhereUniqueInput | PlaylistFollowerWhereUniqueInput[]
    disconnect?: PlaylistFollowerWhereUniqueInput | PlaylistFollowerWhereUniqueInput[]
    delete?: PlaylistFollowerWhereUniqueInput | PlaylistFollowerWhereUniqueInput[]
    connect?: PlaylistFollowerWhereUniqueInput | PlaylistFollowerWhereUniqueInput[]
    update?: PlaylistFollowerUpdateWithWhereUniqueWithoutUserInput | PlaylistFollowerUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: PlaylistFollowerUpdateManyWithWhereWithoutUserInput | PlaylistFollowerUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: PlaylistFollowerScalarWhereInput | PlaylistFollowerScalarWhereInput[]
  }

  export type LikedTrackUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<LikedTrackCreateWithoutUserInput, LikedTrackUncheckedCreateWithoutUserInput> | LikedTrackCreateWithoutUserInput[] | LikedTrackUncheckedCreateWithoutUserInput[]
    connectOrCreate?: LikedTrackCreateOrConnectWithoutUserInput | LikedTrackCreateOrConnectWithoutUserInput[]
    upsert?: LikedTrackUpsertWithWhereUniqueWithoutUserInput | LikedTrackUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: LikedTrackCreateManyUserInputEnvelope
    set?: LikedTrackWhereUniqueInput | LikedTrackWhereUniqueInput[]
    disconnect?: LikedTrackWhereUniqueInput | LikedTrackWhereUniqueInput[]
    delete?: LikedTrackWhereUniqueInput | LikedTrackWhereUniqueInput[]
    connect?: LikedTrackWhereUniqueInput | LikedTrackWhereUniqueInput[]
    update?: LikedTrackUpdateWithWhereUniqueWithoutUserInput | LikedTrackUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: LikedTrackUpdateManyWithWhereWithoutUserInput | LikedTrackUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: LikedTrackScalarWhereInput | LikedTrackScalarWhereInput[]
  }

  export type PlaybackHistoryUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<PlaybackHistoryCreateWithoutUserInput, PlaybackHistoryUncheckedCreateWithoutUserInput> | PlaybackHistoryCreateWithoutUserInput[] | PlaybackHistoryUncheckedCreateWithoutUserInput[]
    connectOrCreate?: PlaybackHistoryCreateOrConnectWithoutUserInput | PlaybackHistoryCreateOrConnectWithoutUserInput[]
    upsert?: PlaybackHistoryUpsertWithWhereUniqueWithoutUserInput | PlaybackHistoryUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: PlaybackHistoryCreateManyUserInputEnvelope
    set?: PlaybackHistoryWhereUniqueInput | PlaybackHistoryWhereUniqueInput[]
    disconnect?: PlaybackHistoryWhereUniqueInput | PlaybackHistoryWhereUniqueInput[]
    delete?: PlaybackHistoryWhereUniqueInput | PlaybackHistoryWhereUniqueInput[]
    connect?: PlaybackHistoryWhereUniqueInput | PlaybackHistoryWhereUniqueInput[]
    update?: PlaybackHistoryUpdateWithWhereUniqueWithoutUserInput | PlaybackHistoryUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: PlaybackHistoryUpdateManyWithWhereWithoutUserInput | PlaybackHistoryUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: PlaybackHistoryScalarWhereInput | PlaybackHistoryScalarWhereInput[]
  }

  export type TrackArtistCreateNestedManyWithoutArtistInput = {
    create?: XOR<TrackArtistCreateWithoutArtistInput, TrackArtistUncheckedCreateWithoutArtistInput> | TrackArtistCreateWithoutArtistInput[] | TrackArtistUncheckedCreateWithoutArtistInput[]
    connectOrCreate?: TrackArtistCreateOrConnectWithoutArtistInput | TrackArtistCreateOrConnectWithoutArtistInput[]
    createMany?: TrackArtistCreateManyArtistInputEnvelope
    connect?: TrackArtistWhereUniqueInput | TrackArtistWhereUniqueInput[]
  }

  export type AlbumArtistCreateNestedManyWithoutArtistInput = {
    create?: XOR<AlbumArtistCreateWithoutArtistInput, AlbumArtistUncheckedCreateWithoutArtistInput> | AlbumArtistCreateWithoutArtistInput[] | AlbumArtistUncheckedCreateWithoutArtistInput[]
    connectOrCreate?: AlbumArtistCreateOrConnectWithoutArtistInput | AlbumArtistCreateOrConnectWithoutArtistInput[]
    createMany?: AlbumArtistCreateManyArtistInputEnvelope
    connect?: AlbumArtistWhereUniqueInput | AlbumArtistWhereUniqueInput[]
  }

  export type TrackArtistUncheckedCreateNestedManyWithoutArtistInput = {
    create?: XOR<TrackArtistCreateWithoutArtistInput, TrackArtistUncheckedCreateWithoutArtistInput> | TrackArtistCreateWithoutArtistInput[] | TrackArtistUncheckedCreateWithoutArtistInput[]
    connectOrCreate?: TrackArtistCreateOrConnectWithoutArtistInput | TrackArtistCreateOrConnectWithoutArtistInput[]
    createMany?: TrackArtistCreateManyArtistInputEnvelope
    connect?: TrackArtistWhereUniqueInput | TrackArtistWhereUniqueInput[]
  }

  export type AlbumArtistUncheckedCreateNestedManyWithoutArtistInput = {
    create?: XOR<AlbumArtistCreateWithoutArtistInput, AlbumArtistUncheckedCreateWithoutArtistInput> | AlbumArtistCreateWithoutArtistInput[] | AlbumArtistUncheckedCreateWithoutArtistInput[]
    connectOrCreate?: AlbumArtistCreateOrConnectWithoutArtistInput | AlbumArtistCreateOrConnectWithoutArtistInput[]
    createMany?: AlbumArtistCreateManyArtistInputEnvelope
    connect?: AlbumArtistWhereUniqueInput | AlbumArtistWhereUniqueInput[]
  }

  export type TrackArtistUpdateManyWithoutArtistNestedInput = {
    create?: XOR<TrackArtistCreateWithoutArtistInput, TrackArtistUncheckedCreateWithoutArtistInput> | TrackArtistCreateWithoutArtistInput[] | TrackArtistUncheckedCreateWithoutArtistInput[]
    connectOrCreate?: TrackArtistCreateOrConnectWithoutArtistInput | TrackArtistCreateOrConnectWithoutArtistInput[]
    upsert?: TrackArtistUpsertWithWhereUniqueWithoutArtistInput | TrackArtistUpsertWithWhereUniqueWithoutArtistInput[]
    createMany?: TrackArtistCreateManyArtistInputEnvelope
    set?: TrackArtistWhereUniqueInput | TrackArtistWhereUniqueInput[]
    disconnect?: TrackArtistWhereUniqueInput | TrackArtistWhereUniqueInput[]
    delete?: TrackArtistWhereUniqueInput | TrackArtistWhereUniqueInput[]
    connect?: TrackArtistWhereUniqueInput | TrackArtistWhereUniqueInput[]
    update?: TrackArtistUpdateWithWhereUniqueWithoutArtistInput | TrackArtistUpdateWithWhereUniqueWithoutArtistInput[]
    updateMany?: TrackArtistUpdateManyWithWhereWithoutArtistInput | TrackArtistUpdateManyWithWhereWithoutArtistInput[]
    deleteMany?: TrackArtistScalarWhereInput | TrackArtistScalarWhereInput[]
  }

  export type AlbumArtistUpdateManyWithoutArtistNestedInput = {
    create?: XOR<AlbumArtistCreateWithoutArtistInput, AlbumArtistUncheckedCreateWithoutArtistInput> | AlbumArtistCreateWithoutArtistInput[] | AlbumArtistUncheckedCreateWithoutArtistInput[]
    connectOrCreate?: AlbumArtistCreateOrConnectWithoutArtistInput | AlbumArtistCreateOrConnectWithoutArtistInput[]
    upsert?: AlbumArtistUpsertWithWhereUniqueWithoutArtistInput | AlbumArtistUpsertWithWhereUniqueWithoutArtistInput[]
    createMany?: AlbumArtistCreateManyArtistInputEnvelope
    set?: AlbumArtistWhereUniqueInput | AlbumArtistWhereUniqueInput[]
    disconnect?: AlbumArtistWhereUniqueInput | AlbumArtistWhereUniqueInput[]
    delete?: AlbumArtistWhereUniqueInput | AlbumArtistWhereUniqueInput[]
    connect?: AlbumArtistWhereUniqueInput | AlbumArtistWhereUniqueInput[]
    update?: AlbumArtistUpdateWithWhereUniqueWithoutArtistInput | AlbumArtistUpdateWithWhereUniqueWithoutArtistInput[]
    updateMany?: AlbumArtistUpdateManyWithWhereWithoutArtistInput | AlbumArtistUpdateManyWithWhereWithoutArtistInput[]
    deleteMany?: AlbumArtistScalarWhereInput | AlbumArtistScalarWhereInput[]
  }

  export type TrackArtistUncheckedUpdateManyWithoutArtistNestedInput = {
    create?: XOR<TrackArtistCreateWithoutArtistInput, TrackArtistUncheckedCreateWithoutArtistInput> | TrackArtistCreateWithoutArtistInput[] | TrackArtistUncheckedCreateWithoutArtistInput[]
    connectOrCreate?: TrackArtistCreateOrConnectWithoutArtistInput | TrackArtistCreateOrConnectWithoutArtistInput[]
    upsert?: TrackArtistUpsertWithWhereUniqueWithoutArtistInput | TrackArtistUpsertWithWhereUniqueWithoutArtistInput[]
    createMany?: TrackArtistCreateManyArtistInputEnvelope
    set?: TrackArtistWhereUniqueInput | TrackArtistWhereUniqueInput[]
    disconnect?: TrackArtistWhereUniqueInput | TrackArtistWhereUniqueInput[]
    delete?: TrackArtistWhereUniqueInput | TrackArtistWhereUniqueInput[]
    connect?: TrackArtistWhereUniqueInput | TrackArtistWhereUniqueInput[]
    update?: TrackArtistUpdateWithWhereUniqueWithoutArtistInput | TrackArtistUpdateWithWhereUniqueWithoutArtistInput[]
    updateMany?: TrackArtistUpdateManyWithWhereWithoutArtistInput | TrackArtistUpdateManyWithWhereWithoutArtistInput[]
    deleteMany?: TrackArtistScalarWhereInput | TrackArtistScalarWhereInput[]
  }

  export type AlbumArtistUncheckedUpdateManyWithoutArtistNestedInput = {
    create?: XOR<AlbumArtistCreateWithoutArtistInput, AlbumArtistUncheckedCreateWithoutArtistInput> | AlbumArtistCreateWithoutArtistInput[] | AlbumArtistUncheckedCreateWithoutArtistInput[]
    connectOrCreate?: AlbumArtistCreateOrConnectWithoutArtistInput | AlbumArtistCreateOrConnectWithoutArtistInput[]
    upsert?: AlbumArtistUpsertWithWhereUniqueWithoutArtistInput | AlbumArtistUpsertWithWhereUniqueWithoutArtistInput[]
    createMany?: AlbumArtistCreateManyArtistInputEnvelope
    set?: AlbumArtistWhereUniqueInput | AlbumArtistWhereUniqueInput[]
    disconnect?: AlbumArtistWhereUniqueInput | AlbumArtistWhereUniqueInput[]
    delete?: AlbumArtistWhereUniqueInput | AlbumArtistWhereUniqueInput[]
    connect?: AlbumArtistWhereUniqueInput | AlbumArtistWhereUniqueInput[]
    update?: AlbumArtistUpdateWithWhereUniqueWithoutArtistInput | AlbumArtistUpdateWithWhereUniqueWithoutArtistInput[]
    updateMany?: AlbumArtistUpdateManyWithWhereWithoutArtistInput | AlbumArtistUpdateManyWithWhereWithoutArtistInput[]
    deleteMany?: AlbumArtistScalarWhereInput | AlbumArtistScalarWhereInput[]
  }

  export type TrackCreateNestedManyWithoutAlbumInput = {
    create?: XOR<TrackCreateWithoutAlbumInput, TrackUncheckedCreateWithoutAlbumInput> | TrackCreateWithoutAlbumInput[] | TrackUncheckedCreateWithoutAlbumInput[]
    connectOrCreate?: TrackCreateOrConnectWithoutAlbumInput | TrackCreateOrConnectWithoutAlbumInput[]
    createMany?: TrackCreateManyAlbumInputEnvelope
    connect?: TrackWhereUniqueInput | TrackWhereUniqueInput[]
  }

  export type AlbumArtistCreateNestedManyWithoutAlbumInput = {
    create?: XOR<AlbumArtistCreateWithoutAlbumInput, AlbumArtistUncheckedCreateWithoutAlbumInput> | AlbumArtistCreateWithoutAlbumInput[] | AlbumArtistUncheckedCreateWithoutAlbumInput[]
    connectOrCreate?: AlbumArtistCreateOrConnectWithoutAlbumInput | AlbumArtistCreateOrConnectWithoutAlbumInput[]
    createMany?: AlbumArtistCreateManyAlbumInputEnvelope
    connect?: AlbumArtistWhereUniqueInput | AlbumArtistWhereUniqueInput[]
  }

  export type TrackUncheckedCreateNestedManyWithoutAlbumInput = {
    create?: XOR<TrackCreateWithoutAlbumInput, TrackUncheckedCreateWithoutAlbumInput> | TrackCreateWithoutAlbumInput[] | TrackUncheckedCreateWithoutAlbumInput[]
    connectOrCreate?: TrackCreateOrConnectWithoutAlbumInput | TrackCreateOrConnectWithoutAlbumInput[]
    createMany?: TrackCreateManyAlbumInputEnvelope
    connect?: TrackWhereUniqueInput | TrackWhereUniqueInput[]
  }

  export type AlbumArtistUncheckedCreateNestedManyWithoutAlbumInput = {
    create?: XOR<AlbumArtistCreateWithoutAlbumInput, AlbumArtistUncheckedCreateWithoutAlbumInput> | AlbumArtistCreateWithoutAlbumInput[] | AlbumArtistUncheckedCreateWithoutAlbumInput[]
    connectOrCreate?: AlbumArtistCreateOrConnectWithoutAlbumInput | AlbumArtistCreateOrConnectWithoutAlbumInput[]
    createMany?: AlbumArtistCreateManyAlbumInputEnvelope
    connect?: AlbumArtistWhereUniqueInput | AlbumArtistWhereUniqueInput[]
  }

  export type TrackUpdateManyWithoutAlbumNestedInput = {
    create?: XOR<TrackCreateWithoutAlbumInput, TrackUncheckedCreateWithoutAlbumInput> | TrackCreateWithoutAlbumInput[] | TrackUncheckedCreateWithoutAlbumInput[]
    connectOrCreate?: TrackCreateOrConnectWithoutAlbumInput | TrackCreateOrConnectWithoutAlbumInput[]
    upsert?: TrackUpsertWithWhereUniqueWithoutAlbumInput | TrackUpsertWithWhereUniqueWithoutAlbumInput[]
    createMany?: TrackCreateManyAlbumInputEnvelope
    set?: TrackWhereUniqueInput | TrackWhereUniqueInput[]
    disconnect?: TrackWhereUniqueInput | TrackWhereUniqueInput[]
    delete?: TrackWhereUniqueInput | TrackWhereUniqueInput[]
    connect?: TrackWhereUniqueInput | TrackWhereUniqueInput[]
    update?: TrackUpdateWithWhereUniqueWithoutAlbumInput | TrackUpdateWithWhereUniqueWithoutAlbumInput[]
    updateMany?: TrackUpdateManyWithWhereWithoutAlbumInput | TrackUpdateManyWithWhereWithoutAlbumInput[]
    deleteMany?: TrackScalarWhereInput | TrackScalarWhereInput[]
  }

  export type AlbumArtistUpdateManyWithoutAlbumNestedInput = {
    create?: XOR<AlbumArtistCreateWithoutAlbumInput, AlbumArtistUncheckedCreateWithoutAlbumInput> | AlbumArtistCreateWithoutAlbumInput[] | AlbumArtistUncheckedCreateWithoutAlbumInput[]
    connectOrCreate?: AlbumArtistCreateOrConnectWithoutAlbumInput | AlbumArtistCreateOrConnectWithoutAlbumInput[]
    upsert?: AlbumArtistUpsertWithWhereUniqueWithoutAlbumInput | AlbumArtistUpsertWithWhereUniqueWithoutAlbumInput[]
    createMany?: AlbumArtistCreateManyAlbumInputEnvelope
    set?: AlbumArtistWhereUniqueInput | AlbumArtistWhereUniqueInput[]
    disconnect?: AlbumArtistWhereUniqueInput | AlbumArtistWhereUniqueInput[]
    delete?: AlbumArtistWhereUniqueInput | AlbumArtistWhereUniqueInput[]
    connect?: AlbumArtistWhereUniqueInput | AlbumArtistWhereUniqueInput[]
    update?: AlbumArtistUpdateWithWhereUniqueWithoutAlbumInput | AlbumArtistUpdateWithWhereUniqueWithoutAlbumInput[]
    updateMany?: AlbumArtistUpdateManyWithWhereWithoutAlbumInput | AlbumArtistUpdateManyWithWhereWithoutAlbumInput[]
    deleteMany?: AlbumArtistScalarWhereInput | AlbumArtistScalarWhereInput[]
  }

  export type TrackUncheckedUpdateManyWithoutAlbumNestedInput = {
    create?: XOR<TrackCreateWithoutAlbumInput, TrackUncheckedCreateWithoutAlbumInput> | TrackCreateWithoutAlbumInput[] | TrackUncheckedCreateWithoutAlbumInput[]
    connectOrCreate?: TrackCreateOrConnectWithoutAlbumInput | TrackCreateOrConnectWithoutAlbumInput[]
    upsert?: TrackUpsertWithWhereUniqueWithoutAlbumInput | TrackUpsertWithWhereUniqueWithoutAlbumInput[]
    createMany?: TrackCreateManyAlbumInputEnvelope
    set?: TrackWhereUniqueInput | TrackWhereUniqueInput[]
    disconnect?: TrackWhereUniqueInput | TrackWhereUniqueInput[]
    delete?: TrackWhereUniqueInput | TrackWhereUniqueInput[]
    connect?: TrackWhereUniqueInput | TrackWhereUniqueInput[]
    update?: TrackUpdateWithWhereUniqueWithoutAlbumInput | TrackUpdateWithWhereUniqueWithoutAlbumInput[]
    updateMany?: TrackUpdateManyWithWhereWithoutAlbumInput | TrackUpdateManyWithWhereWithoutAlbumInput[]
    deleteMany?: TrackScalarWhereInput | TrackScalarWhereInput[]
  }

  export type AlbumArtistUncheckedUpdateManyWithoutAlbumNestedInput = {
    create?: XOR<AlbumArtistCreateWithoutAlbumInput, AlbumArtistUncheckedCreateWithoutAlbumInput> | AlbumArtistCreateWithoutAlbumInput[] | AlbumArtistUncheckedCreateWithoutAlbumInput[]
    connectOrCreate?: AlbumArtistCreateOrConnectWithoutAlbumInput | AlbumArtistCreateOrConnectWithoutAlbumInput[]
    upsert?: AlbumArtistUpsertWithWhereUniqueWithoutAlbumInput | AlbumArtistUpsertWithWhereUniqueWithoutAlbumInput[]
    createMany?: AlbumArtistCreateManyAlbumInputEnvelope
    set?: AlbumArtistWhereUniqueInput | AlbumArtistWhereUniqueInput[]
    disconnect?: AlbumArtistWhereUniqueInput | AlbumArtistWhereUniqueInput[]
    delete?: AlbumArtistWhereUniqueInput | AlbumArtistWhereUniqueInput[]
    connect?: AlbumArtistWhereUniqueInput | AlbumArtistWhereUniqueInput[]
    update?: AlbumArtistUpdateWithWhereUniqueWithoutAlbumInput | AlbumArtistUpdateWithWhereUniqueWithoutAlbumInput[]
    updateMany?: AlbumArtistUpdateManyWithWhereWithoutAlbumInput | AlbumArtistUpdateManyWithWhereWithoutAlbumInput[]
    deleteMany?: AlbumArtistScalarWhereInput | AlbumArtistScalarWhereInput[]
  }

  export type AlbumCreateNestedOneWithoutTracksInput = {
    create?: XOR<AlbumCreateWithoutTracksInput, AlbumUncheckedCreateWithoutTracksInput>
    connectOrCreate?: AlbumCreateOrConnectWithoutTracksInput
    connect?: AlbumWhereUniqueInput
  }

  export type TrackArtistCreateNestedManyWithoutTrackInput = {
    create?: XOR<TrackArtistCreateWithoutTrackInput, TrackArtistUncheckedCreateWithoutTrackInput> | TrackArtistCreateWithoutTrackInput[] | TrackArtistUncheckedCreateWithoutTrackInput[]
    connectOrCreate?: TrackArtistCreateOrConnectWithoutTrackInput | TrackArtistCreateOrConnectWithoutTrackInput[]
    createMany?: TrackArtistCreateManyTrackInputEnvelope
    connect?: TrackArtistWhereUniqueInput | TrackArtistWhereUniqueInput[]
  }

  export type TrackAudioResourceCreateNestedManyWithoutTrackInput = {
    create?: XOR<TrackAudioResourceCreateWithoutTrackInput, TrackAudioResourceUncheckedCreateWithoutTrackInput> | TrackAudioResourceCreateWithoutTrackInput[] | TrackAudioResourceUncheckedCreateWithoutTrackInput[]
    connectOrCreate?: TrackAudioResourceCreateOrConnectWithoutTrackInput | TrackAudioResourceCreateOrConnectWithoutTrackInput[]
    createMany?: TrackAudioResourceCreateManyTrackInputEnvelope
    connect?: TrackAudioResourceWhereUniqueInput | TrackAudioResourceWhereUniqueInput[]
  }

  export type PlaylistTrackCreateNestedManyWithoutTrackInput = {
    create?: XOR<PlaylistTrackCreateWithoutTrackInput, PlaylistTrackUncheckedCreateWithoutTrackInput> | PlaylistTrackCreateWithoutTrackInput[] | PlaylistTrackUncheckedCreateWithoutTrackInput[]
    connectOrCreate?: PlaylistTrackCreateOrConnectWithoutTrackInput | PlaylistTrackCreateOrConnectWithoutTrackInput[]
    createMany?: PlaylistTrackCreateManyTrackInputEnvelope
    connect?: PlaylistTrackWhereUniqueInput | PlaylistTrackWhereUniqueInput[]
  }

  export type LikedTrackCreateNestedManyWithoutTrackInput = {
    create?: XOR<LikedTrackCreateWithoutTrackInput, LikedTrackUncheckedCreateWithoutTrackInput> | LikedTrackCreateWithoutTrackInput[] | LikedTrackUncheckedCreateWithoutTrackInput[]
    connectOrCreate?: LikedTrackCreateOrConnectWithoutTrackInput | LikedTrackCreateOrConnectWithoutTrackInput[]
    createMany?: LikedTrackCreateManyTrackInputEnvelope
    connect?: LikedTrackWhereUniqueInput | LikedTrackWhereUniqueInput[]
  }

  export type PlaybackHistoryCreateNestedManyWithoutTrackInput = {
    create?: XOR<PlaybackHistoryCreateWithoutTrackInput, PlaybackHistoryUncheckedCreateWithoutTrackInput> | PlaybackHistoryCreateWithoutTrackInput[] | PlaybackHistoryUncheckedCreateWithoutTrackInput[]
    connectOrCreate?: PlaybackHistoryCreateOrConnectWithoutTrackInput | PlaybackHistoryCreateOrConnectWithoutTrackInput[]
    createMany?: PlaybackHistoryCreateManyTrackInputEnvelope
    connect?: PlaybackHistoryWhereUniqueInput | PlaybackHistoryWhereUniqueInput[]
  }

  export type TrackGenreCreateNestedManyWithoutTrackInput = {
    create?: XOR<TrackGenreCreateWithoutTrackInput, TrackGenreUncheckedCreateWithoutTrackInput> | TrackGenreCreateWithoutTrackInput[] | TrackGenreUncheckedCreateWithoutTrackInput[]
    connectOrCreate?: TrackGenreCreateOrConnectWithoutTrackInput | TrackGenreCreateOrConnectWithoutTrackInput[]
    createMany?: TrackGenreCreateManyTrackInputEnvelope
    connect?: TrackGenreWhereUniqueInput | TrackGenreWhereUniqueInput[]
  }

  export type TrackArtistUncheckedCreateNestedManyWithoutTrackInput = {
    create?: XOR<TrackArtistCreateWithoutTrackInput, TrackArtistUncheckedCreateWithoutTrackInput> | TrackArtistCreateWithoutTrackInput[] | TrackArtistUncheckedCreateWithoutTrackInput[]
    connectOrCreate?: TrackArtistCreateOrConnectWithoutTrackInput | TrackArtistCreateOrConnectWithoutTrackInput[]
    createMany?: TrackArtistCreateManyTrackInputEnvelope
    connect?: TrackArtistWhereUniqueInput | TrackArtistWhereUniqueInput[]
  }

  export type TrackAudioResourceUncheckedCreateNestedManyWithoutTrackInput = {
    create?: XOR<TrackAudioResourceCreateWithoutTrackInput, TrackAudioResourceUncheckedCreateWithoutTrackInput> | TrackAudioResourceCreateWithoutTrackInput[] | TrackAudioResourceUncheckedCreateWithoutTrackInput[]
    connectOrCreate?: TrackAudioResourceCreateOrConnectWithoutTrackInput | TrackAudioResourceCreateOrConnectWithoutTrackInput[]
    createMany?: TrackAudioResourceCreateManyTrackInputEnvelope
    connect?: TrackAudioResourceWhereUniqueInput | TrackAudioResourceWhereUniqueInput[]
  }

  export type PlaylistTrackUncheckedCreateNestedManyWithoutTrackInput = {
    create?: XOR<PlaylistTrackCreateWithoutTrackInput, PlaylistTrackUncheckedCreateWithoutTrackInput> | PlaylistTrackCreateWithoutTrackInput[] | PlaylistTrackUncheckedCreateWithoutTrackInput[]
    connectOrCreate?: PlaylistTrackCreateOrConnectWithoutTrackInput | PlaylistTrackCreateOrConnectWithoutTrackInput[]
    createMany?: PlaylistTrackCreateManyTrackInputEnvelope
    connect?: PlaylistTrackWhereUniqueInput | PlaylistTrackWhereUniqueInput[]
  }

  export type LikedTrackUncheckedCreateNestedManyWithoutTrackInput = {
    create?: XOR<LikedTrackCreateWithoutTrackInput, LikedTrackUncheckedCreateWithoutTrackInput> | LikedTrackCreateWithoutTrackInput[] | LikedTrackUncheckedCreateWithoutTrackInput[]
    connectOrCreate?: LikedTrackCreateOrConnectWithoutTrackInput | LikedTrackCreateOrConnectWithoutTrackInput[]
    createMany?: LikedTrackCreateManyTrackInputEnvelope
    connect?: LikedTrackWhereUniqueInput | LikedTrackWhereUniqueInput[]
  }

  export type PlaybackHistoryUncheckedCreateNestedManyWithoutTrackInput = {
    create?: XOR<PlaybackHistoryCreateWithoutTrackInput, PlaybackHistoryUncheckedCreateWithoutTrackInput> | PlaybackHistoryCreateWithoutTrackInput[] | PlaybackHistoryUncheckedCreateWithoutTrackInput[]
    connectOrCreate?: PlaybackHistoryCreateOrConnectWithoutTrackInput | PlaybackHistoryCreateOrConnectWithoutTrackInput[]
    createMany?: PlaybackHistoryCreateManyTrackInputEnvelope
    connect?: PlaybackHistoryWhereUniqueInput | PlaybackHistoryWhereUniqueInput[]
  }

  export type TrackGenreUncheckedCreateNestedManyWithoutTrackInput = {
    create?: XOR<TrackGenreCreateWithoutTrackInput, TrackGenreUncheckedCreateWithoutTrackInput> | TrackGenreCreateWithoutTrackInput[] | TrackGenreUncheckedCreateWithoutTrackInput[]
    connectOrCreate?: TrackGenreCreateOrConnectWithoutTrackInput | TrackGenreCreateOrConnectWithoutTrackInput[]
    createMany?: TrackGenreCreateManyTrackInputEnvelope
    connect?: TrackGenreWhereUniqueInput | TrackGenreWhereUniqueInput[]
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type AlbumUpdateOneRequiredWithoutTracksNestedInput = {
    create?: XOR<AlbumCreateWithoutTracksInput, AlbumUncheckedCreateWithoutTracksInput>
    connectOrCreate?: AlbumCreateOrConnectWithoutTracksInput
    upsert?: AlbumUpsertWithoutTracksInput
    connect?: AlbumWhereUniqueInput
    update?: XOR<XOR<AlbumUpdateToOneWithWhereWithoutTracksInput, AlbumUpdateWithoutTracksInput>, AlbumUncheckedUpdateWithoutTracksInput>
  }

  export type TrackArtistUpdateManyWithoutTrackNestedInput = {
    create?: XOR<TrackArtistCreateWithoutTrackInput, TrackArtistUncheckedCreateWithoutTrackInput> | TrackArtistCreateWithoutTrackInput[] | TrackArtistUncheckedCreateWithoutTrackInput[]
    connectOrCreate?: TrackArtistCreateOrConnectWithoutTrackInput | TrackArtistCreateOrConnectWithoutTrackInput[]
    upsert?: TrackArtistUpsertWithWhereUniqueWithoutTrackInput | TrackArtistUpsertWithWhereUniqueWithoutTrackInput[]
    createMany?: TrackArtistCreateManyTrackInputEnvelope
    set?: TrackArtistWhereUniqueInput | TrackArtistWhereUniqueInput[]
    disconnect?: TrackArtistWhereUniqueInput | TrackArtistWhereUniqueInput[]
    delete?: TrackArtistWhereUniqueInput | TrackArtistWhereUniqueInput[]
    connect?: TrackArtistWhereUniqueInput | TrackArtistWhereUniqueInput[]
    update?: TrackArtistUpdateWithWhereUniqueWithoutTrackInput | TrackArtistUpdateWithWhereUniqueWithoutTrackInput[]
    updateMany?: TrackArtistUpdateManyWithWhereWithoutTrackInput | TrackArtistUpdateManyWithWhereWithoutTrackInput[]
    deleteMany?: TrackArtistScalarWhereInput | TrackArtistScalarWhereInput[]
  }

  export type TrackAudioResourceUpdateManyWithoutTrackNestedInput = {
    create?: XOR<TrackAudioResourceCreateWithoutTrackInput, TrackAudioResourceUncheckedCreateWithoutTrackInput> | TrackAudioResourceCreateWithoutTrackInput[] | TrackAudioResourceUncheckedCreateWithoutTrackInput[]
    connectOrCreate?: TrackAudioResourceCreateOrConnectWithoutTrackInput | TrackAudioResourceCreateOrConnectWithoutTrackInput[]
    upsert?: TrackAudioResourceUpsertWithWhereUniqueWithoutTrackInput | TrackAudioResourceUpsertWithWhereUniqueWithoutTrackInput[]
    createMany?: TrackAudioResourceCreateManyTrackInputEnvelope
    set?: TrackAudioResourceWhereUniqueInput | TrackAudioResourceWhereUniqueInput[]
    disconnect?: TrackAudioResourceWhereUniqueInput | TrackAudioResourceWhereUniqueInput[]
    delete?: TrackAudioResourceWhereUniqueInput | TrackAudioResourceWhereUniqueInput[]
    connect?: TrackAudioResourceWhereUniqueInput | TrackAudioResourceWhereUniqueInput[]
    update?: TrackAudioResourceUpdateWithWhereUniqueWithoutTrackInput | TrackAudioResourceUpdateWithWhereUniqueWithoutTrackInput[]
    updateMany?: TrackAudioResourceUpdateManyWithWhereWithoutTrackInput | TrackAudioResourceUpdateManyWithWhereWithoutTrackInput[]
    deleteMany?: TrackAudioResourceScalarWhereInput | TrackAudioResourceScalarWhereInput[]
  }

  export type PlaylistTrackUpdateManyWithoutTrackNestedInput = {
    create?: XOR<PlaylistTrackCreateWithoutTrackInput, PlaylistTrackUncheckedCreateWithoutTrackInput> | PlaylistTrackCreateWithoutTrackInput[] | PlaylistTrackUncheckedCreateWithoutTrackInput[]
    connectOrCreate?: PlaylistTrackCreateOrConnectWithoutTrackInput | PlaylistTrackCreateOrConnectWithoutTrackInput[]
    upsert?: PlaylistTrackUpsertWithWhereUniqueWithoutTrackInput | PlaylistTrackUpsertWithWhereUniqueWithoutTrackInput[]
    createMany?: PlaylistTrackCreateManyTrackInputEnvelope
    set?: PlaylistTrackWhereUniqueInput | PlaylistTrackWhereUniqueInput[]
    disconnect?: PlaylistTrackWhereUniqueInput | PlaylistTrackWhereUniqueInput[]
    delete?: PlaylistTrackWhereUniqueInput | PlaylistTrackWhereUniqueInput[]
    connect?: PlaylistTrackWhereUniqueInput | PlaylistTrackWhereUniqueInput[]
    update?: PlaylistTrackUpdateWithWhereUniqueWithoutTrackInput | PlaylistTrackUpdateWithWhereUniqueWithoutTrackInput[]
    updateMany?: PlaylistTrackUpdateManyWithWhereWithoutTrackInput | PlaylistTrackUpdateManyWithWhereWithoutTrackInput[]
    deleteMany?: PlaylistTrackScalarWhereInput | PlaylistTrackScalarWhereInput[]
  }

  export type LikedTrackUpdateManyWithoutTrackNestedInput = {
    create?: XOR<LikedTrackCreateWithoutTrackInput, LikedTrackUncheckedCreateWithoutTrackInput> | LikedTrackCreateWithoutTrackInput[] | LikedTrackUncheckedCreateWithoutTrackInput[]
    connectOrCreate?: LikedTrackCreateOrConnectWithoutTrackInput | LikedTrackCreateOrConnectWithoutTrackInput[]
    upsert?: LikedTrackUpsertWithWhereUniqueWithoutTrackInput | LikedTrackUpsertWithWhereUniqueWithoutTrackInput[]
    createMany?: LikedTrackCreateManyTrackInputEnvelope
    set?: LikedTrackWhereUniqueInput | LikedTrackWhereUniqueInput[]
    disconnect?: LikedTrackWhereUniqueInput | LikedTrackWhereUniqueInput[]
    delete?: LikedTrackWhereUniqueInput | LikedTrackWhereUniqueInput[]
    connect?: LikedTrackWhereUniqueInput | LikedTrackWhereUniqueInput[]
    update?: LikedTrackUpdateWithWhereUniqueWithoutTrackInput | LikedTrackUpdateWithWhereUniqueWithoutTrackInput[]
    updateMany?: LikedTrackUpdateManyWithWhereWithoutTrackInput | LikedTrackUpdateManyWithWhereWithoutTrackInput[]
    deleteMany?: LikedTrackScalarWhereInput | LikedTrackScalarWhereInput[]
  }

  export type PlaybackHistoryUpdateManyWithoutTrackNestedInput = {
    create?: XOR<PlaybackHistoryCreateWithoutTrackInput, PlaybackHistoryUncheckedCreateWithoutTrackInput> | PlaybackHistoryCreateWithoutTrackInput[] | PlaybackHistoryUncheckedCreateWithoutTrackInput[]
    connectOrCreate?: PlaybackHistoryCreateOrConnectWithoutTrackInput | PlaybackHistoryCreateOrConnectWithoutTrackInput[]
    upsert?: PlaybackHistoryUpsertWithWhereUniqueWithoutTrackInput | PlaybackHistoryUpsertWithWhereUniqueWithoutTrackInput[]
    createMany?: PlaybackHistoryCreateManyTrackInputEnvelope
    set?: PlaybackHistoryWhereUniqueInput | PlaybackHistoryWhereUniqueInput[]
    disconnect?: PlaybackHistoryWhereUniqueInput | PlaybackHistoryWhereUniqueInput[]
    delete?: PlaybackHistoryWhereUniqueInput | PlaybackHistoryWhereUniqueInput[]
    connect?: PlaybackHistoryWhereUniqueInput | PlaybackHistoryWhereUniqueInput[]
    update?: PlaybackHistoryUpdateWithWhereUniqueWithoutTrackInput | PlaybackHistoryUpdateWithWhereUniqueWithoutTrackInput[]
    updateMany?: PlaybackHistoryUpdateManyWithWhereWithoutTrackInput | PlaybackHistoryUpdateManyWithWhereWithoutTrackInput[]
    deleteMany?: PlaybackHistoryScalarWhereInput | PlaybackHistoryScalarWhereInput[]
  }

  export type TrackGenreUpdateManyWithoutTrackNestedInput = {
    create?: XOR<TrackGenreCreateWithoutTrackInput, TrackGenreUncheckedCreateWithoutTrackInput> | TrackGenreCreateWithoutTrackInput[] | TrackGenreUncheckedCreateWithoutTrackInput[]
    connectOrCreate?: TrackGenreCreateOrConnectWithoutTrackInput | TrackGenreCreateOrConnectWithoutTrackInput[]
    upsert?: TrackGenreUpsertWithWhereUniqueWithoutTrackInput | TrackGenreUpsertWithWhereUniqueWithoutTrackInput[]
    createMany?: TrackGenreCreateManyTrackInputEnvelope
    set?: TrackGenreWhereUniqueInput | TrackGenreWhereUniqueInput[]
    disconnect?: TrackGenreWhereUniqueInput | TrackGenreWhereUniqueInput[]
    delete?: TrackGenreWhereUniqueInput | TrackGenreWhereUniqueInput[]
    connect?: TrackGenreWhereUniqueInput | TrackGenreWhereUniqueInput[]
    update?: TrackGenreUpdateWithWhereUniqueWithoutTrackInput | TrackGenreUpdateWithWhereUniqueWithoutTrackInput[]
    updateMany?: TrackGenreUpdateManyWithWhereWithoutTrackInput | TrackGenreUpdateManyWithWhereWithoutTrackInput[]
    deleteMany?: TrackGenreScalarWhereInput | TrackGenreScalarWhereInput[]
  }

  export type TrackArtistUncheckedUpdateManyWithoutTrackNestedInput = {
    create?: XOR<TrackArtistCreateWithoutTrackInput, TrackArtistUncheckedCreateWithoutTrackInput> | TrackArtistCreateWithoutTrackInput[] | TrackArtistUncheckedCreateWithoutTrackInput[]
    connectOrCreate?: TrackArtistCreateOrConnectWithoutTrackInput | TrackArtistCreateOrConnectWithoutTrackInput[]
    upsert?: TrackArtistUpsertWithWhereUniqueWithoutTrackInput | TrackArtistUpsertWithWhereUniqueWithoutTrackInput[]
    createMany?: TrackArtistCreateManyTrackInputEnvelope
    set?: TrackArtistWhereUniqueInput | TrackArtistWhereUniqueInput[]
    disconnect?: TrackArtistWhereUniqueInput | TrackArtistWhereUniqueInput[]
    delete?: TrackArtistWhereUniqueInput | TrackArtistWhereUniqueInput[]
    connect?: TrackArtistWhereUniqueInput | TrackArtistWhereUniqueInput[]
    update?: TrackArtistUpdateWithWhereUniqueWithoutTrackInput | TrackArtistUpdateWithWhereUniqueWithoutTrackInput[]
    updateMany?: TrackArtistUpdateManyWithWhereWithoutTrackInput | TrackArtistUpdateManyWithWhereWithoutTrackInput[]
    deleteMany?: TrackArtistScalarWhereInput | TrackArtistScalarWhereInput[]
  }

  export type TrackAudioResourceUncheckedUpdateManyWithoutTrackNestedInput = {
    create?: XOR<TrackAudioResourceCreateWithoutTrackInput, TrackAudioResourceUncheckedCreateWithoutTrackInput> | TrackAudioResourceCreateWithoutTrackInput[] | TrackAudioResourceUncheckedCreateWithoutTrackInput[]
    connectOrCreate?: TrackAudioResourceCreateOrConnectWithoutTrackInput | TrackAudioResourceCreateOrConnectWithoutTrackInput[]
    upsert?: TrackAudioResourceUpsertWithWhereUniqueWithoutTrackInput | TrackAudioResourceUpsertWithWhereUniqueWithoutTrackInput[]
    createMany?: TrackAudioResourceCreateManyTrackInputEnvelope
    set?: TrackAudioResourceWhereUniqueInput | TrackAudioResourceWhereUniqueInput[]
    disconnect?: TrackAudioResourceWhereUniqueInput | TrackAudioResourceWhereUniqueInput[]
    delete?: TrackAudioResourceWhereUniqueInput | TrackAudioResourceWhereUniqueInput[]
    connect?: TrackAudioResourceWhereUniqueInput | TrackAudioResourceWhereUniqueInput[]
    update?: TrackAudioResourceUpdateWithWhereUniqueWithoutTrackInput | TrackAudioResourceUpdateWithWhereUniqueWithoutTrackInput[]
    updateMany?: TrackAudioResourceUpdateManyWithWhereWithoutTrackInput | TrackAudioResourceUpdateManyWithWhereWithoutTrackInput[]
    deleteMany?: TrackAudioResourceScalarWhereInput | TrackAudioResourceScalarWhereInput[]
  }

  export type PlaylistTrackUncheckedUpdateManyWithoutTrackNestedInput = {
    create?: XOR<PlaylistTrackCreateWithoutTrackInput, PlaylistTrackUncheckedCreateWithoutTrackInput> | PlaylistTrackCreateWithoutTrackInput[] | PlaylistTrackUncheckedCreateWithoutTrackInput[]
    connectOrCreate?: PlaylistTrackCreateOrConnectWithoutTrackInput | PlaylistTrackCreateOrConnectWithoutTrackInput[]
    upsert?: PlaylistTrackUpsertWithWhereUniqueWithoutTrackInput | PlaylistTrackUpsertWithWhereUniqueWithoutTrackInput[]
    createMany?: PlaylistTrackCreateManyTrackInputEnvelope
    set?: PlaylistTrackWhereUniqueInput | PlaylistTrackWhereUniqueInput[]
    disconnect?: PlaylistTrackWhereUniqueInput | PlaylistTrackWhereUniqueInput[]
    delete?: PlaylistTrackWhereUniqueInput | PlaylistTrackWhereUniqueInput[]
    connect?: PlaylistTrackWhereUniqueInput | PlaylistTrackWhereUniqueInput[]
    update?: PlaylistTrackUpdateWithWhereUniqueWithoutTrackInput | PlaylistTrackUpdateWithWhereUniqueWithoutTrackInput[]
    updateMany?: PlaylistTrackUpdateManyWithWhereWithoutTrackInput | PlaylistTrackUpdateManyWithWhereWithoutTrackInput[]
    deleteMany?: PlaylistTrackScalarWhereInput | PlaylistTrackScalarWhereInput[]
  }

  export type LikedTrackUncheckedUpdateManyWithoutTrackNestedInput = {
    create?: XOR<LikedTrackCreateWithoutTrackInput, LikedTrackUncheckedCreateWithoutTrackInput> | LikedTrackCreateWithoutTrackInput[] | LikedTrackUncheckedCreateWithoutTrackInput[]
    connectOrCreate?: LikedTrackCreateOrConnectWithoutTrackInput | LikedTrackCreateOrConnectWithoutTrackInput[]
    upsert?: LikedTrackUpsertWithWhereUniqueWithoutTrackInput | LikedTrackUpsertWithWhereUniqueWithoutTrackInput[]
    createMany?: LikedTrackCreateManyTrackInputEnvelope
    set?: LikedTrackWhereUniqueInput | LikedTrackWhereUniqueInput[]
    disconnect?: LikedTrackWhereUniqueInput | LikedTrackWhereUniqueInput[]
    delete?: LikedTrackWhereUniqueInput | LikedTrackWhereUniqueInput[]
    connect?: LikedTrackWhereUniqueInput | LikedTrackWhereUniqueInput[]
    update?: LikedTrackUpdateWithWhereUniqueWithoutTrackInput | LikedTrackUpdateWithWhereUniqueWithoutTrackInput[]
    updateMany?: LikedTrackUpdateManyWithWhereWithoutTrackInput | LikedTrackUpdateManyWithWhereWithoutTrackInput[]
    deleteMany?: LikedTrackScalarWhereInput | LikedTrackScalarWhereInput[]
  }

  export type PlaybackHistoryUncheckedUpdateManyWithoutTrackNestedInput = {
    create?: XOR<PlaybackHistoryCreateWithoutTrackInput, PlaybackHistoryUncheckedCreateWithoutTrackInput> | PlaybackHistoryCreateWithoutTrackInput[] | PlaybackHistoryUncheckedCreateWithoutTrackInput[]
    connectOrCreate?: PlaybackHistoryCreateOrConnectWithoutTrackInput | PlaybackHistoryCreateOrConnectWithoutTrackInput[]
    upsert?: PlaybackHistoryUpsertWithWhereUniqueWithoutTrackInput | PlaybackHistoryUpsertWithWhereUniqueWithoutTrackInput[]
    createMany?: PlaybackHistoryCreateManyTrackInputEnvelope
    set?: PlaybackHistoryWhereUniqueInput | PlaybackHistoryWhereUniqueInput[]
    disconnect?: PlaybackHistoryWhereUniqueInput | PlaybackHistoryWhereUniqueInput[]
    delete?: PlaybackHistoryWhereUniqueInput | PlaybackHistoryWhereUniqueInput[]
    connect?: PlaybackHistoryWhereUniqueInput | PlaybackHistoryWhereUniqueInput[]
    update?: PlaybackHistoryUpdateWithWhereUniqueWithoutTrackInput | PlaybackHistoryUpdateWithWhereUniqueWithoutTrackInput[]
    updateMany?: PlaybackHistoryUpdateManyWithWhereWithoutTrackInput | PlaybackHistoryUpdateManyWithWhereWithoutTrackInput[]
    deleteMany?: PlaybackHistoryScalarWhereInput | PlaybackHistoryScalarWhereInput[]
  }

  export type TrackGenreUncheckedUpdateManyWithoutTrackNestedInput = {
    create?: XOR<TrackGenreCreateWithoutTrackInput, TrackGenreUncheckedCreateWithoutTrackInput> | TrackGenreCreateWithoutTrackInput[] | TrackGenreUncheckedCreateWithoutTrackInput[]
    connectOrCreate?: TrackGenreCreateOrConnectWithoutTrackInput | TrackGenreCreateOrConnectWithoutTrackInput[]
    upsert?: TrackGenreUpsertWithWhereUniqueWithoutTrackInput | TrackGenreUpsertWithWhereUniqueWithoutTrackInput[]
    createMany?: TrackGenreCreateManyTrackInputEnvelope
    set?: TrackGenreWhereUniqueInput | TrackGenreWhereUniqueInput[]
    disconnect?: TrackGenreWhereUniqueInput | TrackGenreWhereUniqueInput[]
    delete?: TrackGenreWhereUniqueInput | TrackGenreWhereUniqueInput[]
    connect?: TrackGenreWhereUniqueInput | TrackGenreWhereUniqueInput[]
    update?: TrackGenreUpdateWithWhereUniqueWithoutTrackInput | TrackGenreUpdateWithWhereUniqueWithoutTrackInput[]
    updateMany?: TrackGenreUpdateManyWithWhereWithoutTrackInput | TrackGenreUpdateManyWithWhereWithoutTrackInput[]
    deleteMany?: TrackGenreScalarWhereInput | TrackGenreScalarWhereInput[]
  }

  export type TrackCreateNestedOneWithoutArtistsInput = {
    create?: XOR<TrackCreateWithoutArtistsInput, TrackUncheckedCreateWithoutArtistsInput>
    connectOrCreate?: TrackCreateOrConnectWithoutArtistsInput
    connect?: TrackWhereUniqueInput
  }

  export type ArtistCreateNestedOneWithoutTracksInput = {
    create?: XOR<ArtistCreateWithoutTracksInput, ArtistUncheckedCreateWithoutTracksInput>
    connectOrCreate?: ArtistCreateOrConnectWithoutTracksInput
    connect?: ArtistWhereUniqueInput
  }

  export type TrackUpdateOneRequiredWithoutArtistsNestedInput = {
    create?: XOR<TrackCreateWithoutArtistsInput, TrackUncheckedCreateWithoutArtistsInput>
    connectOrCreate?: TrackCreateOrConnectWithoutArtistsInput
    upsert?: TrackUpsertWithoutArtistsInput
    connect?: TrackWhereUniqueInput
    update?: XOR<XOR<TrackUpdateToOneWithWhereWithoutArtistsInput, TrackUpdateWithoutArtistsInput>, TrackUncheckedUpdateWithoutArtistsInput>
  }

  export type ArtistUpdateOneRequiredWithoutTracksNestedInput = {
    create?: XOR<ArtistCreateWithoutTracksInput, ArtistUncheckedCreateWithoutTracksInput>
    connectOrCreate?: ArtistCreateOrConnectWithoutTracksInput
    upsert?: ArtistUpsertWithoutTracksInput
    connect?: ArtistWhereUniqueInput
    update?: XOR<XOR<ArtistUpdateToOneWithWhereWithoutTracksInput, ArtistUpdateWithoutTracksInput>, ArtistUncheckedUpdateWithoutTracksInput>
  }

  export type AlbumCreateNestedOneWithoutArtistsInput = {
    create?: XOR<AlbumCreateWithoutArtistsInput, AlbumUncheckedCreateWithoutArtistsInput>
    connectOrCreate?: AlbumCreateOrConnectWithoutArtistsInput
    connect?: AlbumWhereUniqueInput
  }

  export type ArtistCreateNestedOneWithoutAlbumsInput = {
    create?: XOR<ArtistCreateWithoutAlbumsInput, ArtistUncheckedCreateWithoutAlbumsInput>
    connectOrCreate?: ArtistCreateOrConnectWithoutAlbumsInput
    connect?: ArtistWhereUniqueInput
  }

  export type AlbumUpdateOneRequiredWithoutArtistsNestedInput = {
    create?: XOR<AlbumCreateWithoutArtistsInput, AlbumUncheckedCreateWithoutArtistsInput>
    connectOrCreate?: AlbumCreateOrConnectWithoutArtistsInput
    upsert?: AlbumUpsertWithoutArtistsInput
    connect?: AlbumWhereUniqueInput
    update?: XOR<XOR<AlbumUpdateToOneWithWhereWithoutArtistsInput, AlbumUpdateWithoutArtistsInput>, AlbumUncheckedUpdateWithoutArtistsInput>
  }

  export type ArtistUpdateOneRequiredWithoutAlbumsNestedInput = {
    create?: XOR<ArtistCreateWithoutAlbumsInput, ArtistUncheckedCreateWithoutAlbumsInput>
    connectOrCreate?: ArtistCreateOrConnectWithoutAlbumsInput
    upsert?: ArtistUpsertWithoutAlbumsInput
    connect?: ArtistWhereUniqueInput
    update?: XOR<XOR<ArtistUpdateToOneWithWhereWithoutAlbumsInput, ArtistUpdateWithoutAlbumsInput>, ArtistUncheckedUpdateWithoutAlbumsInput>
  }

  export type TrackCreateNestedOneWithoutAudioResourcesInput = {
    create?: XOR<TrackCreateWithoutAudioResourcesInput, TrackUncheckedCreateWithoutAudioResourcesInput>
    connectOrCreate?: TrackCreateOrConnectWithoutAudioResourcesInput
    connect?: TrackWhereUniqueInput
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type TrackUpdateOneRequiredWithoutAudioResourcesNestedInput = {
    create?: XOR<TrackCreateWithoutAudioResourcesInput, TrackUncheckedCreateWithoutAudioResourcesInput>
    connectOrCreate?: TrackCreateOrConnectWithoutAudioResourcesInput
    upsert?: TrackUpsertWithoutAudioResourcesInput
    connect?: TrackWhereUniqueInput
    update?: XOR<XOR<TrackUpdateToOneWithWhereWithoutAudioResourcesInput, TrackUpdateWithoutAudioResourcesInput>, TrackUncheckedUpdateWithoutAudioResourcesInput>
  }

  export type TrackGenreCreateNestedManyWithoutGenreInput = {
    create?: XOR<TrackGenreCreateWithoutGenreInput, TrackGenreUncheckedCreateWithoutGenreInput> | TrackGenreCreateWithoutGenreInput[] | TrackGenreUncheckedCreateWithoutGenreInput[]
    connectOrCreate?: TrackGenreCreateOrConnectWithoutGenreInput | TrackGenreCreateOrConnectWithoutGenreInput[]
    createMany?: TrackGenreCreateManyGenreInputEnvelope
    connect?: TrackGenreWhereUniqueInput | TrackGenreWhereUniqueInput[]
  }

  export type TrackGenreUncheckedCreateNestedManyWithoutGenreInput = {
    create?: XOR<TrackGenreCreateWithoutGenreInput, TrackGenreUncheckedCreateWithoutGenreInput> | TrackGenreCreateWithoutGenreInput[] | TrackGenreUncheckedCreateWithoutGenreInput[]
    connectOrCreate?: TrackGenreCreateOrConnectWithoutGenreInput | TrackGenreCreateOrConnectWithoutGenreInput[]
    createMany?: TrackGenreCreateManyGenreInputEnvelope
    connect?: TrackGenreWhereUniqueInput | TrackGenreWhereUniqueInput[]
  }

  export type TrackGenreUpdateManyWithoutGenreNestedInput = {
    create?: XOR<TrackGenreCreateWithoutGenreInput, TrackGenreUncheckedCreateWithoutGenreInput> | TrackGenreCreateWithoutGenreInput[] | TrackGenreUncheckedCreateWithoutGenreInput[]
    connectOrCreate?: TrackGenreCreateOrConnectWithoutGenreInput | TrackGenreCreateOrConnectWithoutGenreInput[]
    upsert?: TrackGenreUpsertWithWhereUniqueWithoutGenreInput | TrackGenreUpsertWithWhereUniqueWithoutGenreInput[]
    createMany?: TrackGenreCreateManyGenreInputEnvelope
    set?: TrackGenreWhereUniqueInput | TrackGenreWhereUniqueInput[]
    disconnect?: TrackGenreWhereUniqueInput | TrackGenreWhereUniqueInput[]
    delete?: TrackGenreWhereUniqueInput | TrackGenreWhereUniqueInput[]
    connect?: TrackGenreWhereUniqueInput | TrackGenreWhereUniqueInput[]
    update?: TrackGenreUpdateWithWhereUniqueWithoutGenreInput | TrackGenreUpdateWithWhereUniqueWithoutGenreInput[]
    updateMany?: TrackGenreUpdateManyWithWhereWithoutGenreInput | TrackGenreUpdateManyWithWhereWithoutGenreInput[]
    deleteMany?: TrackGenreScalarWhereInput | TrackGenreScalarWhereInput[]
  }

  export type TrackGenreUncheckedUpdateManyWithoutGenreNestedInput = {
    create?: XOR<TrackGenreCreateWithoutGenreInput, TrackGenreUncheckedCreateWithoutGenreInput> | TrackGenreCreateWithoutGenreInput[] | TrackGenreUncheckedCreateWithoutGenreInput[]
    connectOrCreate?: TrackGenreCreateOrConnectWithoutGenreInput | TrackGenreCreateOrConnectWithoutGenreInput[]
    upsert?: TrackGenreUpsertWithWhereUniqueWithoutGenreInput | TrackGenreUpsertWithWhereUniqueWithoutGenreInput[]
    createMany?: TrackGenreCreateManyGenreInputEnvelope
    set?: TrackGenreWhereUniqueInput | TrackGenreWhereUniqueInput[]
    disconnect?: TrackGenreWhereUniqueInput | TrackGenreWhereUniqueInput[]
    delete?: TrackGenreWhereUniqueInput | TrackGenreWhereUniqueInput[]
    connect?: TrackGenreWhereUniqueInput | TrackGenreWhereUniqueInput[]
    update?: TrackGenreUpdateWithWhereUniqueWithoutGenreInput | TrackGenreUpdateWithWhereUniqueWithoutGenreInput[]
    updateMany?: TrackGenreUpdateManyWithWhereWithoutGenreInput | TrackGenreUpdateManyWithWhereWithoutGenreInput[]
    deleteMany?: TrackGenreScalarWhereInput | TrackGenreScalarWhereInput[]
  }

  export type TrackCreateNestedOneWithoutGenresInput = {
    create?: XOR<TrackCreateWithoutGenresInput, TrackUncheckedCreateWithoutGenresInput>
    connectOrCreate?: TrackCreateOrConnectWithoutGenresInput
    connect?: TrackWhereUniqueInput
  }

  export type GenreCreateNestedOneWithoutTracksInput = {
    create?: XOR<GenreCreateWithoutTracksInput, GenreUncheckedCreateWithoutTracksInput>
    connectOrCreate?: GenreCreateOrConnectWithoutTracksInput
    connect?: GenreWhereUniqueInput
  }

  export type TrackUpdateOneRequiredWithoutGenresNestedInput = {
    create?: XOR<TrackCreateWithoutGenresInput, TrackUncheckedCreateWithoutGenresInput>
    connectOrCreate?: TrackCreateOrConnectWithoutGenresInput
    upsert?: TrackUpsertWithoutGenresInput
    connect?: TrackWhereUniqueInput
    update?: XOR<XOR<TrackUpdateToOneWithWhereWithoutGenresInput, TrackUpdateWithoutGenresInput>, TrackUncheckedUpdateWithoutGenresInput>
  }

  export type GenreUpdateOneRequiredWithoutTracksNestedInput = {
    create?: XOR<GenreCreateWithoutTracksInput, GenreUncheckedCreateWithoutTracksInput>
    connectOrCreate?: GenreCreateOrConnectWithoutTracksInput
    upsert?: GenreUpsertWithoutTracksInput
    connect?: GenreWhereUniqueInput
    update?: XOR<XOR<GenreUpdateToOneWithWhereWithoutTracksInput, GenreUpdateWithoutTracksInput>, GenreUncheckedUpdateWithoutTracksInput>
  }

  export type UserCreateNestedOneWithoutOwnedPlaylistsInput = {
    create?: XOR<UserCreateWithoutOwnedPlaylistsInput, UserUncheckedCreateWithoutOwnedPlaylistsInput>
    connectOrCreate?: UserCreateOrConnectWithoutOwnedPlaylistsInput
    connect?: UserWhereUniqueInput
  }

  export type PlaylistTrackCreateNestedManyWithoutPlaylistInput = {
    create?: XOR<PlaylistTrackCreateWithoutPlaylistInput, PlaylistTrackUncheckedCreateWithoutPlaylistInput> | PlaylistTrackCreateWithoutPlaylistInput[] | PlaylistTrackUncheckedCreateWithoutPlaylistInput[]
    connectOrCreate?: PlaylistTrackCreateOrConnectWithoutPlaylistInput | PlaylistTrackCreateOrConnectWithoutPlaylistInput[]
    createMany?: PlaylistTrackCreateManyPlaylistInputEnvelope
    connect?: PlaylistTrackWhereUniqueInput | PlaylistTrackWhereUniqueInput[]
  }

  export type PlaylistFollowerCreateNestedManyWithoutPlaylistInput = {
    create?: XOR<PlaylistFollowerCreateWithoutPlaylistInput, PlaylistFollowerUncheckedCreateWithoutPlaylistInput> | PlaylistFollowerCreateWithoutPlaylistInput[] | PlaylistFollowerUncheckedCreateWithoutPlaylistInput[]
    connectOrCreate?: PlaylistFollowerCreateOrConnectWithoutPlaylistInput | PlaylistFollowerCreateOrConnectWithoutPlaylistInput[]
    createMany?: PlaylistFollowerCreateManyPlaylistInputEnvelope
    connect?: PlaylistFollowerWhereUniqueInput | PlaylistFollowerWhereUniqueInput[]
  }

  export type PlaylistTrackUncheckedCreateNestedManyWithoutPlaylistInput = {
    create?: XOR<PlaylistTrackCreateWithoutPlaylistInput, PlaylistTrackUncheckedCreateWithoutPlaylistInput> | PlaylistTrackCreateWithoutPlaylistInput[] | PlaylistTrackUncheckedCreateWithoutPlaylistInput[]
    connectOrCreate?: PlaylistTrackCreateOrConnectWithoutPlaylistInput | PlaylistTrackCreateOrConnectWithoutPlaylistInput[]
    createMany?: PlaylistTrackCreateManyPlaylistInputEnvelope
    connect?: PlaylistTrackWhereUniqueInput | PlaylistTrackWhereUniqueInput[]
  }

  export type PlaylistFollowerUncheckedCreateNestedManyWithoutPlaylistInput = {
    create?: XOR<PlaylistFollowerCreateWithoutPlaylistInput, PlaylistFollowerUncheckedCreateWithoutPlaylistInput> | PlaylistFollowerCreateWithoutPlaylistInput[] | PlaylistFollowerUncheckedCreateWithoutPlaylistInput[]
    connectOrCreate?: PlaylistFollowerCreateOrConnectWithoutPlaylistInput | PlaylistFollowerCreateOrConnectWithoutPlaylistInput[]
    createMany?: PlaylistFollowerCreateManyPlaylistInputEnvelope
    connect?: PlaylistFollowerWhereUniqueInput | PlaylistFollowerWhereUniqueInput[]
  }

  export type UserUpdateOneRequiredWithoutOwnedPlaylistsNestedInput = {
    create?: XOR<UserCreateWithoutOwnedPlaylistsInput, UserUncheckedCreateWithoutOwnedPlaylistsInput>
    connectOrCreate?: UserCreateOrConnectWithoutOwnedPlaylistsInput
    upsert?: UserUpsertWithoutOwnedPlaylistsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutOwnedPlaylistsInput, UserUpdateWithoutOwnedPlaylistsInput>, UserUncheckedUpdateWithoutOwnedPlaylistsInput>
  }

  export type PlaylistTrackUpdateManyWithoutPlaylistNestedInput = {
    create?: XOR<PlaylistTrackCreateWithoutPlaylistInput, PlaylistTrackUncheckedCreateWithoutPlaylistInput> | PlaylistTrackCreateWithoutPlaylistInput[] | PlaylistTrackUncheckedCreateWithoutPlaylistInput[]
    connectOrCreate?: PlaylistTrackCreateOrConnectWithoutPlaylistInput | PlaylistTrackCreateOrConnectWithoutPlaylistInput[]
    upsert?: PlaylistTrackUpsertWithWhereUniqueWithoutPlaylistInput | PlaylistTrackUpsertWithWhereUniqueWithoutPlaylistInput[]
    createMany?: PlaylistTrackCreateManyPlaylistInputEnvelope
    set?: PlaylistTrackWhereUniqueInput | PlaylistTrackWhereUniqueInput[]
    disconnect?: PlaylistTrackWhereUniqueInput | PlaylistTrackWhereUniqueInput[]
    delete?: PlaylistTrackWhereUniqueInput | PlaylistTrackWhereUniqueInput[]
    connect?: PlaylistTrackWhereUniqueInput | PlaylistTrackWhereUniqueInput[]
    update?: PlaylistTrackUpdateWithWhereUniqueWithoutPlaylistInput | PlaylistTrackUpdateWithWhereUniqueWithoutPlaylistInput[]
    updateMany?: PlaylistTrackUpdateManyWithWhereWithoutPlaylistInput | PlaylistTrackUpdateManyWithWhereWithoutPlaylistInput[]
    deleteMany?: PlaylistTrackScalarWhereInput | PlaylistTrackScalarWhereInput[]
  }

  export type PlaylistFollowerUpdateManyWithoutPlaylistNestedInput = {
    create?: XOR<PlaylistFollowerCreateWithoutPlaylistInput, PlaylistFollowerUncheckedCreateWithoutPlaylistInput> | PlaylistFollowerCreateWithoutPlaylistInput[] | PlaylistFollowerUncheckedCreateWithoutPlaylistInput[]
    connectOrCreate?: PlaylistFollowerCreateOrConnectWithoutPlaylistInput | PlaylistFollowerCreateOrConnectWithoutPlaylistInput[]
    upsert?: PlaylistFollowerUpsertWithWhereUniqueWithoutPlaylistInput | PlaylistFollowerUpsertWithWhereUniqueWithoutPlaylistInput[]
    createMany?: PlaylistFollowerCreateManyPlaylistInputEnvelope
    set?: PlaylistFollowerWhereUniqueInput | PlaylistFollowerWhereUniqueInput[]
    disconnect?: PlaylistFollowerWhereUniqueInput | PlaylistFollowerWhereUniqueInput[]
    delete?: PlaylistFollowerWhereUniqueInput | PlaylistFollowerWhereUniqueInput[]
    connect?: PlaylistFollowerWhereUniqueInput | PlaylistFollowerWhereUniqueInput[]
    update?: PlaylistFollowerUpdateWithWhereUniqueWithoutPlaylistInput | PlaylistFollowerUpdateWithWhereUniqueWithoutPlaylistInput[]
    updateMany?: PlaylistFollowerUpdateManyWithWhereWithoutPlaylistInput | PlaylistFollowerUpdateManyWithWhereWithoutPlaylistInput[]
    deleteMany?: PlaylistFollowerScalarWhereInput | PlaylistFollowerScalarWhereInput[]
  }

  export type PlaylistTrackUncheckedUpdateManyWithoutPlaylistNestedInput = {
    create?: XOR<PlaylistTrackCreateWithoutPlaylistInput, PlaylistTrackUncheckedCreateWithoutPlaylistInput> | PlaylistTrackCreateWithoutPlaylistInput[] | PlaylistTrackUncheckedCreateWithoutPlaylistInput[]
    connectOrCreate?: PlaylistTrackCreateOrConnectWithoutPlaylistInput | PlaylistTrackCreateOrConnectWithoutPlaylistInput[]
    upsert?: PlaylistTrackUpsertWithWhereUniqueWithoutPlaylistInput | PlaylistTrackUpsertWithWhereUniqueWithoutPlaylistInput[]
    createMany?: PlaylistTrackCreateManyPlaylistInputEnvelope
    set?: PlaylistTrackWhereUniqueInput | PlaylistTrackWhereUniqueInput[]
    disconnect?: PlaylistTrackWhereUniqueInput | PlaylistTrackWhereUniqueInput[]
    delete?: PlaylistTrackWhereUniqueInput | PlaylistTrackWhereUniqueInput[]
    connect?: PlaylistTrackWhereUniqueInput | PlaylistTrackWhereUniqueInput[]
    update?: PlaylistTrackUpdateWithWhereUniqueWithoutPlaylistInput | PlaylistTrackUpdateWithWhereUniqueWithoutPlaylistInput[]
    updateMany?: PlaylistTrackUpdateManyWithWhereWithoutPlaylistInput | PlaylistTrackUpdateManyWithWhereWithoutPlaylistInput[]
    deleteMany?: PlaylistTrackScalarWhereInput | PlaylistTrackScalarWhereInput[]
  }

  export type PlaylistFollowerUncheckedUpdateManyWithoutPlaylistNestedInput = {
    create?: XOR<PlaylistFollowerCreateWithoutPlaylistInput, PlaylistFollowerUncheckedCreateWithoutPlaylistInput> | PlaylistFollowerCreateWithoutPlaylistInput[] | PlaylistFollowerUncheckedCreateWithoutPlaylistInput[]
    connectOrCreate?: PlaylistFollowerCreateOrConnectWithoutPlaylistInput | PlaylistFollowerCreateOrConnectWithoutPlaylistInput[]
    upsert?: PlaylistFollowerUpsertWithWhereUniqueWithoutPlaylistInput | PlaylistFollowerUpsertWithWhereUniqueWithoutPlaylistInput[]
    createMany?: PlaylistFollowerCreateManyPlaylistInputEnvelope
    set?: PlaylistFollowerWhereUniqueInput | PlaylistFollowerWhereUniqueInput[]
    disconnect?: PlaylistFollowerWhereUniqueInput | PlaylistFollowerWhereUniqueInput[]
    delete?: PlaylistFollowerWhereUniqueInput | PlaylistFollowerWhereUniqueInput[]
    connect?: PlaylistFollowerWhereUniqueInput | PlaylistFollowerWhereUniqueInput[]
    update?: PlaylistFollowerUpdateWithWhereUniqueWithoutPlaylistInput | PlaylistFollowerUpdateWithWhereUniqueWithoutPlaylistInput[]
    updateMany?: PlaylistFollowerUpdateManyWithWhereWithoutPlaylistInput | PlaylistFollowerUpdateManyWithWhereWithoutPlaylistInput[]
    deleteMany?: PlaylistFollowerScalarWhereInput | PlaylistFollowerScalarWhereInput[]
  }

  export type PlaylistCreateNestedOneWithoutTracksInput = {
    create?: XOR<PlaylistCreateWithoutTracksInput, PlaylistUncheckedCreateWithoutTracksInput>
    connectOrCreate?: PlaylistCreateOrConnectWithoutTracksInput
    connect?: PlaylistWhereUniqueInput
  }

  export type TrackCreateNestedOneWithoutPlaylistTracksInput = {
    create?: XOR<TrackCreateWithoutPlaylistTracksInput, TrackUncheckedCreateWithoutPlaylistTracksInput>
    connectOrCreate?: TrackCreateOrConnectWithoutPlaylistTracksInput
    connect?: TrackWhereUniqueInput
  }

  export type PlaylistUpdateOneRequiredWithoutTracksNestedInput = {
    create?: XOR<PlaylistCreateWithoutTracksInput, PlaylistUncheckedCreateWithoutTracksInput>
    connectOrCreate?: PlaylistCreateOrConnectWithoutTracksInput
    upsert?: PlaylistUpsertWithoutTracksInput
    connect?: PlaylistWhereUniqueInput
    update?: XOR<XOR<PlaylistUpdateToOneWithWhereWithoutTracksInput, PlaylistUpdateWithoutTracksInput>, PlaylistUncheckedUpdateWithoutTracksInput>
  }

  export type TrackUpdateOneRequiredWithoutPlaylistTracksNestedInput = {
    create?: XOR<TrackCreateWithoutPlaylistTracksInput, TrackUncheckedCreateWithoutPlaylistTracksInput>
    connectOrCreate?: TrackCreateOrConnectWithoutPlaylistTracksInput
    upsert?: TrackUpsertWithoutPlaylistTracksInput
    connect?: TrackWhereUniqueInput
    update?: XOR<XOR<TrackUpdateToOneWithWhereWithoutPlaylistTracksInput, TrackUpdateWithoutPlaylistTracksInput>, TrackUncheckedUpdateWithoutPlaylistTracksInput>
  }

  export type PlaylistCreateNestedOneWithoutFollowersInput = {
    create?: XOR<PlaylistCreateWithoutFollowersInput, PlaylistUncheckedCreateWithoutFollowersInput>
    connectOrCreate?: PlaylistCreateOrConnectWithoutFollowersInput
    connect?: PlaylistWhereUniqueInput
  }

  export type UserCreateNestedOneWithoutFollowedPlaylistsInput = {
    create?: XOR<UserCreateWithoutFollowedPlaylistsInput, UserUncheckedCreateWithoutFollowedPlaylistsInput>
    connectOrCreate?: UserCreateOrConnectWithoutFollowedPlaylistsInput
    connect?: UserWhereUniqueInput
  }

  export type PlaylistUpdateOneRequiredWithoutFollowersNestedInput = {
    create?: XOR<PlaylistCreateWithoutFollowersInput, PlaylistUncheckedCreateWithoutFollowersInput>
    connectOrCreate?: PlaylistCreateOrConnectWithoutFollowersInput
    upsert?: PlaylistUpsertWithoutFollowersInput
    connect?: PlaylistWhereUniqueInput
    update?: XOR<XOR<PlaylistUpdateToOneWithWhereWithoutFollowersInput, PlaylistUpdateWithoutFollowersInput>, PlaylistUncheckedUpdateWithoutFollowersInput>
  }

  export type UserUpdateOneRequiredWithoutFollowedPlaylistsNestedInput = {
    create?: XOR<UserCreateWithoutFollowedPlaylistsInput, UserUncheckedCreateWithoutFollowedPlaylistsInput>
    connectOrCreate?: UserCreateOrConnectWithoutFollowedPlaylistsInput
    upsert?: UserUpsertWithoutFollowedPlaylistsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutFollowedPlaylistsInput, UserUpdateWithoutFollowedPlaylistsInput>, UserUncheckedUpdateWithoutFollowedPlaylistsInput>
  }

  export type UserCreateNestedOneWithoutLikedTracksInput = {
    create?: XOR<UserCreateWithoutLikedTracksInput, UserUncheckedCreateWithoutLikedTracksInput>
    connectOrCreate?: UserCreateOrConnectWithoutLikedTracksInput
    connect?: UserWhereUniqueInput
  }

  export type TrackCreateNestedOneWithoutLikedUsersInput = {
    create?: XOR<TrackCreateWithoutLikedUsersInput, TrackUncheckedCreateWithoutLikedUsersInput>
    connectOrCreate?: TrackCreateOrConnectWithoutLikedUsersInput
    connect?: TrackWhereUniqueInput
  }

  export type UserUpdateOneRequiredWithoutLikedTracksNestedInput = {
    create?: XOR<UserCreateWithoutLikedTracksInput, UserUncheckedCreateWithoutLikedTracksInput>
    connectOrCreate?: UserCreateOrConnectWithoutLikedTracksInput
    upsert?: UserUpsertWithoutLikedTracksInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutLikedTracksInput, UserUpdateWithoutLikedTracksInput>, UserUncheckedUpdateWithoutLikedTracksInput>
  }

  export type TrackUpdateOneRequiredWithoutLikedUsersNestedInput = {
    create?: XOR<TrackCreateWithoutLikedUsersInput, TrackUncheckedCreateWithoutLikedUsersInput>
    connectOrCreate?: TrackCreateOrConnectWithoutLikedUsersInput
    upsert?: TrackUpsertWithoutLikedUsersInput
    connect?: TrackWhereUniqueInput
    update?: XOR<XOR<TrackUpdateToOneWithWhereWithoutLikedUsersInput, TrackUpdateWithoutLikedUsersInput>, TrackUncheckedUpdateWithoutLikedUsersInput>
  }

  export type UserCreateNestedOneWithoutPlaybackHistoriesInput = {
    create?: XOR<UserCreateWithoutPlaybackHistoriesInput, UserUncheckedCreateWithoutPlaybackHistoriesInput>
    connectOrCreate?: UserCreateOrConnectWithoutPlaybackHistoriesInput
    connect?: UserWhereUniqueInput
  }

  export type TrackCreateNestedOneWithoutPlaybacksInput = {
    create?: XOR<TrackCreateWithoutPlaybacksInput, TrackUncheckedCreateWithoutPlaybacksInput>
    connectOrCreate?: TrackCreateOrConnectWithoutPlaybacksInput
    connect?: TrackWhereUniqueInput
  }

  export type UserUpdateOneRequiredWithoutPlaybackHistoriesNestedInput = {
    create?: XOR<UserCreateWithoutPlaybackHistoriesInput, UserUncheckedCreateWithoutPlaybackHistoriesInput>
    connectOrCreate?: UserCreateOrConnectWithoutPlaybackHistoriesInput
    upsert?: UserUpsertWithoutPlaybackHistoriesInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutPlaybackHistoriesInput, UserUpdateWithoutPlaybackHistoriesInput>, UserUncheckedUpdateWithoutPlaybackHistoriesInput>
  }

  export type TrackUpdateOneRequiredWithoutPlaybacksNestedInput = {
    create?: XOR<TrackCreateWithoutPlaybacksInput, TrackUncheckedCreateWithoutPlaybacksInput>
    connectOrCreate?: TrackCreateOrConnectWithoutPlaybacksInput
    upsert?: TrackUpsertWithoutPlaybacksInput
    connect?: TrackWhereUniqueInput
    update?: XOR<XOR<TrackUpdateToOneWithWhereWithoutPlaybacksInput, TrackUpdateWithoutPlaybacksInput>, TrackUncheckedUpdateWithoutPlaybacksInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type PlaylistCreateWithoutOwnerInput = {
    id?: string
    name: string
    description?: string | null
    coverUrl?: string | null
    isPublic?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    tracks?: PlaylistTrackCreateNestedManyWithoutPlaylistInput
    followers?: PlaylistFollowerCreateNestedManyWithoutPlaylistInput
  }

  export type PlaylistUncheckedCreateWithoutOwnerInput = {
    id?: string
    name: string
    description?: string | null
    coverUrl?: string | null
    isPublic?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    tracks?: PlaylistTrackUncheckedCreateNestedManyWithoutPlaylistInput
    followers?: PlaylistFollowerUncheckedCreateNestedManyWithoutPlaylistInput
  }

  export type PlaylistCreateOrConnectWithoutOwnerInput = {
    where: PlaylistWhereUniqueInput
    create: XOR<PlaylistCreateWithoutOwnerInput, PlaylistUncheckedCreateWithoutOwnerInput>
  }

  export type PlaylistCreateManyOwnerInputEnvelope = {
    data: PlaylistCreateManyOwnerInput | PlaylistCreateManyOwnerInput[]
  }

  export type PlaylistFollowerCreateWithoutUserInput = {
    followedAt?: Date | string
    playlist: PlaylistCreateNestedOneWithoutFollowersInput
  }

  export type PlaylistFollowerUncheckedCreateWithoutUserInput = {
    playlistId: string
    followedAt?: Date | string
  }

  export type PlaylistFollowerCreateOrConnectWithoutUserInput = {
    where: PlaylistFollowerWhereUniqueInput
    create: XOR<PlaylistFollowerCreateWithoutUserInput, PlaylistFollowerUncheckedCreateWithoutUserInput>
  }

  export type PlaylistFollowerCreateManyUserInputEnvelope = {
    data: PlaylistFollowerCreateManyUserInput | PlaylistFollowerCreateManyUserInput[]
  }

  export type LikedTrackCreateWithoutUserInput = {
    likedAt?: Date | string
    track: TrackCreateNestedOneWithoutLikedUsersInput
  }

  export type LikedTrackUncheckedCreateWithoutUserInput = {
    trackId: string
    likedAt?: Date | string
  }

  export type LikedTrackCreateOrConnectWithoutUserInput = {
    where: LikedTrackWhereUniqueInput
    create: XOR<LikedTrackCreateWithoutUserInput, LikedTrackUncheckedCreateWithoutUserInput>
  }

  export type LikedTrackCreateManyUserInputEnvelope = {
    data: LikedTrackCreateManyUserInput | LikedTrackCreateManyUserInput[]
  }

  export type PlaybackHistoryCreateWithoutUserInput = {
    id?: string
    playedAt?: Date | string
    contextType?: string | null
    contextId?: string | null
    track: TrackCreateNestedOneWithoutPlaybacksInput
  }

  export type PlaybackHistoryUncheckedCreateWithoutUserInput = {
    id?: string
    trackId: string
    playedAt?: Date | string
    contextType?: string | null
    contextId?: string | null
  }

  export type PlaybackHistoryCreateOrConnectWithoutUserInput = {
    where: PlaybackHistoryWhereUniqueInput
    create: XOR<PlaybackHistoryCreateWithoutUserInput, PlaybackHistoryUncheckedCreateWithoutUserInput>
  }

  export type PlaybackHistoryCreateManyUserInputEnvelope = {
    data: PlaybackHistoryCreateManyUserInput | PlaybackHistoryCreateManyUserInput[]
  }

  export type PlaylistUpsertWithWhereUniqueWithoutOwnerInput = {
    where: PlaylistWhereUniqueInput
    update: XOR<PlaylistUpdateWithoutOwnerInput, PlaylistUncheckedUpdateWithoutOwnerInput>
    create: XOR<PlaylistCreateWithoutOwnerInput, PlaylistUncheckedCreateWithoutOwnerInput>
  }

  export type PlaylistUpdateWithWhereUniqueWithoutOwnerInput = {
    where: PlaylistWhereUniqueInput
    data: XOR<PlaylistUpdateWithoutOwnerInput, PlaylistUncheckedUpdateWithoutOwnerInput>
  }

  export type PlaylistUpdateManyWithWhereWithoutOwnerInput = {
    where: PlaylistScalarWhereInput
    data: XOR<PlaylistUpdateManyMutationInput, PlaylistUncheckedUpdateManyWithoutOwnerInput>
  }

  export type PlaylistScalarWhereInput = {
    AND?: PlaylistScalarWhereInput | PlaylistScalarWhereInput[]
    OR?: PlaylistScalarWhereInput[]
    NOT?: PlaylistScalarWhereInput | PlaylistScalarWhereInput[]
    id?: StringFilter<"Playlist"> | string
    ownerId?: StringFilter<"Playlist"> | string
    name?: StringFilter<"Playlist"> | string
    description?: StringNullableFilter<"Playlist"> | string | null
    coverUrl?: StringNullableFilter<"Playlist"> | string | null
    isPublic?: BoolFilter<"Playlist"> | boolean
    createdAt?: DateTimeFilter<"Playlist"> | Date | string
    updatedAt?: DateTimeFilter<"Playlist"> | Date | string
  }

  export type PlaylistFollowerUpsertWithWhereUniqueWithoutUserInput = {
    where: PlaylistFollowerWhereUniqueInput
    update: XOR<PlaylistFollowerUpdateWithoutUserInput, PlaylistFollowerUncheckedUpdateWithoutUserInput>
    create: XOR<PlaylistFollowerCreateWithoutUserInput, PlaylistFollowerUncheckedCreateWithoutUserInput>
  }

  export type PlaylistFollowerUpdateWithWhereUniqueWithoutUserInput = {
    where: PlaylistFollowerWhereUniqueInput
    data: XOR<PlaylistFollowerUpdateWithoutUserInput, PlaylistFollowerUncheckedUpdateWithoutUserInput>
  }

  export type PlaylistFollowerUpdateManyWithWhereWithoutUserInput = {
    where: PlaylistFollowerScalarWhereInput
    data: XOR<PlaylistFollowerUpdateManyMutationInput, PlaylistFollowerUncheckedUpdateManyWithoutUserInput>
  }

  export type PlaylistFollowerScalarWhereInput = {
    AND?: PlaylistFollowerScalarWhereInput | PlaylistFollowerScalarWhereInput[]
    OR?: PlaylistFollowerScalarWhereInput[]
    NOT?: PlaylistFollowerScalarWhereInput | PlaylistFollowerScalarWhereInput[]
    playlistId?: StringFilter<"PlaylistFollower"> | string
    userId?: StringFilter<"PlaylistFollower"> | string
    followedAt?: DateTimeFilter<"PlaylistFollower"> | Date | string
  }

  export type LikedTrackUpsertWithWhereUniqueWithoutUserInput = {
    where: LikedTrackWhereUniqueInput
    update: XOR<LikedTrackUpdateWithoutUserInput, LikedTrackUncheckedUpdateWithoutUserInput>
    create: XOR<LikedTrackCreateWithoutUserInput, LikedTrackUncheckedCreateWithoutUserInput>
  }

  export type LikedTrackUpdateWithWhereUniqueWithoutUserInput = {
    where: LikedTrackWhereUniqueInput
    data: XOR<LikedTrackUpdateWithoutUserInput, LikedTrackUncheckedUpdateWithoutUserInput>
  }

  export type LikedTrackUpdateManyWithWhereWithoutUserInput = {
    where: LikedTrackScalarWhereInput
    data: XOR<LikedTrackUpdateManyMutationInput, LikedTrackUncheckedUpdateManyWithoutUserInput>
  }

  export type LikedTrackScalarWhereInput = {
    AND?: LikedTrackScalarWhereInput | LikedTrackScalarWhereInput[]
    OR?: LikedTrackScalarWhereInput[]
    NOT?: LikedTrackScalarWhereInput | LikedTrackScalarWhereInput[]
    userId?: StringFilter<"LikedTrack"> | string
    trackId?: StringFilter<"LikedTrack"> | string
    likedAt?: DateTimeFilter<"LikedTrack"> | Date | string
  }

  export type PlaybackHistoryUpsertWithWhereUniqueWithoutUserInput = {
    where: PlaybackHistoryWhereUniqueInput
    update: XOR<PlaybackHistoryUpdateWithoutUserInput, PlaybackHistoryUncheckedUpdateWithoutUserInput>
    create: XOR<PlaybackHistoryCreateWithoutUserInput, PlaybackHistoryUncheckedCreateWithoutUserInput>
  }

  export type PlaybackHistoryUpdateWithWhereUniqueWithoutUserInput = {
    where: PlaybackHistoryWhereUniqueInput
    data: XOR<PlaybackHistoryUpdateWithoutUserInput, PlaybackHistoryUncheckedUpdateWithoutUserInput>
  }

  export type PlaybackHistoryUpdateManyWithWhereWithoutUserInput = {
    where: PlaybackHistoryScalarWhereInput
    data: XOR<PlaybackHistoryUpdateManyMutationInput, PlaybackHistoryUncheckedUpdateManyWithoutUserInput>
  }

  export type PlaybackHistoryScalarWhereInput = {
    AND?: PlaybackHistoryScalarWhereInput | PlaybackHistoryScalarWhereInput[]
    OR?: PlaybackHistoryScalarWhereInput[]
    NOT?: PlaybackHistoryScalarWhereInput | PlaybackHistoryScalarWhereInput[]
    id?: StringFilter<"PlaybackHistory"> | string
    userId?: StringFilter<"PlaybackHistory"> | string
    trackId?: StringFilter<"PlaybackHistory"> | string
    playedAt?: DateTimeFilter<"PlaybackHistory"> | Date | string
    contextType?: StringNullableFilter<"PlaybackHistory"> | string | null
    contextId?: StringNullableFilter<"PlaybackHistory"> | string | null
  }

  export type TrackArtistCreateWithoutArtistInput = {
    role?: string
    track: TrackCreateNestedOneWithoutArtistsInput
  }

  export type TrackArtistUncheckedCreateWithoutArtistInput = {
    trackId: string
    role?: string
  }

  export type TrackArtistCreateOrConnectWithoutArtistInput = {
    where: TrackArtistWhereUniqueInput
    create: XOR<TrackArtistCreateWithoutArtistInput, TrackArtistUncheckedCreateWithoutArtistInput>
  }

  export type TrackArtistCreateManyArtistInputEnvelope = {
    data: TrackArtistCreateManyArtistInput | TrackArtistCreateManyArtistInput[]
  }

  export type AlbumArtistCreateWithoutArtistInput = {
    album: AlbumCreateNestedOneWithoutArtistsInput
  }

  export type AlbumArtistUncheckedCreateWithoutArtistInput = {
    albumId: string
  }

  export type AlbumArtistCreateOrConnectWithoutArtistInput = {
    where: AlbumArtistWhereUniqueInput
    create: XOR<AlbumArtistCreateWithoutArtistInput, AlbumArtistUncheckedCreateWithoutArtistInput>
  }

  export type AlbumArtistCreateManyArtistInputEnvelope = {
    data: AlbumArtistCreateManyArtistInput | AlbumArtistCreateManyArtistInput[]
  }

  export type TrackArtistUpsertWithWhereUniqueWithoutArtistInput = {
    where: TrackArtistWhereUniqueInput
    update: XOR<TrackArtistUpdateWithoutArtistInput, TrackArtistUncheckedUpdateWithoutArtistInput>
    create: XOR<TrackArtistCreateWithoutArtistInput, TrackArtistUncheckedCreateWithoutArtistInput>
  }

  export type TrackArtistUpdateWithWhereUniqueWithoutArtistInput = {
    where: TrackArtistWhereUniqueInput
    data: XOR<TrackArtistUpdateWithoutArtistInput, TrackArtistUncheckedUpdateWithoutArtistInput>
  }

  export type TrackArtistUpdateManyWithWhereWithoutArtistInput = {
    where: TrackArtistScalarWhereInput
    data: XOR<TrackArtistUpdateManyMutationInput, TrackArtistUncheckedUpdateManyWithoutArtistInput>
  }

  export type TrackArtistScalarWhereInput = {
    AND?: TrackArtistScalarWhereInput | TrackArtistScalarWhereInput[]
    OR?: TrackArtistScalarWhereInput[]
    NOT?: TrackArtistScalarWhereInput | TrackArtistScalarWhereInput[]
    trackId?: StringFilter<"TrackArtist"> | string
    artistId?: StringFilter<"TrackArtist"> | string
    role?: StringFilter<"TrackArtist"> | string
  }

  export type AlbumArtistUpsertWithWhereUniqueWithoutArtistInput = {
    where: AlbumArtistWhereUniqueInput
    update: XOR<AlbumArtistUpdateWithoutArtistInput, AlbumArtistUncheckedUpdateWithoutArtistInput>
    create: XOR<AlbumArtistCreateWithoutArtistInput, AlbumArtistUncheckedCreateWithoutArtistInput>
  }

  export type AlbumArtistUpdateWithWhereUniqueWithoutArtistInput = {
    where: AlbumArtistWhereUniqueInput
    data: XOR<AlbumArtistUpdateWithoutArtistInput, AlbumArtistUncheckedUpdateWithoutArtistInput>
  }

  export type AlbumArtistUpdateManyWithWhereWithoutArtistInput = {
    where: AlbumArtistScalarWhereInput
    data: XOR<AlbumArtistUpdateManyMutationInput, AlbumArtistUncheckedUpdateManyWithoutArtistInput>
  }

  export type AlbumArtistScalarWhereInput = {
    AND?: AlbumArtistScalarWhereInput | AlbumArtistScalarWhereInput[]
    OR?: AlbumArtistScalarWhereInput[]
    NOT?: AlbumArtistScalarWhereInput | AlbumArtistScalarWhereInput[]
    albumId?: StringFilter<"AlbumArtist"> | string
    artistId?: StringFilter<"AlbumArtist"> | string
  }

  export type TrackCreateWithoutAlbumInput = {
    id?: string
    title: string
    duration: number
    lyrics?: string | null
    trackNumber: number
    discNumber?: number
    isrc?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    artists?: TrackArtistCreateNestedManyWithoutTrackInput
    audioResources?: TrackAudioResourceCreateNestedManyWithoutTrackInput
    playlistTracks?: PlaylistTrackCreateNestedManyWithoutTrackInput
    likedUsers?: LikedTrackCreateNestedManyWithoutTrackInput
    playbacks?: PlaybackHistoryCreateNestedManyWithoutTrackInput
    genres?: TrackGenreCreateNestedManyWithoutTrackInput
  }

  export type TrackUncheckedCreateWithoutAlbumInput = {
    id?: string
    title: string
    duration: number
    lyrics?: string | null
    trackNumber: number
    discNumber?: number
    isrc?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    artists?: TrackArtistUncheckedCreateNestedManyWithoutTrackInput
    audioResources?: TrackAudioResourceUncheckedCreateNestedManyWithoutTrackInput
    playlistTracks?: PlaylistTrackUncheckedCreateNestedManyWithoutTrackInput
    likedUsers?: LikedTrackUncheckedCreateNestedManyWithoutTrackInput
    playbacks?: PlaybackHistoryUncheckedCreateNestedManyWithoutTrackInput
    genres?: TrackGenreUncheckedCreateNestedManyWithoutTrackInput
  }

  export type TrackCreateOrConnectWithoutAlbumInput = {
    where: TrackWhereUniqueInput
    create: XOR<TrackCreateWithoutAlbumInput, TrackUncheckedCreateWithoutAlbumInput>
  }

  export type TrackCreateManyAlbumInputEnvelope = {
    data: TrackCreateManyAlbumInput | TrackCreateManyAlbumInput[]
  }

  export type AlbumArtistCreateWithoutAlbumInput = {
    artist: ArtistCreateNestedOneWithoutAlbumsInput
  }

  export type AlbumArtistUncheckedCreateWithoutAlbumInput = {
    artistId: string
  }

  export type AlbumArtistCreateOrConnectWithoutAlbumInput = {
    where: AlbumArtistWhereUniqueInput
    create: XOR<AlbumArtistCreateWithoutAlbumInput, AlbumArtistUncheckedCreateWithoutAlbumInput>
  }

  export type AlbumArtistCreateManyAlbumInputEnvelope = {
    data: AlbumArtistCreateManyAlbumInput | AlbumArtistCreateManyAlbumInput[]
  }

  export type TrackUpsertWithWhereUniqueWithoutAlbumInput = {
    where: TrackWhereUniqueInput
    update: XOR<TrackUpdateWithoutAlbumInput, TrackUncheckedUpdateWithoutAlbumInput>
    create: XOR<TrackCreateWithoutAlbumInput, TrackUncheckedCreateWithoutAlbumInput>
  }

  export type TrackUpdateWithWhereUniqueWithoutAlbumInput = {
    where: TrackWhereUniqueInput
    data: XOR<TrackUpdateWithoutAlbumInput, TrackUncheckedUpdateWithoutAlbumInput>
  }

  export type TrackUpdateManyWithWhereWithoutAlbumInput = {
    where: TrackScalarWhereInput
    data: XOR<TrackUpdateManyMutationInput, TrackUncheckedUpdateManyWithoutAlbumInput>
  }

  export type TrackScalarWhereInput = {
    AND?: TrackScalarWhereInput | TrackScalarWhereInput[]
    OR?: TrackScalarWhereInput[]
    NOT?: TrackScalarWhereInput | TrackScalarWhereInput[]
    id?: StringFilter<"Track"> | string
    albumId?: StringFilter<"Track"> | string
    title?: StringFilter<"Track"> | string
    duration?: IntFilter<"Track"> | number
    lyrics?: StringNullableFilter<"Track"> | string | null
    trackNumber?: IntFilter<"Track"> | number
    discNumber?: IntFilter<"Track"> | number
    isrc?: StringNullableFilter<"Track"> | string | null
    createdAt?: DateTimeFilter<"Track"> | Date | string
    updatedAt?: DateTimeFilter<"Track"> | Date | string
  }

  export type AlbumArtistUpsertWithWhereUniqueWithoutAlbumInput = {
    where: AlbumArtistWhereUniqueInput
    update: XOR<AlbumArtistUpdateWithoutAlbumInput, AlbumArtistUncheckedUpdateWithoutAlbumInput>
    create: XOR<AlbumArtistCreateWithoutAlbumInput, AlbumArtistUncheckedCreateWithoutAlbumInput>
  }

  export type AlbumArtistUpdateWithWhereUniqueWithoutAlbumInput = {
    where: AlbumArtistWhereUniqueInput
    data: XOR<AlbumArtistUpdateWithoutAlbumInput, AlbumArtistUncheckedUpdateWithoutAlbumInput>
  }

  export type AlbumArtistUpdateManyWithWhereWithoutAlbumInput = {
    where: AlbumArtistScalarWhereInput
    data: XOR<AlbumArtistUpdateManyMutationInput, AlbumArtistUncheckedUpdateManyWithoutAlbumInput>
  }

  export type AlbumCreateWithoutTracksInput = {
    id?: string
    title: string
    coverUrl?: string | null
    releaseDate: Date | string
    albumType?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    artists?: AlbumArtistCreateNestedManyWithoutAlbumInput
  }

  export type AlbumUncheckedCreateWithoutTracksInput = {
    id?: string
    title: string
    coverUrl?: string | null
    releaseDate: Date | string
    albumType?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    artists?: AlbumArtistUncheckedCreateNestedManyWithoutAlbumInput
  }

  export type AlbumCreateOrConnectWithoutTracksInput = {
    where: AlbumWhereUniqueInput
    create: XOR<AlbumCreateWithoutTracksInput, AlbumUncheckedCreateWithoutTracksInput>
  }

  export type TrackArtistCreateWithoutTrackInput = {
    role?: string
    artist: ArtistCreateNestedOneWithoutTracksInput
  }

  export type TrackArtistUncheckedCreateWithoutTrackInput = {
    artistId: string
    role?: string
  }

  export type TrackArtistCreateOrConnectWithoutTrackInput = {
    where: TrackArtistWhereUniqueInput
    create: XOR<TrackArtistCreateWithoutTrackInput, TrackArtistUncheckedCreateWithoutTrackInput>
  }

  export type TrackArtistCreateManyTrackInputEnvelope = {
    data: TrackArtistCreateManyTrackInput | TrackArtistCreateManyTrackInput[]
  }

  export type TrackAudioResourceCreateWithoutTrackInput = {
    id?: string
    quality: string
    format: string
    bitrate: number
    streamUrl: string
    size: number
    isPremiumOnly?: boolean
    createdAt?: Date | string
  }

  export type TrackAudioResourceUncheckedCreateWithoutTrackInput = {
    id?: string
    quality: string
    format: string
    bitrate: number
    streamUrl: string
    size: number
    isPremiumOnly?: boolean
    createdAt?: Date | string
  }

  export type TrackAudioResourceCreateOrConnectWithoutTrackInput = {
    where: TrackAudioResourceWhereUniqueInput
    create: XOR<TrackAudioResourceCreateWithoutTrackInput, TrackAudioResourceUncheckedCreateWithoutTrackInput>
  }

  export type TrackAudioResourceCreateManyTrackInputEnvelope = {
    data: TrackAudioResourceCreateManyTrackInput | TrackAudioResourceCreateManyTrackInput[]
  }

  export type PlaylistTrackCreateWithoutTrackInput = {
    sortOrder?: number
    addedAt?: Date | string
    playlist: PlaylistCreateNestedOneWithoutTracksInput
  }

  export type PlaylistTrackUncheckedCreateWithoutTrackInput = {
    playlistId: string
    sortOrder?: number
    addedAt?: Date | string
  }

  export type PlaylistTrackCreateOrConnectWithoutTrackInput = {
    where: PlaylistTrackWhereUniqueInput
    create: XOR<PlaylistTrackCreateWithoutTrackInput, PlaylistTrackUncheckedCreateWithoutTrackInput>
  }

  export type PlaylistTrackCreateManyTrackInputEnvelope = {
    data: PlaylistTrackCreateManyTrackInput | PlaylistTrackCreateManyTrackInput[]
  }

  export type LikedTrackCreateWithoutTrackInput = {
    likedAt?: Date | string
    user: UserCreateNestedOneWithoutLikedTracksInput
  }

  export type LikedTrackUncheckedCreateWithoutTrackInput = {
    userId: string
    likedAt?: Date | string
  }

  export type LikedTrackCreateOrConnectWithoutTrackInput = {
    where: LikedTrackWhereUniqueInput
    create: XOR<LikedTrackCreateWithoutTrackInput, LikedTrackUncheckedCreateWithoutTrackInput>
  }

  export type LikedTrackCreateManyTrackInputEnvelope = {
    data: LikedTrackCreateManyTrackInput | LikedTrackCreateManyTrackInput[]
  }

  export type PlaybackHistoryCreateWithoutTrackInput = {
    id?: string
    playedAt?: Date | string
    contextType?: string | null
    contextId?: string | null
    user: UserCreateNestedOneWithoutPlaybackHistoriesInput
  }

  export type PlaybackHistoryUncheckedCreateWithoutTrackInput = {
    id?: string
    userId: string
    playedAt?: Date | string
    contextType?: string | null
    contextId?: string | null
  }

  export type PlaybackHistoryCreateOrConnectWithoutTrackInput = {
    where: PlaybackHistoryWhereUniqueInput
    create: XOR<PlaybackHistoryCreateWithoutTrackInput, PlaybackHistoryUncheckedCreateWithoutTrackInput>
  }

  export type PlaybackHistoryCreateManyTrackInputEnvelope = {
    data: PlaybackHistoryCreateManyTrackInput | PlaybackHistoryCreateManyTrackInput[]
  }

  export type TrackGenreCreateWithoutTrackInput = {
    genre: GenreCreateNestedOneWithoutTracksInput
  }

  export type TrackGenreUncheckedCreateWithoutTrackInput = {
    genreId: string
  }

  export type TrackGenreCreateOrConnectWithoutTrackInput = {
    where: TrackGenreWhereUniqueInput
    create: XOR<TrackGenreCreateWithoutTrackInput, TrackGenreUncheckedCreateWithoutTrackInput>
  }

  export type TrackGenreCreateManyTrackInputEnvelope = {
    data: TrackGenreCreateManyTrackInput | TrackGenreCreateManyTrackInput[]
  }

  export type AlbumUpsertWithoutTracksInput = {
    update: XOR<AlbumUpdateWithoutTracksInput, AlbumUncheckedUpdateWithoutTracksInput>
    create: XOR<AlbumCreateWithoutTracksInput, AlbumUncheckedCreateWithoutTracksInput>
    where?: AlbumWhereInput
  }

  export type AlbumUpdateToOneWithWhereWithoutTracksInput = {
    where?: AlbumWhereInput
    data: XOR<AlbumUpdateWithoutTracksInput, AlbumUncheckedUpdateWithoutTracksInput>
  }

  export type AlbumUpdateWithoutTracksInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    coverUrl?: NullableStringFieldUpdateOperationsInput | string | null
    releaseDate?: DateTimeFieldUpdateOperationsInput | Date | string
    albumType?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    artists?: AlbumArtistUpdateManyWithoutAlbumNestedInput
  }

  export type AlbumUncheckedUpdateWithoutTracksInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    coverUrl?: NullableStringFieldUpdateOperationsInput | string | null
    releaseDate?: DateTimeFieldUpdateOperationsInput | Date | string
    albumType?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    artists?: AlbumArtistUncheckedUpdateManyWithoutAlbumNestedInput
  }

  export type TrackArtistUpsertWithWhereUniqueWithoutTrackInput = {
    where: TrackArtistWhereUniqueInput
    update: XOR<TrackArtistUpdateWithoutTrackInput, TrackArtistUncheckedUpdateWithoutTrackInput>
    create: XOR<TrackArtistCreateWithoutTrackInput, TrackArtistUncheckedCreateWithoutTrackInput>
  }

  export type TrackArtistUpdateWithWhereUniqueWithoutTrackInput = {
    where: TrackArtistWhereUniqueInput
    data: XOR<TrackArtistUpdateWithoutTrackInput, TrackArtistUncheckedUpdateWithoutTrackInput>
  }

  export type TrackArtistUpdateManyWithWhereWithoutTrackInput = {
    where: TrackArtistScalarWhereInput
    data: XOR<TrackArtistUpdateManyMutationInput, TrackArtistUncheckedUpdateManyWithoutTrackInput>
  }

  export type TrackAudioResourceUpsertWithWhereUniqueWithoutTrackInput = {
    where: TrackAudioResourceWhereUniqueInput
    update: XOR<TrackAudioResourceUpdateWithoutTrackInput, TrackAudioResourceUncheckedUpdateWithoutTrackInput>
    create: XOR<TrackAudioResourceCreateWithoutTrackInput, TrackAudioResourceUncheckedCreateWithoutTrackInput>
  }

  export type TrackAudioResourceUpdateWithWhereUniqueWithoutTrackInput = {
    where: TrackAudioResourceWhereUniqueInput
    data: XOR<TrackAudioResourceUpdateWithoutTrackInput, TrackAudioResourceUncheckedUpdateWithoutTrackInput>
  }

  export type TrackAudioResourceUpdateManyWithWhereWithoutTrackInput = {
    where: TrackAudioResourceScalarWhereInput
    data: XOR<TrackAudioResourceUpdateManyMutationInput, TrackAudioResourceUncheckedUpdateManyWithoutTrackInput>
  }

  export type TrackAudioResourceScalarWhereInput = {
    AND?: TrackAudioResourceScalarWhereInput | TrackAudioResourceScalarWhereInput[]
    OR?: TrackAudioResourceScalarWhereInput[]
    NOT?: TrackAudioResourceScalarWhereInput | TrackAudioResourceScalarWhereInput[]
    id?: StringFilter<"TrackAudioResource"> | string
    trackId?: StringFilter<"TrackAudioResource"> | string
    quality?: StringFilter<"TrackAudioResource"> | string
    format?: StringFilter<"TrackAudioResource"> | string
    bitrate?: IntFilter<"TrackAudioResource"> | number
    streamUrl?: StringFilter<"TrackAudioResource"> | string
    size?: IntFilter<"TrackAudioResource"> | number
    isPremiumOnly?: BoolFilter<"TrackAudioResource"> | boolean
    createdAt?: DateTimeFilter<"TrackAudioResource"> | Date | string
  }

  export type PlaylistTrackUpsertWithWhereUniqueWithoutTrackInput = {
    where: PlaylistTrackWhereUniqueInput
    update: XOR<PlaylistTrackUpdateWithoutTrackInput, PlaylistTrackUncheckedUpdateWithoutTrackInput>
    create: XOR<PlaylistTrackCreateWithoutTrackInput, PlaylistTrackUncheckedCreateWithoutTrackInput>
  }

  export type PlaylistTrackUpdateWithWhereUniqueWithoutTrackInput = {
    where: PlaylistTrackWhereUniqueInput
    data: XOR<PlaylistTrackUpdateWithoutTrackInput, PlaylistTrackUncheckedUpdateWithoutTrackInput>
  }

  export type PlaylistTrackUpdateManyWithWhereWithoutTrackInput = {
    where: PlaylistTrackScalarWhereInput
    data: XOR<PlaylistTrackUpdateManyMutationInput, PlaylistTrackUncheckedUpdateManyWithoutTrackInput>
  }

  export type PlaylistTrackScalarWhereInput = {
    AND?: PlaylistTrackScalarWhereInput | PlaylistTrackScalarWhereInput[]
    OR?: PlaylistTrackScalarWhereInput[]
    NOT?: PlaylistTrackScalarWhereInput | PlaylistTrackScalarWhereInput[]
    playlistId?: StringFilter<"PlaylistTrack"> | string
    trackId?: StringFilter<"PlaylistTrack"> | string
    sortOrder?: IntFilter<"PlaylistTrack"> | number
    addedAt?: DateTimeFilter<"PlaylistTrack"> | Date | string
  }

  export type LikedTrackUpsertWithWhereUniqueWithoutTrackInput = {
    where: LikedTrackWhereUniqueInput
    update: XOR<LikedTrackUpdateWithoutTrackInput, LikedTrackUncheckedUpdateWithoutTrackInput>
    create: XOR<LikedTrackCreateWithoutTrackInput, LikedTrackUncheckedCreateWithoutTrackInput>
  }

  export type LikedTrackUpdateWithWhereUniqueWithoutTrackInput = {
    where: LikedTrackWhereUniqueInput
    data: XOR<LikedTrackUpdateWithoutTrackInput, LikedTrackUncheckedUpdateWithoutTrackInput>
  }

  export type LikedTrackUpdateManyWithWhereWithoutTrackInput = {
    where: LikedTrackScalarWhereInput
    data: XOR<LikedTrackUpdateManyMutationInput, LikedTrackUncheckedUpdateManyWithoutTrackInput>
  }

  export type PlaybackHistoryUpsertWithWhereUniqueWithoutTrackInput = {
    where: PlaybackHistoryWhereUniqueInput
    update: XOR<PlaybackHistoryUpdateWithoutTrackInput, PlaybackHistoryUncheckedUpdateWithoutTrackInput>
    create: XOR<PlaybackHistoryCreateWithoutTrackInput, PlaybackHistoryUncheckedCreateWithoutTrackInput>
  }

  export type PlaybackHistoryUpdateWithWhereUniqueWithoutTrackInput = {
    where: PlaybackHistoryWhereUniqueInput
    data: XOR<PlaybackHistoryUpdateWithoutTrackInput, PlaybackHistoryUncheckedUpdateWithoutTrackInput>
  }

  export type PlaybackHistoryUpdateManyWithWhereWithoutTrackInput = {
    where: PlaybackHistoryScalarWhereInput
    data: XOR<PlaybackHistoryUpdateManyMutationInput, PlaybackHistoryUncheckedUpdateManyWithoutTrackInput>
  }

  export type TrackGenreUpsertWithWhereUniqueWithoutTrackInput = {
    where: TrackGenreWhereUniqueInput
    update: XOR<TrackGenreUpdateWithoutTrackInput, TrackGenreUncheckedUpdateWithoutTrackInput>
    create: XOR<TrackGenreCreateWithoutTrackInput, TrackGenreUncheckedCreateWithoutTrackInput>
  }

  export type TrackGenreUpdateWithWhereUniqueWithoutTrackInput = {
    where: TrackGenreWhereUniqueInput
    data: XOR<TrackGenreUpdateWithoutTrackInput, TrackGenreUncheckedUpdateWithoutTrackInput>
  }

  export type TrackGenreUpdateManyWithWhereWithoutTrackInput = {
    where: TrackGenreScalarWhereInput
    data: XOR<TrackGenreUpdateManyMutationInput, TrackGenreUncheckedUpdateManyWithoutTrackInput>
  }

  export type TrackGenreScalarWhereInput = {
    AND?: TrackGenreScalarWhereInput | TrackGenreScalarWhereInput[]
    OR?: TrackGenreScalarWhereInput[]
    NOT?: TrackGenreScalarWhereInput | TrackGenreScalarWhereInput[]
    trackId?: StringFilter<"TrackGenre"> | string
    genreId?: StringFilter<"TrackGenre"> | string
  }

  export type TrackCreateWithoutArtistsInput = {
    id?: string
    title: string
    duration: number
    lyrics?: string | null
    trackNumber: number
    discNumber?: number
    isrc?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    album: AlbumCreateNestedOneWithoutTracksInput
    audioResources?: TrackAudioResourceCreateNestedManyWithoutTrackInput
    playlistTracks?: PlaylistTrackCreateNestedManyWithoutTrackInput
    likedUsers?: LikedTrackCreateNestedManyWithoutTrackInput
    playbacks?: PlaybackHistoryCreateNestedManyWithoutTrackInput
    genres?: TrackGenreCreateNestedManyWithoutTrackInput
  }

  export type TrackUncheckedCreateWithoutArtistsInput = {
    id?: string
    albumId: string
    title: string
    duration: number
    lyrics?: string | null
    trackNumber: number
    discNumber?: number
    isrc?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    audioResources?: TrackAudioResourceUncheckedCreateNestedManyWithoutTrackInput
    playlistTracks?: PlaylistTrackUncheckedCreateNestedManyWithoutTrackInput
    likedUsers?: LikedTrackUncheckedCreateNestedManyWithoutTrackInput
    playbacks?: PlaybackHistoryUncheckedCreateNestedManyWithoutTrackInput
    genres?: TrackGenreUncheckedCreateNestedManyWithoutTrackInput
  }

  export type TrackCreateOrConnectWithoutArtistsInput = {
    where: TrackWhereUniqueInput
    create: XOR<TrackCreateWithoutArtistsInput, TrackUncheckedCreateWithoutArtistsInput>
  }

  export type ArtistCreateWithoutTracksInput = {
    id?: string
    name: string
    coverImg?: string | null
    bio?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    albums?: AlbumArtistCreateNestedManyWithoutArtistInput
  }

  export type ArtistUncheckedCreateWithoutTracksInput = {
    id?: string
    name: string
    coverImg?: string | null
    bio?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    albums?: AlbumArtistUncheckedCreateNestedManyWithoutArtistInput
  }

  export type ArtistCreateOrConnectWithoutTracksInput = {
    where: ArtistWhereUniqueInput
    create: XOR<ArtistCreateWithoutTracksInput, ArtistUncheckedCreateWithoutTracksInput>
  }

  export type TrackUpsertWithoutArtistsInput = {
    update: XOR<TrackUpdateWithoutArtistsInput, TrackUncheckedUpdateWithoutArtistsInput>
    create: XOR<TrackCreateWithoutArtistsInput, TrackUncheckedCreateWithoutArtistsInput>
    where?: TrackWhereInput
  }

  export type TrackUpdateToOneWithWhereWithoutArtistsInput = {
    where?: TrackWhereInput
    data: XOR<TrackUpdateWithoutArtistsInput, TrackUncheckedUpdateWithoutArtistsInput>
  }

  export type TrackUpdateWithoutArtistsInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    duration?: IntFieldUpdateOperationsInput | number
    lyrics?: NullableStringFieldUpdateOperationsInput | string | null
    trackNumber?: IntFieldUpdateOperationsInput | number
    discNumber?: IntFieldUpdateOperationsInput | number
    isrc?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    album?: AlbumUpdateOneRequiredWithoutTracksNestedInput
    audioResources?: TrackAudioResourceUpdateManyWithoutTrackNestedInput
    playlistTracks?: PlaylistTrackUpdateManyWithoutTrackNestedInput
    likedUsers?: LikedTrackUpdateManyWithoutTrackNestedInput
    playbacks?: PlaybackHistoryUpdateManyWithoutTrackNestedInput
    genres?: TrackGenreUpdateManyWithoutTrackNestedInput
  }

  export type TrackUncheckedUpdateWithoutArtistsInput = {
    id?: StringFieldUpdateOperationsInput | string
    albumId?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    duration?: IntFieldUpdateOperationsInput | number
    lyrics?: NullableStringFieldUpdateOperationsInput | string | null
    trackNumber?: IntFieldUpdateOperationsInput | number
    discNumber?: IntFieldUpdateOperationsInput | number
    isrc?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    audioResources?: TrackAudioResourceUncheckedUpdateManyWithoutTrackNestedInput
    playlistTracks?: PlaylistTrackUncheckedUpdateManyWithoutTrackNestedInput
    likedUsers?: LikedTrackUncheckedUpdateManyWithoutTrackNestedInput
    playbacks?: PlaybackHistoryUncheckedUpdateManyWithoutTrackNestedInput
    genres?: TrackGenreUncheckedUpdateManyWithoutTrackNestedInput
  }

  export type ArtistUpsertWithoutTracksInput = {
    update: XOR<ArtistUpdateWithoutTracksInput, ArtistUncheckedUpdateWithoutTracksInput>
    create: XOR<ArtistCreateWithoutTracksInput, ArtistUncheckedCreateWithoutTracksInput>
    where?: ArtistWhereInput
  }

  export type ArtistUpdateToOneWithWhereWithoutTracksInput = {
    where?: ArtistWhereInput
    data: XOR<ArtistUpdateWithoutTracksInput, ArtistUncheckedUpdateWithoutTracksInput>
  }

  export type ArtistUpdateWithoutTracksInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    coverImg?: NullableStringFieldUpdateOperationsInput | string | null
    bio?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    albums?: AlbumArtistUpdateManyWithoutArtistNestedInput
  }

  export type ArtistUncheckedUpdateWithoutTracksInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    coverImg?: NullableStringFieldUpdateOperationsInput | string | null
    bio?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    albums?: AlbumArtistUncheckedUpdateManyWithoutArtistNestedInput
  }

  export type AlbumCreateWithoutArtistsInput = {
    id?: string
    title: string
    coverUrl?: string | null
    releaseDate: Date | string
    albumType?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    tracks?: TrackCreateNestedManyWithoutAlbumInput
  }

  export type AlbumUncheckedCreateWithoutArtistsInput = {
    id?: string
    title: string
    coverUrl?: string | null
    releaseDate: Date | string
    albumType?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    tracks?: TrackUncheckedCreateNestedManyWithoutAlbumInput
  }

  export type AlbumCreateOrConnectWithoutArtistsInput = {
    where: AlbumWhereUniqueInput
    create: XOR<AlbumCreateWithoutArtistsInput, AlbumUncheckedCreateWithoutArtistsInput>
  }

  export type ArtistCreateWithoutAlbumsInput = {
    id?: string
    name: string
    coverImg?: string | null
    bio?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    tracks?: TrackArtistCreateNestedManyWithoutArtistInput
  }

  export type ArtistUncheckedCreateWithoutAlbumsInput = {
    id?: string
    name: string
    coverImg?: string | null
    bio?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    tracks?: TrackArtistUncheckedCreateNestedManyWithoutArtistInput
  }

  export type ArtistCreateOrConnectWithoutAlbumsInput = {
    where: ArtistWhereUniqueInput
    create: XOR<ArtistCreateWithoutAlbumsInput, ArtistUncheckedCreateWithoutAlbumsInput>
  }

  export type AlbumUpsertWithoutArtistsInput = {
    update: XOR<AlbumUpdateWithoutArtistsInput, AlbumUncheckedUpdateWithoutArtistsInput>
    create: XOR<AlbumCreateWithoutArtistsInput, AlbumUncheckedCreateWithoutArtistsInput>
    where?: AlbumWhereInput
  }

  export type AlbumUpdateToOneWithWhereWithoutArtistsInput = {
    where?: AlbumWhereInput
    data: XOR<AlbumUpdateWithoutArtistsInput, AlbumUncheckedUpdateWithoutArtistsInput>
  }

  export type AlbumUpdateWithoutArtistsInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    coverUrl?: NullableStringFieldUpdateOperationsInput | string | null
    releaseDate?: DateTimeFieldUpdateOperationsInput | Date | string
    albumType?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tracks?: TrackUpdateManyWithoutAlbumNestedInput
  }

  export type AlbumUncheckedUpdateWithoutArtistsInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    coverUrl?: NullableStringFieldUpdateOperationsInput | string | null
    releaseDate?: DateTimeFieldUpdateOperationsInput | Date | string
    albumType?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tracks?: TrackUncheckedUpdateManyWithoutAlbumNestedInput
  }

  export type ArtistUpsertWithoutAlbumsInput = {
    update: XOR<ArtistUpdateWithoutAlbumsInput, ArtistUncheckedUpdateWithoutAlbumsInput>
    create: XOR<ArtistCreateWithoutAlbumsInput, ArtistUncheckedCreateWithoutAlbumsInput>
    where?: ArtistWhereInput
  }

  export type ArtistUpdateToOneWithWhereWithoutAlbumsInput = {
    where?: ArtistWhereInput
    data: XOR<ArtistUpdateWithoutAlbumsInput, ArtistUncheckedUpdateWithoutAlbumsInput>
  }

  export type ArtistUpdateWithoutAlbumsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    coverImg?: NullableStringFieldUpdateOperationsInput | string | null
    bio?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tracks?: TrackArtistUpdateManyWithoutArtistNestedInput
  }

  export type ArtistUncheckedUpdateWithoutAlbumsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    coverImg?: NullableStringFieldUpdateOperationsInput | string | null
    bio?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tracks?: TrackArtistUncheckedUpdateManyWithoutArtistNestedInput
  }

  export type TrackCreateWithoutAudioResourcesInput = {
    id?: string
    title: string
    duration: number
    lyrics?: string | null
    trackNumber: number
    discNumber?: number
    isrc?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    album: AlbumCreateNestedOneWithoutTracksInput
    artists?: TrackArtistCreateNestedManyWithoutTrackInput
    playlistTracks?: PlaylistTrackCreateNestedManyWithoutTrackInput
    likedUsers?: LikedTrackCreateNestedManyWithoutTrackInput
    playbacks?: PlaybackHistoryCreateNestedManyWithoutTrackInput
    genres?: TrackGenreCreateNestedManyWithoutTrackInput
  }

  export type TrackUncheckedCreateWithoutAudioResourcesInput = {
    id?: string
    albumId: string
    title: string
    duration: number
    lyrics?: string | null
    trackNumber: number
    discNumber?: number
    isrc?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    artists?: TrackArtistUncheckedCreateNestedManyWithoutTrackInput
    playlistTracks?: PlaylistTrackUncheckedCreateNestedManyWithoutTrackInput
    likedUsers?: LikedTrackUncheckedCreateNestedManyWithoutTrackInput
    playbacks?: PlaybackHistoryUncheckedCreateNestedManyWithoutTrackInput
    genres?: TrackGenreUncheckedCreateNestedManyWithoutTrackInput
  }

  export type TrackCreateOrConnectWithoutAudioResourcesInput = {
    where: TrackWhereUniqueInput
    create: XOR<TrackCreateWithoutAudioResourcesInput, TrackUncheckedCreateWithoutAudioResourcesInput>
  }

  export type TrackUpsertWithoutAudioResourcesInput = {
    update: XOR<TrackUpdateWithoutAudioResourcesInput, TrackUncheckedUpdateWithoutAudioResourcesInput>
    create: XOR<TrackCreateWithoutAudioResourcesInput, TrackUncheckedCreateWithoutAudioResourcesInput>
    where?: TrackWhereInput
  }

  export type TrackUpdateToOneWithWhereWithoutAudioResourcesInput = {
    where?: TrackWhereInput
    data: XOR<TrackUpdateWithoutAudioResourcesInput, TrackUncheckedUpdateWithoutAudioResourcesInput>
  }

  export type TrackUpdateWithoutAudioResourcesInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    duration?: IntFieldUpdateOperationsInput | number
    lyrics?: NullableStringFieldUpdateOperationsInput | string | null
    trackNumber?: IntFieldUpdateOperationsInput | number
    discNumber?: IntFieldUpdateOperationsInput | number
    isrc?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    album?: AlbumUpdateOneRequiredWithoutTracksNestedInput
    artists?: TrackArtistUpdateManyWithoutTrackNestedInput
    playlistTracks?: PlaylistTrackUpdateManyWithoutTrackNestedInput
    likedUsers?: LikedTrackUpdateManyWithoutTrackNestedInput
    playbacks?: PlaybackHistoryUpdateManyWithoutTrackNestedInput
    genres?: TrackGenreUpdateManyWithoutTrackNestedInput
  }

  export type TrackUncheckedUpdateWithoutAudioResourcesInput = {
    id?: StringFieldUpdateOperationsInput | string
    albumId?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    duration?: IntFieldUpdateOperationsInput | number
    lyrics?: NullableStringFieldUpdateOperationsInput | string | null
    trackNumber?: IntFieldUpdateOperationsInput | number
    discNumber?: IntFieldUpdateOperationsInput | number
    isrc?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    artists?: TrackArtistUncheckedUpdateManyWithoutTrackNestedInput
    playlistTracks?: PlaylistTrackUncheckedUpdateManyWithoutTrackNestedInput
    likedUsers?: LikedTrackUncheckedUpdateManyWithoutTrackNestedInput
    playbacks?: PlaybackHistoryUncheckedUpdateManyWithoutTrackNestedInput
    genres?: TrackGenreUncheckedUpdateManyWithoutTrackNestedInput
  }

  export type TrackGenreCreateWithoutGenreInput = {
    track: TrackCreateNestedOneWithoutGenresInput
  }

  export type TrackGenreUncheckedCreateWithoutGenreInput = {
    trackId: string
  }

  export type TrackGenreCreateOrConnectWithoutGenreInput = {
    where: TrackGenreWhereUniqueInput
    create: XOR<TrackGenreCreateWithoutGenreInput, TrackGenreUncheckedCreateWithoutGenreInput>
  }

  export type TrackGenreCreateManyGenreInputEnvelope = {
    data: TrackGenreCreateManyGenreInput | TrackGenreCreateManyGenreInput[]
  }

  export type TrackGenreUpsertWithWhereUniqueWithoutGenreInput = {
    where: TrackGenreWhereUniqueInput
    update: XOR<TrackGenreUpdateWithoutGenreInput, TrackGenreUncheckedUpdateWithoutGenreInput>
    create: XOR<TrackGenreCreateWithoutGenreInput, TrackGenreUncheckedCreateWithoutGenreInput>
  }

  export type TrackGenreUpdateWithWhereUniqueWithoutGenreInput = {
    where: TrackGenreWhereUniqueInput
    data: XOR<TrackGenreUpdateWithoutGenreInput, TrackGenreUncheckedUpdateWithoutGenreInput>
  }

  export type TrackGenreUpdateManyWithWhereWithoutGenreInput = {
    where: TrackGenreScalarWhereInput
    data: XOR<TrackGenreUpdateManyMutationInput, TrackGenreUncheckedUpdateManyWithoutGenreInput>
  }

  export type TrackCreateWithoutGenresInput = {
    id?: string
    title: string
    duration: number
    lyrics?: string | null
    trackNumber: number
    discNumber?: number
    isrc?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    album: AlbumCreateNestedOneWithoutTracksInput
    artists?: TrackArtistCreateNestedManyWithoutTrackInput
    audioResources?: TrackAudioResourceCreateNestedManyWithoutTrackInput
    playlistTracks?: PlaylistTrackCreateNestedManyWithoutTrackInput
    likedUsers?: LikedTrackCreateNestedManyWithoutTrackInput
    playbacks?: PlaybackHistoryCreateNestedManyWithoutTrackInput
  }

  export type TrackUncheckedCreateWithoutGenresInput = {
    id?: string
    albumId: string
    title: string
    duration: number
    lyrics?: string | null
    trackNumber: number
    discNumber?: number
    isrc?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    artists?: TrackArtistUncheckedCreateNestedManyWithoutTrackInput
    audioResources?: TrackAudioResourceUncheckedCreateNestedManyWithoutTrackInput
    playlistTracks?: PlaylistTrackUncheckedCreateNestedManyWithoutTrackInput
    likedUsers?: LikedTrackUncheckedCreateNestedManyWithoutTrackInput
    playbacks?: PlaybackHistoryUncheckedCreateNestedManyWithoutTrackInput
  }

  export type TrackCreateOrConnectWithoutGenresInput = {
    where: TrackWhereUniqueInput
    create: XOR<TrackCreateWithoutGenresInput, TrackUncheckedCreateWithoutGenresInput>
  }

  export type GenreCreateWithoutTracksInput = {
    id?: string
    name: string
    createdAt?: Date | string
  }

  export type GenreUncheckedCreateWithoutTracksInput = {
    id?: string
    name: string
    createdAt?: Date | string
  }

  export type GenreCreateOrConnectWithoutTracksInput = {
    where: GenreWhereUniqueInput
    create: XOR<GenreCreateWithoutTracksInput, GenreUncheckedCreateWithoutTracksInput>
  }

  export type TrackUpsertWithoutGenresInput = {
    update: XOR<TrackUpdateWithoutGenresInput, TrackUncheckedUpdateWithoutGenresInput>
    create: XOR<TrackCreateWithoutGenresInput, TrackUncheckedCreateWithoutGenresInput>
    where?: TrackWhereInput
  }

  export type TrackUpdateToOneWithWhereWithoutGenresInput = {
    where?: TrackWhereInput
    data: XOR<TrackUpdateWithoutGenresInput, TrackUncheckedUpdateWithoutGenresInput>
  }

  export type TrackUpdateWithoutGenresInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    duration?: IntFieldUpdateOperationsInput | number
    lyrics?: NullableStringFieldUpdateOperationsInput | string | null
    trackNumber?: IntFieldUpdateOperationsInput | number
    discNumber?: IntFieldUpdateOperationsInput | number
    isrc?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    album?: AlbumUpdateOneRequiredWithoutTracksNestedInput
    artists?: TrackArtistUpdateManyWithoutTrackNestedInput
    audioResources?: TrackAudioResourceUpdateManyWithoutTrackNestedInput
    playlistTracks?: PlaylistTrackUpdateManyWithoutTrackNestedInput
    likedUsers?: LikedTrackUpdateManyWithoutTrackNestedInput
    playbacks?: PlaybackHistoryUpdateManyWithoutTrackNestedInput
  }

  export type TrackUncheckedUpdateWithoutGenresInput = {
    id?: StringFieldUpdateOperationsInput | string
    albumId?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    duration?: IntFieldUpdateOperationsInput | number
    lyrics?: NullableStringFieldUpdateOperationsInput | string | null
    trackNumber?: IntFieldUpdateOperationsInput | number
    discNumber?: IntFieldUpdateOperationsInput | number
    isrc?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    artists?: TrackArtistUncheckedUpdateManyWithoutTrackNestedInput
    audioResources?: TrackAudioResourceUncheckedUpdateManyWithoutTrackNestedInput
    playlistTracks?: PlaylistTrackUncheckedUpdateManyWithoutTrackNestedInput
    likedUsers?: LikedTrackUncheckedUpdateManyWithoutTrackNestedInput
    playbacks?: PlaybackHistoryUncheckedUpdateManyWithoutTrackNestedInput
  }

  export type GenreUpsertWithoutTracksInput = {
    update: XOR<GenreUpdateWithoutTracksInput, GenreUncheckedUpdateWithoutTracksInput>
    create: XOR<GenreCreateWithoutTracksInput, GenreUncheckedCreateWithoutTracksInput>
    where?: GenreWhereInput
  }

  export type GenreUpdateToOneWithWhereWithoutTracksInput = {
    where?: GenreWhereInput
    data: XOR<GenreUpdateWithoutTracksInput, GenreUncheckedUpdateWithoutTracksInput>
  }

  export type GenreUpdateWithoutTracksInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GenreUncheckedUpdateWithoutTracksInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserCreateWithoutOwnedPlaylistsInput = {
    id?: string
    email: string
    passwordHash: string
    displayName: string
    avatarUrl?: string | null
    country?: string
    product?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    followedPlaylists?: PlaylistFollowerCreateNestedManyWithoutUserInput
    likedTracks?: LikedTrackCreateNestedManyWithoutUserInput
    playbackHistories?: PlaybackHistoryCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutOwnedPlaylistsInput = {
    id?: string
    email: string
    passwordHash: string
    displayName: string
    avatarUrl?: string | null
    country?: string
    product?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    followedPlaylists?: PlaylistFollowerUncheckedCreateNestedManyWithoutUserInput
    likedTracks?: LikedTrackUncheckedCreateNestedManyWithoutUserInput
    playbackHistories?: PlaybackHistoryUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutOwnedPlaylistsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutOwnedPlaylistsInput, UserUncheckedCreateWithoutOwnedPlaylistsInput>
  }

  export type PlaylistTrackCreateWithoutPlaylistInput = {
    sortOrder?: number
    addedAt?: Date | string
    track: TrackCreateNestedOneWithoutPlaylistTracksInput
  }

  export type PlaylistTrackUncheckedCreateWithoutPlaylistInput = {
    trackId: string
    sortOrder?: number
    addedAt?: Date | string
  }

  export type PlaylistTrackCreateOrConnectWithoutPlaylistInput = {
    where: PlaylistTrackWhereUniqueInput
    create: XOR<PlaylistTrackCreateWithoutPlaylistInput, PlaylistTrackUncheckedCreateWithoutPlaylistInput>
  }

  export type PlaylistTrackCreateManyPlaylistInputEnvelope = {
    data: PlaylistTrackCreateManyPlaylistInput | PlaylistTrackCreateManyPlaylistInput[]
  }

  export type PlaylistFollowerCreateWithoutPlaylistInput = {
    followedAt?: Date | string
    user: UserCreateNestedOneWithoutFollowedPlaylistsInput
  }

  export type PlaylistFollowerUncheckedCreateWithoutPlaylistInput = {
    userId: string
    followedAt?: Date | string
  }

  export type PlaylistFollowerCreateOrConnectWithoutPlaylistInput = {
    where: PlaylistFollowerWhereUniqueInput
    create: XOR<PlaylistFollowerCreateWithoutPlaylistInput, PlaylistFollowerUncheckedCreateWithoutPlaylistInput>
  }

  export type PlaylistFollowerCreateManyPlaylistInputEnvelope = {
    data: PlaylistFollowerCreateManyPlaylistInput | PlaylistFollowerCreateManyPlaylistInput[]
  }

  export type UserUpsertWithoutOwnedPlaylistsInput = {
    update: XOR<UserUpdateWithoutOwnedPlaylistsInput, UserUncheckedUpdateWithoutOwnedPlaylistsInput>
    create: XOR<UserCreateWithoutOwnedPlaylistsInput, UserUncheckedCreateWithoutOwnedPlaylistsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutOwnedPlaylistsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutOwnedPlaylistsInput, UserUncheckedUpdateWithoutOwnedPlaylistsInput>
  }

  export type UserUpdateWithoutOwnedPlaylistsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    country?: StringFieldUpdateOperationsInput | string
    product?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    followedPlaylists?: PlaylistFollowerUpdateManyWithoutUserNestedInput
    likedTracks?: LikedTrackUpdateManyWithoutUserNestedInput
    playbackHistories?: PlaybackHistoryUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutOwnedPlaylistsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    country?: StringFieldUpdateOperationsInput | string
    product?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    followedPlaylists?: PlaylistFollowerUncheckedUpdateManyWithoutUserNestedInput
    likedTracks?: LikedTrackUncheckedUpdateManyWithoutUserNestedInput
    playbackHistories?: PlaybackHistoryUncheckedUpdateManyWithoutUserNestedInput
  }

  export type PlaylistTrackUpsertWithWhereUniqueWithoutPlaylistInput = {
    where: PlaylistTrackWhereUniqueInput
    update: XOR<PlaylistTrackUpdateWithoutPlaylistInput, PlaylistTrackUncheckedUpdateWithoutPlaylistInput>
    create: XOR<PlaylistTrackCreateWithoutPlaylistInput, PlaylistTrackUncheckedCreateWithoutPlaylistInput>
  }

  export type PlaylistTrackUpdateWithWhereUniqueWithoutPlaylistInput = {
    where: PlaylistTrackWhereUniqueInput
    data: XOR<PlaylistTrackUpdateWithoutPlaylistInput, PlaylistTrackUncheckedUpdateWithoutPlaylistInput>
  }

  export type PlaylistTrackUpdateManyWithWhereWithoutPlaylistInput = {
    where: PlaylistTrackScalarWhereInput
    data: XOR<PlaylistTrackUpdateManyMutationInput, PlaylistTrackUncheckedUpdateManyWithoutPlaylistInput>
  }

  export type PlaylistFollowerUpsertWithWhereUniqueWithoutPlaylistInput = {
    where: PlaylistFollowerWhereUniqueInput
    update: XOR<PlaylistFollowerUpdateWithoutPlaylistInput, PlaylistFollowerUncheckedUpdateWithoutPlaylistInput>
    create: XOR<PlaylistFollowerCreateWithoutPlaylistInput, PlaylistFollowerUncheckedCreateWithoutPlaylistInput>
  }

  export type PlaylistFollowerUpdateWithWhereUniqueWithoutPlaylistInput = {
    where: PlaylistFollowerWhereUniqueInput
    data: XOR<PlaylistFollowerUpdateWithoutPlaylistInput, PlaylistFollowerUncheckedUpdateWithoutPlaylistInput>
  }

  export type PlaylistFollowerUpdateManyWithWhereWithoutPlaylistInput = {
    where: PlaylistFollowerScalarWhereInput
    data: XOR<PlaylistFollowerUpdateManyMutationInput, PlaylistFollowerUncheckedUpdateManyWithoutPlaylistInput>
  }

  export type PlaylistCreateWithoutTracksInput = {
    id?: string
    name: string
    description?: string | null
    coverUrl?: string | null
    isPublic?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    owner: UserCreateNestedOneWithoutOwnedPlaylistsInput
    followers?: PlaylistFollowerCreateNestedManyWithoutPlaylistInput
  }

  export type PlaylistUncheckedCreateWithoutTracksInput = {
    id?: string
    ownerId: string
    name: string
    description?: string | null
    coverUrl?: string | null
    isPublic?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    followers?: PlaylistFollowerUncheckedCreateNestedManyWithoutPlaylistInput
  }

  export type PlaylistCreateOrConnectWithoutTracksInput = {
    where: PlaylistWhereUniqueInput
    create: XOR<PlaylistCreateWithoutTracksInput, PlaylistUncheckedCreateWithoutTracksInput>
  }

  export type TrackCreateWithoutPlaylistTracksInput = {
    id?: string
    title: string
    duration: number
    lyrics?: string | null
    trackNumber: number
    discNumber?: number
    isrc?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    album: AlbumCreateNestedOneWithoutTracksInput
    artists?: TrackArtistCreateNestedManyWithoutTrackInput
    audioResources?: TrackAudioResourceCreateNestedManyWithoutTrackInput
    likedUsers?: LikedTrackCreateNestedManyWithoutTrackInput
    playbacks?: PlaybackHistoryCreateNestedManyWithoutTrackInput
    genres?: TrackGenreCreateNestedManyWithoutTrackInput
  }

  export type TrackUncheckedCreateWithoutPlaylistTracksInput = {
    id?: string
    albumId: string
    title: string
    duration: number
    lyrics?: string | null
    trackNumber: number
    discNumber?: number
    isrc?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    artists?: TrackArtistUncheckedCreateNestedManyWithoutTrackInput
    audioResources?: TrackAudioResourceUncheckedCreateNestedManyWithoutTrackInput
    likedUsers?: LikedTrackUncheckedCreateNestedManyWithoutTrackInput
    playbacks?: PlaybackHistoryUncheckedCreateNestedManyWithoutTrackInput
    genres?: TrackGenreUncheckedCreateNestedManyWithoutTrackInput
  }

  export type TrackCreateOrConnectWithoutPlaylistTracksInput = {
    where: TrackWhereUniqueInput
    create: XOR<TrackCreateWithoutPlaylistTracksInput, TrackUncheckedCreateWithoutPlaylistTracksInput>
  }

  export type PlaylistUpsertWithoutTracksInput = {
    update: XOR<PlaylistUpdateWithoutTracksInput, PlaylistUncheckedUpdateWithoutTracksInput>
    create: XOR<PlaylistCreateWithoutTracksInput, PlaylistUncheckedCreateWithoutTracksInput>
    where?: PlaylistWhereInput
  }

  export type PlaylistUpdateToOneWithWhereWithoutTracksInput = {
    where?: PlaylistWhereInput
    data: XOR<PlaylistUpdateWithoutTracksInput, PlaylistUncheckedUpdateWithoutTracksInput>
  }

  export type PlaylistUpdateWithoutTracksInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    coverUrl?: NullableStringFieldUpdateOperationsInput | string | null
    isPublic?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    owner?: UserUpdateOneRequiredWithoutOwnedPlaylistsNestedInput
    followers?: PlaylistFollowerUpdateManyWithoutPlaylistNestedInput
  }

  export type PlaylistUncheckedUpdateWithoutTracksInput = {
    id?: StringFieldUpdateOperationsInput | string
    ownerId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    coverUrl?: NullableStringFieldUpdateOperationsInput | string | null
    isPublic?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    followers?: PlaylistFollowerUncheckedUpdateManyWithoutPlaylistNestedInput
  }

  export type TrackUpsertWithoutPlaylistTracksInput = {
    update: XOR<TrackUpdateWithoutPlaylistTracksInput, TrackUncheckedUpdateWithoutPlaylistTracksInput>
    create: XOR<TrackCreateWithoutPlaylistTracksInput, TrackUncheckedCreateWithoutPlaylistTracksInput>
    where?: TrackWhereInput
  }

  export type TrackUpdateToOneWithWhereWithoutPlaylistTracksInput = {
    where?: TrackWhereInput
    data: XOR<TrackUpdateWithoutPlaylistTracksInput, TrackUncheckedUpdateWithoutPlaylistTracksInput>
  }

  export type TrackUpdateWithoutPlaylistTracksInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    duration?: IntFieldUpdateOperationsInput | number
    lyrics?: NullableStringFieldUpdateOperationsInput | string | null
    trackNumber?: IntFieldUpdateOperationsInput | number
    discNumber?: IntFieldUpdateOperationsInput | number
    isrc?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    album?: AlbumUpdateOneRequiredWithoutTracksNestedInput
    artists?: TrackArtistUpdateManyWithoutTrackNestedInput
    audioResources?: TrackAudioResourceUpdateManyWithoutTrackNestedInput
    likedUsers?: LikedTrackUpdateManyWithoutTrackNestedInput
    playbacks?: PlaybackHistoryUpdateManyWithoutTrackNestedInput
    genres?: TrackGenreUpdateManyWithoutTrackNestedInput
  }

  export type TrackUncheckedUpdateWithoutPlaylistTracksInput = {
    id?: StringFieldUpdateOperationsInput | string
    albumId?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    duration?: IntFieldUpdateOperationsInput | number
    lyrics?: NullableStringFieldUpdateOperationsInput | string | null
    trackNumber?: IntFieldUpdateOperationsInput | number
    discNumber?: IntFieldUpdateOperationsInput | number
    isrc?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    artists?: TrackArtistUncheckedUpdateManyWithoutTrackNestedInput
    audioResources?: TrackAudioResourceUncheckedUpdateManyWithoutTrackNestedInput
    likedUsers?: LikedTrackUncheckedUpdateManyWithoutTrackNestedInput
    playbacks?: PlaybackHistoryUncheckedUpdateManyWithoutTrackNestedInput
    genres?: TrackGenreUncheckedUpdateManyWithoutTrackNestedInput
  }

  export type PlaylistCreateWithoutFollowersInput = {
    id?: string
    name: string
    description?: string | null
    coverUrl?: string | null
    isPublic?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    owner: UserCreateNestedOneWithoutOwnedPlaylistsInput
    tracks?: PlaylistTrackCreateNestedManyWithoutPlaylistInput
  }

  export type PlaylistUncheckedCreateWithoutFollowersInput = {
    id?: string
    ownerId: string
    name: string
    description?: string | null
    coverUrl?: string | null
    isPublic?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    tracks?: PlaylistTrackUncheckedCreateNestedManyWithoutPlaylistInput
  }

  export type PlaylistCreateOrConnectWithoutFollowersInput = {
    where: PlaylistWhereUniqueInput
    create: XOR<PlaylistCreateWithoutFollowersInput, PlaylistUncheckedCreateWithoutFollowersInput>
  }

  export type UserCreateWithoutFollowedPlaylistsInput = {
    id?: string
    email: string
    passwordHash: string
    displayName: string
    avatarUrl?: string | null
    country?: string
    product?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    ownedPlaylists?: PlaylistCreateNestedManyWithoutOwnerInput
    likedTracks?: LikedTrackCreateNestedManyWithoutUserInput
    playbackHistories?: PlaybackHistoryCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutFollowedPlaylistsInput = {
    id?: string
    email: string
    passwordHash: string
    displayName: string
    avatarUrl?: string | null
    country?: string
    product?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    ownedPlaylists?: PlaylistUncheckedCreateNestedManyWithoutOwnerInput
    likedTracks?: LikedTrackUncheckedCreateNestedManyWithoutUserInput
    playbackHistories?: PlaybackHistoryUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutFollowedPlaylistsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutFollowedPlaylistsInput, UserUncheckedCreateWithoutFollowedPlaylistsInput>
  }

  export type PlaylistUpsertWithoutFollowersInput = {
    update: XOR<PlaylistUpdateWithoutFollowersInput, PlaylistUncheckedUpdateWithoutFollowersInput>
    create: XOR<PlaylistCreateWithoutFollowersInput, PlaylistUncheckedCreateWithoutFollowersInput>
    where?: PlaylistWhereInput
  }

  export type PlaylistUpdateToOneWithWhereWithoutFollowersInput = {
    where?: PlaylistWhereInput
    data: XOR<PlaylistUpdateWithoutFollowersInput, PlaylistUncheckedUpdateWithoutFollowersInput>
  }

  export type PlaylistUpdateWithoutFollowersInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    coverUrl?: NullableStringFieldUpdateOperationsInput | string | null
    isPublic?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    owner?: UserUpdateOneRequiredWithoutOwnedPlaylistsNestedInput
    tracks?: PlaylistTrackUpdateManyWithoutPlaylistNestedInput
  }

  export type PlaylistUncheckedUpdateWithoutFollowersInput = {
    id?: StringFieldUpdateOperationsInput | string
    ownerId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    coverUrl?: NullableStringFieldUpdateOperationsInput | string | null
    isPublic?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tracks?: PlaylistTrackUncheckedUpdateManyWithoutPlaylistNestedInput
  }

  export type UserUpsertWithoutFollowedPlaylistsInput = {
    update: XOR<UserUpdateWithoutFollowedPlaylistsInput, UserUncheckedUpdateWithoutFollowedPlaylistsInput>
    create: XOR<UserCreateWithoutFollowedPlaylistsInput, UserUncheckedCreateWithoutFollowedPlaylistsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutFollowedPlaylistsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutFollowedPlaylistsInput, UserUncheckedUpdateWithoutFollowedPlaylistsInput>
  }

  export type UserUpdateWithoutFollowedPlaylistsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    country?: StringFieldUpdateOperationsInput | string
    product?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    ownedPlaylists?: PlaylistUpdateManyWithoutOwnerNestedInput
    likedTracks?: LikedTrackUpdateManyWithoutUserNestedInput
    playbackHistories?: PlaybackHistoryUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutFollowedPlaylistsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    country?: StringFieldUpdateOperationsInput | string
    product?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    ownedPlaylists?: PlaylistUncheckedUpdateManyWithoutOwnerNestedInput
    likedTracks?: LikedTrackUncheckedUpdateManyWithoutUserNestedInput
    playbackHistories?: PlaybackHistoryUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateWithoutLikedTracksInput = {
    id?: string
    email: string
    passwordHash: string
    displayName: string
    avatarUrl?: string | null
    country?: string
    product?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    ownedPlaylists?: PlaylistCreateNestedManyWithoutOwnerInput
    followedPlaylists?: PlaylistFollowerCreateNestedManyWithoutUserInput
    playbackHistories?: PlaybackHistoryCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutLikedTracksInput = {
    id?: string
    email: string
    passwordHash: string
    displayName: string
    avatarUrl?: string | null
    country?: string
    product?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    ownedPlaylists?: PlaylistUncheckedCreateNestedManyWithoutOwnerInput
    followedPlaylists?: PlaylistFollowerUncheckedCreateNestedManyWithoutUserInput
    playbackHistories?: PlaybackHistoryUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutLikedTracksInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutLikedTracksInput, UserUncheckedCreateWithoutLikedTracksInput>
  }

  export type TrackCreateWithoutLikedUsersInput = {
    id?: string
    title: string
    duration: number
    lyrics?: string | null
    trackNumber: number
    discNumber?: number
    isrc?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    album: AlbumCreateNestedOneWithoutTracksInput
    artists?: TrackArtistCreateNestedManyWithoutTrackInput
    audioResources?: TrackAudioResourceCreateNestedManyWithoutTrackInput
    playlistTracks?: PlaylistTrackCreateNestedManyWithoutTrackInput
    playbacks?: PlaybackHistoryCreateNestedManyWithoutTrackInput
    genres?: TrackGenreCreateNestedManyWithoutTrackInput
  }

  export type TrackUncheckedCreateWithoutLikedUsersInput = {
    id?: string
    albumId: string
    title: string
    duration: number
    lyrics?: string | null
    trackNumber: number
    discNumber?: number
    isrc?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    artists?: TrackArtistUncheckedCreateNestedManyWithoutTrackInput
    audioResources?: TrackAudioResourceUncheckedCreateNestedManyWithoutTrackInput
    playlistTracks?: PlaylistTrackUncheckedCreateNestedManyWithoutTrackInput
    playbacks?: PlaybackHistoryUncheckedCreateNestedManyWithoutTrackInput
    genres?: TrackGenreUncheckedCreateNestedManyWithoutTrackInput
  }

  export type TrackCreateOrConnectWithoutLikedUsersInput = {
    where: TrackWhereUniqueInput
    create: XOR<TrackCreateWithoutLikedUsersInput, TrackUncheckedCreateWithoutLikedUsersInput>
  }

  export type UserUpsertWithoutLikedTracksInput = {
    update: XOR<UserUpdateWithoutLikedTracksInput, UserUncheckedUpdateWithoutLikedTracksInput>
    create: XOR<UserCreateWithoutLikedTracksInput, UserUncheckedCreateWithoutLikedTracksInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutLikedTracksInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutLikedTracksInput, UserUncheckedUpdateWithoutLikedTracksInput>
  }

  export type UserUpdateWithoutLikedTracksInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    country?: StringFieldUpdateOperationsInput | string
    product?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    ownedPlaylists?: PlaylistUpdateManyWithoutOwnerNestedInput
    followedPlaylists?: PlaylistFollowerUpdateManyWithoutUserNestedInput
    playbackHistories?: PlaybackHistoryUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutLikedTracksInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    country?: StringFieldUpdateOperationsInput | string
    product?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    ownedPlaylists?: PlaylistUncheckedUpdateManyWithoutOwnerNestedInput
    followedPlaylists?: PlaylistFollowerUncheckedUpdateManyWithoutUserNestedInput
    playbackHistories?: PlaybackHistoryUncheckedUpdateManyWithoutUserNestedInput
  }

  export type TrackUpsertWithoutLikedUsersInput = {
    update: XOR<TrackUpdateWithoutLikedUsersInput, TrackUncheckedUpdateWithoutLikedUsersInput>
    create: XOR<TrackCreateWithoutLikedUsersInput, TrackUncheckedCreateWithoutLikedUsersInput>
    where?: TrackWhereInput
  }

  export type TrackUpdateToOneWithWhereWithoutLikedUsersInput = {
    where?: TrackWhereInput
    data: XOR<TrackUpdateWithoutLikedUsersInput, TrackUncheckedUpdateWithoutLikedUsersInput>
  }

  export type TrackUpdateWithoutLikedUsersInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    duration?: IntFieldUpdateOperationsInput | number
    lyrics?: NullableStringFieldUpdateOperationsInput | string | null
    trackNumber?: IntFieldUpdateOperationsInput | number
    discNumber?: IntFieldUpdateOperationsInput | number
    isrc?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    album?: AlbumUpdateOneRequiredWithoutTracksNestedInput
    artists?: TrackArtistUpdateManyWithoutTrackNestedInput
    audioResources?: TrackAudioResourceUpdateManyWithoutTrackNestedInput
    playlistTracks?: PlaylistTrackUpdateManyWithoutTrackNestedInput
    playbacks?: PlaybackHistoryUpdateManyWithoutTrackNestedInput
    genres?: TrackGenreUpdateManyWithoutTrackNestedInput
  }

  export type TrackUncheckedUpdateWithoutLikedUsersInput = {
    id?: StringFieldUpdateOperationsInput | string
    albumId?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    duration?: IntFieldUpdateOperationsInput | number
    lyrics?: NullableStringFieldUpdateOperationsInput | string | null
    trackNumber?: IntFieldUpdateOperationsInput | number
    discNumber?: IntFieldUpdateOperationsInput | number
    isrc?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    artists?: TrackArtistUncheckedUpdateManyWithoutTrackNestedInput
    audioResources?: TrackAudioResourceUncheckedUpdateManyWithoutTrackNestedInput
    playlistTracks?: PlaylistTrackUncheckedUpdateManyWithoutTrackNestedInput
    playbacks?: PlaybackHistoryUncheckedUpdateManyWithoutTrackNestedInput
    genres?: TrackGenreUncheckedUpdateManyWithoutTrackNestedInput
  }

  export type UserCreateWithoutPlaybackHistoriesInput = {
    id?: string
    email: string
    passwordHash: string
    displayName: string
    avatarUrl?: string | null
    country?: string
    product?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    ownedPlaylists?: PlaylistCreateNestedManyWithoutOwnerInput
    followedPlaylists?: PlaylistFollowerCreateNestedManyWithoutUserInput
    likedTracks?: LikedTrackCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutPlaybackHistoriesInput = {
    id?: string
    email: string
    passwordHash: string
    displayName: string
    avatarUrl?: string | null
    country?: string
    product?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    ownedPlaylists?: PlaylistUncheckedCreateNestedManyWithoutOwnerInput
    followedPlaylists?: PlaylistFollowerUncheckedCreateNestedManyWithoutUserInput
    likedTracks?: LikedTrackUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutPlaybackHistoriesInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutPlaybackHistoriesInput, UserUncheckedCreateWithoutPlaybackHistoriesInput>
  }

  export type TrackCreateWithoutPlaybacksInput = {
    id?: string
    title: string
    duration: number
    lyrics?: string | null
    trackNumber: number
    discNumber?: number
    isrc?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    album: AlbumCreateNestedOneWithoutTracksInput
    artists?: TrackArtistCreateNestedManyWithoutTrackInput
    audioResources?: TrackAudioResourceCreateNestedManyWithoutTrackInput
    playlistTracks?: PlaylistTrackCreateNestedManyWithoutTrackInput
    likedUsers?: LikedTrackCreateNestedManyWithoutTrackInput
    genres?: TrackGenreCreateNestedManyWithoutTrackInput
  }

  export type TrackUncheckedCreateWithoutPlaybacksInput = {
    id?: string
    albumId: string
    title: string
    duration: number
    lyrics?: string | null
    trackNumber: number
    discNumber?: number
    isrc?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    artists?: TrackArtistUncheckedCreateNestedManyWithoutTrackInput
    audioResources?: TrackAudioResourceUncheckedCreateNestedManyWithoutTrackInput
    playlistTracks?: PlaylistTrackUncheckedCreateNestedManyWithoutTrackInput
    likedUsers?: LikedTrackUncheckedCreateNestedManyWithoutTrackInput
    genres?: TrackGenreUncheckedCreateNestedManyWithoutTrackInput
  }

  export type TrackCreateOrConnectWithoutPlaybacksInput = {
    where: TrackWhereUniqueInput
    create: XOR<TrackCreateWithoutPlaybacksInput, TrackUncheckedCreateWithoutPlaybacksInput>
  }

  export type UserUpsertWithoutPlaybackHistoriesInput = {
    update: XOR<UserUpdateWithoutPlaybackHistoriesInput, UserUncheckedUpdateWithoutPlaybackHistoriesInput>
    create: XOR<UserCreateWithoutPlaybackHistoriesInput, UserUncheckedCreateWithoutPlaybackHistoriesInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutPlaybackHistoriesInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutPlaybackHistoriesInput, UserUncheckedUpdateWithoutPlaybackHistoriesInput>
  }

  export type UserUpdateWithoutPlaybackHistoriesInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    country?: StringFieldUpdateOperationsInput | string
    product?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    ownedPlaylists?: PlaylistUpdateManyWithoutOwnerNestedInput
    followedPlaylists?: PlaylistFollowerUpdateManyWithoutUserNestedInput
    likedTracks?: LikedTrackUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutPlaybackHistoriesInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    country?: StringFieldUpdateOperationsInput | string
    product?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    ownedPlaylists?: PlaylistUncheckedUpdateManyWithoutOwnerNestedInput
    followedPlaylists?: PlaylistFollowerUncheckedUpdateManyWithoutUserNestedInput
    likedTracks?: LikedTrackUncheckedUpdateManyWithoutUserNestedInput
  }

  export type TrackUpsertWithoutPlaybacksInput = {
    update: XOR<TrackUpdateWithoutPlaybacksInput, TrackUncheckedUpdateWithoutPlaybacksInput>
    create: XOR<TrackCreateWithoutPlaybacksInput, TrackUncheckedCreateWithoutPlaybacksInput>
    where?: TrackWhereInput
  }

  export type TrackUpdateToOneWithWhereWithoutPlaybacksInput = {
    where?: TrackWhereInput
    data: XOR<TrackUpdateWithoutPlaybacksInput, TrackUncheckedUpdateWithoutPlaybacksInput>
  }

  export type TrackUpdateWithoutPlaybacksInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    duration?: IntFieldUpdateOperationsInput | number
    lyrics?: NullableStringFieldUpdateOperationsInput | string | null
    trackNumber?: IntFieldUpdateOperationsInput | number
    discNumber?: IntFieldUpdateOperationsInput | number
    isrc?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    album?: AlbumUpdateOneRequiredWithoutTracksNestedInput
    artists?: TrackArtistUpdateManyWithoutTrackNestedInput
    audioResources?: TrackAudioResourceUpdateManyWithoutTrackNestedInput
    playlistTracks?: PlaylistTrackUpdateManyWithoutTrackNestedInput
    likedUsers?: LikedTrackUpdateManyWithoutTrackNestedInput
    genres?: TrackGenreUpdateManyWithoutTrackNestedInput
  }

  export type TrackUncheckedUpdateWithoutPlaybacksInput = {
    id?: StringFieldUpdateOperationsInput | string
    albumId?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    duration?: IntFieldUpdateOperationsInput | number
    lyrics?: NullableStringFieldUpdateOperationsInput | string | null
    trackNumber?: IntFieldUpdateOperationsInput | number
    discNumber?: IntFieldUpdateOperationsInput | number
    isrc?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    artists?: TrackArtistUncheckedUpdateManyWithoutTrackNestedInput
    audioResources?: TrackAudioResourceUncheckedUpdateManyWithoutTrackNestedInput
    playlistTracks?: PlaylistTrackUncheckedUpdateManyWithoutTrackNestedInput
    likedUsers?: LikedTrackUncheckedUpdateManyWithoutTrackNestedInput
    genres?: TrackGenreUncheckedUpdateManyWithoutTrackNestedInput
  }

  export type PlaylistCreateManyOwnerInput = {
    id?: string
    name: string
    description?: string | null
    coverUrl?: string | null
    isPublic?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PlaylistFollowerCreateManyUserInput = {
    playlistId: string
    followedAt?: Date | string
  }

  export type LikedTrackCreateManyUserInput = {
    trackId: string
    likedAt?: Date | string
  }

  export type PlaybackHistoryCreateManyUserInput = {
    id?: string
    trackId: string
    playedAt?: Date | string
    contextType?: string | null
    contextId?: string | null
  }

  export type PlaylistUpdateWithoutOwnerInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    coverUrl?: NullableStringFieldUpdateOperationsInput | string | null
    isPublic?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tracks?: PlaylistTrackUpdateManyWithoutPlaylistNestedInput
    followers?: PlaylistFollowerUpdateManyWithoutPlaylistNestedInput
  }

  export type PlaylistUncheckedUpdateWithoutOwnerInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    coverUrl?: NullableStringFieldUpdateOperationsInput | string | null
    isPublic?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tracks?: PlaylistTrackUncheckedUpdateManyWithoutPlaylistNestedInput
    followers?: PlaylistFollowerUncheckedUpdateManyWithoutPlaylistNestedInput
  }

  export type PlaylistUncheckedUpdateManyWithoutOwnerInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    coverUrl?: NullableStringFieldUpdateOperationsInput | string | null
    isPublic?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PlaylistFollowerUpdateWithoutUserInput = {
    followedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    playlist?: PlaylistUpdateOneRequiredWithoutFollowersNestedInput
  }

  export type PlaylistFollowerUncheckedUpdateWithoutUserInput = {
    playlistId?: StringFieldUpdateOperationsInput | string
    followedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PlaylistFollowerUncheckedUpdateManyWithoutUserInput = {
    playlistId?: StringFieldUpdateOperationsInput | string
    followedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LikedTrackUpdateWithoutUserInput = {
    likedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    track?: TrackUpdateOneRequiredWithoutLikedUsersNestedInput
  }

  export type LikedTrackUncheckedUpdateWithoutUserInput = {
    trackId?: StringFieldUpdateOperationsInput | string
    likedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LikedTrackUncheckedUpdateManyWithoutUserInput = {
    trackId?: StringFieldUpdateOperationsInput | string
    likedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PlaybackHistoryUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    playedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    contextType?: NullableStringFieldUpdateOperationsInput | string | null
    contextId?: NullableStringFieldUpdateOperationsInput | string | null
    track?: TrackUpdateOneRequiredWithoutPlaybacksNestedInput
  }

  export type PlaybackHistoryUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    trackId?: StringFieldUpdateOperationsInput | string
    playedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    contextType?: NullableStringFieldUpdateOperationsInput | string | null
    contextId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type PlaybackHistoryUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    trackId?: StringFieldUpdateOperationsInput | string
    playedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    contextType?: NullableStringFieldUpdateOperationsInput | string | null
    contextId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type TrackArtistCreateManyArtistInput = {
    trackId: string
    role?: string
  }

  export type AlbumArtistCreateManyArtistInput = {
    albumId: string
  }

  export type TrackArtistUpdateWithoutArtistInput = {
    role?: StringFieldUpdateOperationsInput | string
    track?: TrackUpdateOneRequiredWithoutArtistsNestedInput
  }

  export type TrackArtistUncheckedUpdateWithoutArtistInput = {
    trackId?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
  }

  export type TrackArtistUncheckedUpdateManyWithoutArtistInput = {
    trackId?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
  }

  export type AlbumArtistUpdateWithoutArtistInput = {
    album?: AlbumUpdateOneRequiredWithoutArtistsNestedInput
  }

  export type AlbumArtistUncheckedUpdateWithoutArtistInput = {
    albumId?: StringFieldUpdateOperationsInput | string
  }

  export type AlbumArtistUncheckedUpdateManyWithoutArtistInput = {
    albumId?: StringFieldUpdateOperationsInput | string
  }

  export type TrackCreateManyAlbumInput = {
    id?: string
    title: string
    duration: number
    lyrics?: string | null
    trackNumber: number
    discNumber?: number
    isrc?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AlbumArtistCreateManyAlbumInput = {
    artistId: string
  }

  export type TrackUpdateWithoutAlbumInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    duration?: IntFieldUpdateOperationsInput | number
    lyrics?: NullableStringFieldUpdateOperationsInput | string | null
    trackNumber?: IntFieldUpdateOperationsInput | number
    discNumber?: IntFieldUpdateOperationsInput | number
    isrc?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    artists?: TrackArtistUpdateManyWithoutTrackNestedInput
    audioResources?: TrackAudioResourceUpdateManyWithoutTrackNestedInput
    playlistTracks?: PlaylistTrackUpdateManyWithoutTrackNestedInput
    likedUsers?: LikedTrackUpdateManyWithoutTrackNestedInput
    playbacks?: PlaybackHistoryUpdateManyWithoutTrackNestedInput
    genres?: TrackGenreUpdateManyWithoutTrackNestedInput
  }

  export type TrackUncheckedUpdateWithoutAlbumInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    duration?: IntFieldUpdateOperationsInput | number
    lyrics?: NullableStringFieldUpdateOperationsInput | string | null
    trackNumber?: IntFieldUpdateOperationsInput | number
    discNumber?: IntFieldUpdateOperationsInput | number
    isrc?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    artists?: TrackArtistUncheckedUpdateManyWithoutTrackNestedInput
    audioResources?: TrackAudioResourceUncheckedUpdateManyWithoutTrackNestedInput
    playlistTracks?: PlaylistTrackUncheckedUpdateManyWithoutTrackNestedInput
    likedUsers?: LikedTrackUncheckedUpdateManyWithoutTrackNestedInput
    playbacks?: PlaybackHistoryUncheckedUpdateManyWithoutTrackNestedInput
    genres?: TrackGenreUncheckedUpdateManyWithoutTrackNestedInput
  }

  export type TrackUncheckedUpdateManyWithoutAlbumInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    duration?: IntFieldUpdateOperationsInput | number
    lyrics?: NullableStringFieldUpdateOperationsInput | string | null
    trackNumber?: IntFieldUpdateOperationsInput | number
    discNumber?: IntFieldUpdateOperationsInput | number
    isrc?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AlbumArtistUpdateWithoutAlbumInput = {
    artist?: ArtistUpdateOneRequiredWithoutAlbumsNestedInput
  }

  export type AlbumArtistUncheckedUpdateWithoutAlbumInput = {
    artistId?: StringFieldUpdateOperationsInput | string
  }

  export type AlbumArtistUncheckedUpdateManyWithoutAlbumInput = {
    artistId?: StringFieldUpdateOperationsInput | string
  }

  export type TrackArtistCreateManyTrackInput = {
    artistId: string
    role?: string
  }

  export type TrackAudioResourceCreateManyTrackInput = {
    id?: string
    quality: string
    format: string
    bitrate: number
    streamUrl: string
    size: number
    isPremiumOnly?: boolean
    createdAt?: Date | string
  }

  export type PlaylistTrackCreateManyTrackInput = {
    playlistId: string
    sortOrder?: number
    addedAt?: Date | string
  }

  export type LikedTrackCreateManyTrackInput = {
    userId: string
    likedAt?: Date | string
  }

  export type PlaybackHistoryCreateManyTrackInput = {
    id?: string
    userId: string
    playedAt?: Date | string
    contextType?: string | null
    contextId?: string | null
  }

  export type TrackGenreCreateManyTrackInput = {
    genreId: string
  }

  export type TrackArtistUpdateWithoutTrackInput = {
    role?: StringFieldUpdateOperationsInput | string
    artist?: ArtistUpdateOneRequiredWithoutTracksNestedInput
  }

  export type TrackArtistUncheckedUpdateWithoutTrackInput = {
    artistId?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
  }

  export type TrackArtistUncheckedUpdateManyWithoutTrackInput = {
    artistId?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
  }

  export type TrackAudioResourceUpdateWithoutTrackInput = {
    id?: StringFieldUpdateOperationsInput | string
    quality?: StringFieldUpdateOperationsInput | string
    format?: StringFieldUpdateOperationsInput | string
    bitrate?: IntFieldUpdateOperationsInput | number
    streamUrl?: StringFieldUpdateOperationsInput | string
    size?: IntFieldUpdateOperationsInput | number
    isPremiumOnly?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TrackAudioResourceUncheckedUpdateWithoutTrackInput = {
    id?: StringFieldUpdateOperationsInput | string
    quality?: StringFieldUpdateOperationsInput | string
    format?: StringFieldUpdateOperationsInput | string
    bitrate?: IntFieldUpdateOperationsInput | number
    streamUrl?: StringFieldUpdateOperationsInput | string
    size?: IntFieldUpdateOperationsInput | number
    isPremiumOnly?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TrackAudioResourceUncheckedUpdateManyWithoutTrackInput = {
    id?: StringFieldUpdateOperationsInput | string
    quality?: StringFieldUpdateOperationsInput | string
    format?: StringFieldUpdateOperationsInput | string
    bitrate?: IntFieldUpdateOperationsInput | number
    streamUrl?: StringFieldUpdateOperationsInput | string
    size?: IntFieldUpdateOperationsInput | number
    isPremiumOnly?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PlaylistTrackUpdateWithoutTrackInput = {
    sortOrder?: IntFieldUpdateOperationsInput | number
    addedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    playlist?: PlaylistUpdateOneRequiredWithoutTracksNestedInput
  }

  export type PlaylistTrackUncheckedUpdateWithoutTrackInput = {
    playlistId?: StringFieldUpdateOperationsInput | string
    sortOrder?: IntFieldUpdateOperationsInput | number
    addedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PlaylistTrackUncheckedUpdateManyWithoutTrackInput = {
    playlistId?: StringFieldUpdateOperationsInput | string
    sortOrder?: IntFieldUpdateOperationsInput | number
    addedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LikedTrackUpdateWithoutTrackInput = {
    likedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutLikedTracksNestedInput
  }

  export type LikedTrackUncheckedUpdateWithoutTrackInput = {
    userId?: StringFieldUpdateOperationsInput | string
    likedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LikedTrackUncheckedUpdateManyWithoutTrackInput = {
    userId?: StringFieldUpdateOperationsInput | string
    likedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PlaybackHistoryUpdateWithoutTrackInput = {
    id?: StringFieldUpdateOperationsInput | string
    playedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    contextType?: NullableStringFieldUpdateOperationsInput | string | null
    contextId?: NullableStringFieldUpdateOperationsInput | string | null
    user?: UserUpdateOneRequiredWithoutPlaybackHistoriesNestedInput
  }

  export type PlaybackHistoryUncheckedUpdateWithoutTrackInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    playedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    contextType?: NullableStringFieldUpdateOperationsInput | string | null
    contextId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type PlaybackHistoryUncheckedUpdateManyWithoutTrackInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    playedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    contextType?: NullableStringFieldUpdateOperationsInput | string | null
    contextId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type TrackGenreUpdateWithoutTrackInput = {
    genre?: GenreUpdateOneRequiredWithoutTracksNestedInput
  }

  export type TrackGenreUncheckedUpdateWithoutTrackInput = {
    genreId?: StringFieldUpdateOperationsInput | string
  }

  export type TrackGenreUncheckedUpdateManyWithoutTrackInput = {
    genreId?: StringFieldUpdateOperationsInput | string
  }

  export type TrackGenreCreateManyGenreInput = {
    trackId: string
  }

  export type TrackGenreUpdateWithoutGenreInput = {
    track?: TrackUpdateOneRequiredWithoutGenresNestedInput
  }

  export type TrackGenreUncheckedUpdateWithoutGenreInput = {
    trackId?: StringFieldUpdateOperationsInput | string
  }

  export type TrackGenreUncheckedUpdateManyWithoutGenreInput = {
    trackId?: StringFieldUpdateOperationsInput | string
  }

  export type PlaylistTrackCreateManyPlaylistInput = {
    trackId: string
    sortOrder?: number
    addedAt?: Date | string
  }

  export type PlaylistFollowerCreateManyPlaylistInput = {
    userId: string
    followedAt?: Date | string
  }

  export type PlaylistTrackUpdateWithoutPlaylistInput = {
    sortOrder?: IntFieldUpdateOperationsInput | number
    addedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    track?: TrackUpdateOneRequiredWithoutPlaylistTracksNestedInput
  }

  export type PlaylistTrackUncheckedUpdateWithoutPlaylistInput = {
    trackId?: StringFieldUpdateOperationsInput | string
    sortOrder?: IntFieldUpdateOperationsInput | number
    addedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PlaylistTrackUncheckedUpdateManyWithoutPlaylistInput = {
    trackId?: StringFieldUpdateOperationsInput | string
    sortOrder?: IntFieldUpdateOperationsInput | number
    addedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PlaylistFollowerUpdateWithoutPlaylistInput = {
    followedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutFollowedPlaylistsNestedInput
  }

  export type PlaylistFollowerUncheckedUpdateWithoutPlaylistInput = {
    userId?: StringFieldUpdateOperationsInput | string
    followedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PlaylistFollowerUncheckedUpdateManyWithoutPlaylistInput = {
    userId?: StringFieldUpdateOperationsInput | string
    followedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use UserCountOutputTypeDefaultArgs instead
     */
    export type UserCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = UserCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ArtistCountOutputTypeDefaultArgs instead
     */
    export type ArtistCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ArtistCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use AlbumCountOutputTypeDefaultArgs instead
     */
    export type AlbumCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = AlbumCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use TrackCountOutputTypeDefaultArgs instead
     */
    export type TrackCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = TrackCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use GenreCountOutputTypeDefaultArgs instead
     */
    export type GenreCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = GenreCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use PlaylistCountOutputTypeDefaultArgs instead
     */
    export type PlaylistCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = PlaylistCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use UserDefaultArgs instead
     */
    export type UserArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = UserDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ArtistDefaultArgs instead
     */
    export type ArtistArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ArtistDefaultArgs<ExtArgs>
    /**
     * @deprecated Use AlbumDefaultArgs instead
     */
    export type AlbumArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = AlbumDefaultArgs<ExtArgs>
    /**
     * @deprecated Use TrackDefaultArgs instead
     */
    export type TrackArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = TrackDefaultArgs<ExtArgs>
    /**
     * @deprecated Use TrackArtistDefaultArgs instead
     */
    export type TrackArtistArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = TrackArtistDefaultArgs<ExtArgs>
    /**
     * @deprecated Use AlbumArtistDefaultArgs instead
     */
    export type AlbumArtistArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = AlbumArtistDefaultArgs<ExtArgs>
    /**
     * @deprecated Use TrackAudioResourceDefaultArgs instead
     */
    export type TrackAudioResourceArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = TrackAudioResourceDefaultArgs<ExtArgs>
    /**
     * @deprecated Use GenreDefaultArgs instead
     */
    export type GenreArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = GenreDefaultArgs<ExtArgs>
    /**
     * @deprecated Use TrackGenreDefaultArgs instead
     */
    export type TrackGenreArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = TrackGenreDefaultArgs<ExtArgs>
    /**
     * @deprecated Use PlaylistDefaultArgs instead
     */
    export type PlaylistArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = PlaylistDefaultArgs<ExtArgs>
    /**
     * @deprecated Use PlaylistTrackDefaultArgs instead
     */
    export type PlaylistTrackArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = PlaylistTrackDefaultArgs<ExtArgs>
    /**
     * @deprecated Use PlaylistFollowerDefaultArgs instead
     */
    export type PlaylistFollowerArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = PlaylistFollowerDefaultArgs<ExtArgs>
    /**
     * @deprecated Use LikedTrackDefaultArgs instead
     */
    export type LikedTrackArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = LikedTrackDefaultArgs<ExtArgs>
    /**
     * @deprecated Use PlaybackHistoryDefaultArgs instead
     */
    export type PlaybackHistoryArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = PlaybackHistoryDefaultArgs<ExtArgs>

  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}