import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import DataManagementSettings from '@/components/settings/DataManagementSettings.vue'

describe('DataManagementSettings', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  function mountComponent() {
    return mount(DataManagementSettings, {
      global: {
        plugins: [createPinia()],
        stubs: {
          Card: {
            template: '<div class="card-stub"><slot /></div>',
            props: ['title'],
          },
          Button: {
            template: '<button :disabled="disabled" @click="$emit(\'click\', $event)"><slot /></button>',
            props: ['size', 'variant', 'disabled'],
          },
          Modal: {
            template:
              '<div v-if="open" class="modal-stub"><slot /><slot name="footer" /></div>',
            props: ['open', 'title'],
          },
          MappingWizard: {
            template: '<div class="mapping-wizard-stub">MappingWizard</div>',
          },
        },
      },
    })
  }

  it('renders import, export, and clear buttons', () => {
    const wrapper = mountComponent()
    expect(wrapper.text()).toContain('Import')
    expect(wrapper.text()).toContain('Export')
    expect(wrapper.text()).toContain('Clear')
  })

  it('opens import modal on import button click', async () => {
    const wrapper = mountComponent()
    const importBtn = wrapper.findAll('button').find((b) => b.text() === 'Import')
    await importBtn!.trigger('click')
    expect(wrapper.find('.mapping-wizard-stub').exists()).toBe(true)
  })

  it('opens clear confirmation modal on clear button click', async () => {
    const wrapper = mountComponent()
    const clearBtn = wrapper.findAll('button').find((b) => b.text() === 'Clear')
    await clearBtn!.trigger('click')
    expect(wrapper.text()).toContain('Type DELETE')
  })

  it('requires typing DELETE to confirm clear', async () => {
    const wrapper = mountComponent()
    const clearBtn = wrapper.findAll('button').find((b) => b.text() === 'Clear')
    await clearBtn!.trigger('click')

    // Try clearing without typing DELETE
    const clearAllBtn = wrapper.findAll('button').find((b) => b.text() === 'Clear All Data')
    if (clearAllBtn) {
      await clearAllBtn.trigger('click')
      expect(wrapper.text()).toContain('Please type DELETE')
    }
  })

  it('shows database statistics', async () => {
    const wrapper = mountComponent()
    // Wait for stats to load
    await new Promise((r) => setTimeout(r, 50))
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Database Statistics')
  })

  it('shows entry counts per domain', async () => {
    const wrapper = mountComponent()
    await new Promise((r) => setTimeout(r, 50))
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Productivity')
    expect(wrapper.text()).toContain('entries')
  })
})
