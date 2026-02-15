import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ExportView from '@/views/Export.vue'

describe('Export view', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders the export view', () => {
    const wrapper = mount(ExportView)

    expect(wrapper.find('.view-container').exists()).toBe(true)
  })

  it('renders heading and description', () => {
    const wrapper = mount(ExportView)

    expect(wrapper.find('h1').text()).toContain('Export')
    expect(wrapper.find('.view-description').exists()).toBe(true)
  })

  it('renders the ExportModal component', () => {
    const wrapper = mount(ExportView)

    expect(wrapper.find('[data-testid="export-modal"]').exists()).toBe(true)
  })

  it('renders the PromptLibrary component', () => {
    const wrapper = mount(ExportView)

    expect(wrapper.find('[data-testid="prompt-library"]').exists()).toBe(true)
  })
})
