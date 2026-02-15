<script setup lang="ts">
defineProps<{
  count: number
  label: string
}>()
</script>

<template>
  <div class="streak" data-testid="streak-counter">
    <div class="streak-count">{{ count }}</div>
    <div class="streak-info">
      <span class="streak-unit">days</span>
      <span class="streak-label">{{ label }}</span>
    </div>
  </div>
</template>

<style scoped>
.streak {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-sm) var(--space-md);
  background: var(--color-primary-subtle);
  border-radius: var(--radius-md);
}

.streak-count {
  font-size: var(--text-2xl);
  font-weight: 800;
  color: var(--color-primary);
  min-width: 2rem;
  text-align: center;
}

.streak-info {
  display: flex;
  flex-direction: column;
}

.streak-unit {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.streak-label {
  font-size: var(--text-sm);
  color: var(--color-text);
}
</style>
