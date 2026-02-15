<script setup lang="ts">
import { ref } from 'vue'

const STORAGE_KEY = 'life-tracker-welcome-seen'

const show = ref(!localStorage.getItem(STORAGE_KEY))

const tabs = [
  { icon: '\u{1F4CA}', name: 'Dashboard', desc: 'Your daily metrics at a glance with charts and trend indicators' },
  { icon: '\u{270F}\u{FE0F}', name: 'Log Entry', desc: 'Record daily data across 7 domains with quick-entry shortcuts' },
  { icon: '\u{1F4A1}', name: 'Insights', desc: 'Discover trends, anomalies, correlations, and track goal progress' },
  { icon: '\u{1F4E4}', name: 'Export', desc: 'Export data in LLM-optimized formats for AI-powered analysis' },
  { icon: '\u{2699}\u{FE0F}', name: 'Settings', desc: 'Configure security, appearance, goals, and data management' },
]

function dismiss() {
  localStorage.setItem(STORAGE_KEY, 'true')
  show.value = false
}
</script>

<template>
  <Teleport to="body">
    <Transition name="welcome-fade">
      <div v-if="show" class="welcome-modal">
        <div class="welcome-overlay" />
        <div class="welcome-container" role="dialog" aria-modal="true" aria-labelledby="welcome-title">
          <div class="welcome-header">
            <h1 id="welcome-title" class="welcome-title">Welcome to Life Tracker</h1>
          </div>

          <div class="welcome-body">
            <p class="welcome-description">
              A private, encrypted life-tracking app that runs entirely in your browser.
              Track productivity, finances, health, metabolic data, digital wellbeing,
              mindfulness, and reading — all stored locally with AES-256 encryption.
            </p>

            <div class="welcome-tabs">
              <h2 class="welcome-tabs-heading">What you can do</h2>
              <ul class="welcome-tab-list">
                <li v-for="tab in tabs" :key="tab.name" class="welcome-tab-item">
                  <span class="welcome-tab-icon">{{ tab.icon }}</span>
                  <div class="welcome-tab-info">
                    <strong class="welcome-tab-name">{{ tab.name }}</strong>
                    <span class="welcome-tab-desc">{{ tab.desc }}</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div class="welcome-footer">
            <button class="welcome-get-started" @click="dismiss">Get Started</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.welcome-modal {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: var(--space-lg, 1.5rem);
}

.welcome-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
}

.welcome-container {
  position: relative;
  background: var(--color-surface, #1e1e2e);
  border: 1px solid var(--color-border, #333);
  border-radius: var(--radius-lg, 12px);
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
}

.welcome-header {
  padding: var(--space-lg, 1.5rem) var(--space-lg, 1.5rem) 0;
  text-align: center;
}

.welcome-title {
  font-size: var(--text-xl, 1.5rem);
  font-weight: 700;
  margin: 0;
  color: var(--color-text, #fff);
}

.welcome-body {
  padding: var(--space-lg, 1.5rem);
}

.welcome-description {
  color: var(--color-text-secondary, #aaa);
  line-height: 1.6;
  margin: 0 0 var(--space-lg, 1.5rem);
  text-align: center;
}

.welcome-tabs-heading {
  font-size: var(--text-md, 1rem);
  font-weight: 600;
  margin: 0 0 var(--space-md, 1rem);
  color: var(--color-text, #fff);
}

.welcome-tab-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm, 0.5rem);
}

.welcome-tab-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm, 0.5rem);
  padding: var(--space-sm, 0.5rem);
  border-radius: var(--radius-md, 8px);
  background: var(--color-bg, #121212);
}

.welcome-tab-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
  width: 2rem;
  text-align: center;
}

.welcome-tab-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.welcome-tab-name {
  color: var(--color-text, #fff);
  font-size: var(--text-sm, 0.875rem);
}

.welcome-tab-desc {
  color: var(--color-text-secondary, #aaa);
  font-size: var(--text-xs, 0.75rem);
  line-height: 1.4;
}

.welcome-footer {
  padding: 0 var(--space-lg, 1.5rem) var(--space-lg, 1.5rem);
  display: flex;
  justify-content: center;
}

.welcome-get-started {
  background: var(--color-primary, #6366f1);
  color: #fff;
  border: none;
  border-radius: var(--radius-md, 8px);
  padding: var(--space-sm, 0.5rem) var(--space-xl, 2rem);
  font-size: var(--text-md, 1rem);
  font-weight: 600;
  cursor: pointer;
  transition: background var(--transition-fast, 150ms);
  width: 100%;
}

.welcome-get-started:hover {
  background: var(--color-primary-hover, #4f46e5);
}

.welcome-fade-enter-active,
.welcome-fade-leave-active {
  transition: opacity 300ms;
}

.welcome-fade-enter-from,
.welcome-fade-leave-to {
  opacity: 0;
}
</style>
