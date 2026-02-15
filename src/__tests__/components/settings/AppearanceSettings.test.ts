import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import AppearanceSettings from '@/components/settings/AppearanceSettings.vue'
import { useSettingsStore } from '@/stores/settings'

describe('AppearanceSettings', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
    document.documentElement.removeAttribute('data-font-size')
  })

  function mountComponent() {
    return mount(AppearanceSettings, {
      global: {
        plugins: [createPinia()],
        stubs: {
          Card: {
            template: '<div class="card-stub"><slot /></div>',
            props: ['title'],
          },
        },
      },
    })
  }

  it('renders theme toggle', () => {
    const wrapper = mountComponent()
    expect(wrapper.find('.theme-toggle').exists()).toBe(true)
  })

  it('toggles theme on click', async () => {
    const wrapper = mountComponent()
    // Default is dark
    expect(wrapper.find('.theme-toggle-label').text()).toBe('Dark')
    await wrapper.find('.theme-toggle').trigger('click')
    expect(wrapper.find('.theme-toggle-label').text()).toBe('Light')
  })

  it('renders font size selector', () => {
    const wrapper = mountComponent()
    const select = wrapper.find('.font-size-select')
    expect(select.exists()).toBe(true)
  })

  it('applies data-font-size attribute on change', async () => {
    const wrapper = mountComponent()
    const settingsStore = useSettingsStore()
    settingsStore.load()

    const select = wrapper.find('.font-size-select')
    await select.setValue('large')

    expect(document.documentElement.getAttribute('data-font-size')).toBe('large')
  })
})
