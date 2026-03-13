<template>
  <div :class="['message-bubble', message.role]">
    <div class="message-avatar">
      <el-avatar
        v-if="message.role === 'user'"
        :size="36"
        :icon="UserFilled"
        class="avatar-user"
      />
      <el-avatar
        v-else
        :size="36"
        class="avatar-assistant"
      >
        <el-icon><Monitor /></el-icon>
      </el-avatar>
    </div>
    <div class="message-body">
      <div class="message-header">
        <span class="role-label">{{ roleLabel }}</span>
        <span class="timestamp">{{ formattedTimestamp }}</span>
      </div>
      <el-card shadow="never" class="message-content-card">
        <div class="message-content">
          <MarkdownRenderer v-if="message.role === 'assistant'" :content="message.content" />
          <span v-else class="user-content">{{ message.content }}</span>
        </div>
        <div v-if="message.isStreaming" class="streaming-indicator">
          <TypingIndicator />
        </div>
        <div class="message-actions" v-if="canCopy && !message.isStreaming">
          <el-button
            text
            :icon="copied ? Check : DocumentCopy"
            size="small"
            @click="copyContent"
            class="copy-btn"
          >
            {{ copied ? 'Copied' : 'Copy' }}
          </el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { UserFilled, Monitor, DocumentCopy, Check } from '@element-plus/icons-vue'
import MarkdownRenderer from './MarkdownRenderer.vue'
import TypingIndicator from './TypingIndicator.vue'
import type { ChatMessage } from '../types/ollama'

interface Props {
  message: ChatMessage
}

const props = defineProps<Props>()

const copied = ref(false)
let copyTimeout: number | null = null

const roleLabel = computed(() => {
  return props.message.role === 'user' ? 'You' : 'AI Assistant'
})

const formattedTimestamp = computed(() => {
  const date = new Date(props.message.timestamp)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
})

const canCopy = computed(() => {
  return props.message.content.length > 0
})

function copyContent(): void {
  navigator.clipboard.writeText(props.message.content).then(() => {
    copied.value = true

    if (copyTimeout) {
      clearTimeout(copyTimeout)
    }

    copyTimeout = window.setTimeout(() => {
      copied.value = false
    }, 2000)
  })
}
</script>

<style scoped>
.message-bubble {
  display: flex;
  gap: 12px;
  max-width: 95%;
}

.message-bubble.user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.message-bubble.assistant {
  align-self: flex-start;
}

.message-avatar {
  flex-shrink: 0;
}

.avatar-user {
  background: var(--user-bubble-bg);
}

.avatar-assistant {
  background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
}

.message-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  flex: 1;
}

.message-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 4px;
}

.message-bubble.user .message-header {
  flex-direction: row-reverse;
}

.role-label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.timestamp {
  font-size: 0.75rem;
  color: var(--text-placeholder);
}

.message-content-card {
  border-radius: var(--radius-md);
  transition: box-shadow 0.2s ease;
}

.message-bubble.user .message-content-card {
  background: var(--user-bubble-bg);
  color: var(--user-bubble-text);
}

.message-bubble.assistant .message-content-card {
  background: var(--assistant-bubble-bg);
  color: var(--assistant-bubble-text);
}

.message-content-card :deep(.el-card__body) {
  padding: 14px 18px;
}

.message-content {
  word-wrap: break-word;
  overflow-wrap: break-word;
  line-height: 1.6;
}

.user-content {
  white-space: pre-wrap;
}

.streaming-indicator {
  display: flex;
  justify-content: center;
  padding-top: 8px;
}

.message-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 8px;
  margin-top: 8px;
  border-top: 1px solid var(--border-light);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.message-content-card:hover .message-actions {
  opacity: 1;
}

.message-bubble.user .message-actions {
  border-top-color: rgba(255, 255, 255, 0.2);
}

.copy-btn {
  font-size: 0.75rem;
}

.message-bubble.user .copy-btn {
  color: rgba(255, 255, 255, 0.8);
}

.message-bubble.user .copy-btn:hover {
  color: #ffffff;
}
</style>
