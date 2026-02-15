<script setup lang="ts">
import { useTheme } from '@/composables/useTheme'

const { currentTheme, toggleTheme } = useTheme()

defineProps<{
  navItems: Array<{ path: string; label: string; icon: string }>
}>()
</script>

<template>
  <header class="app-header">
    <div class="header-brand">
      <h1 class="header-title">Life Tracker</h1>
    </div>
    <nav class="header-nav">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="nav-link"
        active-class="nav-link--active"
      >
        <span class="nav-icon">{{ item.icon }}</span>
        <span class="nav-label">{{ item.label }}</span>
      </router-link>
    </nav>
    <button
      class="theme-toggle"
      :aria-label="`Switch to ${currentTheme === 'dark' ? 'light' : 'dark'} mode`"
      @click="toggleTheme"
    >
      {{ currentTheme === 'dark' ? '☀️' : '🌙' }}
    </button>
  </header>
</template>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-lg);
  height: 3.5rem;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-title {
  font-size: var(--text-lg);
  font-weight: 700;
  margin: 0;
  color: var(--color-primary);
}

.header-nav {
  display: none;
  gap: var(--space-xs);
}

@media (min-width: 768px) {
  .header-nav {
    display: flex;
  }
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: var(--space-sm) 0.75rem;
  border-radius: var(--radius-sm);
  text-decoration: none;
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  transition: background var(--transition-fast), color var(--transition-fast);
}

.nav-link:hover {
  background: var(--color-hover);
  color: var(--color-text);
  text-decoration: none;
}

.nav-link--active {
  background: var(--color-primary-subtle);
  color: var(--color-primary);
  font-weight: 600;
}

.nav-icon {
  font-size: 1rem;
}

.theme-toggle {
  background: none;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: var(--space-xs) var(--space-sm);
  cursor: pointer;
  font-size: 1.125rem;
  line-height: 1;
  transition: background var(--transition-fast);
}

.theme-toggle:hover {
  background: var(--color-hover);
}
</style>
