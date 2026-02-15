import { describe, it, expect } from 'vitest'
import {
  sum,
  average,
  median,
  min,
  max,
  percentageDelta,
  computeDailySummaries,
  computeWeeklySummaries,
  computeMonthlySummaries,
  groupByDate,
  getISOWeekStart,
  getMonth,
} from '@/utils/aggregation'
import type { ProductivityLog, HealthLog, ReadingLog } from '@/types/data-models'

// --- Helper to create mock entries ---
function makeProductivityEntry(
  date: string,
  overrides: Partial<ProductivityLog> = {},
): ProductivityLog {
  return {
    id: `prod-${date}`,
    date,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    tasksPlanned: 5,
    tasksCompleted: 3,
    focusRating: 4,
    deepWorkHours: 2,
    ...overrides,
  }
}

function makeHealthEntry(
  date: string,
  overrides: Partial<HealthLog> = {},
): HealthLog {
  return {
    id: `health-${date}`,
    date,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    restingHR: 60,
    hrv: 45,
    sleepDuration: 7.5,
    sleepStages: { rem: 1.5, deep: 1, core: 4, awake: 1 },
    activeMinutes: 30,
    ...overrides,
  }
}

// --- Math helpers ---
describe('sum', () => {
  it('sums an array of numbers', () => {
    expect(sum([1, 2, 3, 4])).toBe(10)
  })

  it('returns 0 for empty array', () => {
    expect(sum([])).toBe(0)
  })
})

describe('average', () => {
  it('calculates average correctly', () => {
    expect(average([2, 4, 6])).toBe(4)
  })

  it('returns 0 for empty array', () => {
    expect(average([])).toBe(0)
  })
})

describe('median', () => {
  it('calculates median for odd-length array', () => {
    expect(median([1, 3, 5])).toBe(3)
  })

  it('calculates median for even-length array', () => {
    expect(median([1, 2, 3, 4])).toBe(2.5)
  })

  it('returns 0 for empty array', () => {
    expect(median([])).toBe(0)
  })

  it('handles unsorted input', () => {
    expect(median([5, 1, 3])).toBe(3)
  })
})

describe('min / max', () => {
  it('finds minimum', () => {
    expect(min([3, 1, 4, 1, 5])).toBe(1)
  })

  it('finds maximum', () => {
    expect(max([3, 1, 4, 1, 5])).toBe(5)
  })

  it('returns 0 for empty arrays', () => {
    expect(min([])).toBe(0)
    expect(max([])).toBe(0)
  })
})

describe('percentageDelta', () => {
  it('calculates positive delta', () => {
    expect(percentageDelta(120, 100)).toBe(20)
  })

  it('calculates negative delta', () => {
    expect(percentageDelta(80, 100)).toBe(-20)
  })

  it('returns 0 when both are 0', () => {
    expect(percentageDelta(0, 0)).toBe(0)
  })

  it('returns 100 when previous is 0 and current is nonzero', () => {
    expect(percentageDelta(50, 0)).toBe(100)
  })
})

// --- Grouping helpers ---
describe('getISOWeekStart', () => {
  it('returns Monday for a Wednesday', () => {
    // 2025-01-15 is a Wednesday
    const result = getISOWeekStart('2025-01-15')
    expect(result).toBe('2025-01-13') // Monday
  })

  it('returns same date for a Monday', () => {
    // 2025-01-13 is a Monday
    const result = getISOWeekStart('2025-01-13')
    expect(result).toBe('2025-01-13')
  })
})

describe('getMonth', () => {
  it('extracts YYYY-MM from date string', () => {
    expect(getMonth('2025-03-15')).toBe('2025-03')
  })
})

describe('groupByDate', () => {
  it('groups entries by their date field', () => {
    const entries = [
      makeProductivityEntry('2025-01-01'),
      makeProductivityEntry('2025-01-01', { id: 'prod-01b' }),
      makeProductivityEntry('2025-01-02'),
    ]
    const groups = groupByDate(entries)
    expect(groups.size).toBe(2)
    expect(groups.get('2025-01-01')!.length).toBe(2)
    expect(groups.get('2025-01-02')!.length).toBe(1)
  })
})

// --- Daily summaries ---
describe('computeDailySummaries', () => {
  it('correctly sums/averages values for a given day', () => {
    const entries = [
      makeProductivityEntry('2025-01-01', {
        tasksPlanned: 5,
        tasksCompleted: 3,
        focusRating: 4,
        deepWorkHours: 2,
      }),
      makeProductivityEntry('2025-01-02', {
        id: 'prod-02',
        tasksPlanned: 8,
        tasksCompleted: 7,
        focusRating: 5,
        deepWorkHours: 4,
      }),
    ]

    const summaries = computeDailySummaries('productivity', entries)
    expect(summaries.length).toBe(2)
    expect(summaries[0].date).toBe('2025-01-01')
    expect(summaries[0].metrics.tasksPlanned).toBe(5)
    expect(summaries[0].metrics.focusRating).toBe(4)
    expect(summaries[1].date).toBe('2025-01-02')
    expect(summaries[1].metrics.tasksCompleted).toBe(7)
  })

  it('returns sorted by date', () => {
    const entries = [
      makeProductivityEntry('2025-01-03'),
      makeProductivityEntry('2025-01-01', { id: 'prod-01' }),
    ]
    const summaries = computeDailySummaries('productivity', entries)
    expect(summaries[0].date).toBe('2025-01-01')
    expect(summaries[1].date).toBe('2025-01-03')
  })

  it('returns empty array for no entries', () => {
    expect(computeDailySummaries('productivity', [])).toEqual([])
  })
})

// --- Weekly summaries ---
describe('computeWeeklySummaries', () => {
  it('aggregates 7 days of data into a week', () => {
    const entries = Array.from({ length: 7 }, (_, i) => {
      const day = String(i + 13).padStart(2, '0') // Jan 13 (Mon) - Jan 19 (Sun)
      return makeProductivityEntry(`2025-01-${day}`, {
        id: `prod-${day}`,
        tasksCompleted: 3,
        deepWorkHours: 2,
      })
    })

    const summaries = computeWeeklySummaries('productivity', entries)
    expect(summaries.length).toBe(1)
    expect(summaries[0].count).toBe(7)
    expect(summaries[0].metrics.tasksCompleted).toBe(21) // 3 * 7
    expect(summaries[0].metrics.deepWorkHours).toBe(14) // 2 * 7
  })
})

// --- Monthly summaries ---
describe('computeMonthlySummaries', () => {
  it('calculates delta % from previous month', () => {
    const janEntries = Array.from({ length: 3 }, (_, i) =>
      makeProductivityEntry(`2025-01-${String(i + 1).padStart(2, '0')}`, {
        id: `prod-jan-${i}`,
        deepWorkHours: 2,
      }),
    )
    const febEntries = Array.from({ length: 3 }, (_, i) =>
      makeProductivityEntry(`2025-02-${String(i + 1).padStart(2, '0')}`, {
        id: `prod-feb-${i}`,
        deepWorkHours: 4,
      }),
    )

    const summaries = computeMonthlySummaries('productivity', [
      ...janEntries,
      ...febEntries,
    ])
    expect(summaries.length).toBe(2)
    expect(summaries[0].month).toBe('2025-01')
    expect(summaries[1].month).toBe('2025-02')
    // Feb deepWorkHours = 12, Jan deepWorkHours = 6, delta = +100%
    expect(summaries[1].deltaFromPrevious.deepWorkHours).toBe(100)
  })

  it('first month has empty deltaFromPrevious', () => {
    const entries = [makeProductivityEntry('2025-01-01')]
    const summaries = computeMonthlySummaries('productivity', entries)
    expect(summaries[0].deltaFromPrevious).toEqual({})
  })
})

// --- Health domain ---
describe('computeDailySummaries for health', () => {
  it('averages health metrics correctly', () => {
    const entries = [
      makeHealthEntry('2025-01-01', { restingHR: 60, hrv: 40, sleepDuration: 7 }),
      makeHealthEntry('2025-01-01', {
        id: 'health-01b',
        restingHR: 64,
        hrv: 50,
        sleepDuration: 8,
      }),
    ]

    const summaries = computeDailySummaries('health', entries)
    expect(summaries.length).toBe(1)
    expect(summaries[0].metrics.restingHR).toBe(62) // average of 60 and 64
    expect(summaries[0].metrics.hrv).toBe(45) // average of 40 and 50
    expect(summaries[0].metrics.sleepDuration).toBe(7.5)
  })
})
