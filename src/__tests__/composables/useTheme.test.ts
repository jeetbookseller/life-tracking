import { describe, it, expect, beforeEach } from 'vitest'
import { useTheme } from '@/composables/useTheme'

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
  })

  it('defaults to dark mode', () => {
    const { initTheme, currentTheme } = useTheme()
    initTheme()
    expect(currentTheme.value).toBe('dark')
  })

  it('toggles between dark and light', () => {
    const { initTheme, toggleTheme, currentTheme } = useTheme()
    initTheme()
    expect(currentTheme.value).toBe('dark')
    toggleTheme()
    expect(currentTheme.value).toBe('light')
    toggleTheme()
    expect(currentTheme.value).toBe('dark')
  })

  it('sets theme on document element', () => {
    const { setTheme } = useTheme()
    setTheme('light')
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    setTheme('dark')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })

  it('persists theme preference to localStorage', () => {
    const { setTheme } = useTheme()
    setTheme('light')
    expect(localStorage.getItem('life-tracker-theme')).toBe('light')
    setTheme('dark')
    expect(localStorage.getItem('life-tracker-theme')).toBe('dark')
  })

  it('restores theme from localStorage', () => {
    localStorage.setItem('life-tracker-theme', 'light')
    const { initTheme, currentTheme } = useTheme()
    initTheme()
    expect(currentTheme.value).toBe('light')
  })

  it('falls back to dark if localStorage has invalid value', () => {
    localStorage.setItem('life-tracker-theme', 'invalid')
    const { initTheme, currentTheme } = useTheme()
    initTheme()
    expect(currentTheme.value).toBe('dark')
  })
})
