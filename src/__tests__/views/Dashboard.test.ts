import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import Dashboard from '@/views/Dashboard.vue'

// Mock chart.js
vi.mock('chart.js', () => {
  class MockChart {
    static register = vi.fn()
    destroy = vi.fn()
    update = vi.fn()
    data: unknown
    options: unknown
    constructor(_ctx: unknown, config: { data: unknown; options: unknown }) {
      this.data = config.data
      this.options = config.options
    }
  }
  return {
    Chart: MockChart,
    registerables: [],
    CategoryScale: class {},
    LinearScale: class {},
    PointElement: class {},
    LineElement: class {},
    BarElement: class {},
    ArcElement: class {},
    Tooltip: class {},
    Legend: class {},
    Filler: class {},
    Title: class {},
  }
})

// Mock the data store
vi.mock('@/stores/data', () => ({
  useDataStore: () => ({
    getEntriesByDateRange: vi.fn().mockResolvedValue([]),
    getAllEntries: vi.fn().mockResolvedValue([]),
    loading: false,
    error: null,
  }),
}))

// Mock the auth store
vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({
    isUnlocked: true,
    getKey: vi.fn(),
  }),
}))

function mountDashboard() {
  const pinia = createPinia()
  setActivePinia(pinia)
  return mount(Dashboard, {
    global: {
      plugins: [pinia],
    },
  })
}

describe('Dashboard View', () => {
  it('renders the dashboard title', () => {
    const wrapper = mountDashboard()
    expect(wrapper.text()).toContain('Dashboard')
  })

  it('renders metric cards section', () => {
    const wrapper = mountDashboard()
    expect(wrapper.find('[data-testid="metrics-section"]').exists()).toBe(true)
  })

  it('renders one metric card per domain', () => {
    const wrapper = mountDashboard()
    const metricCards = wrapper.findAll('[data-testid="metric-card"]')
    expect(metricCards.length).toBe(7)
  })

  it('renders time range selector', () => {
    const wrapper = mountDashboard()
    expect(wrapper.find('[data-testid="time-range-selector"]').exists()).toBe(true)
  })

  it('defaults time range to 7 days', () => {
    const wrapper = mountDashboard()
    const activeBtn = wrapper.find('[data-testid="time-range-selector"] .range-btn--active')
    expect(activeBtn.text()).toContain('7')
  })

  it('renders charts section', () => {
    const wrapper = mountDashboard()
    expect(wrapper.find('[data-testid="charts-section"]').exists()).toBe(true)
  })

  it('handles empty data gracefully', () => {
    const wrapper = mountDashboard()
    // Should render without crashing and show placeholder values
    expect(wrapper.find('[data-testid="metrics-section"]').exists()).toBe(true)
  })
})
