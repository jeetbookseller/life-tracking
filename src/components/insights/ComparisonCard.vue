<script setup lang="ts">
defineProps<{
  title: string
  thisWeek: Record<string, number>
  lastWeek: Record<string, number>
}>()

function formatValue(value: number): string {
  return Number.isInteger(value) ? value.toString() : value.toFixed(1)
}

function deltaPercent(current: number, previous: number): number {
  if (previous === 0) return current === 0 ? 0 : 100
  return ((current - previous) / Math.abs(previous)) * 100
}
</script>

<template>
  <div class="comparison-card" data-testid="comparison-card">
    <h3 class="comparison-card__title">{{ title }}</h3>
    <table class="comparison-card__table">
      <thead>
        <tr>
          <th>Metric</th>
          <th>This Week</th>
          <th>Last Week</th>
          <th>Change</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="key in Object.keys(thisWeek)" :key="key">
          <td class="comparison-card__metric">{{ key }}</td>
          <td>{{ formatValue(thisWeek[key] ?? 0) }}</td>
          <td>{{ formatValue(lastWeek[key] ?? 0) }}</td>
          <td>
            <span
              :class="{
                'delta--positive': deltaPercent(thisWeek[key] ?? 0, lastWeek[key] ?? 0) > 0,
                'delta--negative': deltaPercent(thisWeek[key] ?? 0, lastWeek[key] ?? 0) < 0,
                'delta--neutral': deltaPercent(thisWeek[key] ?? 0, lastWeek[key] ?? 0) === 0,
              }"
            >
              {{ deltaPercent(thisWeek[key] ?? 0, lastWeek[key] ?? 0) > 0 ? '+' : '' }}{{ deltaPercent(thisWeek[key] ?? 0, lastWeek[key] ?? 0).toFixed(1) }}%
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.comparison-card {
  background: var(--color-surface, #1e1e3a);
  border: 1px solid var(--color-border, #2d2d4a);
  border-radius: var(--radius-md, 8px);
  padding: 1.25rem;
}

.comparison-card__title {
  margin: 0 0 1rem;
  font-size: 1rem;
  color: var(--color-text, #e4e4f0);
}

.comparison-card__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.comparison-card__table th,
.comparison-card__table td {
  padding: 0.5rem 0.75rem;
  text-align: left;
  border-bottom: 1px solid var(--color-border, #2d2d4a);
}

.comparison-card__table th {
  color: var(--color-text-secondary, #9a9ab0);
  font-weight: 500;
}

.comparison-card__metric {
  text-transform: capitalize;
}

.delta--positive {
  color: #4caf50;
}

.delta--negative {
  color: #f44336;
}

.delta--neutral {
  color: var(--color-text-secondary, #9a9ab0);
}
</style>
