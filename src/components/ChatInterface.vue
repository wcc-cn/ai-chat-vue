<template>
  <el-container class="chat-interface">
    <el-aside width="300px" class="sidebar">
      <div class="sidebar-header">
        <div class="logo-wrapper">
          <el-icon :size="32" color="#409eff"><ChatDotRound /></el-icon>
          <div class="title-group">
            <h1 class="app-title">AI Chat</h1>
            <p class="app-subtitle">Powered by Ollama</p>
          </div>
        </div>
      </div>

      <div class="sidebar-content">
        <ModelSelector
          :models="chatStore.availableModels"
          :selected-model="chatStore.selectedModel"
          :is-loading="chatStore.isLoading"
          @select="chatStore.setModel"
          @refresh="refreshModels"
        />

        <el-button
          type="danger"
          plain
          :icon="Delete"
          @click="handleClearChat"
          :disabled="!chatStore.hasMessages"
          class="clear-btn"
        >
          Clear Chat
        </el-button>
      </div>

      <el-alert
        v-if="chatStore.error"
        :title="chatStore.error"
        type="error"
        show-icon
        :closable="false"
        class="error-alert"
      >
        <template #default>
          <el-button type="primary" text size="small" @click="handleRetry">
            Retry
          </el-button>
        </template>
      </el-alert>
    </el-aside>

    <el-main class="chat-main">
      <div class="messages-container" ref="messagesContainer">
        <el-empty
          v-if="!chatStore.hasMessages"
          :image-size="120"
          description="Start a conversation"
        >
          <template #image>
            <el-icon :size="80" color="#c0c4cc"><ChatLineRound /></el-icon>
          </template>
          <template #description>
            <p class="empty-description">
              {{ chatStore.isReady ? 'Type a message below to begin chatting.' : 'Select a model to start.' }}
            </p>
          </template>
        </el-empty>

        <div class="messages-list">
          <MessageBubble
            v-for="message in chatStore.messages"
            :key="message.id"
            :message="message"
          />

          <div v-if="chatStore.isTyping" class="typing-wrapper">
            <el-card shadow="never" class="typing-card">
              <TypingIndicator />
            </el-card>
          </div>
        </div>
      </div>

      <div class="input-section">
        <el-card shadow="never" class="input-card">
          <el-form @submit.prevent="handleSubmit" class="message-form">
            <el-input
              v-model="userInput"
              type="textarea"
              :autosize="{ minRows: 1, maxRows: 6 }"
              placeholder="Type your message..."
              :disabled="!chatStore.isReady || chatStore.isTyping"
              @keydown="handleKeyDown"
              class="message-input"
            />
            <el-button
              type="primary"
              :icon="chatStore.isTyping ? Loading : Promotion"
              :loading="chatStore.isTyping"
              :disabled="!canSend"
              @click="handleSubmit"
              class="send-btn"
            >
              {{ chatStore.isTyping ? 'Sending' : 'Send' }}
            </el-button>
          </el-form>
        </el-card>
      </div>
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useChatStore } from '../stores/chat'
import { ChatDotRound, ChatLineRound, Delete, Promotion, Loading } from '@element-plus/icons-vue'
import ModelSelector from './ModelSelector.vue'
import MessageBubble from './MessageBubble.vue'
import TypingIndicator from './TypingIndicator.vue'

const chatStore = useChatStore()

const userInput = ref('')
const messagesContainer = ref<HTMLElement | null>(null)

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
  height: 100vh;
  background-color: var(--bg-page);
}

.sidebar {
  background-color: var(--sidebar-bg);
  border-right: 1px solid var(--border-light);
  display: flex;
  flex-direction: column;
  padding: 20px;
  gap: 20px;
  overflow-y: auto;
}

.sidebar-header {
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-light);
}

.logo-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-group {
  display: flex;
  flex-direction: column;
}

.app-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: var(--text-color);
}

.app-subtitle {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin: 0;
}

.sidebar-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
}

.clear-btn {
  width: 100%;
}

.error-alert {
  margin-top: auto;
}

.chat-main {
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden;
  background-color: var(--bg-color);
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
}

.empty-description {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin-top: 8px;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
}

.typing-wrapper {
  display: flex;
  justify-content: flex-start;
}

.typing-card {
  max-width: 80px;
  background-color: var(--assistant-bubble-bg);
}

.input-section {
  padding: 16px 24px 24px;
  background-color: var(--bg-color);
}

.input-card {
  max-width: 900px;
  margin: 0 auto;
  background-color: var(--card-bg);
}

.message-form {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.message-input {
  flex: 1;
}

.message-input :deep(.el-textarea__inner) {
  padding: 12px 16px;
  font-size: 0.9375rem;
  line-height: 1.5;
  resize: none;
}

.send-btn {
  height: 40px;
  padding: 0 24px;
  font-weight: 500;
}

@media (max-width: 768px) {
  .chat-interface {
    flex-direction: column;
  }

  .sidebar {
    width: 100% !important;
    border-right: none;
    border-bottom: 1px solid var(--border-light);
    padding: 16px;
    gap: 16px;
  }

  .messages-container {
    padding: 16px;
  }

  .input-section {
    padding: 12px 16px 16px;
  }

  .messages-list {
    gap: 12px;
  }
}
</style>
