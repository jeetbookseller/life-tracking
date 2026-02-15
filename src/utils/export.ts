import type {
  DataDomain,
  DomainEntry,
  ProductivityLog,
  FinanceLog,
  HealthLog,
  MetabolicLog,
  DigitalLog,
  MindfulnessLog,
  ReadingLog,
} from '@/types/data-models'
import type { Anomaly } from '@/utils/trends'

export type ExportFormat = 'markdown-kv' | 'json' | 'csv'

export type ExportTemplate = 'weekly' | 'monthly' | 'correlation' | 'custom'

export interface ExportOptions {
  domains: DataDomain[]
  startDate: string
  endDate: string
  format: ExportFormat
  template?: ExportTemplate
}

export interface ExportData {
  entries: Partial<Record<DataDomain, DomainEntry[]>>
  anomalies: Anomaly[]
}

const DOMAIN_LABELS: Record<DataDomain, string> = {
  productivity: 'Productivity',
  finance: 'Finance',
  health: 'Health',
  metabolic: 'Metabolic',
  digital: 'Digital Wellbeing',
  mindfulness: 'Mindfulness',
  reading: 'Reading',
}

const DOMAIN_UNITS: Record<DataDomain, Record<string, string>> = {
  productivity: {
    tasksPlanned: 'count',
    tasksCompleted: 'count',
    focusRating: '1-5 scale',
    deepWorkHours: 'hours',
  },
  finance: {
    totalAssets: 'currency',
    totalLiabilities: 'currency',
    netWorth: 'currency',
  },
  health: {
    restingHR: 'bpm',
    hrv: 'ms',
    sleepDuration: 'hours',
    activeMinutes: 'minutes',
  },
  metabolic: {
    gutMicrobiomeScore: 'score',
    dailyFoodScore: 'score',
    fiberIntake: 'grams',
  },
  digital: {
    totalScreenTime: 'minutes',
    unlocks: 'count',
  },
  mindfulness: {
    duration: 'minutes',
    qualityRating: '1-5 scale',
  },
  reading: {
    pagesRead: 'pages',
    highlightsCount: 'count',
  },
}

// --- Entry to key-value converters ---

function productivityToKV(entry: ProductivityLog): Record<string, number | string> {
  return {
    'Tasks Planned': entry.tasksPlanned,
    'Tasks Completed': entry.tasksCompleted,
    'Focus Rating': entry.focusRating,
    'Deep Work Hours': entry.deepWorkHours,
  }
}

function financeToKV(entry: FinanceLog): Record<string, number | string> {
  return {
    'Total Assets': entry.totalAssets,
    'Total Liabilities': entry.totalLiabilities,
    'Net Worth': entry.netWorth,
  }
}

function healthToKV(entry: HealthLog): Record<string, number | string> {
  return {
    'Resting HR': entry.restingHR,
    HRV: entry.hrv,
    'Sleep Duration': entry.sleepDuration,
    'Active Minutes': entry.activeMinutes,
  }
}

function metabolicToKV(entry: MetabolicLog): Record<string, number | string> {
  return {
    'Gut Microbiome Score': entry.gutMicrobiomeScore,
    'Daily Food Score': entry.dailyFoodScore,
    'Fiber Intake': entry.fiberIntake,
  }
}

function digitalToKV(entry: DigitalLog): Record<string, number | string> {
  return {
    'Screen Time': entry.totalScreenTime,
    Unlocks: entry.unlocks,
  }
}

function mindfulnessToKV(entry: MindfulnessLog): Record<string, number | string> {
  return {
    'Meditation Type': entry.meditationType,
    Duration: entry.duration,
    'Quality Rating': entry.qualityRating,
  }
}

function readingToKV(entry: ReadingLog): Record<string, number | string> {
  return {
    'Book Title': entry.bookTitle,
    'Pages Read': entry.pagesRead,
    Highlights: entry.highlightsCount,
  }
}

const ENTRY_TO_KV: Record<DataDomain, (entry: DomainEntry) => Record<string, number | string>> = {
  productivity: (e) => productivityToKV(e as ProductivityLog),
  finance: (e) => financeToKV(e as FinanceLog),
  health: (e) => healthToKV(e as HealthLog),
  metabolic: (e) => metabolicToKV(e as MetabolicLog),
  digital: (e) => digitalToKV(e as DigitalLog),
  mindfulness: (e) => mindfulnessToKV(e as MindfulnessLog),
  reading: (e) => readingToKV(e as ReadingLog),
}

// --- CSV field extractors ---

function entryToFlatRecord(
  domain: DataDomain,
  entry: DomainEntry,
): Record<string, string | number> {
  const kv = ENTRY_TO_KV[domain](entry)
  return { date: entry.date, domain, ...kv }
}

// --- Filtering helper ---

function filterEntries(
  entries: DomainEntry[],
  startDate: string,
  endDate: string,
): DomainEntry[] {
  return entries.filter((e) => e.date >= startDate && e.date <= endDate)
}

// --- Markdown-KV export ---

export function exportMarkdownKV(data: ExportData, options: ExportOptions): string {
  const lines: string[] = []

  // Metadata header
  lines.push('# Life Tracking Data Export')
  lines.push('')
  lines.push(`**Date Range:** ${options.startDate} to ${options.endDate}`)
  lines.push(
    `**Domains:** ${options.domains.map((d) => DOMAIN_LABELS[d]).join(', ')}`,
  )
  lines.push('')

  // Units reference
  lines.push('## Units')
  for (const domain of options.domains) {
    const units = DOMAIN_UNITS[domain]
    if (units) {
      lines.push(`- **${DOMAIN_LABELS[domain]}**: ${Object.entries(units).map(([k, v]) => `${k} (${v})`).join(', ')}`)
    }
  }
  lines.push('')

  // Anomalies section
  const anomalyMap = new Map<string, Anomaly[]>()
  for (const a of data.anomalies) {
    if (a.date >= options.startDate && a.date <= options.endDate) {
      const key = `${a.date}:${a.metric}`
      if (!anomalyMap.has(key)) anomalyMap.set(key, [])
      anomalyMap.get(key)!.push(a)
    }
  }

  if (anomalyMap.size > 0) {
    lines.push('## Anomalies')
    for (const [, anomalies] of anomalyMap) {
      for (const a of anomalies) {
        lines.push(
          `- [ANOMALY] ${a.date}: ${a.metric} = ${a.value} (mean: ${a.mean.toFixed(1)}, ${a.direction})`,
        )
      }
    }
    lines.push('')
  }

  // Data by domain
  let hasData = false

  for (const domain of options.domains) {
    const domainEntries = data.entries[domain]
    if (!domainEntries || domainEntries.length === 0) continue

    const filtered = filterEntries(domainEntries, options.startDate, options.endDate)
    if (filtered.length === 0) continue

    hasData = true
    lines.push(`## ${DOMAIN_LABELS[domain]}`)
    lines.push('')

    // Sort by date
    const sorted = [...filtered].sort((a, b) => a.date.localeCompare(b.date))

    for (const entry of sorted) {
      const kv = ENTRY_TO_KV[domain](entry)
      const kvStr = Object.entries(kv)
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ')

      // Check if this date has anomalies
      const dateAnomalies = data.anomalies.filter(
        (a) => a.date === entry.date,
      )
      const anomalyMarker = dateAnomalies.length > 0 ? ' [ANOMALY]' : ''

      lines.push(`${entry.date}:${anomalyMarker} {${kvStr}}`)
    }
    lines.push('')
  }

  if (!hasData) {
    lines.push('No data available for the selected domains and date range.')
    lines.push('')
  }

  return lines.join('\n')
}

// --- JSON export ---

export function exportJSON(data: ExportData, options: ExportOptions): string {
  const exportObj: Record<string, unknown> = {
    metadata: {
      exportedAt: new Date().toISOString(),
      startDate: options.startDate,
      endDate: options.endDate,
      domains: options.domains,
    },
    data: {} as Record<string, DomainEntry[]>,
    anomalies: data.anomalies.filter(
      (a) => a.date >= options.startDate && a.date <= options.endDate,
    ),
  }

  const domainData: Record<string, DomainEntry[]> = {}
  for (const domain of options.domains) {
    const entries = data.entries[domain]
    if (entries) {
      domainData[domain] = filterEntries(entries, options.startDate, options.endDate)
    } else {
      domainData[domain] = []
    }
  }
  exportObj.data = domainData

  return JSON.stringify(exportObj, null, 2)
}

// --- CSV export ---

export function exportCSV(data: ExportData, options: ExportOptions): string {
  // Collect all rows
  const rows: Record<string, string | number>[] = []

  for (const domain of options.domains) {
    const entries = data.entries[domain]
    if (!entries) continue

    const filtered = filterEntries(entries, options.startDate, options.endDate)
    for (const entry of filtered) {
      rows.push(entryToFlatRecord(domain, entry))
    }
  }

  // Gather all unique headers
  const headerSet = new Set<string>()
  headerSet.add('date')
  headerSet.add('domain')
  for (const row of rows) {
    for (const key of Object.keys(row)) {
      headerSet.add(key)
    }
  }
  const headers = Array.from(headerSet)

  // Build CSV
  const lines: string[] = []
  lines.push(headers.join(','))

  for (const row of rows) {
    const vals = headers.map((h) => {
      const val = row[h]
      if (val == null) return ''
      const str = String(val)
      // Escape values containing commas or quotes
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    })
    lines.push(vals.join(','))
  }

  return lines.join('\n')
}

// --- Export templates ---

export const EXPORT_TEMPLATES: Array<{
  id: ExportTemplate
  label: string
  description: string
}> = [
  {
    id: 'weekly',
    label: 'Weekly Summary',
    description: 'Last 7 days of data across all selected domains',
  },
  {
    id: 'monthly',
    label: 'Monthly Review',
    description: 'Last 30 days of data with trend indicators',
  },
  {
    id: 'correlation',
    label: 'Correlation Analysis',
    description: 'Data formatted for cross-domain pattern detection',
  },
  {
    id: 'custom',
    label: 'Custom Query',
    description: 'Choose your own date range and domains',
  },
]

// --- Prompt suggestions ---

export const PROMPT_SUGGESTIONS: Array<{
  title: string
  prompt: string
  description: string
}> = [
  {
    title: 'Meditation & Productivity Correlation',
    prompt:
      'Analyze the correlation between meditation duration/quality and productivity metrics (focus rating, deep work hours). Identify any patterns where meditation sessions precede better or worse focus days.',
    description: 'Find links between mindfulness practice and work output',
  },
  {
    title: 'Sleep Quality Impact',
    prompt:
      'Examine how sleep duration and sleep stages (REM, deep, core) affect next-day productivity and exercise performance. Identify optimal sleep patterns.',
    description: 'Understand how sleep affects your day',
  },
  {
    title: 'Diet & Energy Patterns',
    prompt:
      'Analyze the relationship between metabolic scores (food score, fiber intake, glucose response) and health metrics (HRV, active minutes). What dietary patterns correlate with better physical performance?',
    description: 'Connect nutrition to physical health',
  },
  {
    title: 'Screen Time Effects',
    prompt:
      'Investigate how daily screen time and phone unlocks correlate with sleep quality, meditation consistency, and reading habits. Identify threshold effects.',
    description: 'Measure the impact of digital habits',
  },
  {
    title: 'Schedule Optimization',
    prompt:
      'Based on the data, suggest optimal daily schedule adjustments. When should I meditate, exercise, do deep work, and read for maximum effectiveness? Use the focus patterns and energy levels from the data.',
    description: 'Get personalized schedule recommendations',
  },
  {
    title: 'Weekly Trend Summary',
    prompt:
      'Provide a concise weekly summary. What improved this week vs last? What declined? What are the top 3 areas needing attention? Highlight any anomalies.',
    description: 'Quick weekly health check on all domains',
  },
]

// --- Utility for template date ranges ---

export function getTemplateDateRange(
  template: ExportTemplate,
): { startDate: string; endDate: string } {
  const now = new Date()
  const endDate = now.toISOString().split('T')[0]!
  const start = new Date(now)

  switch (template) {
    case 'weekly':
      start.setDate(start.getDate() - 7)
      break
    case 'monthly':
      start.setDate(start.getDate() - 30)
      break
    case 'correlation':
      start.setDate(start.getDate() - 90)
      break
    case 'custom':
    default:
      start.setDate(start.getDate() - 7)
      break
  }

  return { startDate: start.toISOString().split('T')[0]!, endDate }
}
