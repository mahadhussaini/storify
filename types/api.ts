/**
 * Shared API types and interfaces
 */

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp?: Date
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface User {
  id: string
  name: string
  email?: string
  avatar?: string
  role?: 'user' | 'admin' | 'moderator'
  createdAt?: Date
  updatedAt?: Date
}

export interface Room {
  id: string
  name?: string
  description?: string
  storyId: string
  ownerId: string
  isPublic: boolean
  maxParticipants?: number
  createdAt?: Date
  updatedAt?: Date
  story?: {
    id: string
    title: string
    content?: string
  }
  participants?: User[]
  _count?: {
    participants: number
  }
}

export interface Story {
  id: string
  title: string
  content: string
  authorId: string
  isPublic: boolean
  tags?: string[]
  wordCount?: number
  createdAt: Date
  updatedAt: Date
  author?: User
  versions?: StoryVersion[]
  collaborators?: User[]
}

export interface StoryVersion {
  id: string
  content: string
  description?: string
  version: number
  authorId: string
  storyId: string
  createdAt: Date
  author?: User
}

export interface ChatMessage {
  id: string
  content: string
  authorId: string
  roomId: string
  createdAt: Date
  author?: User
}

export interface CollaborationStats {
  activeUsers: number
  activeRooms: number
  totalStories: number
  totalUsers: number
  timestamp: Date
}

export interface HealthStatus {
  status: 'ok' | 'degraded' | 'error'
  timestamp: Date
  services: {
    api: 'healthy' | 'unhealthy'
    database: 'healthy' | 'unhealthy'
  }
  version: string
  environment: string
}

// API Request/Response types
export interface CreateRoomRequest {
  storyId: string
  name?: string
  description?: string
  isPublic?: boolean
  maxParticipants?: number
}

export interface UpdateRoomRequest {
  name?: string
  description?: string
  isPublic?: boolean
  maxParticipants?: number
}

export interface CreateStoryRequest {
  title: string
  content?: string
  isPublic?: boolean
  tags?: string[]
}

export interface UpdateStoryRequest {
  title?: string
  content?: string
  isPublic?: boolean
  tags?: string[]
}

export interface AiAssistRequest {
  mode: 'suggest' | 'continue' | 'summarize' | 'improve'
  content: string
  prompt?: string
}

export interface AiPromptsRequest {
  count?: number
  genre?: string
  style?: string
}

// Error types
export class ApiError extends Error {
  public statusCode: number
  public code?: string

  constructor(message: string, statusCode: number = 500, code?: string) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.code = code
  }
}

export class ValidationError extends ApiError {
  public details?: any

  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR')
    this.name = 'ValidationError'
    this.details = details
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR')
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends ApiError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR')
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND_ERROR')
    this.name = 'NotFoundError'
  }
}
