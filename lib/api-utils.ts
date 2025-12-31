import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import type { ApiResponse } from '@/types/api'
import {
  ApiError,
  AuthenticationError,
  AuthorizationError,
  ValidationError,
  NotFoundError
} from '@/types/api'

/**
 * API utility functions for consistent response handling and authentication
 */

export class ApiHandler {
  /**
   * Create a standardized API response
   */
  static response<T>(
    data: T,
    status: number = 200,
    message?: string
  ): NextResponse<ApiResponse<T>> {
    return NextResponse.json({
      success: true,
      data,
      message,
      timestamp: new Date()
    }, { status })
  }

  /**
   * Create a standardized error response
   */
  static error(
    error: string | Error | ApiError,
    status: number = 500,
    code?: string
  ): NextResponse<ApiResponse> {
    let message: string
    let errorCode: string | undefined

    if (error instanceof ApiError) {
      message = error.message
      errorCode = error.code
      status = error.statusCode
    } else if (error instanceof Error) {
      message = error.message
    } else {
      message = error
    }

    console.error('API Error:', {
      message,
      code: errorCode,
      status,
      timestamp: new Date()
    })

    return NextResponse.json({
      success: false,
      error: message,
      timestamp: new Date()
    }, { status })
  }

  /**
   * Authenticate the current request
   */
  static async authenticate(request: NextRequest): Promise<any> {
    try {
      const session = await getServerSession(authOptions)
      if (!session) {
        throw new AuthenticationError()
      }
      return session
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error
      }
      throw new AuthenticationError('Authentication failed')
    }
  }

  /**
   * Validate request body against a schema
   */
  static validateBody<T>(
    body: any,
    schema: { parse: (data: any) => T }
  ): T {
    try {
      return schema.parse(body)
    } catch (error: any) {
      throw new ValidationError('Validation failed', error.errors)
    }
  }

  /**
   * Handle API route execution with error handling
   */
  static async handleRoute<T>(
    handler: () => Promise<T>,
    options: {
      requireAuth?: boolean
      request?: NextRequest
    } = {}
  ): Promise<NextResponse<ApiResponse<T>>> {
    try {
      // Authenticate if required
      if (options.requireAuth && options.request) {
        await this.authenticate(options.request)
      }

      // Execute handler
      const result = await handler()

      return this.response(result)
    } catch (error) {
      if (error instanceof ApiError) {
        return this.error(error)
      }

      console.error('Unhandled API error:', error)
      return this.error('Internal server error', 500)
    }
  }
}

/**
 * Common API route handlers
 */
export const apiHandlers = {
  /**
   * GET handler with optional authentication
   */
  async get<T>(
    handler: (request: NextRequest) => Promise<T>,
    options: { requireAuth?: boolean } = {}
  ) {
    return async (request: NextRequest) => {
      return ApiHandler.handleRoute(
        () => handler(request),
        { requireAuth: options.requireAuth, request }
      )
    }
  },

  /**
   * POST handler with optional authentication and validation
   */
  async post<T>(
    handler: (request: NextRequest, body: any) => Promise<T>,
    options: {
      requireAuth?: boolean
      validateBody?: { parse: (data: any) => any }
    } = {}
  ) {
    return async (request: NextRequest) => {
      return ApiHandler.handleRoute(async () => {
        const body = await request.json()

        // Validate body if schema provided
        if (options.validateBody) {
          ApiHandler.validateBody(body, options.validateBody)
        }

        return handler(request, body)
      }, { requireAuth: options.requireAuth, request })
    }
  },

  /**
   * PUT/PATCH handler with optional authentication and validation
   */
  async put<T>(
    handler: (request: NextRequest, body: any, params?: any) => Promise<T>,
    options: {
      requireAuth?: boolean
      validateBody?: { parse: (data: any) => any }
    } = {}
  ) {
    return async (request: NextRequest) => {
      return ApiHandler.handleRoute(async () => {
        const body = await request.json()

        // Validate body if schema provided
        if (options.validateBody) {
          ApiHandler.validateBody(body, options.validateBody)
        }

        return handler(request, body)
      }, { requireAuth: options.requireAuth, request })
    }
  },

  /**
   * DELETE handler with optional authentication
   */
  async delete<T>(
    handler: (request: NextRequest, params?: any) => Promise<T>,
    options: { requireAuth?: boolean } = {}
  ) {
    return async (request: NextRequest) => {
      return ApiHandler.handleRoute(
        () => handler(request),
        { requireAuth: options.requireAuth, request }
      )
    }
  }
}

/**
 * Utility function to extract route parameters
 */
export function getRouteParams(request: NextRequest): Record<string, string> {
  // In Next.js App Router, params are not directly available in the request
  // This is a simplified version - you'd need to handle this differently
  // based on your specific route structure
  const url = new URL(request.url)
  const segments = url.pathname.split('/').filter(Boolean)

  // Extract dynamic segments (those in square brackets)
  const params: Record<string, string> = {}
  const apiIndex = segments.indexOf('api')

  if (apiIndex !== -1) {
    const routeSegments = segments.slice(apiIndex + 1)
    // This is a simplified extraction - you might need more sophisticated parsing
    // based on your actual route structure
  }

  return params
}
