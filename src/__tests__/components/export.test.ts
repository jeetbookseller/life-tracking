import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ExportModal from '@/components/export/ExportModal.vue'
import PromptLibrary from '@/components/export/PromptLibrary.vue'
import type { ExportData } from '@/utils/export'

const emptyExportData: ExportData = {
  entries: {},
  anomalies: [],
}

function mountExportModal(data: ExportData = emptyExportData) {
  return mount(ExportModal, {
    props: { data },
  })
}

describe('ExportModal', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders domain selector', () => {
    const wrapper = mountExportModal()

    expect(wrapper.find('[data-testid="domain-selector"]').exists()).toBe(true)
  })

  it('renders date range picker', () => {
    const wrapper = mountExportModal()

    expect(wrapper.find('[data-testid="start-date"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="end-date"]').exists()).toBe(true)
  })

  it('renders format selector', () => {
    const wrapper = mountExportModal()

    expect(wrapper.find('[data-testid="format-selector"]').exists()).toBe(true)
  })

  it('renders copy-to-clipboard button', () => {
    const wrapper = mountExportModal()

    expect(wrapper.find('[data-testid="copy-button"]').exists()).toBe(true)
  })

  it('renders download button', () => {
    const wrapper = mountExportModal()

    expect(wrapper.find('[data-testid="download-button"]').exists()).toBe(true)
  })

  it('renders export preview area', () => {
    const wrapper = mountExportModal()

    expect(wrapper.find('[data-testid="export-preview"]').exists()).toBe(true)
  })

  it('renders template selector', () => {
    const wrapper = mountExportModal()

    expect(wrapper.find('[data-testid="template-selector"]').exists()).toBe(
      true,
    )
  })
})

describe('PromptLibrary', () => {
  it('renders pre-written prompt suggestions', () => {
    const wrapper = mount(PromptLibrary)

    expect(wrapper.find('[data-testid="prompt-library"]').exists()).toBe(true)
    // Should have at least 3 prompt suggestions
    const prompts = wrapper.findAll('[data-testid^="prompt-item"]')
    expect(prompts.length).toBeGreaterThanOrEqual(3)
  })

  it('emits select event when prompt is clicked', async () => {
    const wrapper = mount(PromptLibrary)

    const firstPrompt = wrapper.find('[data-testid="prompt-item-0"]')
    expect(firstPrompt.exists()).toBe(true)

    await firstPrompt.trigger('click')

    expect(wrapper.emitted('select')).toBeTruthy()
    expect(wrapper.emitted('select')![0]![0]).toBeTruthy()
  })

  it('renders prompt titles and descriptions', () => {
    const wrapper = mount(PromptLibrary)

    const firstPrompt = wrapper.find('[data-testid="prompt-item-0"]')
    expect(firstPrompt.text()).not.toBe('')
  })
})
