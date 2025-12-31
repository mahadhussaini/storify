/**
 * API Configuration and Constants
 */

export const API_CONFIG = {
  // Base API settings
  BASE_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  API_PREFIX: '/api',


  // API rate limiting (for future implementation)
  RATE_LIMITS: {
    AI_REQUESTS: {
      windowMs: 60 * 1000, // 1 minute
      max: 10 // 10 requests per minute for AI features
    },
    GENERAL_REQUESTS: {
      windowMs: 60 * 1000,
      max: 100 // 100 requests per minute general
    }
  },

  // Pagination defaults
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100
  },

  // File upload settings
  UPLOAD: {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    IMAGE_DIR: 'uploads/images'
  },

  // AI settings
  AI: {
    DEFAULT_MODEL: 'gpt-4o-mini',
    MAX_TOKENS: {
      ASSIST: 1000,
      PROMPTS: 500,
      SUMMARY: 300
    },
    TEMPERATURE: {
      CREATIVE: 0.8,
      ANALYTICAL: 0.3,
      NEUTRAL: 0.5
    }
  },

  // Database settings
  DATABASE: {
    CONNECTION_TIMEOUT: 10000,
    QUERY_TIMEOUT: 30000,
    MAX_CONNECTIONS: 10
  },

  // Authentication settings
  AUTH: {
    SESSION_MAX_AGE: 30 * 24 * 60 * 60, // 30 days
    JWT_SECRET_REQUIRED: true,
    ALLOW_ANONYMOUS: true
  },

  // Feature flags
  FEATURES: {
    AI_ASSISTANT: true,
    VERSION_HISTORY: true,
    FILE_UPLOAD: true,
    CHAT_SYSTEM: true,
    PUBLIC_ROOMS: true
  }
} as const

// Environment-specific configuration
export const getEnvironmentConfig = () => {
  const env = process.env.NODE_ENV || 'development'

  switch (env) {
    case 'production':
      return {
        ...API_CONFIG,
        FEATURES: {
          ...API_CONFIG.FEATURES,
          // Enable/disable features in production as needed
        }
      }

    case 'test':
      return {
        ...API_CONFIG,
        FEATURES: {
          ...API_CONFIG.FEATURES
        }
      }

    default: // development
      return API_CONFIG
  }
}

export default getEnvironmentConfig()
