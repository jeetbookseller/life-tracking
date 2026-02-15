<script setup lang="ts">
import { ref } from 'vue'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Modal from '@/components/ui/Modal.vue'
import MappingWizard from '@/components/settings/MappingWizard.vue'
import { db, TABLE_NAMES } from '@/db/schema'

const showImportModal = ref(false)
const showClearModal = ref(false)
const clearConfirmText = ref('')
const clearError = ref('')
const dbStats = ref<{ table: string; count: number }[]>([])
const statsLoaded = ref(false)
const exporting = ref(false)
const clearing = ref(false)

async function loadStats() {
  const stats: { table: string; count: number }[] = []
  for (const tableName of TABLE_NAMES) {
    const count = await db.table(tableName).count()
    stats.push({ table: tableName, count })
  }
  dbStats.value = stats
  statsLoaded.value = true
}

loadStats()

function formatTableName(name: string): string {
  return name
    .replace(/_logs$/, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

async function exportDatabase() {
  exporting.value = true
  try {
    const data: Record<string, unknown[]> = {}
    for (const tableName of TABLE_NAMES) {
      data[tableName] = await db.table(tableName).toArray()
    }

    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `life-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } finally {
    exporting.value = false
  }
}

async function clearAllData() {
  clearError.value = ''
  if (clearConfirmText.value !== 'DELETE') {
    clearError.value = 'Please type DELETE to confirm'
    return
  }

  clearing.value = true
  try {
    for (const tableName of TABLE_NAMES) {
      await db.table(tableName).clear()
    }
    // Clear localStorage goals
    localStorage.removeItem('life-tracker-goals')

    clearConfirmText.value = ''
    showClearModal.value = false
    await loadStats()
  } finally {
    clearing.value = false
  }
}
</script>

<template>
  <Card title="Data Management">
    <div class="data-mgmt-content">
      <div class="data-mgmt-actions">
        <div class="action-row">
          <div class="action-info">
            <span class="action-title">Import Data</span>
            <span class="action-desc">Import CSV or JSON files using the mapping wizard</span>
          </div>
          <Button size="sm" variant="secondary" @click="showImportModal = true">
            Import
          </Button>
        </div>
        <div class="action-row">
          <div class="action-info">
            <span class="action-title">Export Backup</span>
            <span class="action-desc">Download a full database backup as JSON</span>
          </div>
          <Button size="sm" variant="secondary" :disabled="exporting" @click="exportDatabase">
            {{ exporting ? 'Exporting...' : 'Export' }}
          </Button>
        </div>
        <div class="action-row">
          <div class="action-info">
            <span class="action-title">Clear All Data</span>
            <span class="action-desc">Permanently delete all entries from all domains</span>
          </div>
          <Button size="sm" variant="danger" @click="showClearModal = true">
            Clear
          </Button>
        </div>
      </div>

      <div v-if="statsLoaded" class="db-stats">
        <h4 class="stats-title">Database Statistics</h4>
        <div class="stats-grid">
          <div v-for="stat in dbStats" :key="stat.table" class="stat-row">
            <span class="stat-label">{{ formatTableName(stat.table) }}</span>
            <span class="stat-value">{{ stat.count }} {{ stat.count === 1 ? 'entry' : 'entries' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Import Modal -->
    <Modal :open="showImportModal" title="Import Data" @close="showImportModal = false">
      <MappingWizard @complete="showImportModal = false; loadStats()" />
    </Modal>

    <!-- Clear Confirmation Modal -->
    <Modal :open="showClearModal" title="Clear All Data" @close="showClearModal = false">
      <div class="clear-modal-content">
        <p class="clear-warning">
          This will permanently delete <strong>all entries</strong> from all domains.
          This action cannot be undone.
        </p>
        <p class="clear-instruction">
          Type <strong>DELETE</strong> to confirm:
        </p>
        <input
          v-model="clearConfirmText"
          type="text"
          class="clear-input"
          placeholder="Type DELETE"
        />
        <p v-if="clearError" class="clear-error">{{ clearError }}</p>
      </div>
      <template #footer>
        <Button size="sm" variant="secondary" @click="showClearModal = false">Cancel</Button>
        <Button size="sm" variant="danger" :disabled="clearing" @click="clearAllData">
          {{ clearing ? 'Clearing...' : 'Clear All Data' }}
        </Button>
      </template>
    </Modal>
  </Card>
</template>

<style scoped>
.data-mgmt-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.data-mgmt-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.action-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-md);
}

.action-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.action-title {
  font-size: var(--text-sm);
  font-weight: 500;
}

.action-desc {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
}

.db-stats {
  border-top: 1px solid var(--color-border);
  padding-top: var(--space-md);
}

.stats-title {
  font-size: var(--text-sm);
  font-weight: 600;
  margin-bottom: var(--space-sm);
}

.stats-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.stat-row {
  display: flex;
  justify-content: space-between;
  font-size: var(--text-sm);
  padding: var(--space-xs) 0;
}

.stat-label {
  color: var(--color-text-secondary);
}

.stat-value {
  color: var(--color-text);
  font-variant-numeric: tabular-nums;
}

.clear-modal-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.clear-warning {
  font-size: var(--text-sm);
  color: var(--color-danger);
  margin: 0;
}

.clear-instruction {
  font-size: var(--text-sm);
  margin: 0;
}

.clear-input {
  padding: var(--space-sm);
  background: var(--color-surface-elevated);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  width: 100%;
}

.clear-error {
  font-size: var(--text-xs);
  color: var(--color-danger);
  margin: 0;
}
</style>
