import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export type FontSize = 'small' | 'medium' | 'large'

const SETTINGS_STORAGE_KEY = 'life-tracker-settings'

interface PersistedSettings {
  autoLockTimeoutMinutes: number
  fontSize: FontSize
}

const DEFAULTS: PersistedSettings = {
  autoLockTimeoutMinutes: 15,
  fontSize: 'medium',
}

export const useSettingsStore = defineStore('settings', () => {
  const autoLockTimeoutMinutes = ref(DEFAULTS.autoLockTimeoutMinutes)
  const fontSize = ref<FontSize>(DEFAULTS.fontSize)

  function load() {
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY)
      if (stored) {
        const parsed: Partial<PersistedSettings> = JSON.parse(stored)
        if (typeof parsed.autoLockTimeoutMinutes === 'number') {
          autoLockTimeoutMinutes.value = parsed.autoLockTimeoutMinutes
        }
        if (
          parsed.fontSize === 'small' ||
          parsed.fontSize === 'medium' ||
          parsed.fontSize === 'large'
        ) {
          fontSize.value = parsed.fontSize
        }
      }
    } catch {
      // Use defaults
    }
    applyFontSize()
  }

  function save() {
    const data: PersistedSettings = {
      autoLockTimeoutMinutes: autoLockTimeoutMinutes.value,
      fontSize: fontSize.value,
    }
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(data))
  }

  function setAutoLockTimeout(minutes: number) {
    autoLockTimeoutMinutes.value = minutes
    save()
  }

  function setFontSize(size: FontSize) {
    fontSize.value = size
    save()
    applyFontSize()
  }

  function applyFontSize() {
    document.documentElement.setAttribute('data-font-size', fontSize.value)
  }

  // Auto-persist on changes
  watch([autoLockTimeoutMinutes, fontSize], () => {
    save()
  })

  return {
    autoLockTimeoutMinutes,
    fontSize,
    load,
    save,
    setAutoLockTimeout,
    setFontSize,
    applyFontSize,
  }
})
