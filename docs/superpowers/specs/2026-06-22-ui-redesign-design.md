# Auramix Admin UI 重构 — 设计文档

- **日期**: 2026-06-22
- **作者**: brainstorming 流程产出
- **目标读者**: 实现者 + 后续维护者 + 第一次阅读代码的工程师
- **状态**: 已通过用户评审,待进入实现规划
- **范围**: 极简亮色风格升级 + 6 个新组件 + Layout/登录/主页改造

## 1. 目标与范围

### 1.1 业务目标

当前 AdminLayout 风格陈旧（深海军蓝 #001529 侧栏 + 紫蓝渐变登录页 + 5 个 el-empty 占位页 + 主页只有 el-descriptions），缺乏现代感且与"Auramix 音乐平台"的品牌调性脱节。在不破坏现有 auth / 路由 / API 任何功能的前提下,通过设计令牌、组件库、关键页面三层改造,让后台立刻具备"现代 SaaS 的克制美感",同时为后续 5 个管理页的实装铺好骨架。

### 1.2 范围

| 项 | 是否在本轮 |
|---|---|
| 扩展设计令牌 (主色/中性/圆角/阴影/字体) | ✅ |
| 6 个新可复用组件 (PageHeader / StatCard / Breadcrumb / UserDropdown / AppSearch / EmptyState) | ✅ |
| AdminLayout 完全重写 (可折叠侧栏 + 顶栏 + 面包屑) | ✅ |
| 登录页改分屏布局 | ✅ |
| 主页加 4 个 StatCard (mock 数据) | ✅ |
| 5 个占位页统一骨架 | ✅ |
| 6 个组件的单元测试 (各 1-2 case) | ✅ |
| 深色模式 | ❌ YAGNI |
| tags-view 多页签 | ❌ YAGNI |
| 拖拽 / 排序侧栏 | ❌ YAGNI |
| 响应式精细化 (<768px 以外) | ❌ YAGNI |
| 国际化 | ❌ YAGNI |
| API / store / utils / permission / router 任何改动 | ❌ 严格不动 |

## 2. 关键决策摘要

| 决策 | 选择 | 一句话理由 |
|---|---|---|
| 品牌气质 | B 极简亮色 (Linear/Notion 路线) | 与音乐平台"内容主角"调性契合,信息密度高 |
| 主色 | D 玫红 #f43f5e | 音乐/娱乐感最强,与 Element Plus 默认蓝明显区隔 |
| 改造范围 | B 换皮 + 关键新组件 | 风险可控,价值密度最高 |
| 登录页 | B 分屏布局 (左 1/2 品牌渐变 + 右 1/2 表单) | 唯一大色块出现的地方,把"克制主色"和"品牌印象"分开 |
| 克制程度 | A 极致克制 (Linear 风) | 1px 边框 + 6px 圆角 + 几乎无阴影,主色仅出现在激活态/链接/数值/tag |
| 精细化预算分配 | 集中到 StatCard / PageHeader / UserDropdown | 高频 + 高显眼,回报密度高;EmptyState / AppSearch / Breadcrumb 保持简洁 |
| 折叠状态持久化 | localStorage (key: `admin-sidebar-collapsed`) | 刷新保留,符合用户预期 |
| 移动端策略 | <768px 侧栏变 el-drawer | 唯一断点,不做精细化响应式 |
| Element Plus 主色冲突 | 仅改 `--el-color-primary`,反馈色用独立令牌 | 不污染 success/warning/danger 的语义 |
| 主页 stat cards 数据源 | mock + 文案注明"接入 API 后替换" | 解耦 UI 与后端,不让 UI 改造等 API |

## 3. 架构总览

### 3.1 三层结构

```
┌──────────────────────────────────────────────────────────┐
│  Views + Layout (src/views/, src/layouts/)               │ ← 页面级组合
├──────────────────────────────────────────────────────────┤
│  Components (src/components/)                            │ ← 6 个可复用组件
├──────────────────────────────────────────────────────────┤
│  Design Tokens (src/styles/variables.scss + index.scss)  │ ← 全局令牌,组件消费令牌
└──────────────────────────────────────────────────────────┘
```

**关键不变式**:

1. **组件只消费 SCSS 令牌** —— 6 个组件全部用 `@use "variables" as *` 间接用 `$primary-color` 等,不写死颜色。
2. **Element Plus 主色只改 `--el-color-primary`** —— 反馈色用 `$success-color` / `$warning-color` / `$danger-color` 独立令牌,通过 CSS 变量同步。
3. **不破坏任何已有层** —— `src/api/` / `src/store/` / `src/utils/` / `src/permission.ts` / `src/router/` 一律不改。
4. **占位页骨架一致** —— 5 个非主页的占位页都用 `<PageHeader>` + `<el-card>` + `<EmptyState>` 三段式,保证后续接入业务时模板一致。

### 3.2 视觉体系

```
令牌 (variables.scss)        组件 (components/)           页面 (views/)
──────────────                ──────────────              ──────────
$primary-color  ──────────►  StatCard 图标块             AdminLayout
$primary-soft   ──────────►  EmptyState 图标底           home StatCards
$text-primary   ──────────►  PageHeader 标题             5 个占位页
$border-base    ──────────►  所有组件的 1px 边框          login 表单
$radius-md      ──────────►  所有组件的 6px 圆角
$shadow-card    ──────────►  仅 StatCard hover 时
```

## 4. 设计令牌

### 4.1 扩展后的 `src/styles/variables.scss`

```scss
// 主色：玫红
$primary-color: #f43f5e;
$primary-soft: #ffe4e6;   // 5% 淡色
$primary-dark: #be123c;   // hover/press

// 反馈色
$success-color: #10b981;  // 翠绿
$warning-color: #f59e0b;  // 琥珀
$danger-color: #ef4444;   // 红

// 中性色
$text-primary: #0f172a;
$text-secondary: #475569;
$text-tertiary: #94a3b8;
$bg-page: #f8fafc;
$bg-surface: #ffffff;
$bg-subtle: #fafafa;
$border-base: #e2e8f0;
$border-subtle: #f1f5f9;

// 布局（保留兼容）
$sidebar-width: 220px;
$sidebar-collapsed-width: 64px;
$header-height: 56px;
$breadcrumb-height: 40px;

// 间距
$spacing-xs: 4px;
$spacing-sm: 8px;
$spacing-md: 16px;
$spacing-lg: 24px;
$spacing-xl: 32px;

// 字号
$font-size-2xs: 11px;
$font-size-xs: 12px;
$font-size-sm: 14px;
$font-size-md: 16px;
$font-size-lg: 18px;
$font-size-xl: 20px;
$font-size-2xl: 22px;  // 新增:PageHeader 标题用

// 圆角
$radius-sm: 4px;
$radius-md: 6px;   // 默认
$radius-lg: 8px;

// 阴影（极轻）
$shadow-card: 0 1px 2px rgba(15, 23, 42, 0.04);
$shadow-popover: 0 4px 12px rgba(15, 23, 42, 0.08);

// 字体
$font-family: -apple-system, BlinkMacSystemFont, 'Inter',
              'PingFang SC', 'Microsoft YaHei', sans-serif;
```

### 4.2 `src/styles/index.scss` 同步 CSS 变量

```scss
@use './reset.scss';
@use './variables.scss' as *;

:root {
  --el-color-primary: #{$primary-color};
  --el-color-success: #{$success-color};
  --el-color-warning: #{$warning-color};
  --el-color-danger: #{$danger-color};
  --el-color-info: #909399;
  // 新增
  --admin-text-primary: #{$text-primary};
  --admin-text-secondary: #{$text-secondary};
  --admin-text-tertiary: #{$text-tertiary};
  --admin-bg-page: #{$bg-page};
  --admin-bg-surface: #{$bg-surface};
  --admin-bg-subtle: #{$bg-subtle};
  --admin-border-base: #{$border-base};
  --admin-border-subtle: #{$border-subtle};
}
```

### 4.3 `src/styles/reset.scss` 字体栈更新

```scss
html, body {
  font-family: $font-family;  // 替换原字体栈
  background-color: $bg-page; // 替换 #f5f7fa
  color: $text-primary;       // 替换 #303133
}
```

## 5. 6 个新组件

所有组件位于 `src/components/`,与对应 `*.spec.ts` 同目录。

### 5.1 PageHeader

```ts
defineProps<{
  title: string
  subtitle?: string
  icon?: string  // @element-plus/icons-vue 的组件名
}>()
```

- 插槽:`#actions` (右侧主操作)、`#extra` (右下辅助操作)
- 视觉:左 icon (可选) + 标题 22px 600 + 副标题 $text-tertiary 14px + 右侧 actions
- 下方 1px $border-subtle 分隔
- 上下 padding: $spacing-lg $spacing-md

### 5.2 StatCard（精细化）

```ts
defineProps<{
  icon: string       // 必需,@element-plus/icons-vue 组件名
  label: string      // 必需,小标签
  value: string | number  // 必需,大数值
  delta?: number     // 可选,百分比变化;为 undefined 时不显示 delta 区
  href?: string      // 可选,点击跳转
}>()

// 行为规则:delta > 0 → 上升(↑ + 绿);delta < 0 → 下降(↓ + 红);delta === 0 → 持平(— + 灰)
// 该判断在 setup() 内的 computed 中根据 delta 符号决定 tone,无需外部传 deltaTone
```

- 视觉:左 36×36 圆形图标块 ($primary-soft 底 + $primary-color 图标) + 右侧 label/value/delta
- value: $font-size-2xl 700 $text-primary
- delta:`↑ +12%` 用 $success-color,`↓ -3%` 用 $danger-color,`— 0%` 用 $text-tertiary
- hover:translateY(-1px) + $shadow-card,过渡 150ms ease-out
- 卡片:1px $border-base 边框 + $radius-md + 背景 $bg-surface

### 5.3 Breadcrumb

```ts
// 无 props,自动从 route.matched 派生
const route = useRoute()
const crumbs = computed(() =>
  route.matched
    .filter(r => r.meta?.title)
    .map(r => ({ title: r.meta.title, path: r.path }))
)
```

- 视觉:横向文本链,分隔符 `/` 用 $text-tertiary,最后一级不可点
- 高度 40px,背景 $bg-page,1px $border-subtle 上下分隔

### 5.4 UserDropdown（精细化）

```ts
defineProps<{
  username: string
  email?: string
  isRoot?: 0 | 1
}>()
defineEmits<{
  logout: []
  profile: []  // 个人中心(占位,暂不接路由)
}>()
```

- 触发器:圆形头像 (initials fallback, $primary-soft 底 + $primary-color 文字) + username + ▾
- 下拉顶部 80px 用户信息卡:头像 48px + username 16px + email 13px + 角色徽标 (普通管理员 $text-tertiary / 超级管理员 $primary-color)
- 菜单项:个人中心 (disabled) / 退出登录
- 过渡:el-dropdown 默认 150ms

### 5.5 AppSearch

```ts
defineProps<{
  placeholder?: string  // 默认 "搜索 ⌘K"
}>()
```

- 视觉:el-input 圆角 6px,背景 $bg-subtle,左侧 🔍 图标,右侧 ⌘K 灰色快捷键标签
- `Ctrl+K` / `⌘K` 全局监听 → 自动 focus
- 行为:onChange 占位实现 (留 console.log 提示待接),不阻塞 UI

### 5.6 EmptyState

```ts
defineProps<{
  icon: string         // 必需,@element-plus/icons-vue 组件名
  title: string        // 必需
  hint?: string        // 可选,副标题
}>()
```

- 视觉:48×48 圆形图标块 ($primary-soft 底 + $primary-color 图标) + 居中标题 + 副标题
- 与 StatCard 图标块同款,保证视觉系统一致

## 6. 关键页面改造

### 6.1 `src/layouts/AdminLayout.vue` 完全重写

```
┌────────────────────────────────────────────────────────────────┐
│  [♪ AURAMIX]  [⌕ 搜索   ⌘K]              [🔔]  [● 张三 ▾]    │  顶栏 56px
│             sticky · 白底 · 1px 底边                                    │
├──────┬─────────────────────────────────────────────────────────┤
│ 🏠  │  主页  /  仪表盘                                          │  面包屑 40px
│ 主  │                                                          │  浅灰底
│ 页  ├─────────────────────────────────────────────────────────┤
│      │                                                          │
│ 👥  │                                                          │
│ 用  │              <router-view />                              │  内容区
│ 户  │                                                          │  $spacing-md padding
│ 管  │                                                          │
│ 理  │                                                          │
│ ...  │                                                          │
│      │                                                          │
│ ◀   │                                                          │  折叠按钮
└──────┴─────────────────────────────────────────────────────────┘
```

- 侧栏 220px ↔ 64px,折叠状态存 `localStorage.admin-sidebar-collapsed`
- 折叠动画 200ms ease-out
- `<768px` 侧栏变 el-drawer
- 5 个菜单项加 icon:
  - `/home` → House
  - `/user` → User
  - `/admin` → UserFilled (仅 isRoot=1)
  - `/song` → Headset (音乐感)
  - `/album` → Collection
  - `/approval` → CircleCheck
- `.el-menu-item.is-active` 局部覆盖:背景 #0f172a + 文字 #fff(主色只点缀,不主导激活态)
- 用 `<UserDropdown>` 替换当前的"用户名 + 退出"两个独立元素
- 用 `<Breadcrumb>` 替代之前的简单文本

### 6.2 `src/views/login/Index.vue` 分屏重写

- 左 1/2:`linear-gradient(135deg, #f43f5e 0%, #be123c 100%)`
  - 顶部 `AURAMIX` 16px 700 白色 + 副标题 `Admin Console` 11px
  - 中部大标题 28px 700 `管理你的音乐世界` + 价值主张 14px `歌曲 / 专辑 / 智能审批 / 一站式后台`
  - 底部 `© 2026 Auramix` 11px 60% 透明
- 右 1/2:白底 + 居中表单 (max-width 360px)
  - 标题 `欢迎回来` 22px 600
  - 副标题 `请登录你的账号` 13px $text-tertiary
  - 表单字段沿用现有 (username、password、@keyup.enter 提交)
  - 错误 alert 沿用现有 (`会话已过期` / `账号已被停用` / 表单内登录错误)
  - 按钮 `登录` 100% 宽,`$primary-color` 底

### 6.3 `src/views/home/Index.vue` 加 4 个 StatCard

```
┌──────────────────────────────────────────┐
│  欢迎回来,张三                            │  ← 原欢迎卡
│  [profile descriptions 表]               │
├──────────────────────────────────────────┤
│  [♪ 1284]  [👥 3402]  [✓ 28]  [✚ 12]  │  ← 新增 4 个 StatCard
│  歌曲数     用户数     待审     今日新增  │     横向 4 列
│  +12%       +5%        -3       —       │
├──────────────────────────────────────────┤
│  最近活动 (占位)                          │  ← 新增占位
└──────────────────────────────────────────┘
```

- 4 个 StatCard 横向 4 列 (响应式:中等屏 2 列,小屏 1 列)
- 数值 mock:`1284 / 3402 / 28 / 12`,文案注明"接入 API 后替换"
- delta mock:`+12% / +5% / -3 / 0`
- icon 选用(与路由菜单一致,保证视觉系统统一):
  - 歌曲数 → `Headset`
  - 用户数 → `User`
  - 待审 → `CircleCheck`
  - 今日新增 → `Plus`

### 6.4 5 个占位页统一骨架

```vue
<template>
  <div class="page-user">
    <PageHeader title="用户管理" subtitle="管理平台所有用户信息">
      <template #actions>
        <el-button type="primary">
          <el-icon><Plus /></el-icon>新建用户
        </el-button>
      </template>
    </PageHeader>
    <el-card shadow="never" class="page-card">
      <EmptyState icon="User" title="用户管理" hint="功能开发中" />
    </el-card>
  </div>
</template>
```

5 个页面标题/icon 替换:
- 用户管理 → User
- 管理员管理 → UserFilled
- 歌曲管理 → Headset
- 专辑管理 → Collection
- 智能审批 → CircleCheck

## 7. 目录结构

```
src/
├── components/                          ← 新增目录
│   ├── PageHeader.vue                   ← 新增
│   ├── StatCard.vue                     ← 新增 (精细化)
│   ├── Breadcrumb.vue                   ← 新增
│   ├── UserDropdown.vue                 ← 新增 (精细化)
│   ├── AppSearch.vue                    ← 新增 (占位实现)
│   ├── EmptyState.vue                   ← 新增
│   └── __tests__/                       ← 单元测试
│       ├── PageHeader.spec.ts
│       ├── StatCard.spec.ts
│       ├── Breadcrumb.spec.ts
│       ├── UserDropdown.spec.ts
│       ├── AppSearch.spec.ts
│       └── EmptyState.spec.ts
├── styles/
│   ├── variables.scss                   ← 扩展
│   ├── index.scss                       ← CSS 变量同步
│   └── reset.scss                       ← 字体/底色更新
├── layouts/
│   └── AdminLayout.vue                  ← 完全重写
├── views/
│   ├── login/Index.vue                  ← 分屏重写
│   ├── home/Index.vue                   ← + StatCard
│   ├── user/Index.vue                   ← PageHeader 骨架
│   ├── admin/Index.vue                  ← PageHeader 骨架
│   ├── song/Index.vue                   ← PageHeader 骨架
│   ├── album/Index.vue                  ← PageHeader 骨架
│   └── approval/Index.vue               ← PageHeader 骨架
```

**严格不动的目录**:
- `src/api/`
- `src/store/`
- `src/utils/`
- `src/permission.ts`
- `src/router/`
- `src/auth-flow.spec.ts`
- `src/permission.spec.ts`
- `src/main.ts`
- `src/App.vue`

## 8. 数据流

本轮所有页面**不调任何 API**,数据来源 = props 注入 + auth store 已存在的 profile。

- `UserDropdown` 接收 `username` / `email` / `isRoot` 三个 props,由 AdminLayout 从 `useAuthStore().profile` 读取后传入
- `StatCard` 接收硬编码 mock 数据,后续接入 API 时只改 home/Index.vue
- `AppSearch` 的 onChange 留 `console.log`,不接 API
- `Breadcrumb` 自动从 `useRoute().matched` 派生
- `EmptyState` 完全静态
- `PageHeader` 完全静态 + 插槽

## 9. 测试策略

### 9.1 框架

沿用现有:**Vitest 2 + @vue/test-utils 2 + happy-dom 15**

### 9.2 各组件覆盖

| 组件 | 核心 case |
|---|---|
| PageHeader | 渲染 title;`#actions` 插槽出现;subtitle 缺省时不渲染 |
| StatCard | 渲染 value;delta 为正显示 ↑ + 绿;delta 为负显示 ↓ + 红;href 点击 emit |
| Breadcrumb | 从 `useRoute().matched` 派生正确层级 |
| UserDropdown | 点退出 emit('logout');avatar 显示 username 首字母 |
| AppSearch | `Ctrl+K` 触发 input.focus() |
| EmptyState | 渲染 title 和 hint;缺省 hint 不渲染 |

### 9.3 不测的

- 视觉样式断言(像素值、阴影、圆角)
- Element Plus 内部行为
- 动画曲线
- 移动端 drawer 行为(<768px 走 happy-dom 边界,容易脆)

### 9.4 回归保护

- 现有 32 个 spec 不动
- 7 步实施,每步后跑 `npm run type-check && npm test`
- 最后跑 `npm run build` 验证打包通过

## 10. 风险与缓解

| 风险 | 缓解 |
|---|---|
| `el-menu` 在 light 主题下激活态默认是主色背景,与 A 路线"主色只点缀"冲突 | 在 AdminLayout 局部覆盖 `.el-menu-item.is-active` 用 #0f172a + 白字 |
| Element Plus 主色被 `--el-color-primary` 全局影响,可能误改反馈色 | CSS 变量只改 `--el-color-primary`;反馈色用独立 `--el-color-success` 等显式同步 |
| 折叠状态在 SSR/隐私模式 localStorage 不可用 | `try/catch` 包住,失败降级为默认展开 |
| 5 个占位页现有测试覆盖度未知 | 改造前先跑 `npm test` 看 baseline,改造后行为不变(仍是"功能开发中"占位) |
| 登录页分屏后小屏(<360px)布局破裂 | 媒体查询 <768px 时左 1/2 改为 top 1/3 高度,右 2/3 容纳表单 |
| 主页 4 个 StatCard 在中等屏(<1024px)挤 | grid 响应式:中等屏 2 列、小屏 1 列 |
| Element Plus 自动按需注册可能漏检新组件 | 用到 `el-drawer` 时确认 unplugin-vue-components 解析器覆盖 |

## 11. 实施检查清单(供 writing-plans 拆分)

- [ ] 扩展 `src/styles/variables.scss`
- [ ] 修改 `src/styles/index.scss` 同步 CSS 变量
- [ ] 修改 `src/styles/reset.scss` 字体栈和底色
- [ ] 新增 `src/components/PageHeader.vue` + spec
- [ ] 新增 `src/components/StatCard.vue` + spec (精细化)
- [ ] 新增 `src/components/Breadcrumb.vue` + spec
- [ ] 新增 `src/components/UserDropdown.vue` + spec (精细化)
- [ ] 新增 `src/components/AppSearch.vue` + spec
- [ ] 新增 `src/components/EmptyState.vue` + spec
- [ ] 改造 `src/views/user/Index.vue`
- [ ] 改造 `src/views/admin/Index.vue`
- [ ] 改造 `src/views/song/Index.vue`
- [ ] 改造 `src/views/album/Index.vue`
- [ ] 改造 `src/views/approval/Index.vue`
- [ ] 重写 `src/layouts/AdminLayout.vue`
- [ ] 改造 `src/views/home/Index.vue` 加 StatCard
- [ ] 重写 `src/views/login/Index.vue` 分屏
- [ ] 跑 `npm run type-check`(0 错)
- [ ] 跑 `npm test`(原 32 + 新 ≥6 = ≥38 全过)
- [ ] 跑 `npm run build`(成功)
- [ ] 人工启动 dev server,目检 6 个页面视觉
