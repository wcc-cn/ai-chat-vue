<template>
  <el-card shadow="never" class="model-selector-card">
    <template #header>
      <div class="card-header">
        <el-icon><Cpu /></el-icon>
        <span>Select AI Model</span>
      </div>
    </template>

    <el-select
      v-model="localSelectedModel"
      placeholder="Choose a model"
      :disabled="isLoading || models.length === 0"
      :loading="isLoading"
      @change="handleModelChange"
      class="model-select"
      size="large"
    >
      <template #prefix>
        <el-icon><Box /></el-icon>
      </template>
      <el-option
        v-for="model in models"
        :key="model.name"
        :label="model.name"
        :value="model.name"
      >
        <div class="model-option">
          <span class="model-name">{{ model.name }}</span>
          <span class="model-size">{{ formatSize(model.size) }}</span>
        </div>
      </el-option>
    </el-select>

    <el-descriptions
      v-if="currentModel"
      :column="1"
      border
      size="small"
      class="model-info"
    >
      <el-descriptions-item label="Size">
        {{ formatSize(currentModel.size) }}
      </el-descriptions-item>
      <el-descriptions-item label="Updated">
        {{ formatDate(currentModel.modified_at) }}
      </el-descriptions-item>
    </el-descriptions>

    <el-button
      v-if="!isLoading && models.length === 0"
      type="primary"
      :icon="Refresh"
      @click="$emit('refresh')"
      class="refresh-btn"
    >
      Refresh Models
    </el-button>
  </el-card>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Cpu, Box, Refresh } from '@element-plus/icons-vue'
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

const localSelectedModel = ref(props.selectedModel)

watch(() => props.selectedModel, (newVal) => {
  localSelectedModel.value = newVal
})

const currentModel = computed(() => {
  return props.models.find(m => m.name === props.selectedModel) || null
})

function handleModelChange(value: string): void {
  emit('select', value)
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
.model-selector-card {
  background-color: var(--card-bg);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: var(--text-color);
}

.model-select {
  width: 100%;
}

.model-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.model-name {
  font-weight: 500;
}

.model-size {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.model-info {
  margin-top: 12px;
}

.model-info :deep(.el-descriptions__label) {
  width: 80px;
  font-weight: 500;
}

.refresh-btn {
  width: 100%;
  margin-top: 12px;
}
</style>
