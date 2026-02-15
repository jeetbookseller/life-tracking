import { db, TABLE_NAMES, type EncryptedRecord } from '@/db/schema'
import { encryptObject, decryptObject, type EncryptedData } from '@/utils/crypto'

/**
 * Re-encrypts all records in all domain tables using a new key.
 * Used when the user changes their master password.
 *
 * 1. Decrypt every record with the old key
 * 2. Re-encrypt each record with the new key
 * 3. Write back to IndexedDB
 */
export async function reEncryptAllData(
  oldKey: CryptoKey,
  newKey: CryptoKey,
): Promise<{ totalRecords: number; errors: string[] }> {
  let totalRecords = 0
  const errors: string[] = []

  for (const tableName of TABLE_NAMES) {
    const records: EncryptedRecord[] = await db.table(tableName).toArray()

    for (const record of records) {
      try {
        // Decrypt with old key
        const encryptedData: EncryptedData = {
          ciphertext: record.ciphertext,
          iv: record.iv,
          salt: '',
        }
        const decrypted = await decryptObject<unknown>(encryptedData, oldKey)

        // Re-encrypt with new key
        const reEncrypted = await encryptObject(decrypted, newKey)

        // Write back
        await db.table(tableName).update(record.id, {
          ciphertext: reEncrypted.ciphertext,
          iv: reEncrypted.iv,
          updatedAt: Date.now(),
        })

        totalRecords++
      } catch (e) {
        errors.push(`${tableName}/${record.id}: ${(e as Error).message}`)
      }
    }
  }

  return { totalRecords, errors }
}
