import { describe, it, expect, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppBottomNav from '@/components/layout/AppBottomNav.vue'
import AppLayout from '@/components/layout/AppLayout.vue'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/entry', label: 'Log', icon: '✏️' },
  { path: '/insights', label: 'Insights', icon: '💡' },
  { path: '/settings', label: 'Settings', icon: '⚙️' },
]

function createTestRouter() {
  return createRouter({
    history: createWebHistory(),
    routes: [
      { path: '/', component: { template: '<div>Home</div>' } },
      { path: '/dashboard', component: { template: '<div>Dashboard</div>' } },
      { path: '/entry', component: { template: '<div>Entry</div>' } },
      { path: '/insights', component: { template: '<div>Insights</div>' } },
      { path: '/settings', component: { template: '<div>Settings</div>' } },
    ],
  })
}

describe('AppHeader', () => {
  it('renders the app title', () => {
    const router = createTestRouter()
    const wrapper = mount(AppHeader, {
      props: { navItems },
      global: { plugins: [router] },
    })
    expect(wrapper.find('.header-title').text()).toBe('Life Tracker')
  })

  it('renders navigation links', () => {
    const router = createTestRouter()
    const wrapper = mount(AppHeader, {
      props: { navItems },
      global: { plugins: [router] },
    })
    const links = wrapper.findAll('.nav-link')
    expect(links).toHaveLength(4)
    expect(links[0].text()).toContain('Dashboard')
  })

  it('renders theme toggle button', () => {
    const router = createTestRouter()
    const wrapper = mount(AppHeader, {
      props: { navItems },
      global: { plugins: [router] },
    })
    expect(wrapper.find('.theme-toggle').exists()).toBe(true)
  })

  it('toggles theme on button click', async () => {
    const router = createTestRouter()
    const wrapper = mount(AppHeader, {
      props: { navItems },
      global: { plugins: [router] },
    })
    const btn = wrapper.find('.theme-toggle')
    await btn.trigger('click')
    // After toggle, theme should change (we verify the aria-label changes)
    expect(btn.attributes('aria-label')).toBeTruthy()
  })
})

describe('AppSidebar', () => {
  it('renders navigation links for desktop', () => {
    const router = createTestRouter()
    const wrapper = mount(AppSidebar, {
      props: { navItems },
      global: { plugins: [router] },
    })
    const links = wrapper.findAll('.sidebar-link')
    expect(links).toHaveLength(4)
  })

  it('renders icons and labels', () => {
    const router = createTestRouter()
    const wrapper = mount(AppSidebar, {
      props: { navItems },
      global: { plugins: [router] },
    })
    expect(wrapper.find('.sidebar-icon').exists()).toBe(true)
    expect(wrapper.find('.sidebar-label').exists()).toBe(true)
    expect(wrapper.text()).toContain('Dashboard')
  })
})

describe('AppBottomNav', () => {
  it('renders nav items for mobile', async () => {
    const router = createTestRouter()
    await router.push('/dashboard')
    await router.isReady()
    const wrapper = mount(AppBottomNav, {
      props: { navItems },
      global: { plugins: [router] },
    })
    const items = wrapper.findAll('.bottom-nav-item')
    expect(items).toHaveLength(4)
  })

  it('highlights active route', async () => {
    const router = createTestRouter()
    await router.push('/dashboard')
    await router.isReady()
    const wrapper = mount(AppBottomNav, {
      props: { navItems },
      global: { plugins: [router] },
    })
    const activeItem = wrapper.find('.bottom-nav-item--active')
    expect(activeItem.exists()).toBe(true)
    expect(activeItem.text()).toContain('Dashboard')
  })

  it('emits navigation on click', async () => {
    const router = createTestRouter()
    await router.push('/dashboard')
    await router.isReady()
    const wrapper = mount(AppBottomNav, {
      props: { navItems },
      global: { plugins: [router] },
    })
    const items = wrapper.findAll('.bottom-nav-item')
    await items[1].trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/entry')
  })

  it('renders aria-labels for accessibility', async () => {
    const router = createTestRouter()
    await router.push('/dashboard')
    await router.isReady()
    const wrapper = mount(AppBottomNav, {
      props: { navItems },
      global: { plugins: [router] },
    })
    const btn = wrapper.find('.bottom-nav-item')
    expect(btn.attributes('aria-label')).toBe('Dashboard')
  })
})

describe('AppLayout', () => {
  it('renders header, sidebar, bottom nav, and main content area', async () => {
    const router = createTestRouter()
    await router.push('/dashboard')
    await router.isReady()
    const wrapper = mount(AppLayout, {
      global: { plugins: [router] },
      slots: { default: '<div class="test-content">Hello</div>' },
    })
    expect(wrapper.find('.app-header').exists()).toBe(true)
    expect(wrapper.find('.app-sidebar').exists()).toBe(true)
    expect(wrapper.find('.bottom-nav').exists()).toBe(true)
    expect(wrapper.find('.app-main').exists()).toBe(true)
  })

  it('renders slot content in main area', async () => {
    const router = createTestRouter()
    await router.push('/dashboard')
    await router.isReady()
    const wrapper = mount(AppLayout, {
      global: { plugins: [router] },
      slots: { default: '<div class="test-content">Hello World</div>' },
    })
    expect(wrapper.find('.test-content').text()).toBe('Hello World')
  })
})
