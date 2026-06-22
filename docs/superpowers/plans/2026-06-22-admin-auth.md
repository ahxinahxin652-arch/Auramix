# 管理员认证功能 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现管理员端的登录、登出、获取个人信息三个接口的前端工程化封装,以及登录页 + AdminLayout + Home 三个 UI 模块,使得管理员能够登录、看到自己的信息、退出。

**Architecture:** 标准分层(API → Store → Axios 拦截器 → Views/Layout),配合 Vue Router 守卫做登录态校验 + 启动时 `/me` 兜底校验。token 持久化到 localStorage,4012/4031 由拦截器统一处理并跳登录。

**Tech Stack:** Vue 3.5 + TypeScript 5.6 + Pinia 3 + pinia-plugin-persistedstate + Vue Router 4 + Axios 1.7 + Element Plus 2.8 + Vitest 2 + @vue/test-utils 2 + happy-dom 15

---

## 文件总览

| 文件 | 状态 | 职责 |
|---|---|---|
| `src/types/admin.ts` | 新建 | 共享类型(AdminProfile / LoginPayload / LoginResult) |
| `src/api/admin/auth.ts` | 新建 | 3 个接口的纯函数封装 |
| `src/api/admin/auth.spec.ts` | 新建 | API 单元测试 |
| `src/store/modules/auth.ts` | 新建 | Pinia store(token/profile/loading + actions + 持久化) |
| `src/store/modules/auth.spec.ts` | 新建 | Store 单元测试 |
| `src/store/index.ts` | 修改 | 注册 pinia-plugin-persistedstate |
| `src/utils/request.ts` | 修改 | 添加请求 / 响应拦截器 |
| `src/utils/request.spec.ts` | 新建 | 拦截器单元测试 |
| `src/permission.ts` | 新建 | 路由守卫 |
| `src/permission.spec.ts` | 新建 | 守卫单元测试 |
| `src/__tests__/integration/auth-flow.spec.ts` | 新建 | 集成测试(3 个) |
| `src/router/routes.ts` | 修改 | 受保护页加 `meta.requiresAuth` |
| `src/router/index.ts` | 修改 | 注册 permission 守卫 |
| `src/main.ts` | 修改 | (无变化,确认现有即可) |
| `src/layout/AdminLayout.vue` | 新建 | 顶栏(站名 + 用户下拉)+ `<router-view />` |
| `src/views/login/Index.vue` | 重写 | 登录卡片 + 表单 + 错误展示 + redirect 处理 |
| `src/views/home/Index.vue` | 重写 | 欢迎语 + profile 描述列表 |
| `vite.config.ts` | 修改 | 添加 `test` 块 |
| `package.json` | 修改 | 添加 test scripts 和测试依赖 |

---

## Task 0: 安装测试依赖 + 配置 Vitest

**Files:**
- Modify: `package.json`
- Modify: `vite.config.ts`

- [ ] **Step 1: 安装测试依赖**

```bash
cd "C:/Users/17599/Desktop/Auramix/frontend"
npm install -D vitest@^2.1.0 @vue/test-utils@^2.4.6 happy-dom@^15.0.0
```

Expected: 3 个包成功安装,`package.json` 的 `devDependencies` 中出现对应条目。

- [ ] **Step 2: 修改 `package.json` 加 test 脚本**

把 `scripts` 段改为:

```json
"scripts": {
  "dev": "vite",
  "build": "vue-tsc -b && vite build",
  "build:prod": "vue-tsc -b && vite build --mode production",
  "preview": "vite preview",
  "type-check": "vue-tsc --noEmit",
  "lint": "eslint .",
  "lint:fix": "eslint . --fix",
  "format": "prettier --write \"**/*.{js,ts,vue,scss,json,md}\"",
  "test": "vitest run",
  "test:watch": "vitest",
  "test:coverage": "vitest run --coverage"
},
```

- [ ] **Step 3: 修改 `vite.config.ts` 加 test 块**

把 `vite.config.ts` 完整覆盖为:

```ts
/// <reference types="vitest" />
import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  // eslint-disable-next-line node/prefer-global/process
  const env = loadEnv(mode, process.cwd(), '')
  const stylesDir = fileURLToPath(new URL('./src/styles', import.meta.url))

  return {
    plugins: [
      vue(),
      AutoImport({
        imports: ['vue', 'vue-router', 'pinia'],
        resolvers: [ElementPlusResolver()],
        dts: 'src/auto-imports.d.ts',
        eslintrc: {
          enabled: true,
        },
      }),
      Components({
        resolvers: [ElementPlusResolver()],
        dts: 'src/components.d.ts',
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
          loadPaths: [stylesDir],
          additionalData: (source: string) => {
            // variables.scss 自身不能再 @use "variables"（会 module loop）
            // 用内容签名检测（不依赖 filename，因为 modern-compiler 可能不传）
            if (source.includes('$primary-color:')) {
              return source
            }
            return `@use "variables" as *;\n${source}`
          },
        },
      },
    },
    server: {
      port: 5173,
      host: '0.0.0.0',
      open: false,
      proxy: {
        '/api': {
          target: env.VITE_PROXY_TARGET || 'http://localhost:8080',
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      target: 'es2015',
      cssCodeSplit: true,
      chunkSizeWarningLimit: 1500,
    },
    test: {
      environment: 'happy-dom',
      globals: true,
      include: ['src/**/*.{test,spec}.ts'],
    },
  }
})
```

- [ ] **Step 4: 验证 vitest 跑得起来**

```bash
cd "C:/Users/17599/Desktop/Auramix/frontend"
npx vitest run --reporter=basic
```

Expected: 命令执行成功,无测试文件时显示 `No test files found`(退出码 0 或 1 都正常,因为没测试)。

- [ ] **Step 5: 提交**

```bash
cd "C:/Users/17599/Desktop/Auramix/frontend"
git add package.json package-lock.json vite.config.ts
git commit -m "chore: 配置 vitest + 安装测试依赖"
```

---

## Task 1: 共享类型

**Files:**
- Create: `src/types/admin.ts`

- [ ] **Step 1: 创建类型文件**

```ts
// src/types/admin.ts
export interface AdminProfile {
  id: number
  username: string
  email: string
  isRoot: 0 | 1
  status: 0 | 1
  lastLoginTime: string | null
  lastLoginIp: string | null
  createdAt: string
}

export interface LoginPayload {
  username: string
  password: string
}

export interface LoginResult {
  token: string
  expiresAt: string
  profile: AdminProfile
}
```

- [ ] **Step 2: 验证类型检查通过**

```bash
cd "C:/Users/17599/Desktop/Auramix/frontend"
npm run type-check
```

Expected: 退出码 0,无报错。

- [ ] **Step 3: 提交**

```bash
cd "C:/Users/17599/Desktop/Auramix/frontend"
git add src/types/admin.ts
git commit -m "feat(types): 新增 AdminProfile / LoginPayload / LoginResult 类型"
```

---

## Task 2: API 层(TDD)

**Files:**
- Create: `src/api/admin/auth.ts`
- Create: `src/api/admin/auth.spec.ts`

- [ ] **Step 1: 写失败测试**

```ts
// src/api/admin/auth.spec.ts
import { describe, it, expect, vi } from 'vitest'
import request from '@/utils/request'
import { loginApi, logoutApi, fetchProfileApi } from './auth'

vi.mock('@/utils/request', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}))

describe('auth api', () => {
  it('loginApi POSTs to /admin/auth/login with payload', async () => {
    const payload = { username: 'admin', password: 'pass' }
    const mockResult = {
      token: 'tok',
      expiresAt: '2026-06-22T12:00:00',
      profile: { id: 1, username: 'admin', email: 'a@b.c', isRoot: 1, status: 1, lastLoginTime: null, lastLoginIp: null, createdAt: '2026-06-01' },
    }
    vi.mocked(request.post).mockResolvedValue(mockResult)

    const result = await loginApi(payload)

    expect(request.post).toHaveBeenCalledWith('/admin/auth/login', payload)
    expect(result).toEqual(mockResult)
  })

  it('logoutApi POSTs to /admin/auth/logout with no payload', async () => {
    vi.mocked(request.post).mockResolvedValue(undefined)

    await logoutApi()

    expect(request.post).toHaveBeenCalledWith('/admin/auth/logout')
  })

  it('fetchProfileApi GETs /admin/auth/me', async () => {
    const profile = { id: 1, username: 'admin', email: 'a@b.c', isRoot: 1, status: 1, lastLoginTime: null, lastLoginIp: null, createdAt: '2026-06-01' }
    vi.mocked(request.get).mockResolvedValue(profile)

    const result = await fetchProfileApi()

    expect(request.get).toHaveBeenCalledWith('/admin/auth/me')
    expect(result).toEqual(profile)
  })

  it('fetchProfileApi returns null when backend returns null', async () => {
    vi.mocked(request.get).mockResolvedValue(null)

    const result = await fetchProfileApi()

    expect(result).toBeNull()
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

```bash
cd "C:/Users/17599/Desktop/Auramix/frontend"
npx vitest run src/api/admin/auth.spec.ts
```

Expected: 4 个测试全部 FAIL,提示 `Cannot find module './auth'` 或类似。

- [ ] **Step 3: 实现 API**

```ts
// src/api/admin/auth.ts
import request from '@/utils/request'
import type { AdminProfile, LoginPayload, LoginResult } from '@/types/admin'

/**
 * 管理员登录
 * POST /api/admin/auth/login
 */
export function loginApi(payload: LoginPayload): Promise<LoginResult> {
  return request.post<unknown, LoginResult>('/admin/auth/login', payload)
}

/**
 * 管理员登出
 * POST /api/admin/auth/logout
 */
export function logoutApi(): Promise<void> {
  return request.post('/admin/auth/logout')
}

/**
 * 获取当前管理员个人信息
 * GET /api/admin/auth/me
 * 返 null 表示未登录
 */
export function fetchProfileApi(): Promise<AdminProfile | null> {
  return request.get<unknown, AdminProfile | null>('/admin/auth/me')
}
```

- [ ] **Step 4: 运行测试确认通过**

```bash
cd "C:/Users/17599/Desktop/Auramix/frontend"
npx vitest run src/api/admin/auth.spec.ts
```

Expected: 4 个测试全部 PASS。

- [ ] **Step 5: 提交**

```bash
cd "C:/Users/17599/Desktop/Auramix/frontend"
git add src/api/admin/auth.ts src/api/admin/auth.spec.ts
git commit -m "feat(api): 封装管理员认证 3 个接口 + 单元测试"
```

---

## Task 3: Pinia Store(TDD)

**Files:**
- Create: `src/store/modules/auth.ts`
- Create: `src/store/modules/auth.spec.ts`

- [ ] **Step 1: 写失败测试**

```ts
// src/store/modules/auth.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from './auth'
import * as authApi from '@/api/admin/auth'

vi.mock('@/api/admin/auth', () => ({
  loginApi: vi.fn(),
  logoutApi: vi.fn(),
  fetchProfileApi: vi.fn(),
}))

const fakeProfile = {
  id: 1,
  username: 'admin',
  email: 'a@b.c',
  isRoot: 1 as const,
  status: 1 as const,
  lastLoginTime: null,
  lastLoginIp: null,
  createdAt: '2026-06-01',
}

describe('auth store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('has empty token and null profile', () => {
      const store = useAuthStore()
      expect(store.token).toBe('')
      expect(store.profile).toBeNull()
      expect(store.loading).toBe(false)
    })

    it('isLoggedIn is false initially', () => {
      const store = useAuthStore()
      expect(store.isLoggedIn).toBe(false)
    })

    it('isLoggedIn is true when token is set', () => {
      const store = useAuthStore()
      store.token = 'abc'
      expect(store.isLoggedIn).toBe(true)
    })
  })

  describe('login', () => {
    it('writes state and returns result on success', async () => {
      vi.mocked(authApi.loginApi).mockResolvedValue({
        token: 'tok',
        expiresAt: '2026-06-22T12:00:00',
        profile: fakeProfile,
      })
      const store = useAuthStore()
      const result = await store.login({ username: 'admin', password: 'pass' })

      expect(authApi.loginApi).toHaveBeenCalledWith({ username: 'admin', password: 'pass' })
      expect(store.token).toBe('tok')
      expect(store.profile).toEqual(fakeProfile)
      expect(result.token).toBe('tok')
    })

    it('toggles loading during login', async () => {
      let resolveLogin: (v: any) => void = () => {}
      vi.mocked(authApi.loginApi).mockReturnValue(new Promise((r) => { resolveLogin = r }) as any)
      const store = useAuthStore()
      const promise = store.login({ username: 'a', password: 'b' })
      expect(store.loading).toBe(true)
      resolveLogin({ token: 't', expiresAt: 'e', profile: fakeProfile })
      await promise
      expect(store.loading).toBe(false)
    })

    it('clears loading on login failure', async () => {
      vi.mocked(authApi.loginApi).mockRejectedValue(new Error('wrong'))
      const store = useAuthStore()
      await expect(store.login({ username: 'a', password: 'b' })).rejects.toThrow('wrong')
      expect(store.loading).toBe(false)
      expect(store.token).toBe('')
    })
  })

  describe('logout', () => {
    it('calls logoutApi and clears state', async () => {
      vi.mocked(authApi.logoutApi).mockResolvedValue(undefined)
      const store = useAuthStore()
      store.token = 't'
      store.profile = fakeProfile

      await store.logout()

      expect(authApi.logoutApi).toHaveBeenCalled()
      expect(store.token).toBe('')
      expect(store.profile).toBeNull()
    })

    it('clears state even when logoutApi rejects', async () => {
      vi.mocked(authApi.logoutApi).mockRejectedValue(new Error('network'))
      const store = useAuthStore()
      store.token = 't'

      await store.logout()

      expect(store.token).toBe('')
    })
  })

  describe('fetchProfile', () => {
    it('writes profile on success', async () => {
      vi.mocked(authApi.fetchProfileApi).mockResolvedValue(fakeProfile)
      const store = useAuthStore()

      await store.fetchProfile()

      expect(store.profile).toEqual(fakeProfile)
    })

    it('sets profile to null when api returns null', async () => {
      vi.mocked(authApi.fetchProfileApi).mockResolvedValue(null)
      const store = useAuthStore()
      store.profile = fakeProfile

      await store.fetchProfile()

      expect(store.profile).toBeNull()
    })
  })

  describe('clearAuth', () => {
    it('does not call any api', async () => {
      const store = useAuthStore()
      store.token = 't'
      store.profile = fakeProfile

      store.clearAuth()

      expect(authApi.loginApi).not.toHaveBeenCalled()
      expect(authApi.logoutApi).not.toHaveBeenCalled()
      expect(authApi.fetchProfileApi).not.toHaveBeenCalled()
      expect(store.token).toBe('')
      expect(store.profile).toBeNull()
    })
  })

  describe('persistence', () => {
    it('persists token and profile to localStorage', async () => {
      vi.mocked(authApi.loginApi).mockResolvedValue({
        token: 'persist-tok',
        expiresAt: '2026-06-22T12:00:00',
        profile: fakeProfile,
      })
      const store = useAuthStore()
      await store.login({ username: 'a', password: 'b' })

      const stored = localStorage.getItem('auramix-auth')
      expect(stored).toBeTruthy()
      const parsed = JSON.parse(stored!)
      expect(parsed.token).toBe('persist-tok')
      expect(parsed.profile).toEqual(fakeProfile)
    })
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

```bash
cd "C:/Users/17599/Desktop/Auramix/frontend"
npx vitest run src/store/modules/auth.spec.ts
```

Expected: 所有测试 FAIL,提示 `Cannot find module './auth'`。

- [ ] **Step 3: 实现 Store**

```ts
// src/store/modules/auth.ts
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { AdminProfile, LoginPayload } from '@/types/admin'
import { fetchProfileApi, loginApi, logoutApi } from '@/api/admin/auth'

export const useAuthStore = defineStore(
  'auth',
  () => {
    // state
    const token = ref('')
    const profile = ref<AdminProfile | null>(null)
    const loading = ref(false)

    // getters
    const isLoggedIn = computed(() => token.value !== '')

    // actions
    async function login(payload: LoginPayload) {
      loading.value = true
      try {
        const result = await loginApi(payload)
        token.value = result.token
        profile.value = result.profile
        return result
      }
      finally {
        loading.value = false
      }
    }

    async function logout() {
      try {
        await logoutApi()
      }
      catch {
        // 忽略错误,无论成败都清本地
      }
      finally {
        clearAuth()
      }
    }

    async function fetchProfile() {
      const p = await fetchProfileApi()
      profile.value = p
      return p
    }

    function clearAuth() {
      token.value = ''
      profile.value = null
    }

    return {
      token,
      profile,
      loading,
      isLoggedIn,
      login,
      logout,
      fetchProfile,
      clearAuth,
    }
  },
  {
    persist: {
      key: 'auramix-auth',
      storage: localStorage,
      paths: ['token', 'profile'],
    },
  },
)
```

- [ ] **Step 4: 修改 `src/store/index.ts` 注册持久化插件**

```ts
// src/store/index.ts
import { createPinia } from 'pinia'
import piniaPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(piniaPersistedstate)

export default pinia
```

- [ ] **Step 5: 运行测试确认通过**

```bash
cd "C:/Users/17599/Desktop/Auramix/frontend"
npx vitest run src/store/modules/auth.spec.ts
```

Expected: 所有测试 PASS(约 12 个)。

- [ ] **Step 6: 提交**

```bash
cd "C:/Users/17599/Desktop/Auramix/frontend"
git add src/store/modules/auth.ts src/store/modules/auth.spec.ts src/store/index.ts
git commit -m "feat(store): 新增 auth Pinia store + 持久化 + 单元测试"
```

---

## Task 4: Axios 拦截器(TDD)

**Files:**
- Modify: `src/utils/request.ts`
- Create: `src/utils/request.spec.ts`

- [ ] **Step 1: 写失败测试**

```ts
// src/utils/request.spec.ts
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/store/modules/auth'

// 必须在 import request 之前 mock router,避免循环
const routerPush = vi.fn()
vi.mock('@/router', () => ({
  default: { push: routerPush },
}))

// 必须在 import request 之前 mock element-plus,避免副作用
vi.mock('element-plus', () => ({
  ElMessage: { error: vi.fn() },
}))

import service from './request'

function mockReply(data: unknown, status = 200) {
  return {
    data,
    status,
    statusText: 'OK',
    headers: {},
    config: { headers: {} } as any,
  }
}

describe('request interceptors', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    routerPush.mockClear()
    // 替换 adapter,避免真实网络请求
    service.defaults.adapter = vi.fn() as any
  })

  describe('request interceptor', () => {
    it('adds Authorization header when token is set', async () => {
      const auth = useAuthStore()
      auth.token = 'my-token'
      const adapter = vi.fn().mockResolvedValue(mockReply({ code: 200, data: null, message: 'ok' }))
      service.defaults.adapter = adapter

      await service.get('/test')

      const callArg = adapter.mock.calls[0][0]
      expect(callArg.headers.Authorization).toBe('Bearer my-token')
    })

    it('does not add Authorization header when no token', async () => {
      const adapter = vi.fn().mockResolvedValue(mockReply({ code: 200, data: null, message: 'ok' }))
      service.defaults.adapter = adapter

      await service.get('/test')

      const callArg = adapter.mock.calls[0][0]
      expect(callArg.headers.Authorization).toBeUndefined()
    })
  })

  describe('response interceptor', () => {
    it('returns data on code 200', async () => {
      service.defaults.adapter = vi.fn().mockResolvedValue(
        mockReply({ code: 200, data: { foo: 1 }, message: 'ok' }),
      )

      const result = await service.get('/test')

      expect(result).toEqual({ foo: 1 })
    })

    it('clears auth and redirects on 4012', async () => {
      const auth = useAuthStore()
      auth.token = 'old-tok'
      service.defaults.adapter = vi.fn().mockResolvedValue(
        mockReply({ code: 4012, data: null, message: '会话已过期' }),
      )

      await expect(service.get('/test')).rejects.toThrow('会话已过期')
      expect(auth.token).toBe('')
      expect(routerPush).toHaveBeenCalledWith({
        path: '/login',
        query: { expired: '1' },
      })
    })

    it('clears auth and redirects on 4031', async () => {
      const auth = useAuthStore()
      auth.token = 'old-tok'
      service.defaults.adapter = vi.fn().mockResolvedValue(
        mockReply({ code: 4031, data: null, message: '账号已被停用' }),
      )

      await expect(service.get('/test')).rejects.toThrow('账号已被停用')
      expect(auth.token).toBe('')
      expect(routerPush).toHaveBeenCalledWith({
        path: '/login',
        query: { disabled: '1' },
      })
    })

    it('rewrites 5000 message to 服务异常', async () => {
      const { ElMessage } = await import('element-plus')
      service.defaults.adapter = vi.fn().mockResolvedValue(
        mockReply({ code: 5000, data: null, message: 'SQL exception xyz' }),
      )

      await expect(service.get('/test')).rejects.toThrow('服务异常')
      expect(ElMessage.error).toHaveBeenCalledWith('服务异常,请稍后重试')
    })

    it('passes through 400/4011 message', async () => {
      const { ElMessage } = await import('element-plus')
      service.defaults.adapter = vi.fn().mockResolvedValue(
        mockReply({ code: 4011, data: null, message: '用户名或密码错误' }),
      )

      await expect(service.post('/test', {})).rejects.toThrow('用户名或密码错误')
      expect(ElMessage.error).toHaveBeenCalledWith('用户名或密码错误')
    })

    it('handles network error', async () => {
      const { ElMessage } = await import('element-plus')
      service.defaults.adapter = vi.fn().mockRejectedValue(new Error('Network Error'))

      await expect(service.get('/test')).rejects.toThrow()
      expect(ElMessage.error).toHaveBeenCalledWith('网络异常,请检查连接')
    })
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

```bash
cd "C:/Users/17599/Desktop/Auramix/frontend"
npx vitest run src/utils/request.spec.ts
```

Expected: 大部分测试 FAIL(因为当前 request.ts 还没有拦截器)。如果全部 PASS,说明测试本身有问题,需要检查。

- [ ] **Step 3: 实现拦截器**

把 `src/utils/request.ts` 完整覆盖为:

```ts
// src/utils/request.ts
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
```

- [ ] **Step 4: 运行测试确认通过**

```bash
cd "C:/Users/17599/Desktop/Auramix/frontend"
npx vitest run src/utils/request.spec.ts
```

Expected: 8 个测试全部 PASS。

- [ ] **Step 5: 提交**

```bash
cd "C:/Users/17599/Desktop/Auramix/frontend"
git add src/utils/request.ts src/utils/request.spec.ts
git commit -m "feat(utils): request.ts 加请求/响应拦截器 + 单元测试"
```

---

## Task 5: 路由守卫(TDD)

**Files:**
- Create: `src/permission.ts`
- Create: `src/permission.spec.ts`

- [ ] **Step 1: 写失败测试**

```ts
// src/permission.spec.ts
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { createRouter, createMemoryHistory, type Router } from 'vue-router'
import { setupPermissionGuard } from './permission'

vi.mock('@/api/admin/auth', () => ({
  fetchProfileApi: vi.fn(),
}))

import { fetchProfileApi } from '@/api/admin/auth'

const routes = [
  { path: '/', redirect: '/home' },
  {
    path: '/home',
    component: { template: '<div>home</div>' },
    meta: { requiresAuth: true },
  },
  { path: '/login', component: { template: '<div>login</div>' } },
  { path: '/404', component: { template: '<div>404</div>' } },
]

function makeRouter(): Router {
  return createRouter({ history: createMemoryHistory(), routes })
}

describe('permission guard', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('redirects to /login when protected page accessed without auth', async () => {
    const router = makeRouter()
    setupPermissionGuard(router)
    router.push('/home')
    await router.isReady()

    expect(router.currentRoute.value.path).toBe('/login')
    expect(router.currentRoute.value.query.redirect).toBe('/home')
  })

  it('redirects to /home when /login accessed while logged in', async () => {
    const router = makeRouter()
    setupPermissionGuard(router)
    router.push('/login')
    await router.isReady()

    const { useAuthStore } = await import('@/store/modules/auth')
    const auth = useAuthStore()
    auth.token = 'tok'
    auth.profile = {
      id: 1, username: 'u', email: 'e', isRoot: 1, status: 1,
      lastLoginTime: null, lastLoginIp: null, createdAt: '2026-06-01',
    }
    await router.push('/login')

    expect(router.currentRoute.value.path).toBe('/home')
  })

  it('fetches /me when entering protected page with token but no profile', async () => {
    vi.mocked(fetchProfileApi).mockResolvedValue({
      id: 1, username: 'u', email: 'e', isRoot: 1, status: 1,
      lastLoginTime: null, lastLoginIp: null, createdAt: '2026-06-01',
    })
    const router = makeRouter()
    setupPermissionGuard(router)
    router.push('/home')
    await router.isReady()

    const { useAuthStore } = await import('@/store/modules/auth')
    const auth = useAuthStore()
    auth.token = 'tok'
    await router.push('/home')
    await router.isReady()

    expect(fetchProfileApi).toHaveBeenCalled()
    expect(auth.profile).toEqual({
      id: 1, username: 'u', email: 'e', isRoot: 1, status: 1,
      lastLoginTime: null, lastLoginIp: null, createdAt: '2026-06-01',
    })
  })

  it('redirects to /login when /me fails', async () => {
    vi.mocked(fetchProfileApi).mockRejectedValue(new Error('expired'))
    const router = makeRouter()
    setupPermissionGuard(router)
    router.push('/home')
    await router.isReady()

    const { useAuthStore } = await import('@/store/modules/auth')
    const auth = useAuthStore()
    auth.token = 'tok'
    await router.push('/home')
    await router.isReady()

    expect(router.currentRoute.value.path).toBe('/login')
  })

  it('allows public pages without auth', async () => {
    const router = makeRouter()
    setupPermissionGuard(router)
    await router.push('/login')
    await router.isReady()

    expect(router.currentRoute.value.path).toBe('/login')
  })

  it('allows protected page when fully authenticated with profile', async () => {
    const router = makeRouter()
    setupPermissionGuard(router)
    router.push('/home')
    await router.isReady()

    const { useAuthStore } = await import('@/store/modules/auth')
    const auth = useAuthStore()
    auth.token = 'tok'
    auth.profile = {
      id: 1, username: 'u', email: 'e', isRoot: 1, status: 1,
      lastLoginTime: null, lastLoginIp: null, createdAt: '2026-06-01',
    }
    await router.push('/home')
    await router.isReady()

    expect(router.currentRoute.value.path).toBe('/home')
    expect(fetchProfileApi).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

```bash
cd "C:/Users/17599/Desktop/Auramix/frontend"
npx vitest run src/permission.spec.ts
```

Expected: 所有测试 FAIL,提示 `Cannot find module './permission'`。

- [ ] **Step 3: 实现守卫**

```ts
// src/permission.ts
import type { Router } from 'vue-router'
import { useAuthStore } from '@/store/modules/auth'

/**
 * 注册全局路由守卫
 * - 受保护页 + 未登录 → 跳 /login?redirect=原路径
 * - 已登录访问 /login → 跳 /home
 * - 受保护页 + 有 token 但无 profile → 拉一次 /me
 */
export function setupPermissionGuard(router: Router) {
  router.beforeEach(async (to) => {
    const auth = useAuthStore()

    // 1. 受保护页 + 未登录 → 跳 /login
    if (to.meta.requiresAuth && !auth.isLoggedIn) {
      return { path: '/login', query: { redirect: to.fullPath } }
    }

    // 2. 已登录访问 /login → 跳 /home
    if (to.path === '/login' && auth.isLoggedIn) {
      return { path: '/home' }
    }

    // 3. 受保护页 + 已登录 + 无 profile → 拉一次 /me
    if (to.meta.requiresAuth && auth.isLoggedIn && !auth.profile) {
      try {
        await auth.fetchProfile()
      }
      catch {
        // 4012/4031 已被拦截器处理并跳转,这里只兜底
        return { path: '/login' }
      }
    }

    return true
  })
}
```

- [ ] **Step 4: 运行测试确认通过**

```bash
cd "C:/Users/17599/Desktop/Auramix/frontend"
npx vitest run src/permission.spec.ts
```

Expected: 6 个测试全部 PASS。

- [ ] **Step 5: 提交**

```bash
cd "C:/Users/17599/Desktop/Auramix/frontend"
git add src/permission.ts src/permission.spec.ts
git commit -m "feat(permission): 全局路由守卫 + 单元测试"
```

---

## Task 6: 路由配置 + 守卫注册

**Files:**
- Modify: `src/router/routes.ts`
- Modify: `src/router/index.ts`

- [ ] **Step 1: 修改 `src/router/routes.ts`**

把 `src/router/routes.ts` 完整覆盖为:

```ts
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/home',
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/views/home/Index.vue'),
    meta: { title: '主页', requiresAuth: true },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/Index.vue'),
    meta: { title: '登录' },
  },
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: { title: '404' },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404',
  },
]

export default routes
```

- [ ] **Step 2: 修改 `src/router/index.ts` 注册守卫**

```ts
// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import routes from './routes'
import { setupPermissionGuard } from '@/permission'

const router = createRouter({
  history: createWebHistory(),
  routes,
})

setupPermissionGuard(router)

export default router
```

- [ ] **Step 3: 类型检查**

```bash
cd "C:/Users/17599/Desktop/Auramix/frontend"
npm run type-check
```

Expected: 退出码 0,无报错。

- [ ] **Step 4: 提交**

```bash
cd "C:/Users/17599/Desktop/Auramix/frontend"
git add src/router/routes.ts src/router/index.ts
git commit -m "feat(router): 路由加 meta.requiresAuth + 注册 permission 守卫"
```

---

## Task 7: AdminLayout

**Files:**
- Create: `src/layout/AdminLayout.vue`

- [ ] **Step 1: 创建布局组件**

```vue
<!-- src/layout/AdminLayout.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/modules/auth'

const auth = useAuthStore()
const router = useRouter()

const username = computed(() => auth.profile?.username ?? '...')

async function handleLogout() {
  await auth.logout()
  router.push('/login')
}

function handleProfile() {
  // 占位:后续接入"个人中心"页
  // eslint-disable-next-line no-alert
  alert('个人中心功能开发中')
}
</script>

<template>
  <div class="admin-layout">
    <header class="admin-layout__header">
      <div class="admin-layout__brand">
        Auramix
      </div>
      <el-dropdown trigger="click">
        <span class="admin-layout__user">
          {{ username }}
          <el-icon class="el-icon--right">
            <i-ep-arrow-down />
          </el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item disabled @click="handleProfile">
              个人中心
            </el-dropdown-item>
            <el-dropdown-item divided @click="handleLogout">
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </header>
    <main class="admin-layout__body">
      <router-view />
    </main>
  </div>
</template>

<style scoped lang="scss">
.admin-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: $bg-color;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 56px;
    padding: 0 24px;
    background-color: #fff;
    border-bottom: 1px solid $border-color;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  }

  &__brand {
    font-size: 18px;
    font-weight: 600;
    color: $primary-color;
  }

  &__user {
    display: inline-flex;
    align-items: center;
    cursor: pointer;
    color: $text-color;
    font-size: 14px;

    &:hover {
      color: $primary-color;
    }
  }

  &__body {
    flex: 1;
    padding: 24px;
    overflow: auto;
  }
}
</style>
```

注意:Element Plus icon 用 `<i-ep-arrow-down />` 是 unplugin-auto-import + element-plus resolver 自动注册的形式,如果项目未配置此项,改为 `import { ArrowDown } from '@element-plus/icons-vue'` 后用 `<el-icon><ArrowDown /></el-icon>`。

- [ ] **Step 2: 验证类型检查**

```bash
cd "C:/Users/17599/Desktop/Auramix/frontend"
npm run type-check
```

Expected: 退出码 0,无报错。如果 icon 报错,改用 `import { ArrowDown } from '@element-plus/icons-vue'` 方式。

- [ ] **Step 3: 提交**

```bash
cd "C:/Users/17599/Desktop/Auramix/frontend"
git add src/layout/AdminLayout.vue
git commit -m "feat(layout): 新增 AdminLayout 外壳(顶栏 + 用户下拉)"
```

---

## Task 8: 登录页(重写)

**Files:**
- Modify: `src/views/login/Index.vue`

- [ ] **Step 1: 重写登录页**

```vue
<!-- src/views/login/Index.vue -->
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/store/modules/auth'
import type { FormInstance, FormRules } from 'element-plus'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const formRef = ref<FormInstance>()
const form = ref({ username: '', password: '' })
const formError = ref('')
const submitLoading = ref(false)

const topAlert = computed(() => {
  if (route.query.expired) return '会话已过期,请重新登录'
  if (route.query.disabled) return '账号已被停用,请联系 ROOT_ADMIN'
  return ''
})

const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 50, message: '长度 3-50 字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
  ],
}

function isSafeRedirect(target: unknown): target is string {
  if (typeof target !== 'string') return false
  if (!target.startsWith('/')) return false // 必须是相对路径
  if (target.startsWith('//')) return false // 禁止协议相对 URL
  if (target.startsWith('/login')) return false // 禁止循环
  return true
}

async function handleSubmit() {
  if (!formRef.value) return
  formError.value = ''
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitLoading.value = true
  try {
    await auth.login({ username: form.value.username, password: form.value.password })
    const target = route.query.redirect
    if (isSafeRedirect(target)) {
      router.push(target)
    }
    else {
      router.push('/home')
    }
  }
  catch (e: any) {
    formError.value = e?.message || '登录失败'
  }
  finally {
    submitLoading.value = false
  }
}
</script>

<template>
  <div class="page-login">
    <el-card class="page-login__card" shadow="always">
      <template #header>
        <h2 class="page-login__title">
          管理员登录
        </h2>
      </template>

      <el-alert
        v-if="topAlert"
        :title="topAlert"
        type="error"
        :closable="false"
        show-icon
        class="page-login__top-alert"
      />

      <el-alert
        v-if="formError"
        :title="formError"
        type="error"
        :closable="false"
        show-icon
        class="page-login__top-alert"
      />

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        @submit.prevent="handleSubmit"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="form.username"
            placeholder="请输入用户名"
            autocomplete="username"
            clearable
          />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            autocomplete="current-password"
            show-password
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            :loading="submitLoading"
            class="page-login__submit"
            @click="handleSubmit"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.page-login {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: $bg-color;

  &__card {
    width: 400px;
    max-width: calc(100vw - 32px);
  }

  &__title {
    margin: 0;
    text-align: center;
    font-size: 20px;
    font-weight: 600;
    color: $text-color;
  }

  &__top-alert {
    margin-bottom: 16px;
  }

  &__submit {
    width: 100%;
  }
}
</style>
```

- [ ] **Step 2: 验证类型检查**

```bash
cd "C:/Users/17599/Desktop/Auramix/frontend"
npm run type-check
```

Expected: 退出码 0。

- [ ] **Step 3: 提交**

```bash
cd "C:/Users/17599/Desktop/Auramix/frontend"
git add src/views/login/Index.vue
git commit -m "feat(login): 重写登录页(表单 + 错误展示 + redirect 校验)"
```

---

## Task 9: Home 页(重写)

**Files:**
- Modify: `src/views/home/Index.vue`

- [ ] **Step 1: 重写 Home 页**

```vue
<!-- src/views/home/Index.vue -->
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAuthStore } from '@/store/modules/auth'
import type { AdminProfile } from '@/types/admin'

const auth = useAuthStore()
const loading = ref(false)

onMounted(async () => {
  // 兜底:如果 store 里没有 profile(冷启动 + /me 失败被拦截器接管 等情况),再拉一次
  if (!auth.profile) {
    loading.value = true
    try {
      const p: AdminProfile | null = await auth.fetchProfile()
      if (!p) {
        // /me 返 null 表示未登录,守卫已处理过,这里不再跳转
      }
    }
    catch {
      // 4012/4031 已被拦截器处理
    }
    finally {
      loading.value = false
    }
  }
})

function formatTime(t: string | null) {
  return t ?? '—'
}
</script>

<template>
  <div class="page-home">
    <el-card v-loading="loading" class="page-home__welcome">
      <template v-if="auth.profile">
        <h2 class="page-home__title">
          欢迎,{{ auth.profile.username }}
          <el-tag
            v-if="auth.profile.isRoot === 1"
            type="warning"
            effect="dark"
            size="small"
            class="page-home__tag"
          >
            ROOT
          </el-tag>
        </h2>

        <el-descriptions
          :column="2"
          border
          class="page-home__desc"
        >
          <el-descriptions-item label="ID">
            {{ auth.profile.id }}
          </el-descriptions-item>
          <el-descriptions-item label="用户名">
            {{ auth.profile.username }}
          </el-descriptions-item>
          <el-descriptions-item label="邮箱">
            {{ auth.profile.email }}
          </el-descriptions-item>
          <el-descriptions-item label="账号状态">
            <el-tag :type="auth.profile.status === 1 ? 'success' : 'danger'" size="small">
              {{ auth.profile.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="最后登录时间">
            {{ formatTime(auth.profile.lastLoginTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="最后登录 IP">
            {{ formatTime(auth.profile.lastLoginIp) }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ formatTime(auth.profile.createdAt) }}
          </el-descriptions-item>
        </el-descriptions>
      </template>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.page-home {
  &__welcome {
    max-width: 900px;
    margin: 0 auto;
  }

  &__title {
    margin: 0 0 16px;
    font-size: 20px;
    font-weight: 600;
    color: $text-color;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__tag {
    margin-left: 4px;
  }

  &__desc {
    margin-top: 8px;
  }
}
</style>
```

- [ ] **Step 2: 验证类型检查**

```bash
cd "C:/Users/17599/Desktop/Auramix/frontend"
npm run type-check
```

Expected: 退出码 0。

- [ ] **Step 3: 提交**

```bash
cd "C:/Users/17599/Desktop/Auramix/frontend"
git add src/views/home/Index.vue
git commit -m "feat(home): 重写 Home 页(欢迎语 + profile 描述列表 + ROOT tag)"
```

---

## Task 10: 集成测试

**Files:**
- Create: `src/__tests__/integration/auth-flow.spec.ts`

- [ ] **Step 1: 写集成测试**

```ts
// src/__tests__/integration/auth-flow.spec.ts
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

// mock router 必须在 import 之前
const routerPush = vi.fn()
vi.mock('@/router', () => ({
  default: { push: routerPush },
}))
vi.mock('element-plus', () => ({
  ElMessage: { error: vi.fn() },
}))

import { useAuthStore } from '@/store/modules/auth'
import * as authApi from '@/api/admin/auth'
import service from '@/utils/request'

const fakeProfile = {
  id: 1,
  username: 'admin',
  email: 'a@b.c',
  isRoot: 1 as const,
  status: 1 as const,
  lastLoginTime: '2026-06-22T10:00:00',
  lastLoginIp: '127.0.0.1',
  createdAt: '2026-06-01',
}

function mockReply(data: unknown, status = 200) {
  return {
    data,
    status,
    statusText: 'OK',
    headers: {},
    config: { headers: {} } as any,
  }
}

describe('auth flow integration', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    routerPush.mockClear()
    service.defaults.adapter = vi.fn() as any
  })

  it('login flow: store.login → state written → /me called via interceptor', async () => {
    vi.mocked(authApi.loginApi).mockResolvedValue({
      token: 'integration-tok',
      expiresAt: '2026-06-22T12:00:00',
      profile: fakeProfile,
    })
    // mock /me 拦截器请求成功
    ;(service.defaults.adapter as any).mockResolvedValue(
      mockReply({ code: 200, data: fakeProfile, message: 'ok' }),
    )

    const store = useAuthStore()
    const result = await store.login({ username: 'admin', password: 'pass' })

    expect(result.token).toBe('integration-tok')
    expect(store.token).toBe('integration-tok')
    expect(store.profile).toEqual(fakeProfile)
    expect(store.isLoggedIn).toBe(true)

    // 持久化也写入
    const stored = localStorage.getItem('auramix-auth')
    expect(stored).toBeTruthy()
    expect(JSON.parse(stored!).token).toBe('integration-tok')
  })

  it('4012 flow: API returns 4012 → interceptor clears store + redirects', async () => {
    const store = useAuthStore()
    store.token = 'old-tok'
    store.profile = fakeProfile

    ;(service.defaults.adapter as any).mockResolvedValue(
      mockReply({ code: 4012, data: null, message: '会话已过期' }),
    )

    await expect(service.get('/some-protected-api')).rejects.toThrow('会话已过期')

    expect(store.token).toBe('')
    expect(store.profile).toBeNull()
    expect(routerPush).toHaveBeenCalledWith({
      path: '/login',
      query: { expired: '1' },
    })
  })

  it('persistence flow: pre-existing localStorage → new store has isLoggedIn true', async () => {
    // 模拟上一次会话留下的 localStorage
    localStorage.setItem(
      'auramix-auth',
      JSON.stringify({ token: 'restored-tok', profile: fakeProfile }),
    )

    // 重新创建 pinia 实例,模拟冷启动
    setActivePinia(createPinia())

    const store = useAuthStore()

    // pinia-plugin-persistedstate 会在 store 创建时自动从 localStorage 恢复
    expect(store.token).toBe('restored-tok')
    expect(store.profile).toEqual(fakeProfile)
    expect(store.isLoggedIn).toBe(true)
  })
})
```

- [ ] **Step 2: 运行集成测试**

```bash
cd "C:/Users/17599/Desktop/Auramix/frontend"
npx vitest run src/__tests__/integration/auth-flow.spec.ts
```

Expected: 3 个测试全部 PASS。

- [ ] **Step 3: 提交**

```bash
cd "C:/Users/17599/Desktop/Auramix/frontend"
git add src/__tests__/integration/auth-flow.spec.ts
git commit -m "test: 集成测试(登录链路 / 4012 退出 / 持久化冷启动)"
```

---

## Task 11: 全量验证

**Files:** (无新增 / 修改)

- [ ] **Step 1: 运行全部单元 + 集成测试**

```bash
cd "C:/Users/17599/Desktop/Auramix/frontend"
npm test
```

Expected: 所有测试 PASS(共约 30 个,具体取决于去重后的数量)。

- [ ] **Step 2: 类型检查**

```bash
cd "C:/Users/17599/Desktop/Auramix/frontend"
npm run type-check
```

Expected: 退出码 0。

- [ ] **Step 3: Lint**

```bash
cd "C:/Users/17599/Desktop/Auramix/frontend"
npm run lint
```

Expected: 0 errors(可能有 warnings,根据项目 eslint 配置)。

- [ ] **Step 4: 构建**

```bash
cd "C:/Users/17599/Desktop/Auramix/frontend"
npm run build
```

Expected: 退出码 0,`dist/` 目录生成。

- [ ] **Step 5: 手动联调 checklist**

启动 dev server:

```bash
cd "C:/Users/17599/Desktop/Auramix/frontend"
npm run dev
```

打开浏览器,依次验证:

1. 访问 `http://localhost:5173/` → 应跳到 `/login`
2. 输错密码 → 应显示表单内错误 `el-alert`
3. 输对密码(需要后端 dev server 在 `localhost:8080` 运行)→ 应跳到 `/home`,看到欢迎语 + profile
4. 关闭浏览器再开 → 直接进 `/home`(持久化生效)
5. 在 `/home` 时,点顶栏用户名 → 下拉菜单出现「个人中心(灰)」「退出」
6. 点「退出」→ 跳回 `/login`
7. 直接访问 `/home` 时手动删 localStorage → 跳 `/login`
8. 触发 4012(可临时把后端 token 改掉)→ 自动跳 `/login?expired=1`,顶部 alert 显示「会话已过期」

每条 checklist 必须通过。

- [ ] **Step 6: 提交(如果 Step 5 发现问题并修复了)**

如果联调中修改了任何文件,提交:

```bash
cd "C:/Users/17599/Desktop/Auramix/frontend"
git add -A
git commit -m "fix: 联调修复(具体描述)"
```

如果无修改,跳过此步。

---

## 任务依赖图

```
Task 0 (vitest 配置)
   ├── Task 1 (types)
   │      └── Task 2 (api)
   │             └── Task 3 (store)
   │                    ├── Task 4 (interceptors)
   │                    │      └── Task 10 (integration)
   │                    └── Task 5 (permission)
   │                           └── Task 10 (integration)
   ├── Task 6 (routes + 守卫注册)
   ├── Task 7 (AdminLayout)
   ├── Task 8 (Login view)
   ├── Task 9 (Home view)
   └── Task 11 (全量验证)
```

可并行项(若分多个 agent 同时做):
- Task 1 → Task 2 → Task 3(线性依赖)
- Task 4 和 Task 5 都依赖 Task 3,可串行或并行为两个 agent
- Task 6、7、8、9 互相独立,可并行
- Task 10 依赖 Task 3、4、5,串行
- Task 11 必须最后

---

## 风险与备注

1. **Element Plus icon 自动注册**:本计划 Task 7 用了 `<i-ep-arrow-down />` 这种 auto-import 形式,具体是否生效取决于项目 unplugin-vue-components 的配置。如果 lint 报"未使用",改为 `import { ArrowDown } from '@element-plus/icons-vue'`。
2. **SCSS 变量**:本计划用了 `$primary-color` `$bg-color` `$border-color` `$text-color`,这些应该已经在 `src/styles/variables.scss` 中定义(否则需要补全)。
3. **路由 4012 测试**:手动联调时,如需模拟 4012,可临时改后端 Redis 的 token TTL 为 5 秒,等几秒后发请求即可。
4. **持久化测试隔离**:每个测试的 `beforeEach` 必须 `localStorage.clear()`,避免污染。
5. **测试间 Pinia 实例隔离**:每个测试的 `beforeEach` 必须 `setActivePinia(createPinia())`,避免状态泄漏。
6. **未做的事**:记住用户名、图形验证码、侧边栏、管理员管理页 —— 全部 YAGNI,留待后续。

---

## 完成后

全部 11 个任务完成后,管理员认证功能即告完成:
- ✅ 登录 / 登出 / 获取个人信息 三个接口已封装
- ✅ 4012/4031 由拦截器统一处理
- ✅ 受保护页路由守卫 + 启动 `/me` 兜底
- ✅ AdminLayout + 登录页 + Home 页 UI 落地
- ✅ 单元 + 集成测试覆盖关键逻辑

可继续推进的下一项工作(在新的 spec / plan 中):
- 管理员管理页(列表 / 创建 / 启停)
- 角色与权限
- 操作日志
