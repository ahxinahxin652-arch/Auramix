const crypto = require('crypto')
const fs = require('fs')
const path = require('path')
const {spawn} = require('child_process')
const {getDb} = require('./db')
const Track = require('../pojo/do/Track')
const {WarehouseItemVO, ImportResultVO} = require('../pojo/vo/ResponseVOs')
const artistDao = require('./artistDao')

// ========== 常量 ==========
const SUPPORTED_EXTENSIONS = ['.flac', '.mp3', '.ogg', '.wav', '.aac', '.m4a']
const ALL_IMPORTABLE_EXTENSIONS = [
    '.flac', '.mp3', '.ogg', '.wav', '.aac', '.m4a',
    '.kgm', '.kgma', '.vpr', '.kgmm',
    '.qmc0', '.qmc3', '.qmcflac', '.qmcogg', '.mflac', '.mgg',
    '.ncm', '.kwm',
]
const ENCRYPTED_FORMATS = ['kgm', 'kgma', 'vpr', 'kgmm', 'qmc0', 'qmc3', 'qmcflac', 'qmcogg', 'mflac', 'mgg', 'ncm', 'kwm']

// ========== 元数据解析 ==========

/**
 * 标准化图片 MIME 类型
 */
function normalizeMimeType(format) {
    if (!format) return 'image/jpeg'
    if (format.startsWith('image/')) return format
    const map = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', bmp: 'image/bmp', webp: 'image/webp' }
    return map[format.toLowerCase()] || 'image/jpeg'
}

/**
 * 解析音频文件的元数据 (歌曲名、歌手、时长、封面缩略图)
 * @param {string} filePath 音频文件的绝对路径
 * @returns {Promise<{ title: string, artist: string, duration: number, cover: string }>}
 */
async function parseAudioMetadata(filePath) {
    try {
        const mm = await import('music-metadata');
        const metadata = await mm.parseFile(filePath);

        let cover = ''
        if (metadata.common.picture && metadata.common.picture.length > 0) {
            const pic = metadata.common.picture[0]
            const mime = normalizeMimeType(pic.format)
            // pic.data 可能是 Uint8Array (music-metadata v11+)
            const buf = Buffer.isBuffer(pic.data) ? pic.data : Buffer.from(pic.data)
            cover = `data:${mime};base64,${buf.toString('base64')}`
        }

        return {
            title: metadata.common.title || '',
            artist: metadata.common.artist || '',
            duration: metadata.format.duration ? Math.round(metadata.format.duration) : 0,
            cover,
        };
    } catch (error) {
        console.error(`[Metadata] 解析文件元数据失败 ${filePath}:`, error.message);
        return {title: '', artist: '', duration: 0, cover: ''};
    }
}

/**
 * 辅助函数：当元数据缺失时，尝试从文件名中推断信息 (例如 "歌手 - 歌名")
 */
function parseFileName(fileName) {
    const nameWithoutExt = fileName.replace(/\.[^/.]+$/, "");
    const parts = nameWithoutExt.split(' - ');
    if (parts.length >= 2) {
        return {artist: parts[0].trim(), title: parts[1].trim()};
    }
    return {artist: '', title: nameWithoutExt};
}

/**
 * 解析歌手字符串，确保数据库中存在这些歌手，并返回序列化后的 artists JSON 数组
 * @param {string} artistStr
 * @returns {Promise<string>}
 */
async function buildArtistsJson(artistStr) {
    if (!artistStr || artistStr.trim() === '') {
        return JSON.stringify([]);
    }
    
    // 按照常见的分隔符切分歌手姓名
    const artistNames = artistStr.split(/[,/;|&，、\/]/).map(name => name.trim()).filter(Boolean);
    const boundArtists = [];
    
    for (const name of artistNames) {
        try {
            const artist = await artistDao.createArtistIfNotExist(name);
            boundArtists.push({
                id: artist.id,
                name: artist.name,
                role: 'Main Artist'
            });
        } catch (e) {
            console.error(`[DB] Failed to create artist "${name}":`, e.message);
        }
    }
    
    return JSON.stringify(boundArtists);
}

// ========== 音乐仓库 DAO ==========

/**
 * 获取应用数据根目录
 * - 安装后 (isPackaged): exe 同级目录下的 data 文件夹 (如 D:\Music\Satisfy\data)
 * - dev 模式: ~/musicWarehouse  (如 C:\Users\xxx\musicWarehouse)
 * 与 db.js 中的 getAppDataRoot 保持一致
 * @returns {string}
 */
function getAppDataRoot() {
    const {app} = require('electron')
    if (app.isPackaged) {
        return path.join(path.dirname(app.getPath('exe')), 'data')
    }
    return path.join(app.getPath('home'), 'musicWarehouse')
}

/**
 * 获取音乐仓库根目录
 * - dev 模式: ~/musicWarehouse (getAppDataRoot 本身就返回这个)
 * - 安装后: {userData}/data/musicWarehouse
 * @returns {string}
 */
function getMusicWarehouseRoot() {
    const {app} = require('electron')
    if (app.isPackaged) {
        // 安装后：在 data 目录下创建 musicWarehouse 子文件夹
        return path.join(getAppDataRoot(), 'musicWarehouse')
    }
    return getAppDataRoot()
}

async function getAllWarehouses(sortBy = 'recent-played') {
    const db = getDb()

    // 根据排序方式确定 orderBy
    let orderBy
    switch (sortBy) {
        case 'name':
            orderBy = {name: 'asc'}
            break
        case 'recent-updated':
        case 'recent-played':
        default:
            orderBy = {updatedAt: 'desc'}
            break
    }

    const playlists = await db.playlist.findMany({
        include: {
            _count: {select: {tracks: true}}
        },
        orderBy,
    })

    const result = []
    for (const pl of playlists) {
        result.push(new WarehouseItemVO({
            id: pl.id,
            name: pl.name,
            path: pl.id,
            trackCount: pl._count.tracks,
            description: pl.description || '',
            coverPath: pl.coverUrl || '',
            recentPlayedAt: pl.updatedAt,
        }))
    }

    return result
}

/**
 * 创建音乐库
 * 先插入 SQLite，再创建文件夹。如果文件夹创建失败则回滚数据库。
 * @param {string} name
 * @returns {Promise<{ success: boolean, warehouse?: import('../pojo/vo/ResponseVOs').WarehouseItemVO, error?: string }>}
 */
async function createWarehouse(name) {
    const db = getDb()
    const root = getMusicWarehouseRoot()
    const warehousePath = path.join(root, name)
    const { nextId } = require('./snowflake')

    try {
        // 1. 先插入数据库 (关联默认 seeded 用户 ID: 1n)
        const library = await db.playlist.create({
            data: {
                id: nextId(),
                ownerId: 1n,
                name,
                isPublic: 1,
            },
        })

        // 2. 再创建文件夹
        try {
            if (!fs.existsSync(warehousePath)) {
                fs.mkdirSync(warehousePath, {recursive: true})
                fs.mkdirSync(path.join(warehousePath, 'music'), {recursive: true})
            }
        } catch (fsErr) {
            // 文件夹创建失败，回滚数据库
            console.error(`[DB Rollback] Failed to create directory for "${name}", rolling back database`)
            await db.playlist.delete({where: {id: library.id}})
            return {success: false, error: `文件夹创建失败: ${fsErr.message}`}
        }

        return {
            success: true,
            warehouse: new WarehouseItemVO({
                id: library.id,
                name,
                path: warehousePath,
                trackCount: 0,
            }),
        }
    } catch (err) {
        // 数据库插入失败（可能是名称重复）
        if (err.code === 'P2002') {
            return {success: false, error: `音乐库 "${name}" 已存在`}
        }
        return {success: false, error: err.message}
    }
}

/**
 * 递归扫描音乐目录（同步辅助函数）
 */
function scanMusicDirForSync(dir, result) {
    try {
        const entries = fs.readdirSync(dir, {withFileTypes: true})
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name)
            if (entry.isDirectory()) {
                scanMusicDirForSync(fullPath, result)
            } else if (entry.isFile()) {
                const ext = path.extname(entry.name).toLowerCase()
                if (SUPPORTED_EXTENSIONS.includes(ext)) {
                    try {
                        const stats = fs.statSync(fullPath)
                        result.push({
                            name: entry.name,
                            path: fullPath,
                            size: stats.size,
                            modified: stats.mtimeMs,
                        })
                    } catch (e) {
                        // 忽略无法读取的文件
                    }
                }
            }
        }
    } catch (e) {
        // 忽略无权限 of 目录
    }
}

/**
 * 通过 ID 更新音乐库的最近播放时间（名称变更安全）
 * @param {string} libraryId - 音乐库 UUID
 * @returns {Promise<{ success: boolean }>}
 */
async function updateRecentPlayedById(libraryId) {
    const db = getDb()
    try {
        await db.playlist.update({
            where: {id: BigInt(libraryId)},
            data: {updatedAt: new Date()},
        })
        return {success: true}
    } catch (err) {
        return {success: false, error: err.message}
    }
}

/**
 * 更新音乐库信息（通过 library ID）
 * @param {string} libraryId - 音乐库 UUID
 * @param {Object} updates - 要更新的字段
 * @param {string} [updates.name] - 新名称
 * @param {string} [updates.description] - 新描述
 * @param {string} [updates.coverPath] - 新封面 Base64
 * @returns {Promise<{ success: boolean, warehouse?: import('../pojo/vo/ResponseVOs').WarehouseItemVO, error?: string }>}
 */
async function updateWarehouseById(libraryId, updates) {
    const db = getDb()
    const root = getMusicWarehouseRoot()

    try {
        const library = await db.playlist.findUnique({where: {id: BigInt(libraryId)}})
        if (!library) {
            return {success: false, error: `音乐库不存在`}
        }

        // 如果要改名，需要重命名文件夹并更新所有 track 的路径
        const needRename = updates.name && updates.name !== library.name
        if (needRename) {
            const oldPath = path.join(root, library.name)
            const newPath = path.join(root, updates.name)
            // 检查新名称是否已存在文件夹
            if (fs.existsSync(newPath)) {
                return {success: false, error: `音乐库名 "${updates.name}" 已存在`}
            }
            // 重命名文件夹
            fs.renameSync(oldPath, newPath)

            // 更新所有关联 track 的 path 字段，将旧路径前缀替换为新路径前缀
            const oldPrefix = oldPath + path.sep
            const newPrefix = newPath + path.sep
            const playlistTracks = await db.playlistTrack.findMany({
                where: {playlistId: library.id},
                include: {track: {include: {audioResources: true}}},
            })
            for (const pt of playlistTracks) {
                const resource = pt.track.audioResources[0]
                if (resource && resource.streamUrl.startsWith(oldPrefix)) {
                    const updatedPath = newPrefix + resource.streamUrl.slice(oldPrefix.length)
                    await db.trackAudioResource.update({
                        where: {id: resource.id},
                        data: {streamUrl: updatedPath},
                    })
                }
            }
        }

        // 构建更新数据
        const data = {}
        if (updates.name !== undefined) data.name = updates.name
        if (updates.description !== undefined) data.description = updates.description
        if (updates.coverPath !== undefined) data.coverUrl = updates.coverPath

        const updated = await db.playlist.update({
            where: {id: library.id},
            data,
            include: {_count: {select: {tracks: true}}},
        })

        const warehousePath = path.join(root, updated.name)
        return {
            success: true,
            warehouse: new WarehouseItemVO({
                id: updated.id,
                name: updated.name,
                path: warehousePath,
                trackCount: updated._count.tracks,
                description: updated.description || '',
                coverPath: updated.coverUrl || '',
                recentPlayedAt: updated.updatedAt,
            }),
        }
    } catch (err) {
        // 名字唯一性冲突
        if (err.code === 'P2002') {
            return {success: false, error: `音乐库名已存在`}
        }
        return {success: false, error: err.message}
    }
}

/**
 * 通过 track ID 解析当前最新的 track 信息（含最新 path）
 * 播放端在播放前调用，确保拿到的是数据库中最新的路径
 * @param {string} trackId
 * @returns {Promise<{ success: boolean, track?: Object, error?: string }>}
 */
async function resolveTrackById(trackId) {
    const db = getDb()
    try {
        const track = await db.track.findUnique({
            where: {id: BigInt(trackId)},
            include: {
                album: true,
                artists: {
                    include: {
                        artist: true
                    }
                },
                audioResources: true,
            },
        })
        if (!track) {
            return {success: false, error: '曲目不存在'}
        }
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
            success: true,
            track: {
                id: track.id,
                title: track.title,
                name: track.title,
                artist: artistsList.filter(a => a.role === 'Main Artist').map(a => a.name).join(' / ') || artistsList.map(a => a.name).join(' / '),
                album: track.album.title,
                albumId: track.albumId,
                cover: track.album.coverUrl || '',
                duration: track.duration / 1000,
                path: resource.streamUrl,
                format: formatStr,
                size: resource.size,
                artists: JSON.stringify(artistsList),
                trackNumber: track.trackNumber,
                discNumber: track.discNumber,
                member: track.member,
                lyrics: track.lyricsUrl || '',
                createdAt: track.createdAt,
                updatedAt: track.updatedAt,
            },
        }
    } catch (err) {
        return {success: false, error: err.message}
    }
}

/**
 * 获取音乐库下的所有曲目（通过 library ID）
 * @param {string} libraryId
 * @returns {Promise<{ success: boolean, tracks?: Array, libraryId?: string, warehouseName?: string, error?: string }>}
 */
async function getWarehouseTracksById(libraryId) {
    const db = getDb()

    try {
        const playlist = await db.playlist.findUnique({
            where: {id: BigInt(libraryId)},
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
                    },
                    orderBy: {
                        sortOrder: 'asc'
                    }
                }
            }
        })

        if (!playlist) {
            return {success: false, error: `歌单不存在`}
        }

        const validTracks = []
        for (const pt of playlist.tracks) {
            const track = pt.track
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
            const isRemote = resource.streamUrl.startsWith('http://') || resource.streamUrl.startsWith('https://')
            const exists = isRemote || fs.existsSync(resource.streamUrl)

            if (exists) {
                const formatStr = resource.format === 1 ? 'flac' : (resource.format === 2 ? 'm4a' : (resource.format === 3 ? 'ogg' : 'mp3'))
                validTracks.push({
                    id: track.id,
                    title: track.title,
                    name: track.title,
                    artist: artistsList.filter(a => a.role === 'Main Artist').map(a => a.name).join(' / ') || artistsList.map(a => a.name).join(' / '),
                    album: track.album.title,
                    albumId: track.albumId,
                    cover: track.album.coverUrl || '',
                    duration: track.duration / 1000,
                    path: resource.streamUrl,
                    format: formatStr,
                    size: resource.size,
                    artists: JSON.stringify(artistsList),
                    trackNumber: track.trackNumber,
                    discNumber: track.discNumber,
                    member: track.member,
                    lyrics: track.lyricsUrl || '',
                    createdAt: track.createdAt,
                    updatedAt: track.updatedAt,
                })
            }
        }

        return {
            success: true,
            warehouseName: playlist.name,
            tracks: validTracks,
            libraryId: playlist.id,
            warehouse: {name: playlist.name, description: playlist.description || '', coverPath: playlist.coverUrl || ''}
        }
    } catch (err) {
        return {success: false, error: err.message}
    }
}

/**
 * 导入文件到音乐库（通过 library ID）
 * @param {string} libraryId
 * @param {string[]} filePaths
 * @returns {Promise<{ success: boolean, result?: ImportResultVO, error?: string }>}
 */
async function importFilesToWarehouseById(libraryId, filePaths) {
    const db = getDb();
    const root = getMusicWarehouseRoot();
    const { nextId } = require('./snowflake');

    const library = await db.playlist.findUnique({
        where: {id: BigInt(libraryId)},
    });

    if (!library) {
        return {success: false, error: `音乐库不存在`};
    }

    const musicDir = path.join(root, library.name, 'music');

    if (!fs.existsSync(musicDir)) {
        fs.mkdirSync(musicDir, {recursive: true});
    }

    const imported = [];
    const skipped = [];

    for (const filePath of filePaths) {
        try {
            const ext = path.extname(filePath).toLowerCase();
            if (!ALL_IMPORTABLE_EXTENSIONS.includes(ext)) {
                skipped.push(filePath);
                continue;
            }

            if (!fs.existsSync(filePath)) {
                skipped.push(filePath);
                continue;
            }

            const fileName = path.basename(filePath);
            const destPath = path.join(musicDir, fileName);

            let finalPath = destPath;
            let finalName = fileName;
            let counter = 1;

            // 处理文件名冲突
            while (fs.existsSync(finalPath)) {
                const nameWithoutExt = path.basename(filePath, ext);
                finalName = `${nameWithoutExt}_${counter}${ext}`;
                finalPath = path.join(musicDir, finalName);
                counter++;
            }

            fs.copyFileSync(filePath, finalPath);

            try {
                const stats = fs.statSync(finalPath);
                const trackIdVal = nextId();
                const albumIdVal = nextId();
                const isEncrypted = ENCRYPTED_FORMATS.includes(ext.replace('.', ''));

                // 初始化基础 Track 数据
                let title = path.basename(finalName, ext);
                let artistStr = '';
                let duration = 0;

                // 如果是未加密的受支持格式，读取内置元数据
                if (!isEncrypted && SUPPORTED_EXTENSIONS.includes(ext)) {
                    const meta = await parseAudioMetadata(finalPath);
                    const nameMeta = parseFileName(finalName);

                    // 优先级：文件内置元数据 > 文件名识别 > 默认文件名
                    title = meta.title || nameMeta.title || title;
                    artistStr = meta.artist || nameMeta.artist || '';
                    duration = meta.duration || 0;
                }

                // 1. 创建该单曲的 mock 专辑 release
                await db.album.create({
                    data: {
                        id: albumIdVal,
                        title,
                        coverUrl: '',
                        releaseDate: new Date(),
                        albumType: 1
                    }
                });

                const maxTrack = await db.track.findFirst({
                    where: { albumId: albumIdVal },
                    orderBy: { trackNumber: 'desc' },
                });
                const trackNumber = maxTrack ? maxTrack.trackNumber + 1 : 1;

                // 2. 存入 SQLite 数据库中的 tracks
                await db.track.create({
                    data: {
                        id: trackIdVal,
                        albumId: albumIdVal,
                        title,
                        duration: duration * 1000,
                        trackNumber,
                    }
                });

                const artistNames = artistStr.split(/[,/;|&，、\/]/).map(name => name.trim()).filter(Boolean);
                if (artistNames.length === 0) {
                    artistNames.push('未知歌手');
                }
                for (const name of artistNames) {
                    const artist = await artistDao.createArtistIfNotExist(name);
                    await db.trackArtist.create({
                        data: {
                            trackId: trackIdVal,
                            artistId: artist.id,
                            role: 0
                        }
                    });

                    // 关联专辑与歌手
                    await db.albumArtist.upsert({
                        where: {
                            albumId_artistId: {
                                albumId: albumIdVal,
                                artistId: artist.id
                            }
                        },
                        update: {},
                        create: {
                            albumId: albumIdVal,
                            artistId: artist.id
                        }
                    });
                }

                // 3. 关联歌单与歌曲
                const maxPLTrack = await db.playlistTrack.findFirst({
                    where: { playlistId: library.id },
                    orderBy: { sortOrder: 'desc' },
                });
                const sortOrder = maxPLTrack ? maxPLTrack.sortOrder + 1 : 1;

                await db.playlistTrack.create({
                    data: {
                        playlistId: library.id,
                        trackId: trackIdVal,
                        sortOrder,
                    }
                });

                // Create Audio Resource
                let quality = ext === '.flac' ? 2 : 1;
                let format = 0;
                const formatStr = ext.replace('.', '').toLowerCase();
                if (formatStr === 'mp3') format = 0;
                else if (formatStr === 'flac') format = 1;
                else if (formatStr === 'm4a') format = 2;
                else if (formatStr === 'ogg') format = 3;
                else if (formatStr === 'wav') format = 0;

                await db.trackAudioResource.create({
                    data: {
                        id: nextId(),
                        trackId: trackIdVal,
                        quality,
                        format,
                        bitrate: ext === '.flac' ? 1411200 : 320000,
                        streamUrl: finalPath,
                        size: BigInt(stats.size),
                    }
                });

                imported.push(finalPath);
            } catch (dbErr) {
                console.error(`[DB] 插入歌曲 "${finalName}" 失败，正在回滚文件:`, dbErr);
                try {
                    fs.unlinkSync(finalPath);
                } catch (_) {
                }
                skipped.push(filePath);
            }
        } catch (e) {
            console.error(`[File] 处理文件 "${filePath}" 时发生未知错误:`, e);
            skipped.push(filePath);
        }
    }

    return {
        success: true,
        result: {imported: imported.length, skipped: skipped.length},
    };
}

/**
 * 同步指定音乐库的数据（通过 library ID）
 * @param {string} libraryId
 * @returns {Promise<{ added: number, removed: number }>}
 */
async function syncWarehouseById(libraryId) {
    const db = getDb()
    const root = getMusicWarehouseRoot()
    const { nextId } = require('./snowflake')

    const library = await db.playlist.findUnique({
        where: {id: BigInt(libraryId)},
    })

    if (!library) return {added: 0, removed: 0}

    const musicDir = path.join(root, library.name, 'music')

    const dbPlaylistTracks = await db.playlistTrack.findMany({
        where: {playlistId: library.id},
        include: {track: {include: {audioResources: true}}},
    })
    const dbPathSet = new Set(dbPlaylistTracks.map(pt => pt.track.audioResources[0]?.streamUrl).filter(Boolean))

    const fsFiles = []
    if (fs.existsSync(musicDir)) {
        scanMusicDirForSync(musicDir, fsFiles)
    }
    const fsPathSet = new Set(fsFiles.map(f => f.path))

    const orphanTracks = dbPlaylistTracks.filter(pt => {
        const pathVal = pt.track.audioResources[0]?.streamUrl
        return !pathVal || !fsPathSet.has(pathVal)
    })
    let removed = 0
    if (orphanTracks.length > 0) {
        const result = await db.track.deleteMany({
            where: {id: {in: orphanTracks.map(pt => pt.track.id)}},
        })
        removed = result.count
    }

    const newFiles = fsFiles.filter(f => !dbPathSet.has(f.path))
    let added = 0
    for (const file of newFiles) {
        try {
            const ext = path.extname(file.name).toLowerCase()
            const isEncrypted = ENCRYPTED_FORMATS.includes(ext.replace('.', ''))

            let title = path.basename(file.name, ext)
            let artistStr = ''
            let duration = 0

            if (!isEncrypted && SUPPORTED_EXTENSIONS.includes(ext)) {
                const meta = await parseAudioMetadata(file.path)
                const nameMeta = parseFileName(file.name)
                title = meta.title || nameMeta.title || title
                artistStr = meta.artist || nameMeta.artist || ''
                duration = meta.duration || 0
            }

            const trackIdVal = nextId()
            const albumIdVal = nextId()

            // 创建 mock 专辑 release
            await db.album.create({
                data: {
                    id: albumIdVal,
                    title,
                    coverUrl: '',
                    releaseDate: new Date(),
                    albumType: 1
                }
            });

            const maxTrack = await db.track.findFirst({
                where: { albumId: albumIdVal },
                orderBy: { trackNumber: 'desc' },
            })
            const trackNumber = maxTrack ? maxTrack.trackNumber + 1 : 1

            await db.track.create({
                data: {
                    id: trackIdVal,
                    albumId: albumIdVal,
                    title,
                    duration: duration * 1000,
                    trackNumber,
                }
            })

            const artistNames = artistStr.split(/[,/;|&，、\/]/).map(name => name.trim()).filter(Boolean)
            if (artistNames.length === 0) {
                artistNames.push('未知歌手')
            }
            for (const name of artistNames) {
                const artist = await artistDao.createArtistIfNotExist(name)
                await db.trackArtist.create({
                    data: {
                        trackId: trackIdVal,
                        artistId: artist.id,
                        role: 0
                    }
                })

                // 关联专辑与歌手
                await db.albumArtist.upsert({
                    where: {
                        albumId_artistId: {
                            albumId: albumIdVal,
                            artistId: artist.id
                        }
                    },
                    update: {},
                    create: {
                        albumId: albumIdVal,
                        artistId: artist.id
                    }
                });
            }

            // 关联歌单与歌曲
            const maxPLTrack = await db.playlistTrack.findFirst({
                where: { playlistId: library.id },
                orderBy: { sortOrder: 'desc' },
            });
            const sortOrder = maxPLTrack ? maxPLTrack.sortOrder + 1 : 1;

            await db.playlistTrack.create({
                data: {
                    playlistId: library.id,
                    trackId: trackIdVal,
                    sortOrder,
                }
            });

            // Create Audio Resource
            let quality = ext === '.flac' ? 2 : 1
            let format = 0
            const formatStr = ext.replace('.', '').toLowerCase()
            if (formatStr === 'mp3') format = 0
            else if (formatStr === 'flac') format = 1
            else if (formatStr === 'm4a') format = 2
            else if (formatStr === 'ogg') format = 3
            else if (formatStr === 'wav') format = 0

            await db.trackAudioResource.create({
                data: {
                    id: nextId(),
                    trackId: trackIdVal,
                    quality,
                    format,
                    bitrate: ext === '.flac' ? 1411200 : 320000,
                    streamUrl: file.path,
                    size: BigInt(file.size),
                }
            })

            added++
        } catch (e) {
            console.error('[Sync] Failed to sync file:', file.name, e)
        }
    }

    return {added, removed}
}

/**
 * 删除音乐库（通过 library ID）
 * @param {string} libraryId
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
async function deleteWarehouseById(libraryId) {
    const db = getDb()
    const root = getMusicWarehouseRoot()

    try {
        const library = await db.playlist.findUnique({
            where: {id: BigInt(libraryId)},
        })

        if (!library) {
            return {success: true}
        }

        const warehousePath = path.join(root, library.name)

        if (fs.existsSync(warehousePath)) {
            try {
                fs.rmSync(warehousePath, {recursive: true, force: true})
            } catch (fsErr) {
                console.error(`[DB] Warning: Failed to delete warehouse directory "${library.name}":`, fsErr.message)
            }
        }

        // 删除该歌单下所有的 songs
        const playlistTracks = await db.playlistTrack.findMany({
            where: {playlistId: library.id}
        })
        const trackIds = playlistTracks.map(pt => pt.trackId)
        if (trackIds.length > 0) {
            await db.track.deleteMany({
                where: {id: {in: trackIds}}
            })
        }

        await db.playlist.delete({where: {id: library.id}})

        return {success: true}
    } catch (err) {
        return {success: false, error: err.message}
    }
}

/**
 * 更新曲目信息（编辑歌曲）
 * @param {string} id
 * @param {Object} data - { title?, artist?, album? }
 * @returns {Promise<{ success: boolean, track?: Object, error?: string }>}
 */
async function updateTrack(id, data) {
    const db = getDb()
    try {
        const track = await db.track.update({
            where: {id: BigInt(id)},
            data: {
                ...(data.title !== undefined && {title: data.title}),
                ...(data.lyrics !== undefined && {lyricsUrl: data.lyrics}),
            },
        })
        return {success: true, track}
    } catch (err) {
        return {success: false, error: err.message}
    }
}

/**
 * 删除曲目（从数据库和文件系统）
 * @param {string} id
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
async function deleteTrack(id) {
    const db = getDb()
    try {
        const track = await db.track.findUnique({
            where: {id: BigInt(id)},
            include: {audioResources: true}
        })
        if (!track) return {success: false, error: '曲目不存在'}

        await db.track.delete({where: {id: track.id}})

        try {
            const resource = track.audioResources[0]
            if (resource && fs.existsSync(resource.streamUrl)) {
                fs.unlinkSync(resource.streamUrl)
            }
        } catch (fsErr) {
            console.error(`[DB] Warning: Failed to delete track file "${track.path}":`, fsErr.message)
        }

        return {success: true}
    } catch (err) {
    }
}

// ========== 远端 API（管理端后端 8080 端口）歌单管理 DAO ==========
// 这些函数代理到 Java 管理端后端 (http://localhost:8080)，
// 代替本地 SQLite 进行歌单的 CRUD 操作。

const remoteApi = require('./remoteApiClient')

/**
 * 从远端 API 获取所有歌单（音乐库）列表
 * @param {object} [params]
 * @param {string} [params.token] - 用户 JWT token
 * @returns {Promise<{ success: boolean, data?: Array, error?: string }>}
 */
async function fetchAllPlaylistsRemote(params = {}) {
    return remoteApi.fetchAllPlaylists(params)
}

/**
 * 从远端 API 获取歌单详情（含歌曲列表）
 * @param {string|number} playlistId
 * @param {string} token - 用户 JWT token
 * @returns {Promise<{ success: boolean, data?: Object, error?: string }>}
 */
async function fetchPlaylistDetailRemote(playlistId, token) {
    return remoteApi.fetchPlaylistDetail(playlistId, token)
}

/**
 * 通过远端 API 创建歌单
 * @param {object} body - { name, description?, isPublic? }
 * @param {string} token - 用户 JWT token
 * @returns {Promise<{ success: boolean, data?: Object, error?: string }>}
 */
async function createPlaylistRemote(body, token) {
    return remoteApi.createPlaylist(body, token)
}

/**
 * 通过远端 API 更新歌单基本信息（JSON）
 * @param {string|number} playlistId
 * @param {object} body - { name?, description?, isPublic?, coverUrl? }
 * @param {string} token - 用户 JWT token
 * @returns {Promise<{ success: boolean, data?: Object, error?: string }>}
 */
async function updatePlaylistRemote(playlistId, body, token) {
    return remoteApi.updatePlaylist(playlistId, body, token)
}

/**
 * 通过远端 API 保存歌单（合并信息更新 + 可选封面上传，multipart）
 * @param {string|number} playlistId
 * @param {object} info - { name?, description?, isPublic?, clearCover? }
 * @param {object} [coverFile] - multer file object { buffer, originalname, mimetype }
 * @param {string} token - 用户 JWT token
 * @returns {Promise<{ success: boolean, data?: Object, error?: string }>}
 */
async function savePlaylistRemote(playlistId, info, coverFile, token) {
    return remoteApi.savePlaylist(playlistId, info, coverFile, token)
}

/**
 * 通过远端 API 删除歌单
 * @param {string|number} playlistId
 * @param {string} token - 用户 JWT token
 * @returns {Promise<{ success: boolean, data?: Object, error?: string }>}
 */
async function deletePlaylistRemote(playlistId, token) {
    return remoteApi.deletePlaylist(playlistId, token)
}

async function globalSearchRemote(params, token) {
    return remoteApi.globalSearch(params, token)
}

// ========== 本地 SQLite 镜像同步 ==========
// 远端 playlist 操作后同步创建/更新本地记录，保证本地 track 操作能查询到 playlist

/**
 * 在本地 SQLite 创建 playlist 镜像
 */
async function createPlaylistMirror(id, name, description, coverUrl) {
    const db = getDb()
    try {
        await db.playlist.create({
            data: {
                id: BigInt(id),
                ownerId: 1n, // 本地镜像用默认 ownerId
                name: name || '',
                description: description || '',
                coverUrl: coverUrl || '',
                isPublic: 1,
            },
        })
        return { success: true }
    } catch (err) {
        if (err.code === 'P2002') {
            return { success: true } // 已存在，忽略
        }
        console.error('[Mirror] createPlaylistMirror error:', err.message)
        return { success: false, error: err.message }
    }
}

/**
 * 更新本地 SQLite 的 playlist 镜像
 */
async function updatePlaylistMirror(id, fields) {
    const db = getDb()
    try {
        const data = {}
        if (fields.name !== undefined) data.name = fields.name
        if (fields.description !== undefined) data.description = fields.description
        if (fields.coverUrl !== undefined) data.coverUrl = fields.coverUrl
        if (Object.keys(data).length === 0) return { success: true }
        await db.playlist.update({ where: { id: BigInt(id) }, data })
        return { success: true }
    } catch (err) {
        console.error('[Mirror] updatePlaylistMirror error:', err.message)
        return { success: false, error: err.message }
    }
}

async function fetchAlbumDetailRemote(id, token) {
    return remoteApi.fetchAlbumDetail(id, token)
}

async function fetchArtistDetailRemote(id, token) {
    return remoteApi.fetchArtistDetail(id, token)
}

async function fetchTrackDetailRemote(id, token) {
    return remoteApi.fetchTrackDetail(id, token)
}

/**
 * 删除本地 SQLite 的 playlist 镜像
 */
async function deletePlaylistMirror(id) {
    const db = getDb()
    try {
        await db.playlist.delete({ where: { id: BigInt(id) } })
        return { success: true }
    } catch (err) {
        if (err.code === 'P2025') return { success: true } // 不存在，忽略
        console.error('[Mirror] deletePlaylistMirror error:', err.message)
        return { success: false, error: err.message }
    }
}

module.exports = {
    getMusicWarehouseRoot,
    getAllWarehouses,
    createWarehouse,
    deleteWarehouseById,
    getWarehouseTracksById,
    importFilesToWarehouseById,
    syncWarehouseById,
    updateWarehouseById,
    updateRecentPlayedById,
    resolveTrackById,
    updateTrack,
    deleteTrack,
    buildArtistsJson,

    // ========== 远端 API（管理端后端 8080 端口）歌单管理 ==========
    fetchAllPlaylistsRemote,
    fetchPlaylistDetailRemote,
    createPlaylistRemote,
    updatePlaylistRemote,
    savePlaylistRemote,
    deletePlaylistRemote,
    fetchAlbumDetailRemote,
    fetchArtistDetailRemote,
    fetchTrackDetailRemote,

    // ========== 本地 SQLite 镜像同步 ==========
    createPlaylistMirror,
    updatePlaylistMirror,
    deletePlaylistMirror,
    globalSearchRemote,
}
