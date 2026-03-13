// Ollama API TypeScript interfaces

export interface OllamaModel {
  name: string
  modified_at: string
  size: number
  digest?: string
  details?: {
    format?: string
    families?: string[]
    parameter_size?: string
    quantization_level?: string
  }
}

export interface OllamaModelsResponse {
  models: OllamaModel[]
}

export type MessageRole = 'user' | 'assistant' | 'system'

export interface OllamaMessage {
  role: MessageRole
  content: string
  images?: string[]
}

export interface OllamaChatOptions {
  model: string
  messages: OllamaMessage[]
  stream?: boolean
  temperature?: number
  top_p?: number
  top_k?: number
  num_predict?: number
  repeat_penalty?: number
  presence_seed?: number
  frequency_penalty?: number
  system?: string
  template?: string
  context?: number[]
}

export interface OllamaChatResponse {
  model: string
  created_at: string
  message: {
    role: MessageRole
    content: string
  }
  done: boolean
  total_duration?: number
  load_duration?: number
  prompt_eval_count?: number
  prompt_eval_duration?: number
  eval_count?: number
  eval_duration?: number
  context?: number[]
}

export interface OllamaStreamChunk {
  model: string
  created_at: string
  message: {
    role: MessageRole
    content: string
  }
  done: boolean
}

export interface OllamaVersionResponse {
  version: string
}

export interface ChatMessage {
  id: string
  role: MessageRole
  content: string
  timestamp: number
  isStreaming?: boolean
}

export type ModelStatus = 'idle' | 'loading' | 'generating' | 'error'
