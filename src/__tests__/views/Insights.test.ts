import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import InsightsView from '@/views/Insights.vue'

// Mock the data store to avoid real DB calls
vi.mock('@/stores/data', () => ({
  useDataStore: vi.fn(() => ({
    getAllEntries: vi.fn().mockResolvedValue([]),
  })),
}))

function mountInsights() {
  const pinia = createPinia()
  setActivePinia(pinia)

  return mount(InsightsView, {
    global: {
      plugins: [pinia],
    },
  })
}

describe('Insights View', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the heading', () => {
    const wrapper = mountInsights()
    expect(wrapper.find('h1').text()).toBe('Insights')
  })

  it('renders the description text', () => {
    const wrapper = mountInsights()
    expect(wrapper.text()).toContain(
      'Discover trends, correlations, and anomalies',
    )
  })

  it('shows empty state message when no data', async () => {
    const wrapper = mountInsights()
    // Wait for onMounted async to resolve
    await wrapper.vm.$nextTick()
    await new Promise((r) => setTimeout(r, 10))
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('No insights available yet')
  })

  it('renders GoalProgress component', () => {
    const wrapper = mountInsights()
    expect(wrapper.find('[data-testid="goal-progress"]').exists()).toBe(true)
  })

  it('does not render AnomalyAlert when no anomalies', async () => {
    const wrapper = mountInsights()
    await wrapper.vm.$nextTick()
    expect(wrapper.find('[data-testid="anomaly-alert"]').exists()).toBe(false)
  })
})
