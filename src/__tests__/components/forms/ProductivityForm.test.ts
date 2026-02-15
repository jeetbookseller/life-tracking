import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ProductivityForm from '@/components/forms/ProductivityForm.vue'

function mountForm(props = {}) {
  return mount(ProductivityForm, { props })
}

describe('ProductivityForm', () => {
  it('renders all required fields', () => {
    const wrapper = mountForm()
    expect(wrapper.find('[data-testid="productivity-form"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Tasks Planned')
    expect(wrapper.text()).toContain('Tasks Completed')
    expect(wrapper.text()).toContain('Focus Rating')
    expect(wrapper.text()).toContain('Deep Work Hours')
    expect(wrapper.text()).toContain('Date')
  })

  it('defaults date to today', () => {
    const wrapper = mountForm()
    const today = new Date().toISOString().split('T')[0]
    const dateInput = wrapper.find('input[type="date"]')
    expect(dateInput.element.value).toBe(today)
  })

  it('emits save event with correct data shape on valid submission', async () => {
    const wrapper = mountForm()
    await wrapper.find('input[type="date"]').setValue('2025-01-15')

    const numberInputs = wrapper.findAll('.input-field[type="number"]')
    await numberInputs[0].setValue(5) // tasksPlanned
    await numberInputs[1].setValue(3) // tasksCompleted
    // focusRating defaults to 3 via button
    await numberInputs[2].setValue(4) // deepWorkHours

    await wrapper.find('form').trigger('submit')

    const emitted = wrapper.emitted('save')
    expect(emitted).toHaveLength(1)
    const data = emitted![0][0] as Record<string, unknown>
    expect(data).toHaveProperty('date', '2025-01-15')
    expect(data).toHaveProperty('tasksPlanned')
    expect(data).toHaveProperty('tasksCompleted')
    expect(data).toHaveProperty('focusRating')
    expect(data).toHaveProperty('deepWorkHours')
  })

  it('validates focus rating range - rejects out-of-range values', async () => {
    const wrapper = mountForm({
      initialData: { focusRating: 0, tasksPlanned: 1, tasksCompleted: 1, deepWorkHours: 1, date: '2025-01-15' },
    })

    await wrapper.find('form').trigger('submit')

    // Should show error, not emit save
    expect(wrapper.emitted('save')).toBeUndefined()
    expect(wrapper.find('.field-error').exists()).toBe(true)
  })

  it('allows selecting focus rating via buttons', async () => {
    const wrapper = mountForm()
    const ratingBtn = wrapper.find('[data-testid="focus-rating-5"]')
    await ratingBtn.trigger('click')

    // Submit and check the rating was set
    await wrapper.find('form').trigger('submit')
    const emitted = wrapper.emitted('save')
    expect(emitted).toHaveLength(1)
    expect((emitted![0][0] as Record<string, unknown>).focusRating).toBe(5)
  })

  it('populates form with initial data for edit mode', () => {
    const wrapper = mountForm({
      initialData: {
        date: '2025-06-01',
        tasksPlanned: 10,
        tasksCompleted: 8,
        focusRating: 4,
        deepWorkHours: 6,
        notes: 'Great day',
      },
    })
    const dateInput = wrapper.find('input[type="date"]')
    expect(dateInput.element.value).toBe('2025-06-01')
    expect(wrapper.find('[data-testid="focus-rating-4"]').classes()).toContain('rating-btn--active')
  })

  it('emits cancel event', async () => {
    const wrapper = mountForm()
    const cancelBtn = wrapper.findAll('button').find((b) => b.text() === 'Cancel')
    await cancelBtn!.trigger('click')
    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })

  it('renders notes textarea', () => {
    const wrapper = mountForm()
    expect(wrapper.find('textarea').exists()).toBe(true)
  })
})
