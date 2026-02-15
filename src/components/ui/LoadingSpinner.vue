<script setup lang="ts">
defineProps<{
  size?: 'sm' | 'md' | 'lg'
}>()
</script>

<template>
  <div class="spinner-container" :class="`spinner--${size ?? 'md'}`" role="status">
    <div class="spinner" />
    <span class="sr-only">Loading...</span>
  </div>
</template>

<style scoped>
.spinner-container {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  border: 2px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

.spinner--sm .spinner {
  width: 1rem;
  height: 1rem;
}

.spinner--md .spinner {
  width: 1.5rem;
  height: 1.5rem;
}

.spinner--lg .spinner {
  width: 2.5rem;
  height: 2.5rem;
  border-width: 3px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
