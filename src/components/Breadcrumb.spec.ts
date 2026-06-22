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
