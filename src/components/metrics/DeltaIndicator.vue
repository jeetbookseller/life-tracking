<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    value: number
    inverted?: boolean
  }>(),
  { inverted: false },
)

const direction = computed(() => {
  if (props.value > 0) return 'positive'
  if (props.value < 0) return 'negative'
  return 'neutral'
})

const displayClass = computed(() => {
  if (direction.value === 'neutral') return 'delta--neutral'
  const isGood = props.inverted
    ? direction.value === 'negative'
    : direction.value === 'positive'
  return isGood ? 'delta--positive' : 'delta--negative'
})

const arrow = computed(() => {
  if (props.value > 0) return '\u2191'
  if (props.value < 0) return '\u2193'
  return '\u2192'
})

const absValue = computed(() => Math.abs(props.value))
</script>

<template>
  <span class="delta" :class="displayClass" data-testid="delta-indicator">
    <span class="delta-arrow">{{ arrow }}</span>
    <span class="delta-value">{{ absValue }}%</span>
  </span>
</template>

<style scoped>
.delta {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: var(--text-xs);
  font-weight: 600;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
}

.delta--positive {
  color: var(--color-success);
  background: rgba(76, 175, 80, 0.12);
}

.delta--negative {
  color: var(--color-danger);
  background: rgba(244, 67, 54, 0.12);
}

.delta--neutral {
  color: var(--color-text-secondary);
  background: rgba(154, 154, 176, 0.12);
}

.delta-arrow {
  font-size: 0.7rem;
}
</style>
