<script setup lang="ts">
import { ref } from 'vue'
import Card from '@/components/ui/Card.vue'

const openSection = ref<string | null>(null)

function toggleSection(section: string) {
  openSection.value = openSection.value === section ? null : section
}

const tabDescriptions = [
  {
    id: 'dashboard',
    icon: '📊',
    name: 'Dashboard',
    description:
      'Your daily metrics at a glance — 7 metric cards with deltas, 8 charts, time range filtering.',
  },
  {
    id: 'log-entry',
    icon: '✏️',
    name: 'Log Entry',
    description:
      'Record daily data across 7 domains. "Copy from Yesterday" to speed up entry.',
  },
  {
    id: 'insights',
    icon: '💡',
    name: 'Insights',
    description:
      'Discover trends — anomaly alerts, week-over-week comparisons, goal progress, correlations, personal bests, streaks.',
  },
  {
    id: 'export',
    icon: '📤',
    name: 'Export',
    description:
      'Export data in LLM-optimized formats (Markdown-KV, JSON, CSV) for AI analysis. Includes prompt library.',
  },
  {
    id: 'settings',
    icon: '⚙️',
    name: 'Settings',
    description:
      'Configure security, appearance, goals, data management, and view help.',
  },
]

const importGuides = [
  {
    id: 'fitbit',
    name: 'Fitbit (Health domain)',
    steps: [
      'Export your data from fitbit.com (Settings → Data Export)',
      'Upload the CSV or JSON file in Settings → Data Management → Import',
      'Select "Fitbit" as the source preset',
      'Fields are auto-mapped: resting HR, HRV, sleep duration, active minutes, steps',
      'Review the preview and click Confirm to import',
    ],
  },
  {
    id: 'monarch',
    name: 'Monarch Money (Finance domain)',
    steps: [
      'Export your data from Monarch Money (Settings → Export)',
      'Upload the CSV file in Settings → Data Management → Import',
      'Select "Monarch Money" as the source preset',
      'Fields are auto-mapped: total assets, liabilities, net worth',
      'Review the preview and click Confirm to import',
    ],
  },
  {
    id: 'manual',
    name: 'Other Apps (Manual mapping)',
    steps: [
      'Export data from your app as CSV, JSON, or TSV',
      'Upload the file in Settings → Data Management → Import',
      'Select "Manual Mapping" as the source',
      'Choose the target domain for your data',
      'Map each column/field to the corresponding domain field',
      'Set conflict policy: skip (keep existing), replace (overwrite), or merge (fill gaps)',
      'Review the preview and click Confirm to import',
    ],
  },
]
</script>

<template>
  <Card title="Help">
    <div class="help-content">
      <!-- Section A: Tab descriptions -->
      <button class="accordion-trigger" @click="toggleSection('tabs')">
        <span class="accordion-label">What Each Tab Does</span>
        <span class="accordion-icon">{{ openSection === 'tabs' ? '−' : '+' }}</span>
      </button>
      <div v-if="openSection === 'tabs'" class="accordion-body">
        <div
          v-for="tab in tabDescriptions"
          :key="tab.id"
          class="help-tab-item"
        >
          <span class="help-tab-icon">{{ tab.icon }}</span>
          <div class="help-tab-info">
            <strong>{{ tab.name }}</strong>
            <p>{{ tab.description }}</p>
          </div>
        </div>
      </div>

      <!-- Section B: Import guides -->
      <button class="accordion-trigger" @click="toggleSection('import')">
        <span class="accordion-label">How to Import Data from Apps</span>
        <span class="accordion-icon">{{ openSection === 'import' ? '−' : '+' }}</span>
      </button>
      <div v-if="openSection === 'import'" class="accordion-body">
        <div
          v-for="guide in importGuides"
          :key="guide.id"
          class="import-guide"
        >
          <h4 class="guide-title">{{ guide.name }}</h4>
          <ol class="guide-steps">
            <li v-for="(step, i) in guide.steps" :key="i">{{ step }}</li>
          </ol>
        </div>
      </div>
    </div>
  </Card>
</template>

<style scoped>
.help-content {
  display: flex;
  flex-direction: column;
}

.accordion-trigger {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: var(--space-md) 0;
  background: none;
  border: none;
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text);
  cursor: pointer;
  font-size: var(--text-sm);
  font-weight: 500;
  text-align: left;
}

.accordion-trigger:hover {
  color: var(--color-primary);
}

.accordion-icon {
  font-size: var(--text-lg);
  color: var(--color-text-secondary);
}

.accordion-body {
  padding: var(--space-md) 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.help-tab-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
}

.help-tab-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.help-tab-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.help-tab-info strong {
  font-size: var(--text-sm);
}

.help-tab-info p {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  margin: 0;
}

.import-guide {
  padding: var(--space-sm) 0;
}

.guide-title {
  font-size: var(--text-sm);
  font-weight: 600;
  margin-bottom: var(--space-sm);
}

.guide-steps {
  padding-left: var(--space-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.guide-steps li {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  line-height: 1.5;
}
</style>
