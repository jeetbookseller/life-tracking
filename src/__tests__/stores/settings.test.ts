import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSettingsStore } from '@/stores/settings'

describe('Settings Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    document.documentElement.removeAttribute('data-font-size')
  })

  it('loads defaults when no localStorage entry exists', () => {
    const store = useSettingsStore()
    store.load()
    expect(store.autoLockTimeoutMinutes).toBe(15)
    expect(store.fontSize).toBe('medium')
  })

  it('persists changes to localStorage', () => {
    const store = useSettingsStore()
    store.load()
    store.setAutoLockTimeout(30)
    store.setFontSize('large')

    const stored = JSON.parse(localStorage.getItem('life-tracker-settings')!)
    expect(stored.autoLockTimeoutMinutes).toBe(30)
    expect(stored.fontSize).toBe('large')
  })

  it('restores settings from localStorage', () => {
    localStorage.setItem(
      'life-tracker-settings',
      JSON.stringify({ autoLockTimeoutMinutes: 5, fontSize: 'small' }),
    )
    const store = useSettingsStore()
    store.load()
    expect(store.autoLockTimeoutMinutes).toBe(5)
    expect(store.fontSize).toBe('small')
  })

  it('falls back to defaults with invalid localStorage data', () => {
    localStorage.setItem('life-tracker-settings', 'invalid json')
    const store = useSettingsStore()
    store.load()
    expect(store.autoLockTimeoutMinutes).toBe(15)
    expect(store.fontSize).toBe('medium')
  })

  it('applies data-font-size attribute on load', () => {
    localStorage.setItem(
      'life-tracker-settings',
      JSON.stringify({ autoLockTimeoutMinutes: 15, fontSize: 'large' }),
    )
    const store = useSettingsStore()
    store.load()
    expect(document.documentElement.getAttribute('data-font-size')).toBe('large')
  })

  it('setFontSize updates attribute immediately', () => {
    const store = useSettingsStore()
    store.load()
    store.setFontSize('small')
    expect(document.documentElement.getAttribute('data-font-size')).toBe('small')
  })
})
