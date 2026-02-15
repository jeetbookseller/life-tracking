import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MindfulnessForm from '@/components/forms/MindfulnessForm.vue'

function mountForm(props = {}) {
  return mount(MindfulnessForm, { props })
}

describe('MindfulnessForm', () => {
  it('renders all required fields', () => {
    const wrapper = mountForm()
    expect(wrapper.find('[data-testid="mindfulness-form"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Meditation Type')
    expect(wrapper.text()).toContain('Duration')
    expect(wrapper.text()).toContain('Quality Rating')
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
        meditationType: 'mindfulness',
        duration: 20,
        qualityRating: 4,
        streakCount: 10,
      },
    })

    await wrapper.find('form').trigger('submit')

    const emitted = wrapper.emitted('save')
    expect(emitted).toHaveLength(1)
    const data = emitted![0][0] as Record<string, unknown>
    expect(data).toHaveProperty('meditationType', 'mindfulness')
    expect(data).toHaveProperty('duration')
    expect(data).toHaveProperty('qualityRating')
    expect(data).toHaveProperty('streakCount')
  })

  it('validation prevents submitting without meditation type', async () => {
    const wrapper = mountForm({
      initialData: {
        date: '2025-01-15',
        meditationType: '',
        duration: 20,
        qualityRating: 4,
        streakCount: 5,
      },
    })

    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('save')).toBeUndefined()
  })

  it('validates quality rating range - rejects out-of-range values', async () => {
    const wrapper = mountForm({
      initialData: {
        date: '2025-01-15',
        meditationType: 'breathing',
        duration: 10,
        qualityRating: 0, // out of range
        streakCount: 1,
      },
    })

    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('save')).toBeUndefined()
    expect(wrapper.find('.field-error').exists()).toBe(true)
  })

  it('allows selecting quality rating via buttons', async () => {
    const wrapper = mountForm({
      initialData: {
        date: '2025-01-15',
        meditationType: 'mindfulness',
        duration: 15,
        qualityRating: 3,
        streakCount: 1,
      },
    })

    const ratingBtn = wrapper.find('[data-testid="quality-rating-5"]')
    await ratingBtn.trigger('click')

    await wrapper.find('form').trigger('submit')
    const emitted = wrapper.emitted('save')
    expect(emitted).toHaveLength(1)
    expect((emitted![0][0] as Record<string, unknown>).qualityRating).toBe(5)
  })

  it('renders meditation type selector with options', () => {
    const wrapper = mountForm()
    const select = wrapper.find('select')
    expect(select.exists()).toBe(true)
    const options = wrapper.findAll('option')
    // placeholder + 7 types
    expect(options.length).toBeGreaterThanOrEqual(7)
  })

  it('populates form with initial data for edit mode', () => {
    const wrapper = mountForm({
      initialData: {
        date: '2025-06-01',
        meditationType: 'breathing',
        duration: 30,
        qualityRating: 5,
        streakCount: 15,
        notes: 'Peaceful session',
      },
    })
    const dateInput = wrapper.find('input[type="date"]')
    expect(dateInput.element.value).toBe('2025-06-01')
    expect(wrapper.find('[data-testid="quality-rating-5"]').classes()).toContain('rating-btn--active')
  })

  it('emits cancel event', async () => {
    const wrapper = mountForm()
    const cancelBtn = wrapper.findAll('button').find((b) => b.text() === 'Cancel')
    await cancelBtn!.trigger('click')
    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })
})
