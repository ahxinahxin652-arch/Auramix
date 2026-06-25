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
    if (res.code === 200) {
      return res.data as any
    }

    // 4012: token 失效,清状态 + 跳登录
    if (res.code === 4012) {
      const auth = useAuthStore()
      auth.clearAuth()
      router.push({ path: '/login', query: { expired: '1' } })
      return Promise.reject(new Error(res.message || '会话已过期'))
    }

    // 4031: 账号停用,清状态 + 跳登录
    if (res.code === 4031) {
      const auth = useAuthStore()
      auth.clearAuth()
      router.push({ path: '/login', query: { disabled: '1' } })
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
    ElMessage.error('网络异常,请检查连接')
    return Promise.reject(error)
  },
)

export default service
