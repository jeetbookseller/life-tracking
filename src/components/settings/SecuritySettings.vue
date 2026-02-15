<script setup lang="ts">
import { ref } from 'vue'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Modal from '@/components/ui/Modal.vue'
import { useAuthStore } from '@/stores/auth'
import { useSettingsStore } from '@/stores/settings'
import { deriveKey, generateSalt } from '@/utils/crypto'
import { reEncryptAllData } from '@/utils/reEncrypt'

const authStore = useAuthStore()
const settingsStore = useSettingsStore()

const showChangePasswordModal = ref(false)
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const passwordError = ref('')
const changingPassword = ref(false)
const passwordChanged = ref(false)

const lockTimeoutOptions = [
  { value: 0, label: 'Disabled' },
  { value: 5, label: '5 minutes' },
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 60, label: '1 hour' },
]

function onTimeoutChange(event: Event) {
  const value = Number((event.target as HTMLSelectElement).value)
  settingsStore.setAutoLockTimeout(value)
}

function openChangePassword() {
  currentPassword.value = ''
  newPassword.value = ''
  confirmPassword.value = ''
  passwordError.value = ''
  passwordChanged.value = false
  showChangePasswordModal.value = true
}

async function changePassword() {
  passwordError.value = ''
  passwordChanged.value = false

  // Validate
  if (!currentPassword.value) {
    passwordError.value = 'Current password is required'
    return
  }
  if (newPassword.value.length < 8) {
    passwordError.value = 'New password must be at least 8 characters'
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    passwordError.value = 'New passwords do not match'
    return
  }

  changingPassword.value = true
  try {
    // Verify current password by attempting to derive key with current salt
    const currentSalt = authStore.salt
    if (!currentSalt) {
      passwordError.value = 'No existing password found'
      return
    }

    try {
      // Verify current password can derive a key (validation step)
      await deriveKey(currentPassword.value, currentSalt)
    } catch {
      passwordError.value = 'Current password is incorrect'
      return
    }

    // Generate new salt and key
    const newSalt = generateSalt()
    const newKey = await deriveKey(newPassword.value, newSalt)

    // Use the current auth key (already verified by being unlocked) as the old key
    const currentKey = authStore.getKey()

    // Re-encrypt all data
    const result = await reEncryptAllData(currentKey, newKey)

    if (result.errors.length > 0) {
      passwordError.value = `Re-encryption had ${result.errors.length} errors. Password not changed.`
      return
    }

    // Update salt in localStorage
    let binary = ''
    for (let i = 0; i < newSalt.byteLength; i++) {
      binary += String.fromCharCode(newSalt[i]!)
    }
    localStorage.setItem('life-tracker-salt', btoa(binary))

    // Update auth store state
    authStore.salt = newSalt
    authStore.cryptoKey = newKey

    passwordChanged.value = true
  } catch (e) {
    passwordError.value = `Error: ${(e as Error).message}`
  } finally {
    changingPassword.value = false
  }
}
</script>

<template>
  <Card title="Security">
    <div class="settings-rows">
      <div class="settings-row">
        <div class="settings-row-label">
          <span>Master Password</span>
          <span class="settings-row-desc">Change your encryption password</span>
        </div>
        <Button size="sm" variant="secondary" @click="openChangePassword">
          Change Password
        </Button>
      </div>
      <div class="settings-row">
        <div class="settings-row-label">
          <span>Auto-Lock Timeout</span>
          <span class="settings-row-desc">Lock the app after a period of inactivity</span>
        </div>
        <select
          class="timeout-select"
          :value="settingsStore.autoLockTimeoutMinutes"
          @change="onTimeoutChange"
        >
          <option
            v-for="opt in lockTimeoutOptions"
            :key="opt.value"
            :value="opt.value"
          >
            {{ opt.label }}
          </option>
        </select>
      </div>
    </div>

    <!-- Change Password Modal -->
    <Modal
      :open="showChangePasswordModal"
      title="Change Master Password"
      @close="showChangePasswordModal = false"
    >
      <form class="password-form" @submit.prevent="changePassword">
        <div class="form-row">
          <label class="form-label">Current Password</label>
          <input
            v-model="currentPassword"
            type="password"
            class="form-input"
            autocomplete="current-password"
          />
        </div>
        <div class="form-row">
          <label class="form-label">New Password</label>
          <input
            v-model="newPassword"
            type="password"
            class="form-input"
            autocomplete="new-password"
          />
        </div>
        <div class="form-row">
          <label class="form-label">Confirm New Password</label>
          <input
            v-model="confirmPassword"
            type="password"
            class="form-input"
            autocomplete="new-password"
          />
        </div>
        <p v-if="passwordError" class="form-error">{{ passwordError }}</p>
        <p v-if="passwordChanged" class="form-success">Password changed successfully!</p>
      </form>
      <template #footer>
        <Button size="sm" variant="secondary" @click="showChangePasswordModal = false">
          Cancel
        </Button>
        <Button size="sm" :disabled="changingPassword" @click="changePassword">
          {{ changingPassword ? 'Changing...' : 'Change Password' }}
        </Button>
      </template>
    </Modal>
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

.timeout-select {
  padding: var(--space-xs) var(--space-sm);
  background: var(--color-surface-elevated);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  cursor: pointer;
}

.password-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.form-label {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  font-weight: 500;
}

.form-input {
  padding: var(--space-sm);
  background: var(--color-surface-elevated);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  width: 100%;
}

.form-error {
  font-size: var(--text-xs);
  color: var(--color-danger);
  margin: 0;
}

.form-success {
  font-size: var(--text-xs);
  color: var(--color-success);
  margin: 0;
}
</style>
