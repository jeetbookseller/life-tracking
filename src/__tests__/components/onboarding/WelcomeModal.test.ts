import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import WelcomeModal from '@/components/onboarding/WelcomeModal.vue'

const STORAGE_KEY = 'life-tracker-welcome-seen'

function createTestRouter() {
  return createRouter({
    history: createWebHistory(),
    routes: [
      { path: '/', component: { template: '<div>Home</div>' } },
      { path: '/dashboard', component: { template: '<div>Dashboard</div>' } },
    ],
  })
}

let wrapper: VueWrapper

function mountWelcomeModal() {
  const router = createTestRouter()
  const pinia = createPinia()
  wrapper = mount(WelcomeModal, {
    global: { plugins: [router, pinia] },
    attachTo: document.body,
  })
  return wrapper
}

describe('WelcomeModal', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    wrapper?.unmount()
    // Clean up any teleported content
    document.body.innerHTML = ''
  })

  it('shows on first visit when localStorage has no welcome-seen key', () => {
    mountWelcomeModal()
    expect(document.querySelector('.welcome-modal')).not.toBeNull()
  })

  it('does NOT show on subsequent visits when localStorage has welcome-seen key', () => {
    localStorage.setItem(STORAGE_KEY, 'true')
    mountWelcomeModal()
    expect(document.querySelector('.welcome-modal')).toBeNull()
  })

  it('displays app title "Welcome to Life Tracker"', () => {
    mountWelcomeModal()
    const title = document.querySelector('.welcome-title')
    expect(title?.textContent).toBe('Welcome to Life Tracker')
  })

  it('displays app description mentioning encryption and local storage', () => {
    mountWelcomeModal()
    const desc = document.querySelector('.welcome-description')
    expect(desc?.textContent).toContain('encrypted')
    expect(desc?.textContent).toContain('browser')
  })

  it('displays tab overview with all 5 tabs', () => {
    mountWelcomeModal()
    const tabs = document.querySelectorAll('.welcome-tab-item')
    expect(tabs).toHaveLength(5)
    const text = document.querySelector('.welcome-tabs')?.textContent ?? ''
    expect(text).toContain('Dashboard')
    expect(text).toContain('Log Entry')
    expect(text).toContain('Insights')
    expect(text).toContain('Export')
    expect(text).toContain('Settings')
  })

  it('displays a "Get Started" button', () => {
    mountWelcomeModal()
    const btn = document.querySelector('.welcome-get-started')
    expect(btn).not.toBeNull()
    expect(btn?.textContent).toBe('Get Started')
  })

  it('dismisses modal and persists to localStorage when "Get Started" is clicked', async () => {
    mountWelcomeModal()
    expect(document.querySelector('.welcome-modal')).not.toBeNull()

    const btn = document.querySelector('.welcome-get-started') as HTMLElement
    btn.click()
    await wrapper.vm.$nextTick()

    expect(document.querySelector('.welcome-modal')).toBeNull()
    expect(localStorage.getItem(STORAGE_KEY)).toBe('true')
  })

  it('does not show modal again after dismissal and re-mount', async () => {
    mountWelcomeModal()
    const btn = document.querySelector('.welcome-get-started') as HTMLElement
    btn.click()
    await wrapper.vm.$nextTick()
    wrapper.unmount()

    // Re-mount the component
    mountWelcomeModal()
    expect(document.querySelector('.welcome-modal')).toBeNull()
  })
})
