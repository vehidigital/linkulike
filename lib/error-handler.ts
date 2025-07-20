import { NextResponse } from 'next/server'

export interface AppError extends Error {
  statusCode?: number
  code?: string
  details?: any
}

export class ValidationError extends Error implements AppError {
  statusCode = 400
  code = 'VALIDATION_ERROR'
  
  constructor(message: string, public details?: any) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends Error implements AppError {
  statusCode = 401
  code = 'AUTHENTICATION_ERROR'
  
  constructor(message: string = 'Authentication required') {
    super(message)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends Error implements AppError {
  statusCode = 403
  code = 'AUTHORIZATION_ERROR'
  
  constructor(message: string = 'Access denied') {
    super(message)
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends Error implements AppError {
  statusCode = 404
  code = 'NOT_FOUND'
  
  constructor(message: string = 'Resource not found') {
    super(message)
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends Error implements AppError {
  statusCode = 409
  code = 'CONFLICT'
  
  constructor(message: string = 'Resource conflict') {
    super(message)
    this.name = 'ConflictError'
  }
}

export class RateLimitError extends Error implements AppError {
  statusCode = 429
  code = 'RATE_LIMIT_EXCEEDED'
  
  constructor(message: string = 'Rate limit exceeded') {
    super(message)
    this.name = 'RateLimitError'
  }
}

export class DatabaseError extends Error implements AppError {
  statusCode = 500
  code = 'DATABASE_ERROR'
  
  constructor(message: string = 'Database operation failed', public details?: any) {
    super(message)
    this.name = 'DatabaseError'
  }
}

export class ExternalServiceError extends Error implements AppError {
  statusCode = 502
  code = 'EXTERNAL_SERVICE_ERROR'
  
  constructor(message: string = 'External service unavailable', public details?: any) {
    super(message)
    this.name = 'ExternalServiceError'
  }
}

// Error logger
export function logError(error: AppError, context?: any) {
  const logData = {
    timestamp: new Date().toISOString(),
    error: {
      name: error.name,
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      stack: error.stack,
      details: error.details
    },
    context
  }

  // In production, send to logging service (e.g., Sentry, LogRocket)
  if (process.env.NODE_ENV === 'production') {
    console.error('Production Error:', JSON.stringify(logData, null, 2))
    // TODO: Send to external logging service
  } else {
    console.error('Development Error:', logData)
  }
}

// Centralized error handler
export function handleError(error: unknown): NextResponse {
  let appError: AppError

  if (error instanceof Error) {
    // Check if it's already an AppError
    if ('statusCode' in error) {
      appError = error as AppError
    } else {
      // Convert generic error to AppError
      appError = new DatabaseError(error.message, { originalError: error })
    }
  } else {
    // Handle non-Error objects
    appError = new DatabaseError('Unknown error occurred', { originalError: error })
  }

  // Log the error
  logError(appError)

  // Return appropriate response
  const statusCode = appError.statusCode || 500
  const response = {
    error: appError.message,
    code: appError.code || 'INTERNAL_ERROR'
  }

  // Include details in development
  if (process.env.NODE_ENV === 'development' && appError.details) {
    ;(response as any).details = appError.details
  }

  return NextResponse.json(response, { status: statusCode })
}

// Async error wrapper
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args)
    } catch (error) {
      throw error // Re-throw to be handled by handleError
    }
  }
}

// Validation helper
export function validateRequired(data: any, fields: string[]): void {
  const missing = fields.filter(field => !data[field])
  if (missing.length > 0) {
    throw new ValidationError(
      `Missing required fields: ${missing.join(', ')}`,
      { missingFields: missing }
    )
  }
}

// Database error handler
export function handleDatabaseError(error: any): never {
  if (error.code === 'P2002') {
    throw new ConflictError('Resource already exists')
  }
  if (error.code === 'P2025') {
    throw new NotFoundError('Resource not found')
  }
  if (error.code === 'P2003') {
    throw new ValidationError('Invalid foreign key reference')
  }
  
  throw new DatabaseError('Database operation failed', { originalError: error })
} 