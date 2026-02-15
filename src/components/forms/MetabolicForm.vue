<script setup lang="ts">
import { reactive } from 'vue'
import type { MetabolicLog, MealEntry, ValidationError } from '@/types/data-models'
import { validateMetabolicLog } from '@/types/data-models'
import Input from '@/components/ui/Input.vue'
import DatePicker from '@/components/ui/DatePicker.vue'
import Button from '@/components/ui/Button.vue'

const props = defineProps<{
  initialData?: Partial<MetabolicLog>
}>()

const emit = defineEmits<{
  save: [data: Omit<MetabolicLog, 'id' | 'createdAt' | 'updatedAt'>]
  cancel: []
}>()

const today = new Date().toISOString().split('T')[0]

const form = reactive({
  date: props.initialData?.date ?? today,
  gutMicrobiomeScore: props.initialData?.gutMicrobiomeScore ?? 0,
  dailyFoodScore: props.initialData?.dailyFoodScore ?? 0,
  fiberIntake: props.initialData?.fiberIntake ?? 0,
  glucoseResponse: props.initialData?.glucoseResponse,
  fatResponse: props.initialData?.fatResponse,
  meals: [...(props.initialData?.meals ?? [])] as MealEntry[],
  notes: props.initialData?.notes ?? '',
})

const errors = reactive<Record<string, string>>({})

const newMeal = reactive({ name: '', score: 0, time: '12:00' })

function addMeal() {
  if (newMeal.name.trim()) {
    form.meals.push({ name: newMeal.name.trim(), score: Number(newMeal.score), time: newMeal.time })
    newMeal.name = ''
    newMeal.score = 0
    newMeal.time = '12:00'
  }
}

function removeMeal(index: number) {
  form.meals.splice(index, 1)
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
  const result = validateMetabolicLog(form)
  if (!result.valid) {
    setErrors(result.errors)
    return
  }
  clearErrors()
  emit('save', { ...form, date: form.date as string, meals: [...form.meals] })
}
</script>

<template>
  <form class="domain-form" @submit.prevent="handleSubmit" data-testid="metabolic-form">
    <DatePicker v-model="form.date" label="Date" :error="errors.date" />

    <Input
      v-model="form.gutMicrobiomeScore"
      label="Gut Microbiome Score"
      type="number"
      :error="errors.gutMicrobiomeScore"
    />

    <Input
      v-model="form.dailyFoodScore"
      label="Daily Food Score"
      type="number"
      :error="errors.dailyFoodScore"
    />

    <Input
      v-model="form.fiberIntake"
      label="Fiber Intake (g)"
      type="number"
      :error="errors.fiberIntake"
    />

    <Input v-model="form.glucoseResponse" label="Glucose Response" type="number" />

    <Input v-model="form.fatResponse" label="Fat Response" type="number" />

    <div class="input-group">
      <label class="input-label">Meals</label>
      <div class="meal-list">
        <div v-for="(meal, i) in form.meals" :key="i" class="meal-item">
          <span>{{ meal.time }} - {{ meal.name }} (score: {{ meal.score }})</span>
          <button type="button" class="remove-btn" @click="removeMeal(i)">x</button>
        </div>
      </div>
      <div class="meal-add">
        <input
          v-model="newMeal.name"
          class="meal-input"
          placeholder="Meal name"
          data-testid="meal-name"
        />
        <input
          v-model="newMeal.score"
          class="meal-input meal-input--small"
          type="number"
          placeholder="Score"
          data-testid="meal-score"
        />
        <input
          v-model="newMeal.time"
          class="meal-input meal-input--small"
          type="time"
          data-testid="meal-time"
        />
        <Button type="button" size="sm" variant="secondary" @click="addMeal">Add</Button>
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

.meal-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.meal-item {
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

.meal-add {
  display: flex;
  gap: var(--space-sm);
  align-items: center;
  flex-wrap: wrap;
}

.meal-input {
  flex: 1;
  min-width: 80px;
  padding: var(--space-xs) var(--space-sm);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text);
  font-size: var(--text-sm);
}

.meal-input--small {
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
