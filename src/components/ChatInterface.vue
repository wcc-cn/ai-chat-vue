<template>
  <div class="chat-interface">
    <aside class="sidebar">
      <div class="sidebar-header">
        <h1 class="app-title">AI Chat</h1>
        <p class="app-subtitle">Powered by Ollama</p>
      </div>

      <div class="model-section">
        <ModelSelector
          :models="chatStore.availableModels"
          :selected-model="chatStore.selectedModel"
          :is-loading="chatStore.isLoading"
          @select="chatStore.setModel"
          @refresh="refreshModels"
        />
      </div>

      <div class="actions-section">
        <button
          @click="handleClearChat"
          class="action-button"
          :disabled="!chatStore.hasMessages"
        >
          Clear Chat
        </button>
      </div>

      <div v-if="chatStore.error" class="error-section">
        <div class="error-message">
          {{ chatStore.error }}
        </div>
        <button
          @click="handleRetry"
          class="retry-button"
        >
          Retry
        </button>
      </div>
    </aside>

    <main class="chat-main">
      <div class="messages-container" ref="messagesContainer">
        <div v-if="!chatStore.hasMessages" class="empty-state">
          <div class="empty-state-icon">💬</div>
          <h2 class="empty-state-title">Start a conversation</h2>
          <p class="empty-state-text">
            {{ chatStore.isReady ? 'Type a message below to begin chatting.' : 'Select a model to start.' }}
          </p>
        </div>

        <MessageBubble
          v-for="message in chatStore.messages"
          :key="message.id"
          :message="message"
        />

        <div v-if="chatStore.isTyping" class="typing-wrapper">
          <div class="typing-message">
            <TypingIndicator />
          </div>
        </div>
      </div>

      <div class="input-section">
        <form @submit.prevent="handleSubmit" class="message-form">
          <div class="input-wrapper">
            <textarea
              v-model="userInput"
              placeholder="Type your message..."
              :disabled="!chatStore.isReady || chatStore.isTyping"
              class="message-input"
              rows="1"
              @keydown="handleKeyDown"
              ref="textareaRef"
            />
          </div>
          <button
            type="submit"
            class="send-button"
            :disabled="!canSend"
            :title="canSend ? 'Send message' : 'Enter a message'"
          >
            <span v-if="!chatStore.isTyping">Send</span>
            <span v-else>Sending...</span>
          </button>
        </form>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useChatStore } from '../stores/chat'
import ModelSelector from './ModelSelector.vue'
import MessageBubble from './MessageBubble.vue'
import TypingIndicator from './TypingIndicator.vue'

const chatStore = useChatStore()

const userInput = ref('')
const messagesContainer = ref<HTMLElement | null>(null)
const textareaRef = ref<HTMLTextAreaElement | null>(null)

const canSend = computed(() => {
  return userInput.value.trim().length > 0 && chatStore.isReady && !chatStore.isTyping
})

onMounted(async () => {
  await loadInitialModels()
})

async function loadInitialModels(): Promise<void> {
  try {
    await chatStore.loadModels()
  } catch (error) {
    console.error('Failed to load models:', error)
  }
}

async function refreshModels(): Promise<void> {
  try {
    await chatStore.loadModels()
  } catch (error) {
    console.error('Failed to refresh models:', error)
  }
}

function handleSubmit(): void {
  if (!canSend.value) {
    return
  }

  const message = userInput.value.trim()
  if (message) {
    chatStore.sendMessage(message)
    userInput.value = ''
    autoResizeTextarea()
  }
}

function handleKeyDown(event: KeyboardEvent): void {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSubmit()
  }
}

function handleClearChat(): void {
  chatStore.clearChat()
}

function handleRetry(): void {
  chatStore.clearError()
  if (chatStore.availableModels.length === 0) {
    loadInitialModels()
  }
}

function autoResizeTextarea(): void {
  if (!textareaRef.value) return

  textareaRef.value.style.height = 'auto'
  const scrollHeight = textareaRef.value.scrollHeight
  textareaRef.value.style.height = `${Math.min(scrollHeight, 200)}px`
}

watch(userInput, () => {
  nextTick(() => {
    autoResizeTextarea()
  })
})

watch(() => chatStore.messages.length, () => {
  nextTick(() => {
    scrollToBottom()
  })
})

function scrollToBottom(): void {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}
</script>

<style scoped>
.chat-interface {
  display: flex;
  height: 100vh;
  background-color: var(--bg-color, #f9fafb);
  color: var(--text-color, #1f2937);
}

.sidebar {
  width: 320px;
  background-color: var(--sidebar-bg, #ffffff);
  border-right: 1px solid var(--border-color, #e5e7eb);
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  gap: 1.5rem;
  overflow-y: auto;
}

.sidebar-header {
  margin-bottom: 0.5rem;
}

.app-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.25rem;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.app-subtitle {
  font-size: 0.875rem;
  color: var(--subtitle-color, #6b7280);
  margin: 0;
}

.model-section {
  flex-shrink: 0;
}

.actions-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex-shrink: 0;
}

.action-button {
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--action-text, #dc2626);
  background-color: var(--action-bg, #fef2f2);
  border: 1px solid var(--action-border, #fecaca);
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.action-button:hover:not(:disabled) {
  background-color: var(--action-hover-bg, #fee2e2);
  border-color: var(--action-hover-border, #fca5a5);
}

.action-button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.error-section {
  padding: 1rem;
  background-color: var(--error-bg, #fef2f2);
  border: 1px solid var(--error-border, #fecaca);
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.error-message {
  font-size: 0.875rem;
  color: var(--error-text, #dc2626);
}

.retry-button {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--retry-text, #3b82f6);
  background-color: var(--retry-bg, #eff6ff);
  border: 1px solid var(--retry-border, #bfdbfe);
  border-radius: 4px;
  cursor: pointer;
  align-self: flex-start;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.retry-button:hover {
  background-color: var(--retry-hover-bg, #dbeafe);
  border-color: var(--retry-hover-border, #93c5fd);
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  padding: 2rem;
}

.empty-state-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.5rem;
  color: var(--text-color, #1f2937);
}

.empty-state-text {
  font-size: 0.875rem;
  color: var(--subtitle-color, #6b7280);
  margin: 0;
  max-width: 400px;
}

.typing-wrapper {
  display: flex;
  justify-content: flex-start;
}

.typing-message {
  padding: 1rem;
  background-color: var(--assistant-bubble-bg, #f3f4f6);
  border-radius: 12px;
  margin: 0.5rem 0;
}

.input-section {
  padding: 1.5rem;
  background-color: var(--input-section-bg, #ffffff);
  border-top: 1px solid var(--border-color, #e5e7eb);
}

.message-form {
  display: flex;
  gap: 0.75rem;
  align-items: flex-end;
  max-width: 800px;
  margin: 0 auto;
}

.input-wrapper {
  flex: 1;
}

.message-input {
  width: 100%;
  padding: 0.75rem;
  font-size: 0.875rem;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 8px;
  background-color: var(--input-bg, #ffffff);
  color: var(--text-color, #1f2937);
  resize: none;
  min-height: 44px;
  max-height: 200px;
  font-family: inherit;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.message-input:hover:not(:disabled) {
  border-color: var(--hover-border-color, #9ca3af);
}

.message-input:focus {
  outline: none;
  border-color: var(--focus-color, #3b82f6);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.message-input:disabled {
  cursor: not-allowed;
  opacity: 0.6;
  background-color: var(--input-disabled-bg, #f3f4f6);
}

.send-button {
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--send-text, #ffffff);
  background-color: var(--send-bg, #3b82f6);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.1s ease;
  white-space: nowrap;
}

.send-button:hover:not(:disabled) {
  background-color: var(--send-hover-bg, #2563eb);
}

.send-button:active:not(:disabled) {
  transform: scale(0.98);
}

.send-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

@media (max-width: 768px) {
  .chat-interface {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid var(--border-color, #e5e7eb);
    padding: 1rem;
    gap: 1rem;
  }

  .messages-container {
    padding: 1rem;
  }

  .input-section {
    padding: 1rem;
  }

  .message-form {
    max-width: 100%;
  }
}
</style>
