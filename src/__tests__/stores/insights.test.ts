import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useInsightsStore, type Goal } from '@/stores/insights'

// Mock the data store
vi.mock('@/stores/data', () => ({
  useDataStore: vi.fn(() => ({
    getAllEntries: vi.fn().mockResolvedValue([]),
  })),
}))

describe('useInsightsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('initializes with empty state', () => {
    const store = useInsightsStore()
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
    expect(store.anomalies).toEqual([])
    expect(store.significantChanges).toEqual([])
    expect(store.correlations).toEqual([])
    expect(store.personalBests).toEqual([])
    expect(store.streaks).toEqual([])
    expect(store.goals).toEqual([])
  })

  it('has empty daily summaries for all domains', () => {
    const store = useInsightsStore()
    expect(store.dailySummaries.productivity).toEqual([])
    expect(store.dailySummaries.finance).toEqual([])
    expect(store.dailySummaries.health).toEqual([])
    expect(store.dailySummaries.metabolic).toEqual([])
    expect(store.dailySummaries.digital).toEqual([])
    expect(store.dailySummaries.mindfulness).toEqual([])
    expect(store.dailySummaries.reading).toEqual([])
  })

  it('has empty weekly summaries for all domains', () => {
    const store = useInsightsStore()
    expect(store.weeklySummaries.productivity).toEqual([])
    expect(store.weeklySummaries.reading).toEqual([])
  })

  it('has empty monthly summaries for all domains', () => {
    const store = useInsightsStore()
    expect(store.monthlySummaries.productivity).toEqual([])
    expect(store.monthlySummaries.finance).toEqual([])
  })

  // --- Goal management ---
  describe('goal management', () => {
    it('adds a goal and persists to localStorage', () => {
      const store = useInsightsStore()
      const goal: Goal = {
        domain: 'productivity',
        metric: 'deepWorkHours',
        target: 4,
        label: 'Daily deep work target',
      }

      store.addGoal(goal)
      expect(store.goals.length).toBe(1)
      expect(store.goals[0]).toEqual(goal)

      // Check localStorage
      const stored = JSON.parse(
        localStorage.getItem('life-tracker-goals') || '[]',
      )
      expect(stored.length).toBe(1)
    })

    it('removes a goal by index', () => {
      const store = useInsightsStore()
      store.addGoal({
        domain: 'productivity',
        metric: 'deepWorkHours',
        target: 4,
        label: 'Goal 1',
      })
      store.addGoal({
        domain: 'health',
        metric: 'sleepDuration',
        target: 8,
        label: 'Goal 2',
      })

      expect(store.goals.length).toBe(2)
      store.removeGoal(0)
      expect(store.goals.length).toBe(1)
      expect(store.goals[0].label).toBe('Goal 2')
    })

    it('loads goals from localStorage', () => {
      const goals: Goal[] = [
        {
          domain: 'reading',
          metric: 'pagesRead',
          target: 30,
          label: 'Read 30 pages daily',
        },
      ]
      localStorage.setItem('life-tracker-goals', JSON.stringify(goals))

      const store = useInsightsStore()
      store.loadGoals()
      expect(store.goals.length).toBe(1)
      expect(store.goals[0].label).toBe('Read 30 pages daily')
    })

    it('handles corrupted localStorage gracefully', () => {
      localStorage.setItem('life-tracker-goals', 'not valid json{{{')
      const store = useInsightsStore()
      store.loadGoals()
      expect(store.goals).toEqual([])
    })
  })

  // --- Goals with progress ---
  describe('goalsWithProgress', () => {
    it('shows correct percentage toward target', () => {
      const store = useInsightsStore()

      // Set up a daily summary with known metric value
      store.dailySummaries.productivity = [
        {
          domain: 'productivity',
          date: '2025-01-01',
          metrics: { deepWorkHours: 3 },
        },
      ]

      store.addGoal({
        domain: 'productivity',
        metric: 'deepWorkHours',
        target: 4,
        label: 'Deep work',
      })

      const progress = store.goalsWithProgress
      expect(progress.length).toBe(1)
      expect(progress[0].current).toBe(3)
      expect(progress[0].percentage).toBe(75)
    })

    it('caps percentage at 100', () => {
      const store = useInsightsStore()
      store.dailySummaries.reading = [
        {
          domain: 'reading',
          date: '2025-01-01',
          metrics: { pagesRead: 50 },
        },
      ]

      store.addGoal({
        domain: 'reading',
        metric: 'pagesRead',
        target: 30,
        label: 'Read pages',
      })

      const progress = store.goalsWithProgress
      expect(progress[0].percentage).toBe(100)
    })

    it('returns 0 when no data exists', () => {
      const store = useInsightsStore()
      store.addGoal({
        domain: 'mindfulness',
        metric: 'duration',
        target: 20,
        label: 'Meditate',
      })

      const progress = store.goalsWithProgress
      expect(progress[0].current).toBe(0)
      expect(progress[0].percentage).toBe(0)
    })
  })

  // --- Week comparison ---
  describe('getWeekComparison', () => {
    it('returns this week vs last week metrics', () => {
      const store = useInsightsStore()
      store.weeklySummaries.productivity = [
        {
          domain: 'productivity',
          weekStart: '2025-01-06',
          weekEnd: '2025-01-12',
          metrics: { focusRating: 3.5 },
          count: 7,
        },
        {
          domain: 'productivity',
          weekStart: '2025-01-13',
          weekEnd: '2025-01-19',
          metrics: { focusRating: 4.2 },
          count: 7,
        },
      ]

      const result = store.getWeekComparison('productivity')
      expect(result).not.toBeNull()
      expect(result!.thisWeek.focusRating).toBe(4.2)
      expect(result!.lastWeek.focusRating).toBe(3.5)
    })

    it('returns null when fewer than 2 weeks', () => {
      const store = useInsightsStore()
      expect(store.getWeekComparison('productivity')).toBeNull()
    })
  })

  // --- Refresh summaries ---
  describe('refreshSummaries', () => {
    it('sets loading to true during refresh and false after', async () => {
      const store = useInsightsStore()
      const promise = store.refreshSummaries()
      // loading should be true during the async operation
      expect(store.loading).toBe(true)
      await promise
      expect(store.loading).toBe(false)
    })

    it('handles errors gracefully', async () => {
      const { useDataStore } = await import('@/stores/data')
      ;(useDataStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        getAllEntries: vi.fn().mockRejectedValue(new Error('DB error')),
      })

      const store = useInsightsStore()
      await store.refreshSummaries()
      expect(store.error).toBe('DB error')
      expect(store.loading).toBe(false)
    })
  })
})
