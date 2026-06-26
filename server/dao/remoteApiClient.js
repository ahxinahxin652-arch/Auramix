/**
 * Remote API Client — HTTP client for Java backend (port 8080)
 *
 * User endpoints use JWT token for auth.
 * Admin endpoints (OSS upload) use X-Internal-Api-Key for service-to-service auth.
 */

const REMOTE_BASE_URL = process.env.AURAMIX_BACKEND_URL || 'http://localhost:8080'

const INTERNAL_API_KEY = process.env.AURAMIX_INTERNAL_API_KEY || 'auramix-desktop-internal-key-2026'

/**
 * Send JSON HTTP request to Java backend.
 * All requests have a 15-second timeout via AbortSignal.
 */
async function request(path, options = {}) {
    const { method = 'GET', body, token, useInternalKey = false } = options

    const url = `${REMOTE_BASE_URL}${path}`
    const headers = {}

    if (useInternalKey) {
        headers['X-Internal-Api-Key'] = INTERNAL_API_KEY
    } else if (token) {
        headers['Authorization'] = `Bearer ${token}`
    }

    const fetchOptions = { method, headers, signal: AbortSignal.timeout(15000) }

    if (body && method !== 'GET') {
        if (body instanceof FormData || body.constructor && body.constructor.name === 'FormData') {
            fetchOptions.body = body
        } else {
            headers['Content-Type'] = 'application/json'
            fetchOptions.body = JSON.stringify(body)
        }
    }

    try {
        const response = await fetch(url, fetchOptions)
        const json = await response.json()

        if (!response.ok) {
            return {
                success: false,
                error: json.message || 'HTTP ' + response.status,
                status: response.status,
            }
        }

        return {
            success: true,
            data: json.data,
            message: json.message,
        }
    } catch (err) {
        if (err.name === 'TimeoutError' || err.name === 'AbortError') {
            return {
                success: false,
                error: 'Request timed out (' + REMOTE_BASE_URL + '). Is the Java backend running?',
            }
        }
        return {
            success: false,
            error: 'Cannot connect to backend (' + REMOTE_BASE_URL + '): ' + err.message,
        }
    }
}

/**
 * Upload file to OSS (admin endpoint, internal key auth)
 */
async function uploadToOss(fileBuffer, filename, fileType) {
    fileType = fileType || 'cover'
    const url = `${REMOTE_BASE_URL}/api/admin/manage/oss/upload`
    const boundary = '----AuramixBoundary' + Date.now()
    const CRLF = '\r\n'

    const buffer = typeof fileBuffer === 'string'
        ? Buffer.from(fileBuffer, 'base64')
        : fileBuffer

    const parts = []
    parts.push(Buffer.from('--' + boundary + CRLF))
    parts.push(Buffer.from('Content-Disposition: form-data; name="file"; filename="' + filename + '"' + CRLF))
    parts.push(Buffer.from('Content-Type: application/octet-stream' + CRLF + CRLF))
    parts.push(buffer)
    parts.push(Buffer.from(CRLF))
    parts.push(Buffer.from('--' + boundary + CRLF))
    parts.push(Buffer.from('Content-Disposition: form-data; name="type"' + CRLF + CRLF))
    parts.push(Buffer.from(fileType))
    parts.push(Buffer.from(CRLF))
    parts.push(Buffer.from('--' + boundary + '--' + CRLF))

    const body = Buffer.concat(parts)

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'multipart/form-data; boundary=' + boundary,
                'X-Internal-Api-Key': INTERNAL_API_KEY,
            },
            body,
            signal: AbortSignal.timeout(30000),
        })
        const json = await response.json()
        if (!response.ok) {
            return { success: false, error: json.message || 'OSS upload failed HTTP ' + response.status }
        }
        return { success: true, data: json.data }
    } catch (err) {
        if (err.name === 'TimeoutError' || err.name === 'AbortError') {
            return { success: false, error: 'OSS upload timed out (' + REMOTE_BASE_URL + ')' }
        }
        return { success: false, error: 'Cannot connect to backend (' + REMOTE_BASE_URL + '): ' + err.message }
    }
}

// ========== Playlist Management API ==========

async function fetchAllPlaylists(params) {
    params = params || {}
    const token = params.token
    const pageNum = params.pageNum || 1
    const pageSize = params.pageSize || 100
    const qs = new URLSearchParams({ pageNum, pageSize }).toString()
    return request('/api/user/playlists?' + qs, { token })
}

async function fetchPlaylistDetail(playlistId, token) {
    return request('/api/user/playlists/' + playlistId, { token })
}

async function createPlaylist(body, token) {
    return request('/api/user/playlists', { method: 'POST', body, token })
}

async function updatePlaylist(playlistId, body, token) {
    return request('/api/user/playlists/' + playlistId, { method: 'PUT', body, token })
}

async function savePlaylist(playlistId, info, coverFile, token) {
    const url = REMOTE_BASE_URL + '/api/user/playlists/' + playlistId
    const formData = new FormData()

    formData.append('info', new Blob([JSON.stringify(info)], { type: 'application/json' }))

    if (coverFile && coverFile.buffer && coverFile.buffer.length > 0) {
        const blob = new Blob([coverFile.buffer], { type: coverFile.mimetype || 'image/jpeg' })
        formData.append('cover', blob, coverFile.originalname || 'cover.jpg')
    }

    const headers = {}
    if (token) {
        headers['Authorization'] = 'Bearer ' + token
    }

    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers,
            body: formData,
            signal: AbortSignal.timeout(15000),
        })
        const json = await response.json()
        if (!response.ok) {
            return { success: false, error: json.message || 'HTTP ' + response.status, status: response.status }
        }
        return { success: true, data: json.data, message: json.message }
    } catch (err) {
        if (err.name === 'TimeoutError' || err.name === 'AbortError') {
            return { success: false, error: 'Save playlist timed out. Is the Java backend running?' }
        }
        return { success: false, error: 'Cannot connect to backend: ' + err.message }
    }
}

async function deletePlaylist(playlistId, token) {
    return request('/api/user/playlists/' + playlistId, { method: 'DELETE', token })
}

module.exports = {
    REMOTE_BASE_URL,
    request,
    uploadToOss,
    fetchAllPlaylists,
    fetchPlaylistDetail,
    createPlaylist,
    updatePlaylist,
    savePlaylist,
    deletePlaylist,
}
