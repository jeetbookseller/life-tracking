/**
 * Adapter registry for mapping external data sources to internal schema fields.
 */

import type { DataDomain } from '@/types/data-models'
import { fitbitAdapter } from './presets/fitbitAdapter'
import { monarchAdapter } from './presets/monarchAdapter'

export interface FieldMapping {
  externalField: string
  internalField: string
  transform?: (value: string) => string
}

export interface Adapter {
  source: string
  label: string
  domain: DataDomain
  fieldMappings: FieldMapping[]
}

// Internal registry map
const adapterRegistry = new Map<string, Adapter>()

// Register built-in presets
adapterRegistry.set('fitbit', fitbitAdapter)
adapterRegistry.set('monarch', monarchAdapter)

/**
 * Look up an adapter by source name.
 */
export function getAdapter(source: string): Adapter | undefined {
  return adapterRegistry.get(source)
}

/**
 * Register a new adapter (or overwrite an existing one).
 */
export function registerAdapter(adapter: Adapter): void {
  adapterRegistry.set(adapter.source, adapter)
}

/**
 * List all registered adapters.
 */
export function getAvailableAdapters(): Adapter[] {
  return Array.from(adapterRegistry.values())
}

/**
 * Apply an adapter's field mappings to transform an external row
 * into internal schema fields.
 */
export function applyAdapter(
  adapter: Adapter,
  externalRow: Record<string, string>,
): Record<string, string> {
  const mapped: Record<string, string> = {}

  for (const mapping of adapter.fieldMappings) {
    const value = externalRow[mapping.externalField]
    if (value !== undefined) {
      mapped[mapping.internalField] = mapping.transform
        ? mapping.transform(value)
        : value
    }
  }

  return mapped
}
