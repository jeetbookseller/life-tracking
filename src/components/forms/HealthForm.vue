<script setup lang="ts">
import { reactive } from 'vue'
import type { HealthLog, ValidationError } from '@/types/data-models'
import { validateHealthLog } from '@/types/data-models'
import Input from '@/components/ui/Input.vue'
import DatePicker from '@/components/ui/DatePicker.vue'
import Button from '@/components/ui/Button.vue'

const props = defineProps<{
  initialData?: Partial<HealthLog>
}>()

const emit = defineEmits<{
  save: [data: Omit<HealthLog, 'id' | 'createdAt' | 'updatedAt'>]
  cancel: []
}>()

const today = new Date().toISOString().split('T')[0]

const form = reactive({
  date: props.initialData?.date ?? today,
  restingHR: props.initialData?.restingHR ?? 60,
  hrv: props.initialData?.hrv ?? 0,
  sleepDuration: props.initialData?.sleepDuration ?? 0,
  sleepStages: {
    rem: props.initialData?.sleepStages?.rem ?? 0,
    deep: props.initialData?.sleepStages?.deep ?? 0,
    core: props.initialData?.sleepStages?.core ?? 0,
    awake: props.initialData?.sleepStages?.awake ?? 0,
  },
  activeMinutes: props.initialData?.activeMinutes ?? 0,
  steps: props.initialData?.steps ?? 0,
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
  const result = validateHealthLog(form)
  if (!result.valid) {
    setErrors(result.errors)
    return
  }
  clearErrors()
  emit('save', {
    ...form,
    date: form.date as string,
    sleepStages: { ...form.sleepStages },
  })
}

function getHRIndicator(hr: number): string {
  if (hr >= 40 && hr <= 70) return 'normal'
  if (hr < 40) return 'low'
  return 'high'
}
</script>

<template>
  <form class="domain-form" @submit.prevent="handleSubmit" data-testid="health-form">
    <DatePicker v-model="form.date" label="Date" :error="errors.date" />

    <div class="input-with-indicator">
      <Input
        v-model="form.restingHR"
        label="Resting Heart Rate (bpm)"
        type="number"
        :error="errors.restingHR"
      />
      <span
        class="range-indicator"
        :class="`range-indicator--${getHRIndicator(Number(form.restingHR))}`"
        data-testid="hr-indicator"
      >
        {{ getHRIndicator(Number(form.restingHR)) }}
      </span>
    </div>

    <Input v-model="form.hrv" label="HRV (ms)" type="number" :error="errors.hrv" />

    <Input
      v-model="form.sleepDuration"
      label="Sleep Duration (hours)"
      type="number"
      :error="errors.sleepDuration"
    />

    <fieldset class="fieldset">
      <legend class="fieldset-legend">Sleep Stages (hours)</legend>
      <div class="stages-grid">
        <Input v-model="form.sleepStages.rem" label="REM" type="number" />
        <Input v-model="form.sleepStages.deep" label="Deep" type="number" />
        <Input v-model="form.sleepStages.core" label="Core" type="number" />
        <Input v-model="form.sleepStages.awake" label="Awake" type="number" />
      </div>
    </fieldset>

    <Input
      v-model="form.activeMinutes"
      label="Active Minutes"
      type="number"
      :error="errors.activeMinutes"
    />

    <Input v-model="form.steps" label="Steps" type="number" />

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

.input-with-indicator {
  position: relative;
}

.range-indicator {
  position: absolute;
  top: 0;
  right: 0;
  font-size: var(--text-xs);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-sm);
  text-transform: uppercase;
  font-weight: 600;
}

.range-indicator--normal {
  color: var(--color-success);
}

.range-indicator--low,
.range-indicator--high {
  color: var(--color-warning);
}

.fieldset {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: var(--space-md);
}

.fieldset-legend {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
  padding: 0 var(--space-xs);
}

.stages-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-sm);
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
