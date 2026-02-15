<script setup lang="ts">
import type { GoalWithProgress } from '@/stores/insights'

defineProps<{
  goals: GoalWithProgress[]
}>()
</script>

<template>
  <div class="goal-progress" data-testid="goal-progress">
    <h3 class="goal-progress__title">Goal Progress</h3>
    <div v-if="goals.length === 0" class="goal-progress__empty">
      No goals set. Add goals from Settings to track your progress.
    </div>
    <div
      v-for="(goal, index) in goals"
      :key="index"
      class="goal-progress__item"
    >
      <div class="goal-progress__header">
        <span class="goal-progress__label">{{ goal.label }}</span>
        <span class="goal-progress__values">
          {{ goal.current.toFixed(1) }} / {{ goal.target }}
        </span>
      </div>
      <div class="goal-progress__bar-bg">
        <div
          class="goal-progress__bar-fill"
          :style="{ width: Math.min(100, goal.percentage) + '%' }"
          :class="{ 'goal-progress__bar-fill--complete': goal.percentage >= 100 }"
        />
      </div>
      <span class="goal-progress__percent">{{ goal.percentage.toFixed(0) }}%</span>
    </div>
  </div>
</template>

<style scoped>
.goal-progress {
  background: var(--color-surface, #1e1e3a);
  border: 1px solid var(--color-border, #2d2d4a);
  border-radius: var(--radius-md, 8px);
  padding: 1.25rem;
}

.goal-progress__title {
  margin: 0 0 1rem;
  font-size: 1rem;
  color: var(--color-text, #e4e4f0);
}

.goal-progress__empty {
  color: var(--color-text-secondary, #9a9ab0);
  font-size: 0.875rem;
}

.goal-progress__item {
  margin-bottom: 1rem;
}

.goal-progress__item:last-child {
  margin-bottom: 0;
}

.goal-progress__header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.375rem;
  font-size: 0.875rem;
}

.goal-progress__label {
  color: var(--color-text, #e4e4f0);
}

.goal-progress__values {
  color: var(--color-text-secondary, #9a9ab0);
}

.goal-progress__bar-bg {
  height: 8px;
  background: var(--color-border, #2d2d4a);
  border-radius: 4px;
  overflow: hidden;
}

.goal-progress__bar-fill {
  height: 100%;
  background: #6c63ff;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.goal-progress__bar-fill--complete {
  background: #4caf50;
}

.goal-progress__percent {
  font-size: 0.75rem;
  color: var(--color-text-secondary, #9a9ab0);
}
</style>
