<script setup lang="ts">
defineProps<{
  label?: string
  error?: string
  disabled?: boolean
}>()

const model = defineModel<string>()
</script>

<template>
  <div class="datepicker-group">
    <label v-if="label" class="datepicker-label">{{ label }}</label>
    <input
      v-model="model"
      type="date"
      class="datepicker-field"
      :class="{ 'datepicker-field--error': error }"
      :disabled="disabled"
    />
    <span v-if="error" class="datepicker-error">{{ error }}</span>
  </div>
</template>

<style scoped>
.datepicker-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.datepicker-label {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
}

.datepicker-field {
  padding: var(--space-sm) var(--space-md);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text);
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  transition: border-color var(--transition-fast);
}

.datepicker-field:focus {
  outline: none;
  border-color: var(--color-primary);
}

.datepicker-field:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.datepicker-field--error {
  border-color: var(--color-danger);
}

.datepicker-error {
  font-size: var(--text-xs);
  color: var(--color-danger);
}
</style>
