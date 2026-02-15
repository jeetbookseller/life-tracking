<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useDataStore } from '@/stores/data'
import { useInsightsStore } from '@/stores/insights'
import { useAuthStore } from '@/stores/auth'
import ExportModal from '@/components/export/ExportModal.vue'
import PromptLibrary from '@/components/export/PromptLibrary.vue'
import type { ExportData } from '@/utils/export'
import type { DataDomain, DomainEntry } from '@/types/data-models'

const dataStore = useDataStore()
const insightsStore = useInsightsStore()
const authStore = useAuthStore()

const ALL_DOMAINS: DataDomain[] = [
  'productivity',
  'finance',
  'health',
  'metabolic',
  'digital',
  'mindfulness',
  'reading',
]

const exportData = ref<ExportData>({
  entries: {},
  anomalies: [],
})

const selectedPrompt = ref<string | null>(null)

async function loadData() {
  if (!authStore.isUnlocked) return

  const entries: Partial<Record<DataDomain, DomainEntry[]>> = {}
  for (const domain of ALL_DOMAINS) {
    entries[domain] = await dataStore.getAllEntries(domain)
  }

  await insightsStore.refreshSummaries()

  exportData.value = {
    entries,
    anomalies: insightsStore.anomalies,
  }
}

function onPromptSelect(prompt: string) {
  selectedPrompt.value = prompt
  navigator.clipboard.writeText(prompt).catch(() => {
    // Silent fail - prompt is still shown
  })
}

onMounted(loadData)
</script>

<template>
  <div class="view-container">
    <h1>Export Data</h1>
    <p class="view-description">
      Export your life tracking data in LLM-optimized formats for AI analysis.
    </p>

    <div class="export-layout">
      <div class="export-main">
        <ExportModal :data="exportData" />
      </div>

      <div class="export-sidebar">
        <PromptLibrary @select="onPromptSelect" />

        <div v-if="selectedPrompt" class="selected-prompt">
          <h4>Copied Prompt</h4>
          <p class="prompt-text">{{ selectedPrompt }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.export-layout {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: 1fr;
}

@media (min-width: 1024px) {
  .export-layout {
    grid-template-columns: 2fr 1fr;
  }
}

.export-main {
  background: var(--color-surface, #1e1e3a);
  border: 1px solid var(--color-border, #2d2d4a);
  border-radius: var(--radius-md, 8px);
  padding: 1.25rem;
}

.export-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.export-sidebar > * {
  background: var(--color-surface, #1e1e3a);
  border: 1px solid var(--color-border, #2d2d4a);
  border-radius: var(--radius-md, 8px);
  padding: 1.25rem;
}

.selected-prompt {
  background: var(--color-primary-subtle, rgba(99, 102, 241, 0.1));
  border: 1px solid var(--color-primary, #6366f1);
  border-radius: var(--radius-md, 8px);
  padding: 1rem;
}

.selected-prompt h4 {
  margin: 0 0 0.5rem;
  font-size: 0.875rem;
  color: var(--color-primary, #6366f1);
}

.prompt-text {
  margin: 0;
  font-size: 0.8125rem;
  color: var(--color-text, #e4e4f0);
  line-height: 1.5;
}
</style>
