interface CacheEntry<T> {
  value: T
  timestamp: number
  ttl: number
}

interface CacheStore {
  [key: string]: CacheEntry<any>
}

class Cache {
  private store: CacheStore = {}
  private maxSize: number
  private cleanupInterval: NodeJS.Timeout

  constructor(maxSize: number = 1000) {
    this.maxSize = maxSize
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000) // Cleanup every minute
  }

  set<T>(key: string, value: T, ttl: number = 300000): void { // Default 5 minutes
    // Remove oldest entries if cache is full
    if (Object.keys(this.store).length >= this.maxSize) {
      this.evictOldest()
    }

    this.store[key] = {
      value,
      timestamp: Date.now(),
      ttl
    }
  }

  get<T>(key: string): T | null {
    const entry = this.store[key]
    
    if (!entry) {
      return null
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      delete this.store[key]
      return null
    }

    return entry.value
  }

  has(key: string): boolean {
    return this.get(key) !== null
  }

  delete(key: string): boolean {
    if (this.store[key]) {
      delete this.store[key]
      return true
    }
    return false
  }

  clear(): void {
    this.store = {}
  }

  private evictOldest(): void {
    let oldestKey: string | null = null
    let oldestTime = Date.now()

    for (const [key, entry] of Object.entries(this.store)) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp
        oldestKey = key
      }
    }

    if (oldestKey) {
      delete this.store[oldestKey]
    }
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of Object.entries(this.store)) {
      if (now - entry.timestamp > entry.ttl) {
        delete this.store[key]
      }
    }
  }

  // Get cache statistics
  getStats() {
    const keys = Object.keys(this.store)
    const now = Date.now()
    const expired = keys.filter(key => 
      now - this.store[key].timestamp > this.store[key].ttl
    ).length

    return {
      size: keys.length,
      maxSize: this.maxSize,
      expired,
      utilization: (keys.length / this.maxSize) * 100
    }
  }
}

// Global cache instance
export const cache = new Cache()

// Cache decorator for functions
export function cached<T extends any[], R>(
  ttl: number = 300000,
  keyGenerator?: (...args: T) => string
) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    descriptor.value = async function (...args: T): Promise<R> {
      const key = keyGenerator 
        ? keyGenerator(...args) 
        : `${target.constructor.name}.${propertyName}.${JSON.stringify(args)}`
      
      const cached = cache.get<R>(key)
      if (cached !== null) {
        return cached
      }

      const result = await method.apply(this, args)
      cache.set(key, result, ttl)
      return result
    }
  }
}

// Utility functions for common cache patterns
export const userCache = {
  getUser: (userId: string) => cache.get(`user:${userId}`),
  setUser: (userId: string, userData: any) => cache.set(`user:${userId}`, userData, 300000), // 5 minutes
  invalidateUser: (userId: string) => cache.delete(`user:${userId}`)
}

export const analyticsCache = {
  getAnalytics: (userId: string, timeRange: string) => 
    cache.get(`analytics:${userId}:${timeRange}`),
  setAnalytics: (userId: string, timeRange: string, data: any) => 
    cache.set(`analytics:${userId}:${timeRange}`, data, 60000), // 1 minute
  invalidateAnalytics: (userId: string) => {
    // Invalidate all analytics for user
    Object.keys(cache['store']).forEach(key => {
      if (key.startsWith(`analytics:${userId}:`)) {
        cache.delete(key)
      }
    })
  }
}

export const designCache = {
  getDesign: (userId: string) => cache.get(`design:${userId}`),
  setDesign: (userId: string, designData: any) => 
    cache.set(`design:${userId}`, designData, 300000), // 5 minutes
  invalidateDesign: (userId: string) => cache.delete(`design:${userId}`)
} 