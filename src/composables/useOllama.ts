import { computed, ref } from 'vue'
import { ollamaClient } from '../api/ollama'
import type { OllamaModel, OllamaChatOptions } from '../types/ollama'

/**
 * Composable for Ollama API operations
 */
export function useOllama() {
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const isError = computed(() => error.value !== null)
  const isReady = computed(() => !isLoading.value && !isError.value)

  async function fetchModels(): Promise<OllamaModel[]> {
    isLoading.value = true
    error.value = null

    try {
      const models = await ollamaClient.listModels()
      return models
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch models'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchVersion(): Promise<string> {
    isLoading.value = true
    error.value = null

    try {
      return await ollamaClient.getVersion()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch version'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  function clearError(): void {
    error.value = null
  }

  return {
    isLoading,
    error,
    isError,
    isReady,
    fetchModels,
    fetchVersion,
    clearError
  }
}

/**
 * Composable for model management
 */
export function useModels() {
  const { isLoading, error, isReady, fetchModels: _fetchModels, clearError } = useOllama()

  const models = ref<OllamaModel[]>([])
  const selectedModel = ref<string>('')
  const isLoaded = ref(false)

  const hasModels = computed(() => models.value.length > 0)
  const currentModel = computed(() => {
    return models.value.find(m => m.name === selectedModel.value) || null
  })

  async function loadModels(): Promise<OllamaModel[]> {
    const fetchedModels = await _fetchModels()
    models.value = fetchedModels
    isLoaded.value = true

    // Auto-select first model if none selected
    if (!selectedModel.value && fetchedModels.length > 0) {
      selectedModel.value = fetchedModels[0].name
    }

    return fetchedModels
  }

  function selectModel(modelName: string): void {
    selectedModel.value = modelName
  }

  function refreshModels(): Promise<OllamaModel[]> {
    isLoaded.value = false
    return loadModels()
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

  function getDate(dateString: string): Date {
    return new Date(dateString)
  }

  return {
    // State
    models,
    selectedModel,
    isLoading,
    error,
    isLoaded,
    isReady,
    hasModels,
    currentModel,

    // Methods
    loadModels,
    selectModel,
    refreshModels,
    clearError,
    formatSize,
    getDate
  }
}

/**
 * Composable for chat streaming operations
 */
export function useChatStream() {
  const isStreaming = ref(false)
  const streamContent = ref('')
  const error = ref<string | null>(null)

  const isIdle = computed(() => !isStreaming.value && !error.value)
  const hasError = computed(() => error.value !== null)

  async function *streamChat(options: OllamaChatOptions): AsyncGenerator<string, void, unknown> {
    isStreaming.value = true
    streamContent.value = ''
    error.value = null

    try {
      for await (const chunk of ollamaClient.generateChatStream(options)) {
        streamContent.value += chunk
        yield chunk
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to stream chat'
      throw err
    } finally {
      isStreaming.value = false
    }
  }

  function clearError(): void {
    error.value = null
  }

  function reset(): void {
    isStreaming.value = false
    streamContent.value = ''
    error.value = null
  }

  return {
    // State
    isStreaming,
    streamContent,
    error,
    isIdle,
    hasError,

    // Methods
    streamChat,
    clearError,
    reset
  }
}
