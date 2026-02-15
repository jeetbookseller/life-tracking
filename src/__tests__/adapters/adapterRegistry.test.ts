import { describe, it, expect } from 'vitest'
import {
  getAdapter,
  registerAdapter,
  getAvailableAdapters,
  type Adapter,
  type FieldMapping,
} from '@/adapters/registry'

describe('Adapter Registry', () => {
  it('resolves known Fitbit preset by source name', () => {
    const adapter = getAdapter('fitbit')

    expect(adapter).toBeDefined()
    expect(adapter!.source).toBe('fitbit')
    expect(adapter!.domain).toBe('health')
    expect(adapter!.fieldMappings.length).toBeGreaterThan(0)
  })

  it('resolves known Monarch preset by source name', () => {
    const adapter = getAdapter('monarch')

    expect(adapter).toBeDefined()
    expect(adapter!.source).toBe('monarch')
    expect(adapter!.domain).toBe('finance')
    expect(adapter!.fieldMappings.length).toBeGreaterThan(0)
  })

  it('returns undefined for unknown source', () => {
    const adapter = getAdapter('unknown-source-xyz')

    expect(adapter).toBeUndefined()
  })

  it('lists all available adapters', () => {
    const adapters = getAvailableAdapters()

    expect(adapters.length).toBeGreaterThanOrEqual(2)
    const sources = adapters.map((a) => a.source)
    expect(sources).toContain('fitbit')
    expect(sources).toContain('monarch')
  })

  it('adapter field mappings map external fields to internal schema fields', () => {
    const adapter = getAdapter('fitbit')!

    for (const mapping of adapter.fieldMappings) {
      expect(mapping.externalField).toBeDefined()
      expect(mapping.internalField).toBeDefined()
      expect(typeof mapping.externalField).toBe('string')
      expect(typeof mapping.internalField).toBe('string')
    }
  })

  it('supports registering a custom adapter', () => {
    const customAdapter: Adapter = {
      source: 'custom-test-adapter',
      label: 'Custom Test',
      domain: 'productivity',
      fieldMappings: [
        { externalField: 'task_count', internalField: 'tasksPlanned' },
      ],
    }

    registerAdapter(customAdapter)

    const retrieved = getAdapter('custom-test-adapter')
    expect(retrieved).toBeDefined()
    expect(retrieved!.source).toBe('custom-test-adapter')
  })

  it('adapter can apply field mappings to transform a row', () => {
    const adapter = getAdapter('fitbit')!

    const externalRow: Record<string, string> = {
      Date: '2025-01-15',
      'Resting Heart Rate': '62',
      'Heart Rate Variability': '45',
      'Sleep Duration': '7.5',
      'Minutes Fairly Active': '30',
      'Minutes Very Active': '15',
    }

    const mapped: Record<string, string> = {}
    for (const m of adapter.fieldMappings) {
      if (externalRow[m.externalField] !== undefined) {
        mapped[m.internalField] = externalRow[m.externalField]!
      }
    }

    expect(mapped.date).toBe('2025-01-15')
    expect(mapped.restingHR).toBe('62')
  })

  it('mapping preset can be saved and reused (custom adapter registration)', () => {
    const savedMapping: Adapter = {
      source: 'my-saved-preset',
      label: 'My Custom Source',
      domain: 'health',
      fieldMappings: [
        { externalField: 'bp_systolic', internalField: 'restingHR' },
        { externalField: 'measurement_date', internalField: 'date' },
      ],
    }

    registerAdapter(savedMapping)

    const reloaded = getAdapter('my-saved-preset')
    expect(reloaded).toBeDefined()
    expect(reloaded!.fieldMappings).toHaveLength(2)
  })
})
