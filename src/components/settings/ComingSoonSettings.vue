<script setup lang="ts">
import Card from '@/components/ui/Card.vue'
</script>

<template>
  <Card title="Coming Soon">
    <div class="coming-soon-list">
      <div class="coming-soon-item">
        <span class="coming-soon-icon">☁️</span>
        <div class="coming-soon-text">
          <strong>Google Drive Backup</strong>
          <p>Encrypted cloud backup and restore across devices</p>
        </div>
      </div>
      <div class="coming-soon-item">
        <span class="coming-soon-icon">🔗</span>
        <div class="coming-soon-text">
          <strong>API Connectors</strong>
          <p>Optional direct sync with Fitbit, health platforms, and more</p>
        </div>
      </div>
    </div>
  </Card>
</template>

<style scoped>
.coming-soon-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.coming-soon-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-md);
  padding: var(--space-md);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-md);
}

.coming-soon-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.coming-soon-text strong {
  display: block;
  font-size: var(--text-sm);
  margin-bottom: var(--space-xs);
}

.coming-soon-text p {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin: 0;
}
</style>
