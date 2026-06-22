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
