import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: { title: 'Dashboard', icon: 'dashboard' },
  },
  {
    path: '/entry',
    name: 'Entry',
    component: () => import('@/views/Entry.vue'),
    meta: { title: 'Log Entry', icon: 'add' },
  },
  {
    path: '/insights',
    name: 'Insights',
    component: () => import('@/views/Insights.vue'),
    meta: { title: 'Insights', icon: 'insights' },
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/Settings.vue'),
    meta: { title: 'Settings', icon: 'settings' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, _from, next) => {
  const title = (to.meta.title as string) ?? 'Life Tracker'
  document.title = `${title} | Life Tracker`
  next()
})

export default router
