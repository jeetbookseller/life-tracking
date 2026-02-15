<script setup lang="ts">
defineProps<{
  label?: string
  options: Array<{ value: string; label: string }>
  placeholder?: string
  error?: string
  disabled?: boolean
}>()

const model = defineModel<string>()
</script>

<template>
  <div class="select-group">
    <label v-if="label" class="select-label">{{ label }}</label>
    <select
      v-model="model"
      class="select-field"
      :class="{ 'select-field--error': error }"
      :disabled="disabled"
    >
      <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
      <option v-for="opt in options" :key="opt.value" :value="opt.value">
        {{ opt.label }}
      </option>
    </select>
    <span v-if="error" class="select-error">{{ error }}</span>
  </div>
</template>

<style scoped>
.select-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.select-label {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
}

.select-field {
  padding: var(--space-sm) var(--space-md);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text);
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: border-color var(--transition-fast);
}

.select-field:focus {
  outline: none;
  border-color: var(--color-primary);
}

.select-field:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.select-field--error {
  border-color: var(--color-danger);
}

.select-error {
  font-size: var(--text-xs);
  color: var(--color-danger);
}
</style>
