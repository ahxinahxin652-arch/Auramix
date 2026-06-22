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
  const headers = { ...options.headers }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  // Determine body and content-type
  let body = options.body
  const isJsonBody = body && !(
    body instanceof FormData || 
    body instanceof Blob || 
    body instanceof ArrayBuffer || 
    body instanceof URLSearchParams
  )

  if (isJsonBody) {
    headers['Content-Type'] = 'application/json'
    body = JSON.stringify(body)
  }

  const response = await fetch(`${BACKEND_URL}${url}`, {
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
