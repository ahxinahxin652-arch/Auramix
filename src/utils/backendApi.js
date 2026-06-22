const BACKEND_URL = 'http://localhost:8080'

export async function backendFetch(url, options = {}) {
  const token = localStorage.getItem('auramix_token')
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${BACKEND_URL}${url}`, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  })

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}))
    throw new Error(errData.message || `请求失败: ${response.status}`)
  }

  const result = await response.json()
  if (result.code !== 200) {
    throw new Error(result.message || '业务请求失败')
  }
  return result.data
}
