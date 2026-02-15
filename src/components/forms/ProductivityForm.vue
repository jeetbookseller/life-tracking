<script setup lang="ts">
import { reactive } from 'vue'
import type { ProductivityLog, ValidationError } from '@/types/data-models'
import { validateProductivityLog } from '@/types/data-models'
import Input from '@/components/ui/Input.vue'
import DatePicker from '@/components/ui/DatePicker.vue'
import Button from '@/components/ui/Button.vue'

const props = defineProps<{
  initialData?: Partial<ProductivityLog>
}>()

const emit = defineEmits<{
  save: [data: Omit<ProductivityLog, 'id' | 'createdAt' | 'updatedAt'>]
  cancel: []
}>()

const today = new Date().toISOString().split('T')[0]

const form = reactive({
  date: props.initialData?.date ?? today,
  tasksPlanned: props.initialData?.tasksPlanned ?? 0,
  tasksCompleted: props.initialData?.tasksCompleted ?? 0,
  focusRating: props.initialData?.focusRating ?? 3,
  deepWorkHours: props.initialData?.deepWorkHours ?? 0,
  notes: props.initialData?.notes ?? '',
})

const errors = reactive<Record<string, string>>({})

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
  const result = validateProductivityLog(form)
  if (!result.valid) {
    setErrors(result.errors)
    return
  }
  clearErrors()
  emit('save', { ...form, date: form.date as string })
}

const quickRatings = [1, 2, 3, 4, 5]
</script>

<template>
  <form class="domain-form" @submit.prevent="handleSubmit" data-testid="productivity-form">
    <DatePicker v-model="form.date" label="Date" :error="errors.date" />

    <Input
      v-model="form.tasksPlanned"
      label="Tasks Planned"
      type="number"
      :error="errors.tasksPlanned"
    />

    <Input
      v-model="form.tasksCompleted"
      label="Tasks Completed"
      type="number"
      :error="errors.tasksCompleted"
    />

    <div class="input-group">
      <label class="input-label">Focus Rating</label>
      <div class="rating-buttons">
        <button
          v-for="r in quickRatings"
          :key="r"
          type="button"
          class="rating-btn"
          :class="{ 'rating-btn--active': form.focusRating === r }"
          @click="form.focusRating = r"
          :data-testid="`focus-rating-${r}`"
        >
          {{ r }}
        </button>
      </div>
      <span v-if="errors.focusRating" class="field-error">{{ errors.focusRating }}</span>
    </div>

    <Input
      v-model="form.deepWorkHours"
      label="Deep Work Hours"
      type="number"
      :error="errors.deepWorkHours"
    />

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

.rating-buttons {
  display: flex;
  gap: var(--space-sm);
}

.rating-btn {
  width: 2.5rem;
  height: 2.5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg);
  color: var(--color-text);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.rating-btn--active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #fff;
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

.field-error {
  font-size: var(--text-xs);
  color: var(--color-danger);
}

.form-actions {
  display: flex;
  gap: var(--space-sm);
  padding-top: var(--space-md);
}
</style>
