import { createRouter, createWebHashHistory } from 'vue-router'
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
    path: '/export',
    name: 'Export',
    component: () => import('@/views/Export.vue'),
    meta: { title: 'Export', icon: 'export' },
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/Settings.vue'),
    meta: { title: 'Settings', icon: 'settings' },
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.beforeEach((to, _from, next) => {
  const title = (to.meta.title as string) ?? 'Life Tracker'
  document.title = `${title} | Life Tracker`
  next()
})

export default router
