/**
 * Universal data ingestion parser for CSV and JSON sources.
 * Normalizes all source records into a canonical row model (Record<string, string>).
 */

export type ParsedRow = Record<string, string>

export interface ParseDiagnostic {
  row: number
  message: string
}

export interface ParseResult {
  headers: string[]
  rows: ParsedRow[]
  diagnostics: ParseDiagnostic[]
}

export interface CSVParseOptions {
  delimiter?: string
}

// --- CSV Parsing ---

export function parseCSV(content: string, options: CSVParseOptions = {}): ParseResult {
  const delimiter = options.delimiter ?? ','
  const diagnostics: ParseDiagnostic[] = []

  const trimmed = content.trim()
  if (!trimmed) {
    return { headers: [], rows: [], diagnostics }
  }

  const lines = splitCSVLines(trimmed)
  if (lines.length === 0) {
    return { headers: [], rows: [], diagnostics }
  }

  const headers = parseCSVRow(lines[0]!, delimiter)
  const rows: ParsedRow[] = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]!
    if (!line.trim()) continue

    const values = parseCSVRow(line, delimiter)

    if (values.length !== headers.length) {
      diagnostics.push({
        row: i,
        message: `Expected ${headers.length} fields but got ${values.length}`,
      })
      // Still attempt to create a row with available fields
      if (values.length < headers.length) {
        const row: ParsedRow = {}
        for (let j = 0; j < values.length; j++) {
          row[headers[j]!] = values[j]!
        }
        rows.push(row)
        continue
      }
    }

    const row: ParsedRow = {}
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]!] = values[j] ?? ''
    }
    rows.push(row)
  }

  return { headers, rows, diagnostics }
}

function splitCSVLines(content: string): string[] {
  const lines: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < content.length; i++) {
    const ch = content[i]!

    if (ch === '"') {
      inQuotes = !inQuotes
      current += ch
    } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (ch === '\r' && content[i + 1] === '\n') {
        i++ // skip \r\n
      }
      lines.push(current)
      current = ''
    } else {
      current += ch
    }
  }

  if (current) {
    lines.push(current)
  }

  return lines
}

function parseCSVRow(line: string, delimiter: string): string[] {
  const values: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]!

    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          current += '"'
          i++ // skip escaped quote
        } else {
          inQuotes = false
        }
      } else {
        current += ch
      }
    } else {
      if (ch === '"') {
        inQuotes = true
      } else if (ch === delimiter) {
        values.push(current)
        current = ''
      } else {
        current += ch
      }
    }
  }

  values.push(current)
  return values
}

// --- JSON Parsing ---

export function parseJSON(content: string): ParseResult {
  const diagnostics: ParseDiagnostic[] = []

  let parsed: unknown
  try {
    parsed = JSON.parse(content)
  } catch (e) {
    return {
      headers: [],
      rows: [],
      diagnostics: [{ row: 0, message: `Invalid JSON: ${(e as Error).message}` }],
    }
  }

  let records: Record<string, unknown>[]

  if (Array.isArray(parsed)) {
    records = parsed as Record<string, unknown>[]
  } else if (parsed && typeof parsed === 'object') {
    // Try to find a data array in common locations
    const obj = parsed as Record<string, unknown>
    if (Array.isArray(obj.data)) {
      records = obj.data as Record<string, unknown>[]
    } else if (Array.isArray(obj.records)) {
      records = obj.records as Record<string, unknown>[]
    } else if (Array.isArray(obj.entries)) {
      records = obj.entries as Record<string, unknown>[]
    } else {
      return {
        headers: [],
        rows: [],
        diagnostics: [{ row: 0, message: 'JSON does not contain a recognizable array of records' }],
      }
    }
  } else {
    return {
      headers: [],
      rows: [],
      diagnostics: [{ row: 0, message: 'JSON root must be an array or object' }],
    }
  }

  if (records.length === 0) {
    return { headers: [], rows: [], diagnostics }
  }

  // Extract headers from all records (union of all keys)
  const headerSet = new Set<string>()
  for (const record of records) {
    if (record && typeof record === 'object') {
      for (const key of Object.keys(record)) {
        headerSet.add(key)
      }
    }
  }
  const headers = Array.from(headerSet)

  // Normalize all values to strings
  const rows: ParsedRow[] = []
  for (const record of records) {
    if (!record || typeof record !== 'object') continue
    const row: ParsedRow = {}
    for (const key of headers) {
      const val = (record as Record<string, unknown>)[key]
      row[key] = val != null ? String(val) : ''
    }
    rows.push(row)
  }

  return { headers, rows, diagnostics }
}

// --- Format Detection ---

export function detectFormat(content: string): 'csv' | 'json' {
  const trimmed = content.trim()
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    return 'json'
  }
  return 'csv'
}

// --- Row Normalization ---

export function normalizeToRows(rows: ParsedRow[]): ParsedRow[] {
  return rows.map((row) => {
    const normalized: ParsedRow = {}
    for (const [key, value] of Object.entries(row)) {
      normalized[key] = String(value)
    }
    return normalized
  })
}
