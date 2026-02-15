import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ReadingForm from '@/components/forms/ReadingForm.vue'

function mountForm(props = {}) {
  return mount(ReadingForm, { props })
}

describe('ReadingForm', () => {
  it('renders all required fields', () => {
    const wrapper = mountForm()
    expect(wrapper.find('[data-testid="reading-form"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Book Title')
    expect(wrapper.text()).toContain('Pages Read')
    expect(wrapper.text()).toContain('Highlights Captured')
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
        bookTitle: 'Deep Work',
        pagesRead: 30,
        highlightsCount: 5,
        currentPage: 120,
        totalPages: 300,
      },
    })

    await wrapper.find('form').trigger('submit')

    const emitted = wrapper.emitted('save')
    expect(emitted).toHaveLength(1)
    const data = emitted![0][0] as Record<string, unknown>
    expect(data).toHaveProperty('bookTitle', 'Deep Work')
    expect(data).toHaveProperty('pagesRead')
    expect(data).toHaveProperty('highlightsCount')
  })

  it('validation prevents submitting without book title', async () => {
    const wrapper = mountForm({
      initialData: {
        date: '2025-01-15',
        bookTitle: '',
        pagesRead: 10,
        highlightsCount: 2,
      },
    })

    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('save')).toBeUndefined()
  })

  it('validation rejects negative pages read', async () => {
    const wrapper = mountForm({
      initialData: {
        date: '2025-01-15',
        bookTitle: 'Some Book',
        pagesRead: -5,
        highlightsCount: 0,
      },
    })

    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('save')).toBeUndefined()
  })

  it('shows progress bar when total pages is set', () => {
    const wrapper = mountForm({
      initialData: {
        date: '2025-01-15',
        bookTitle: 'Deep Work',
        pagesRead: 30,
        highlightsCount: 5,
        currentPage: 150,
        totalPages: 300,
      },
    })

    const progressText = wrapper.find('[data-testid="progress-percent"]')
    expect(progressText.exists()).toBe(true)
    expect(progressText.text()).toBe('50%')
  })

  it('does not show progress bar when total pages is 0', () => {
    const wrapper = mountForm()
    const progressText = wrapper.find('[data-testid="progress-percent"]')
    expect(progressText.exists()).toBe(false)
  })

  it('populates form with initial data for edit mode', () => {
    const wrapper = mountForm({
      initialData: {
        date: '2025-06-01',
        bookTitle: 'Atomic Habits',
        pagesRead: 50,
        highlightsCount: 10,
        currentPage: 200,
        totalPages: 320,
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

  it('renders current page and total pages inputs', () => {
    const wrapper = mountForm()
    expect(wrapper.text()).toContain('Current Page')
    expect(wrapper.text()).toContain('Total Pages')
  })
})
