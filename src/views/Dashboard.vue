<script setup lang="ts">
import Card from '@/components/ui/Card.vue'

const domains = [
  { name: 'Productivity', icon: '📋', description: 'Tasks & focus sessions' },
  { name: 'Finance', icon: '💰', description: 'Net worth & spending' },
  { name: 'Health', icon: '❤️', description: 'HR, HRV & sleep' },
  { name: 'Metabolic', icon: '🧬', description: 'Food scores & nutrition' },
  { name: 'Digital', icon: '📱', description: 'Screen time & usage' },
  { name: 'Mindfulness', icon: '🧘', description: 'Meditation & streaks' },
  { name: 'Reading', icon: '📚', description: 'Books & highlights' },
] as const
</script>

<template>
  <div class="view-container">
    <h1>Dashboard</h1>
    <p class="view-description">Your daily metrics at a glance.</p>
    <div class="dashboard-grid">
      <Card v-for="domain in domains" :key="domain.name">
        <div class="domain-card">
          <span class="domain-icon">{{ domain.icon }}</span>
          <div class="domain-info">
            <span class="domain-name">{{ domain.name }}</span>
            <span class="domain-description">{{ domain.description }}</span>
          </div>
          <span class="domain-value">--</span>
        </div>
      </Card>
    </div>
  </div>
</template>

<style scoped>
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-md);
  margin-top: var(--space-lg);
}

@media (min-width: 640px) {
  .dashboard-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.domain-card {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.domain-icon {
  font-size: 1.75rem;
  flex-shrink: 0;
}

.domain-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.domain-name {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text);
}

.domain-description {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.domain-value {
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--color-text-secondary);
}
</style>
