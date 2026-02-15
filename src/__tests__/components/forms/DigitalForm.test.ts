import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DigitalForm from '@/components/forms/DigitalForm.vue'

function mountForm(props = {}) {
  return mount(DigitalForm, { props })
}

describe('DigitalForm', () => {
  it('renders all required fields', () => {
    const wrapper = mountForm()
    expect(wrapper.find('[data-testid="digital-form"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Total Screen Time')
    expect(wrapper.text()).toContain('Phone Unlocks')
    expect(wrapper.text()).toContain('Top Apps')
    expect(wrapper.text()).toContain('Date')
  })

  it('defaults date to today', () => {
    const wrapper = mountForm()
    const today = new Date().toISOString().split('T')[0]
    const dateInput = wrapper.find('input[type="date"]')
    expect(dateInput.element.value).toBe(today)
  })

  it('emits save event with correct data shape on valid submission', async () => {
    const wrapper = mountForm({
      initialData: {
        date: '2025-01-15',
        totalScreenTime: 180,
        unlocks: 50,
        topApps: [],
      },
    })

    await wrapper.find('form').trigger('submit')

    const emitted = wrapper.emitted('save')
    expect(emitted).toHaveLength(1)
    const data = emitted![0][0] as Record<string, unknown>
    expect(data).toHaveProperty('totalScreenTime')
    expect(data).toHaveProperty('unlocks')
    expect(data).toHaveProperty('topApps')
  })

  it('validation rejects negative screen time', async () => {
    const wrapper = mountForm({
      initialData: {
        date: '2025-01-15',
        totalScreenTime: -10,
        unlocks: 50,
        topApps: [],
      },
    })

    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('save')).toBeUndefined()
  })

  it('supports adding apps (max 3)', async () => {
    const wrapper = mountForm()

    const appName = wrapper.find('[data-testid="app-name"]')
    const appMinutes = wrapper.find('[data-testid="app-minutes"]')

    await appName.setValue('Twitter')
    await appMinutes.setValue(45)

    const addBtn = wrapper.findAll('button').find((b) => b.text() === 'Add')
    await addBtn!.trigger('click')

    expect(wrapper.text()).toContain('Twitter')
    expect(wrapper.text()).toContain('45 min')
  })

  it('hides add button when 3 apps are added', async () => {
    const wrapper = mountForm({
      initialData: {
        date: '2025-01-15',
        totalScreenTime: 180,
        unlocks: 50,
        topApps: [
          { name: 'App1', minutes: 30 },
          { name: 'App2', minutes: 25 },
          { name: 'App3', minutes: 20 },
        ],
      },
    })

    expect(wrapper.find('.app-add').exists()).toBe(false)
  })

  it('supports removing apps', async () => {
    const wrapper = mountForm({
      initialData: {
        date: '2025-01-15',
        totalScreenTime: 180,
        unlocks: 50,
        topApps: [{ name: 'Instagram', minutes: 60 }],
      },
    })

    expect(wrapper.text()).toContain('Instagram')
    const removeBtn = wrapper.find('.remove-btn')
    await removeBtn.trigger('click')
    expect(wrapper.text()).not.toContain('Instagram')
  })

  it('populates form with initial data for edit mode', () => {
    const wrapper = mountForm({
      initialData: {
        date: '2025-06-01',
        totalScreenTime: 200,
        unlocks: 80,
        topApps: [{ name: 'Reddit', minutes: 40 }],
      },
    })
    const dateInput = wrapper.find('input[type="date"]')
    expect(dateInput.element.value).toBe('2025-06-01')
    expect(wrapper.text()).toContain('Reddit')
  })

  it('emits cancel event', async () => {
    const wrapper = mountForm()
    const cancelBtn = wrapper.findAll('button').find((b) => b.text() === 'Cancel')
    await cancelBtn!.trigger('click')
    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })
})
