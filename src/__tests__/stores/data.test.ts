import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useDataStore } from '@/stores/data'
import { useAuthStore } from '@/stores/auth'
import { db } from '@/db/schema'
import type {
  ProductivityLog,
  FinanceLog,
  HealthLog,
  MetabolicLog,
  DigitalLog,
  MindfulnessLog,
  ReadingLog,
  DataDomain,
} from '@/types/data-models'

async function setupStores() {
  setActivePinia(createPinia())
  localStorage.clear()
  // Clear all tables
  for (const table of db.tables) {
    await table.clear()
  }
  const auth = useAuthStore()
  await auth.setPassword('test-password')
  const data = useDataStore()
  return { auth, data }
}

describe('Data Store', () => {
  describe('Productivity CRUD', () => {
    let data: ReturnType<typeof useDataStore>

    beforeEach(async () => {
      const stores = await setupStores()
      data = stores.data
    })

    it('creates a productivity entry', async () => {
      const id = await data.addEntry('productivity', {
        date: '2024-01-15',
        tasksPlanned: 5,
        tasksCompleted: 3,
        focusRating: 4,
        deepWorkHours: 2.5,
      })

      expect(id).toBeDefined()
      expect(typeof id).toBe('string')
    })

    it('reads a productivity entry back', async () => {
      const id = await data.addEntry('productivity', {
        date: '2024-01-15',
        tasksPlanned: 5,
        tasksCompleted: 3,
        focusRating: 4,
        deepWorkHours: 2.5,
      })

      const entry = await data.getEntry<ProductivityLog>('productivity', id)
      expect(entry).toBeDefined()
      expect(entry!.date).toBe('2024-01-15')
      expect(entry!.tasksPlanned).toBe(5)
      expect(entry!.tasksCompleted).toBe(3)
      expect(entry!.focusRating).toBe(4)
      expect(entry!.deepWorkHours).toBe(2.5)
    })

    it('auto-populates id, createdAt, updatedAt', async () => {
      const id = await data.addEntry('productivity', {
        date: '2024-01-15',
        tasksPlanned: 5,
        tasksCompleted: 3,
        focusRating: 4,
        deepWorkHours: 2.5,
      })

      const entry = await data.getEntry<ProductivityLog>('productivity', id)
      expect(entry!.id).toBe(id)
      expect(entry!.createdAt).toBeGreaterThan(0)
      expect(entry!.updatedAt).toBeGreaterThan(0)
    })

    it('updates a productivity entry', async () => {
      const id = await data.addEntry('productivity', {
        date: '2024-01-15',
        tasksPlanned: 5,
        tasksCompleted: 3,
        focusRating: 4,
        deepWorkHours: 2.5,
      })

      await data.updateEntry('productivity', id, { tasksCompleted: 5 })

      const entry = await data.getEntry<ProductivityLog>('productivity', id)
      expect(entry!.tasksCompleted).toBe(5)
      expect(entry!.tasksPlanned).toBe(5) // unchanged
    })

    it('deletes a productivity entry', async () => {
      const id = await data.addEntry('productivity', {
        date: '2024-01-15',
        tasksPlanned: 5,
        tasksCompleted: 3,
        focusRating: 4,
        deepWorkHours: 2.5,
      })

      await data.deleteEntry('productivity', id)
      const entry = await data.getEntry<ProductivityLog>('productivity', id)
      expect(entry).toBeUndefined()
    })

    it('gets all entries for a domain', async () => {
      await data.addEntry('productivity', {
        date: '2024-01-15',
        tasksPlanned: 5,
        tasksCompleted: 3,
        focusRating: 4,
        deepWorkHours: 2.5,
      })

      await data.addEntry('productivity', {
        date: '2024-01-16',
        tasksPlanned: 6,
        tasksCompleted: 4,
        focusRating: 3,
        deepWorkHours: 3,
      })

      const entries =
        await data.getAllEntries<ProductivityLog>('productivity')
      expect(entries).toHaveLength(2)
    })
  })

  describe('Finance CRUD', () => {
    let data: ReturnType<typeof useDataStore>

    beforeEach(async () => {
      const stores = await setupStores()
      data = stores.data
    })

    it('creates and reads a finance entry', async () => {
      const id = await data.addEntry('finance', {
        date: '2024-01-15',
        totalAssets: 100000,
        totalLiabilities: 25000,
        netWorth: 75000,
        categorySpending: { food: 500, transport: 200 },
      })

      const entry = await data.getEntry<FinanceLog>('finance', id)
      expect(entry!.totalAssets).toBe(100000)
      expect(entry!.netWorth).toBe(75000)
      expect(entry!.categorySpending).toEqual({
        food: 500,
        transport: 200,
      })
    })
  })

  describe('Health CRUD', () => {
    let data: ReturnType<typeof useDataStore>

    beforeEach(async () => {
      const stores = await setupStores()
      data = stores.data
    })

    it('creates and reads a health entry', async () => {
      const id = await data.addEntry('health', {
        date: '2024-01-15',
        restingHR: 62,
        hrv: 45,
        sleepDuration: 7.5,
        sleepStages: { rem: 1.5, deep: 1.2, core: 4.0, awake: 0.8 },
        activeMinutes: 30,
      })

      const entry = await data.getEntry<HealthLog>('health', id)
      expect(entry!.restingHR).toBe(62)
      expect(entry!.sleepStages.rem).toBe(1.5)
    })
  })

  describe('Metabolic CRUD', () => {
    let data: ReturnType<typeof useDataStore>

    beforeEach(async () => {
      const stores = await setupStores()
      data = stores.data
    })

    it('creates and reads a metabolic entry', async () => {
      const id = await data.addEntry('metabolic', {
        date: '2024-01-15',
        gutMicrobiomeScore: 78,
        dailyFoodScore: 82,
        fiberIntake: 25,
      })

      const entry = await data.getEntry<MetabolicLog>('metabolic', id)
      expect(entry!.gutMicrobiomeScore).toBe(78)
      expect(entry!.dailyFoodScore).toBe(82)
    })
  })

  describe('Digital CRUD', () => {
    let data: ReturnType<typeof useDataStore>

    beforeEach(async () => {
      const stores = await setupStores()
      data = stores.data
    })

    it('creates and reads a digital entry', async () => {
      const id = await data.addEntry('digital', {
        date: '2024-01-15',
        totalScreenTime: 180,
        unlocks: 45,
        topApps: [
          { name: 'Twitter', minutes: 60 },
          { name: 'YouTube', minutes: 45 },
        ],
      })

      const entry = await data.getEntry<DigitalLog>('digital', id)
      expect(entry!.totalScreenTime).toBe(180)
      expect(entry!.topApps).toHaveLength(2)
    })
  })

  describe('Mindfulness CRUD', () => {
    let data: ReturnType<typeof useDataStore>

    beforeEach(async () => {
      const stores = await setupStores()
      data = stores.data
    })

    it('creates and reads a mindfulness entry', async () => {
      const id = await data.addEntry('mindfulness', {
        date: '2024-01-15',
        meditationType: 'guided',
        duration: 20,
        qualityRating: 4,
        streakCount: 5,
      })

      const entry = await data.getEntry<MindfulnessLog>('mindfulness', id)
      expect(entry!.meditationType).toBe('guided')
      expect(entry!.duration).toBe(20)
    })
  })

  describe('Reading CRUD', () => {
    let data: ReturnType<typeof useDataStore>

    beforeEach(async () => {
      const stores = await setupStores()
      data = stores.data
    })

    it('creates and reads a reading entry', async () => {
      const id = await data.addEntry('reading', {
        date: '2024-01-15',
        bookTitle: 'Atomic Habits',
        pagesRead: 30,
        highlightsCount: 5,
      })

      const entry = await data.getEntry<ReadingLog>('reading', id)
      expect(entry!.bookTitle).toBe('Atomic Habits')
      expect(entry!.pagesRead).toBe(30)
    })
  })

  describe('Validation', () => {
    let data: ReturnType<typeof useDataStore>

    beforeEach(async () => {
      const stores = await setupStores()
      data = stores.data
    })

    it('rejects productivity entry with missing required fields', async () => {
      await expect(
        data.addEntry('productivity', {
          date: '2024-01-15',
        } as any),
      ).rejects.toThrow('Validation failed')
    })

    it('rejects productivity entry with focus_rating > 5', async () => {
      await expect(
        data.addEntry('productivity', {
          date: '2024-01-15',
          tasksPlanned: 5,
          tasksCompleted: 3,
          focusRating: 6,
          deepWorkHours: 2,
        }),
      ).rejects.toThrow('Validation failed')
    })

    it('rejects productivity entry with focus_rating < 1', async () => {
      await expect(
        data.addEntry('productivity', {
          date: '2024-01-15',
          tasksPlanned: 5,
          tasksCompleted: 3,
          focusRating: 0,
          deepWorkHours: 2,
        }),
      ).rejects.toThrow('Validation failed')
    })

    it('rejects mindfulness entry with quality_rating > 5', async () => {
      await expect(
        data.addEntry('mindfulness', {
          date: '2024-01-15',
          meditationType: 'guided',
          duration: 20,
          qualityRating: 6,
          streakCount: 1,
        }),
      ).rejects.toThrow('Validation failed')
    })

    it('rejects entry with missing date', async () => {
      await expect(
        data.addEntry('productivity', {
          tasksPlanned: 5,
          tasksCompleted: 3,
          focusRating: 4,
          deepWorkHours: 2,
        } as any),
      ).rejects.toThrow('Validation failed')
    })

    it('rejects health entry with out-of-range resting HR', async () => {
      await expect(
        data.addEntry('health', {
          date: '2024-01-15',
          restingHR: 300,
          hrv: 45,
          sleepDuration: 7,
          sleepStages: { rem: 1, deep: 1, core: 4, awake: 1 },
          activeMinutes: 30,
        }),
      ).rejects.toThrow('Validation failed')
    })

    it('rejects reading entry with missing book title', async () => {
      await expect(
        data.addEntry('reading', {
          date: '2024-01-15',
          bookTitle: '',
          pagesRead: 30,
          highlightsCount: 5,
        }),
      ).rejects.toThrow('Validation failed')
    })
  })

  describe('Date range queries', () => {
    let data: ReturnType<typeof useDataStore>

    beforeEach(async () => {
      const stores = await setupStores()
      data = stores.data

      await data.addEntry('productivity', {
        date: '2024-01-10',
        tasksPlanned: 5,
        tasksCompleted: 3,
        focusRating: 4,
        deepWorkHours: 2,
      })
      await data.addEntry('productivity', {
        date: '2024-01-15',
        tasksPlanned: 6,
        tasksCompleted: 5,
        focusRating: 5,
        deepWorkHours: 3,
      })
      await data.addEntry('productivity', {
        date: '2024-01-20',
        tasksPlanned: 4,
        tasksCompleted: 4,
        focusRating: 3,
        deepWorkHours: 1.5,
      })
    })

    it('returns entries within date range', async () => {
      const entries = await data.getEntriesByDateRange<ProductivityLog>(
        'productivity',
        '2024-01-12',
        '2024-01-18',
      )
      expect(entries).toHaveLength(1)
      expect(entries[0].date).toBe('2024-01-15')
    })

    it('returns all entries when range covers all dates', async () => {
      const entries = await data.getEntriesByDateRange<ProductivityLog>(
        'productivity',
        '2024-01-01',
        '2024-01-31',
      )
      expect(entries).toHaveLength(3)
    })
  })

  describe('Encryption verification', () => {
    it('stores encrypted data in IndexedDB (not plaintext)', async () => {
      const { data } = await setupStores()

      await data.addEntry('productivity', {
        date: '2024-01-15',
        tasksPlanned: 5,
        tasksCompleted: 3,
        focusRating: 4,
        deepWorkHours: 2.5,
      })

      // Read raw record from DB
      const records = await db.productivity_logs.toArray()
      expect(records).toHaveLength(1)

      const rawRecord = records[0]
      // The ciphertext should not contain plaintext values
      expect(rawRecord.ciphertext).not.toContain('tasksPlanned')
      expect(rawRecord.ciphertext).not.toContain('focusRating')
      expect(rawRecord.iv).toBeDefined()
    })

    it('cannot decrypt data with wrong password', async () => {
      const { data } = await setupStores()

      const id = await data.addEntry('productivity', {
        date: '2024-01-15',
        tasksPlanned: 5,
        tasksCompleted: 3,
        focusRating: 4,
        deepWorkHours: 2.5,
      })

      // Switch to a new auth store with different password
      setActivePinia(createPinia())
      const wrongAuth = useAuthStore()
      await wrongAuth.setPassword('wrong-password')
      const wrongData = useDataStore()

      // This should fail because the key is different
      await expect(
        wrongData.getEntry('productivity', id),
      ).rejects.toThrow()
    })
  })
})
