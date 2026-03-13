<template>
  <el-card shadow="never" class="font-size-selector">
    <template #header>
      <div class="card-header">
        <el-icon><EditPen /></el-icon>
        <span>Font Size</span>
      </div>
    </template>

    <el-radio-group v-model="localFontSize" @change="handleChange" class="font-size-group">
      <el-radio-button value="small">
        <span class="size-label">Small</span>
      </el-radio-button>
      <el-radio-button value="medium">
        <span class="size-label">Medium</span>
      </el-radio-button>
      <el-radio-button value="large">
        <span class="size-label">Large</span>
      </el-radio-button>
    </el-radio-group>
  </el-card>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { EditPen } from '@element-plus/icons-vue'
import { useSettingsStore, type FontSize as FontSizeType } from '../stores/settings'

const settingsStore = useSettingsStore()

const localFontSize = ref<FontSizeType>(settingsStore.fontSize)

watch(() => settingsStore.fontSize, (newVal) => {
  localFontSize.value = newVal
})

function handleChange(value: FontSizeType): void {
  settingsStore.setFontSize(value)
}
</script>

<style scoped>
.font-size-selector {
  background-color: var(--card-bg);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: var(--text-color);
}

.font-size-group {
  width: 100%;
  display: flex;
}

.font-size-group :deep(.el-radio-button) {
  flex: 1;
}

.font-size-group :deep(.el-radio-button__inner) {
  width: 100%;
}

.size-label {
  font-size: 0.875rem;
}
</style>
