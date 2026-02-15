<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

defineProps<{
  navItems: Array<{ path: string; label: string; icon: string }>
}>()

function navigate(path: string) {
  router.push(path)
}
</script>

<template>
  <nav class="bottom-nav">
    <button
      v-for="item in navItems"
      :key="item.path"
      class="bottom-nav-item"
      :class="{ 'bottom-nav-item--active': route.path === item.path }"
      :aria-label="item.label"
      @click="navigate(item.path)"
    >
      <span class="bottom-nav-icon">{{ item.icon }}</span>
      <span class="bottom-nav-label">{{ item.label }}</span>
    </button>
  </nav>
</template>

<style scoped>
.bottom-nav {
  display: flex;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
  padding: var(--space-xs) 0;
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
  padding: var(--space-sm) 0;
  border: none;
  background: none;
  color: var(--color-text-secondary);
  font-size: 0.625rem;
  cursor: pointer;
  transition: color var(--transition-fast);
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
