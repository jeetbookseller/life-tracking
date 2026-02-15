import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import {
  dryRun,
  commitImport,
  type ImportConfig,
  type DryRunResult,
  type ConflictPolicy,
} from '@/services/import'
import type { DataDomain } from '@/types/data-models'

function makeConfig(overrides: Partial<ImportConfig> = {}): ImportConfig {
  return {
    domain: 'health' as DataDomain,
    rows: [
      {
        date: '2025-01-15',
        restingHR: '62',
        hrv: '45',
        sleepDuration: '7.5',
        activeMinutes: '30',
      },
      {
        date: '2025-01-16',
        restingHR: '60',
        hrv: '48',
        sleepDuration: '8.0',
        activeMinutes: '25',
      },
    ],
    fieldMappings: [
      { externalField: 'date', internalField: 'date' },
      { externalField: 'restingHR', internalField: 'restingHR' },
      { externalField: 'hrv', internalField: 'hrv' },
      { externalField: 'sleepDuration', internalField: 'sleepDuration' },
      { externalField: 'activeMinutes', internalField: 'activeMinutes' },
    ],
    conflictPolicy: 'skip' as ConflictPolicy,
    ...overrides,
  }
}

describe('Import Service - dryRun', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('reports valid row counts for well-formed data', () => {
    const config = makeConfig()
    const result = dryRun(config)

    expect(result.validCount).toBe(2)
    expect(result.invalidCount).toBe(0)
    expect(result.totalCount).toBe(2)
  })

  it('reports invalid rows with field-level errors', () => {
    const config = makeConfig({
      rows: [
        { date: '2025-01-15', restingHR: '62', hrv: '45', sleepDuration: '7.5', activeMinutes: '30' },
        { date: '', restingHR: 'not-a-number', hrv: '45', sleepDuration: '7.5', activeMinutes: '30' },
      ],
    })

    const result = dryRun(config)

    expect(result.invalidCount).toBeGreaterThan(0)
    expect(result.errors.length).toBeGreaterThan(0)
    expect(result.errors[0]!.row).toBeDefined()
    expect(result.errors[0]!.field).toBeDefined()
  })

  it('flags required-field validation errors per domain', () => {
    const config = makeConfig({
      domain: 'health',
      rows: [
        { date: '2025-01-15' }, // missing required fields
      ],
      fieldMappings: [
        { externalField: 'date', internalField: 'date' },
      ],
    })

    const result = dryRun(config)

    expect(result.invalidCount).toBe(1)
    expect(result.errors.length).toBeGreaterThan(0)
  })

  it('reports numeric coercion errors with field names', () => {
    const config = makeConfig({
      rows: [
        { date: '2025-01-15', restingHR: 'abc', hrv: '45', sleepDuration: '7.5', activeMinutes: '30' },
      ],
    })

    const result = dryRun(config)

    expect(result.invalidCount).toBe(1)
    const hrError = result.errors.find((e) => e.field === 'restingHR')
    expect(hrError).toBeDefined()
  })

  it('reports date coercion errors', () => {
    const config = makeConfig({
      rows: [
        { date: 'not-a-date', restingHR: '62', hrv: '45', sleepDuration: '7.5', activeMinutes: '30' },
      ],
    })

    const result = dryRun(config)

    expect(result.invalidCount).toBe(1)
  })

  it('reports conflict row counts', () => {
    const config = makeConfig({
      existingDates: ['2025-01-15'],
    })

    const result = dryRun(config)

    expect(result.conflictCount).toBe(1)
  })

  it('preview reports valid/invalid/conflict counts together', () => {
    const config = makeConfig({
      rows: [
        { date: '2025-01-15', restingHR: '62', hrv: '45', sleepDuration: '7.5', activeMinutes: '30' },
        { date: '2025-01-16', restingHR: 'bad', hrv: '45', sleepDuration: '7.5', activeMinutes: '30' },
        { date: '2025-01-17', restingHR: '65', hrv: '50', sleepDuration: '7.0', activeMinutes: '20' },
      ],
      existingDates: ['2025-01-15'],
    })

    const result = dryRun(config)

    expect(result.totalCount).toBe(3)
    expect(result.validCount).toBeGreaterThanOrEqual(1)
    expect(result.invalidCount).toBeGreaterThanOrEqual(1)
    expect(result.conflictCount).toBeGreaterThanOrEqual(1)
  })
})

describe('Import Service - conflict policies', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('replace policy marks conflicting rows for overwrite', () => {
    const config = makeConfig({
      conflictPolicy: 'replace',
      existingDates: ['2025-01-15'],
    })

    const result = dryRun(config)

    const conflictRow = result.rows.find((r) => r.date === '2025-01-15')
    expect(conflictRow).toBeDefined()
    expect(conflictRow!.conflictAction).toBe('replace')
  })

  it('skip policy marks conflicting rows to be skipped', () => {
    const config = makeConfig({
      conflictPolicy: 'skip',
      existingDates: ['2025-01-15'],
    })

    const result = dryRun(config)

    const conflictRow = result.rows.find((r) => r.date === '2025-01-15')
    expect(conflictRow).toBeDefined()
    expect(conflictRow!.conflictAction).toBe('skip')
  })

  it('merge policy marks conflicting rows for merge', () => {
    const config = makeConfig({
      conflictPolicy: 'merge',
      existingDates: ['2025-01-15'],
    })

    const result = dryRun(config)

    const conflictRow = result.rows.find((r) => r.date === '2025-01-15')
    expect(conflictRow).toBeDefined()
    expect(conflictRow!.conflictAction).toBe('merge')
  })
})

describe('Import Service - commitImport', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('returns commit result with counts of persisted rows', () => {
    const config = makeConfig()
    const preview = dryRun(config)

    const commitResult = commitImport(preview)

    expect(commitResult.committedCount).toBe(2)
    expect(commitResult.skippedCount).toBe(0)
  })

  it('skips invalid rows during commit', () => {
    const config = makeConfig({
      rows: [
        { date: '2025-01-15', restingHR: '62', hrv: '45', sleepDuration: '7.5', activeMinutes: '30' },
        { date: '', restingHR: 'bad', hrv: '45', sleepDuration: '7.5', activeMinutes: '30' },
      ],
    })
    const preview = dryRun(config)

    const commitResult = commitImport(preview)

    expect(commitResult.committedCount).toBe(1)
    expect(commitResult.skippedCount).toBe(1)
  })

  it('respects skip conflict policy - does not commit conflicting rows', () => {
    const config = makeConfig({
      conflictPolicy: 'skip',
      existingDates: ['2025-01-15'],
    })
    const preview = dryRun(config)

    const commitResult = commitImport(preview)

    expect(commitResult.skippedCount).toBe(1)
    expect(commitResult.committedCount).toBe(1)
  })

  it('respects replace conflict policy - commits conflicting rows', () => {
    const config = makeConfig({
      conflictPolicy: 'replace',
      existingDates: ['2025-01-15'],
    })
    const preview = dryRun(config)

    const commitResult = commitImport(preview)

    expect(commitResult.committedCount).toBe(2)
    expect(commitResult.skippedCount).toBe(0)
  })

  it('respects merge conflict policy - commits conflicting rows', () => {
    const config = makeConfig({
      conflictPolicy: 'merge',
      existingDates: ['2025-01-15'],
    })
    const preview = dryRun(config)

    const commitResult = commitImport(preview)

    expect(commitResult.committedCount).toBe(2)
  })
})
