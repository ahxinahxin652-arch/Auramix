import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
  },
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomeView.vue'),
  },
  {
    path: '/warehouse/:id',
    name: 'MusicWareHouse',
    component: () => import('../views/MusicWareHouseView.vue'),
  },
  {
    path: '/unlock',
    name: 'MusicUnlock',
    component: () => import('../views/MusicUnlockView.vue'),
  },
  {
    path: '/lyrics-unlock',
    name: 'LyricsUnlock',
    component: () => import('../views/LyricsUnlockView.vue'),
  },
  {
    path: '/converter',
    name: 'MusicConverter',
    component: () => import('../views/MusicConverterView.vue'),
  },
  {
    path: '/edit',
    name: 'MusicEdit',
    component: () => import('../views/MusicEditView.vue'),
  },
  {
    path: '/lyrics-widget',
    name: 'LyricsWidget',
    component: () => import('../components/LyricsWidget.vue'),
  },
  {
    path: '/artist/:id',
    name: 'ArtistDetail',
    component: () => import('../views/ArtistDetailView.vue'),
  },
  {
    path: '/album/:id',
    name: 'AlbumDetail',
    component: () => import('../views/AlbumDetailView.vue'),
  },
  {
    path: '/lyrics',
    name: 'MainLyrics',
    component: () => import('../views/MainLyricsView.vue'),
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('auramix_token')
  if (!token && to.name !== 'Login') {
    next({ name: 'Login', replace: true })
  } else if (token && to.name === 'Login') {
    next({ name: 'Home', replace: true })
  } else {
    next()
  }
})

export default router