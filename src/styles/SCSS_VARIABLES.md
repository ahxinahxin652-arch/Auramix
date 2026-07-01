# Auramix 前端 SCSS 全局变量速查表

> 写 SCSS 时**先查这个表**。`vite.config.js` 已经配置 `additionalData: "@use \"variables\" as *;"`,
> 下面所有变量**全局可用**, 直接 `$xxx` 即可.

---

## 1. 主色 (玫红)

| 变量 | 值 | 用途 |
|---|---|---|
| `$primary-color` | `#f43f5e` | 主品牌色, 按钮, 链接 |
| `$primary-soft` | `#ffe4e6` | 主色浅色背景 |
| `$primary-dark` | `#be123c` | 主色深色, 渐变终止 |

## 2. 反馈色

| 变量 | 值 | 用途 |
|---|---|---|
| `$success-color` | `#10b981` | 成功状态, 通过 |
| `$warning-color` | `#f59e0b` | 警告状态, 待审 |
| `$danger-color` | `#ef4444` | 危险状态, 失败 |
| `$info-color` | `#909399` | 信息状态, 无数据 |

## 3. 中性色

| 变量 | 值 | 用途 |
|---|---|---|
| `$text-primary` | `#0f172a` | 主文字 |
| `$text-secondary` | `#475569` | 次文字 |
| `$text-tertiary` | `#94a3b8` | 辅助文字 |
| `$bg-page` | `#f8fafc` | **页面底色** ⚠️ 不要写 `$bg-card` (不存在) |
| `$bg-surface` | `#ffffff` | **卡片/表面背景** ⚠️ 这是 `$bg-card` 想用的 |
| `$bg-subtle` | `#fafafa` | 微淡背景, hover |
| `$border-base` | `#e2e8f0` | 标准边框 |
| `$border-subtle` | `#f1f5f9` | 淡边框 |

## 4. 布局尺寸

| 变量 | 值 |
|---|---|
| `$sidebar-width` | `220px` |
| `$sidebar-collapsed-width` | `64px` |
| `$header-height` | `56px` |
| `$breadcrumb-height` | `40px` |

## 5. 间距 (4px 步进)

| 变量 | 值 |
|---|---|
| `$spacing-xs` | `4px` |
| `$spacing-sm` | `8px` |
| `$spacing-md` | `16px` |
| `$spacing-lg` | `24px` |
| `$spacing-xl` | `32px` |

## 6. 字号

| 变量 | 值 |
|---|---|
| `$font-size-2xs` | `11px` |
| `$font-size-xs` | `12px` |
| `$font-size-sm` | `14px` |
| `$font-size-md` | `16px` |
| `$font-size-lg` | `18px` |
| `$font-size-xl` | `20px` |
| `$font-size-2xl` | `22px` |

## 7. 圆角

| 变量 | 值 |
|---|---|
| `$radius-sm` | `4px` |
| `$radius-md` | `6px` |
| `$radius-lg` | `8px` |

## 8. 阴影

| 变量 | 值 | 用途 |
|---|---|---|
| `$shadow-card` | `0 1px 2px rgba(15, 23, 42, 0.04)` | 卡片阴影 |
| `$shadow-popover` | `0 4px 12px rgba(15, 23, 42, 0.08)` | 弹出层阴影 |

## 9. 字体栈

| 变量 |
|---|
| `$font-family`: `-apple-system, BlinkMacSystemFont, 'Inter', 'PingFang SC', 'Microsoft YaHei', sans-serif` |

---

## ⚠️ 已踩坑 (不要写这些!)

| 错误写法 | 正确写法 |
|---|---|
| `$bg-card` (不存在) | `$bg-surface` (白卡) 或 `$bg-page` (页面底) 或 `$bg-subtle` (淡) |
| 其它拼写错的 (凭印象) | **先查本表** |

## 添加新变量

如果需要新颜色 / 阴影, **修改 `src/styles/variables.scss`**, 不要散落写在各组件里.
