// src/components/UserDropdown.spec.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import UserDropdown from './UserDropdown.vue'

// stub el-dropdown 避免依赖 teleport 等
const ElDropdownStub = {
  template: '<div class="el-dropdown"><slot /><slot name="dropdown" /></div>',
}
const ElDropdownMenuStub = { template: '<div class="el-dropdown-menu"><slot /></div>' }
const ElDropdownItemStub = {
  template: '<div class="el-dropdown-item" @click="$emit(\'click\')"><slot /></div>',
  emits: ['click'],
}

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('UserDropdown', () => {
  it('shows username and avatar with first initial', () => {
    const wrapper = mount(UserDropdown, {
      props: { username: 'admin' },
      global: {
        stubs: {
          'el-dropdown': ElDropdownStub,
          'el-dropdown-menu': ElDropdownMenuStub,
          'el-dropdown-item': ElDropdownItemStub,
        },
      },
    })
    expect(wrapper.text()).toContain('admin')
    expect(wrapper.find('.user-dropdown__avatar').text()).toBe('A')
  })

  it('uses uppercase initial for multi-char username', () => {
    const wrapper = mount(UserDropdown, {
      props: { username: 'ZhangSan' },
      global: {
        stubs: {
          'el-dropdown': ElDropdownStub,
          'el-dropdown-menu': ElDropdownMenuStub,
          'el-dropdown-item': ElDropdownItemStub,
        },
      },
    })
    expect(wrapper.find('.user-dropdown__avatar').text()).toBe('Z')
  })

  it('emits logout when 退出登录 clicked', async () => {
    const wrapper = mount(UserDropdown, {
      props: { username: 'admin' },
      global: {
        stubs: {
          'el-dropdown': ElDropdownStub,
          'el-dropdown-menu': ElDropdownMenuStub,
          'el-dropdown-item': ElDropdownItemStub,
        },
      },
    })
    // 找下拉里的"退出登录"项并点击
    const items = wrapper.findAllComponents(ElDropdownItemStub)
    const logoutItem = items.find(i => i.text().includes('退出登录'))
    expect(logoutItem).toBeTruthy()
    await logoutItem!.trigger('click')
    expect(wrapper.emitted('logout')).toBeTruthy()
    expect(wrapper.emitted('logout')!.length).toBe(1)
  })

  it('shows 超级管理员 badge when isRoot=1', () => {
    const wrapper = mount(UserDropdown, {
      props: { username: 'root', isRoot: 1 },
      global: {
        stubs: {
          'el-dropdown': ElDropdownStub,
          'el-dropdown-menu': ElDropdownMenuStub,
          'el-dropdown-item': ElDropdownItemStub,
        },
      },
    })
    // dropdown 内部渲染 role badge
    const html = wrapper.html()
    expect(html).toContain('超级管理员')
  })

  it('shows 普通管理员 badge when isRoot=0', () => {
    const wrapper = mount(UserDropdown, {
      props: { username: 'guest', isRoot: 0 },
      global: {
        stubs: {
          'el-dropdown': ElDropdownStub,
          'el-dropdown-menu': ElDropdownMenuStub,
          'el-dropdown-item': ElDropdownItemStub,
        },
      },
    })
    const html = wrapper.html()
    expect(html).toContain('普通管理员')
  })
})
