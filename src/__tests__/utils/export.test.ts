import { describe, it, expect } from 'vitest'
import {
  exportMarkdownKV,
  exportJSON,
  exportCSV,
  type ExportOptions,
  type ExportData,
} from '@/utils/export'
import type {
  ProductivityLog,
  HealthLog,
  MindfulnessLog,
  ReadingLog,
} from '@/types/data-models'
import type { Anomaly } from '@/utils/trends'

function makeProductivityEntry(
  overrides: Partial<ProductivityLog> = {},
): ProductivityLog {
  return {
    id: 'p1',
    date: '2025-01-15',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    tasksPlanned: 5,
    tasksCompleted: 4,
    focusRating: 4,
    deepWorkHours: 3.5,
    ...overrides,
  }
}

function makeHealthEntry(overrides: Partial<HealthLog> = {}): HealthLog {
  return {
    id: 'h1',
    date: '2025-01-15',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    restingHR: 62,
    hrv: 45,
    sleepDuration: 7.5,
    sleepStages: { rem: 1.5, deep: 1.8, core: 3.5, awake: 0.7 },
    activeMinutes: 45,
    ...overrides,
  }
}

function makeMindfulnessEntry(
  overrides: Partial<MindfulnessLog> = {},
): MindfulnessLog {
  return {
    id: 'm1',
    date: '2025-01-15',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    meditationType: 'mindfulness',
    duration: 20,
    qualityRating: 4,
    streakCount: 5,
    ...overrides,
  }
}

function makeReadingEntry(overrides: Partial<ReadingLog> = {}): ReadingLog {
  return {
    id: 'r1',
    date: '2025-01-15',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    bookTitle: 'Deep Work',
    pagesRead: 30,
    highlightsCount: 3,
    ...overrides,
  }
}

// --- Markdown-KV export tests ---

describe('exportMarkdownKV', () => {
  it('produces valid markdown with Day: {Metric: Value} format', () => {
    const data: ExportData = {
      entries: {
        productivity: [makeProductivityEntry()],
      },
      anomalies: [],
    }
    const options: ExportOptions = {
      domains: ['productivity'],
      startDate: '2025-01-15',
      endDate: '2025-01-15',
      format: 'markdown-kv',
    }

    const result = exportMarkdownKV(data, options)

    expect(result).toContain('2025-01-15')
    expect(result).toContain('Tasks Planned: 5')
    expect(result).toContain('Tasks Completed: 4')
    expect(result).toContain('Focus Rating: 4')
    expect(result).toContain('Deep Work Hours: 3.5')
  })

  it('includes metadata header with date range and units', () => {
    const data: ExportData = {
      entries: {
        productivity: [makeProductivityEntry()],
      },
      anomalies: [],
    }
    const options: ExportOptions = {
      domains: ['productivity'],
      startDate: '2025-01-10',
      endDate: '2025-01-20',
      format: 'markdown-kv',
    }

    const result = exportMarkdownKV(data, options)

    expect(result).toContain('2025-01-10 to 2025-01-20')
    expect(result).toContain('Domains:')
    expect(result).toContain('Productivity')
  })

  it('marks anomalies with markers', () => {
    const anomaly: Anomaly = {
      date: '2025-01-15',
      metric: 'Focus Rating',
      value: 1,
      mean: 4,
      stdDev: 0.5,
      direction: 'low',
    }
    const data: ExportData = {
      entries: {
        productivity: [makeProductivityEntry({ focusRating: 1 })],
      },
      anomalies: [anomaly],
    }
    const options: ExportOptions = {
      domains: ['productivity'],
      startDate: '2025-01-15',
      endDate: '2025-01-15',
      format: 'markdown-kv',
    }

    const result = exportMarkdownKV(data, options)

    expect(result).toContain('[ANOMALY]')
  })

  it('filters by selected domains', () => {
    const data: ExportData = {
      entries: {
        productivity: [makeProductivityEntry()],
        health: [makeHealthEntry()],
      },
      anomalies: [],
    }
    const options: ExportOptions = {
      domains: ['health'],
      startDate: '2025-01-15',
      endDate: '2025-01-15',
      format: 'markdown-kv',
    }

    const result = exportMarkdownKV(data, options)

    expect(result).toContain('Resting HR')
    expect(result).not.toContain('Tasks Planned')
  })

  it('filters by date range', () => {
    const data: ExportData = {
      entries: {
        productivity: [
          makeProductivityEntry({ id: 'p1', date: '2025-01-10' }),
          makeProductivityEntry({ id: 'p2', date: '2025-01-15' }),
          makeProductivityEntry({ id: 'p3', date: '2025-01-20' }),
        ],
      },
      anomalies: [],
    }
    const options: ExportOptions = {
      domains: ['productivity'],
      startDate: '2025-01-12',
      endDate: '2025-01-18',
      format: 'markdown-kv',
    }

    const result = exportMarkdownKV(data, options)

    expect(result).toContain('2025-01-15')
    expect(result).not.toContain('2025-01-10')
    expect(result).not.toContain('2025-01-20')
  })

  it('handles multiple domains in export', () => {
    const data: ExportData = {
      entries: {
        productivity: [makeProductivityEntry()],
        mindfulness: [makeMindfulnessEntry()],
        reading: [makeReadingEntry()],
      },
      anomalies: [],
    }
    const options: ExportOptions = {
      domains: ['productivity', 'mindfulness', 'reading'],
      startDate: '2025-01-15',
      endDate: '2025-01-15',
      format: 'markdown-kv',
    }

    const result = exportMarkdownKV(data, options)

    expect(result).toContain('Productivity')
    expect(result).toContain('Mindfulness')
    expect(result).toContain('Reading')
  })

  it('produces meaningful output for empty data (no crash)', () => {
    const data: ExportData = {
      entries: {},
      anomalies: [],
    }
    const options: ExportOptions = {
      domains: ['productivity'],
      startDate: '2025-01-15',
      endDate: '2025-01-15',
      format: 'markdown-kv',
    }

    const result = exportMarkdownKV(data, options)

    expect(result).toBeDefined()
    expect(typeof result).toBe('string')
    expect(result).toContain('No data')
  })
})

// --- JSON export tests ---

describe('exportJSON', () => {
  it('produces valid parseable JSON', () => {
    const data: ExportData = {
      entries: {
        productivity: [makeProductivityEntry()],
      },
      anomalies: [],
    }
    const options: ExportOptions = {
      domains: ['productivity'],
      startDate: '2025-01-15',
      endDate: '2025-01-15',
      format: 'json',
    }

    const result = exportJSON(data, options)
    const parsed = JSON.parse(result)

    expect(parsed).toBeDefined()
    expect(parsed.metadata).toBeDefined()
    expect(parsed.data).toBeDefined()
    expect(parsed.data.productivity).toHaveLength(1)
  })

  it('includes metadata in JSON export', () => {
    const data: ExportData = {
      entries: {
        productivity: [makeProductivityEntry()],
      },
      anomalies: [],
    }
    const options: ExportOptions = {
      domains: ['productivity'],
      startDate: '2025-01-10',
      endDate: '2025-01-20',
      format: 'json',
    }

    const result = exportJSON(data, options)
    const parsed = JSON.parse(result)

    expect(parsed.metadata.startDate).toBe('2025-01-10')
    expect(parsed.metadata.endDate).toBe('2025-01-20')
    expect(parsed.metadata.domains).toContain('productivity')
  })

  it('handles empty data', () => {
    const data: ExportData = { entries: {}, anomalies: [] }
    const options: ExportOptions = {
      domains: ['productivity'],
      startDate: '2025-01-15',
      endDate: '2025-01-15',
      format: 'json',
    }

    const result = exportJSON(data, options)
    const parsed = JSON.parse(result)

    expect(parsed.data).toBeDefined()
  })
})

// --- CSV export tests ---

describe('exportCSV', () => {
  it('produces valid CSV with headers', () => {
    const data: ExportData = {
      entries: {
        productivity: [makeProductivityEntry()],
      },
      anomalies: [],
    }
    const options: ExportOptions = {
      domains: ['productivity'],
      startDate: '2025-01-15',
      endDate: '2025-01-15',
      format: 'csv',
    }

    const result = exportCSV(data, options)
    const lines = result.trim().split('\n')

    // Should have header + data row(s)
    expect(lines.length).toBeGreaterThanOrEqual(2)
    expect(lines[0]).toContain('date')
    expect(lines[0]).toContain('domain')
  })

  it('includes data values in rows', () => {
    const data: ExportData = {
      entries: {
        productivity: [makeProductivityEntry()],
      },
      anomalies: [],
    }
    const options: ExportOptions = {
      domains: ['productivity'],
      startDate: '2025-01-15',
      endDate: '2025-01-15',
      format: 'csv',
    }

    const result = exportCSV(data, options)

    expect(result).toContain('2025-01-15')
    expect(result).toContain('productivity')
  })

  it('handles empty data', () => {
    const data: ExportData = { entries: {}, anomalies: [] }
    const options: ExportOptions = {
      domains: ['productivity'],
      startDate: '2025-01-15',
      endDate: '2025-01-15',
      format: 'csv',
    }

    const result = exportCSV(data, options)

    // Should still have headers
    expect(result).toContain('date')
    expect(result).toContain('domain')
  })
})
