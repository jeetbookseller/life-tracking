import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import AboutSettings from '@/components/settings/AboutSettings.vue'

describe('AboutSettings', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  function mountComponent() {
    return mount(AboutSettings, {
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

  it('displays app version', () => {
    const wrapper = mountComponent()
    expect(wrapper.text()).toContain('1.0.0')
  })

  it('displays storage usage info', async () => {
    // Mock navigator.storage.estimate
    const mockEstimate = vi.fn().mockResolvedValue({ usage: 1048576, quota: 104857600 })
    Object.defineProperty(navigator, 'storage', {
      value: { estimate: mockEstimate },
      writable: true,
      configurable: true,
    })

    const wrapper = mountComponent()
    await new Promise((r) => setTimeout(r, 50))
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('MB')
  })

  it('displays tech stack info', () => {
    const wrapper = mountComponent()
    expect(wrapper.text()).toContain('Vue 3')
    expect(wrapper.text()).toContain('Dexie.js')
  })

  it('displays data privacy info', () => {
    const wrapper = mountComponent()
    expect(wrapper.text()).toContain('AES-256')
    expect(wrapper.text()).toContain('local')
  })
})
