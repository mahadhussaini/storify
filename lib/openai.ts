import OpenAI from 'openai'
import type { OpenAIStatus, OpenAIErrorDetails } from '@/types/openai'
import { OpenAIConfigurationError } from '@/types/openai'

/**
 * Validates that the OpenAI API key is properly configured
 */
function validateOpenAIKey(): string {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    throw new OpenAIConfigurationError(
      'OpenAI API key is not configured. Please set OPENAI_API_KEY in your environment variables.'
    )
  }

  // Basic validation - OpenAI API keys start with 'sk-'
  if (!apiKey.startsWith('sk-')) {
    throw new OpenAIConfigurationError(
      'Invalid OpenAI API key format. API keys should start with "sk-".'
    )
  }

  // Check for placeholder/empty values
  if (apiKey === 'your-openai-api-key-here' || apiKey.trim() === '') {
    throw new OpenAIConfigurationError(
      'OpenAI API key appears to be a placeholder. Please set a valid API key.'
    )
  }

  return apiKey
}

/**
 * Singleton OpenAI client instance
 */
let openaiClient: OpenAI | null = null

/**
 * Get the configured OpenAI client instance
 * @returns OpenAI client instance
 * @throws OpenAIConfigurationError if OpenAI is not properly configured
 */
export function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    try {
      const apiKey = validateOpenAIKey()
      openaiClient = new OpenAI({
        apiKey,
      })
    } catch (error) {
      if (error instanceof OpenAIConfigurationError) {
        throw error
      }
      throw new OpenAIConfigurationError(
        'Failed to initialize OpenAI client: ' + (error as Error).message
      )
    }
  }

  return openaiClient
}

/**
 * Check if OpenAI is properly configured and available
 * @returns true if OpenAI is available, false otherwise
 */
export function isOpenAIAvailable(): boolean {
  try {
    validateOpenAIKey()
    return true
  } catch {
    return false
  }
}

/**
 * Get OpenAI configuration status for debugging
 * @returns Configuration status object
 */
export function getOpenAIStatus(): OpenAIStatus {
  const configured = isOpenAIAvailable()
  const hasApiKey = !!process.env.OPENAI_API_KEY

  return {
    configured,
    hasApiKey,
    apiKeyValid: configured,
    error: configured ? null : 'OpenAI API key not properly configured',
  }
}

/**
 * Safe wrapper for OpenAI API calls with error handling
 * @param operation Function that performs the OpenAI API call
 * @returns Result of the operation
 * @throws OpenAIConfigurationError if OpenAI is not configured
 * @throws Error for API errors or other issues
 */
export async function withOpenAI<T>(
  operation: (client: OpenAI) => Promise<T>
): Promise<T> {
  const client = getOpenAIClient()

  try {
    return await operation(client)
  } catch (error) {
    // Handle OpenAI API errors specifically
    if (error instanceof Error) {
      // Check for authentication errors
      if (error.message.includes('401') || error.message.includes('unauthorized')) {
        throw new OpenAIConfigurationError(
          'Invalid OpenAI API key. Please check your OPENAI_API_KEY.'
        )
      }

      // Check for quota/rate limit errors
      if (error.message.includes('429') || error.message.includes('quota')) {
        throw new Error('OpenAI API quota exceeded or rate limited. Please try again later.')
      }

      // Check for model availability
      if (error.message.includes('404') || error.message.includes('model')) {
        throw new Error('Requested OpenAI model is not available. Please check model configuration.')
      }

      // Re-throw other API errors
      throw error
    }

    throw new Error('Unknown OpenAI API error occurred')
  }
}

// Re-export the error class for convenience
export { OpenAIConfigurationError }
