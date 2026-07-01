import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'
import { useAuthStore } from '@/store/modules/auth'

export interface ApiResponse<T = unknown> {
  code: number
  data: T
  message: string
}

const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
})

// 防止并发请求重复触发登出跳转
let isRedirecting = false

/** 统一处理凭证过期：清状态 + 提示 + 跳登录（防重复） */
function handleSessionExpired(query: Record<string, string>, message: string) {
  if (isRedirecting) return
  isRedirecting = true
  const auth = useAuthStore()
  auth.clearAuth()
  ElMessage.warning(message)
  router.push({ path: '/login', query }).finally(() => {
    isRedirecting = false
  })
}

// 请求拦截器:自动注入 Bearer token
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const auth = useAuthStore()
    if (auth.token) {
      config.headers.set('Authorization', `Bearer ${auth.token}`)
    }

    // 容错纠正：若接口 url 中已包含 /api，与 baseURL 重叠会导致双重 /api/api
    if (config.url && config.url.startsWith('/api')) {
      config.url = config.url.substring(4)
    }

    console.log('[Axios Request] url:', config.url, 'baseURL:', config.baseURL)
    return config
  },
  (error) => Promise.reject(error),
)

// 响应拦截器:统一处理业务码 + 4012/4031/5000
service.interceptors.response.use(
  (response) => {
    const res = response.data as ApiResponse
    if (res.code === 200 || res.code === 0) {
      return res.data as any
    }

    // 4012: token 失效,清状态 + 跳登录
    if (res.code === 4012) {
      handleSessionExpired({ expired: '1' }, res.message || '会话已过期,请重新登录')
      return Promise.reject(new Error(res.message || '会话已过期'))
    }

    // 4031: 账号停用,清状态 + 跳登录
    if (res.code === 4031) {
      handleSessionExpired({ disabled: '1' }, res.message || '账号已被停用')
      return Promise.reject(new Error(res.message || '账号已被停用'))
    }

    // 5000: 服务异常,统一改写 message 避免泄漏后端细节
    if (res.code === 5000) {
      const msg = '服务异常,请稍后重试'
      ElMessage.error(msg)
      return Promise.reject(new Error(msg))
    }

    // 其他业务码:透传 message
    const msg = res.message || '操作失败'
    ElMessage.error(msg)
    return Promise.reject(new Error(msg))
  },
  (error) => {
    // HTTP 401: 凭证无效或过期（后端未返回标准业务码时的兜底）
    if (error.response?.status === 401) {
      handleSessionExpired({ expired: '1' }, '登录凭证已过期,请重新登录')
      return Promise.reject(new Error('登录凭证已过期'))
    }

    ElMessage.error('网络异常,请检查连接')
    return Promise.reject(error)
  },
)

export default service
