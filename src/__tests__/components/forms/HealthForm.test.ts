import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HealthForm from '@/components/forms/HealthForm.vue'

function mountForm(props = {}) {
  return mount(HealthForm, { props })
}

describe('HealthForm', () => {
  it('renders all required fields', () => {
    const wrapper = mountForm()
    expect(wrapper.find('[data-testid="health-form"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Resting Heart Rate')
    expect(wrapper.text()).toContain('HRV')
    expect(wrapper.text()).toContain('Sleep Duration')
    expect(wrapper.text()).toContain('Active Minutes')
    expect(wrapper.text()).toContain('Date')
  })

  it('renders sleep stage fields', () => {
    const wrapper = mountForm()
    expect(wrapper.text()).toContain('REM')
    expect(wrapper.text()).toContain('Deep')
    expect(wrapper.text()).toContain('Core')
    expect(wrapper.text()).toContain('Awake')
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
        restingHR: 65,
        hrv: 45,
        sleepDuration: 7.5,
        sleepStages: { rem: 1.5, deep: 1, core: 4, awake: 0.5 },
        activeMinutes: 30,
        steps: 8000,
      },
    })

    await wrapper.find('form').trigger('submit')

    const emitted = wrapper.emitted('save')
    expect(emitted).toHaveLength(1)
    const data = emitted![0][0] as Record<string, unknown>
    expect(data).toHaveProperty('restingHR')
    expect(data).toHaveProperty('hrv')
    expect(data).toHaveProperty('sleepDuration')
    expect(data).toHaveProperty('sleepStages')
    expect(data).toHaveProperty('activeMinutes')
  })

  it('validates resting HR range - rejects out-of-range values', async () => {
    const wrapper = mountForm({
      initialData: {
        date: '2025-01-15',
        restingHR: 300, // too high
        hrv: 45,
        sleepDuration: 7,
        sleepStages: { rem: 1, deep: 1, core: 4, awake: 0.5 },
        activeMinutes: 30,
      },
    })

    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('save')).toBeUndefined()
  })

  it('shows range indicator for heart rate', () => {
    const wrapper = mountForm({
      initialData: {
        date: '2025-01-15',
        restingHR: 65,
        hrv: 45,
        sleepDuration: 7,
        sleepStages: { rem: 1, deep: 1, core: 4, awake: 0.5 },
        activeMinutes: 30,
      },
    })
    const indicator = wrapper.find('[data-testid="hr-indicator"]')
    expect(indicator.exists()).toBe(true)
    expect(indicator.text()).toBe('normal')
  })

  it('populates form with initial data for edit mode', () => {
    const wrapper = mountForm({
      initialData: {
        date: '2025-06-01',
        restingHR: 58,
        hrv: 50,
        sleepDuration: 8,
        sleepStages: { rem: 2, deep: 1.5, core: 3.5, awake: 0.5 },
        activeMinutes: 45,
        steps: 10000,
      },
    })
    const dateInput = wrapper.find('input[type="date"]')
    expect(dateInput.element.value).toBe('2025-06-01')
  })

  it('emits cancel event', async () => {
    const wrapper = mountForm()
    const cancelBtn = wrapper.findAll('button').find((b) => b.text() === 'Cancel')
    await cancelBtn!.trigger('click')
    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })
})
