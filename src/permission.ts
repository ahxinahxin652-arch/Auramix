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
      } catch {
        // /me 失败 → token 失效,清掉 auth 避免 /login → /home 死循环
        auth.clearAuth()
        return { path: '/login' }
      }
    }

    return true
  })
}
