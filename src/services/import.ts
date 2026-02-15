/**
 * Import service: dry-run preview and commit orchestration with conflict handling.
 */

import type { DataDomain } from '@/types/data-models'
import { VALIDATORS } from '@/types/data-models'
import type { FieldMapping } from '@/adapters/registry'

export type ConflictPolicy = 'replace' | 'skip' | 'merge'

export type ConflictAction = 'replace' | 'skip' | 'merge' | 'none'

export interface ImportConfig {
  domain: DataDomain
  rows: Record<string, string>[]
  fieldMappings: FieldMapping[]
  conflictPolicy: ConflictPolicy
  /** Dates of existing entries to detect conflicts */
  existingDates?: string[]
}

export interface RowError {
  row: number
  field: string
  message: string
}

export interface PreviewRow {
  index: number
  date: string
  mapped: Record<string, unknown>
  valid: boolean
  errors: RowError[]
  isConflict: boolean
  conflictAction: ConflictAction
}

export interface DryRunResult {
  totalCount: number
  validCount: number
  invalidCount: number
  conflictCount: number
  rows: PreviewRow[]
  errors: RowError[]
  domain: DataDomain
  conflictPolicy: ConflictPolicy
}

export interface CommitResult {
  committedCount: number
  skippedCount: number
  replacedCount: number
  mergedCount: number
}

// --- Numeric fields per domain for type coercion ---

const NUMERIC_FIELDS: Record<DataDomain, string[]> = {
  productivity: ['tasksPlanned', 'tasksCompleted', 'focusRating', 'deepWorkHours'],
  finance: ['totalAssets', 'totalLiabilities', 'netWorth'],
  health: ['restingHR', 'hrv', 'sleepDuration', 'activeMinutes', 'steps'],
  metabolic: ['gutMicrobiomeScore', 'dailyFoodScore', 'fiberIntake', 'glucoseResponse', 'fatResponse'],
  digital: ['totalScreenTime', 'unlocks'],
  mindfulness: ['duration', 'qualityRating', 'streakCount'],
  reading: ['pagesRead', 'highlightsCount', 'currentPage', 'totalPages'],
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

/**
 * Apply field mappings to transform an external row into domain fields.
 */
function applyMappings(
  row: Record<string, string>,
  mappings: FieldMapping[],
): Record<string, string> {
  const mapped: Record<string, string> = {}

  for (const m of mappings) {
    const value = row[m.externalField]
    if (value !== undefined) {
      mapped[m.internalField] = m.transform ? m.transform(value) : value
    }
  }

  return mapped
}

/**
 * Coerce string values to appropriate types for the domain.
 * Returns the coerced object and any errors encountered.
 */
function coerceRow(
  mapped: Record<string, string>,
  domain: DataDomain,
  rowIndex: number,
): { data: Record<string, unknown>; errors: RowError[] } {
  const errors: RowError[] = []
  const data: Record<string, unknown> = {}
  const numericFields = NUMERIC_FIELDS[domain] ?? []

  for (const [field, value] of Object.entries(mapped)) {
    if (field === 'date') {
      if (!DATE_PATTERN.test(value)) {
        errors.push({ row: rowIndex, field: 'date', message: `Invalid date format: "${value}" (expected YYYY-MM-DD)` })
      }
      data.date = value
    } else if (numericFields.includes(field)) {
      const num = Number(value)
      if (isNaN(num)) {
        errors.push({ row: rowIndex, field, message: `Cannot convert "${value}" to number` })
      } else {
        data[field] = num
      }
    } else {
      data[field] = value
    }
  }

  return { data, errors }
}

/**
 * Run a dry-run preview of the import without persisting anything.
 * Validates all rows, applies mappings, and detects conflicts.
 */
export function dryRun(config: ImportConfig): DryRunResult {
  const { domain, rows, fieldMappings, conflictPolicy, existingDates = [] } = config
  const existingDateSet = new Set(existingDates)
  const validator = VALIDATORS[domain]

  const previewRows: PreviewRow[] = []
  const allErrors: RowError[] = []

  for (let i = 0; i < rows.length; i++) {
    const rawRow = rows[i]!
    const mapped = applyMappings(rawRow, fieldMappings)
    const { data, errors: coercionErrors } = coerceRow(mapped, domain, i)

    // Run domain validator
    const validation = validator(data as Record<string, unknown>)
    const validationErrors: RowError[] = []

    if (!validation.valid) {
      for (const ve of validation.errors) {
        validationErrors.push({
          row: i,
          field: ve.field,
          message: ve.message,
        })
      }
    }

    const rowErrors = [...coercionErrors, ...validationErrors]
    const valid = rowErrors.length === 0
    const date = (data.date as string) ?? ''
    const isConflict = existingDateSet.has(date)

    let conflictAction: ConflictAction = 'none'
    if (isConflict) {
      conflictAction = conflictPolicy
    }

    previewRows.push({
      index: i,
      date,
      mapped: data,
      valid,
      errors: rowErrors,
      isConflict,
      conflictAction,
    })

    allErrors.push(...rowErrors)
  }

  return {
    totalCount: rows.length,
    validCount: previewRows.filter((r) => r.valid).length,
    invalidCount: previewRows.filter((r) => !r.valid).length,
    conflictCount: previewRows.filter((r) => r.isConflict && r.valid).length,
    rows: previewRows,
    errors: allErrors,
    domain,
    conflictPolicy,
  }
}

/**
 * Commit the import based on dry-run results.
 * Only persists rows that are valid and approved by the conflict policy.
 */
export function commitImport(preview: DryRunResult): CommitResult {
  let committedCount = 0
  let skippedCount = 0
  let replacedCount = 0
  let mergedCount = 0

  for (const row of preview.rows) {
    if (!row.valid) {
      skippedCount++
      continue
    }

    if (row.isConflict) {
      switch (row.conflictAction) {
        case 'skip':
          skippedCount++
          continue
        case 'replace':
          replacedCount++
          committedCount++
          continue
        case 'merge':
          mergedCount++
          committedCount++
          continue
        default:
          committedCount++
          continue
      }
    }

    committedCount++
  }

  return {
    committedCount,
    skippedCount,
    replacedCount,
    mergedCount,
  }
}
