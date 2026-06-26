const { contextBridge, ipcRenderer } = require('electron')

const API_PORT = 3000

/**
 * 统一 API 请求封装
 * 返回值统一为 ApiResult 格式: { success: boolean, data?: T, message?: string, error?: string }
 */
function apiFetch(url, options = {}) {
  const headers = { 'Content-Type': 'application/json' }
  // 携带用户 JWT token，供 Express 透传到 Java 后端
  try {
    const token = localStorage.getItem('auramix_token')
    if (token) {
      headers['X-User-Token'] = token
    }
  } catch (e) { /* localStorage 不可用 */ }
  return fetch(`http://localhost:${API_PORT}${url}`, {
    headers,
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  }).then(res => res.json())
}

// ========== 音乐仓库 API ==========

/** @returns {Promise<{ success: boolean, data?: { warehouses: Array<{name: string, path: string, trackCount: number, description: string, coverPath: string, recentPlayedAt: string|null}> }, error?: string }>} */
function getMusicWarehouses(sortBy) {
  const query = sortBy ? `?sortBy=${encodeURIComponent(sortBy)}` : ''
  return apiFetch(`/api/music/warehouses${query}`)
}

/** @returns {Promise<{ success: boolean, data?: { warehouse: {name: string, path: string, trackCount: number} }, error?: string }>} */
function createMusicWarehouse(name) {
  return apiFetch('/api/music/warehouses', { method: 'POST', body: { name } })
}

/** @returns {Promise<{ success: boolean }>} */
function updateRecentPlayedById(libraryId) {
  return apiFetch(`/api/music/libraries/${encodeURIComponent(libraryId)}/recent-played`, { method: 'POST', body: {} })
}

/** 通过 library ID 获取曲目列表 */
function getWarehouseTracksById(libraryId) {
  return apiFetch(`/api/music/libraries/${encodeURIComponent(libraryId)}/tracks`)
}

/** 通过 library ID 导入文件 */
function importFilesToWarehouseById(libraryId, filePaths) {
  return apiFetch(`/api/music/libraries/${encodeURIComponent(libraryId)}/import`, {
    method: 'POST',
    body: { filePaths },
  })
}

/** 通过 library ID 同步音乐库 */
function syncWarehouseById(libraryId) {
  return apiFetch(`/api/music/libraries/${encodeURIComponent(libraryId)}/sync`, { method: 'POST', body: {} })
}

/** 通过 library ID 更新音乐库信息 */
function updateMusicWarehouseById(libraryId, updates) {
  return apiFetch(`/api/music/libraries/${encodeURIComponent(libraryId)}`, { method: 'PUT', body: updates })
}

/** 通过 library ID 删除音乐库 */
function deleteMusicWarehouseById(libraryId) {
  return apiFetch(`/api/music/libraries/${encodeURIComponent(libraryId)}`, { method: 'DELETE' })
}

/** 通过 track ID 解析当前最新的 track 信息（含最新 path） */
function resolveTrackById(trackId) {
  return apiFetch(`/api/music/tracks/${encodeURIComponent(trackId)}`)
}

/** 更新曲目信息（编辑歌曲） */
function updateTrack(trackId, data) {
  return apiFetch(`/api/music/tracks/${encodeURIComponent(trackId)}`, { method: 'PUT', body: data })
}

/** 删除曲目 */
function deleteTrack(trackId) {
  return apiFetch(`/api/music/tracks/${encodeURIComponent(trackId)}`, { method: 'DELETE' })
}

/** 读取独立文件的元数据 */
function getFileMetadata(path) {
  return apiFetch(`/api/music/metadata?path=${encodeURIComponent(path)}`)
}

/** 写入独立文件的元数据 */
function updateFileMetadata(data) {
  return apiFetch('/api/music/metadata', { method: 'POST', body: data })
}

// ========== 歌手 API ==========
function getArtistById(artistId) {
  return apiFetch(`/api/music/artists/${encodeURIComponent(artistId)}`)
}

function updateArtist(artistId, updates) {
  return apiFetch(`/api/music/artists/${encodeURIComponent(artistId)}`, { method: 'PUT', body: updates })
}

// ========== 专辑 API ==========
function getAlbumById(albumId) {
  return apiFetch(`/api/music/albums/${encodeURIComponent(albumId)}`)
}

function updateAlbum(albumId, updates) {
  return apiFetch(`/api/music/albums/${encodeURIComponent(albumId)}`, { method: 'PUT', body: updates })
}

// ========== 远端歌单（音乐库）管理 API（代理到 Java 后端 8080 端口） ==========
// 这些操作直接读写远端 MySQL 数据库，替代本地 SQLite 的歌单 CRUD

/** 获取远端歌单列表 */
function getRemotePlaylists(params = {}) {
  const { keyword = '', pageNum = 1, pageSize = 100 } = params
  const qs = new URLSearchParams({ keyword, pageNum, pageSize }).toString()
  return apiFetch(`/api/music/remote/playlists?${qs}`)
}

/** 获取远端歌单详情 */
function getRemotePlaylistDetail(playlistId) {
  return apiFetch(`/api/music/remote/playlists/${encodeURIComponent(playlistId)}`)
}

/** 创建远端歌单（需传 ownerId） */
function createRemotePlaylist(body) {
  return apiFetch('/api/music/remote/playlists', { method: 'POST', body })
}

/** 保存远端歌单（合并信息更新 + 封面上传，FormData multipart） */
async function saveRemotePlaylist(playlistId, { name, description, isPublic, clearCover, coverBase64, coverFilename }) {
  const formData = new FormData()
  // info 部分：JSON 字段
  const info = {}
  if (name !== undefined) info.name = name
  if (description !== undefined) info.description = description
  if (isPublic !== undefined) info.isPublic = isPublic
  if (clearCover) info.clearCover = true
  formData.append('info', JSON.stringify(info))
  // cover 部分：可选图片文件
  if (coverBase64 && !clearCover) {
    const byteString = atob(coverBase64.split(',')[1] || coverBase64)
    const ab = new ArrayBuffer(byteString.length)
    const ia = new Uint8Array(ab)
    for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i)
    formData.append('cover', new Blob([ab], { type: 'image/jpeg' }), coverFilename || 'cover.jpg')
  }

  const headers = {}
  try {
    const token = localStorage.getItem('auramix_token')
    if (token) headers['X-User-Token'] = token
  } catch (e) { /* localStorage 不可用 */ }

  return fetch(`http://localhost:${API_PORT}/api/music/remote/playlists/${encodeURIComponent(playlistId)}`, {
    method: 'PUT',
    headers,
    body: formData,
  }).then(res => res.json())
}

/** 删除远端歌单 */
function deleteRemotePlaylist(playlistId) {
  return apiFetch(`/api/music/remote/playlists/${encodeURIComponent(playlistId)}`, { method: 'DELETE' })
}

// ========== 格式转换 API ==========

/** @returns {Promise<{ success: boolean, data?: { files: Array<{name: string, path: string, size: number}> }, error?: string }>} */
function scanFiles(filePaths) {
  return apiFetch('/api/convert/scan', { method: 'POST', body: { filePaths } })
}

/** @returns {Promise<{ success: boolean, data?: null, message?: string, error?: string }>} */
function startConvert({ files, outputPath }) {
  return apiFetch('/api/convert/start', { method: 'POST', body: { files, outputPath } })
}

/** @returns {Promise<string|null>} */
async function selectDirectory() {
  const data = await apiFetch('/api/convert/select-directory', { method: 'POST', body: {} })
  return data.success && data.data ? data.data.path : null
}

// ========== 音乐解密 API ==========

/** @returns {Promise<{ success: boolean, data?: { files: Array<{name: string, path: string, size: number}> }, error?: string }>} */
function scanDecryptFiles(filePaths) {
  return apiFetch('/api/decrypt/scan', { method: 'POST', body: { filePaths } })
}

/** @returns {Promise<{ success: boolean, data?: null, message?: string, error?: string }>} */
function startDecrypt({ files, outputPath }) {
  return apiFetch('/api/decrypt/start', { method: 'POST', body: { files, outputPath } })
}

/** @returns {Promise<{ success: boolean, data?: { outputPath: string, outputFileName: string }, error?: string }>} */
function decryptFile({ inputPath, outputPath, outputFormat }) {
  return apiFetch('/api/decrypt/file', { method: 'POST', body: { inputPath, outputPath, outputFormat } })
}

// ========== 歌词解密 API ==========

/** @returns {Promise<{ success: boolean, data?: { files: Array<{name: string, path: string, size: number}> }, error?: string }>} */
function scanLyricsDecryptFiles(filePaths) {
  return apiFetch('/api/lyrics-decrypt/scan', { method: 'POST', body: { filePaths } })
}

/** @returns {Promise<{ success: boolean, data?: null, message?: string, error?: string }>} */
function startLyricsDecrypt({ files, outputPath }) {
  return apiFetch('/api/lyrics-decrypt/start', { method: 'POST', body: { files, outputPath } })
}

// ========== 进度监听 ==========
let progressCallback = null
ipcRenderer.on('convert-progress', (event, data) => {
  if (progressCallback) progressCallback(data)
})
function onConvertProgress(callback) {
  progressCallback = callback
}

let decryptProgressCallback = null
ipcRenderer.on('decrypt-progress', (event, data) => {
  if (decryptProgressCallback) decryptProgressCallback(data)
})
function onDecryptProgress(callback) {
  decryptProgressCallback = callback
}

let lyricsDecryptProgressCallback = null
ipcRenderer.on('lyrics-decrypt-progress', (event, data) => {
  if (lyricsDecryptProgressCallback) lyricsDecryptProgressCallback(data)
})
function onLyricsDecryptProgress(callback) {
  lyricsDecryptProgressCallback = callback
}

// ========== 读取文件为 Blob ==========
function getMimeType(filePath) {
  const ext = filePath.split('.').pop().toLowerCase()
  const map = {
    flac: 'audio/flac',
    mp3: 'audio/mpeg',
    ogg: 'audio/ogg',
    wav: 'audio/wav',
    aac: 'audio/aac',
    m4a: 'audio/mp4',
    wma: 'audio/x-ms-wma',
  }
  return map[ext] || 'application/octet-stream'
}

async function readFileAsBlob(filePath) {
  return new Promise((resolve, reject) => {
    const key = `read-file-${Date.now()}-${Math.random()}`
    const handler = (event, data) => {
      if (data.key === key) {
        ipcRenderer.removeListener('read-file-result', handler)
        if (data.error) {
          reject(new Error(data.error))
        } else {
          // data.buffer 是 ArrayBuffer
          const blob = new Blob([data.buffer], { type: data.mimeType })
          resolve(blob)
        }
      }
    }
    ipcRenderer.on('read-file-result', handler)
    ipcRenderer.send('read-file', { key, filePath })
  })
}

// ========== 窗口控制 ==========
function minimizeWindow() { ipcRenderer.send('window-minimize') }
function maximizeWindow() { ipcRenderer.send('window-maximize') }
function closeWindow() { ipcRenderer.send('window-close') }

let maximizedCallback = null
ipcRenderer.on('window-maximized-changed', (event, isMaximized) => {
  if (maximizedCallback) maximizedCallback(isMaximized)
})
function onWindowMaximized(callback) { maximizedCallback = callback }

// ========== 歌词悬浮窗控制 ==========
function toggleLyricsWindow() { ipcRenderer.send('toggle-lyrics-window') }
function sendLyricsStatus(data) { ipcRenderer.send('update-lyrics-status', data) }
function moveWindow(x, y) { ipcRenderer.send('window-move', { x, y }) }

let lyricsStatusCallback = null
ipcRenderer.on('on-lyrics-status-update', (event, data) => {
  if (lyricsStatusCallback) lyricsStatusCallback(data)
})
function onLyricsStatusUpdate(callback) { lyricsStatusCallback = callback }

let lyricsWindowStateCallback = null
ipcRenderer.on('lyrics-window-state', (event, isOpen) => {
  if (lyricsWindowStateCallback) lyricsWindowStateCallback(isOpen)
})
function onLyricsWindowStateChange(callback) { lyricsWindowStateCallback = callback }

// ========== 选择音频文件 ==========
async function selectMusicFiles() {
  try {
    return await ipcRenderer.invoke('dialog:selectMusicFiles')
  } catch (err) {
    console.error('选择音频文件出错:', err)
    return []
  }
}

// ========== 暴露 API ==========
contextBridge.exposeInMainWorld('electronAPI', {
  // 音乐仓库
  getMusicWarehouses,
  createMusicWarehouse,
  updateMusicWarehouseById,
  deleteMusicWarehouseById,
  updateRecentPlayedById,
  getWarehouseTracksById,
  importFilesToWarehouseById,
  syncWarehouseById,
  resolveTrackById,
  updateTrack,
  deleteTrack,
  getFileMetadata,
  updateFileMetadata,
  // 远端歌单管理（代理到 8080 后端 MySQL）
  getRemotePlaylists,
  getRemotePlaylistDetail,
  createRemotePlaylist,
  saveRemotePlaylist,
  deleteRemotePlaylist,
  // 歌手 API
  getArtistById,
  updateArtist,
  // 专辑 API
  getAlbumById,
  updateAlbum,
  // 格式转换
  scanFiles,
  startConvert,
  selectDirectory,
  // 音乐解密
  scanDecryptFiles,
  startDecrypt,
  decryptFile,
  // 歌词解密
  scanLyricsDecryptFiles,
  startLyricsDecrypt,
  onLyricsDecryptProgress,
  // 进度 & 窗口
  onConvertProgress,
  onDecryptProgress,
  minimizeWindow,
  maximizeWindow,
  closeWindow,
  onWindowMaximized,
  // 歌词悬浮窗
  toggleLyricsWindow,
  sendLyricsStatus,
  onLyricsStatusUpdate,
  onLyricsWindowStateChange,
  moveWindow,
  // 选择文件
  selectMusicFiles,
  // 文件读取
  readFileAsBlob,
})
