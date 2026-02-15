import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MetabolicForm from '@/components/forms/MetabolicForm.vue'

function mountForm(props = {}) {
  return mount(MetabolicForm, { props })
}

describe('MetabolicForm', () => {
  it('renders all required fields', () => {
    const wrapper = mountForm()
    expect(wrapper.find('[data-testid="metabolic-form"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Gut Microbiome Score')
    expect(wrapper.text()).toContain('Daily Food Score')
    expect(wrapper.text()).toContain('Fiber Intake')
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
        gutMicrobiomeScore: 75,
        dailyFoodScore: 80,
        fiberIntake: 25,
      },
    })

    await wrapper.find('form').trigger('submit')

    const emitted = wrapper.emitted('save')
    expect(emitted).toHaveLength(1)
    const data = emitted![0][0] as Record<string, unknown>
    expect(data).toHaveProperty('gutMicrobiomeScore')
    expect(data).toHaveProperty('dailyFoodScore')
    expect(data).toHaveProperty('fiberIntake')
  })

  it('validation prevents submitting with missing required fields', async () => {
    const wrapper = mountForm({
      initialData: {
        date: '',
        gutMicrobiomeScore: undefined as unknown as number,
        dailyFoodScore: undefined as unknown as number,
        fiberIntake: -1,
      },
    })

    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('save')).toBeUndefined()
  })

  it('supports adding meals', async () => {
    const wrapper = mountForm()

    const mealName = wrapper.find('[data-testid="meal-name"]')
    const mealScore = wrapper.find('[data-testid="meal-score"]')

    await mealName.setValue('Lunch')
    await mealScore.setValue(85)

    const addBtn = wrapper.findAll('button').find((b) => b.text() === 'Add')
    await addBtn!.trigger('click')

    expect(wrapper.text()).toContain('Lunch')
  })

  it('supports removing meals', async () => {
    const wrapper = mountForm({
      initialData: {
        date: '2025-01-15',
        gutMicrobiomeScore: 75,
        dailyFoodScore: 80,
        fiberIntake: 25,
        meals: [{ name: 'Breakfast', score: 90, time: '08:00' }],
      },
    })

    expect(wrapper.text()).toContain('Breakfast')
    const removeBtn = wrapper.find('.remove-btn')
    await removeBtn.trigger('click')
    expect(wrapper.text()).not.toContain('Breakfast')
  })

  it('populates form with initial data for edit mode', () => {
    const wrapper = mountForm({
      initialData: {
        date: '2025-06-01',
        gutMicrobiomeScore: 80,
        dailyFoodScore: 85,
        fiberIntake: 30,
        glucoseResponse: 5,
        fatResponse: 3,
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
