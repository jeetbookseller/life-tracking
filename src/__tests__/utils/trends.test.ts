import { describe, it, expect } from 'vitest'
import {
  movingAverage,
  movingAverage7,
  movingAverage30,
  standardDeviation,
  detectAnomalies,
  detectStreaks,
  detectSignificantChanges,
  pearsonCorrelation,
  detectCorrelations,
  findPersonalBests,
  findLongestStreak,
  findCurrentStreak,
} from '@/utils/trends'

// --- Moving averages ---
describe('movingAverage', () => {
  it('calculates moving average with window size', () => {
    const result = movingAverage([1, 2, 3, 4, 5], 3)
    expect(result.length).toBe(5)
    expect(result[0]).toBeCloseTo(1) // only 1 value available
    expect(result[1]).toBeCloseTo(1.5) // avg of [1, 2]
    expect(result[2]).toBeCloseTo(2) // avg of [1, 2, 3]
    expect(result[3]).toBeCloseTo(3) // avg of [2, 3, 4]
    expect(result[4]).toBeCloseTo(4) // avg of [3, 4, 5]
  })

  it('returns empty array for empty input', () => {
    expect(movingAverage([], 7)).toEqual([])
  })

  it('handles fewer values than window size', () => {
    const result = movingAverage([10, 20], 7)
    expect(result.length).toBe(2)
    expect(result[0]).toBeCloseTo(10)
    expect(result[1]).toBeCloseTo(15)
  })
})

describe('movingAverage7', () => {
  it('calculates 7-day moving average', () => {
    const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const result = movingAverage7(values)
    expect(result.length).toBe(10)
    // 7th value should be average of [1..7] = 4
    expect(result[6]).toBeCloseTo(4)
  })
})

describe('movingAverage30', () => {
  it('handles fewer than 30 data points', () => {
    const values = [5, 10, 15]
    const result = movingAverage30(values)
    expect(result.length).toBe(3)
    expect(result[0]).toBeCloseTo(5)
    expect(result[1]).toBeCloseTo(7.5)
    expect(result[2]).toBeCloseTo(10)
  })
})

// --- Standard deviation ---
describe('standardDeviation', () => {
  it('calculates std dev for sample data', () => {
    const stdDev = standardDeviation([2, 4, 4, 4, 5, 5, 7, 9])
    expect(stdDev).toBeCloseTo(2, 0) // approx 2
  })

  it('returns 0 for single value', () => {
    expect(standardDeviation([5])).toBe(0)
  })

  it('returns 0 for empty array', () => {
    expect(standardDeviation([])).toBe(0)
  })

  it('returns 0 for identical values', () => {
    expect(standardDeviation([3, 3, 3, 3])).toBe(0)
  })
})

// --- Anomaly detection ---
describe('detectAnomalies', () => {
  it('flags values >2 std deviations from mean', () => {
    const dates = ['d1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8', 'd9', 'd10']
    const values = [5, 5, 5, 5, 5, 5, 5, 5, 5, 20] // 20 is an anomaly

    const anomalies = detectAnomalies(dates, values, 'test_metric')
    expect(anomalies.length).toBeGreaterThan(0)
    expect(anomalies[0].date).toBe('d10')
    expect(anomalies[0].direction).toBe('high')
    expect(anomalies[0].metric).toBe('test_metric')
  })

  it('detects low anomalies', () => {
    const dates = ['d1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8', 'd9', 'd10']
    const values = [50, 50, 50, 50, 50, 50, 50, 50, 50, 5] // 5 is anomalously low

    const anomalies = detectAnomalies(dates, values, 'metric')
    expect(anomalies.length).toBeGreaterThan(0)
    expect(anomalies.some((a) => a.direction === 'low')).toBe(true)
  })

  it('returns empty when all values are similar', () => {
    const dates = ['d1', 'd2', 'd3', 'd4', 'd5']
    const values = [10, 10, 10, 10, 10]
    expect(detectAnomalies(dates, values, 'metric')).toEqual([])
  })

  it('returns empty for fewer than 3 data points', () => {
    expect(detectAnomalies(['d1', 'd2'], [1, 2], 'metric')).toEqual([])
  })
})

// --- Streak detection ---
describe('detectStreaks', () => {
  it('counts consecutive days meeting a threshold', () => {
    const dates = ['d1', 'd2', 'd3', 'd4', 'd5']
    const values = [3, 4, 5, 2, 4]
    const streaks = detectStreaks(dates, values, 'focus', 3)

    expect(streaks.length).toBe(2)
    expect(streaks[0].count).toBe(3) // d1-d3
    expect(streaks[0].startDate).toBe('d1')
    expect(streaks[0].endDate).toBe('d3')
    expect(streaks[0].active).toBe(false)
    expect(streaks[1].count).toBe(1) // d5
    expect(streaks[1].active).toBe(true) // ends at last element
  })

  it('returns empty for no values meeting threshold', () => {
    const dates = ['d1', 'd2']
    const values = [1, 2]
    expect(detectStreaks(dates, values, 'focus', 5)).toEqual([])
  })

  it('returns empty for empty input', () => {
    expect(detectStreaks([], [], 'focus', 1)).toEqual([])
  })

  it('handles all values meeting threshold', () => {
    const dates = ['d1', 'd2', 'd3']
    const values = [5, 5, 5]
    const streaks = detectStreaks(dates, values, 'focus', 3)
    expect(streaks.length).toBe(1)
    expect(streaks[0].count).toBe(3)
    expect(streaks[0].active).toBe(true)
  })
})

// --- Significant change detection ---
describe('detectSignificantChanges', () => {
  it('flags >15% week-over-week delta', () => {
    // 7 values at 10, then 7 values at 15 => 50% increase
    const dates = Array.from({ length: 14 }, (_, i) => `d${i}`)
    const values = [...Array(7).fill(10), ...Array(7).fill(15)]

    const changes = detectSignificantChanges(dates, values, 'metric')
    expect(changes.length).toBe(1)
    expect(changes[0].direction).toBe('up')
    expect(changes[0].deltaPercent).toBeCloseTo(50)
  })

  it('returns empty for <14 data points', () => {
    expect(
      detectSignificantChanges(['d1'], [5], 'metric'),
    ).toEqual([])
  })

  it('returns empty when change is below threshold', () => {
    const dates = Array.from({ length: 14 }, (_, i) => `d${i}`)
    const values = [...Array(7).fill(100), ...Array(7).fill(105)] // 5% change

    expect(detectSignificantChanges(dates, values, 'metric')).toEqual([])
  })
})

// --- Pearson correlation ---
describe('pearsonCorrelation', () => {
  it('returns ~1 for perfectly correlated data', () => {
    const xs = [1, 2, 3, 4, 5]
    const ys = [2, 4, 6, 8, 10]
    expect(pearsonCorrelation(xs, ys)).toBeCloseTo(1, 5)
  })

  it('returns ~-1 for perfectly negatively correlated data', () => {
    const xs = [1, 2, 3, 4, 5]
    const ys = [10, 8, 6, 4, 2]
    expect(pearsonCorrelation(xs, ys)).toBeCloseTo(-1, 5)
  })

  it('returns 0 for fewer than 3 points', () => {
    expect(pearsonCorrelation([1, 2], [3, 4])).toBe(0)
  })

  it('returns 0 for constant data', () => {
    expect(pearsonCorrelation([5, 5, 5], [1, 2, 3])).toBe(0)
  })
})

describe('detectCorrelations', () => {
  it('detects strong positive correlations', () => {
    const hints = detectCorrelations([
      {
        nameA: 'Meditation',
        valuesA: [1, 2, 3, 4, 5],
        nameB: 'Focus',
        valuesB: [2, 4, 6, 8, 10],
      },
    ])
    expect(hints.length).toBe(1)
    expect(hints[0].correlation).toBeCloseTo(1, 1)
    expect(hints[0].description).toContain('positively')
  })

  it('ignores weak correlations below threshold', () => {
    const hints = detectCorrelations(
      [
        {
          nameA: 'A',
          valuesA: [1, 2, 3, 4, 5],
          nameB: 'B',
          valuesB: [5, 3, 4, 2, 1],
        },
      ],
      0.99,
    )
    // Correlation around -0.9, below 0.99 threshold
    expect(hints.length).toBe(0)
  })
})

// --- Personal bests ---
describe('findPersonalBests', () => {
  it('finds maximum value', () => {
    const best = findPersonalBests(
      ['d1', 'd2', 'd3'],
      [5, 12, 8],
      'Deep Work',
      'max',
    )
    expect(best).not.toBeNull()
    expect(best!.value).toBe(12)
    expect(best!.date).toBe('d2')
    expect(best!.type).toBe('max')
  })

  it('finds minimum value', () => {
    const best = findPersonalBests(
      ['d1', 'd2', 'd3'],
      [60, 55, 58],
      'Resting HR',
      'min',
    )
    expect(best!.value).toBe(55)
    expect(best!.date).toBe('d2')
  })

  it('returns null for empty arrays', () => {
    expect(findPersonalBests([], [], 'metric')).toBeNull()
  })
})

// --- Streak finders ---
describe('findLongestStreak', () => {
  it('returns the streak with highest count', () => {
    const result = findLongestStreak([
      { metric: 'test', count: 3, startDate: 'd1', endDate: 'd3', active: false },
      { metric: 'test', count: 7, startDate: 'd5', endDate: 'd11', active: true },
      { metric: 'test', count: 2, startDate: 'd13', endDate: 'd14', active: false },
    ])
    expect(result!.count).toBe(7)
  })

  it('returns null for empty array', () => {
    expect(findLongestStreak([])).toBeNull()
  })
})

describe('findCurrentStreak', () => {
  it('returns the active streak', () => {
    const result = findCurrentStreak([
      { metric: 'test', count: 3, startDate: 'd1', endDate: 'd3', active: false },
      { metric: 'test', count: 5, startDate: 'd5', endDate: 'd9', active: true },
    ])
    expect(result!.count).toBe(5)
    expect(result!.active).toBe(true)
  })

  it('returns null when no active streak', () => {
    const result = findCurrentStreak([
      { metric: 'test', count: 3, startDate: 'd1', endDate: 'd3', active: false },
    ])
    expect(result).toBeNull()
  })
})
