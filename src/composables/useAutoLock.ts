import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useSettingsStore } from '@/stores/settings'

const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'touchstart', 'scroll'] as const

export function useAutoLock() {
  const authStore = useAuthStore()
  const settingsStore = useSettingsStore()

  const idleTimer = ref<ReturnType<typeof setTimeout> | null>(null)
  const isIdle = ref(false)

  function resetTimer() {
    if (idleTimer.value !== null) {
      clearTimeout(idleTimer.value)
    }
    isIdle.value = false

    const timeoutMs = settingsStore.autoLockTimeoutMinutes * 60 * 1000
    if (timeoutMs <= 0) return // 0 means disabled

    idleTimer.value = setTimeout(() => {
      isIdle.value = true
      if (authStore.isUnlocked) {
        authStore.lock()
      }
    }, timeoutMs)
  }

  function startListening() {
    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, resetTimer, { passive: true })
    }
    resetTimer()
  }

  function stopListening() {
    for (const event of ACTIVITY_EVENTS) {
      window.removeEventListener(event, resetTimer)
    }
    if (idleTimer.value !== null) {
      clearTimeout(idleTimer.value)
      idleTimer.value = null
    }
  }

  // Re-set timer when timeout setting changes
  watch(
    () => settingsStore.autoLockTimeoutMinutes,
    () => {
      if (authStore.isUnlocked) {
        resetTimer()
      }
    },
  )

  onMounted(() => {
    startListening()
  })

  onUnmounted(() => {
    stopListening()
  })

  return {
    isIdle,
    resetTimer,
    startListening,
    stopListening,
  }
}
