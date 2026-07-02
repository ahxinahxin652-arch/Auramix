# Auramix Desktop 开发须知

> 写代码时的速查, 避免重复踩坑.

---

## 1. JS 还是 TS?

**全部 .vue 的 `<script setup>` 默认是 JS (没有 lang="ts").**

```vue
<script setup>          <!-- ✅ 默认 JS -->
<script setup lang="ts"> <!-- 仅当文件需要复杂类型时显式声明 -->
```

**JS 文件禁止:**
- `import { ..., type X }`  (TS 语法)
- `interface / type Foo = ...`  (除非声明 lang="ts")
- `as Foo` 类型断言

**类型用 JSDoc:**

```js
/**
 * @typedef {Object} MyDto
 * @property {string} name
 * @property {number} age
 */
```

类型名字在运行时是 `undefined`, 但 IDE 能识别.

---

## 2. 路由系统

- **Hash 路由** (`createWebHashHistory`)
- 路由配置在 `src/routers/index.js` (注意是 routers 不是 router)
- 守卫也在这文件: 已登录访问 `/login` → 跳 `/`

---

## 3. API 调用

- 统一走 `src/utils/backendApi.js` 的 `backendFetch`
- **不通过 preload 桥** (虽然 `electronAPI` 存在)
- JWT 自动从 `localStorage.auramix_token` 取
- BACKEND_URL 默认 `http://localhost:8080`

```js
import { backendFetch } from '@/utils/backendApi'

const data = await backendFetch('/api/user/something', { method: 'POST', body: {...} })
```

---

## 4. 鉴权 token

- localStorage key: `auramix_token`
- 后端 header: `Authorization: Bearer <token>`
- 由 `backendFetch` 自动处理

---

## 5. 现有依赖 (含传递)

| 依赖 | 安装方式 | 备注 |
|---|---|---|
| `vue` | 显式 | 3.5+ |
| `vue-router` | 显式 | |
| `element-plus` | 显式 | 2.14+ |
| `@element-plus/icons-vue` | **element-plus 传递** | 包存在但 package.json 没声明 |
| `prisma + @prisma/client` | 显式 | |
| `axios` | ❌ 没装 | 用 `fetch` + `backendFetch`, 不要 `import axios` |
| `echarts / vue-echarts / gsap` | ❌ 没装 | 图表用纯 SVG 手画 |
| `pinia` | ❌ 没装 (装的是 useMusicLibraryStore) | 别用 pinia 写法 |

---

## 6. 不要从其它仓照搬的陷阱

| 仓 | Lang | 框架 |
|---|---|---|
| `auramix_backend` | Java 21 + Spring Boot 3.5 | 后端, 别复制 .vue |
| `auramix_frontend` | TS + Vue 3 + Vite | **管理后台**, echarts + gsap 都有 |
| `auramix_desktop` | **JS** + Vue 3 + Vite + Electron | **客户端**, **没有 echarts/gsap** |

**报错调试优先级:**
1. 先看 `<script setup>` 是 JS 还是 TS
2. 后端报错看 Java stacktrace (`target/logs/spring.log` 或 IDE)
3. 前端报错看 vite 控制台 (TS 类型错 → JS 语法错)

---

## 7. Element Plus 图标避坑

**`@element-plus/icons-vue` 并不是所有图标都有**。常见"我以为有但其实没有"的:

| ❌ 不要用 | ✅ 用什么 |
|---|---|
| `ThumbsUp` | `Star` / `StarFilled` (本仓库没用 赞图标, 直接用 Star) |
| `Camera` (在 mobile 主题) | `CameraFilled` 或 `VideoCamera` |
| `Heart` (本仓库) | 不存在, 用 `Goods` 替代 |

**写代码前**先 grep 一下:
```bash
Select-String -Path "node_modules\@element-plus\icons-vue\dist\global.cjs" -Pattern "你的图标名"
```

或者直接看 dist 目录导出的所有名字, 找最接近的。

**为什么这个错会"看起来"没反应**: Vite ESM 加载模块失败 → 路由跳转时 `component()` reject → Vue Router catch 但组件没渲染 → 用户看到的是**白屏或原页面**。**控制台会有 `does not provide an export named 'xxx'` 错误**。

---

## 8. 调试桌面端

桌面端默认**不开启 DevTools**, 按 F12 没用.

`electron/main.js` 里已经绑定了快捷键:
- **F12**: 打开/关闭 DevTools
- **Ctrl+Shift+I** (Mac: **Cmd+Opt+I**)

调试时先按 F12 → 看到 console 标签 → 复制报错信息.
