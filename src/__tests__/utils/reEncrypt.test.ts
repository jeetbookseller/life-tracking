import { describe, it, expect, beforeEach } from 'vitest'
import { db, TABLE_NAMES } from '@/db/schema'
import { deriveKey, generateSalt, encryptObject, decryptObject, type EncryptedData } from '@/utils/crypto'
import { reEncryptAllData } from '@/utils/reEncrypt'

describe('reEncryptAllData', () => {
  let oldKey: CryptoKey
  let newKey: CryptoKey

  beforeEach(async () => {
    // Clear all tables
    for (const table of TABLE_NAMES) {
      await db.table(table).clear()
    }

    const salt1 = generateSalt()
    const salt2 = generateSalt()
    oldKey = await deriveKey('old-password', salt1)
    newKey = await deriveKey('new-password', salt2)
  })

  it('re-encrypts records from old key to new key', async () => {
    // Encrypt a test entry with old key
    const testData = { id: 'test-1', date: '2024-01-01', focusRating: 4, deepWorkHours: 3 }
    const encrypted = await encryptObject(testData, oldKey)

    await db.table('productivity_logs').add({
      id: 'test-1',
      date: '2024-01-01',
      ciphertext: encrypted.ciphertext,
      iv: encrypted.iv,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    // Re-encrypt
    const result = await reEncryptAllData(oldKey, newKey)
    expect(result.totalRecords).toBe(1)
    expect(result.errors.length).toBe(0)

    // Verify we can decrypt with new key
    const record = await db.table('productivity_logs').get('test-1')
    const reEncryptedData: EncryptedData = {
      ciphertext: record.ciphertext,
      iv: record.iv,
      salt: '',
    }
    const decrypted = await decryptObject<typeof testData>(reEncryptedData, newKey)
    expect(decrypted.focusRating).toBe(4)
    expect(decrypted.deepWorkHours).toBe(3)
  })

  it('handles multiple tables', async () => {
    // Add entries to multiple tables
    const tables = ['productivity_logs', 'health_logs', 'reading_logs']
    for (const table of tables) {
      const data = { id: `${table}-1`, date: '2024-01-01', value: table }
      const encrypted = await encryptObject(data, oldKey)
      await db.table(table).add({
        id: `${table}-1`,
        date: '2024-01-01',
        ciphertext: encrypted.ciphertext,
        iv: encrypted.iv,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
    }

    const result = await reEncryptAllData(oldKey, newKey)
    expect(result.totalRecords).toBe(3)
    expect(result.errors.length).toBe(0)
  })

  it('handles empty database', async () => {
    const result = await reEncryptAllData(oldKey, newKey)
    expect(result.totalRecords).toBe(0)
    expect(result.errors.length).toBe(0)
  })

  it('reports errors for corrupted records', async () => {
    // Add a corrupted record
    await db.table('productivity_logs').add({
      id: 'corrupted-1',
      date: '2024-01-01',
      ciphertext: 'invalid-base64-data',
      iv: 'invalid-iv',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    const result = await reEncryptAllData(oldKey, newKey)
    expect(result.errors.length).toBeGreaterThan(0)
  })
})
