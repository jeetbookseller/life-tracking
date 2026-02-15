import { describe, it, expect } from 'vitest'
import {
  parseCSV,
  parseJSON,
  detectFormat,
  normalizeToRows,
  type ParsedRow,
  type ParseDiagnostic,
} from '@/utils/dataIngestion'

// --- CSV parsing tests ---

describe('parseCSV', () => {
  it('accepts CSV with header row and returns row records', () => {
    const csv = `date,restingHR,hrv,sleepDuration
2025-01-15,62,45,7.5
2025-01-16,60,48,8.0`

    const result = parseCSV(csv)

    expect(result.rows).toHaveLength(2)
    expect(result.rows[0]).toEqual({
      date: '2025-01-15',
      restingHR: '62',
      hrv: '45',
      sleepDuration: '7.5',
    })
    expect(result.rows[1]).toEqual({
      date: '2025-01-16',
      restingHR: '60',
      hrv: '48',
      sleepDuration: '8.0',
    })
  })

  it('handles quoted commas in CSV fields', () => {
    const csv = `name,value,notes
"Smith, John",100,"a ""quoted"" note"
Jane,200,simple`

    const result = parseCSV(csv)

    expect(result.rows).toHaveLength(2)
    expect(result.rows[0]!.name).toBe('Smith, John')
    expect(result.rows[0]!.notes).toBe('a "quoted" note')
  })

  it('supports configurable delimiters', () => {
    const tsv = `date\trestingHR\thrv
2025-01-15\t62\t45`

    const result = parseCSV(tsv, { delimiter: '\t' })

    expect(result.rows).toHaveLength(1)
    expect(result.rows[0]!.date).toBe('2025-01-15')
    expect(result.rows[0]!.restingHR).toBe('62')
  })

  it('returns headers extracted from the first row', () => {
    const csv = `date,restingHR,hrv
2025-01-15,62,45`

    const result = parseCSV(csv)

    expect(result.headers).toEqual(['date', 'restingHR', 'hrv'])
  })

  it('surfaces diagnostics for malformed rows', () => {
    const csv = `date,restingHR,hrv
2025-01-15,62,45
2025-01-16,60`

    const result = parseCSV(csv)

    expect(result.diagnostics.length).toBeGreaterThan(0)
    expect(result.diagnostics[0]!.row).toBe(2)
  })

  it('handles empty input gracefully', () => {
    const result = parseCSV('')

    expect(result.rows).toHaveLength(0)
    expect(result.headers).toHaveLength(0)
  })
})

// --- JSON parsing tests ---

describe('parseJSON', () => {
  it('accepts JSON array and normalizes to row records', () => {
    const json = JSON.stringify([
      { date: '2025-01-15', restingHR: 62, hrv: 45 },
      { date: '2025-01-16', restingHR: 60, hrv: 48 },
    ])

    const result = parseJSON(json)

    expect(result.rows).toHaveLength(2)
    expect(result.rows[0]!.date).toBe('2025-01-15')
    expect(result.rows[0]!.restingHR).toBe('62')
  })

  it('accepts JSON object with data array and normalizes to rows', () => {
    const json = JSON.stringify({
      data: [
        { date: '2025-01-15', restingHR: 62 },
        { date: '2025-01-16', restingHR: 60 },
      ],
    })

    const result = parseJSON(json)

    expect(result.rows).toHaveLength(2)
  })

  it('returns headers extracted from row keys', () => {
    const json = JSON.stringify([
      { date: '2025-01-15', restingHR: 62, hrv: 45 },
    ])

    const result = parseJSON(json)

    expect(result.headers).toContain('date')
    expect(result.headers).toContain('restingHR')
    expect(result.headers).toContain('hrv')
  })

  it('surfaces diagnostics for invalid JSON', () => {
    const result = parseJSON('not valid json{')

    expect(result.rows).toHaveLength(0)
    expect(result.diagnostics.length).toBeGreaterThan(0)
  })

  it('handles empty array', () => {
    const result = parseJSON('[]')

    expect(result.rows).toHaveLength(0)
    expect(result.headers).toHaveLength(0)
  })
})

// --- Format detection tests ---

describe('detectFormat', () => {
  it('detects CSV content', () => {
    const csv = `date,restingHR,hrv
2025-01-15,62,45`

    expect(detectFormat(csv)).toBe('csv')
  })

  it('detects JSON array content', () => {
    const json = JSON.stringify([{ date: '2025-01-15' }])

    expect(detectFormat(json)).toBe('json')
  })

  it('detects JSON object content', () => {
    const json = JSON.stringify({ data: [{ date: '2025-01-15' }] })

    expect(detectFormat(json)).toBe('json')
  })
})

// --- normalizeToRows tests ---

describe('normalizeToRows', () => {
  it('converts all values to string for uniform processing', () => {
    const rows: ParsedRow[] = [
      { date: '2025-01-15', value: '62', flag: 'true' },
    ]

    const normalized = normalizeToRows(rows)

    expect(normalized).toHaveLength(1)
    for (const val of Object.values(normalized[0]!)) {
      expect(typeof val).toBe('string')
    }
  })
})
