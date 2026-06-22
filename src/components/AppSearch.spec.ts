// src/components/AppSearch.spec.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import AppSearch from './AppSearch.vue'

describe('AppSearch', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders input with default placeholder', () => {
    const wrapper = mount(AppSearch)
    const input = wrapper.find('input')
    expect(input.exists()).toBe(true)
    expect(input.attributes('placeholder')).toBe('搜索 ⌘K')
  })

  it('renders custom placeholder when prop provided', () => {
    const wrapper = mount(AppSearch, { props: { placeholder: '搜索歌曲' } })
    const input = wrapper.find('input')
    expect(input.attributes('placeholder')).toBe('搜索歌曲')
  })

  it('focuses input on Ctrl+K keydown', async () => {
    const wrapper = mount(AppSearch, { attachTo: document.body })
    const input = wrapper.find('input').element as HTMLInputElement
    const focusSpy = vi.spyOn(input, 'focus')

    window.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }),
    )
    await wrapper.vm.$nextTick()

    expect(focusSpy).toHaveBeenCalled()
    wrapper.unmount()
  })
})
