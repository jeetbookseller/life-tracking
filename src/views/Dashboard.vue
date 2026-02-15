<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import Card from '@/components/ui/Card.vue'
import MetricCard from '@/components/metrics/MetricCard.vue'
import DeltaIndicator from '@/components/metrics/DeltaIndicator.vue'
import StreakCounter from '@/components/metrics/StreakCounter.vue'
import LineChart from '@/components/charts/LineChart.vue'
import BarChart from '@/components/charts/BarChart.vue'
import PieChart from '@/components/charts/PieChart.vue'
import TimeRangeSelector from '@/components/charts/TimeRangeSelector.vue'
import {
  type TimeRange,
  getDateRangeFromPreset,
  formatDateLabel,
} from '@/utils/chartConfig'
import { useDataStore } from '@/stores/data'
import type {
  ProductivityLog,
  FinanceLog,
  HealthLog,
  MetabolicLog,
  DigitalLog,
  MindfulnessLog,
  ReadingLog,
} from '@/types/data-models'

const dataStore = useDataStore()
const timeRange = ref<TimeRange>('7d')

// Domain data
const productivityData = ref<ProductivityLog[]>([])
const financeData = ref<FinanceLog[]>([])
const healthData = ref<HealthLog[]>([])
const metabolicData = ref<MetabolicLog[]>([])
const digitalData = ref<DigitalLog[]>([])
const mindfulnessData = ref<MindfulnessLog[]>([])
const readingData = ref<ReadingLog[]>([])

async function loadData() {
  const { startDate, endDate } = getDateRangeFromPreset(timeRange.value)
  try {
    const results = await Promise.allSettled([
      dataStore.getEntriesByDateRange<ProductivityLog>('productivity', startDate, endDate),
      dataStore.getEntriesByDateRange<FinanceLog>('finance', startDate, endDate),
      dataStore.getEntriesByDateRange<HealthLog>('health', startDate, endDate),
      dataStore.getEntriesByDateRange<MetabolicLog>('metabolic', startDate, endDate),
      dataStore.getEntriesByDateRange<DigitalLog>('digital', startDate, endDate),
      dataStore.getEntriesByDateRange<MindfulnessLog>('mindfulness', startDate, endDate),
      dataStore.getEntriesByDateRange<ReadingLog>('reading', startDate, endDate),
    ])
    productivityData.value = results[0].status === 'fulfilled' ? results[0].value : []
    financeData.value = results[1].status === 'fulfilled' ? results[1].value : []
    healthData.value = results[2].status === 'fulfilled' ? results[2].value : []
    metabolicData.value = results[3].status === 'fulfilled' ? results[3].value : []
    digitalData.value = results[4].status === 'fulfilled' ? results[4].value : []
    mindfulnessData.value = results[5].status === 'fulfilled' ? results[5].value : []
    readingData.value = results[6].status === 'fulfilled' ? results[6].value : []
  } catch {
    // Data loading may fail if not authenticated; metrics show "--"
  }
}

onMounted(loadData)
watch(timeRange, loadData)

// Latest values for metric cards
function latest<T extends { date: string }>(arr: T[]): T | undefined {
  if (!arr.length) return undefined
  return arr.reduce((a, b) => (a.date >= b.date ? a : b))
}

const latestProductivity = computed(() => latest(productivityData.value))
const latestFinance = computed(() => latest(financeData.value))
const latestHealth = computed(() => latest(healthData.value))
const latestMetabolic = computed(() => latest(metabolicData.value))
const latestDigital = computed(() => latest(digitalData.value))
const latestMindfulness = computed(() => latest(mindfulnessData.value))
const latestReading = computed(() => latest(readingData.value))

// Average helper
function avg(nums: number[]): number | null {
  if (!nums.length) return null
  return nums.reduce((a, b) => a + b, 0) / nums.length
}

// Delta calculation: compare latest value to average of all but latest
function calcDelta(current: number | null | undefined, values: number[]): number {
  if (current == null || values.length < 2) return 0
  const prevAvg = avg(values.slice(0, -1))
  if (!prevAvg) return 0
  return Math.round(((current - prevAvg) / prevAvg) * 100)
}

// Streak calculation for mindfulness
const mindfulnessStreak = computed(() => {
  if (!mindfulnessData.value.length) return 0
  const sorted = [...mindfulnessData.value].sort((a, b) => b.date.localeCompare(a.date))
  let streak = 0
  const today = new Date()
  for (let i = 0; i < sorted.length; i++) {
    const expected = new Date(today)
    expected.setDate(expected.getDate() - i)
    const expectedStr = expected.toISOString().split('T')[0]!
    if (sorted[i]!.date === expectedStr) {
      streak++
    } else {
      break
    }
  }
  return streak
})

// Chart data computations
const sortByDate = <T extends { date: string }>(arr: T[]) =>
  [...arr].sort((a, b) => a.date.localeCompare(b.date))

const productivityChartLabels = computed(() =>
  sortByDate(productivityData.value).map((e) => formatDateLabel(e.date)),
)
const productivityChartDatasets = computed(() => [
  {
    label: 'Focus Rating',
    data: sortByDate(productivityData.value).map((e) => e.focusRating),
  },
])

const taskChartLabels = computed(() =>
  sortByDate(productivityData.value).map((e) => formatDateLabel(e.date)),
)
const taskChartDatasets = computed(() => [
  {
    label: 'Completed',
    data: sortByDate(productivityData.value).map((e) => e.tasksCompleted),
  },
  {
    label: 'Planned',
    data: sortByDate(productivityData.value).map((e) => e.tasksPlanned),
    color: '#ff9800',
  },
])

const healthChartLabels = computed(() =>
  sortByDate(healthData.value).map((e) => formatDateLabel(e.date)),
)
const healthChartDatasets = computed(() => [
  {
    label: 'Resting HR',
    data: sortByDate(healthData.value).map((e) => e.restingHR),
  },
  {
    label: 'HRV',
    data: sortByDate(healthData.value).map((e) => e.hrv),
    color: '#4caf50',
  },
])

const sleepChartLabels = computed(() =>
  sortByDate(healthData.value).map((e) => formatDateLabel(e.date)),
)
const sleepChartDatasets = computed(() => [
  {
    label: 'Sleep (hrs)',
    data: sortByDate(healthData.value).map((e) => e.sleepDuration),
  },
])

const screenTimeChartLabels = computed(() =>
  sortByDate(digitalData.value).map((e) => formatDateLabel(e.date)),
)
const screenTimeChartDatasets = computed(() => [
  {
    label: 'Screen Time (min)',
    data: sortByDate(digitalData.value).map((e) => e.totalScreenTime),
    color: '#f44336',
  },
])

const spendingPieLabels = computed(() => {
  const lat = latestFinance.value
  if (!lat?.categorySpending) return []
  return Object.keys(lat.categorySpending)
})
const spendingPieData = computed(() => {
  const lat = latestFinance.value
  if (!lat?.categorySpending) return []
  return Object.values(lat.categorySpending)
})

const meditationChartLabels = computed(() =>
  sortByDate(mindfulnessData.value).map((e) => formatDateLabel(e.date)),
)
const meditationChartDatasets = computed(() => [
  {
    label: 'Duration (min)',
    data: sortByDate(mindfulnessData.value).map((e) => e.duration),
    color: '#9c27b0',
  },
])

const readingChartLabels = computed(() =>
  sortByDate(readingData.value).map((e) => formatDateLabel(e.date)),
)
const readingChartDatasets = computed(() => [
  {
    label: 'Pages Read',
    data: sortByDate(readingData.value).map((e) => e.pagesRead),
    color: '#2196f3',
  },
])

// Metric card definitions
const metricCards = computed(() => [
  {
    label: 'Focus Rating',
    value: latestProductivity.value?.focusRating ?? null,
    unit: '/ 5',
    icon: 'productivity',
    delta: calcDelta(
      latestProductivity.value?.focusRating,
      productivityData.value.map((e) => e.focusRating),
    ),
  },
  {
    label: 'Net Worth',
    value: latestFinance.value?.netWorth ?? null,
    unit: '$',
    icon: 'finance',
    delta: calcDelta(
      latestFinance.value?.netWorth,
      financeData.value.map((e) => e.netWorth),
    ),
  },
  {
    label: 'Resting HR',
    value: latestHealth.value?.restingHR ?? null,
    unit: 'bpm',
    icon: 'health',
    delta: calcDelta(
      latestHealth.value?.restingHR,
      healthData.value.map((e) => e.restingHR),
    ),
    invertedDelta: true,
  },
  {
    label: 'Food Score',
    value: latestMetabolic.value?.dailyFoodScore ?? null,
    icon: 'metabolic',
    delta: calcDelta(
      latestMetabolic.value?.dailyFoodScore,
      metabolicData.value.map((e) => e.dailyFoodScore),
    ),
  },
  {
    label: 'Screen Time',
    value: latestDigital.value?.totalScreenTime ?? null,
    unit: 'min',
    icon: 'digital',
    delta: calcDelta(
      latestDigital.value?.totalScreenTime,
      digitalData.value.map((e) => e.totalScreenTime),
    ),
    invertedDelta: true,
  },
  {
    label: 'Meditation',
    value: latestMindfulness.value?.duration ?? null,
    unit: 'min',
    icon: 'mindfulness',
    delta: calcDelta(
      latestMindfulness.value?.duration,
      mindfulnessData.value.map((e) => e.duration),
    ),
  },
  {
    label: 'Pages Read',
    value: latestReading.value?.pagesRead ?? null,
    icon: 'reading',
    delta: calcDelta(
      latestReading.value?.pagesRead,
      readingData.value.map((e) => e.pagesRead),
    ),
  },
])
</script>

<template>
  <div class="view-container">
    <div class="dashboard-header">
      <div>
        <h1>Dashboard</h1>
        <p class="view-description">Your daily metrics at a glance.</p>
      </div>
      <TimeRangeSelector v-model="timeRange" />
    </div>

    <!-- Metric Cards -->
    <div class="metrics-grid" data-testid="metrics-section">
      <div v-for="metric in metricCards" :key="metric.label" class="metric-wrapper">
        <MetricCard
          :label="metric.label"
          :value="metric.value"
          :unit="metric.unit"
          :icon="metric.icon"
        />
        <DeltaIndicator
          v-if="metric.delta !== 0"
          :value="metric.delta"
          :inverted="metric.invertedDelta ?? false"
          class="metric-delta"
        />
      </div>
    </div>

    <!-- Streaks -->
    <div v-if="mindfulnessStreak > 0" class="streaks-section">
      <StreakCounter :count="mindfulnessStreak" label="Meditation streak" />
    </div>

    <!-- Charts -->
    <div class="charts-grid" data-testid="charts-section">
      <Card v-if="productivityData.length" title="Focus Rating">
        <LineChart :labels="productivityChartLabels" :datasets="productivityChartDatasets" />
      </Card>

      <Card v-if="productivityData.length" title="Task Completion">
        <BarChart :labels="taskChartLabels" :datasets="taskChartDatasets" />
      </Card>

      <Card v-if="healthData.length" title="Heart Rate & HRV">
        <LineChart :labels="healthChartLabels" :datasets="healthChartDatasets" />
      </Card>

      <Card v-if="healthData.length" title="Sleep Duration">
        <BarChart :labels="sleepChartLabels" :datasets="sleepChartDatasets" />
      </Card>

      <Card v-if="digitalData.length" title="Screen Time">
        <BarChart :labels="screenTimeChartLabels" :datasets="screenTimeChartDatasets" />
      </Card>

      <Card v-if="spendingPieLabels.length" title="Spending Breakdown">
        <PieChart :labels="spendingPieLabels" :data="spendingPieData" />
      </Card>

      <Card v-if="mindfulnessData.length" title="Meditation Duration">
        <LineChart :labels="meditationChartLabels" :datasets="meditationChartDatasets" />
      </Card>

      <Card v-if="readingData.length" title="Reading Progress">
        <BarChart :labels="readingChartLabels" :datasets="readingChartDatasets" />
      </Card>

      <!-- Empty state -->
      <Card v-if="!productivityData.length && !healthData.length && !financeData.length && !digitalData.length && !mindfulnessData.length && !readingData.length && !metabolicData.length" title="No Data Yet">
        <p class="empty-state">
          Start logging entries to see your charts and trends here.
        </p>
      </Card>
    </div>
  </div>
</template>

<style scoped>
.dashboard-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-md);
}

.metrics-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-md);
  margin-top: var(--space-lg);
}

@media (min-width: 640px) {
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .metrics-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.metric-wrapper {
  position: relative;
}

.metric-delta {
  position: absolute;
  top: var(--space-sm);
  right: var(--space-sm);
}

.streaks-section {
  margin-top: var(--space-lg);
}

.charts-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-lg);
  margin-top: var(--space-xl);
}

@media (min-width: 768px) {
  .charts-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.empty-state {
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  text-align: center;
  padding: var(--space-xl);
}
</style>
