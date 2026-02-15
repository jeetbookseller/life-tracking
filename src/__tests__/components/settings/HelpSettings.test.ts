import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import HelpSettings from '@/components/settings/HelpSettings.vue'

describe('HelpSettings', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  function mountComponent() {
    return mount(HelpSettings, {
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

  it('renders accordion triggers for both sections', () => {
    const wrapper = mountComponent()
    const triggers = wrapper.findAll('.accordion-trigger')
    expect(triggers.length).toBe(2)
    expect(triggers[0]!.text()).toContain('What Each Tab Does')
    expect(triggers[1]!.text()).toContain('How to Import Data')
  })

  it('expands tab descriptions section on click', async () => {
    const wrapper = mountComponent()
    const trigger = wrapper.findAll('.accordion-trigger')[0]!
    await trigger.trigger('click')

    expect(wrapper.text()).toContain('Dashboard')
    expect(wrapper.text()).toContain('Log Entry')
    expect(wrapper.text()).toContain('Insights')
    expect(wrapper.text()).toContain('Export')
    expect(wrapper.text()).toContain('Settings')
  })

  it('renders tab descriptions for all 5 tabs', async () => {
    const wrapper = mountComponent()
    await wrapper.findAll('.accordion-trigger')[0]!.trigger('click')

    const tabItems = wrapper.findAll('.help-tab-item')
    expect(tabItems.length).toBe(5)
  })

  it('expands import guides section on click', async () => {
    const wrapper = mountComponent()
    await wrapper.findAll('.accordion-trigger')[1]!.trigger('click')

    expect(wrapper.text()).toContain('Fitbit')
    expect(wrapper.text()).toContain('Monarch Money')
    expect(wrapper.text()).toContain('Other Apps')
  })

  it('renders import guides for Fitbit, Monarch, and manual mapping', async () => {
    const wrapper = mountComponent()
    await wrapper.findAll('.accordion-trigger')[1]!.trigger('click')

    const guides = wrapper.findAll('.import-guide')
    expect(guides.length).toBe(3)
  })

  it('collapses section when clicked again', async () => {
    const wrapper = mountComponent()
    const trigger = wrapper.findAll('.accordion-trigger')[0]!

    await trigger.trigger('click')
    expect(wrapper.findAll('.help-tab-item').length).toBe(5)

    await trigger.trigger('click')
    expect(wrapper.findAll('.help-tab-item').length).toBe(0)
  })
})
