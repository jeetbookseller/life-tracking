import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useStorageStore } from './storage'
import {
  DOMAIN_TABLE_MAP,
  VALIDATORS,
  type DataDomain,
  type DomainEntry,
  type BaseEntry,
  type ProductivityLog,
  type FinanceLog,
  type HealthLog,
  type MetabolicLog,
  type DigitalLog,
  type MindfulnessLog,
  type ReadingLog,
} from '@/types/data-models'
import type { TableName } from '@/db/schema'

export const useDataStore = defineStore('data', () => {
  const loading = ref(false)
  const error = ref<string | null>(null)

  function getTableName(domain: DataDomain): TableName {
    return DOMAIN_TABLE_MAP[domain] as TableName
  }

  async function addEntry(
    domain: DataDomain,
    data: Record<string, unknown> & { date: string },
  ): Promise<string> {
    const validation = VALIDATORS[domain](data as Partial<DomainEntry>)
    if (!validation.valid) {
      const messages = validation.errors.map((e) => `${e.field}: ${e.message}`)
      throw new Error(`Validation failed: ${messages.join(', ')}`)
    }

    const storageStore = useStorageStore()
    loading.value = true
    error.value = null

    try {
      const id = await storageStore.addEntry(getTableName(domain), data)
      return id
    } catch (e) {
      error.value = (e as Error).message
      throw e
    } finally {
      loading.value = false
    }
  }

  async function getEntry<T extends BaseEntry>(
    domain: DataDomain,
    id: string,
  ): Promise<T | undefined> {
    const storageStore = useStorageStore()
    loading.value = true
    error.value = null

    try {
      return await storageStore.getEntry<T>(getTableName(domain), id)
    } catch (e) {
      error.value = (e as Error).message
      throw e
    } finally {
      loading.value = false
    }
  }

  async function updateEntry(
    domain: DataDomain,
    id: string,
    data: Partial<DomainEntry>,
  ): Promise<void> {
    const storageStore = useStorageStore()
    loading.value = true
    error.value = null

    try {
      await storageStore.updateEntry(getTableName(domain), id, data)
    } catch (e) {
      error.value = (e as Error).message
      throw e
    } finally {
      loading.value = false
    }
  }

  async function deleteEntry(
    domain: DataDomain,
    id: string,
  ): Promise<void> {
    const storageStore = useStorageStore()
    loading.value = true
    error.value = null

    try {
      await storageStore.deleteEntry(getTableName(domain), id)
    } catch (e) {
      error.value = (e as Error).message
      throw e
    } finally {
      loading.value = false
    }
  }

  async function getAllEntries<T extends BaseEntry>(
    domain: DataDomain,
  ): Promise<T[]> {
    const storageStore = useStorageStore()
    loading.value = true
    error.value = null

    try {
      return await storageStore.getAllEntries<T>(getTableName(domain))
    } catch (e) {
      error.value = (e as Error).message
      throw e
    } finally {
      loading.value = false
    }
  }

  async function getEntriesByDateRange<T extends BaseEntry>(
    domain: DataDomain,
    startDate: string,
    endDate: string,
  ): Promise<T[]> {
    const storageStore = useStorageStore()
    loading.value = true
    error.value = null

    try {
      return await storageStore.getEntriesByDateRange<T>(
        getTableName(domain),
        startDate,
        endDate,
      )
    } catch (e) {
      error.value = (e as Error).message
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    addEntry,
    getEntry,
    updateEntry,
    deleteEntry,
    getAllEntries,
    getEntriesByDateRange,
  }
})

// Re-export types for convenience
export type {
  ProductivityLog,
  FinanceLog,
  HealthLog,
  MetabolicLog,
  DigitalLog,
  MindfulnessLog,
  ReadingLog,
}
