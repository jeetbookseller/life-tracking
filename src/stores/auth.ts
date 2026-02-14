import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { deriveKey, generateSalt } from '@/utils/crypto'

const SALT_STORAGE_KEY = 'life-tracker-salt'
const HAS_PASSWORD_KEY = 'life-tracker-has-password'

export const useAuthStore = defineStore('auth', () => {
  const cryptoKey = ref<CryptoKey | null>(null)
  const salt = ref<Uint8Array | null>(null)
  const isLocked = ref(true)
  const hasPassword = ref(false)

  const isUnlocked = computed(() => !isLocked.value && cryptoKey.value !== null)

  function init() {
    const storedSalt = localStorage.getItem(SALT_STORAGE_KEY)
    if (storedSalt) {
      const binary = atob(storedSalt)
      const bytes = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i)
      }
      salt.value = bytes
    }
    hasPassword.value = localStorage.getItem(HAS_PASSWORD_KEY) === 'true'
  }

  async function setPassword(password: string): Promise<void> {
    const newSalt = generateSalt()
    salt.value = newSalt

    // Store salt in localStorage (salt is not secret)
    let binary = ''
    for (let i = 0; i < newSalt.byteLength; i++) {
      binary += String.fromCharCode(newSalt[i]!)
    }
    localStorage.setItem(SALT_STORAGE_KEY, btoa(binary))
    localStorage.setItem(HAS_PASSWORD_KEY, 'true')
    hasPassword.value = true

    cryptoKey.value = await deriveKey(password, newSalt)
    isLocked.value = false
  }

  async function unlock(password: string): Promise<boolean> {
    if (!salt.value) {
      return false
    }

    try {
      const key = await deriveKey(password, salt.value)
      cryptoKey.value = key
      isLocked.value = false
      return true
    } catch {
      return false
    }
  }

  function lock() {
    cryptoKey.value = null
    isLocked.value = true
  }

  function getKey(): CryptoKey {
    if (!cryptoKey.value) {
      throw new Error('Vault is locked. Unlock with master password first.')
    }
    return cryptoKey.value
  }

  return {
    cryptoKey,
    salt,
    isLocked,
    hasPassword,
    isUnlocked,
    init,
    setPassword,
    unlock,
    lock,
    getKey,
  }
})
