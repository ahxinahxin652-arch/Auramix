import { createRouter, createWebHistory } from 'vue-router'
import routes from './routes'
import { setupPermissionGuard } from '@/permission'

const router = createRouter({
  history: createWebHistory(),
  routes,
})

setupPermissionGuard(router)

export default router
