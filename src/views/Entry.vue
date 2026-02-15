<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDataStore } from '@/stores/data'
import type { DataDomain, DomainEntry } from '@/types/data-models'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import ErrorMessage from '@/components/ui/ErrorMessage.vue'
import ProductivityForm from '@/components/forms/ProductivityForm.vue'
import FinanceForm from '@/components/forms/FinanceForm.vue'
import HealthForm from '@/components/forms/HealthForm.vue'
import MetabolicForm from '@/components/forms/MetabolicForm.vue'
import DigitalForm from '@/components/forms/DigitalForm.vue'
import MindfulnessForm from '@/components/forms/MindfulnessForm.vue'
import ReadingForm from '@/components/forms/ReadingForm.vue'

const dataStore = useDataStore()

const domains: { key: DataDomain; label: string; icon: string }[] = [
  { key: 'productivity', label: 'Productivity', icon: '📋' },
  { key: 'finance', label: 'Finance', icon: '💰' },
  { key: 'health', label: 'Health', icon: '❤️' },
  { key: 'metabolic', label: 'Metabolic', icon: '🧬' },
  { key: 'digital', label: 'Digital', icon: '📱' },
  { key: 'mindfulness', label: 'Mindfulness', icon: '🧘' },
  { key: 'reading', label: 'Reading', icon: '📚' },
]

const activeDomain = ref<DataDomain>('productivity')
const editingEntry = ref<DomainEntry | null>(null)
const saveSuccess = ref(false)
const saveError = ref<string | null>(null)
const copyData = ref<Partial<DomainEntry> | null>(null)

const activeDomainLabel = computed(
  () => domains.find((d) => d.key === activeDomain.value)?.label ?? '',
)

function selectDomain(domain: DataDomain) {
  activeDomain.value = domain
  editingEntry.value = null
  saveSuccess.value = false
  saveError.value = null
  copyData.value = null
}

const initialData = computed(() => {
  if (editingEntry.value) return editingEntry.value
  if (copyData.value) return copyData.value
  return undefined
})

async function handleSave(data: Record<string, unknown> & { date: string }) {
  saveError.value = null
  saveSuccess.value = false

  try {
    if (editingEntry.value) {
      await dataStore.updateEntry(activeDomain.value, editingEntry.value.id, data as Partial<DomainEntry>)
    } else {
      await dataStore.addEntry(activeDomain.value, data)
    }
    saveSuccess.value = true
    editingEntry.value = null
    copyData.value = null
    setTimeout(() => {
      saveSuccess.value = false
    }, 3000)
  } catch (e) {
    saveError.value = (e as Error).message
  }
}

function handleCancel() {
  editingEntry.value = null
  copyData.value = null
  saveSuccess.value = false
  saveError.value = null
}

async function copyFromYesterday() {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]!
  const today = new Date().toISOString().split('T')[0]!

  try {
    const entries = await dataStore.getEntriesByDateRange(
      activeDomain.value,
      yesterdayStr,
      yesterdayStr,
    )
    if (entries.length > 0) {
      const entry = entries[0]!
      const { id: _id, createdAt: _ca, updatedAt: _ua, date: _date, ...rest } = entry as unknown as Record<string, unknown>
      copyData.value = { ...rest, date: today } as Partial<DomainEntry>
    } else {
      saveError.value = 'No entry found for yesterday'
    }
  } catch (e) {
    saveError.value = (e as Error).message
  }
}
</script>

<template>
  <div class="view-container">
    <div class="entry-header">
      <h1>Log Entry</h1>
      <p class="view-description">Record your daily metrics across all life domains.</p>
    </div>

    <div class="domain-tabs" data-testid="domain-tabs">
      <button
        v-for="domain in domains"
        :key="domain.key"
        class="domain-tab"
        :class="{ 'domain-tab--active': activeDomain === domain.key }"
        @click="selectDomain(domain.key)"
        :data-testid="`tab-${domain.key}`"
      >
        <span class="tab-icon">{{ domain.icon }}</span>
        <span class="tab-label">{{ domain.label }}</span>
      </button>
    </div>

    <Card :title="activeDomainLabel">
      <template #header-actions>
        <Button size="sm" variant="secondary" @click="copyFromYesterday" data-testid="copy-yesterday">
          Copy from Yesterday
        </Button>
      </template>

      <div v-if="saveSuccess" class="success-message" data-testid="save-success">
        Entry saved successfully!
      </div>

      <ErrorMessage v-if="saveError" :message="saveError" />

      <ProductivityForm
        v-if="activeDomain === 'productivity'"
        :initial-data="initialData"
        @save="handleSave"
        @cancel="handleCancel"
      />

      <FinanceForm
        v-if="activeDomain === 'finance'"
        :initial-data="initialData"
        @save="handleSave"
        @cancel="handleCancel"
      />

      <HealthForm
        v-if="activeDomain === 'health'"
        :initial-data="initialData"
        @save="handleSave"
        @cancel="handleCancel"
      />

      <MetabolicForm
        v-if="activeDomain === 'metabolic'"
        :initial-data="initialData"
        @save="handleSave"
        @cancel="handleCancel"
      />

      <DigitalForm
        v-if="activeDomain === 'digital'"
        :initial-data="initialData"
        @save="handleSave"
        @cancel="handleCancel"
      />

      <MindfulnessForm
        v-if="activeDomain === 'mindfulness'"
        :initial-data="initialData"
        @save="handleSave"
        @cancel="handleCancel"
      />

      <ReadingForm
        v-if="activeDomain === 'reading'"
        :initial-data="initialData"
        @save="handleSave"
        @cancel="handleCancel"
      />
    </Card>
  </div>
</template>

<style scoped>
.entry-header {
  margin-bottom: var(--space-lg);
}

.domain-tabs {
  display: flex;
  gap: var(--space-xs);
  margin-bottom: var(--space-lg);
  overflow-x: auto;
  padding-bottom: var(--space-xs);
  -webkit-overflow-scrolling: touch;
}

.domain-tab {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-sm) var(--space-md);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  font-family: var(--font-sans);
  cursor: pointer;
  white-space: nowrap;
  transition: all var(--transition-fast);
}

.domain-tab:hover {
  background: var(--color-surface-elevated);
}

.domain-tab--active {
  background: var(--color-primary-subtle);
  border-color: var(--color-primary);
  color: var(--color-text);
}

.tab-icon {
  font-size: var(--text-base);
}

.tab-label {
  font-weight: 500;
}

.success-message {
  padding: var(--space-sm) var(--space-md);
  background: rgba(76, 175, 80, 0.1);
  border: 1px solid var(--color-success);
  border-radius: var(--radius-sm);
  color: var(--color-success);
  font-size: var(--text-sm);
  margin-bottom: var(--space-md);
}

@media (max-width: 640px) {
  .domain-tabs {
    gap: var(--space-xs);
  }

  .domain-tab {
    padding: var(--space-xs) var(--space-sm);
    font-size: var(--text-xs);
  }

  .tab-label {
    display: none;
  }

  .tab-icon {
    font-size: var(--text-lg);
  }
}
</style>
