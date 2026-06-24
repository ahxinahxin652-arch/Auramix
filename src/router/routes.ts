import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layouts/AdminLayout.vue'),
    redirect: '/home',
    children: [
      {
        path: 'home',
        name: 'Home',
        component: () => import('@/views/home/Index.vue'),
        meta: { requiresAuth: true, title: '主页' },
      },
      {
        path: 'user',
        name: 'UserManage',
        component: () => import('@/views/user/Index.vue'),
        meta: { requiresAuth: true, title: '用户管理' },
      },
      {
        path: 'admin',
        name: 'AdminManage',
        component: () => import('@/views/admin/Index.vue'),
        meta: { requiresAuth: true, title: '管理员管理' },
      },
      {
        path: 'song',
        name: 'SongManage',
        component: () => import('@/views/song/Index.vue'),
        meta: { requiresAuth: true, title: '歌曲管理' },
      },
      {
        path: 'album',
        name: 'AlbumManage',
        component: () => import('@/views/album/Index.vue'),
        meta: { requiresAuth: true, title: '专辑管理' },
      },
    ],
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
