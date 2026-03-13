<template>
  <div class="model-selector">
    <label for="model-select" class="model-label">Select AI Model</label>
    <select
      id="model-select"
      :value="selectedModel"
      @change="handleModelChange"
      :disabled="isLoading || models.length === 0"
      class="model-select"
    >
      <option v-if="isLoading" value="" disabled>
        Loading models...
      </option>
      <option v-else-if="models.length === 0" value="" disabled>
        No models available
      </option>
      <option
        v-for="model in models"
        :key="model.name"
        :value="model.name"
      >
        {{ model.name }}
      </option>
    </select>

    <div v-if="currentModel" class="model-info">
      <div class="model-info-item">
        <span class="info-label">Size:</span>
        <span class="info-value">{{ formatSize(currentModel.size) }}</span>
      </div>
      <div class="model-info-item">
        <span class="info-label">Updated:</span>
        <span class="info-value">{{ formatDate(currentModel.modified_at) }}</span>
      </div>
    </div>

    <button
      v-if="!isLoading && models.length === 0"
      @click="$emit('refresh')"
      class="refresh-button"
    >
      Refresh Models
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { OllamaModel } from '../types/ollama'

interface Props {
  models: OllamaModel[]
  selectedModel: string
  isLoading: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'select': [modelName: string]
  'refresh': []
}>()

const currentModel = computed(() => {
  return props.models.find(m => m.name === props.selectedModel) || null
})

function handleModelChange(event: Event): void {
  const target = event.target as HTMLSelectElement
  emit('select', target.value)
}

function formatSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  }
  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return 'Today'
  }
  if (diffDays === 1) {
    return 'Yesterday'
  }
  if (diffDays < 7) {
    return `${diffDays} days ago`
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

<style scoped>
.model-selector {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  background-color: var(--model-selector-bg, #ffffff);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 8px;
}

.model-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-color, #1f2937);
}

.model-select {
  padding: 0.625rem;
  font-size: 0.875rem;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 6px;
  background-color: var(--input-bg, #ffffff);
  color: var(--text-color, #1f2937);
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.model-select:hover:not(:disabled) {
  border-color: var(--hover-border-color, #9ca3af);
}

.model-select:focus {
  outline: none;
  border-color: var(--focus-color, #3b82f6);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.model-select:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.model-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem;
  background-color: var(--model-info-bg, #f9fafb);
  border-radius: 6px;
  font-size: 0.75rem;
}

.model-info-item {
  display: flex;
  justify-content: space-between;
}

.info-label {
  color: var(--info-label-color, #6b7280);
}

.info-value {
  color: var(--info-value-color, #1f2937);
  font-weight: 500;
}

.refresh-button {
  padding: 0.625rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--refresh-text, #3b82f6);
  background-color: var(--refresh-bg, #eff6ff);
  border: 1px solid var(--refresh-border, #bfdbfe);
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.refresh-button:hover {
  background-color: var(--refresh-hover-bg, #dbeafe);
  border-color: var(--refresh-hover-border, #93c5fd);
}

.refresh-button:active {
  transform: translateY(1px);
}
</style>
