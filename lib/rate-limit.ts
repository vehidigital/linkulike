import { NextRequest } from 'next/server'

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
}

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

// In-memory store (in production, use Redis or similar)
const store: RateLimitStore = {}

export class RateLimiter {
  private config: RateLimitConfig

  constructor(config: RateLimitConfig) {
    this.config = config
  }

  async checkLimit(identifier: string): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const now = Date.now()
    const key = identifier
    const record = store[key]

    if (!record || now > record.resetTime) {
      // First request or window expired
      store[key] = {
        count: 1,
        resetTime: now + this.config.windowMs
      }
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime: now + this.config.windowMs
      }
    }

    if (record.count >= this.config.maxRequests) {
      // Rate limit exceeded
      return {
        allowed: false,
        remaining: 0,
        resetTime: record.resetTime
      }
    }

    // Increment counter
    record.count++
    return {
      allowed: true,
      remaining: this.config.maxRequests - record.count,
      resetTime: record.resetTime
    }
  }
}

// Pre-configured rate limiters
export const authRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5 // 5 attempts per 15 minutes
})

export const apiRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100 // 100 requests per minute
})

export const uploadRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10 // 10 uploads per minute
})

// Helper function to get client identifier
export function getClientIdentifier(request: NextRequest): string {
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             request.headers.get('cf-connecting-ip') ||
             'unknown'
  
  // In production, you might want to include user ID if authenticated
  const userAgent = request.headers.get('user-agent') || 'unknown'
  
  return `${ip}-${userAgent}`
}

// Middleware function for rate limiting
export async function withRateLimit(
  request: NextRequest,
  limiter: RateLimiter,
  identifier?: string
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  const clientId = identifier || getClientIdentifier(request)
  return await limiter.checkLimit(clientId)
} 