import { describe, it, expect } from 'vitest'
import {
  validateProductivityLog,
  validateFinanceLog,
  validateHealthLog,
  validateMetabolicLog,
  validateDigitalLog,
  validateMindfulnessLog,
  validateReadingLog,
  DOMAIN_TABLE_MAP,
  type ProductivityLog,
  type FinanceLog,
  type HealthLog,
  type MetabolicLog,
  type DigitalLog,
  type MindfulnessLog,
  type ReadingLog,
} from '@/types/data-models'

describe('Data Models - Validation', () => {
  describe('DOMAIN_TABLE_MAP', () => {
    it('maps all 7 domains to table names', () => {
      expect(Object.keys(DOMAIN_TABLE_MAP)).toHaveLength(7)
      expect(DOMAIN_TABLE_MAP.productivity).toBe('productivity_logs')
      expect(DOMAIN_TABLE_MAP.finance).toBe('finance_logs')
      expect(DOMAIN_TABLE_MAP.health).toBe('health_logs')
      expect(DOMAIN_TABLE_MAP.metabolic).toBe('metabolic_logs')
      expect(DOMAIN_TABLE_MAP.digital).toBe('digital_logs')
      expect(DOMAIN_TABLE_MAP.mindfulness).toBe('mindfulness_logs')
      expect(DOMAIN_TABLE_MAP.reading).toBe('reading_logs')
    })
  })

  describe('validateProductivityLog', () => {
    it('accepts valid data', () => {
      const result = validateProductivityLog({
        date: '2024-01-15',
        tasksPlanned: 5,
        tasksCompleted: 3,
        focusRating: 4,
        deepWorkHours: 2.5,
      })
      expect(result.valid).toBe(true)
    })

    it('rejects missing tasksPlanned', () => {
      const result = validateProductivityLog({
        date: '2024-01-15',
        tasksCompleted: 3,
        focusRating: 4,
        deepWorkHours: 2.5,
      })
      expect(result.valid).toBe(false)
      if (!result.valid) {
        expect(result.errors.some((e) => e.field === 'tasksPlanned')).toBe(true)
      }
    })

    it('rejects focusRating > 5', () => {
      const result = validateProductivityLog({
        date: '2024-01-15',
        tasksPlanned: 5,
        tasksCompleted: 3,
        focusRating: 6,
        deepWorkHours: 2.5,
      })
      expect(result.valid).toBe(false)
    })

    it('rejects focusRating < 1', () => {
      const result = validateProductivityLog({
        date: '2024-01-15',
        tasksPlanned: 5,
        tasksCompleted: 3,
        focusRating: 0,
        deepWorkHours: 2.5,
      })
      expect(result.valid).toBe(false)
    })

    it('rejects missing date', () => {
      const result = validateProductivityLog({
        tasksPlanned: 5,
        tasksCompleted: 3,
        focusRating: 4,
        deepWorkHours: 2.5,
      })
      expect(result.valid).toBe(false)
    })

    it('rejects negative deepWorkHours', () => {
      const result = validateProductivityLog({
        date: '2024-01-15',
        tasksPlanned: 5,
        tasksCompleted: 3,
        focusRating: 4,
        deepWorkHours: -1,
      })
      expect(result.valid).toBe(false)
    })
  })

  describe('validateFinanceLog', () => {
    it('accepts valid data', () => {
      const result = validateFinanceLog({
        date: '2024-01-15',
        totalAssets: 100000,
        totalLiabilities: 25000,
      })
      expect(result.valid).toBe(true)
    })

    it('rejects missing totalAssets', () => {
      const result = validateFinanceLog({
        date: '2024-01-15',
        totalLiabilities: 25000,
      })
      expect(result.valid).toBe(false)
    })
  })

  describe('validateHealthLog', () => {
    it('accepts valid data', () => {
      const result = validateHealthLog({
        date: '2024-01-15',
        restingHR: 62,
        hrv: 45,
        sleepDuration: 7.5,
      })
      expect(result.valid).toBe(true)
    })

    it('rejects resting HR out of range (too high)', () => {
      const result = validateHealthLog({
        date: '2024-01-15',
        restingHR: 300,
        hrv: 45,
        sleepDuration: 7.5,
      })
      expect(result.valid).toBe(false)
    })

    it('rejects resting HR out of range (too low)', () => {
      const result = validateHealthLog({
        date: '2024-01-15',
        restingHR: 10,
        hrv: 45,
        sleepDuration: 7.5,
      })
      expect(result.valid).toBe(false)
    })
  })

  describe('validateMetabolicLog', () => {
    it('accepts valid data', () => {
      const result = validateMetabolicLog({
        date: '2024-01-15',
        gutMicrobiomeScore: 78,
        dailyFoodScore: 82,
        fiberIntake: 25,
      })
      expect(result.valid).toBe(true)
    })

    it('rejects negative fiber intake', () => {
      const result = validateMetabolicLog({
        date: '2024-01-15',
        gutMicrobiomeScore: 78,
        dailyFoodScore: 82,
        fiberIntake: -5,
      })
      expect(result.valid).toBe(false)
    })
  })

  describe('validateDigitalLog', () => {
    it('accepts valid data', () => {
      const result = validateDigitalLog({
        date: '2024-01-15',
        totalScreenTime: 180,
        unlocks: 45,
      })
      expect(result.valid).toBe(true)
    })

    it('rejects negative screen time', () => {
      const result = validateDigitalLog({
        date: '2024-01-15',
        totalScreenTime: -10,
        unlocks: 45,
      })
      expect(result.valid).toBe(false)
    })
  })

  describe('validateMindfulnessLog', () => {
    it('accepts valid data', () => {
      const result = validateMindfulnessLog({
        date: '2024-01-15',
        meditationType: 'guided',
        duration: 20,
        qualityRating: 4,
      })
      expect(result.valid).toBe(true)
    })

    it('rejects qualityRating > 5', () => {
      const result = validateMindfulnessLog({
        date: '2024-01-15',
        meditationType: 'guided',
        duration: 20,
        qualityRating: 6,
      })
      expect(result.valid).toBe(false)
    })

    it('rejects missing meditation type', () => {
      const result = validateMindfulnessLog({
        date: '2024-01-15',
        duration: 20,
        qualityRating: 4,
      })
      expect(result.valid).toBe(false)
    })
  })

  describe('validateReadingLog', () => {
    it('accepts valid data', () => {
      const result = validateReadingLog({
        date: '2024-01-15',
        bookTitle: 'Atomic Habits',
        pagesRead: 30,
        highlightsCount: 5,
      })
      expect(result.valid).toBe(true)
    })

    it('rejects empty book title', () => {
      const result = validateReadingLog({
        date: '2024-01-15',
        bookTitle: '',
        pagesRead: 30,
        highlightsCount: 5,
      })
      expect(result.valid).toBe(false)
    })

    it('rejects negative pages read', () => {
      const result = validateReadingLog({
        date: '2024-01-15',
        bookTitle: 'Atomic Habits',
        pagesRead: -5,
        highlightsCount: 5,
      })
      expect(result.valid).toBe(false)
    })
  })
})
