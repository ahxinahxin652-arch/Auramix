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
        path: 'genre',
        name: 'GenreManage',
        component: () => import('@/views/genre/Index.vue'),
        meta: { requiresAuth: true, title: '流派管理' },
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
      {
        path: 'artist',
        name: 'ArtistManage',
        component: () => import('@/views/artist/Index.vue'),
        meta: { requiresAuth: true, title: '歌手管理' },
      },
      {
        path: 'member',
        name: 'MemberManage',
        component: () => import('@/views/member/Index.vue'),
        meta: { requiresAuth: true, title: '会员管理' },
      },
      {
        path: 'member/perks/:planId',
        name: 'MemberPerks',
        component: () => import('@/views/member/Perks.vue'),
        meta: { requiresAuth: true, title: '会员权益管理' },
      },
      {
        path: 'scene',
        name: 'SceneTag',
        component: () => import('@/views/scene/Index.vue'),
        meta: { requiresAuth: true, title: '场景标签' },
      },
      {
        path: 'approval',
        name: 'Approval',
        component: () => import('@/views/approval/Index.vue'),
        meta: { requiresAuth: true, title: '智能审批' },
      },
      {
        path: 'analytics',
        name: 'Analytics',
        redirect: '/analytics/overview',
        meta: { requiresAuth: true, title: '数据分析' },
        children: [
          {
            path: 'overview',
            name: 'AnalyticsOverview',
            component: () => import('@/views/analytics/Index.vue'),
            meta: { requiresAuth: true, title: '数据看板' },
          },
          {
            path: 'user',
            name: 'AnalyticsUser',
            component: () => import('@/views/analytics/User.vue'),
            meta: { requiresAuth: true, title: '用户分析' },
          },
          {
            path: 'track',
            name: 'AnalyticsTrack',
            component: () => import('@/views/analytics/Track.vue'),
            meta: { requiresAuth: true, title: '歌曲分析' },
          },
          {
            path: 'catalog',
            name: 'AnalyticsCatalog',
            component: () => import('@/views/analytics/Catalog.vue'),
            meta: { requiresAuth: true, title: '歌手/专辑分析' },
          },
          {
            path: 'review',
            name: 'AnalyticsReview',
            component: () => import('@/views/analytics/Review.vue'),
            meta: { requiresAuth: true, title: '审核分析' },
          },
          {
            path: 'member',
            name: 'AnalyticsMember',
            component: () => import('@/views/analytics/Member.vue'),
            meta: { requiresAuth: true, title: '会员分析' },
          },
        ],
      },
      {
        path: 'reports',
        name: 'Reports',
        component: () => import('@/views/reports/Index.vue'),
        meta: { requiresAuth: true, title: '我的报告' },
      },
      {
        path: 'reports/:id',
        name: 'ReportDetail',
        component: () => import('@/views/reports/Detail.vue'),
        meta: { requiresAuth: true, title: '报告详情' },
      },
      {
        path: 'admin-reports',
        name: 'AdminReports',
        component: () => import('@/views/admin-reports/Index.vue'),
        meta: { requiresAuth: true, title: '报告管理' },
      },
      {
        path: 'admin-reports/:id',
        name: 'AdminReportDetail',
        component: () => import('@/views/admin-reports/Detail.vue'),
        meta: { requiresAuth: true, title: '报告详情' },
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
    // 投屏大屏: 独立顶层路由, 不走 AdminLayout
    path: '/cast/overview',
    name: 'CastOverview',
    component: () => import('@/views/analytics/cast/OverviewCast.vue'),
    meta: { requiresAuth: true, title: '数据大屏' },
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
