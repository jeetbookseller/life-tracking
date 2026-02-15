<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { DataDomain } from '@/types/data-models'
import {
  exportMarkdownKV,
  exportJSON,
  exportCSV,
  EXPORT_TEMPLATES,
  getTemplateDateRange,
  type ExportFormat,
  type ExportTemplate,
  type ExportData,
  type ExportOptions,
} from '@/utils/export'

const props = defineProps<{
  data: ExportData
}>()

const ALL_DOMAINS: Array<{ value: DataDomain; label: string }> = [
  { value: 'productivity', label: 'Productivity' },
  { value: 'finance', label: 'Finance' },
  { value: 'health', label: 'Health' },
  { value: 'metabolic', label: 'Metabolic' },
  { value: 'digital', label: 'Digital Wellbeing' },
  { value: 'mindfulness', label: 'Mindfulness' },
  { value: 'reading', label: 'Reading' },
]

const selectedDomains = ref<DataDomain[]>([
  'productivity',
  'finance',
  'health',
  'metabolic',
  'digital',
  'mindfulness',
  'reading',
])

const defaultRange = getTemplateDateRange('weekly')
const startDate = ref(defaultRange.startDate)
const endDate = ref(defaultRange.endDate)
const format = ref<ExportFormat>('markdown-kv')
const selectedTemplate = ref<ExportTemplate>('weekly')
const copySuccess = ref(false)

watch(selectedTemplate, (tmpl) => {
  const range = getTemplateDateRange(tmpl)
  startDate.value = range.startDate
  endDate.value = range.endDate
})

function toggleDomain(domain: DataDomain) {
  const idx = selectedDomains.value.indexOf(domain)
  if (idx >= 0) {
    selectedDomains.value.splice(idx, 1)
  } else {
    selectedDomains.value.push(domain)
  }
}

const exportOptions = computed<ExportOptions>(() => ({
  domains: selectedDomains.value,
  startDate: startDate.value,
  endDate: endDate.value,
  format: format.value,
  template: selectedTemplate.value,
}))

const exportedText = computed(() => {
  switch (format.value) {
    case 'markdown-kv':
      return exportMarkdownKV(props.data, exportOptions.value)
    case 'json':
      return exportJSON(props.data, exportOptions.value)
    case 'csv':
      return exportCSV(props.data, exportOptions.value)
    default:
      return ''
  }
})

async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(exportedText.value)
    copySuccess.value = true
    setTimeout(() => {
      copySuccess.value = false
    }, 2000)
  } catch {
    // Fallback for environments without clipboard API
    const textArea = document.createElement('textarea')
    textArea.value = exportedText.value
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    copySuccess.value = true
    setTimeout(() => {
      copySuccess.value = false
    }, 2000)
  }
}

function download() {
  const extensions: Record<ExportFormat, string> = {
    'markdown-kv': 'md',
    json: 'json',
    csv: 'csv',
  }
  const mimeTypes: Record<ExportFormat, string> = {
    'markdown-kv': 'text/markdown',
    json: 'application/json',
    csv: 'text/csv',
  }

  const ext = extensions[format.value]
  const mime = mimeTypes[format.value]
  const blob = new Blob([exportedText.value], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `life-tracking-export-${startDate.value}-to-${endDate.value}.${ext}`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="export-modal" data-testid="export-modal">
    <!-- Template selector -->
    <div class="export-section">
      <label class="export-label">Template</label>
      <div class="template-grid" data-testid="template-selector">
        <button
          v-for="tmpl in EXPORT_TEMPLATES"
          :key="tmpl.id"
          class="template-btn"
          :class="{ 'template-btn--active': selectedTemplate === tmpl.id }"
          @click="selectedTemplate = tmpl.id"
        >
          <span class="template-label">{{ tmpl.label }}</span>
          <span class="template-desc">{{ tmpl.description }}</span>
        </button>
      </div>
    </div>

    <!-- Domain selector -->
    <div class="export-section">
      <label class="export-label">Domains</label>
      <div class="domain-chips" data-testid="domain-selector">
        <button
          v-for="d in ALL_DOMAINS"
          :key="d.value"
          class="domain-chip"
          :class="{ 'domain-chip--active': selectedDomains.includes(d.value) }"
          @click="toggleDomain(d.value)"
        >
          {{ d.label }}
        </button>
      </div>
    </div>

    <!-- Date range -->
    <div class="export-section export-dates">
      <div>
        <label class="export-label" for="start-date">Start Date</label>
        <input
          id="start-date"
          v-model="startDate"
          type="date"
          class="export-input"
          data-testid="start-date"
        />
      </div>
      <div>
        <label class="export-label" for="end-date">End Date</label>
        <input
          id="end-date"
          v-model="endDate"
          type="date"
          class="export-input"
          data-testid="end-date"
        />
      </div>
    </div>

    <!-- Format selector -->
    <div class="export-section">
      <label class="export-label">Format</label>
      <div class="format-selector" data-testid="format-selector">
        <button
          class="format-btn"
          :class="{ 'format-btn--active': format === 'markdown-kv' }"
          @click="format = 'markdown-kv'"
        >
          Markdown-KV
        </button>
        <button
          class="format-btn"
          :class="{ 'format-btn--active': format === 'json' }"
          @click="format = 'json'"
        >
          JSON
        </button>
        <button
          class="format-btn"
          :class="{ 'format-btn--active': format === 'csv' }"
          @click="format = 'csv'"
        >
          CSV
        </button>
      </div>
    </div>

    <!-- Actions -->
    <div class="export-actions">
      <button
        class="action-btn action-btn--primary"
        data-testid="copy-button"
        @click="copyToClipboard"
      >
        {{ copySuccess ? 'Copied!' : 'Copy to Clipboard' }}
      </button>
      <button
        class="action-btn action-btn--secondary"
        data-testid="download-button"
        @click="download"
      >
        Download File
      </button>
    </div>

    <!-- Preview -->
    <div class="export-section">
      <label class="export-label">Preview</label>
      <pre class="export-preview" data-testid="export-preview">{{ exportedText }}</pre>
    </div>
  </div>
</template>

<style scoped>
.export-modal {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.export-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.export-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-secondary, #9a9ab0);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

@media (max-width: 600px) {
  .template-grid {
    grid-template-columns: 1fr;
  }
}

.template-btn {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
  padding: 0.75rem;
  background: var(--color-surface, #1e1e3a);
  border: 1px solid var(--color-border, #2d2d4a);
  border-radius: var(--radius-sm, 6px);
  cursor: pointer;
  color: var(--color-text, #e4e4f0);
  text-align: left;
  transition: border-color 0.15s;
}

.template-btn:hover {
  border-color: var(--color-primary, #6366f1);
}

.template-btn--active {
  border-color: var(--color-primary, #6366f1);
  background: var(--color-primary-subtle, rgba(99, 102, 241, 0.1));
}

.template-label {
  font-weight: 600;
  font-size: 0.875rem;
}

.template-desc {
  font-size: 0.75rem;
  color: var(--color-text-secondary, #9a9ab0);
}

.domain-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.domain-chip {
  padding: 0.375rem 0.75rem;
  font-size: 0.8125rem;
  border: 1px solid var(--color-border, #2d2d4a);
  border-radius: 999px;
  background: var(--color-surface, #1e1e3a);
  color: var(--color-text-secondary, #9a9ab0);
  cursor: pointer;
  transition: all 0.15s;
}

.domain-chip:hover {
  border-color: var(--color-primary, #6366f1);
  color: var(--color-text, #e4e4f0);
}

.domain-chip--active {
  background: var(--color-primary, #6366f1);
  border-color: var(--color-primary, #6366f1);
  color: #fff;
}

.export-dates {
  flex-direction: row;
  gap: 1rem;
}

.export-dates > div {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.export-input {
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  background: var(--color-surface, #1e1e3a);
  border: 1px solid var(--color-border, #2d2d4a);
  border-radius: var(--radius-sm, 6px);
  color: var(--color-text, #e4e4f0);
}

.format-selector {
  display: flex;
  gap: 0.5rem;
}

.format-btn {
  flex: 1;
  padding: 0.5rem;
  font-size: 0.8125rem;
  font-weight: 600;
  border: 1px solid var(--color-border, #2d2d4a);
  border-radius: var(--radius-sm, 6px);
  background: var(--color-surface, #1e1e3a);
  color: var(--color-text-secondary, #9a9ab0);
  cursor: pointer;
  transition: all 0.15s;
}

.format-btn:hover {
  border-color: var(--color-primary, #6366f1);
}

.format-btn--active {
  background: var(--color-primary, #6366f1);
  border-color: var(--color-primary, #6366f1);
  color: #fff;
}

.export-actions {
  display: flex;
  gap: 0.75rem;
}

.action-btn {
  flex: 1;
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  border: none;
  border-radius: var(--radius-sm, 6px);
  cursor: pointer;
  transition: opacity 0.15s;
}

.action-btn:hover {
  opacity: 0.9;
}

.action-btn--primary {
  background: var(--color-primary, #6366f1);
  color: #fff;
}

.action-btn--secondary {
  background: var(--color-surface, #1e1e3a);
  border: 1px solid var(--color-border, #2d2d4a);
  color: var(--color-text, #e4e4f0);
}

.export-preview {
  max-height: 400px;
  overflow: auto;
  padding: 1rem;
  background: var(--color-bg, #13132b);
  border: 1px solid var(--color-border, #2d2d4a);
  border-radius: var(--radius-sm, 6px);
  font-family: 'Fira Code', 'Cascadia Code', monospace;
  font-size: 0.75rem;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
  color: var(--color-text, #e4e4f0);
}
</style>
