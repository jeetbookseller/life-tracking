<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useInsightsStore } from '@/stores/insights'
import { useAuthStore } from '@/stores/auth'
import ComparisonCard from '@/components/insights/ComparisonCard.vue'
import AnomalyAlert from '@/components/insights/AnomalyAlert.vue'
import GoalProgress from '@/components/insights/GoalProgress.vue'
import type { DataDomain } from '@/types/data-models'

const insightsStore = useInsightsStore()
const authStore = useAuthStore()

const domainLabels: Record<DataDomain, string> = {
  productivity: 'Productivity',
  finance: 'Finance',
  health: 'Health',
  metabolic: 'Metabolic',
  digital: 'Digital Wellbeing',
  mindfulness: 'Mindfulness',
  reading: 'Reading',
}

const comparisons = computed(() => {
  const domains: DataDomain[] = [
    'productivity',
    'health',
    'mindfulness',
    'reading',
    'digital',
  ]
  const result: Array<{
    domain: DataDomain
    label: string
    thisWeek: Record<string, number>
    lastWeek: Record<string, number>
  }> = []

  for (const domain of domains) {
    const comparison = insightsStore.getWeekComparison(domain)
    if (comparison) {
      result.push({
        domain,
        label: domainLabels[domain],
        ...comparison,
      })
    }
  }

  return result
})

const longestStreaks = computed(() => {
  const metrics = ['Meditation', 'Reading', 'Focus Rating']
  return metrics
    .map((m) => insightsStore.getLongestStreak(m))
    .filter((s) => s !== null)
})

const currentStreaks = computed(() => {
  const metrics = ['Meditation', 'Reading', 'Focus Rating']
  return metrics
    .map((m) => insightsStore.getCurrentStreak(m))
    .filter((s) => s !== null)
})

onMounted(async () => {
  insightsStore.loadGoals()
  if (authStore.isUnlocked) {
    await insightsStore.refreshSummaries()
  }
})
</script>

<template>
  <div class="view-container">
    <h1>Insights</h1>
    <p class="view-description">
      Discover trends, correlations, and anomalies in your data.
    </p>

    <div v-if="insightsStore.loading" class="insights-loading">
      Loading insights...
    </div>

    <div v-else-if="insightsStore.error" class="insights-error">
      {{ insightsStore.error }}
    </div>

    <div v-else class="insights-grid">
      <!-- Anomalies -->
      <AnomalyAlert :anomalies="insightsStore.anomalies" />

      <!-- Week-over-week comparisons -->
      <ComparisonCard
        v-for="comp in comparisons"
        :key="comp.domain"
        :title="`${comp.label}: This Week vs Last Week`"
        :this-week="comp.thisWeek"
        :last-week="comp.lastWeek"
      />

      <!-- Goal progress -->
      <GoalProgress :goals="insightsStore.goalsWithProgress" />

      <!-- Significant changes -->
      <div
        v-if="insightsStore.significantChanges.length > 0"
        class="insights-card"
        data-testid="significant-changes"
      >
        <h3>Significant Changes</h3>
        <ul>
          <li
            v-for="(change, i) in insightsStore.significantChanges"
            :key="i"
          >
            {{ change.metric }}:
            <span :class="change.direction === 'up' ? 'delta--positive' : 'delta--negative'">
              {{ change.direction === 'up' ? '+' : '' }}{{ change.deltaPercent.toFixed(1) }}%
            </span>
            week-over-week
          </li>
        </ul>
      </div>

      <!-- Correlations -->
      <div
        v-if="insightsStore.correlations.length > 0"
        class="insights-card"
        data-testid="correlations"
      >
        <h3>Correlation Hints</h3>
        <ul>
          <li v-for="(corr, i) in insightsStore.correlations" :key="i">
            {{ corr.description }} (r={{ corr.correlation.toFixed(2) }})
          </li>
        </ul>
      </div>

      <!-- Personal bests -->
      <div
        v-if="insightsStore.personalBests.length > 0"
        class="insights-card"
        data-testid="personal-bests"
      >
        <h3>Personal Bests</h3>
        <ul>
          <li v-for="(best, i) in insightsStore.personalBests" :key="i">
            {{ best.metric }}: {{ best.value.toFixed(1) }} on {{ best.date }}
          </li>
        </ul>
      </div>

      <!-- Streaks -->
      <div
        v-if="longestStreaks.length > 0 || currentStreaks.length > 0"
        class="insights-card"
        data-testid="streaks-section"
      >
        <h3>Streaks</h3>
        <div v-if="currentStreaks.length > 0">
          <h4>Active Streaks</h4>
          <ul>
            <li v-for="(s, i) in currentStreaks" :key="'current-' + i">
              {{ s.metric }}: {{ s.count }} days (since {{ s.startDate }})
            </li>
          </ul>
        </div>
        <div v-if="longestStreaks.length > 0">
          <h4>Longest Streaks</h4>
          <ul>
            <li v-for="(s, i) in longestStreaks" :key="'longest-' + i">
              {{ s.metric }}: {{ s.count }} days ({{ s.startDate }} - {{ s.endDate }})
            </li>
          </ul>
        </div>
      </div>

      <!-- Empty state -->
      <div
        v-if="comparisons.length === 0 && insightsStore.anomalies.length === 0 && insightsStore.personalBests.length === 0"
        class="placeholder-message"
      >
        <p>No insights available yet. Add some data entries to see trends and patterns.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.insights-grid {
  display: grid;
  gap: 1.25rem;
  grid-template-columns: 1fr;
}

@media (min-width: 768px) {
  .insights-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.insights-loading,
.insights-error {
  text-align: center;
  padding: 2rem;
  color: var(--color-text-secondary, #9a9ab0);
}

.insights-error {
  color: #f44336;
}

.insights-card {
  background: var(--color-surface, #1e1e3a);
  border: 1px solid var(--color-border, #2d2d4a);
  border-radius: var(--radius-md, 8px);
  padding: 1.25rem;
}

.insights-card h3 {
  margin: 0 0 0.75rem;
  font-size: 1rem;
  color: var(--color-text, #e4e4f0);
}

.insights-card h4 {
  margin: 0.75rem 0 0.375rem;
  font-size: 0.875rem;
  color: var(--color-text-secondary, #9a9ab0);
}

.insights-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.insights-card li {
  padding: 0.375rem 0;
  font-size: 0.875rem;
  border-bottom: 1px solid var(--color-border, #2d2d4a);
}

.insights-card li:last-child {
  border-bottom: none;
}

.delta--positive {
  color: #4caf50;
}

.delta--negative {
  color: #f44336;
}

.placeholder-message {
  margin-top: 2rem;
  padding: 2rem;
  background: var(--color-surface);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-md);
  text-align: center;
  color: var(--color-text-secondary);
  grid-column: 1 / -1;
}
</style>
