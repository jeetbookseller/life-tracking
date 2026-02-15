import { defineStore } from 'pinia'
import { db, type EncryptedRecord, type TableName } from '@/db/schema'
import { encryptObject, decryptObject, type EncryptedData } from '@/utils/crypto'
import { useAuthStore } from './auth'
import { v4 as uuidv4 } from 'uuid'
import type { BaseEntry } from '@/types/data-models'

export const useStorageStore = defineStore('storage', () => {
  const authStore = useAuthStore()

  async function addEntry<T extends BaseEntry>(
    tableName: TableName,
    data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<string> {
    const key = authStore.getKey()
    const id = uuidv4()
    const now = Date.now()

    const fullEntry = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    }

    const encrypted = await encryptObject(fullEntry, key)

    const record: EncryptedRecord = {
      id,
      date: (data as { date: string }).date,
      ciphertext: encrypted.ciphertext,
      iv: encrypted.iv,
      createdAt: now,
      updatedAt: now,
    }

    await db.table(tableName).add(record)
    return id
  }

  async function getEntry<T extends BaseEntry>(
    tableName: TableName,
    id: string,
  ): Promise<T | undefined> {
    const key = authStore.getKey()
    const record: EncryptedRecord | undefined = await db
      .table(tableName)
      .get(id)

    if (!record) return undefined

    const encryptedData: EncryptedData = {
      ciphertext: record.ciphertext,
      iv: record.iv,
      salt: '',
    }

    return decryptObject<T>(encryptedData, key)
  }

  async function updateEntry<T extends BaseEntry>(
    tableName: TableName,
    id: string,
    data: Partial<T>,
  ): Promise<void> {
    const key = authStore.getKey()
    const existing = await getEntry<T>(tableName, id)

    if (!existing) {
      throw new Error(`Entry ${id} not found in ${tableName}`)
    }

    const now = Date.now()
    const updated = {
      ...existing,
      ...data,
      id, // prevent id override
      updatedAt: now,
    }

    const encrypted = await encryptObject(updated, key)

    await db.table(tableName).update(id, {
      ciphertext: encrypted.ciphertext,
      iv: encrypted.iv,
      date: updated.date,
      updatedAt: now,
    })
  }

  async function deleteEntry(
    tableName: TableName,
    id: string,
  ): Promise<void> {
    await db.table(tableName).delete(id)
  }

  async function getAllEntries<T extends BaseEntry>(
    tableName: TableName,
  ): Promise<T[]> {
    const key = authStore.getKey()
    const records: EncryptedRecord[] = await db
      .table(tableName)
      .orderBy('date')
      .toArray()

    const entries: T[] = []
    for (const record of records) {
      const encryptedData: EncryptedData = {
        ciphertext: record.ciphertext,
        iv: record.iv,
        salt: '',
      }
      const entry = await decryptObject<T>(encryptedData, key)
      entries.push(entry)
    }

    return entries
  }

  async function getEntriesByDateRange<T extends BaseEntry>(
    tableName: TableName,
    startDate: string,
    endDate: string,
  ): Promise<T[]> {
    const key = authStore.getKey()
    const records: EncryptedRecord[] = await db
      .table(tableName)
      .where('date')
      .between(startDate, endDate, true, true)
      .toArray()

    const entries: T[] = []
    for (const record of records) {
      const encryptedData: EncryptedData = {
        ciphertext: record.ciphertext,
        iv: record.iv,
        salt: '',
      }
      const entry = await decryptObject<T>(encryptedData, key)
      entries.push(entry)
    }

    return entries
  }

  async function clearTable(tableName: TableName): Promise<void> {
    await db.table(tableName).clear()
  }

  async function clearAllData(): Promise<void> {
    await Promise.all([
      db.productivity_logs.clear(),
      db.finance_logs.clear(),
      db.health_logs.clear(),
      db.metabolic_logs.clear(),
      db.digital_logs.clear(),
      db.mindfulness_logs.clear(),
      db.reading_logs.clear(),
    ])
  }

  return {
    addEntry,
    getEntry,
    updateEntry,
    deleteEntry,
    getAllEntries,
    getEntriesByDateRange,
    clearTable,
    clearAllData,
  }
})
