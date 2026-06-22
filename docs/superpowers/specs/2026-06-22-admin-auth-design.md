# 管理员认证功能 — 设计文档

- **日期**: 2026-06-22
- **作者**: brainstorming 流程产出
- **目标读者**: 实现者 + 后续维护者 + 第一次阅读代码的工程师
- **状态**: 已通过用户评审,待进入实现规划

## 1. 目标与范围

### 1.1 业务目标

依据 `docs/管理员端认证接口文档.md`,在已存在的 Vue 3 + TypeScript 前端骨架上,实现管理员端的登录 / 登出 / 获取个人信息三个接口的前端工程化封装,以及对应的 UI 落地,使得管理员能够**登录、看到自己的信息、退出**。

### 1.2 范围

| 项 | 是否在本轮 |
|---|---|
| 登录页表单 + 校验 + 错误展示 | ✅ |
| Pinia auth store(token + profile + actions)+ 持久化 | ✅ |
| Axios 请求 / 响应拦截器 | ✅ |
| 路由守卫(登录态校验 + 启动时 /me 校验) | ✅ |
| AdminLayout 外壳(顶栏 + 路由出口) | ✅ |
| Home 页展示 profile | ✅ |
| 退出登录(无确认弹窗) | ✅ |
| 记住用户名 / 图形验证码 | ❌ YAGNI |
| 侧边栏 / 完整后台壳 | ❌ YAGNI |
| 管理员管理 / 角色权限 / 操作日志 | ❌ 不在本轮 |

## 2. 关键决策摘要

| 决策 | 选择 | 一句话理由 |
|---|---|---|
| 实现范围 | A + B 最小版 | 覆盖文档全部场景,不做额外功能 |
| Token 存储 | localStorage + 启动 /me 校验(C) | 兼顾体验与失效感知 |
| 启动校验失败处理 | 4012/4031 清本地跳登录,网络错容忍 | 网络抖动不锁死用户 |
| 登录后外壳 | AdminLayout 包裹(L2) | 为后续受保护页铺路 |
| 代码组织 | 标准分层(A) | 职责清晰,后续扩展零摩擦 |
| 登录错误展示 | 表单内 `el-alert` | 错误与表单强相关,内联更合适 |
| 退出登录 | 无确认弹窗,直接清 + 跳 | 用户已表达意图,二次确认繁琐 |
| 4012/4031 处理位置 | 拦截器内 | 业务页零感知,统一处理 |
| 5000 message | 拦截器统一改写为"服务异常" | 避免泄漏后端细节 |
| 登出 API 失败 | 无论成败都清本地 | 不让用户卡在中间态 |

## 3. 架构总览

### 3.1 四层架构

```
┌─────────────────────────────────────────────────┐
│  Views (login / home) + Layout (AdminLayout)    │  ← 只负责渲染 + 表单交互
├─────────────────────────────────────────────────┤
│  Pinia auth store (token + profile + actions)    │  ← 状态与业务动作的唯一来源
├─────────────────────────────────────────────────┤
│  utils/request.ts (axios + interceptors)         │  ← 自动带 token / 统一错误处理
├─────────────────────────────────────────────────┤
│  api/admin/auth.ts (3 个接口的纯函数)             │  ← 只关心 HTTP,不关心状态
└─────────────────────────────────────────────────┘
```

### 3.2 四个不变式

1. **token 唯一来源是 Pinia store** —— 任何地方读 token 都走 `useAuthStore().token`,禁止直接读 localStorage。
2. **token 唯一写入点是登录成功的 action** —— 登出和 4012 拦截器只能"清",不能"改"。
3. **受保护页访问前必经过 `permission.ts` 守卫** —— 守卫唯一决定能否进入。
4. **4012 / 4031 的处理只发生在 axios 响应拦截器中** —— 业务代码不直接处理 token 失效。

### 3.3 Token 生命周期

```
[冷启动] → 读 localStorage token → 有 → 调 /me 校验
                                  → 成功 → 进系统
                                  → 4012 → 清 + 跳 /login?expired=1
                                  → 4031 → 清 + 跳 /login?disabled=1
                                  → 网络错 → 容忍(进系统,后续请求遇 4012 再清)

[登录成功] → 后端返 token + profile → 写 store(localStorage 持久化)→ 跳 /home

[主动登出] → 调 /logout(无论成败)→ 清 store → 跳 /login

[使用中] → 拦截器自动加 Authorization: Bearer {token}
         → 遇 4012 → 清 store + 跳 /login?expired=1 + 提示
         → 遇 4031 → 清 store + 跳 /login?disabled=1 + 提示
```

### 3.4 路由保护策略

- `/login`、`/404`、通配 fallback → 不需要 token
- `/`、`/home`、未来所有受保护页 → `meta.requiresAuth = true`
- 已登录访问 `/login` → 重定向到 `/home`
- 未登录访问受保护页 → 重定向到 `/login?redirect={原路径}`
- 首次进入受保护页:有 token 但无 profile → 拉一次 `/me` 兜底

## 4. 目录结构与模块边界

### 4.1 目录树(本轮新增 / 修改)

```
src/
├── api/admin/
│   └── auth.ts                  ← 新增:3 个接口的纯函数
├── layout/
│   └── AdminLayout.vue          ← 新增:AdminLayout 壳
├── store/modules/
│   └── auth.ts                  ← 新增:auth Pinia store
├── views/
│   ├── home/Index.vue           ← 修改:展示 profile
│   └── login/Index.vue          ← 重写:登录表单
├── types/admin.ts               ← 新增:共享 TS 类型
├── utils/request.ts             ← 修改:加拦截器
├── permission.ts                ← 新增:路由守卫
├── main.ts                      ← 修改:注册 pinia 持久化
├── router/
│   ├── index.ts                 ← 修改:注册 permission 守卫
│   └── routes.ts                ← 修改:加 meta.requiresAuth
```

### 4.2 共享类型 `src/types/admin.ts`

```ts
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

### 4.3 API 层 `src/api/admin/auth.ts`

公开 3 个纯函数,只发请求,不碰 store:

```ts
export function loginApi(payload: LoginPayload): Promise<LoginResult>
export function logoutApi(): Promise<void>
export function fetchProfileApi(): Promise<AdminProfile | null>
```

### 4.4 拦截器 `src/utils/request.ts`

- **请求拦截器**:从 `useAuthStore()` 取 token,加 `Authorization: Bearer {token}` 头
- **响应拦截器**:
  - `code === 200` → 返 `data`
  - `code === 4012` → 清 store + 跳 `/login?expired=1` + 拒 Promise
  - `code === 4031` → 清 store + 跳 `/login?disabled=1` + 拒 Promise
  - `code === 5000` → 改写 message 为"服务异常,请稍后重试" + 拒 Promise
  - `code === 400 / 4011` → 透传后端 message + 拒 Promise
  - HTTP 非 200 → 拒 Promise("网络异常,请检查连接")

### 4.5 Store `src/store/modules/auth.ts`

```ts
// state
token: string         // ''
profile: AdminProfile | null  // null
loading: boolean      // false,用于登录按钮的 loading 状态

// getters
isLoggedIn: boolean   // token !== ''

// actions
login(payload)        // 调 loginApi → 期间 loading=true → 写 state(自动持久化)→ loading=false
logout()              // 调 logoutApi(忽略错误)→ clearAuth()
fetchProfile()        // 调 fetchProfileApi → 写 profile(若返回 null 则清 profile)
clearAuth()           // 清 state + 清持久化(拦截器专用)
```

**持久化配置**:
- plugin: `pinia-plugin-persistedstate`
- storage: `localStorage`
- key: `auramix-auth`
- paths: `['token', 'profile']`
- 写入失败(隐私模式)不阻塞登录,降级到内存态

### 4.6 路由守卫 `src/permission.ts`

`router.beforeEach` 内的 5 个分支:

| 情况 | 处理 |
|---|---|
| 受保护页 + 未登录 | `{ path: '/login', query: { redirect: to.fullPath } }` |
| `/login` + 已登录 | `{ path: '/home' }` |
| 受保护页 + 已登录 + 无 profile | 调 `auth.fetchProfile()`,失败则清状态 + 跳 `/login` |
| `redirect` 指向 `/login` 自身 | 降级到 `/home` |
| 其它 | 放行 |

### 4.7 Layout `src/layout/AdminLayout.vue`

```
┌──────────────────────────────────────────────────────┐
│  Auramix (站名)         {username} ▾ [个人中心|退出]   │
├──────────────────────────────────────────────────────┤
│                  <router-view />                      │
└──────────────────────────────────────────────────────┘
```

- 顶栏右侧 `el-dropdown`,触发器显示 `profile.username`
- 菜单项「个人中心(占位 `disabled`)」「退出登录」
- 退出:无确认弹窗,直接 `auth.logout()` + 跳 `/login`

### 4.8 登录页 `src/views/login/Index.vue`

- `el-card` 居中,宽 400px
- 字段:username、password(`type="password"`)
- 校验:username 长度 3-50,password 非空
- 错误展示:**表单内 `el-alert`**(顶部固定位置)
- 提交:`auth.login()` → `router.push(redirect || '/home')`
- 按钮 `loading` 状态绑定 `auth.loading`
- 顶部根据 query 渲染「会话已过期 / 账号已被停用」告警

### 4.9 Home 页 `src/views/home/Index.vue`

- 欢迎语:`欢迎,{username}`,isRoot=1 时挂 `ROOT` 黄色 tag
- 主体:`el-descriptions` 展示 profile 全部字段
- 调 `auth.fetchProfile()` 兜底(防止 store 里 profile 缺失)

### 4.10 路由 `meta` 设计

```ts
// 受保护页
{ path: '/', redirect: '/home' }                          // 不带 requiresAuth,只重定向
{ path: '/home', meta: { title: '主页', requiresAuth: true } }

// 不受保护
{ path: '/login', meta: { title: '登录' } }
{ path: '/404', meta: { title: '404' } }
{ path: '/:pathMatch(.*)*', redirect: '/404' }
```

## 5. 数据流

### 5.1 冷启动访问受保护页

1. 用户访问 `/home`
2. `router.beforeEach` 触发 `permission.ts`
3. 读 store.token:有
4. 读 store.profile:无 → 调 `fetchProfileApi`
5. 成功:写 store.profile,放行,渲染 Home
6. 失败 4012:拦截器清 store + 跳 `/login?expired=1`
7. 失败 网络错:放行(容忍,后续遇 4012 再校正)

### 5.2 登录

1. 用户填表,点登录
2. Login.vue 调 `auth.login(payload)`
3. store 调 `loginApi(payload)`
4. 成功:写 state(token、profile)→ 持久化自动写入 → 跳 `/home`(或 `redirect` 目标)
5. 失败 4011/400:拦截器 reject,Login.vue 拿 err 显示 `el-alert`
6. 失败 4031:拦截器清 store + 跳 `/login?disabled=1`

### 5.3 使用中 token 过期

1. 任意业务页调 API
2. 请求拦截器自动加 token
3. 后端返 4012
4. 响应拦截器识别 → `authStore.clearAuth()` → `router.push('/login?expired=1')`
5. 业务页的 Promise reject(无需业务代码介入)

### 5.4 退出

1. AdminLayout 顶栏点「退出」
2. 调 `auth.logout()`
3. store 调 `logoutApi()`
4. 无论 API 成功/失败/网络错 → 调 `clearAuth()` → 跳 `/login`

## 6. 错误处理 UX 映射

| 触发场景 | code | HTTP | 拦截器动作 | 业务页动作 | 用户最终落点 | 提示方式 |
|---|---|---|---|---|---|---|
| 登录成功 | 200 | 200 | 返 data | 写 store + 跳 home | `/home` | — |
| 登录-密码错 | 4011 | 401 | 拒 Promise | `el-alert` 显示 | `/login` | 表单内 alert |
| 登录-账号停用 | 4031 | 403 | 清 + 跳 | — | `/login?disabled=1` | 顶部 alert |
| 登录-参数错 | 400 | 400 | 拒 Promise | `el-alert` 显示 | `/login` | 表单内 alert |
| 使用中-会话过期 | 4012 | 401 | 清 + 跳 | — | `/login?expired=1` | 顶部 alert |
| 使用中-账号停用 | 4031 | 403 | 清 + 跳 | — | `/login?disabled=1` | 顶部 alert |
| 使用中-参数错 | 400 | 400 | 拒 Promise | toast | 留在原页 | `ElMessage.error` |
| 使用中-服务端错 | 5000 | 500 | 改写 message | toast | 留在原页 | `ElMessage.error` |
| 网络断开 | — | — | 拒 Promise | toast | 留在原页 | `ElMessage.error` |
| 登出 API 失败 | 任意 | 任意 | 忽略,清本地 | 跳 | `/login` | — |

## 7. 测试策略

### 7.1 框架

**Vitest** + **@vue/test-utils** + **happy-dom**。

### 7.2 各层覆盖

**单元测试**:
- `api/admin/auth.ts` —— mock axios,验证 3 函数传参
- `store/modules/auth.ts` —— login 成功写 state、logout 失败也清、clearAuth 只清不调 API、isLoggedIn getter
- `utils/request.ts` 拦截器 —— mock 各种 code,验证 token 注入 + 4012/4031 清跳 + 5000 改写
- `permission.ts` 守卫 —— 6 个 case 覆盖

**集成测试**:
- 登录完整链路(填表 → 提交 → 跳 /home)
- 4012 触发退出链路(API 返 4012 → 清 + 跳)
- 持久化冷启动链路(写 localStorage → 新 store → isLoggedIn)

**E2E**(可选,推荐 Playwright,本轮不做):
- 完整登录 / 退出流程

### 7.3 Mock 策略

- 用 `vi.mock` mock axios,不用 MSW
- 测试文件与被测文件**同目录**:`auth.ts` ↔ `auth.spec.ts`

### 7.4 不测试的

- 视图样式、布局对齐
- Element Plus 组件内部行为
- 框架自身

## 8. 风险与缓解

| 风险 | 缓解 |
|---|---|
| 隐私模式 / localStorage 不可用 | `try/catch` 包住持久化写入,失败降级内存态 |
| 登录后 redirect 指向 `/login` 自身 | 守卫内校验,降级到 `/home` |
| `/me` 启动调用网络错 | 放行进系统,后续遇 4012 再清 |
| 后端改 message 文案 | 前端使用后端 message,仅 5000 改写 |
| 后续加新受保护页忘记加 `requiresAuth` | README 提示 + Code Review 检查点 |

## 9. 实施检查清单(供 writing-plans 拆分任务)

- [ ] 新增 `src/types/admin.ts`
- [ ] 新增 `src/api/admin/auth.ts`
- [ ] 修改 `src/utils/request.ts`(加拦截器)
- [ ] 新增 `src/store/modules/auth.ts`
- [ ] 新增 `src/permission.ts`
- [ ] 修改 `src/router/routes.ts`(加 `meta.requiresAuth`)
- [ ] 修改 `src/router/index.ts`(注册守卫)
- [ ] 修改 `src/main.ts`(注册 pinia 持久化)
- [ ] 新增 `src/layout/AdminLayout.vue`
- [ ] 重写 `src/views/login/Index.vue`
- [ ] 修改 `src/views/home/Index.vue`
- [ ] 单元测试(4 个 spec)
- [ ] 集成测试(3 个 spec)
- [ ] 安装测试依赖:`vitest`、`@vue/test-utils`、`happy-dom`、`@vitest/coverage-v8`(可选)
- [ ] 手动联调 checklist(配合后端 dev server)
