import axios, { type AxiosInstance, type AxiosError } from 'axios'
import type {
  OllamaModelsResponse,
  OllamaModel,
  OllamaChatOptions,
  OllamaChatResponse,
  OllamaStreamChunk,
  OllamaVersionResponse
} from '../types/ollama'

class OllamaAPIError extends Error {
  statusCode?: number
  details?: unknown

  constructor(message: string, statusCode?: number, details?: unknown) {
    super(message)
    this.name = 'OllamaAPIError'
    this.statusCode = statusCode
    this.details = details
  }
}

// Base URL for Ollama API (proxied through Vite)
const OLLAMA_BASE_URL = import.meta.env.VITE_OLLAMA_URL || '/api'

class OllamaClient {
  private client: AxiosInstance

  constructor(baseURL: string = OLLAMA_BASE_URL, timeout: number = 120000) {
    this.client = axios.create({
      baseURL,
      timeout,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }

  /**
   * Fetch available models from Ollama
   */
  async listModels(): Promise<OllamaModel[]> {
    try {
      const response = await this.client.get<OllamaModelsResponse>('/tags')
      return response.data.models || []
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch models')
    }
  }

  /**
   * Generate a chat completion (non-streaming)
   */
  async generateChat(options: OllamaChatOptions): Promise<OllamaChatResponse> {
    try {
      const response = await this.client.post<OllamaChatResponse>('/chat', {
        ...options,
        stream: false
      })
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Failed to generate chat completion')
    }
  }

  /**
   * Generate a streaming chat completion
   * Returns an async generator that yields chunks of content
   */
  async *generateChatStream(options: OllamaChatOptions): AsyncGenerator<string, void, unknown> {
    const baseURL = this.client.defaults.baseURL || ''
    const url = `${baseURL}/chat`

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...options,
          stream: true
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new OllamaAPIError(
          errorData.error || `HTTP error ${response.status}`,
          response.status,
          errorData
        )
      }

      if (!response.body) {
        throw new OllamaAPIError('Response body is null')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()

        if (done) {
          break
        }

        if (value) {
          const text = decoder.decode(value, { stream: true })
          buffer += text

          while (buffer.length > 0) {
            let braceCount = 0
            let jsonEnd = -1

            for (let i = 0; i < buffer.length; i++) {
              if (buffer[i] === '{') {
                if (braceCount === 0 && i > 0 && buffer[i - 1].trim() !== '') {
                  break
                }
                braceCount++
              } else if (buffer[i] === '}') {
                braceCount--
                if (braceCount === 0) {
                  jsonEnd = i + 1
                  break
                }
              }
            }

            if (jsonEnd > 0) {
              const jsonStr = buffer.substring(0, jsonEnd)
              buffer = buffer.substring(jsonEnd)

              try {
                const data: OllamaStreamChunk = JSON.parse(jsonStr)
                if (data.message?.content) {
                  yield data.message.content
                }
                if (data.done) {
                  return
                }
              } catch (parseError) {
                console.warn('Failed to parse stream chunk:', parseError)
                console.log('Invalid JSON:', jsonStr)
              }
            } else {
              break
            }
          }
        }
      }
    } catch (error) {
      if (error instanceof OllamaAPIError) {
        throw error
      }
      throw this.handleError(error, 'Failed to generate streaming chat completion')
    }
  }

  /**
   * Get Ollama version
   */
  async getVersion(): Promise<string> {
    try {
      const response = await this.client.get<OllamaVersionResponse>('/version')
      return response.data.version || 'unknown'
    } catch (error) {
      throw this.handleError(error, 'Failed to get version')
    }
  }

  /**
   * Pull a model (optional feature)
   */
  async *pullModel(modelName: string): AsyncGenerator<any, void, unknown> {
    const baseURL = this.client.defaults.baseURL || ''
    const url = `${baseURL}/pull`

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: modelName })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new OllamaAPIError(
          errorData.error || `HTTP error ${response.status}`,
          response.status,
          errorData
        )
      }

      if (!response.body) {
        throw new OllamaAPIError('Response body is null')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()

        if (done) {
          break
        }

        if (value) {
          const text = decoder.decode(value, { stream: true })
          buffer += text

          while (buffer.length > 0) {
            let braceCount = 0
            let jsonEnd = -1

            for (let i = 0; i < buffer.length; i++) {
              if (buffer[i] === '{') {
                if (braceCount === 0 && i > 0 && buffer[i - 1].trim() !== '') {
                  break
                }
                braceCount++
              } else if (buffer[i] === '}') {
                braceCount--
                if (braceCount === 0) {
                  jsonEnd = i + 1
                  break
                }
              }
            }

            if (jsonEnd > 0) {
              const jsonStr = buffer.substring(0, jsonEnd)
              buffer = buffer.substring(jsonEnd)

              try {
                const data = JSON.parse(jsonStr)
                yield data
                if (data.done) {
                  return
                }
              } catch (parseError) {
                console.warn('Failed to parse pull stream chunk:', parseError)
                console.log('Invalid JSON:', jsonStr)
              }
            } else {
              break
            }
          }
        }
      }
    } catch (error) {
      if (error instanceof OllamaAPIError) {
        throw error
      }
      throw this.handleError(error, `Failed to pull model ${modelName}`)
    }
  }

  private handleError(error: unknown, defaultMessage: string): OllamaAPIError {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<any>

      if (axiosError.response) {
        const status = axiosError.response.status
        const data = axiosError.response.data

        if (status === 404) {
          return new OllamaAPIError(
            'Ollama endpoint not found. Make sure Ollama is running.',
            status,
            data
          )
        }

        if (status === 401 || status === 403) {
          return new OllamaAPIError(
            'Authentication failed. Check your Ollama configuration.',
            status,
            data
          )
        }

        const message = data?.error || data?.message || defaultMessage
        return new OllamaAPIError(message, status, data)
      }

      if (axiosError.request) {
        return new OllamaAPIError(
          'Could not connect to Ollama. Make sure Ollama is running at configured URL.',
          undefined,
          { originalError: axiosError.message }
        )
      }
    }

    if (error instanceof Error) {
      return new OllamaAPIError(error.message)
    }

    return new OllamaAPIError(defaultMessage)
  }
}

// Default client instance
export const ollamaClient = new OllamaClient()

export default OllamaClient
