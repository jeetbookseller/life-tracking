<script setup lang="ts">
import { reactive, computed } from 'vue'
import type { ReadingLog, ValidationError } from '@/types/data-models'
import { validateReadingLog } from '@/types/data-models'
import Input from '@/components/ui/Input.vue'
import DatePicker from '@/components/ui/DatePicker.vue'
import Button from '@/components/ui/Button.vue'

const props = defineProps<{
  initialData?: Partial<ReadingLog>
}>()

const emit = defineEmits<{
  save: [data: Omit<ReadingLog, 'id' | 'createdAt' | 'updatedAt'>]
  cancel: []
}>()

const today = new Date().toISOString().split('T')[0]

const form = reactive({
  date: props.initialData?.date ?? today,
  bookTitle: props.initialData?.bookTitle ?? '',
  pagesRead: props.initialData?.pagesRead ?? 0,
  highlightsCount: props.initialData?.highlightsCount ?? 0,
  currentPage: props.initialData?.currentPage ?? 0,
  totalPages: props.initialData?.totalPages ?? 0,
  notes: props.initialData?.notes ?? '',
})

const errors = reactive<Record<string, string>>({})

const progressPercent = computed(() => {
  if (!form.totalPages || form.totalPages <= 0) return 0
  return Math.min(100, Math.round((Number(form.currentPage) / Number(form.totalPages)) * 100))
})

function clearErrors() {
  Object.keys(errors).forEach((k) => delete errors[k])
}

function setErrors(validationErrors: ValidationError[]) {
  clearErrors()
  validationErrors.forEach((e) => {
    errors[e.field] = e.message
  })
}

function handleSubmit() {
  const result = validateReadingLog(form)
  if (!result.valid) {
    setErrors(result.errors)
    return
  }
  clearErrors()
  emit('save', { ...form, date: form.date as string })
}
</script>

<template>
  <form class="domain-form" @submit.prevent="handleSubmit" data-testid="reading-form">
    <DatePicker v-model="form.date" label="Date" :error="errors.date" />

    <Input
      v-model="form.bookTitle"
      label="Book Title"
      placeholder="Enter book title..."
      :error="errors.bookTitle"
    />

    <Input
      v-model="form.pagesRead"
      label="Pages Read"
      type="number"
      :error="errors.pagesRead"
    />

    <Input
      v-model="form.highlightsCount"
      label="Highlights Captured"
      type="number"
      :error="errors.highlightsCount"
    />

    <div class="progress-section">
      <div class="progress-inputs">
        <Input v-model="form.currentPage" label="Current Page" type="number" />
        <Input v-model="form.totalPages" label="Total Pages" type="number" />
      </div>
      <div v-if="form.totalPages > 0" class="progress-bar-container">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: `${progressPercent}%` }" />
        </div>
        <span class="progress-text" data-testid="progress-percent">{{ progressPercent }}%</span>
      </div>
    </div>

    <div class="input-group">
      <label class="input-label">Notes</label>
      <textarea
        v-model="form.notes"
        class="textarea-field"
        rows="3"
        placeholder="Optional notes..."
      />
    </div>

    <div class="form-actions">
      <Button type="submit" variant="primary">Save Entry</Button>
      <Button type="button" variant="secondary" @click="$emit('cancel')">Cancel</Button>
    </div>
  </form>
</template>

<style scoped>
.domain-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.input-label {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
}

.progress-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.progress-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-sm);
}

.progress-bar-container {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: var(--color-bg);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--color-primary);
  border-radius: var(--radius-full);
  transition: width var(--transition-normal);
}

.progress-text {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-secondary);
  min-width: 3rem;
  text-align: right;
}

.textarea-field {
  padding: var(--space-sm) var(--space-md);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text);
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  resize: vertical;
}

.textarea-field:focus {
  outline: none;
  border-color: var(--color-primary);
}

.form-actions {
  display: flex;
  gap: var(--space-sm);
  padding-top: var(--space-md);
}
</style>
