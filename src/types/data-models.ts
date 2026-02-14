export interface BaseEntry {
  id: string
  date: string // ISO date string YYYY-MM-DD
  createdAt: number // Unix timestamp ms
  updatedAt: number // Unix timestamp ms
}

export interface ProductivityLog extends BaseEntry {
  tasksPlanned: number
  tasksCompleted: number
  focusRating: number // 1-5
  deepWorkHours: number
  notes?: string
}

export interface FinanceLog extends BaseEntry {
  totalAssets: number
  totalLiabilities: number
  netWorth: number // calculated: totalAssets - totalLiabilities
  categorySpending: Record<string, number>
  notes?: string
}

export interface HealthLog extends BaseEntry {
  restingHR: number
  hrv: number
  sleepDuration: number // hours
  sleepStages: {
    rem: number // hours
    deep: number // hours
    core: number // hours
    awake: number // hours
  }
  activeMinutes: number
  steps?: number
  notes?: string
}

export interface MetabolicLog extends BaseEntry {
  gutMicrobiomeScore: number
  dailyFoodScore: number
  fiberIntake: number // grams
  glucoseResponse?: number
  fatResponse?: number
  meals?: MealEntry[]
  notes?: string
}

export interface MealEntry {
  name: string
  score: number
  time: string // HH:MM
}

export interface DigitalLog extends BaseEntry {
  totalScreenTime: number // minutes
  unlocks: number
  topApps: AppUsage[]
  notes?: string
}

export interface AppUsage {
  name: string
  minutes: number
}

export interface MindfulnessLog extends BaseEntry {
  meditationType: string
  duration: number // minutes
  qualityRating: number // 1-5
  streakCount: number
  notes?: string
}

export interface ReadingLog extends BaseEntry {
  bookTitle: string
  pagesRead: number
  highlightsCount: number
  currentPage?: number
  totalPages?: number
  notes?: string
}

export type DataDomain =
  | 'productivity'
  | 'finance'
  | 'health'
  | 'metabolic'
  | 'digital'
  | 'mindfulness'
  | 'reading'

export type DomainEntry =
  | ProductivityLog
  | FinanceLog
  | HealthLog
  | MetabolicLog
  | DigitalLog
  | MindfulnessLog
  | ReadingLog

export const DOMAIN_TABLE_MAP: Record<DataDomain, string> = {
  productivity: 'productivity_logs',
  finance: 'finance_logs',
  health: 'health_logs',
  metabolic: 'metabolic_logs',
  digital: 'digital_logs',
  mindfulness: 'mindfulness_logs',
  reading: 'reading_logs',
}

export interface ValidationError {
  field: string
  message: string
}

export type ValidationResult =
  | { valid: true }
  | { valid: false; errors: ValidationError[] }

export function validateProductivityLog(
  data: Partial<ProductivityLog>,
): ValidationResult {
  const errors: ValidationError[] = []
  if (data.tasksPlanned == null || data.tasksPlanned < 0)
    errors.push({ field: 'tasksPlanned', message: 'Must be >= 0' })
  if (data.tasksCompleted == null || data.tasksCompleted < 0)
    errors.push({ field: 'tasksCompleted', message: 'Must be >= 0' })
  if (
    data.focusRating == null ||
    data.focusRating < 1 ||
    data.focusRating > 5
  )
    errors.push({ field: 'focusRating', message: 'Must be between 1 and 5' })
  if (data.deepWorkHours == null || data.deepWorkHours < 0)
    errors.push({ field: 'deepWorkHours', message: 'Must be >= 0' })
  if (!data.date)
    errors.push({ field: 'date', message: 'Date is required' })
  return errors.length > 0 ? { valid: false, errors } : { valid: true }
}

export function validateFinanceLog(
  data: Partial<FinanceLog>,
): ValidationResult {
  const errors: ValidationError[] = []
  if (data.totalAssets == null)
    errors.push({ field: 'totalAssets', message: 'Total assets is required' })
  if (data.totalLiabilities == null)
    errors.push({
      field: 'totalLiabilities',
      message: 'Total liabilities is required',
    })
  if (!data.date)
    errors.push({ field: 'date', message: 'Date is required' })
  return errors.length > 0 ? { valid: false, errors } : { valid: true }
}

export function validateHealthLog(
  data: Partial<HealthLog>,
): ValidationResult {
  const errors: ValidationError[] = []
  if (data.restingHR == null || data.restingHR < 20 || data.restingHR > 250)
    errors.push({
      field: 'restingHR',
      message: 'Must be between 20 and 250',
    })
  if (data.hrv == null || data.hrv < 0)
    errors.push({ field: 'hrv', message: 'Must be >= 0' })
  if (data.sleepDuration == null || data.sleepDuration < 0)
    errors.push({ field: 'sleepDuration', message: 'Must be >= 0' })
  if (!data.date)
    errors.push({ field: 'date', message: 'Date is required' })
  return errors.length > 0 ? { valid: false, errors } : { valid: true }
}

export function validateMetabolicLog(
  data: Partial<MetabolicLog>,
): ValidationResult {
  const errors: ValidationError[] = []
  if (data.gutMicrobiomeScore == null)
    errors.push({
      field: 'gutMicrobiomeScore',
      message: 'Gut microbiome score is required',
    })
  if (data.dailyFoodScore == null)
    errors.push({
      field: 'dailyFoodScore',
      message: 'Daily food score is required',
    })
  if (data.fiberIntake == null || data.fiberIntake < 0)
    errors.push({ field: 'fiberIntake', message: 'Must be >= 0' })
  if (!data.date)
    errors.push({ field: 'date', message: 'Date is required' })
  return errors.length > 0 ? { valid: false, errors } : { valid: true }
}

export function validateDigitalLog(
  data: Partial<DigitalLog>,
): ValidationResult {
  const errors: ValidationError[] = []
  if (
    data.totalScreenTime == null ||
    data.totalScreenTime < 0
  )
    errors.push({ field: 'totalScreenTime', message: 'Must be >= 0' })
  if (data.unlocks == null || data.unlocks < 0)
    errors.push({ field: 'unlocks', message: 'Must be >= 0' })
  if (!data.date)
    errors.push({ field: 'date', message: 'Date is required' })
  return errors.length > 0 ? { valid: false, errors } : { valid: true }
}

export function validateMindfulnessLog(
  data: Partial<MindfulnessLog>,
): ValidationResult {
  const errors: ValidationError[] = []
  if (!data.meditationType)
    errors.push({
      field: 'meditationType',
      message: 'Meditation type is required',
    })
  if (data.duration == null || data.duration < 0)
    errors.push({ field: 'duration', message: 'Must be >= 0' })
  if (
    data.qualityRating == null ||
    data.qualityRating < 1 ||
    data.qualityRating > 5
  )
    errors.push({
      field: 'qualityRating',
      message: 'Must be between 1 and 5',
    })
  if (!data.date)
    errors.push({ field: 'date', message: 'Date is required' })
  return errors.length > 0 ? { valid: false, errors } : { valid: true }
}

export function validateReadingLog(
  data: Partial<ReadingLog>,
): ValidationResult {
  const errors: ValidationError[] = []
  if (!data.bookTitle)
    errors.push({ field: 'bookTitle', message: 'Book title is required' })
  if (data.pagesRead == null || data.pagesRead < 0)
    errors.push({ field: 'pagesRead', message: 'Must be >= 0' })
  if (data.highlightsCount == null || data.highlightsCount < 0)
    errors.push({ field: 'highlightsCount', message: 'Must be >= 0' })
  if (!data.date)
    errors.push({ field: 'date', message: 'Date is required' })
  return errors.length > 0 ? { valid: false, errors } : { valid: true }
}

export const VALIDATORS: Record<
  DataDomain,
  (data: Partial<DomainEntry>) => ValidationResult
> = {
  productivity: validateProductivityLog as (
    data: Partial<DomainEntry>,
  ) => ValidationResult,
  finance: validateFinanceLog as (
    data: Partial<DomainEntry>,
  ) => ValidationResult,
  health: validateHealthLog as (
    data: Partial<DomainEntry>,
  ) => ValidationResult,
  metabolic: validateMetabolicLog as (
    data: Partial<DomainEntry>,
  ) => ValidationResult,
  digital: validateDigitalLog as (
    data: Partial<DomainEntry>,
  ) => ValidationResult,
  mindfulness: validateMindfulnessLog as (
    data: Partial<DomainEntry>,
  ) => ValidationResult,
  reading: validateReadingLog as (
    data: Partial<DomainEntry>,
  ) => ValidationResult,
}
