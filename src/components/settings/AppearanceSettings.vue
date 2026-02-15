<script setup lang="ts">
import Card from '@/components/ui/Card.vue'
import { useTheme } from '@/composables/useTheme'
import { useSettingsStore } from '@/stores/settings'
import type { FontSize } from '@/stores/settings'

const { currentTheme, toggleTheme } = useTheme()
const settingsStore = useSettingsStore()

const fontSizeOptions: { value: FontSize; label: string }[] = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
]

function onFontSizeChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value as FontSize
  settingsStore.setFontSize(value)
}
</script>

<template>
  <Card title="Appearance">
    <div class="settings-rows">
      <div class="settings-row">
        <div class="settings-row-label">
          <span>Theme</span>
          <span class="settings-row-desc">Switch between light and dark mode</span>
        </div>
        <button
          class="theme-toggle"
          :aria-label="`Switch to ${currentTheme === 'dark' ? 'light' : 'dark'} mode`"
          @click="toggleTheme"
        >
          <span class="theme-toggle-track" :class="{ active: currentTheme === 'light' }">
            <span class="theme-toggle-thumb" />
          </span>
          <span class="theme-toggle-label">{{ currentTheme === 'dark' ? 'Dark' : 'Light' }}</span>
        </button>
      </div>
      <div class="settings-row">
        <div class="settings-row-label">
          <span>Font Size</span>
          <span class="settings-row-desc">Adjust text size across the app</span>
        </div>
        <select
          class="font-size-select"
          :value="settingsStore.fontSize"
          @change="onFontSizeChange"
        >
          <option
            v-for="option in fontSizeOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
      </div>
    </div>
  </Card>
</template>

<style scoped>
.settings-rows {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.settings-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-md);
}

.settings-row-label {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.settings-row-label > span:first-child {
  font-size: var(--text-sm);
  font-weight: 500;
}

.settings-row-desc {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
}

.theme-toggle {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text);
}

.theme-toggle-track {
  position: relative;
  width: 44px;
  height: 24px;
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  transition: background var(--transition-fast);
}

.theme-toggle-track.active {
  background: var(--color-primary);
}

.theme-toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  background: var(--color-text);
  border-radius: 50%;
  transition: transform var(--transition-fast);
}

.theme-toggle-track.active .theme-toggle-thumb {
  transform: translateX(20px);
  background: #fff;
}

.theme-toggle-label {
  font-size: var(--text-sm);
  min-width: 3rem;
}

.font-size-select {
  padding: var(--space-xs) var(--space-sm);
  background: var(--color-surface-elevated);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  cursor: pointer;
}
</style>
