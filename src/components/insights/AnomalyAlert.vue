<script setup lang="ts">
import type { Anomaly } from '@/utils/trends'

defineProps<{
  anomalies: Anomaly[]
}>()

function formatDate(isoDate: string): string {
  const date = new Date(isoDate + 'T00:00:00')
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}
</script>

<template>
  <div
    v-if="anomalies.length > 0"
    class="anomaly-alert"
    data-testid="anomaly-alert"
  >
    <h3 class="anomaly-alert__title">Anomalies Detected</h3>
    <ul class="anomaly-alert__list">
      <li
        v-for="(anomaly, index) in anomalies"
        :key="index"
        class="anomaly-alert__item"
        :class="`anomaly-alert__item--${anomaly.direction}`"
      >
        <span class="anomaly-alert__icon">{{ anomaly.direction === 'high' ? '⬆' : '⬇' }}</span>
        <span class="anomaly-alert__text">
          {{ anomaly.metric }} was unusually {{ anomaly.direction }} on {{ formatDate(anomaly.date) }}
          ({{ anomaly.value.toFixed(1) }} vs avg {{ anomaly.mean.toFixed(1) }})
        </span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.anomaly-alert {
  background: var(--color-surface, #1e1e3a);
  border: 1px solid var(--color-border, #2d2d4a);
  border-radius: var(--radius-md, 8px);
  padding: 1.25rem;
}

.anomaly-alert__title {
  margin: 0 0 0.75rem;
  font-size: 1rem;
  color: var(--color-text, #e4e4f0);
}

.anomaly-alert__list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.anomaly-alert__item {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--color-border, #2d2d4a);
  font-size: 0.875rem;
}

.anomaly-alert__item:last-child {
  border-bottom: none;
}

.anomaly-alert__item--high {
  color: #ff9800;
}

.anomaly-alert__item--low {
  color: #2196f3;
}

.anomaly-alert__icon {
  flex-shrink: 0;
}

.anomaly-alert__text {
  color: var(--color-text, #e4e4f0);
}
</style>
