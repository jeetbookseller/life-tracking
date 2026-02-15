<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  label: string
  value: number | null | undefined
  unit?: string
  icon?: string
}>()

const displayValue = computed(() => {
  if (props.value == null) return '--'
  if (Number.isInteger(props.value)) return props.value.toString()
  return props.value.toFixed(1)
})

const ICON_MAP: Record<string, string> = {
  productivity: '\u{1F4CB}',
  finance: '\u{1F4B0}',
  health: '\u{2764}\u{FE0F}',
  heart: '\u{2764}\u{FE0F}',
  metabolic: '\u{1F9EC}',
  digital: '\u{1F4F1}',
  mindfulness: '\u{1F9D8}',
  reading: '\u{1F4DA}',
}

const iconChar = computed(() =>
  props.icon ? (ICON_MAP[props.icon] ?? props.icon) : null,
)
</script>

<template>
  <div class="metric-card" data-testid="metric-card">
    <span
      v-if="iconChar"
      class="metric-icon"
      data-testid="metric-icon"
    >{{ iconChar }}</span>
    <div class="metric-body">
      <span class="metric-label">{{ label }}</span>
      <div class="metric-value-row">
        <span class="metric-value">{{ displayValue }}</span>
        <span v-if="unit && value != null" class="metric-unit">{{ unit }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.metric-card {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md) var(--space-lg);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.metric-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.metric-body {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.metric-label {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.metric-value-row {
  display: flex;
  align-items: baseline;
  gap: var(--space-xs);
}

.metric-value {
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--color-text);
}

.metric-unit {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
}
</style>
