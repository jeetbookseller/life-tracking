<script setup lang="ts">
import { onMounted } from 'vue'
import SecuritySettings from '@/components/settings/SecuritySettings.vue'
import AppearanceSettings from '@/components/settings/AppearanceSettings.vue'
import DataManagementSettings from '@/components/settings/DataManagementSettings.vue'
import GoalsSettings from '@/components/settings/GoalsSettings.vue'
import HelpSettings from '@/components/settings/HelpSettings.vue'
import AboutSettings from '@/components/settings/AboutSettings.vue'
import ComingSoonSettings from '@/components/settings/ComingSoonSettings.vue'
import { useSettingsStore } from '@/stores/settings'

const settingsStore = useSettingsStore()

onMounted(() => {
  settingsStore.load()
})
</script>

<template>
  <div class="view-container">
    <h1>Settings</h1>
    <p class="view-description">Configure security, appearance, data management, goals, and more.</p>

    <div class="settings-sections">
      <SecuritySettings />
      <AppearanceSettings />
      <DataManagementSettings />
      <GoalsSettings />
      <HelpSettings />
      <AboutSettings />
      <ComingSoonSettings />
    </div>
  </div>
</template>

<style scoped>
.settings-sections {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  margin-top: var(--space-lg);
}
</style>
