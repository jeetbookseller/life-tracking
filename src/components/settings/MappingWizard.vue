<script setup lang="ts">
import { ref, computed } from 'vue'
import { parseCSV, parseJSON, detectFormat, type ParseResult } from '@/utils/dataIngestion'
import { getAdapter, getAvailableAdapters, type Adapter, type FieldMapping } from '@/adapters/registry'
import { dryRun, commitImport, type ImportConfig, type DryRunResult, type ConflictPolicy } from '@/services/import'
import type { DataDomain } from '@/types/data-models'

const emit = defineEmits<{
  'import-complete': [result: { committedCount: number; skippedCount: number }]
}>()

const DOMAINS: { value: DataDomain; label: string }[] = [
  { value: 'productivity', label: 'Productivity' },
  { value: 'finance', label: 'Finance' },
  { value: 'health', label: 'Health' },
  { value: 'metabolic', label: 'Metabolic' },
  { value: 'digital', label: 'Digital Wellbeing' },
  { value: 'mindfulness', label: 'Mindfulness' },
  { value: 'reading', label: 'Reading' },
]

// State
const selectedSource = ref('')
const selectedDomain = ref<DataDomain>('health')
const conflictPolicy = ref<ConflictPolicy>('skip')
const fileContent = ref('')
const parseResult = ref<ParseResult | null>(null)
const preview = ref<DryRunResult | null>(null)
const customMappings = ref<FieldMapping[]>([])
const importComplete = ref(false)
const commitResult = ref<{ committedCount: number; skippedCount: number } | null>(null)

const availableAdapters = computed(() => getAvailableAdapters())

const activeAdapter = computed<Adapter | undefined>(() => {
  if (!selectedSource.value) return undefined
  return getAdapter(selectedSource.value)
})

const fieldMappings = computed<FieldMapping[]>(() => {
  if (activeAdapter.value) {
    return activeAdapter.value.fieldMappings
  }
  return customMappings.value
})

const hasParsedData = computed(() => parseResult.value && parseResult.value.rows.length > 0)

function handleFileUpload(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    const content = e.target?.result as string
    fileContent.value = content
    parseFile(content)
  }
  reader.readAsText(file)
}

function parseFile(content: string) {
  const format = detectFormat(content)
  if (format === 'csv') {
    parseResult.value = parseCSV(content)
  } else {
    parseResult.value = parseJSON(content)
  }

  // Auto-detect adapter if source is selected
  if (activeAdapter.value) {
    selectedDomain.value = activeAdapter.value.domain
  }
}

function runPreview() {
  if (!parseResult.value) return

  const config: ImportConfig = {
    domain: selectedDomain.value,
    rows: parseResult.value.rows,
    fieldMappings: fieldMappings.value,
    conflictPolicy: conflictPolicy.value,
    existingDates: [],
  }

  preview.value = dryRun(config)
}

function confirmImport() {
  if (!preview.value) return

  const result = commitImport(preview.value)
  commitResult.value = result
  importComplete.value = true
  emit('import-complete', result)
}
</script>

<template>
  <div data-testid="wizard-container" class="mapping-wizard">
    <h2>Import Data</h2>

    <!-- Step 1: File Upload -->
    <div class="wizard-section">
      <h3>1. Upload File</h3>
      <div data-testid="file-upload" class="file-upload">
        <input
          type="file"
          accept=".csv,.json,.tsv"
          @change="handleFileUpload"
        />
        <p class="hint">Supported formats: CSV, JSON, TSV</p>
      </div>
    </div>

    <!-- Step 2: Source & Domain Selection -->
    <div class="wizard-section">
      <h3>2. Configure Source</h3>
      <div class="form-row">
        <label>
          Source Preset
          <select data-testid="source-selector" v-model="selectedSource">
            <option value="">Manual Mapping</option>
            <option
              v-for="adapter in availableAdapters"
              :key="adapter.source"
              :value="adapter.source"
            >
              {{ adapter.label }}
            </option>
          </select>
        </label>

        <label>
          Target Domain
          <select data-testid="domain-selector" v-model="selectedDomain">
            <option
              v-for="domain in DOMAINS"
              :key="domain.value"
              :value="domain.value"
            >
              {{ domain.label }}
            </option>
          </select>
        </label>
      </div>
    </div>

    <!-- Step 3: Field Mapping (for manual mapping) -->
    <div v-if="hasParsedData && !activeAdapter" class="wizard-section">
      <h3>3. Map Fields</h3>
      <div data-testid="field-mapping" class="field-mapping">
        <p v-if="parseResult">
          Detected columns: {{ parseResult.headers.join(', ') }}
        </p>
        <p class="hint">
          Using {{ activeAdapter ? 'preset' : 'manual' }} mapping
        </p>
      </div>
    </div>

    <!-- Step 4: Conflict Policy -->
    <div class="wizard-section">
      <h3>{{ activeAdapter ? '3' : '4' }}. Conflict Policy</h3>
      <select data-testid="conflict-policy" v-model="conflictPolicy">
        <option value="skip">Skip (keep existing)</option>
        <option value="replace">Replace (overwrite existing)</option>
        <option value="merge">Merge (fill missing fields only)</option>
      </select>
    </div>

    <!-- Step 5: Preview -->
    <div data-testid="preview-section" class="wizard-section">
      <h3>Preview</h3>
      <button
        class="btn-secondary"
        :disabled="!hasParsedData"
        @click="runPreview"
      >
        Run Preview
      </button>

      <div v-if="preview" class="preview-summary">
        <p>Total rows: {{ preview.totalCount }}</p>
        <p class="valid">Valid: {{ preview.validCount }}</p>
        <p v-if="preview.invalidCount > 0" class="invalid">
          Invalid: {{ preview.invalidCount }}
        </p>
        <p v-if="preview.conflictCount > 0" class="conflict">
          Conflicts: {{ preview.conflictCount }} ({{ conflictPolicy }})
        </p>

        <div v-if="preview.errors.length > 0" class="error-list">
          <h4>Errors</h4>
          <ul>
            <li v-for="(err, i) in preview.errors.slice(0, 20)" :key="i">
              Row {{ err.row + 1 }}, {{ err.field }}: {{ err.message }}
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Step 6: Confirm Import -->
    <div class="wizard-section">
      <button
        data-testid="import-button"
        class="btn-primary"
        :disabled="!preview || preview.validCount === 0"
        @click="confirmImport"
      >
        Confirm Import
      </button>

      <div v-if="importComplete && commitResult" class="import-result">
        <p class="success">
          Import complete: {{ commitResult.committedCount }} rows imported,
          {{ commitResult.skippedCount }} skipped.
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mapping-wizard {
  max-width: 800px;
  margin: 0 auto;
}

.wizard-section {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: var(--color-surface, #f9f9f9);
  border: 1px solid var(--color-border, #e0e0e0);
  border-radius: var(--radius-md, 8px);
}

.wizard-section h3 {
  margin-top: 0;
  margin-bottom: 0.75rem;
}

.form-row {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.form-row label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
  min-width: 200px;
}

.form-row select,
.wizard-section > select {
  padding: 0.5rem;
  border: 1px solid var(--color-border, #ccc);
  border-radius: var(--radius-sm, 4px);
  background: var(--color-bg, #fff);
}

.file-upload input[type="file"] {
  padding: 0.5rem;
}

.hint {
  font-size: 0.85rem;
  color: var(--color-text-secondary, #666);
}

.preview-summary {
  margin-top: 0.75rem;
}

.valid { color: var(--color-success, #22c55e); }
.invalid { color: var(--color-error, #ef4444); }
.conflict { color: var(--color-warning, #f59e0b); }
.success { color: var(--color-success, #22c55e); font-weight: bold; }

.error-list {
  margin-top: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
}

.error-list ul {
  padding-left: 1.25rem;
  font-size: 0.85rem;
}

.btn-primary,
.btn-secondary {
  padding: 0.5rem 1.25rem;
  border: none;
  border-radius: var(--radius-sm, 4px);
  cursor: pointer;
  font-size: 0.95rem;
}

.btn-primary {
  background: var(--color-primary, #3b82f6);
  color: #fff;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--color-surface, #e5e7eb);
  color: var(--color-text, #333);
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.import-result {
  margin-top: 0.75rem;
}
</style>
