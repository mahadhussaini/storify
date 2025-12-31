/**
 * Type definitions for OpenAI integration
 */

export interface OpenAIStatus {
  configured: boolean
  hasApiKey: boolean
  apiKeyValid: boolean
  error: string | null
}

export interface OpenAIOperationOptions {
  model?: string
  temperature?: number
  maxTokens?: number
}

export interface OpenAIErrorDetails {
  code?: string
  type?: string
  message: string
}

/**
 * Custom error class for OpenAI configuration issues
 */
export class OpenAIConfigurationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'OpenAIConfigurationError'
  }
}
