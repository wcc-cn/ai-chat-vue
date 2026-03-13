import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ollamaClient } from '../api/ollama'
import type {
  OllamaModel,
  OllamaMessage,
  ChatMessage,
  ModelStatus
} from '../types/ollama'

export const useChatStore = defineStore('chat', () => {
  // State
  const messages = ref<ChatMessage[]>([])
  const isTyping = ref(false)
  const selectedModel = ref<string>('')
  const availableModels = ref<OllamaModel[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const status = ref<ModelStatus>('idle')

  // Getters
  const lastMessage = computed(() => {
    return messages.value[messages.value.length - 1] || null
  })

  const userMessages = computed(() => {
    return messages.value.filter(msg => msg.role === 'user')
  })

  const assistantMessages = computed(() => {
    return messages.value.filter(msg => msg.role === 'assistant')
  })

  const hasMessages = computed(() => messages.value.length > 0)

  const isReady = computed(() => {
    return selectedModel.value !== '' && status.value !== 'error'
  })

  // Actions

  /**
   * Fetch and cache available models from Ollama
   */
  async function loadModels(): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const models = await ollamaClient.listModels()
           availableModels.value = models

      // Auto-select first model if none selected
      if (!selectedModel.value && models.length > 0) {
        selectedModel.value = models[0].name
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load models'
      status.value = 'error'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Send a user message and get AI response with streaming
   */
  async function sendMessage(content: string): Promise<void> {
    if (!selectedModel.value) {
      error.value = 'No model selected. Please select a model first.'
      return
    }

    if (!content.trim()) {
      return
    }

    status.value = 'generating'
    isTyping.value = true
    error.value = null

    // Add user message
    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: content.trim(),
      timestamp: Date.now()
    }
    messages.value.push(userMessage)

    // Prepare Ollama messages
    const ollamaMessages: OllamaMessage[] = messages.value
      .filter(msg => !msg.isStreaming)
      .map(msg => ({
        role: msg.role,
        content: msg.content
      }))

    // Create placeholder for assistant message
    const assistantIndex = messages.value.length
    const assistantId = generateId()
    messages.value.push({
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: true
    })

    try {
      let fullContent = ''

      for await (const chunk of ollamaClient.generateChatStream({
        model: selectedModel.value,
        messages: ollamaMessages
      })) {
        fullContent += chunk
        // Replace entire message to trigger Vue reactivity
        const msg = messages.value[assistantIndex]
        if (msg) {
          messages.value.splice(assistantIndex, 1, {
            id: msg.id,
            role: msg.role,
            content: fullContent,
            timestamp: msg.timestamp,
            isStreaming: true
          })
        }
      }

      // Mark streaming as complete
      const finalMsg = messages.value[assistantIndex]
      if (finalMsg) {
        messages.value.splice(assistantIndex, 1, {
          id: finalMsg.id,
          role: finalMsg.role,
          content: fullContent,
          timestamp: finalMsg.timestamp,
          isStreaming: false
        })
      }
      status.value = 'idle'
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to generate response'
      status.value = 'error'
      const errorMsg = messages.value[assistantIndex]
      if (errorMsg) {
        messages.value.splice(assistantIndex, 1, {
          id: errorMsg.id,
          role: errorMsg.role,
          content: error.value || 'An error occurred while generating response.',
          timestamp: errorMsg.timestamp,
          isStreaming: false
        })
      }
    } finally {
      isTyping.value = false
    }
  }

  /**
   * Clear all messages
   */
  function clearChat(): void {
    messages.value = []
    error.value = null
    status.value = 'idle'
  }

  /**
   * Delete a specific message by ID
   */
  function deleteMessage(id: string): void {
    const index = messages.value.findIndex(msg => msg.id === id)
    if (index !== -1) {
      messages.value.splice(index, 1)
    }
  }

  /**
   * Set the currently selected model
   */
  function setModel(modelName: string): void {
    selectedModel.value = modelName
  }

  /**
   * Clear error state
   */
  function clearError(): void {
    error.value = null
  }

  /**
   * Retry the last failed operation (reload models)
   */
  async function retry(): Promise<void> {
    clearError()
    if (availableModels.value.length === 0) {
      await loadModels()
    }
  }

  return {
    // State
    messages,
    isTyping,
    selectedModel,
    availableModels,
    isLoading,
    error,
    status,

    // Getters
    lastMessage,
    userMessages,
    assistantMessages,
    hasMessages,
    isReady,

    // Actions
    loadModels,
    sendMessage,
    clearChat,
    deleteMessage,
    setModel,
    clearError,
    retry
  }
})

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36)
}
