import { ref } from 'vue'

export type Theme = 'dark' | 'light'

const THEME_KEY = 'life-tracker-theme'

const currentTheme = ref<Theme>('dark')

export function useTheme() {
  function setTheme(theme: Theme) {
    currentTheme.value = theme
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem(THEME_KEY, theme)
  }

  function toggleTheme() {
    setTheme(currentTheme.value === 'dark' ? 'light' : 'dark')
  }

  function initTheme() {
    const stored = localStorage.getItem(THEME_KEY) as Theme | null
    const theme = stored === 'light' || stored === 'dark' ? stored : 'dark'
    setTheme(theme)
  }

  return {
    currentTheme,
    setTheme,
    toggleTheme,
    initTheme,
  }
}
