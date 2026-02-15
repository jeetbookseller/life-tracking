<script setup lang="ts">
import { ref } from 'vue'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import { useInsightsStore, type Goal } from '@/stores/insights'
import type { DataDomain } from '@/types/data-models'

const insightsStore = useInsightsStore()
insightsStore.loadGoals()

const showAddForm = ref(false)
const newDomain = ref<DataDomain>('productivity')
const newMetric = ref('')
const newTarget = ref<number>(0)
const newLabel = ref('')
const formError = ref('')

const domainOptions: { value: DataDomain; label: string }[] = [
  { value: 'productivity', label: 'Productivity' },
  { value: 'finance', label: 'Finance' },
  { value: 'health', label: 'Health' },
  { value: 'metabolic', label: 'Metabolic' },
  { value: 'digital', label: 'Digital' },
  { value: 'mindfulness', label: 'Mindfulness' },
  { value: 'reading', label: 'Reading' },
]

const metricsByDomain: Record<DataDomain, string[]> = {
  productivity: ['focusRating', 'deepWorkHours', 'tasksCompleted'],
  finance: ['netWorth', 'totalAssets', 'totalLiabilities'],
  health: ['restingHR', 'hrv', 'sleepDuration', 'activeMinutes', 'steps'],
  metabolic: ['gutScore', 'dailyFoodScore', 'fiberIntake'],
  digital: ['totalScreenTime', 'unlocks'],
  mindfulness: ['duration', 'qualityRating', 'streakCount'],
  reading: ['pagesRead', 'highlightsCount'],
}

function addGoal() {
  formError.value = ''

  if (!newMetric.value) {
    formError.value = 'Please select a metric'
    return
  }
  if (newTarget.value <= 0) {
    formError.value = 'Target must be greater than 0'
    return
  }
  if (!newLabel.value.trim()) {
    formError.value = 'Please enter a label'
    return
  }

  const goal: Goal = {
    domain: newDomain.value,
    metric: newMetric.value,
    target: newTarget.value,
    label: newLabel.value.trim(),
  }

  insightsStore.addGoal(goal)

  // Reset form
  newMetric.value = ''
  newTarget.value = 0
  newLabel.value = ''
  showAddForm.value = false
}

function removeGoal(index: number) {
  insightsStore.removeGoal(index)
}
</script>

<template>
  <Card title="Goals">
    <div class="goals-content">
      <div v-if="insightsStore.goals.length === 0" class="goals-empty">
        <p>No goals configured yet. Add a goal to track your progress in the Insights tab.</p>
      </div>

      <div v-else class="goals-list">
        <div
          v-for="(goal, index) in insightsStore.goals"
          :key="index"
          class="goal-item"
        >
          <div class="goal-info">
            <span class="goal-label">{{ goal.label }}</span>
            <span class="goal-detail">
              {{ goal.domain }} / {{ goal.metric }} — target: {{ goal.target }}
            </span>
          </div>
          <button
            class="goal-delete"
            aria-label="Delete goal"
            @click="removeGoal(index)"
          >
            &times;
          </button>
        </div>
      </div>

      <div v-if="!showAddForm" class="goals-actions">
        <Button size="sm" variant="secondary" @click="showAddForm = true">
          + Add Goal
        </Button>
      </div>

      <form v-else class="goal-form" @submit.prevent="addGoal">
        <div class="form-row">
          <label class="form-label">Domain</label>
          <select v-model="newDomain" class="form-select">
            <option
              v-for="opt in domainOptions"
              :key="opt.value"
              :value="opt.value"
            >
              {{ opt.label }}
            </option>
          </select>
        </div>
        <div class="form-row">
          <label class="form-label">Metric</label>
          <select v-model="newMetric" class="form-select">
            <option value="" disabled>Select metric</option>
            <option
              v-for="m in metricsByDomain[newDomain]"
              :key="m"
              :value="m"
            >
              {{ m }}
            </option>
          </select>
        </div>
        <div class="form-row">
          <label class="form-label">Target</label>
          <input
            v-model.number="newTarget"
            type="number"
            class="form-input"
            min="0"
            step="any"
          />
        </div>
        <div class="form-row">
          <label class="form-label">Label</label>
          <input
            v-model="newLabel"
            type="text"
            class="form-input"
            placeholder="e.g. Daily deep work target"
          />
        </div>
        <p v-if="formError" class="form-error">{{ formError }}</p>
        <div class="form-actions">
          <Button size="sm" type="submit">Save Goal</Button>
          <Button size="sm" variant="secondary" @click="showAddForm = false">Cancel</Button>
        </div>
      </form>
    </div>
  </Card>
</template>

<style scoped>
.goals-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.goals-empty p {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  text-align: center;
  margin: 0;
}

.goals-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.goal-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-sm) var(--space-md);
  background: var(--color-surface-elevated);
  border-radius: var(--radius-sm);
}

.goal-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.goal-label {
  font-size: var(--text-sm);
  font-weight: 500;
}

.goal-detail {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
}

.goal-delete {
  background: none;
  border: none;
  color: var(--color-danger);
  font-size: 1.25rem;
  cursor: pointer;
  padding: var(--space-xs);
  line-height: 1;
}

.goal-delete:hover {
  opacity: 0.8;
}

.goals-actions {
  display: flex;
  justify-content: flex-start;
}

.goal-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  padding: var(--space-md);
  background: var(--color-surface-elevated);
  border-radius: var(--radius-sm);
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.form-label {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  font-weight: 500;
}

.form-select,
.form-input {
  padding: var(--space-xs) var(--space-sm);
  background: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
}

.form-error {
  font-size: var(--text-xs);
  color: var(--color-danger);
  margin: 0;
}

.form-actions {
  display: flex;
  gap: var(--space-sm);
  margin-top: var(--space-xs);
}
</style>
