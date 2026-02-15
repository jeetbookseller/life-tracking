<script setup lang="ts">
defineProps<{
  title?: string
  padding?: boolean
}>()
</script>

<template>
  <div class="card" :class="{ 'card--no-padding': padding === false }">
    <div v-if="title" class="card-header">
      <h3 class="card-title">{{ title }}</h3>
      <slot name="header-actions" />
    </div>
    <div class="card-body">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md) var(--space-lg);
  border-bottom: 1px solid var(--color-border);
}

.card-title {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.card-body {
  padding: var(--space-lg);
}

.card--no-padding .card-body {
  padding: 0;
}
</style>
