import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import Entry from '@/views/Entry.vue'

// Mock the data store
vi.mock('@/stores/data', () => ({
  useDataStore: () => ({
    addEntry: vi.fn().mockResolvedValue('test-id'),
    updateEntry: vi.fn().mockResolvedValue(undefined),
    getEntriesByDateRange: vi.fn().mockResolvedValue([]),
    loading: false,
    error: null,
  }),
}))

function mountEntry() {
  const pinia = createPinia()
  setActivePinia(pinia)
  return mount(Entry, {
    global: {
      plugins: [pinia],
    },
  })
}

describe('Entry View', () => {
  it('renders the page title and description', () => {
    const wrapper = mountEntry()
    expect(wrapper.text()).toContain('Log Entry')
    expect(wrapper.text()).toContain('Record your daily metrics')
  })

  it('renders tab selector for all 7 domains', () => {
    const wrapper = mountEntry()
    const tabs = wrapper.find('[data-testid="domain-tabs"]')
    expect(tabs.exists()).toBe(true)

    expect(wrapper.find('[data-testid="tab-productivity"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="tab-finance"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="tab-health"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="tab-metabolic"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="tab-digital"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="tab-mindfulness"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="tab-reading"]').exists()).toBe(true)
  })

  it('defaults to productivity form', () => {
    const wrapper = mountEntry()
    expect(wrapper.find('[data-testid="productivity-form"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="tab-productivity"]').classes()).toContain('domain-tab--active')
  })

  it('can switch between domain forms', async () => {
    const wrapper = mountEntry()

    // Click finance tab
    await wrapper.find('[data-testid="tab-finance"]').trigger('click')
    expect(wrapper.find('[data-testid="finance-form"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="productivity-form"]').exists()).toBe(false)

    // Click health tab
    await wrapper.find('[data-testid="tab-health"]').trigger('click')
    expect(wrapper.find('[data-testid="health-form"]').exists()).toBe(true)

    // Click metabolic tab
    await wrapper.find('[data-testid="tab-metabolic"]').trigger('click')
    expect(wrapper.find('[data-testid="metabolic-form"]').exists()).toBe(true)

    // Click digital tab
    await wrapper.find('[data-testid="tab-digital"]').trigger('click')
    expect(wrapper.find('[data-testid="digital-form"]').exists()).toBe(true)

    // Click mindfulness tab
    await wrapper.find('[data-testid="tab-mindfulness"]').trigger('click')
    expect(wrapper.find('[data-testid="mindfulness-form"]').exists()).toBe(true)

    // Click reading tab
    await wrapper.find('[data-testid="tab-reading"]').trigger('click')
    expect(wrapper.find('[data-testid="reading-form"]').exists()).toBe(true)
  })

  it('shows active tab styling', async () => {
    const wrapper = mountEntry()

    await wrapper.find('[data-testid="tab-health"]').trigger('click')
    expect(wrapper.find('[data-testid="tab-health"]').classes()).toContain('domain-tab--active')
    expect(wrapper.find('[data-testid="tab-productivity"]').classes()).not.toContain('domain-tab--active')
  })

  it('renders copy from yesterday button', () => {
    const wrapper = mountEntry()
    const copyBtn = wrapper.find('[data-testid="copy-yesterday"]')
    expect(copyBtn.exists()).toBe(true)
    expect(copyBtn.text()).toContain('Copy from Yesterday')
  })

  it('renders domain labels on tabs', () => {
    const wrapper = mountEntry()
    const domainLabels = ['Productivity', 'Finance', 'Health', 'Metabolic', 'Digital', 'Mindfulness', 'Reading']
    domainLabels.forEach((label) => {
      expect(wrapper.text()).toContain(label)
    })
  })

  it('shows card with active domain title', async () => {
    const wrapper = mountEntry()
    expect(wrapper.find('.card-title').text()).toBe('Productivity')

    await wrapper.find('[data-testid="tab-reading"]').trigger('click')
    expect(wrapper.find('.card-title').text()).toBe('Reading')
  })
})
