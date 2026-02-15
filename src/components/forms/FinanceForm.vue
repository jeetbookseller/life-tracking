<script setup lang="ts">
import { reactive, watch } from 'vue'
import type { FinanceLog, ValidationError } from '@/types/data-models'
import { validateFinanceLog } from '@/types/data-models'
import Input from '@/components/ui/Input.vue'
import DatePicker from '@/components/ui/DatePicker.vue'
import Button from '@/components/ui/Button.vue'

const props = defineProps<{
  initialData?: Partial<FinanceLog>
}>()

const emit = defineEmits<{
  save: [data: Omit<FinanceLog, 'id' | 'createdAt' | 'updatedAt'>]
  cancel: []
}>()

const today = new Date().toISOString().split('T')[0]

const form = reactive({
  date: props.initialData?.date ?? today,
  totalAssets: props.initialData?.totalAssets ?? 0,
  totalLiabilities: props.initialData?.totalLiabilities ?? 0,
  netWorth: props.initialData?.netWorth ?? 0,
  categorySpending: { ...props.initialData?.categorySpending } as Record<string, number>,
  notes: props.initialData?.notes ?? '',
})

// Auto-calculate net worth
watch(
  () => [form.totalAssets, form.totalLiabilities],
  () => {
    form.netWorth = Number(form.totalAssets) - Number(form.totalLiabilities)
  },
  { immediate: true },
)

const errors = reactive<Record<string, string>>({})

// Category spending management
const newCategory = reactive({ name: '', amount: 0 })

function addCategory() {
  if (newCategory.name.trim()) {
    form.categorySpending[newCategory.name.trim()] = Number(newCategory.amount)
    newCategory.name = ''
    newCategory.amount = 0
  }
}

function removeCategory(name: string) {
  delete form.categorySpending[name]
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
  const result = validateFinanceLog(form)
  if (!result.valid) {
    setErrors(result.errors)
    return
  }
  clearErrors()
  emit('save', { ...form, date: form.date as string, categorySpending: { ...form.categorySpending } })
}
</script>

<template>
  <form class="domain-form" @submit.prevent="handleSubmit" data-testid="finance-form">
    <DatePicker v-model="form.date" label="Date" :error="errors.date" />

    <Input
      v-model="form.totalAssets"
      label="Total Assets ($)"
      type="number"
      :error="errors.totalAssets"
    />

    <Input
      v-model="form.totalLiabilities"
      label="Total Liabilities ($)"
      type="number"
      :error="errors.totalLiabilities"
    />

    <div class="input-group">
      <label class="input-label">Net Worth (calculated)</label>
      <div class="calculated-value" data-testid="net-worth-display">
        ${{ form.netWorth.toLocaleString() }}
      </div>
    </div>

    <div class="input-group">
      <label class="input-label">Category Spending</label>
      <div class="category-list">
        <div
          v-for="(amount, name) in form.categorySpending"
          :key="name"
          class="category-item"
        >
          <span>{{ name }}: ${{ amount }}</span>
          <button type="button" class="remove-btn" @click="removeCategory(String(name))">
            x
          </button>
        </div>
      </div>
      <div class="category-add">
        <input
          v-model="newCategory.name"
          class="category-input"
          placeholder="Category"
          data-testid="category-name"
        />
        <input
          v-model="newCategory.amount"
          class="category-input"
          type="number"
          placeholder="Amount"
          data-testid="category-amount"
        />
        <Button type="button" size="sm" variant="secondary" @click="addCategory">Add</Button>
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

.calculated-value {
  padding: var(--space-sm) var(--space-md);
  background: var(--color-primary-subtle);
  border-radius: var(--radius-sm);
  font-weight: 600;
  color: var(--color-text);
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.category-item {
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

.category-add {
  display: flex;
  gap: var(--space-sm);
  align-items: center;
}

.category-input {
  flex: 1;
  padding: var(--space-xs) var(--space-sm);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text);
  font-size: var(--text-sm);
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
