import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import GoalsSettings from '@/components/settings/GoalsSettings.vue'
import { useInsightsStore } from '@/stores/insights'

describe('GoalsSettings', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  function mountComponent() {
    return mount(GoalsSettings, {
      global: {
        plugins: [createPinia()],
        stubs: {
          Card: {
            template: '<div class="card-stub"><slot /></div>',
            props: ['title'],
          },
          Button: {
            template:
              '<button :type="type || \'button\'" @click="$emit(\'click\', $event)"><slot /></button>',
            props: ['size', 'variant', 'type'],
          },
        },
      },
    })
  }

  it('shows empty state when no goals exist', () => {
    const wrapper = mountComponent()
    expect(wrapper.text()).toContain('No goals configured')
  })

  it('displays existing goals with delete buttons', () => {
    localStorage.setItem(
      'life-tracker-goals',
      JSON.stringify([
        { domain: 'productivity', metric: 'deepWorkHours', target: 4, label: 'Daily deep work' },
      ]),
    )

    const wrapper = mountComponent()
    expect(wrapper.text()).toContain('Daily deep work')
    expect(wrapper.find('.goal-delete').exists()).toBe(true)
  })

  it('shows add goal form when button clicked', async () => {
    const wrapper = mountComponent()
    const addBtn = wrapper.findAll('button').find((b) => b.text().includes('Add Goal'))
    await addBtn!.trigger('click')
    expect(wrapper.find('.goal-form').exists()).toBe(true)
  })

  it('validates required fields on goal form', async () => {
    const wrapper = mountComponent()
    const addBtn = wrapper.findAll('button').find((b) => b.text().includes('Add Goal'))
    await addBtn!.trigger('click')

    // Submit without filling metric - submit the form directly
    const form = wrapper.find('.goal-form')
    await form.trigger('submit')

    expect(wrapper.text()).toContain('Please select a metric')
  })

  it('adds a goal and shows it in the list', async () => {
    const wrapper = mountComponent()
    const insightsStore = useInsightsStore()

    const addBtn = wrapper.findAll('button').find((b) => b.text().includes('Add Goal'))
    await addBtn!.trigger('click')

    // Fill form
    const selects = wrapper.findAll('.form-select')
    await selects[0]!.setValue('productivity')
    await selects[1]!.setValue('deepWorkHours')

    const inputs = wrapper.findAll('.form-input')
    await inputs[0]!.setValue(4)
    await inputs[1]!.setValue('Deep work daily target')

    // Submit the form directly
    const form = wrapper.find('.goal-form')
    await form.trigger('submit')

    expect(insightsStore.goals.length).toBe(1)
    expect(insightsStore.goals[0]!.label).toBe('Deep work daily target')
  })

  it('removes a goal when delete button clicked', async () => {
    localStorage.setItem(
      'life-tracker-goals',
      JSON.stringify([
        { domain: 'productivity', metric: 'deepWorkHours', target: 4, label: 'Test goal' },
      ]),
    )

    const wrapper = mountComponent()
    const insightsStore = useInsightsStore()
    expect(insightsStore.goals.length).toBe(1)

    await wrapper.find('.goal-delete').trigger('click')
    expect(insightsStore.goals.length).toBe(0)
  })
})
