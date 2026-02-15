<script setup lang="ts">
import { reactive } from 'vue'
import type { MindfulnessLog, ValidationError } from '@/types/data-models'
import { validateMindfulnessLog } from '@/types/data-models'
import Input from '@/components/ui/Input.vue'
import Select from '@/components/ui/Select.vue'
import DatePicker from '@/components/ui/DatePicker.vue'
import Button from '@/components/ui/Button.vue'

const props = defineProps<{
  initialData?: Partial<MindfulnessLog>
}>()

const emit = defineEmits<{
  save: [data: Omit<MindfulnessLog, 'id' | 'createdAt' | 'updatedAt'>]
  cancel: []
}>()

const today = new Date().toISOString().split('T')[0]

const meditationTypes = [
  { value: 'mindfulness', label: 'Mindfulness' },
  { value: 'breathing', label: 'Breathing' },
  { value: 'body-scan', label: 'Body Scan' },
  { value: 'loving-kindness', label: 'Loving Kindness' },
  { value: 'visualization', label: 'Visualization' },
  { value: 'mantra', label: 'Mantra' },
  { value: 'other', label: 'Other' },
]

const form = reactive({
  date: props.initialData?.date ?? today,
  meditationType: props.initialData?.meditationType ?? '',
  duration: props.initialData?.duration ?? 0,
  qualityRating: props.initialData?.qualityRating ?? 3,
  streakCount: props.initialData?.streakCount ?? 0,
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
  const result = validateMindfulnessLog(form)
  if (!result.valid) {
    setErrors(result.errors)
    return
  }
  clearErrors()
  emit('save', { ...form, date: form.date as string })
}

const qualityRatings = [1, 2, 3, 4, 5]
</script>

<template>
  <form class="domain-form" @submit.prevent="handleSubmit" data-testid="mindfulness-form">
    <DatePicker v-model="form.date" label="Date" :error="errors.date" />

    <Select
      v-model="form.meditationType"
      label="Meditation Type"
      :options="meditationTypes"
      placeholder="Select type..."
      :error="errors.meditationType"
    />

    <Input
      v-model="form.duration"
      label="Duration (minutes)"
      type="number"
      :error="errors.duration"
    />

    <div class="input-group">
      <label class="input-label">Quality Rating</label>
      <div class="rating-buttons">
        <button
          v-for="r in qualityRatings"
          :key="r"
          type="button"
          class="rating-btn"
          :class="{ 'rating-btn--active': form.qualityRating === r }"
          @click="form.qualityRating = r"
          :data-testid="`quality-rating-${r}`"
        >
          {{ r }}
        </button>
      </div>
      <span v-if="errors.qualityRating" class="field-error">{{ errors.qualityRating }}</span>
    </div>

    <Input
      v-model="form.streakCount"
      label="Streak Count (days)"
      type="number"
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

.field-error {
  font-size: var(--text-xs);
  color: var(--color-danger);
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
