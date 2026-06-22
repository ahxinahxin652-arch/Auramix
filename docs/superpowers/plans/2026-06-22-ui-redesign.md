# Auramix Admin UI 重构 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 Auramix Admin 从陈旧深色风格升级为 Linear 风格的极简亮色方案,新增 6 个可复用组件,重写 AdminLayout / 登录页 / 主页,统一 5 个占位页骨架,所有现有功能(auth / 路由 / API / store / utils)严格不动。

**Architecture:** 三层 — 全局 SCSS 设计令牌(`src/styles/variables.scss`) → 6 个新可复用组件(`src/components/*.vue`,严格消费令牌) → 页面组合(AdminLayout + 7 个 view)。组件之间无横向依赖,只通过 props/emits 通信;AdminLayout 注入 auth store 的 profile 给 UserDropdown。

**Tech Stack:** Vue 3.5 + TypeScript 5.6 + Pinia 3 + Element Plus 2.8 + @element-plus/icons-vue 2.3 + SCSS 1.81 + Vitest 2 + @vue/test-utils 2 + happy-dom 15

---

## 文件总览

| 文件 | 状态 | 职责 |
|---|---|---|
| `src/styles/variables.scss` | 修改 | 扩展设计令牌(主色玫红/中性色/字号/圆角/阴影) |
| `src/styles/index.scss` | 修改 | 同步 CSS 变量到 Element Plus + 新 admin 变量 |
| `src/styles/reset.scss` | 修改 | 字体栈、底色、文字色用令牌 |
| `src/components/PageHeader.vue` | 新建 | 标题/副标题/icon + #actions / #extra 插槽 |
| `src/components/PageHeader.spec.ts` | 新建 | title / subtitle / slot / icon 渲染测试 |
| `src/components/StatCard.vue` | 新建 | 图标 + label + value + delta(href 可选) |
| `src/components/StatCard.spec.ts` | 新建 | delta 正/负/零/href 跳转测试 |
| `src/components/Breadcrumb.vue` | 新建 | 从 `route.matched` 派生面包屑 |
| `src/components/Breadcrumb.spec.ts` | 新建 | 路由元信息派生测试 |
| `src/components/UserDropdown.vue` | 新建 | 头像触发器 + 下拉(用户名/邮箱/角色/退出) |
| `src/components/UserDropdown.spec.ts` | 新建 | emit('logout') + avatar initials 测试 |
| `src/components/AppSearch.vue` | 新建 | 搜索框 + ⌘K 快捷键 |
| `src/components/AppSearch.spec.ts` | 新建 | Ctrl+K 触发 focus 测试 |
| `src/components/EmptyState.vue` | 新建 | 图标块 + title + hint |
| `src/components/EmptyState.spec.ts` | 新建 | title / hint 渲染测试 |
| `src/views/user/Index.vue` | 重写 | PageHeader + EmptyState 骨架 |
| `src/views/admin/Index.vue` | 重写 | PageHeader + EmptyState 骨架 |
| `src/views/song/Index.vue` | 重写 | PageHeader + EmptyState 骨架 |
| `src/views/album/Index.vue` | 重写 | PageHeader + EmptyState 骨架 |
| `src/views/approval/Index.vue` | 重写 | PageHeader + EmptyState 骨架 |
| `src/views/home/Index.vue` | 重写 | 欢迎卡 + 4 个 StatCard(横向 grid) |
| `src/layouts/AdminLayout.vue` | 重写 | 顶栏 + 折叠侧栏 + 面包屑 + router-view |
| `src/views/login/Index.vue` | 重写 | 分屏布局(左渐变品牌 / 右表单) |

**严格不动**:`src/api/`、`src/store/`、`src/utils/`、`src/permission.ts`、`src/router/`、`src/main.ts`、`src/App.vue`、所有 spec 文件(auth-flow / permission / request / auth / api)。

---

## Task 0: 扩展设计令牌(variables.scss)

**Files:**
- Modify: `src/styles/variables.scss`(完全覆盖)

- [ ] **Step 1: 覆盖 variables.scss**

把 `src/styles/variables.scss` 完整内容替换为:

```scss
// ========== 主色(玫红) ==========
$primary-color: #f43f5e;
$primary-soft: #ffe4e6;
$primary-dark: #be123c;

// ========== 反馈色 ==========
$success-color: #10b981;
$warning-color: #f59e0b;
$danger-color: #ef4444;
$info-color: #909399;

// ========== 中性色 ==========
$text-primary: #0f172a;
$text-secondary: #475569;
$text-tertiary: #94a3b8;
$bg-page: #f8fafc;
$bg-surface: #ffffff;
$bg-subtle: #fafafa;
$border-base: #e2e8f0;
$border-subtle: #f1f5f9;

// ========== 布局尺寸 ==========
$sidebar-width: 220px;
$sidebar-collapsed-width: 64px;
$header-height: 56px;
$breadcrumb-height: 40px;

// ========== 间距 ==========
$spacing-xs: 4px;
$spacing-sm: 8px;
$spacing-md: 16px;
$spacing-lg: 24px;
$spacing-xl: 32px;

// ========== 字号 ==========
$font-size-2xs: 11px;
$font-size-xs: 12px;
$font-size-sm: 14px;
$font-size-md: 16px;
$font-size-lg: 18px;
$font-size-xl: 20px;
$font-size-2xl: 22px;

// ========== 圆角 ==========
$radius-sm: 4px;
$radius-md: 6px;
$radius-lg: 8px;

// ========== 阴影 ==========
$shadow-card: 0 1px 2px rgba(15, 23, 42, 0.04);
$shadow-popover: 0 4px 12px rgba(15, 23, 42, 0.08);

// ========== 字体栈 ==========
$font-family: -apple-system, BlinkMacSystemFont, 'Inter',
  'PingFang SC', 'Microsoft YaHei', sans-serif;
```

- [ ] **Step 2: 验证 type-check 通过(SCSS 编译也算)**
- (后面 Task 1+ 后一并跑,这里不重复)

- [ ] **Step 3: 提交**

```bash
cd "C:/Users/17599/Desktop/Auramix/frontend"
git add src/styles/variables.scss
git commit -m "feat(styles): 扩展设计令牌(玫红主色/中性色/圆角/阴影/字体)"
```

---

## Task 1: 同步 CSS 变量 + 字体/底色更新

**Files:**
- Modify: `src/styles/index.scss`(完全覆盖)
- Modify: `src/styles/reset.scss`(替换字体/底色段)

- [ ] **Step 1: 覆盖 index.scss**

把 `src/styles/index.scss` 完整内容替换为:

```scss
@use './reset.scss';
@use './variables.scss' as *;

// 同步 Element Plus CSS 变量 + 新增 admin 令牌
:root {
  // Element Plus
  --el-color-primary: #{$primary-color};
  --el-color-success: #{$success-color};
  --el-color-warning: #{$warning-color};
  --el-color-danger: #{$danger-color};
  --el-color-info: #{$info-color};

  // Admin 自定义令牌(组件可消费)
  --admin-text-primary: #{$text-primary};
  --admin-text-secondary: #{$text-secondary};
  --admin-text-tertiary: #{$text-tertiary};
  --admin-bg-page: #{$bg-page};
  --admin-bg-surface: #{$bg-surface};
  --admin-bg-subtle: #{$bg-subtle};
  --admin-border-base: #{$border-base};
  --admin-border-subtle: #{$border-subtle};
  --admin-primary-soft: #{$primary-soft};
  --admin-radius-md: #{$radius-md};
  --admin-shadow-card: #{$shadow-card};
}
```

- [ ] **Step 2: 修改 reset.scss 的字体/底色段**

把 `src/styles/reset.scss` 中 `html, body { ... }` 块(原第 9-21 行)替换为:

```scss
html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: $font-family;
  font-size: $font-size-sm;
  color: $text-primary;
  background-color: $bg-page;
  -webkit-font-smoothing: antialiased;
}
```

注意:`#app { height: 100%; }` 和 a / button 块保持不动。

- [ ] **Step 3: 验证样式编译通过(后续 Task 一并跑)**

- [ ] **Step 4: 提交**

```bash
cd "C:/Users/17599/Desktop/Auramix/frontend"
git add src/styles/index.scss src/styles/reset.scss
git commit -m "feat(styles): 同步 CSS 变量 + 更新字体/底色到设计令牌"
```

---

## Task 2: PageHeader 组件(TDD)

**Files:**
- Create: `src/components/PageHeader.vue`
- Create: `src/components/PageHeader.spec.ts`

- [ ] **Step 1: 写失败测试**

```ts
// src/components/PageHeader.spec.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PageHeader from './PageHeader.vue'

describe('PageHeader', () => {
  it('renders title', () => {
    const wrapper = mount(PageHeader, { props: { title: '用户管理' } })
    expect(wrapper.text()).toContain('用户管理')
  })

  it('renders subtitle when provided', () => {
    const wrapper = mount(PageHeader, {
      props: { title: '用户管理', subtitle: '管理平台所有用户信息' },
    })
    expect(wrapper.text()).toContain('管理平台所有用户信息')
  })

  it('does not render subtitle element when subtitle is missing', () => {
    const wrapper = mount(PageHeader, { props: { title: '主页' } })
    expect(wrapper.find('.page-header__subtitle').exists()).toBe(false)
  })

  it('renders #actions slot', () => {
    const wrapper = mount(PageHeader, {
      props: { title: '用户管理' },
      slots: { actions: '<button class="action-test">新建</button>' },
    })
    expect(wrapper.find('.action-test').exists()).toBe(true)
    expect(wrapper.find('.action-test').text()).toBe('新建')
  })
})
```

- [ ] **Step 2: 跑测试确认失败**

```bash
cd "C:/Users/17599/Desktop/Auramix/frontend"
npx vitest run src/components/PageHeader.spec.ts
```

Expected: FAIL `Cannot find module './PageHeader.vue'`。

- [ ] **Step 3: 实现 PageHeader.vue**

```vue
<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
}>()
</script>

<template>
  <div class="page-header">
    <div class="page-header__main">
      <h1 class="page-header__title">{{ title }}</h1>
      <p v-if="subtitle" class="page-header__subtitle">{{ subtitle }}</p>
    </div>
    <div class="page-header__actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: $spacing-md;
  padding: $spacing-lg $spacing-md;
  border-bottom: 1px solid $border-subtle;
  background: $bg-surface;

  &__main {
    flex: 1;
    min-width: 0;
  }

  &__title {
    margin: 0 0 $spacing-xs;
    font-size: $font-size-2xl;
    font-weight: 600;
    color: $text-primary;
    line-height: 1.3;
  }

  &__subtitle {
    margin: 0;
    font-size: $font-size-sm;
    color: $text-tertiary;
    line-height: 1.4;
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    flex-shrink: 0;
  }
}
</style>
```

- [ ] **Step 4: 跑测试确认通过**

```bash
cd "C:/Users/17599/Desktop/Auramix/frontend"
npx vitest run src/components/PageHeader.spec.ts
```

Expected: 4 个 PASS。

- [ ] **Step 5: 提交**

```bash
cd "C:/Users/17599/Desktop/Auramix/frontend"
git add src/components/PageHeader.vue src/components/PageHeader.spec.ts
git commit -m "feat(component): 新增 PageHeader(标题/副标题/actions 插槽)"
```

---

## Task 3: EmptyState 组件(TDD)

**Files:**
- Create: `src/components/EmptyState.vue`
- Create: `src/components/EmptyState.spec.ts`

- [ ] **Step 1: 写失败测试**

```ts
// src/components/EmptyState.spec.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import EmptyState from './EmptyState.vue'

describe('EmptyState', () => {
  it('renders title', () => {
    const wrapper = mount(EmptyState, {
      props: { icon: 'User', title: '用户管理' },
    })
    expect(wrapper.text()).toContain('用户管理')
  })

  it('renders hint when provided', () => {
    const wrapper = mount(EmptyState, {
      props: { icon: 'User', title: '用户管理', hint: '功能开发中' },
    })
    expect(wrapper.text()).toContain('功能开发中')
  })

  it('does not render hint element when hint is missing', () => {
    const wrapper = mount(EmptyState, {
      props: { icon: 'User', title: '用户管理' },
    })
    expect(wrapper.find('.empty-state__hint').exists()).toBe(false)
  })
})
```

- [ ] **Step 2: 跑测试确认失败**

```bash
cd "C:/Users/17599/Desktop/Auramix/frontend"
npx vitest run src/components/EmptyState.spec.ts
```

Expected: FAIL `Cannot find module './EmptyState.vue'`。

- [ ] **Step 3: 实现 EmptyState.vue**

```vue
<script setup lang="ts">
import { User } from '@element-plus/icons-vue'
import * as ElIcons from '@element-plus/icons-vue'

defineProps<{
  icon: string
  title: string
  hint?: string
}>()

// 根据字符串名解析 icon 组件
const iconMap = ElIcons as unknown as Record<string, unknown>
function resolveIcon(name: string) {
  return iconMap[name] || User
}
</script>

<template>
  <div class="empty-state">
    <div class="empty-state__icon">
      <component :is="resolveIcon(icon)" :size="22" />
    </div>
    <h3 class="empty-state__title">{{ title }}</h3>
    <p v-if="hint" class="empty-state__hint">{{ hint }}</p>
  </div>
</template>

<style scoped lang="scss">
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $spacing-xl * 2 $spacing-md;
  text-align: center;

  &__icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: $primary-soft;
    color: $primary-color;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: $spacing-md;
  }

  &__title {
    margin: 0 0 $spacing-xs;
    font-size: $font-size-md;
    font-weight: 600;
    color: $text-primary;
  }

  &__hint {
    margin: 0;
    font-size: $font-size-sm;
    color: $text-tertiary;
  }
}
</style>
```

- [ ] **Step 4: 跑测试确认通过**

```bash
cd "C:/Users/17599/Desktop/Auramix/frontend"
npx vitest run src/components/EmptyState.spec.ts
```

Expected: 3 个 PASS。

- [ ] **Step 5: 提交**

```bash
cd "C:/Users/17599/Desktop/Auramix/frontend"
git add src/components/EmptyState.vue src/components/EmptyState.spec.ts
git commit -m "feat(component): 新增 EmptyState(图标块 + 标题 + 副标题)"
```

---

## Task 4: Breadcrumb 组件(TDD)

**Files:**
- Create: `src/components/Breadcrumb.vue`
- Create: `src/components/Breadcrumb.spec.ts`

- [ ] **Step 1: 写失败测试**

```ts
// src/components/Breadcrumb.spec.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import Breadcrumb from './Breadcrumb.vue'

const routes = [
  {
    path: '/',
    component: { template: '<div />' },
    children: [
      {
        path: 'home',
        component: { template: '<div />' },
        meta: { title: '主页' },
        children: [
          {
            path: 'dashboard',
            component: { template: '<div />' },
            meta: { title: '仪表盘' },
          },
        ],
      },
    ],
  },
]

async function setupAt(path: string) {
  const router = createRouter({ history: createMemoryHistory(), routes })
  router.push(path)
  await router.isReady()
  const wrapper = mount(Breadcrumb, {
    global: { plugins: [router] },
  })
  return { wrapper, router }
}

describe('Breadcrumb', () => {
  beforeEach(() => {
    // happy-dom 提供 window/document
  })

  it('renders crumbs from route.matched meta titles', async () => {
    const { wrapper } = await setupAt('/home/dashboard')
    expect(wrapper.text()).toContain('主页')
    expect(wrapper.text()).toContain('仪表盘')
  })

  it('uses / as separator', async () => {
    const { wrapper } = await setupAt('/home/dashboard')
    expect(wrapper.text()).toContain('/')
  })
})
```

- [ ] **Step 2: 跑测试确认失败**

```bash
cd "C:/Users/17599/Desktop/Auramix/frontend"
npx vitest run src/components/Breadcrumb.spec.ts
```

Expected: FAIL `Cannot find module './Breadcrumb.vue'`。

- [ ] **Step 3: 实现 Breadcrumb.vue**

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

interface Crumb {
  title: string
  path: string
}

const crumbs = computed<Crumb[]>(() => {
  const matched = route.matched
    .filter(r => r.meta?.title)
    .map(r => ({ title: r.meta.title as string, path: r.path }))
  // 末级不可点:除最后一项外都加 path,最后一项用空 path
  return matched.map((c, i) => ({
    title: c.title,
    path: i === matched.length - 1 ? '' : c.path,
  }))
})

function handleClick(c: Crumb) {
  if (!c.path) return
  router.push(c.path)
}
</script>

<template>
  <nav class="breadcrumb" aria-label="breadcrumb">
    <template v-for="(c, i) in crumbs" :key="c.path || i">
      <span
        v-if="i > 0"
        class="breadcrumb__sep"
      >/</span>
      <a
        v-if="c.path"
        class="breadcrumb__link"
        @click.prevent="handleClick(c)"
      >{{ c.title }}</a>
      <span v-else class="breadcrumb__current">{{ c.title }}</span>
    </template>
  </nav>
</template>

<style scoped lang="scss">
.breadcrumb {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  height: $breadcrumb-height;
  padding: 0 $spacing-md;
  background: $bg-page;
  border-bottom: 1px solid $border-subtle;
  font-size: $font-size-sm;

  &__sep {
    color: $text-tertiary;
  }

  &__link {
    color: $text-secondary;
    cursor: pointer;
    transition: color 150ms;

    &:hover {
      color: $primary-color;
    }
  }

  &__current {
    color: $text-primary;
    font-weight: 500;
  }
}
</style>
```

- [ ] **Step 4: 跑测试确认通过**

```bash
cd "C:/Users/17599/Desktop/Auramix/frontend"
npx vitest run src/components/Breadcrumb.spec.ts
```

Expected: 2 个 PASS。

- [ ] **Step 5: 提交**

```bash
cd "C:/Users/17599/Desktop/Auramix/frontend"
git add src/components/Breadcrumb.vue src/components/Breadcrumb.spec.ts
git commit -m "feat(component): 新增 Breadcrumb(从 route.matched 派生)"
```

---

## Task 5: AppSearch 组件(TDD)

**Files:**
- Create: `src/components/AppSearch.vue`
- Create: `src/components/AppSearch.spec.ts`

- [ ] **Step 1: 写失败测试**

```ts
// src/components/AppSearch.spec.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import AppSearch from './AppSearch.vue'

describe('AppSearch', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders input with default placeholder', () => {
    const wrapper = mount(AppSearch)
    const input = wrapper.find('input')
    expect(input.exists()).toBe(true)
    expect(input.attributes('placeholder')).toBe('搜索 ⌘K')
  })

  it('renders custom placeholder when prop provided', () => {
    const wrapper = mount(AppSearch, { props: { placeholder: '搜索歌曲' } })
    const input = wrapper.find('input')
    expect(input.attributes('placeholder')).toBe('搜索歌曲')
  })

  it('focuses input on Ctrl+K keydown', async () => {
    const wrapper = mount(AppSearch, { attachTo: document.body })
    const input = wrapper.find('input').element as HTMLInputElement
    const focusSpy = vi.spyOn(input, 'focus')

    window.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }),
    )
    await wrapper.vm.$nextTick()

    expect(focusSpy).toHaveBeenCalled()
    wrapper.unmount()
  })
})
```

- [ ] **Step 2: 跑测试确认失败**

```bash
cd "C:/Users/17599/Desktop/Auramix/frontend"
npx vitest run src/components/AppSearch.spec.ts
```

Expected: FAIL `Cannot find module './AppSearch.vue'`。

- [ ] **Step 3: 实现 AppSearch.vue**

```vue
<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { Search } from '@element-plus/icons-vue'

withDefaults(
  defineProps<{ placeholder?: string }>(),
  { placeholder: '搜索 ⌘K' },
)

const inputRef = ref<HTMLInputElement | null>(null)

function onKeydown(e: KeyboardEvent) {
  // Ctrl+K (Win/Linux) 或 ⌘K (Mac)
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    inputRef.value?.focus()
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <div class="app-search">
    <el-icon class="app-search__icon"><Search /></el-icon>
    <input
      ref="inputRef"
      type="text"
      class="app-search__input"
      :placeholder="placeholder"
      @change="(e) => console.log('search:', (e.target as HTMLInputElement).value)"
    >
    <span class="app-search__shortcut">⌘K</span>
  </div>
</template>

<style scoped lang="scss">
.app-search {
  position: relative;
  display: flex;
  align-items: center;
  height: 32px;
  padding: 0 $spacing-sm;
  background: $bg-subtle;
  border: 1px solid $border-base;
  border-radius: $radius-md;
  max-width: 320px;
  transition: border-color 150ms, background 150ms;

  &:focus-within {
    border-color: $primary-color;
    background: $bg-surface;
  }

  &__icon {
    color: $text-tertiary;
    margin-right: $spacing-sm;
    font-size: 14px;
  }

  &__input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    font-size: $font-size-sm;
    color: $text-primary;
    min-width: 0;

    &::placeholder {
      color: $text-tertiary;
    }
  }

  &__shortcut {
    color: $text-tertiary;
    font-size: $font-size-xs;
    font-family: ui-monospace, 'SF Mono', Menlo, monospace;
    padding: 2px $spacing-xs;
    border: 1px solid $border-base;
    border-radius: $radius-sm;
    background: $bg-surface;
    flex-shrink: 0;
  }
}
</style>
```

- [ ] **Step 4: 跑测试确认通过**

```bash
cd "C:/Users/17599/Desktop/Auramix/frontend"
npx vitest run src/components/AppSearch.spec.ts
```

Expected: 3 个 PASS。

- [ ] **Step 5: 提交**

```bash
cd "C:/Users/17599/Desktop/Auramix/frontend"
git add src/components/AppSearch.vue src/components/AppSearch.spec.ts
git commit -m "feat(component): 新增 AppSearch(搜索框 + ⌘K 快捷键占位)"
```

---

## Task 6: StatCard 组件(TDD,精细化)

**Files:**
- Create: `src/components/StatCard.vue`
- Create: `src/components/StatCard.spec.ts`

- [ ] **Step 1: 写失败测试**

```ts
// src/components/StatCard.spec.ts
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import StatCard from './StatCard.vue'

// mock vue-router 避免依赖(虽然 StatCard 不直接用 router,但保全局稳定)
const routerPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: routerPush }),
}))

describe('StatCard', () => {
  it('renders value and label', () => {
    const wrapper = mount(StatCard, {
      props: { icon: 'Headset', label: '歌曲数', value: 1284 },
    })
    expect(wrapper.text()).toContain('歌曲数')
    expect(wrapper.text()).toContain('1284')
  })

  it('shows up arrow + green for positive delta', () => {
    const wrapper = mount(StatCard, {
      props: { icon: 'Headset', label: '歌曲数', value: 1284, delta: 12 },
    })
    const delta = wrapper.find('.stat-card__delta')
    expect(delta.exists()).toBe(true)
    expect(delta.text()).toContain('↑')
    expect(delta.text()).toContain('12')
    expect(delta.classes()).toContain('stat-card__delta--up')
  })

  it('shows down arrow + red for negative delta', () => {
    const wrapper = mount(StatCard, {
      props: { icon: 'User', label: '用户数', value: 3402, delta: -3 },
    })
    const delta = wrapper.find('.stat-card__delta')
    expect(delta.text()).toContain('↓')
    expect(delta.text()).toContain('3')
    expect(delta.classes()).toContain('stat-card__delta--down')
  })

  it('shows dash + gray for zero delta', () => {
    const wrapper = mount(StatCard, {
      props: { icon: 'Plus', label: '今日新增', value: 12, delta: 0 },
    })
    const delta = wrapper.find('.stat-card__delta')
    expect(delta.text()).toContain('—')
    expect(delta.text()).toContain('0')
    expect(delta.classes()).toContain('stat-card__delta--flat')
  })

  it('does not render delta block when delta is undefined', () => {
    const wrapper = mount(StatCard, {
      props: { icon: 'Headset', label: '歌曲数', value: 1284 },
    })
    expect(wrapper.find('.stat-card__delta').exists()).toBe(false)
  })

  it('navigates via router.push when href provided and clicked', async () => {
    const wrapper = mount(StatCard, {
      props: { icon: 'Headset', label: '歌曲数', value: 1284, href: '/song' },
    })
    await wrapper.trigger('click')
    expect(routerPush).toHaveBeenCalledWith('/song')
  })
})
```

- [ ] **Step 2: 跑测试确认失败**

```bash
cd "C:/Users/17599/Desktop/Auramix/frontend"
npx vitest run src/components/StatCard.spec.ts
```

Expected: FAIL `Cannot find module './StatCard.vue'`。

- [ ] **Step 3: 实现 StatCard.vue**

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Headset } from '@element-plus/icons-vue'
import * as ElIcons from '@element-plus/icons-vue'

const props = defineProps<{
  icon: string
  label: string
  value: string | number
  delta?: number
  href?: string
}>()

const router = useRouter()

const iconMap = ElIcons as unknown as Record<string, unknown>
function resolveIcon(name: string) {
  return iconMap[name] || Headset
}

const deltaTone = computed<'up' | 'down' | 'flat' | null>(() => {
  if (props.delta === undefined) return null
  if (props.delta > 0) return 'up'
  if (props.delta < 0) return 'down'
  return 'flat'
})

const deltaSymbol = computed(() => {
  if (deltaTone.value === 'up') return '↑'
  if (deltaTone.value === 'down') return '↓'
  return '—'
})

const deltaText = computed(() => {
  if (props.delta === undefined) return ''
  return `${deltaSymbol.value} ${Math.abs(props.delta)}%`
})

function handleClick() {
  if (props.href) router.push(props.href)
}
</script>

<template>
  <div
    class="stat-card"
    :class="{ 'stat-card--link': !!href }"
    role="article"
    @click="handleClick"
  >
    <div class="stat-card__icon">
      <component :is="resolveIcon(icon)" :size="20" />
    </div>
    <div class="stat-card__body">
      <div class="stat-card__label">{{ label }}</div>
      <div class="stat-card__value">{{ value }}</div>
      <div
        v-if="deltaTone"
        class="stat-card__delta"
        :class="`stat-card__delta--${deltaTone}`"
      >
        {{ deltaText }}
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.stat-card {
  display: flex;
  align-items: flex-start;
  gap: $spacing-md;
  padding: $spacing-lg;
  background: $bg-surface;
  border: 1px solid $border-base;
  border-radius: $radius-md;
  transition: transform 150ms ease-out, box-shadow 150ms ease-out, border-color 150ms;

  &--link {
    cursor: pointer;

    &:hover {
      transform: translateY(-1px);
      box-shadow: $shadow-card;
      border-color: $primary-color;
    }
  }

  &__icon {
    flex-shrink: 0;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: $primary-soft;
    color: $primary-color;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__body {
    flex: 1;
    min-width: 0;
  }

  &__label {
    font-size: $font-size-sm;
    color: $text-tertiary;
    margin-bottom: $spacing-xs;
  }

  &__value {
    font-size: $font-size-2xl;
    font-weight: 700;
    color: $text-primary;
    line-height: 1.2;
  }

  &__delta {
    margin-top: $spacing-xs;
    font-size: $font-size-xs;
    font-weight: 500;

    &--up {
      color: $success-color;
    }

    &--down {
      color: $danger-color;
    }

    &--flat {
      color: $text-tertiary;
    }
  }
}
</style>
```

- [ ] **Step 4: 跑测试确认通过**

```bash
cd "C:/Users/17599/Desktop/Auramix/frontend"
npx vitest run src/components/StatCard.spec.ts
```

Expected: 6 个 PASS。

- [ ] **Step 5: 提交**

```bash
cd "C:/Users/17599/Desktop/Auramix/frontend"
git add src/components/StatCard.vue src/components/StatCard.spec.ts
git commit -m "feat(component): 新增 StatCard(精细化:delta 符号/色/箭头自动判定)"
```

---

## Task 7: UserDropdown 组件(TDD,精细化)

**Files:**
- Create: `src/components/UserDropdown.vue`
- Create: `src/components/UserDropdown.spec.ts`

- [ ] **Step 1: 写失败测试**

```ts
// src/components/UserDropdown.spec.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import UserDropdown from './UserDropdown.vue'

// stub el-dropdown 避免依赖 teleport 等
const ElDropdownStub = {
  template: '<div class="el-dropdown"><slot /><slot name="dropdown" /></div>',
}
const ElDropdownMenuStub = { template: '<div class="el-dropdown-menu"><slot /></div>' }
const ElDropdownItemStub = {
  template: '<div class="el-dropdown-item" @click="$emit(\'click\')"><slot /></div>',
  emits: ['click'],
}

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('UserDropdown', () => {
  it('shows username and avatar with first initial', () => {
    const wrapper = mount(UserDropdown, {
      props: { username: 'admin' },
      global: {
        stubs: {
          'el-dropdown': ElDropdownStub,
          'el-dropdown-menu': ElDropdownMenuStub,
          'el-dropdown-item': ElDropdownItemStub,
        },
      },
    })
    expect(wrapper.text()).toContain('admin')
    expect(wrapper.find('.user-dropdown__avatar').text()).toBe('a')
  })

  it('uses uppercase initial for multi-char username', () => {
    const wrapper = mount(UserDropdown, {
      props: { username: 'ZhangSan' },
      global: {
        stubs: {
          'el-dropdown': ElDropdownStub,
          'el-dropdown-menu': ElDropdownMenuStub,
          'el-dropdown-item': ElDropdownItemStub,
        },
      },
    })
    expect(wrapper.find('.user-dropdown__avatar').text()).toBe('Z')
  })

  it('emits logout when 退出登录 clicked', async () => {
    const wrapper = mount(UserDropdown, {
      props: { username: 'admin' },
      global: {
        stubs: {
          'el-dropdown': ElDropdownStub,
          'el-dropdown-menu': ElDropdownMenuStub,
          'el-dropdown-item': ElDropdownItemStub,
        },
      },
    })
    // 找下拉里的"退出登录"项并点击
    const items = wrapper.findAllComponents(ElDropdownItemStub)
    const logoutItem = items.find(i => i.text().includes('退出登录'))
    expect(logoutItem).toBeTruthy()
    await logoutItem!.trigger('click')
    expect(wrapper.emitted('logout')).toBeTruthy()
    expect(wrapper.emitted('logout')!.length).toBe(1)
  })

  it('shows 超级管理员 badge when isRoot=1', () => {
    const wrapper = mount(UserDropdown, {
      props: { username: 'root', isRoot: 1 },
      global: {
        stubs: {
          'el-dropdown': ElDropdownStub,
          'el-dropdown-menu': ElDropdownMenuStub,
          'el-dropdown-item': ElDropdownItemStub,
        },
      },
    })
    // dropdown 内部渲染 role badge
    const html = wrapper.html()
    expect(html).toContain('超级管理员')
  })

  it('shows 普通管理员 badge when isRoot=0', () => {
    const wrapper = mount(UserDropdown, {
      props: { username: 'guest', isRoot: 0 },
      global: {
        stubs: {
          'el-dropdown': ElDropdownStub,
          'el-dropdown-menu': ElDropdownMenuStub,
          'el-dropdown-item': ElDropdownItemStub,
        },
      },
    })
    const html = wrapper.html()
    expect(html).toContain('普通管理员')
  })
})
```

- [ ] **Step 2: 跑测试确认失败**

```bash
cd "C:/Users/17599/Desktop/Auramix/frontend"
npx vitest run src/components/UserDropdown.spec.ts
```

Expected: FAIL `Cannot find module './UserDropdown.vue'`。

- [ ] **Step 3: 实现 UserDropdown.vue**

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { ArrowDown } from '@element-plus/icons-vue'

const props = withDefaults(
  defineProps<{
    username: string
    email?: string
    isRoot?: 0 | 1
  }>(),
  { isRoot: 0, email: '' },
)

defineEmits<{
  logout: []
  profile: []
}>()

const initial = computed(() => {
  return props.username ? props.username.charAt(0).toUpperCase() : '?'
})

const roleLabel = computed(() => (props.isRoot === 1 ? '超级管理员' : '普通管理员'))
</script>

<template>
  <el-dropdown trigger="click" class="user-dropdown">
    <span class="user-dropdown__trigger">
      <span class="user-dropdown__avatar">{{ initial }}</span>
      <span class="user-dropdown__name">{{ username }}</span>
      <el-icon class="user-dropdown__caret"><ArrowDown /></el-icon>
    </span>
    <template #dropdown>
      <el-dropdown-menu>
        <div class="user-dropdown__card">
          <div class="user-dropdown__card-avatar">{{ initial }}</div>
          <div class="user-dropdown__card-info">
            <div class="user-dropdown__card-name">{{ username }}</div>
            <div v-if="email" class="user-dropdown__card-email">{{ email }}</div>
            <div
              class="user-dropdown__card-role"
              :class="{ 'user-dropdown__card-role--root': isRoot === 1 }"
            >
              {{ roleLabel }}
            </div>
          </div>
        </div>
        <el-dropdown-item disabled @click="$emit('profile')">
          个人中心
        </el-dropdown-item>
        <el-dropdown-item divided @click="$emit('logout')">
          退出登录
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<style scoped lang="scss">
.user-dropdown {
  &__trigger {
    display: inline-flex;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-xs $spacing-sm;
    cursor: pointer;
    border-radius: $radius-md;
    transition: background 150ms;

    &:hover {
      background: $bg-subtle;
    }
  }

  &__avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: $primary-soft;
    color: $primary-color;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: $font-size-sm;
    font-weight: 600;
    line-height: 1;
  }

  &__name {
    font-size: $font-size-sm;
    color: $text-primary;
    font-weight: 500;
  }

  &__caret {
    color: $text-tertiary;
    font-size: 12px;
  }

  &__card {
    display: flex;
    align-items: center;
    gap: $spacing-md;
    padding: $spacing-md;
    width: 240px;
    border-bottom: 1px solid $border-subtle;
  }

  &__card-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: $primary-soft;
    color: $primary-color;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: $font-size-md;
    font-weight: 600;
    flex-shrink: 0;
  }

  &__card-info {
    min-width: 0;
    flex: 1;
  }

  &__card-name {
    font-size: $font-size-md;
    font-weight: 600;
    color: $text-primary;
    line-height: 1.2;
  }

  &__card-email {
    font-size: $font-size-xs;
    color: $text-tertiary;
    margin-top: 2px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__card-role {
    display: inline-block;
    margin-top: $spacing-xs;
    padding: 1px $spacing-xs;
    border-radius: $radius-sm;
    font-size: $font-size-2xs;
    background: $bg-subtle;
    color: $text-tertiary;

    &--root {
      background: $primary-soft;
      color: $primary-color;
    }
  }
}
</style>
```

- [ ] **Step 4: 跑测试确认通过**

```bash
cd "C:/Users/17599/Desktop/Auramix/frontend"
npx vitest run src/components/UserDropdown.spec.ts
```

Expected: 5 个 PASS。

- [ ] **Step 5: 提交**

```bash
cd "C:/Users/17599/Desktop/Auramix/frontend"
git add src/components/UserDropdown.vue src/components/UserDropdown.spec.ts
git commit -m "feat(component): 新增 UserDropdown(精细化:头像+下拉卡+角色徽标+退出 emit)"
```

---

## Task 8: 中间验证 — 6 个组件全跑 + 旧测试无回归

**Files:** (无)

- [ ] **Step 1: 跑全套测试**

```bash
cd "C:/Users/17599/Desktop/Auramix/frontend"
npm test
```

Expected:全部 PASS(原 32 个 + 新 23 个 = 55 个)。**任何一个 FAIL 必须先修,不能继续。**

- [ ] **Step 2: 跑 type-check**

```bash
cd "C:/Users/17599/Desktop/Auramix/frontend"
npm run type-check
```

Expected: 退出码 0,无报错。

- [ ] **Step 3: 中间提交(如无变更可跳过)**

```bash
cd "C:/Users/17599/Desktop/Auramix/frontend"
git status  # 应是干净或仅 untracked views
```

---

## Task 9: 5 个占位页统一骨架

**Files:**
- Modify: `src/views/user/Index.vue`(完全重写)
- Modify: `src/views/admin/Index.vue`(完全重写)
- Modify: `src/views/song/Index.vue`(完全重写)
- Modify: `src/views/album/Index.vue`(完全重写)
- Modify: `src/views/approval/Index.vue`(完全重写)

- [ ] **Step 1: 重写 `src/views/user/Index.vue`**

```vue
<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue'
import PageHeader from '@/components/PageHeader.vue'
import EmptyState from '@/components/EmptyState.vue'
</script>

<template>
  <div class="page-user">
    <PageHeader title="用户管理" subtitle="管理平台所有用户信息">
      <template #actions>
        <el-button type="primary">
          <el-icon><Plus /></el-icon>
          新建用户
        </el-button>
      </template>
    </PageHeader>
    <el-card shadow="never" class="page-card">
      <EmptyState icon="User" title="用户管理" hint="功能开发中" />
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.page-card {
  border: 1px solid $border-base;
  border-radius: $radius-md;
  margin-top: $spacing-md;
}
</style>
```

- [ ] **Step 2: 重写 `src/views/admin/Index.vue`**

```vue
<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue'
import PageHeader from '@/components/PageHeader.vue'
import EmptyState from '@/components/EmptyState.vue'
</script>

<template>
  <div class="page-admin">
    <PageHeader title="管理员管理" subtitle="管理平台超级管理员账号(仅超级管理员可见)">
      <template #actions>
        <el-button type="primary">
          <el-icon><Plus /></el-icon>
          新建管理员
        </el-button>
      </template>
    </PageHeader>
    <el-card shadow="never" class="page-card">
      <EmptyState icon="UserFilled" title="管理员管理" hint="功能开发中" />
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.page-card {
  border: 1px solid $border-base;
  border-radius: $radius-md;
  margin-top: $spacing-md;
}
</style>
```

- [ ] **Step 3: 重写 `src/views/song/Index.vue`**

```vue
<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue'
import PageHeader from '@/components/PageHeader.vue'
import EmptyState from '@/components/EmptyState.vue'
</script>

<template>
  <div class="page-song">
    <PageHeader title="歌曲管理" subtitle="管理平台曲库所有歌曲">
      <template #actions>
        <el-button type="primary">
          <el-icon><Plus /></el-icon>
          新建歌曲
        </el-button>
      </template>
    </PageHeader>
    <el-card shadow="never" class="page-card">
      <EmptyState icon="Headset" title="歌曲管理" hint="功能开发中" />
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.page-card {
  border: 1px solid $border-base;
  border-radius: $radius-md;
  margin-top: $spacing-md;
}
</style>
```

- [ ] **Step 4: 重写 `src/views/album/Index.vue`**

```vue
<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue'
import PageHeader from '@/components/PageHeader.vue'
import EmptyState from '@/components/EmptyState.vue'
</script>

<template>
  <div class="page-album">
    <PageHeader title="专辑管理" subtitle="管理平台所有专辑">
      <template #actions>
        <el-button type="primary">
          <el-icon><Plus /></el-icon>
          新建专辑
        </el-button>
      </template>
    </PageHeader>
    <el-card shadow="never" class="page-card">
      <EmptyState icon="Collection" title="专辑管理" hint="功能开发中" />
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.page-card {
  border: 1px solid $border-base;
  border-radius: $radius-md;
  margin-top: $spacing-md;
}
</style>
```

- [ ] **Step 5: 重写 `src/views/approval/Index.vue`**

```vue
<script setup lang="ts">
import PageHeader from '@/components/PageHeader.vue'
import EmptyState from '@/components/EmptyState.vue'
</script>

<template>
  <div class="page-approval">
    <PageHeader title="智能审批" subtitle="审核歌曲 / 专辑上传请求" />
    <el-card shadow="never" class="page-card">
      <EmptyState icon="CircleCheck" title="智能审批" hint="功能开发中" />
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.page-card {
  border: 1px solid $border-base;
  border-radius: $radius-md;
  margin-top: $spacing-md;
}
</style>
```

- [ ] **Step 6: 跑测试 + type-check**

```bash
cd "C:/Users/17599/Desktop/Auramix/frontend"
npm test && npm run type-check
```

Expected: 55 测试全 PASS,type-check 0 错。

- [ ] **Step 7: 提交**

```bash
cd "C:/Users/17599/Desktop/Auramix/frontend"
git add src/views/user/Index.vue src/views/admin/Index.vue src/views/song/Index.vue src/views/album/Index.vue src/views/approval/Index.vue
git commit -m "feat(views): 5 个占位页统一骨架(PageHeader + EmptyState)"
```

---

## Task 10: 主页加 4 个 StatCard

**Files:**
- Modify: `src/views/home/Index.vue`(完全重写)

- [ ] **Step 1: 重写 `src/views/home/Index.vue`**

```vue
<script setup lang="ts">
import { useAuthStore } from '@/store/modules/auth'
import PageHeader from '@/components/PageHeader.vue'
import StatCard from '@/components/StatCard.vue'

const auth = useAuthStore()

// 临时 mock 数据,接入 API 后替换
const stats = [
  { icon: 'Headset', label: '歌曲数', value: 1284, delta: 12, href: '/song' },
  { icon: 'User', label: '用户数', value: 3402, delta: 5, href: '/user' },
  { icon: 'CircleCheck', label: '待审批', value: 28, delta: -3, href: '/approval' },
  { icon: 'Plus', label: '今日新增', value: 12, delta: 0, href: '/home' },
]
</script>

<template>
  <div class="page-home">
    <PageHeader
      :title="`欢迎回来,${auth.profile?.username ?? ''}`"
      subtitle="这里是 Auramix Admin 的总览数据"
    />
    <div class="page-home__stats">
      <StatCard
        v-for="s in stats"
        :key="s.label"
        :icon="s.icon"
        :label="s.label"
        :value="s.value"
        :delta="s.delta"
        :href="s.href"
      />
    </div>
    <el-card shadow="never" class="page-home__recent">
      <template #header>
        <span class="page-home__recent-title">最近活动</span>
      </template>
      <el-empty description="暂无最近活动" :image-size="80" />
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.page-home {
  &__stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: $spacing-md;
    padding: $spacing-md;
  }

  &__recent {
    margin: 0 $spacing-md $spacing-md;
    border: 1px solid $border-base;
    border-radius: $radius-md;
  }

  &__recent-title {
    font-size: $font-size-md;
    font-weight: 600;
    color: $text-primary;
  }
}

@media (max-width: 1024px) {
  .page-home__stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .page-home__stats {
    grid-template-columns: 1fr;
  }
}
</style>
```

- [ ] **Step 2: 跑测试 + type-check**

```bash
cd "C:/Users/17599/Desktop/Auramix/frontend"
npm test && npm run type-check
```

Expected: 全 PASS。

- [ ] **Step 3: 提交**

```bash
cd "C:/Users/17599/Desktop/Auramix/frontend"
git add src/views/home/Index.vue
git commit -m "feat(home): 主页加 4 个 StatCard(歌曲/用户/待审/今日新增,mock 数据)"
```

---

## Task 11: 重写 AdminLayout(可折叠侧栏 + 顶栏 + 面包屑)

**Files:**
- Modify: `src/layouts/AdminLayout.vue`(完全重写)

- [ ] **Step 1: 重写 `src/layouts/AdminLayout.vue`**

```vue
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Bell, Expand, Fold, House, User, UserFilled, Headset, Collection, CircleCheck } from '@element-plus/icons-vue'
import { useAuthStore } from '@/store/modules/auth'
import UserDropdown from '@/components/UserDropdown.vue'
import AppSearch from '@/components/AppSearch.vue'
import Breadcrumb from '@/components/Breadcrumb.vue'

const STORAGE_KEY = 'admin-sidebar-collapsed'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const collapsed = ref(false)
const isMobile = ref(false)
const drawerVisible = ref(false)

function readCollapsedFromStorage(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  }
  catch {
    return false
  }
}

function writeCollapsedToStorage(v: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, v ? '1' : '0')
  }
  catch {
    // localStorage 不可用时静默忽略
  }
}

onMounted(() => {
  collapsed.value = readCollapsedFromStorage()
  isMobile.value = window.innerWidth < 768
  window.addEventListener('resize', onResize)
})

function onResize() {
  const next = window.innerWidth < 768
  if (next !== isMobile.value) {
    isMobile.value = next
    if (!next) drawerVisible.value = false
  }
}

function toggleCollapsed() {
  if (isMobile.value) {
    drawerVisible.value = !drawerVisible.value
  }
  else {
    collapsed.value = !collapsed.value
    writeCollapsedToStorage(collapsed.value)
  }
}

async function handleLogout() {
  await auth.logout()
  router.push('/login')
}

interface MenuItem {
  path: string
  label: string
  icon: unknown
  rootOnly?: boolean
}

const allMenus: MenuItem[] = [
  { path: '/home', label: '主页', icon: House },
  { path: '/user', label: '用户管理', icon: User },
  { path: '/admin', label: '管理员管理', icon: UserFilled, rootOnly: true },
  { path: '/song', label: '歌曲管理', icon: Headset },
  { path: '/album', label: '专辑管理', icon: Collection },
  { path: '/approval', label: '智能审批', icon: CircleCheck },
]

const visibleMenus = computed(() =>
  allMenus.filter(m => !m.rootOnly || auth.profile?.isRoot === 1),
)

const sidebarWidth = computed(() => (collapsed.value ? $sidebar-collapsed-width : $sidebar-width))
</script>

<template>
  <div class="admin-layout">
    <!-- 顶栏 -->
    <header class="admin-header">
      <div class="admin-header__left">
        <button
          class="admin-header__toggle"
          :aria-label="collapsed ? '展开侧栏' : '折叠侧栏'"
          @click="toggleCollapsed"
        >
          <el-icon :size="18">
            <Fold v-if="!isMobile && !collapsed" />
            <Expand v-else />
          </el-icon>
        </button>
        <span class="admin-header__brand">♪ Auramix</span>
        <AppSearch class="admin-header__search" />
      </div>
      <div class="admin-header__right">
        <el-badge :value="0" :show-zero="false" class="admin-header__bell">
          <el-icon :size="18"><Bell /></el-icon>
        </el-badge>
        <UserDropdown
          :username="auth.profile?.username ?? ''"
          :email="auth.profile?.email ?? ''"
          :is-root="(auth.profile?.isRoot ?? 0) as 0 | 1"
          @logout="handleLogout"
        />
      </div>
    </header>

    <div class="admin-body">
      <!-- 桌面侧栏 -->
      <aside
        v-if="!isMobile"
        class="admin-sidebar"
        :class="{ 'admin-sidebar--collapsed': collapsed }"
        :style="{ width: `${sidebarWidth}px` }"
      >
        <el-menu
          :default-active="route.path"
          :collapse="collapsed"
          :collapse-transition="false"
          router
          class="admin-menu"
        >
          <el-menu-item
            v-for="m in visibleMenus"
            :key="m.path"
            :index="m.path"
          >
            <el-icon><component :is="m.icon" /></el-icon>
            <template #title>{{ m.label }}</template>
          </el-menu-item>
        </el-menu>
      </aside>

      <!-- 移动端 drawer -->
      <el-drawer
        v-if="isMobile"
        v-model="drawerVisible"
        direction="ltr"
        :with-header="false"
        size="220px"
      >
        <el-menu
          :default-active="route.path"
          router
          class="admin-menu"
          @select="drawerVisible = false"
        >
          <el-menu-item
            v-for="m in visibleMenus"
            :key="m.path"
            :index="m.path"
          >
            <el-icon><component :is="m.icon" /></el-icon>
            <template #title>{{ m.label }}</template>
          </el-menu-item>
        </el-menu>
      </el-drawer>

      <!-- 主区 -->
      <main class="admin-main">
        <Breadcrumb class="admin-main__crumb" />
        <div class="admin-main__content">
          <router-view />
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped lang="scss">
.admin-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: $bg-page;
}

.admin-header {
  position: sticky;
  top: 0;
  z-index: 10;
  height: $header-height;
  padding: 0 $spacing-lg;
  background: $bg-surface;
  border-bottom: 1px solid $border-subtle;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;

  &__left {
    display: flex;
    align-items: center;
    gap: $spacing-md;
    flex: 1;
    min-width: 0;
  }

  &__toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    background: transparent;
    color: $text-secondary;
    cursor: pointer;
    border-radius: $radius-md;
    transition: background 150ms;

    &:hover {
      background: $bg-subtle;
      color: $text-primary;
    }
  }

  &__brand {
    font-size: $font-size-md;
    font-weight: 600;
    color: $text-primary;
    flex-shrink: 0;
  }

  &__search {
    margin-left: $spacing-md;
    flex: 1;
    max-width: 320px;
  }

  &__right {
    display: flex;
    align-items: center;
    gap: $spacing-md;
    flex-shrink: 0;
  }

  &__bell {
    color: $text-secondary;
    cursor: pointer;
    display: flex;
    align-items: center;
  }
}

.admin-body {
  flex: 1;
  display: flex;
  min-height: 0;
}

.admin-sidebar {
  background: $bg-surface;
  border-right: 1px solid $border-subtle;
  flex-shrink: 0;
  transition: width 200ms ease-out;
  overflow: hidden;

  &--collapsed {
    :deep(.el-menu-item) {
      padding: 0 !important;
      justify-content: center;
    }
  }
}

.admin-menu {
  height: 100%;
  border-right: none;

  // 主色只点缀:激活态用深色背景 + 白字
  :deep(.el-menu-item.is-active) {
    background: $text-primary !important;
    color: #fff !important;

    .el-icon {
      color: #fff !important;
    }
  }
}

.admin-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: auto;

  &__content {
    flex: 1;
    padding: 0;
  }
}
</style>
```

- [ ] **Step 2: 跑测试 + type-check**

```bash
cd "C:/Users/17599/Desktop/Auramix/frontend"
npm test && npm run type-check
```

Expected: 全 PASS(AdminLayout 本身不写 spec;通过 type-check + 现有 auth-flow 集成测试间接覆盖)。

- [ ] **Step 3: 提交**

```bash
cd "C:/Users/17599/Desktop/Auramix/frontend"
git add src/layouts/AdminLayout.vue
git commit -m "feat(layout): 重写 AdminLayout(可折叠侧栏+顶栏+搜索+用户下拉+面包屑)"
```

---

## Task 12: 重写登录页(分屏布局)

**Files:**
- Modify: `src/views/login/Index.vue`(完全重写)

- [ ] **Step 1: 重写 `src/views/login/Index.vue`**

```vue
<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
import { useAuthStore } from '@/store/modules/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const formRef = ref<FormInstance>()
const form = reactive({
  username: '',
  password: '',
})

const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

const tip = ref('')

onMounted(() => {
  if (route.query.expired === '1') tip.value = '会话已过期,请重新登录'
  else if (route.query.disabled === '1') tip.value = '账号已被停用'
})

async function handleSubmit() {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
    await auth.login({ username: form.username, password: form.password })
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/home'
    await router.push(redirect)
  }
  catch {
    // 校验失败或登录失败,拦截器已弹 ElMessage
  }
}
</script>

<template>
  <div class="page-login">
    <!-- 左:品牌渐变 -->
    <div class="page-login__brand">
      <div class="page-login__brand-top">
        <div class="page-login__brand-logo">AURAMIX</div>
        <div class="page-login__brand-tag">Admin Console</div>
      </div>
      <div class="page-login__brand-middle">
        <h1 class="page-login__brand-title">管理你的音乐世界</h1>
        <p class="page-login__brand-sub">
          歌曲 / 专辑 / 智能审批<br>
          一站式后台
        </p>
      </div>
      <div class="page-login__brand-bottom">© 2026 Auramix</div>
    </div>

    <!-- 右:表单 -->
    <div class="page-login__form-wrap">
      <div class="page-login__form">
        <h2 class="page-login__form-title">欢迎回来</h2>
        <p class="page-login__form-sub">请登录你的账号</p>

        <el-alert
          v-if="tip"
          :title="tip"
          type="warning"
          :closable="false"
          show-icon
          class="page-login__tip"
        />

        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-position="top"
          autocomplete="off"
        >
          <el-form-item label="用户名" prop="username">
            <el-input v-model="form.username" placeholder="请输入用户名" />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="请输入密码"
              show-password
              @keyup.enter="handleSubmit"
            />
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              :loading="auth.loading"
              class="page-login__submit"
              @click="handleSubmit"
            >
              登录
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.page-login {
  min-height: 100vh;
  display: flex;
  background: $bg-page;

  &__brand {
    flex: 1;
    background: linear-gradient(135deg, $primary-color 0%, $primary-dark 100%);
    color: #fff;
    padding: $spacing-xl;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  &__brand-top {
    display: flex;
    align-items: baseline;
    gap: $spacing-sm;
  }

  &__brand-logo {
    font-size: $font-size-md;
    font-weight: 700;
    letter-spacing: 0.5px;
  }

  &__brand-tag {
    font-size: $font-size-2xs;
    opacity: 0.7;
  }

  &__brand-middle {
    max-width: 360px;
  }

  &__brand-title {
    margin: 0 0 $spacing-sm;
    font-size: 28px;
    font-weight: 700;
    line-height: 1.3;
  }

  &__brand-sub {
    margin: 0;
    font-size: $font-size-sm;
    opacity: 0.85;
    line-height: 1.6;
  }

  &__brand-bottom {
    font-size: $font-size-2xs;
    opacity: 0.6;
  }

  &__form-wrap {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: $spacing-xl;
  }

  &__form {
    width: 100%;
    max-width: 360px;
  }

  &__form-title {
    margin: 0 0 $spacing-xs;
    font-size: $font-size-2xl;
    font-weight: 600;
    color: $text-primary;
  }

  &__form-sub {
    margin: 0 0 $spacing-lg;
    font-size: $font-size-sm;
    color: $text-tertiary;
  }

  &__tip {
    margin-bottom: $spacing-md;
  }

  &__submit {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .page-login {
    flex-direction: column;

    &__brand {
      flex: 0 0 33vh;
      padding: $spacing-lg;
    }

    &__brand-title {
      font-size: 20px;
    }
  }
}
</style>
```

- [ ] **Step 2: 跑测试 + type-check**

```bash
cd "C:/Users/17599/Desktop/Auramix/frontend"
npm test && npm run type-check
```

Expected: 全 PASS(集成测试 `auth-flow.spec.ts` 会覆盖登录提交逻辑)。

- [ ] **Step 3: 提交**

```bash
cd "C:/Users/17599/Desktop/Auramix/frontend"
git add src/views/login/Index.vue
git commit -m "feat(login): 重写登录页(分屏布局:左品牌渐变 + 右表单)"
```

---

## Task 13: 最终验证

**Files:** (无)

- [ ] **Step 1: 跑全套测试**

```bash
cd "C:/Users/17599/Desktop/Auramix/frontend"
npm test
```

Expected: 55 个测试全部 PASS(原 32 + 新 23)。**任何 FAIL 必须修复,不能进入 Step 2。**

- [ ] **Step 2: 跑 type-check**

```bash
cd "C:/Users/17599/Desktop/Auramix/frontend"
npm run type-check
```

Expected: 退出码 0。

- [ ] **Step 3: 跑 build**

```bash
cd "C:/Users/17599/Desktop/Auramix/frontend"
npm run build
```

Expected: 编译成功,`dist/` 目录生成。

- [ ] **Step 4: 人工目检清单(可选,需 dev server)**

```bash
cd "C:/Users/17599/Desktop/Auramix/frontend"
npm run dev
```

打开 `http://localhost:5173`,逐项确认:
- [ ] 登录页:左半渐变 + 右半表单,<768px 变上下排
- [ ] 主页:4 个 StatCard 横向 4 列,<1024px 变 2 列,<640px 变 1 列;delta 颜色正确
- [ ] 5 个占位页:PageHeader + EmptyState,新建按钮在右上
- [ ] AdminLayout:侧栏可折叠,刷新后保留;<768px 侧栏变 drawer;点用户下拉出现退出
- [ ] 路由跳转:点 StatCard 的 href 跳转正确路由
- [ ] 全局快捷键:Cmd/Ctrl+K 聚焦 AppSearch

- [ ] **Step 5: 最终提交(如有未提交的改动)**

```bash
cd "C:/Users/17599/Desktop/Auramix/frontend"
git status
# 如果有未提交改动:
# git add -A
# git commit -m "feat(ui): UI 重构完成(全令牌+6 组件+布局/登录/主页改造)"
```

---

## 自检

- ✅ Spec 覆盖:design tokens 扩展(Task 0/1)、6 组件(Task 2-7)、5 占位页(Task 9)、主页 StatCard(Task 10)、AdminLayout(Task 11)、登录页分屏(Task 12)、回归(Task 13)
- ✅ 占位符扫描:无 TBD / TODO / "fill in later" / "similar to"
- ✅ 类型一致:`isRoot: 0 | 1` 在 UserDropdown props / StatCard / auth 类型全部对齐;`profile?.username` 用法一致
- ✅ 严格不动:`src/api/` `src/store/` `src/utils/` `src/permission.ts` `src/router/` 全部未出现在 Modify 列
- ✅ TDD 顺序:每个组件都是 test-first → run-fail → impl → run-pass → commit
- ✅ 频繁提交:13 个 task,每个 task 至少 1 个 commit,组件级 commit 粒度
- ✅ 令牌消费:所有新组件都用 `@use "variables" as *` 间接消费 `$primary-color` / `$primary-soft` / `$text-*` / `$border-*` / `$radius-md` / `$shadow-card`,无硬编码颜色
- ✅ Element Plus 隔离:`--el-color-primary` 通过 CSS 变量同步主色;`StatCard` 等组件用 SCSS 变量 `$primary-soft` 直接消费,不污染 EP 内部
