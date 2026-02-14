<script setup lang="ts">
const domains = [
  'Productivity',
  'Finance',
  'Health',
  'Metabolic',
  'Digital',
  'Mindfulness',
  'Reading',
] as const

const domainIcons: Record<string, string> = {
  Productivity: '📋',
  Finance: '💰',
  Health: '❤️',
  Metabolic: '🧬',
  Digital: '📱',
  Mindfulness: '🧘',
  Reading: '📚',
}
</script>

<template>
  <div class="view-container">
    <h1>Dashboard</h1>
    <p class="view-description">Your daily metrics at a glance.</p>
    <div class="placeholder-grid">
      <div v-for="domain in domains" :key="domain" class="placeholder-card">
        <span class="placeholder-icon">{{ domainIcons[domain] }}</span>
        <span class="placeholder-label">{{ domain }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.placeholder-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
}

.placeholder-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1.5rem 1rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}

.placeholder-icon {
  font-size: 1.75rem;
}
</style>
