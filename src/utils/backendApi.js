export class ApiError extends Error {
  constructor(message, status, code, data) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.data = data
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError)
    }
  }
}

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

export async function backendFetch(url, options = {}) {
  let token = null
  if (typeof localStorage !== 'undefined') {
    try {
      token = localStorage.getItem('auramix_token')
    } catch (e) {
      console.warn('Unable to access localStorage:', e)
    }
  }
  
  const headers = new Headers(options.headers || {})
  
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  // Determine body type and JSON content-type
  let body = options.body
  const isJsonBody = body && typeof body !== 'string' && !(
    body instanceof FormData || 
    body instanceof Blob || 
    body instanceof ArrayBuffer || 
    body instanceof URLSearchParams ||
    ArrayBuffer.isView(body) ||
    (typeof ReadableStream !== 'undefined' && body instanceof ReadableStream)
  )

  if (isJsonBody) {
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json')
    }
    body = JSON.stringify(body)
  }

  // Normalize URL slash concatenation or support absolute URLs
  let fullUrl = url
  if (!/^https?:\/\//i.test(url)) {
    const cleanUrl = url.startsWith('/') ? url : `/${url}`
    const cleanBase = BACKEND_URL.endsWith('/') ? BACKEND_URL.slice(0, -1) : BACKEND_URL
    fullUrl = `${cleanBase}${cleanUrl}`
  }

  const fetchOptions = { ...options, headers }
  if (body != null) {
    fetchOptions.body = body
  }

  const response = await fetch(fullUrl, fetchOptions)

  if (!response.ok) {
    let errData = {}
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      errData = await response.json().catch(() => ({}))
    }
    throw new ApiError(errData.message || `请求失败: ${response.status}`, response.status, errData.code)
  }

  let result = {}
  if (response.status !== 204) {
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      result = await response.json().catch(() => ({}))
    }
  }

  // Handle business result wrapper (e.g. { code, message, data })
  if (result.code !== undefined) {
    if (result.code !== 200) {
      throw new ApiError(result.message || '业务请求失败', response.status, result.code, result.data)
    }
    return result.data
  }
  
  // Return raw JSON if there's no result code wrapper
  return result
}
