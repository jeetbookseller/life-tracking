import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('starts in locked state', () => {
    const auth = useAuthStore()
    expect(auth.isLocked).toBe(true)
    expect(auth.isUnlocked).toBe(false)
    expect(auth.cryptoKey).toBeNull()
  })

  it('reports no password initially', () => {
    const auth = useAuthStore()
    auth.init()
    expect(auth.hasPassword).toBe(false)
  })

  describe('setPassword', () => {
    it('sets a master password and derives a key', async () => {
      const auth = useAuthStore()
      await auth.setPassword('my-master-password')

      expect(auth.isLocked).toBe(false)
      expect(auth.isUnlocked).toBe(true)
      expect(auth.cryptoKey).not.toBeNull()
      expect(auth.salt).not.toBeNull()
      expect(auth.hasPassword).toBe(true)
    })

    it('stores salt in localStorage', async () => {
      const auth = useAuthStore()
      await auth.setPassword('my-master-password')

      const storedSalt = localStorage.getItem('life-tracker-salt')
      expect(storedSalt).not.toBeNull()
      expect(storedSalt!.length).toBeGreaterThan(0)
    })

    it('sets has-password flag in localStorage', async () => {
      const auth = useAuthStore()
      await auth.setPassword('my-master-password')

      expect(localStorage.getItem('life-tracker-has-password')).toBe('true')
    })
  })

  describe('unlock', () => {
    it('unlocks with the correct password', async () => {
      const auth = useAuthStore()
      await auth.setPassword('my-password')
      auth.lock()

      // Re-init to load salt from localStorage
      auth.init()
      const success = await auth.unlock('my-password')

      expect(success).toBe(true)
      expect(auth.isUnlocked).toBe(true)
    })

    it('returns false when no salt is set', async () => {
      const auth = useAuthStore()
      const success = await auth.unlock('some-password')
      expect(success).toBe(false)
    })
  })

  describe('lock', () => {
    it('clears the crypto key', async () => {
      const auth = useAuthStore()
      await auth.setPassword('my-password')
      expect(auth.isUnlocked).toBe(true)

      auth.lock()
      expect(auth.isLocked).toBe(true)
      expect(auth.isUnlocked).toBe(false)
      expect(auth.cryptoKey).toBeNull()
    })
  })

  describe('getKey', () => {
    it('returns the key when unlocked', async () => {
      const auth = useAuthStore()
      await auth.setPassword('my-password')

      const key = auth.getKey()
      expect(key).toBeDefined()
      expect(key.type).toBe('secret')
    })

    it('throws when locked', () => {
      const auth = useAuthStore()
      expect(() => auth.getKey()).toThrow('Vault is locked')
    })
  })

  describe('init', () => {
    it('loads salt from localStorage', async () => {
      const auth1 = useAuthStore()
      await auth1.setPassword('test-password')
      const originalSalt = auth1.salt

      // Simulate new store instance by creating new pinia
      setActivePinia(createPinia())
      const auth2 = useAuthStore()
      auth2.init()

      expect(auth2.hasPassword).toBe(true)
      expect(auth2.salt).not.toBeNull()
      expect(auth2.salt).toEqual(originalSalt)
    })
  })
})
