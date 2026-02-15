import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useDataStore } from './data'
import type {
  DataDomain,
  BaseEntry,
  ProductivityLog,
  HealthLog,
  MindfulnessLog,
  ReadingLog,
} from '@/types/data-models'
import {
  computeDailySummaries,
  computeWeeklySummaries,
  computeMonthlySummaries,
  type DomainSummary,
  type WeeklySummary,
  type MonthlySummary,
} from '@/utils/aggregation'
import {
  detectAnomalies,
  detectStreaks,
  detectSignificantChanges,
  detectCorrelations,
  findLongestStreak,
  findCurrentStreak,
  findPersonalBests,
  type Anomaly,
  type Streak,
  type SignificantChange,
  type CorrelationHint,
  type PersonalBest,
} from '@/utils/trends'

export interface Goal {
  domain: DataDomain
  metric: string
  target: number
  label: string
}

export interface GoalWithProgress extends Goal {
  current: number
  percentage: number
}

const GOALS_STORAGE_KEY = 'life-tracker-goals'

export const useInsightsStore = defineStore('insights', () => {
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Cached summaries
  const dailySummaries = ref<Record<DataDomain, DomainSummary[]>>({
    productivity: [],
    finance: [],
    health: [],
    metabolic: [],
    digital: [],
    mindfulness: [],
    reading: [],
  })

  const weeklySummaries = ref<Record<DataDomain, WeeklySummary[]>>({
    productivity: [],
    finance: [],
    health: [],
    metabolic: [],
    digital: [],
    mindfulness: [],
    reading: [],
  })

  const monthlySummaries = ref<Record<DataDomain, MonthlySummary[]>>({
    productivity: [],
    finance: [],
    health: [],
    metabolic: [],
    digital: [],
    mindfulness: [],
    reading: [],
  })

  const anomalies = ref<Anomaly[]>([])
  const significantChanges = ref<SignificantChange[]>([])
  const correlations = ref<CorrelationHint[]>([])
  const personalBests = ref<PersonalBest[]>([])
  const streaks = ref<Streak[]>([])

  // Goals
  const goals = ref<Goal[]>([])

  function loadGoals() {
    try {
      const stored = localStorage.getItem(GOALS_STORAGE_KEY)
      if (stored) {
        goals.value = JSON.parse(stored)
      }
    } catch {
      goals.value = []
    }
  }

  function saveGoals() {
    localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals.value))
  }

  function addGoal(goal: Goal) {
    goals.value.push(goal)
    saveGoals()
  }

  function removeGoal(index: number) {
    goals.value.splice(index, 1)
    saveGoals()
  }

  const goalsWithProgress = computed<GoalWithProgress[]>(() => {
    return goals.value.map((goal) => {
      const domainDaily = dailySummaries.value[goal.domain]
      const latest = domainDaily[domainDaily.length - 1]
      const current = latest?.metrics[goal.metric] ?? 0
      const percentage =
        goal.target === 0 ? 0 : Math.min(100, (current / goal.target) * 100)
      return { ...goal, current, percentage }
    })
  })

  // --- Core refresh logic ---

  async function refreshSummaries() {
    const dataStore = useDataStore()
    loading.value = true
    error.value = null

    try {
      const domains: DataDomain[] = [
        'productivity',
        'finance',
        'health',
        'metabolic',
        'digital',
        'mindfulness',
        'reading',
      ]

      const allEntries: Record<DataDomain, BaseEntry[]> = {
        productivity: [],
        finance: [],
        health: [],
        metabolic: [],
        digital: [],
        mindfulness: [],
        reading: [],
      }

      for (const domain of domains) {
        allEntries[domain] = await dataStore.getAllEntries(domain)
      }

      // Compute summaries
      for (const domain of domains) {
        dailySummaries.value[domain] = computeDailySummaries(
          domain,
          allEntries[domain],
        )
        weeklySummaries.value[domain] = computeWeeklySummaries(
          domain,
          allEntries[domain],
        )
        monthlySummaries.value[domain] = computeMonthlySummaries(
          domain,
          allEntries[domain],
        )
      }

      // Detect anomalies across key metrics
      const allAnomalies: Anomaly[] = []
      const allSignificant: SignificantChange[] = []
      const allBests: PersonalBest[] = []
      const allStreaks: Streak[] = []

      // Productivity anomalies/trends
      const prodEntries = allEntries.productivity as ProductivityLog[]
      if (prodEntries.length > 0) {
        const dates = prodEntries.map((e) => e.date)
        const focusValues = prodEntries.map((e) => e.focusRating)
        const deepWorkValues = prodEntries.map((e) => e.deepWorkHours)

        allAnomalies.push(...detectAnomalies(dates, focusValues, 'Focus Rating'))
        allAnomalies.push(...detectAnomalies(dates, deepWorkValues, 'Deep Work Hours'))
        allSignificant.push(...detectSignificantChanges(dates, focusValues, 'Focus Rating'))
        allStreaks.push(...detectStreaks(dates, focusValues, 'Focus Rating', 3))

        const bestFocus = findPersonalBests(dates, deepWorkValues, 'Deep Work Hours', 'max')
        if (bestFocus) allBests.push(bestFocus)
      }

      // Health anomalies/trends
      const healthEntries = allEntries.health as HealthLog[]
      if (healthEntries.length > 0) {
        const dates = healthEntries.map((e) => e.date)
        const sleepValues = healthEntries.map((e) => e.sleepDuration)
        const hrValues = healthEntries.map((e) => e.restingHR)

        allAnomalies.push(...detectAnomalies(dates, sleepValues, 'Sleep Duration'))
        allAnomalies.push(...detectAnomalies(dates, hrValues, 'Resting HR'))
        allSignificant.push(...detectSignificantChanges(dates, sleepValues, 'Sleep Duration'))
        allStreaks.push(...detectStreaks(dates, sleepValues, 'Sleep Duration', 7))

        const bestSleep = findPersonalBests(dates, sleepValues, 'Sleep Duration', 'max')
        if (bestSleep) allBests.push(bestSleep)
      }

      // Mindfulness streaks
      const mindEntries = allEntries.mindfulness as MindfulnessLog[]
      if (mindEntries.length > 0) {
        const dates = mindEntries.map((e) => e.date)
        const durations = mindEntries.map((e) => e.duration)
        allStreaks.push(...detectStreaks(dates, durations, 'Meditation', 1))

        const bestDuration = findPersonalBests(dates, durations, 'Meditation Duration', 'max')
        if (bestDuration) allBests.push(bestDuration)
      }

      // Reading streaks
      const readEntries = allEntries.reading as ReadingLog[]
      if (readEntries.length > 0) {
        const dates = readEntries.map((e) => e.date)
        const pages = readEntries.map((e) => e.pagesRead)
        allStreaks.push(...detectStreaks(dates, pages, 'Reading', 1))

        const bestPages = findPersonalBests(dates, pages, 'Pages Read', 'max')
        if (bestPages) allBests.push(bestPages)
      }

      // Cross-domain correlations
      if (prodEntries.length > 0 && mindEntries.length > 0) {
        // Align by date for correlation
        const prodMap = new Map(prodEntries.map((e) => [e.date, e]))
        const mindMap = new Map(mindEntries.map((e) => [e.date, e]))
        const commonDates = [...prodMap.keys()].filter((d) => mindMap.has(d))

        if (commonDates.length >= 3) {
          const focusVals = commonDates.map((d) => prodMap.get(d)!.focusRating)
          const medVals = commonDates.map((d) => mindMap.get(d)!.duration)

          const corrHints = detectCorrelations([
            {
              nameA: 'Meditation Duration',
              valuesA: medVals,
              nameB: 'Focus Rating',
              valuesB: focusVals,
            },
          ])
          correlations.value = corrHints
        }
      }

      anomalies.value = allAnomalies
      significantChanges.value = allSignificant
      personalBests.value = allBests
      streaks.value = allStreaks
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      loading.value = false
    }
  }

  // Comparison helpers
  function getWeekComparison(domain: DataDomain): {
    thisWeek: Record<string, number>
    lastWeek: Record<string, number>
  } | null {
    const weekly = weeklySummaries.value[domain]
    if (weekly.length < 2) return null
    return {
      thisWeek: weekly[weekly.length - 1]!.metrics,
      lastWeek: weekly[weekly.length - 2]!.metrics,
    }
  }

  function getLongestStreak(metricName: string): Streak | null {
    return findLongestStreak(streaks.value.filter((s) => s.metric === metricName))
  }

  function getCurrentStreak(metricName: string): Streak | null {
    return findCurrentStreak(streaks.value.filter((s) => s.metric === metricName))
  }

  return {
    loading,
    error,
    dailySummaries,
    weeklySummaries,
    monthlySummaries,
    anomalies,
    significantChanges,
    correlations,
    personalBests,
    streaks,
    goals,
    goalsWithProgress,
    loadGoals,
    addGoal,
    removeGoal,
    refreshSummaries,
    getWeekComparison,
    getLongestStreak,
    getCurrentStreak,
  }
})
