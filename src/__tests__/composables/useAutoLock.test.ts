import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAutoLock } from '@/composables/useAutoLock'
import { useAuthStore } from '@/stores/auth'
import { useSettingsStore } from '@/stores/settings'
import { mount, config } from '@vue/test-utils'
import { defineComponent } from 'vue'

// Helper: mount a component that uses the composable
function mountWithAutoLock() {
  const TestComponent = defineComponent({
    setup() {
      const autoLock = useAutoLock()
      return { autoLock }
    },
    template: '<div>test</div>',
  })

  return mount(TestComponent, {
    global: {
      plugins: [createPinia()],
    },
  })
}

describe('useAutoLock', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    setActivePinia(createPinia())
    localStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('locks the app after idle timeout', () => {
    const wrapper = mountWithAutoLock()
    const authStore = useAuthStore()
    const settingsStore = useSettingsStore()

    // Simulate unlocked state
    authStore.isLocked = false
    authStore.cryptoKey = {} as CryptoKey
    settingsStore.autoLockTimeoutMinutes = 1 // 1 minute

    // Trigger timer reset
    wrapper.vm.autoLock.resetTimer()

    // Advance past timeout
    vi.advanceTimersByTime(61 * 1000)

    expect(authStore.isLocked).toBe(true)
    wrapper.unmount()
  })

  it('resets timer on activity events', () => {
    const wrapper = mountWithAutoLock()
    const authStore = useAuthStore()
    const settingsStore = useSettingsStore()

    authStore.isLocked = false
    authStore.cryptoKey = {} as CryptoKey
    settingsStore.autoLockTimeoutMinutes = 1

    wrapper.vm.autoLock.resetTimer()

    // Advance 30 seconds
    vi.advanceTimersByTime(30 * 1000)

    // Simulate activity
    window.dispatchEvent(new Event('mousedown'))

    // Advance another 30 seconds (should NOT lock because timer was reset)
    vi.advanceTimersByTime(30 * 1000)

    // The app should still be unlocked since activity reset the timer
    // (the lock would only happen at 60s from the last reset)
    expect(authStore.isLocked).toBe(false)

    wrapper.unmount()
  })

  it('does not lock when timeout is 0 (disabled)', () => {
    const wrapper = mountWithAutoLock()
    const authStore = useAuthStore()
    const settingsStore = useSettingsStore()

    authStore.isLocked = false
    authStore.cryptoKey = {} as CryptoKey
    settingsStore.autoLockTimeoutMinutes = 0

    wrapper.vm.autoLock.resetTimer()

    vi.advanceTimersByTime(10 * 60 * 1000) // 10 minutes

    expect(authStore.isLocked).toBe(false)
    wrapper.unmount()
  })

  it('cleans up listeners on unmount', () => {
    const removeListenerSpy = vi.spyOn(window, 'removeEventListener')
    const wrapper = mountWithAutoLock()
    wrapper.unmount()

    expect(removeListenerSpy).toHaveBeenCalled()
    removeListenerSpy.mockRestore()
  })
})
