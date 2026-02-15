<script setup lang="ts">
import { PROMPT_SUGGESTIONS } from '@/utils/export'

const emit = defineEmits<{
  select: [prompt: string]
}>()

function selectPrompt(prompt: string) {
  emit('select', prompt)
}
</script>

<template>
  <div class="prompt-library" data-testid="prompt-library">
    <h3 class="prompt-library-title">Prompt Suggestions</h3>
    <p class="prompt-library-desc">
      Click a prompt to copy it. Paste into ChatGPT or Claude along with your exported data.
    </p>
    <div class="prompt-list">
      <button
        v-for="(suggestion, index) in PROMPT_SUGGESTIONS"
        :key="index"
        class="prompt-item"
        :data-testid="`prompt-item-${index}`"
        @click="selectPrompt(suggestion.prompt)"
      >
        <span class="prompt-title">{{ suggestion.title }}</span>
        <span class="prompt-description">{{ suggestion.description }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.prompt-library {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.prompt-library-title {
  margin: 0;
  font-size: 1rem;
  color: var(--color-text, #e4e4f0);
}

.prompt-library-desc {
  margin: 0;
  font-size: 0.8125rem;
  color: var(--color-text-secondary, #9a9ab0);
}

.prompt-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.prompt-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
  padding: 0.75rem;
  background: var(--color-surface, #1e1e3a);
  border: 1px solid var(--color-border, #2d2d4a);
  border-radius: var(--radius-sm, 6px);
  cursor: pointer;
  color: var(--color-text, #e4e4f0);
  text-align: left;
  width: 100%;
  transition: border-color 0.15s;
}

.prompt-item:hover {
  border-color: var(--color-primary, #6366f1);
}

.prompt-title {
  font-weight: 600;
  font-size: 0.875rem;
}

.prompt-description {
  font-size: 0.75rem;
  color: var(--color-text-secondary, #9a9ab0);
}
</style>
