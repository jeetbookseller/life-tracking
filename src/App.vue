<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/entry', label: 'Log', icon: '✏️' },
  { path: '/insights', label: 'Insights', icon: '💡' },
  { path: '/settings', label: 'Settings', icon: '⚙️' },
]

function navigate(path: string) {
  router.push(path)
}
</script>

<template>
  <div class="app-layout">
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
    </header>

    <main class="app-main">
      <router-view />
    </main>

    <nav class="bottom-nav">
      <button
        v-for="item in navItems"
        :key="item.path"
        class="bottom-nav-item"
        :class="{ 'bottom-nav-item--active': $route.path === item.path }"
        @click="navigate(item.path)"
      >
        <span class="bottom-nav-icon">{{ item.icon }}</span>
        <span class="bottom-nav-label">{{ item.label }}</span>
      </button>
    </nav>
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

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  height: 3.5rem;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-title {
  font-size: 1.125rem;
  font-weight: 700;
  margin: 0;
  color: var(--color-primary);
}

.header-nav {
  display: none;
  gap: 0.25rem;
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
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-sm);
  text-decoration: none;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  transition: background 0.15s, color 0.15s;
}

.nav-link:hover {
  background: var(--color-hover);
  color: var(--color-text);
}

.nav-link--active {
  background: var(--color-primary-subtle);
  color: var(--color-primary);
  font-weight: 600;
}

.nav-icon {
  font-size: 1rem;
}

.app-main {
  flex: 1;
  padding: 1.5rem;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding-bottom: 5rem;
}

@media (min-width: 768px) {
  .app-main {
    padding-bottom: 1.5rem;
  }
}

/* Bottom nav - mobile only */
.bottom-nav {
  display: flex;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
  padding: 0.25rem 0;
  z-index: 100;
}

@media (min-width: 768px) {
  .bottom-nav {
    display: none;
  }
}

.bottom-nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.125rem;
  padding: 0.5rem 0;
  border: none;
  background: none;
  color: var(--color-text-secondary);
  font-size: 0.625rem;
  cursor: pointer;
  transition: color 0.15s;
}

.bottom-nav-item:hover {
  color: var(--color-text);
}

.bottom-nav-item--active {
  color: var(--color-primary);
  font-weight: 600;
}

.bottom-nav-icon {
  font-size: 1.25rem;
}
</style>
