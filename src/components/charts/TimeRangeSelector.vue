<script setup lang="ts">
import type { TimeRange } from '@/utils/chartConfig'

withDefaults(
  defineProps<{
    modelValue: TimeRange
  }>(),
  { modelValue: '7d' },
)

const emit = defineEmits<{
  'update:modelValue': [value: TimeRange]
}>()

const presets: { value: TimeRange; label: string }[] = [
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
  { value: 'all', label: 'All time' },
]
</script>

<template>
  <div class="time-range-selector" data-testid="time-range-selector">
    <button
      v-for="preset in presets"
      :key="preset.value"
      class="range-btn"
      :class="{ 'range-btn--active': modelValue === preset.value }"
      @click="emit('update:modelValue', preset.value)"
    >
      {{ preset.label }}
    </button>
  </div>
</template>

<style scoped>
.time-range-selector {
  display: flex;
  gap: var(--space-xs);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-xs);
}

.range-btn {
  padding: var(--space-xs) var(--space-md);
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-family: inherit;
}

.range-btn:hover {
  color: var(--color-text);
  background: var(--color-hover);
}

.range-btn--active {
  background: var(--color-primary);
  color: white;
}

.range-btn--active:hover {
  background: var(--color-primary-hover);
  color: white;
}
</style>
