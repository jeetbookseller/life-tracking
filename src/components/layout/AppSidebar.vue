<script setup lang="ts">
defineProps<{
  navItems: Array<{ path: string; label: string; icon: string }>
}>()
</script>

<template>
  <aside class="app-sidebar">
    <nav class="sidebar-nav">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="sidebar-link"
        active-class="sidebar-link--active"
      >
        <span class="sidebar-icon">{{ item.icon }}</span>
        <span class="sidebar-label">{{ item.label }}</span>
      </router-link>
    </nav>
  </aside>
</template>

<style scoped>
.app-sidebar {
  display: none;
  width: 200px;
  background: var(--color-surface);
  border-right: 1px solid var(--color-border);
  padding: var(--space-lg) 0;
  flex-shrink: 0;
}

@media (min-width: 1024px) {
  .app-sidebar {
    display: block;
  }
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  padding: 0 var(--space-sm);
}

.sidebar-link {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-sm);
  text-decoration: none;
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  transition: background var(--transition-fast), color var(--transition-fast);
}

.sidebar-link:hover {
  background: var(--color-hover);
  color: var(--color-text);
  text-decoration: none;
}

.sidebar-link--active {
  background: var(--color-primary-subtle);
  color: var(--color-primary);
  font-weight: 600;
}

.sidebar-icon {
  font-size: 1.125rem;
}
</style>
