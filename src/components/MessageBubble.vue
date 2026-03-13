<template>
  <div :class="['message-bubble', message.role]">
    <div class="message-header">
      <span class="role-badge">{{ roleLabel }}</span>
      <span class="timestamp">{{ formattedTimestamp }}</span>
    </div>
    <div class="message-content">
      <MarkdownRenderer v-if="message.role === 'assistant'" :content="message.content" />
      <span v-else class="user-content">{{ message.content }}</span>
    </div>
    <div v-if="message.isStreaming" class="streaming-indicator">
      <TypingIndicator />
    </div>
    <button
      v-if="canCopy"
      class="copy-button"
      @click="copyContent"
      title="Copy to clipboard"
    >
      <span v-if="!copied">Copy</span>
      <span v-else>Copied!</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
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
  return props.message.role === 'user' ? 'You' : 'AI'
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
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  border-radius: 12px;
  margin: 0.5rem 0;
  max-width: 100%;
  position: relative;
}

.message-bubble.user {
  background-color: var(--user-bubble-bg, #3b82f6);
  color: var(--user-bubble-text, #ffffff);
  align-self: flex-end;
}

.message-bubble.assistant {
  background-color: var(--assistant-bubble-bg, #f3f4f6);
  color: var(--assistant-bubble-text, #1f2937);
  align-self: flex-start;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  opacity: 0.8;
}

.role-badge {
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.timestamp {
  font-size: 0.7rem;
}

.message-content {
  flex: 1;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.user-content {
  white-space: pre-wrap;
}

.streaming-indicator {
  display: flex;
  justify-content: center;
  padding: 0.5rem 0;
}

:deep(.typing-indicator) {
  padding: 0.5rem;
}

:deep(.dot) {
  background-color: var(--streaming-dot-color, #9ca3af);
}

.user :deep(.dot) {
  background-color: rgba(255, 255, 255, 0.7);
}

.copy-button {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  background-color: rgba(255, 255, 255, 0.2);
  color: inherit;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.message-bubble:hover .copy-button {
  opacity: 1;
}

.copy-button:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

.copy-button:active {
  transform: scale(0.95);
}

.assistant .copy-button {
  background-color: rgba(0, 0, 0, 0.1);
  color: var(--copy-button-text, #374151);
  border-color: rgba(0, 0, 0, 0.2);
}

.assistant .copy-button:hover {
  background-color: rgba(0, 0, 0, 0.15);
}
</style>
