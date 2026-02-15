<script setup lang="ts">
defineProps<{
  message: string
}>()
</script>

<template>
  <div class="error-message" role="alert">
    <span class="error-icon">⚠</span>
    <span class="error-text">{{ message }}</span>
  </div>
</template>

<style scoped>
.error-message {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  background: rgba(244, 67, 54, 0.1);
  border: 1px solid var(--color-danger);
  border-radius: var(--radius-sm);
  color: var(--color-danger);
  font-size: var(--text-sm);
}

.error-icon {
  flex-shrink: 0;
}
</style>
