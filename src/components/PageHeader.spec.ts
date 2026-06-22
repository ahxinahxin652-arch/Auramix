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
