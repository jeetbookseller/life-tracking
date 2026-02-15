<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}>()

defineEmits<{
  click: [event: MouseEvent]
}>()
</script>

<template>
  <button
    class="btn"
    :class="[`btn--${variant ?? 'primary'}`, `btn--${size ?? 'md'}`]"
    :disabled="disabled"
    :type="type ?? 'button'"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  border: none;
  border-radius: var(--radius-sm);
  font-family: var(--font-sans);
  font-weight: 500;
  cursor: pointer;
  transition: background var(--transition-fast), opacity var(--transition-fast);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Variants */
.btn--primary {
  background: var(--color-primary);
  color: #fff;
}

.btn--primary:hover:not(:disabled) {
  background: var(--color-primary-hover);
}

.btn--secondary {
  background: var(--color-surface-elevated);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.btn--secondary:hover:not(:disabled) {
  background: var(--color-hover);
}

.btn--danger {
  background: var(--color-danger);
  color: #fff;
}

.btn--danger:hover:not(:disabled) {
  opacity: 0.9;
}

/* Sizes */
.btn--sm {
  padding: var(--space-xs) var(--space-sm);
  font-size: var(--text-xs);
}

.btn--md {
  padding: var(--space-sm) var(--space-md);
  font-size: var(--text-sm);
}

.btn--lg {
  padding: var(--space-md) var(--space-lg);
  font-size: var(--text-base);
}
</style>
