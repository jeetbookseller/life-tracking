<script setup lang="ts">
import { reactive } from 'vue'
import type { DigitalLog, AppUsage, ValidationError } from '@/types/data-models'
import { validateDigitalLog } from '@/types/data-models'
import Input from '@/components/ui/Input.vue'
import DatePicker from '@/components/ui/DatePicker.vue'
import Button from '@/components/ui/Button.vue'

const props = defineProps<{
  initialData?: Partial<DigitalLog>
}>()

const emit = defineEmits<{
  save: [data: Omit<DigitalLog, 'id' | 'createdAt' | 'updatedAt'>]
  cancel: []
}>()

const today = new Date().toISOString().split('T')[0]

const form = reactive({
  date: props.initialData?.date ?? today,
  totalScreenTime: props.initialData?.totalScreenTime ?? 0,
  unlocks: props.initialData?.unlocks ?? 0,
  topApps: [...(props.initialData?.topApps ?? [])] as AppUsage[],
  notes: props.initialData?.notes ?? '',
})

const errors = reactive<Record<string, string>>({})

const newApp = reactive({ name: '', minutes: 0 })

function addApp() {
  if (newApp.name.trim() && form.topApps.length < 3) {
    form.topApps.push({ name: newApp.name.trim(), minutes: Number(newApp.minutes) })
    newApp.name = ''
    newApp.minutes = 0
  }
}

function removeApp(index: number) {
  form.topApps.splice(index, 1)
}

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
  const result = validateDigitalLog(form)
  if (!result.valid) {
    setErrors(result.errors)
    return
  }
  clearErrors()
  emit('save', { ...form, date: form.date as string, topApps: [...form.topApps] })
}
</script>

<template>
  <form class="domain-form" @submit.prevent="handleSubmit" data-testid="digital-form">
    <DatePicker v-model="form.date" label="Date" :error="errors.date" />

    <Input
      v-model="form.totalScreenTime"
      label="Total Screen Time (minutes)"
      type="number"
      :error="errors.totalScreenTime"
    />

    <Input
      v-model="form.unlocks"
      label="Phone Unlocks"
      type="number"
      :error="errors.unlocks"
    />

    <div class="input-group">
      <label class="input-label">Top Apps (max 3)</label>
      <div class="app-list">
        <div v-for="(app, i) in form.topApps" :key="i" class="app-item">
          <span>{{ app.name }} - {{ app.minutes }} min</span>
          <button type="button" class="remove-btn" @click="removeApp(i)">x</button>
        </div>
      </div>
      <div v-if="form.topApps.length < 3" class="app-add">
        <input
          v-model="newApp.name"
          class="app-input"
          placeholder="App name"
          data-testid="app-name"
        />
        <input
          v-model="newApp.minutes"
          class="app-input app-input--small"
          type="number"
          placeholder="Minutes"
          data-testid="app-minutes"
        />
        <Button type="button" size="sm" variant="secondary" @click="addApp">Add</Button>
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

.app-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.app-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-xs) var(--space-sm);
  background: var(--color-surface-elevated);
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
}

.remove-btn {
  background: none;
  border: none;
  color: var(--color-danger);
  cursor: pointer;
  font-size: var(--text-sm);
  padding: 0 var(--space-xs);
}

.app-add {
  display: flex;
  gap: var(--space-sm);
  align-items: center;
}

.app-input {
  flex: 1;
  padding: var(--space-xs) var(--space-sm);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text);
  font-size: var(--text-sm);
}

.app-input--small {
  flex: 0 0 80px;
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
