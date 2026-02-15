import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import Settings from '@/views/Settings.vue'

describe('Settings View', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('renders all 7 section components', () => {
    const wrapper = mount(Settings, {
      global: {
        plugins: [createPinia()],
        stubs: {
          SecuritySettings: { template: '<div data-testid="security">Security</div>' },
          AppearanceSettings: { template: '<div data-testid="appearance">Appearance</div>' },
          DataManagementSettings: {
            template: '<div data-testid="data-management">Data Management</div>',
          },
          GoalsSettings: { template: '<div data-testid="goals">Goals</div>' },
          HelpSettings: { template: '<div data-testid="help">Help</div>' },
          AboutSettings: { template: '<div data-testid="about">About</div>' },
          ComingSoonSettings: {
            template: '<div data-testid="coming-soon">Coming Soon</div>',
          },
        },
      },
    })

    expect(wrapper.find('[data-testid="security"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="appearance"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="data-management"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="goals"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="help"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="about"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="coming-soon"]').exists()).toBe(true)
  })

  it('renders the heading and description', () => {
    const wrapper = mount(Settings, {
      global: {
        plugins: [createPinia()],
        stubs: {
          SecuritySettings: true,
          AppearanceSettings: true,
          DataManagementSettings: true,
          GoalsSettings: true,
          HelpSettings: true,
          AboutSettings: true,
          ComingSoonSettings: true,
        },
      },
    })

    expect(wrapper.find('h1').text()).toBe('Settings')
    expect(wrapper.find('.view-description').text()).toContain('Configure security')
  })
})
