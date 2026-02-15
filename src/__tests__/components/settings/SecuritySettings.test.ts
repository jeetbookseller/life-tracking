import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import SecuritySettings from '@/components/settings/SecuritySettings.vue'
import { useSettingsStore } from '@/stores/settings'

describe('SecuritySettings', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  function mountComponent() {
    return mount(SecuritySettings, {
      global: {
        plugins: [createPinia()],
        stubs: {
          Modal: {
            template:
              '<div v-if="open" class="modal-stub"><slot /><slot name="footer" /></div>',
            props: ['open', 'title'],
          },
          Card: {
            template: '<div class="card-stub"><slot /></div>',
            props: ['title'],
          },
          Button: {
            template: '<button @click="$emit(\'click\', $event)"><slot /></button>',
          },
        },
      },
    })
  }

  it('renders change password button', () => {
    const wrapper = mountComponent()
    expect(wrapper.text()).toContain('Change Password')
  })

  it('renders auto-lock timeout dropdown', () => {
    const wrapper = mountComponent()
    const select = wrapper.find('.timeout-select')
    expect(select.exists()).toBe(true)
  })

  it('opens change password modal when button clicked', async () => {
    const wrapper = mountComponent()
    const buttons = wrapper.findAll('button')
    const changeBtn = buttons.find((b) => b.text().includes('Change Password'))
    expect(changeBtn).toBeDefined()
    await changeBtn!.trigger('click')
    expect(wrapper.find('.modal-stub').exists()).toBe(true)
  })

  it('validates new password minimum length', async () => {
    const wrapper = mountComponent()
    // Open modal
    const changeBtn = wrapper.findAll('button').find((b) => b.text().includes('Change Password'))
    await changeBtn!.trigger('click')

    // Fill form with short password
    const inputs = wrapper.findAll('input[type="password"]')
    await inputs[0]!.setValue('current123')
    await inputs[1]!.setValue('short')
    await inputs[2]!.setValue('short')

    // Submit
    const submitBtn = wrapper.findAll('button').find((b) => b.text() === 'Change Password' && b.element !== changeBtn!.element)
    if (submitBtn) {
      await submitBtn.trigger('click')
    }

    expect(wrapper.text()).toContain('at least 8 characters')
  })

  it('validates new password match', async () => {
    const wrapper = mountComponent()
    const changeBtn = wrapper.findAll('button').find((b) => b.text().includes('Change Password'))
    await changeBtn!.trigger('click')

    const inputs = wrapper.findAll('input[type="password"]')
    await inputs[0]!.setValue('current123')
    await inputs[1]!.setValue('newpassword123')
    await inputs[2]!.setValue('differentpassword')

    const submitBtn = wrapper.findAll('button').find(
      (b) => b.text() === 'Change Password' && b.element !== changeBtn!.element,
    )
    if (submitBtn) {
      await submitBtn.trigger('click')
    }

    expect(wrapper.text()).toContain('do not match')
  })

  it('updates auto-lock timeout via dropdown', async () => {
    const wrapper = mountComponent()
    const settingsStore = useSettingsStore()
    settingsStore.load()

    const select = wrapper.find('.timeout-select')
    await select.setValue('30')

    expect(settingsStore.autoLockTimeoutMinutes).toBe(30)
  })
})
