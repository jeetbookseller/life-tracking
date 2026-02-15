<script setup lang="ts">
import { onMounted } from 'vue'
import AppHeader from './AppHeader.vue'
import AppSidebar from './AppSidebar.vue'
import AppBottomNav from './AppBottomNav.vue'
import { useTheme } from '@/composables/useTheme'
import { useAutoLock } from '@/composables/useAutoLock'
import { useSettingsStore } from '@/stores/settings'

const { initTheme } = useTheme()
const settingsStore = useSettingsStore()
useAutoLock()

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/entry', label: 'Log', icon: '✏️' },
  { path: '/insights', label: 'Insights', icon: '💡' },
  { path: '/export', label: 'Export', icon: '📤' },
  { path: '/settings', label: 'Settings', icon: '⚙️' },
]

onMounted(() => {
  initTheme()
  settingsStore.load()
})
</script>

<template>
  <div class="app-layout">
    <AppHeader :nav-items="navItems" />
    <div class="app-body">
      <AppSidebar :nav-items="navItems" />
      <main class="app-main">
        <slot />
      </main>
    </div>
    <AppBottomNav :nav-items="navItems" />
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--color-bg);
  color: var(--color-text);
}

.app-body {
  display: flex;
  flex: 1;
}

.app-main {
  flex: 1;
  padding: var(--space-lg);
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding-bottom: 5rem;
}

@media (min-width: 768px) {
  .app-main {
    padding-bottom: var(--space-lg);
  }
}
</style>
