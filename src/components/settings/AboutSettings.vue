<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Card from '@/components/ui/Card.vue'

const appVersion = '1.0.0'
const storageUsage = ref<string>('Calculating...')
const storageQuota = ref<string>('')

onMounted(async () => {
  try {
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate()
      const usedMB = ((estimate.usage ?? 0) / (1024 * 1024)).toFixed(2)
      const quotaMB = ((estimate.quota ?? 0) / (1024 * 1024)).toFixed(0)
      storageUsage.value = `${usedMB} MB`
      storageQuota.value = `${quotaMB} MB`
    } else {
      storageUsage.value = 'Not available'
    }
  } catch {
    storageUsage.value = 'Unable to estimate'
  }
})
</script>

<template>
  <Card title="About">
    <div class="about-grid">
      <div class="about-row">
        <span class="about-label">App</span>
        <span class="about-value">Life Tracker</span>
      </div>
      <div class="about-row">
        <span class="about-label">Version</span>
        <span class="about-value">{{ appVersion }}</span>
      </div>
      <div class="about-row">
        <span class="about-label">Storage Used</span>
        <span class="about-value">{{ storageUsage }}</span>
      </div>
      <div class="about-row" v-if="storageQuota">
        <span class="about-label">Storage Quota</span>
        <span class="about-value">{{ storageQuota }}</span>
      </div>
      <div class="about-row">
        <span class="about-label">Tech Stack</span>
        <span class="about-value">Vue 3 + Vite + Dexie.js + Web Crypto API</span>
      </div>
      <div class="about-row">
        <span class="about-label">Data</span>
        <span class="about-value">100% local, AES-256 encrypted</span>
      </div>
    </div>
  </Card>
</template>

<style scoped>
.about-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.about-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-xs) 0;
}

.about-label {
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
}

.about-value {
  font-size: var(--text-sm);
  color: var(--color-text);
  text-align: right;
}
</style>
