import Dexie, { type EntityTable } from 'dexie'

export interface EncryptedRecord {
  id: string
  date: string
  ciphertext: string
  iv: string
  createdAt: number
  updatedAt: number
}

export class LifeTrackingDB extends Dexie {
  productivity_logs!: EntityTable<EncryptedRecord, 'id'>
  finance_logs!: EntityTable<EncryptedRecord, 'id'>
  health_logs!: EntityTable<EncryptedRecord, 'id'>
  metabolic_logs!: EntityTable<EncryptedRecord, 'id'>
  digital_logs!: EntityTable<EncryptedRecord, 'id'>
  mindfulness_logs!: EntityTable<EncryptedRecord, 'id'>
  reading_logs!: EntityTable<EncryptedRecord, 'id'>

  constructor() {
    super('life-tracking-db')

    this.version(1).stores({
      productivity_logs: 'id, date, createdAt, updatedAt',
      finance_logs: 'id, date, createdAt, updatedAt',
      health_logs: 'id, date, createdAt, updatedAt',
      metabolic_logs: 'id, date, createdAt, updatedAt',
      digital_logs: 'id, date, createdAt, updatedAt',
      mindfulness_logs: 'id, date, createdAt, updatedAt',
      reading_logs: 'id, date, createdAt, updatedAt',
    })
  }
}

export const db = new LifeTrackingDB()

export const TABLE_NAMES = [
  'productivity_logs',
  'finance_logs',
  'health_logs',
  'metabolic_logs',
  'digital_logs',
  'mindfulness_logs',
  'reading_logs',
] as const

export type TableName = (typeof TABLE_NAMES)[number]
