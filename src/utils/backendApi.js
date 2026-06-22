export class ApiError extends Error {
  constructor(message, status, code, data) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.data = data
  }
}

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

export async function backendFetch(url, options = {}) {
  const token = localStorage.getItem('auramix_token')
  
  // Normalize header keys case-insensitively
  const headers = {}
  if (options.headers) {
    for (const [key, val] of Object.entries(options.headers)) {
      headers[key] = val
    }
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  // Determine body type and JSON content-type
  let body = options.body
  const isJsonBody = body && typeof body !== 'string' && !(
    body instanceof FormData || 
    body instanceof Blob || 
    body instanceof ArrayBuffer || 
    body instanceof URLSearchParams ||
    ArrayBuffer.isView(body)
  )

  if (isJsonBody) {
    // Only set header if not already specified case-insensitively
    const hasContentType = Object.keys(headers).some(h => h.toLowerCase() === 'content-type')
    if (!hasContentType) {
      headers['Content-Type'] = 'application/json'
    }
    body = JSON.stringify(body)
  }

  // Normalize URL slash concatenation
  const cleanUrl = url.startsWith('/') ? url : `/${url}`
  const cleanBase = BACKEND_URL.endsWith('/') ? BACKEND_URL.slice(0, -1) : BACKEND_URL
  const fullUrl = `${cleanBase}${cleanUrl}`

  const response = await fetch(fullUrl, {
    ...options,
    headers,
    body
  })

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
      result = await response.json()
    }
  }

  // Handle business result
  if (result.code !== undefined && result.code !== 200) {
    throw new ApiError(result.message || '业务请求失败', response.status, result.code, result.data)
  }
  return result.data
}
