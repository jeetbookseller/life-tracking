import { describe, it, expect } from 'vitest'
import {
  deriveKey,
  generateSalt,
  encrypt,
  decrypt,
  encryptObject,
  decryptObject,
} from '@/utils/crypto'

describe('Crypto Utilities', () => {
  describe('generateSalt', () => {
    it('generates a 16-byte salt', () => {
      const salt = generateSalt()
      expect(salt).toBeInstanceOf(Uint8Array)
      expect(salt.length).toBe(16)
    })

    it('generates unique salts each time', () => {
      const salt1 = generateSalt()
      const salt2 = generateSalt()
      expect(salt1).not.toEqual(salt2)
    })
  })

  describe('deriveKey', () => {
    it('produces a CryptoKey from password + salt', async () => {
      const salt = generateSalt()
      const key = await deriveKey('test-password', salt)
      expect(key).toBeDefined()
      expect(key.type).toBe('secret')
      expect(key.algorithm).toMatchObject({ name: 'AES-GCM' })
    })

    it('produces the same key for the same password and salt', async () => {
      const salt = generateSalt()
      const key1 = await deriveKey('same-password', salt)
      const key2 = await deriveKey('same-password', salt)

      // Encrypt with key1, decrypt with key2 to verify they are equivalent
      const encrypted = await encrypt('test data', key1)
      const decrypted = await decrypt(encrypted, key2)
      expect(decrypted).toBe('test data')
    })

    it('produces different keys for different passwords', async () => {
      const salt = generateSalt()
      const key1 = await deriveKey('password-1', salt)
      const key2 = await deriveKey('password-2', salt)

      const encrypted = await encrypt('test data', key1)
      await expect(decrypt(encrypted, key2)).rejects.toThrow()
    })
  })

  describe('encrypt / decrypt', () => {
    it('round-trip returns original string data', async () => {
      const salt = generateSalt()
      const key = await deriveKey('my-password', salt)

      const original = 'Hello, encrypted world!'
      const encrypted = await encrypt(original, key)
      const decrypted = await decrypt(encrypted, key)

      expect(decrypted).toBe(original)
    })

    it('encrypts to base64 strings', async () => {
      const salt = generateSalt()
      const key = await deriveKey('my-password', salt)

      const encrypted = await encrypt('test', key)
      expect(typeof encrypted.ciphertext).toBe('string')
      expect(typeof encrypted.iv).toBe('string')
      expect(encrypted.ciphertext.length).toBeGreaterThan(0)
      expect(encrypted.iv.length).toBeGreaterThan(0)
    })

    it('produces different ciphertext for same input (due to random IV)', async () => {
      const salt = generateSalt()
      const key = await deriveKey('my-password', salt)

      const encrypted1 = await encrypt('same data', key)
      const encrypted2 = await encrypt('same data', key)

      expect(encrypted1.ciphertext).not.toBe(encrypted2.ciphertext)
      expect(encrypted1.iv).not.toBe(encrypted2.iv)
    })

    it('decryption with wrong key throws an error', async () => {
      const salt = generateSalt()
      const correctKey = await deriveKey('correct-password', salt)
      const wrongKey = await deriveKey('wrong-password', salt)

      const encrypted = await encrypt('secret data', correctKey)
      await expect(decrypt(encrypted, wrongKey)).rejects.toThrow()
    })

    it('handles empty string', async () => {
      const salt = generateSalt()
      const key = await deriveKey('my-password', salt)

      const encrypted = await encrypt('', key)
      const decrypted = await decrypt(encrypted, key)
      expect(decrypted).toBe('')
    })

    it('handles long strings', async () => {
      const salt = generateSalt()
      const key = await deriveKey('my-password', salt)

      const original = 'x'.repeat(10000)
      const encrypted = await encrypt(original, key)
      const decrypted = await decrypt(encrypted, key)
      expect(decrypted).toBe(original)
    })

    it('handles unicode strings', async () => {
      const salt = generateSalt()
      const key = await deriveKey('my-password', salt)

      const original = 'Hello world!'
      const encrypted = await encrypt(original, key)
      const decrypted = await decrypt(encrypted, key)
      expect(decrypted).toBe(original)
    })
  })

  describe('encryptObject / decryptObject', () => {
    it('round-trip returns original object', async () => {
      const salt = generateSalt()
      const key = await deriveKey('my-password', salt)

      const original = {
        name: 'Test',
        value: 42,
        nested: { a: 1, b: [1, 2, 3] },
      }

      const encrypted = await encryptObject(original, key)
      const decrypted = await decryptObject(encrypted, key)

      expect(decrypted).toEqual(original)
    })
  })
})
