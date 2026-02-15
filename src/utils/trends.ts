import { average } from './aggregation'

export interface Anomaly {
  date: string
  metric: string
  value: number
  mean: number
  stdDev: number
  direction: 'high' | 'low'
}

export interface Streak {
  metric: string
  count: number
  startDate: string
  endDate: string
  active: boolean // true if streak is still ongoing (includes most recent date)
}

export interface SignificantChange {
  metric: string
  currentWeekAvg: number
  previousWeekAvg: number
  deltaPercent: number
  direction: 'up' | 'down'
}

export interface CorrelationHint {
  metricA: string
  metricB: string
  correlation: number // -1 to 1
  description: string
}

// --- Moving averages ---

export function movingAverage(values: number[], window: number): number[] {
  if (values.length === 0) return []
  const result: number[] = []
  for (let i = 0; i < values.length; i++) {
    const start = Math.max(0, i - window + 1)
    const slice = values.slice(start, i + 1)
    result.push(average(slice))
  }
  return result
}

export function movingAverage7(values: number[]): number[] {
  return movingAverage(values, 7)
}

export function movingAverage30(values: number[]): number[] {
  return movingAverage(values, 30)
}

// --- Standard deviation ---

export function standardDeviation(values: number[]): number {
  if (values.length < 2) return 0
  const mean = average(values)
  const squaredDiffs = values.map((v) => (v - mean) ** 2)
  return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / values.length)
}

// --- Anomaly detection ---

export function detectAnomalies(
  dates: string[],
  values: number[],
  metricName: string,
  threshold: number = 2,
): Anomaly[] {
  if (values.length < 3) return []

  const mean = average(values)
  const stdDev = standardDeviation(values)
  if (stdDev === 0) return []

  const anomalies: Anomaly[] = []
  for (let i = 0; i < values.length; i++) {
    const deviation = Math.abs(values[i]! - mean) / stdDev
    if (deviation > threshold) {
      anomalies.push({
        date: dates[i]!,
        metric: metricName,
        value: values[i]!,
        mean,
        stdDev,
        direction: values[i]! > mean ? 'high' : 'low',
      })
    }
  }
  return anomalies
}

// --- Streak detection ---

export function detectStreaks(
  dates: string[],
  values: number[],
  metricName: string,
  threshold: number,
): Streak[] {
  if (values.length === 0) return []

  const streaks: Streak[] = []
  let streakStart = 0
  let streakCount = 0

  for (let i = 0; i < values.length; i++) {
    if (values[i]! >= threshold) {
      if (streakCount === 0) {
        streakStart = i
      }
      streakCount++
    } else {
      if (streakCount > 0) {
        streaks.push({
          metric: metricName,
          count: streakCount,
          startDate: dates[streakStart]!,
          endDate: dates[i - 1]!,
          active: false,
        })
      }
      streakCount = 0
    }
  }

  // Handle streak that extends to the end
  if (streakCount > 0) {
    streaks.push({
      metric: metricName,
      count: streakCount,
      startDate: dates[streakStart]!,
      endDate: dates[values.length - 1]!,
      active: true,
    })
  }

  return streaks
}

// --- Significant change detection ---

export function detectSignificantChanges(
  _dates: string[],
  values: number[],
  metricName: string,
  deltaThreshold: number = 15,
): SignificantChange[] {
  if (values.length < 14) return []

  // Compare last 7 values vs previous 7 values
  const currentWeek = values.slice(-7)
  const previousWeek = values.slice(-14, -7)

  const currentWeekAvg = average(currentWeek)
  const previousWeekAvg = average(previousWeek)

  if (previousWeekAvg === 0 && currentWeekAvg === 0) return []

  const deltaPercent =
    previousWeekAvg === 0
      ? 100
      : ((currentWeekAvg - previousWeekAvg) / Math.abs(previousWeekAvg)) * 100

  if (Math.abs(deltaPercent) >= deltaThreshold) {
    return [
      {
        metric: metricName,
        currentWeekAvg,
        previousWeekAvg,
        deltaPercent,
        direction: deltaPercent > 0 ? 'up' : 'down',
      },
    ]
  }

  return []
}

// --- Correlation (Pearson) ---

export function pearsonCorrelation(xs: number[], ys: number[]): number {
  const n = Math.min(xs.length, ys.length)
  if (n < 3) return 0

  const xSlice = xs.slice(0, n)
  const ySlice = ys.slice(0, n)

  const meanX = average(xSlice)
  const meanY = average(ySlice)

  let numerator = 0
  let denomX = 0
  let denomY = 0

  for (let i = 0; i < n; i++) {
    const dx = xSlice[i]! - meanX
    const dy = ySlice[i]! - meanY
    numerator += dx * dy
    denomX += dx * dx
    denomY += dy * dy
  }

  const denom = Math.sqrt(denomX * denomY)
  if (denom === 0) return 0

  return numerator / denom
}

export function detectCorrelations(
  metricPairs: Array<{
    nameA: string
    valuesA: number[]
    nameB: string
    valuesB: number[]
  }>,
  threshold: number = 0.5,
): CorrelationHint[] {
  const hints: CorrelationHint[] = []

  for (const pair of metricPairs) {
    const corr = pearsonCorrelation(pair.valuesA, pair.valuesB)
    if (Math.abs(corr) >= threshold) {
      const direction = corr > 0 ? 'positively' : 'negatively'
      hints.push({
        metricA: pair.nameA,
        metricB: pair.nameB,
        correlation: corr,
        description: `${pair.nameA} is ${direction} correlated with ${pair.nameB}`,
      })
    }
  }

  return hints
}

// --- Personal bests ---

export interface PersonalBest {
  metric: string
  value: number
  date: string
  type: 'max' | 'min'
}

export function findPersonalBests(
  dates: string[],
  values: number[],
  metricName: string,
  type: 'max' | 'min' = 'max',
): PersonalBest | null {
  if (values.length === 0) return null

  let bestIdx = 0
  for (let i = 1; i < values.length; i++) {
    if (type === 'max' && values[i]! > values[bestIdx]!) bestIdx = i
    if (type === 'min' && values[i]! < values[bestIdx]!) bestIdx = i
  }

  return {
    metric: metricName,
    value: values[bestIdx]!,
    date: dates[bestIdx]!,
    type,
  }
}

// --- Longest streak finder ---

export function findLongestStreak(streaks: Streak[]): Streak | null {
  if (streaks.length === 0) return null
  return streaks.reduce((best, s) => (s.count > best.count ? s : best))
}

export function findCurrentStreak(streaks: Streak[]): Streak | null {
  const active = streaks.filter((s) => s.active)
  if (active.length === 0) return null
  return active[active.length - 1]!
}
