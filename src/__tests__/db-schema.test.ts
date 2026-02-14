import { describe, it, expect, beforeEach } from 'vitest'
import { LifeTrackingDB, TABLE_NAMES } from '@/db/schema'

describe('Database Schema', () => {
  let testDb: LifeTrackingDB

  beforeEach(async () => {
    // Use a unique name per test to avoid conflicts
    testDb = new LifeTrackingDB()
    testDb.close()
    await testDb.delete()
    testDb = new LifeTrackingDB()
    await testDb.open()
  })

  it('creates a database instance', () => {
    expect(testDb).toBeDefined()
    expect(testDb.name).toBe('life-tracking-db')
  })

  it('has all 7 domain tables', () => {
    const tableNames = testDb.tables.map((t) => t.name)
    for (const name of TABLE_NAMES) {
      expect(tableNames).toContain(name)
    }
  })

  it('has productivity_logs table', () => {
    expect(testDb.table('productivity_logs')).toBeDefined()
  })

  it('has finance_logs table', () => {
    expect(testDb.table('finance_logs')).toBeDefined()
  })

  it('has health_logs table', () => {
    expect(testDb.table('health_logs')).toBeDefined()
  })

  it('has metabolic_logs table', () => {
    expect(testDb.table('metabolic_logs')).toBeDefined()
  })

  it('has digital_logs table', () => {
    expect(testDb.table('digital_logs')).toBeDefined()
  })

  it('has mindfulness_logs table', () => {
    expect(testDb.table('mindfulness_logs')).toBeDefined()
  })

  it('has reading_logs table', () => {
    expect(testDb.table('reading_logs')).toBeDefined()
  })

  it('can add and retrieve a record from each table', async () => {
    for (const tableName of TABLE_NAMES) {
      const record = {
        id: `test-${tableName}`,
        date: '2024-01-15',
        ciphertext: 'encrypted-data',
        iv: 'test-iv',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      await testDb.table(tableName).add(record)
      const retrieved = await testDb.table(tableName).get(record.id)
      expect(retrieved).toBeDefined()
      expect(retrieved?.id).toBe(record.id)
      expect(retrieved?.date).toBe('2024-01-15')
    }
  })

  it('supports querying by date index', async () => {
    const table = testDb.table('productivity_logs')

    await table.bulkAdd([
      {
        id: 'entry-1',
        date: '2024-01-10',
        ciphertext: 'data1',
        iv: 'iv1',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: 'entry-2',
        date: '2024-01-15',
        ciphertext: 'data2',
        iv: 'iv2',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: 'entry-3',
        date: '2024-01-20',
        ciphertext: 'data3',
        iv: 'iv3',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ])

    const results = await table
      .where('date')
      .between('2024-01-11', '2024-01-19', true, true)
      .toArray()

    expect(results).toHaveLength(1)
    expect(results[0].id).toBe('entry-2')
  })
})
