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
