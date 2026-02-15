import type {
  DataDomain,
  BaseEntry,
  ProductivityLog,
  FinanceLog,
  HealthLog,
  MetabolicLog,
  DigitalLog,
  MindfulnessLog,
  ReadingLog,
} from '@/types/data-models'

export interface DomainSummary {
  domain: DataDomain
  date: string
  metrics: Record<string, number>
}

export interface WeeklySummary {
  domain: DataDomain
  weekStart: string
  weekEnd: string
  metrics: Record<string, number>
  count: number
}

export interface MonthlySummary {
  domain: DataDomain
  month: string // YYYY-MM
  metrics: Record<string, number>
  count: number
  deltaFromPrevious: Record<string, number> // percentage change
}

// --- Pure math helpers ---

export function sum(values: number[]): number {
  return values.reduce((a, b) => a + b, 0)
}

export function average(values: number[]): number {
  if (values.length === 0) return 0
  return sum(values) / values.length
}

export function median(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0
    ? sorted[mid]!
    : (sorted[mid - 1]! + sorted[mid]!) / 2
}

export function min(values: number[]): number {
  if (values.length === 0) return 0
  return Math.min(...values)
}

export function max(values: number[]): number {
  if (values.length === 0) return 0
  return Math.max(...values)
}

export function percentageDelta(current: number, previous: number): number {
  if (previous === 0) return current === 0 ? 0 : 100
  return ((current - previous) / Math.abs(previous)) * 100
}

// --- Domain metric extractors ---

type MetricExtractor<T> = (entries: T[]) => Record<string, number>

function extractProductivityMetrics(entries: ProductivityLog[]): Record<string, number> {
  return {
    tasksPlanned: sum(entries.map((e) => e.tasksPlanned)),
    tasksCompleted: sum(entries.map((e) => e.tasksCompleted)),
    focusRating: average(entries.map((e) => e.focusRating)),
    deepWorkHours: sum(entries.map((e) => e.deepWorkHours)),
  }
}

function extractFinanceMetrics(entries: FinanceLog[]): Record<string, number> {
  // For finance, we take the latest snapshot values, not sums
  const latest = entries[entries.length - 1]
  if (!latest) return { totalAssets: 0, totalLiabilities: 0, netWorth: 0 }
  return {
    totalAssets: latest.totalAssets,
    totalLiabilities: latest.totalLiabilities,
    netWorth: latest.netWorth,
  }
}

function extractHealthMetrics(entries: HealthLog[]): Record<string, number> {
  return {
    restingHR: average(entries.map((e) => e.restingHR)),
    hrv: average(entries.map((e) => e.hrv)),
    sleepDuration: average(entries.map((e) => e.sleepDuration)),
    activeMinutes: sum(entries.map((e) => e.activeMinutes)),
  }
}

function extractMetabolicMetrics(entries: MetabolicLog[]): Record<string, number> {
  return {
    gutMicrobiomeScore: average(entries.map((e) => e.gutMicrobiomeScore)),
    dailyFoodScore: average(entries.map((e) => e.dailyFoodScore)),
    fiberIntake: average(entries.map((e) => e.fiberIntake)),
  }
}

function extractDigitalMetrics(entries: DigitalLog[]): Record<string, number> {
  return {
    totalScreenTime: sum(entries.map((e) => e.totalScreenTime)),
    unlocks: sum(entries.map((e) => e.unlocks)),
  }
}

function extractMindfulnessMetrics(entries: MindfulnessLog[]): Record<string, number> {
  return {
    duration: sum(entries.map((e) => e.duration)),
    qualityRating: average(entries.map((e) => e.qualityRating)),
  }
}

function extractReadingMetrics(entries: ReadingLog[]): Record<string, number> {
  return {
    pagesRead: sum(entries.map((e) => e.pagesRead)),
    highlightsCount: sum(entries.map((e) => e.highlightsCount)),
  }
}

const METRIC_EXTRACTORS: Record<DataDomain, MetricExtractor<never>> = {
  productivity: extractProductivityMetrics as MetricExtractor<never>,
  finance: extractFinanceMetrics as MetricExtractor<never>,
  health: extractHealthMetrics as MetricExtractor<never>,
  metabolic: extractMetabolicMetrics as MetricExtractor<never>,
  digital: extractDigitalMetrics as MetricExtractor<never>,
  mindfulness: extractMindfulnessMetrics as MetricExtractor<never>,
  reading: extractReadingMetrics as MetricExtractor<never>,
}

// --- Grouping helpers ---

function groupByDate<T extends BaseEntry>(entries: T[]): Map<string, T[]> {
  const groups = new Map<string, T[]>()
  for (const entry of entries) {
    const existing = groups.get(entry.date)
    if (existing) {
      existing.push(entry)
    } else {
      groups.set(entry.date, [entry])
    }
  }
  return groups
}

function getISOWeekStart(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  const day = date.getDay()
  const diff = day === 0 ? -6 : 1 - day // Monday start
  date.setDate(date.getDate() + diff)
  return date.toISOString().split('T')[0]!
}

function getMonth(dateStr: string): string {
  return dateStr.slice(0, 7)
}

function groupByWeek<T extends BaseEntry>(entries: T[]): Map<string, T[]> {
  const groups = new Map<string, T[]>()
  for (const entry of entries) {
    const weekStart = getISOWeekStart(entry.date)
    const existing = groups.get(weekStart)
    if (existing) {
      existing.push(entry)
    } else {
      groups.set(weekStart, [entry])
    }
  }
  return groups
}

function groupByMonth<T extends BaseEntry>(entries: T[]): Map<string, T[]> {
  const groups = new Map<string, T[]>()
  for (const entry of entries) {
    const month = getMonth(entry.date)
    const existing = groups.get(month)
    if (existing) {
      existing.push(entry)
    } else {
      groups.set(month, [entry])
    }
  }
  return groups
}

// --- Public API ---

export function computeDailySummaries<T extends BaseEntry>(
  domain: DataDomain,
  entries: T[],
): DomainSummary[] {
  const extractor = METRIC_EXTRACTORS[domain]
  const groups = groupByDate(entries)
  const summaries: DomainSummary[] = []

  for (const [date, dayEntries] of groups) {
    summaries.push({
      domain,
      date,
      metrics: extractor(dayEntries as never[]),
    })
  }

  return summaries.sort((a, b) => a.date.localeCompare(b.date))
}

export function computeWeeklySummaries<T extends BaseEntry>(
  domain: DataDomain,
  entries: T[],
): WeeklySummary[] {
  const extractor = METRIC_EXTRACTORS[domain]
  const groups = groupByWeek(entries)
  const summaries: WeeklySummary[] = []

  for (const [weekStart, weekEntries] of groups) {
    const endDate = new Date(weekStart + 'T00:00:00')
    endDate.setDate(endDate.getDate() + 6)
    const weekEnd = endDate.toISOString().split('T')[0]!

    summaries.push({
      domain,
      weekStart,
      weekEnd,
      metrics: extractor(weekEntries as never[]),
      count: weekEntries.length,
    })
  }

  return summaries.sort((a, b) => a.weekStart.localeCompare(b.weekStart))
}

export function computeMonthlySummaries<T extends BaseEntry>(
  domain: DataDomain,
  entries: T[],
): MonthlySummary[] {
  const extractor = METRIC_EXTRACTORS[domain]
  const groups = groupByMonth(entries)
  const months = [...groups.keys()].sort()
  const summaries: MonthlySummary[] = []

  let previousMetrics: Record<string, number> | null = null

  for (const month of months) {
    const monthEntries = groups.get(month)!
    const metrics = extractor(monthEntries as never[])

    const deltaFromPrevious: Record<string, number> = {}
    if (previousMetrics) {
      for (const key of Object.keys(metrics)) {
        deltaFromPrevious[key] = percentageDelta(
          metrics[key]!,
          previousMetrics[key] ?? 0,
        )
      }
    }

    summaries.push({
      domain,
      month,
      metrics,
      count: monthEntries.length,
      deltaFromPrevious,
    })

    previousMetrics = metrics
  }

  return summaries
}

export { groupByDate, groupByWeek, groupByMonth, getISOWeekStart, getMonth }
