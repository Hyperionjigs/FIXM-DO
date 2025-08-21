import Redis from 'ioredis';

// Redis configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  keepAlive: 30000,
  connectTimeout: 10000,
  commandTimeout: 5000,
};

// Create Redis client
let redis: Redis | null = null;

// Initialize Redis connection
export function initRedis(): Redis {
  if (!redis) {
    redis = new Redis(redisConfig);
    
    redis.on('connect', () => {
      console.log('✅ Redis connected successfully');
    });
    
    redis.on('error', (error) => {
      console.error('❌ Redis connection error:', error);
    });
    
    redis.on('close', () => {
      console.log('🔌 Redis connection closed');
    });
    
    redis.on('reconnecting', () => {
      console.log('🔄 Redis reconnecting...');
    });
  }
  
  return redis;
}

// Get Redis client
export function getRedis(): Redis {
  if (!redis) {
    return initRedis();
  }
  return redis;
}

// Cache service
export class CacheService {
  private redis: Redis;
  
  constructor() {
    this.redis = getRedis();
  }
  
  // Set cache with TTL
  async set(key: string, value: any, ttlSeconds: number = 3600): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      await this.redis.setex(key, ttlSeconds, serializedValue);
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }
  
  // Get cache
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      if (value) {
        return JSON.parse(value) as T;
      }
      return null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }
  
  // Delete cache
  async delete(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }
  
  // Clear all cache
  async clear(): Promise<void> {
    try {
      await this.redis.flushdb();
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }
  
  // Check if key exists
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  }
  
  // Set multiple values
  async mset(keyValuePairs: Record<string, any>, ttlSeconds: number = 3600): Promise<void> {
    try {
      const pipeline = this.redis.pipeline();
      
      for (const [key, value] of Object.entries(keyValuePairs)) {
        const serializedValue = JSON.stringify(value);
        pipeline.setex(key, ttlSeconds, serializedValue);
      }
      
      await pipeline.exec();
    } catch (error) {
      console.error('Cache mset error:', error);
    }
  }
  
  // Get multiple values
  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    try {
      const values = await this.redis.mget(...keys);
      return values.map(value => value ? JSON.parse(value) as T : null);
    } catch (error) {
      console.error('Cache mget error:', error);
      return keys.map(() => null);
    }
  }
}

// Session service
export class SessionService {
  private redis: Redis;
  
  constructor() {
    this.redis = getRedis();
  }
  
  // Create session
  async createSession(sessionId: string, data: any, ttlSeconds: number = 86400): Promise<void> {
    try {
      const serializedData = JSON.stringify(data);
      await this.redis.setex(`session:${sessionId}`, ttlSeconds, serializedData);
    } catch (error) {
      console.error('Session creation error:', error);
    }
  }
  
  // Get session
  async getSession<T>(sessionId: string): Promise<T | null> {
    try {
      const value = await this.redis.get(`session:${sessionId}`);
      if (value) {
        return JSON.parse(value) as T;
      }
      return null;
    } catch (error) {
      console.error('Session get error:', error);
      return null;
    }
  }
  
  // Update session
  async updateSession(sessionId: string, data: any, ttlSeconds: number = 86400): Promise<void> {
    try {
      const serializedData = JSON.stringify(data);
      await this.redis.setex(`session:${sessionId}`, ttlSeconds, serializedData);
    } catch (error) {
      console.error('Session update error:', error);
    }
  }
  
  // Delete session
  async deleteSession(sessionId: string): Promise<void> {
    try {
      await this.redis.del(`session:${sessionId}`);
    } catch (error) {
      console.error('Session delete error:', error);
    }
  }
  
  // Extend session TTL
  async extendSession(sessionId: string, ttlSeconds: number = 86400): Promise<void> {
    try {
      await this.redis.expire(`session:${sessionId}`, ttlSeconds);
    } catch (error) {
      console.error('Session extend error:', error);
    }
  }
}

// Rate limiting service
export class RateLimitService {
  private redis: Redis;
  
  constructor() {
    this.redis = getRedis();
  }
  
  // Check rate limit
  async checkRateLimit(key: string, limit: number, windowSeconds: number): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
  }> {
    try {
      const now = Math.floor(Date.now() / 1000);
      const windowStart = now - windowSeconds;
      
      // Remove old entries
      await this.redis.zremrangebyscore(key, 0, windowStart);
      
      // Count current requests
      const currentCount = await this.redis.zcard(key);
      
      if (currentCount >= limit) {
        // Get the oldest request time
        const oldestRequest = await this.redis.zrange(key, 0, 0, 'WITHSCORES');
        const resetTime = oldestRequest.length > 0 ? parseInt(oldestRequest[1]) + windowSeconds : now + windowSeconds;
        
        return {
          allowed: false,
          remaining: 0,
          resetTime,
        };
      }
      
      // Add current request
      await this.redis.zadd(key, now, `${now}-${Math.random()}`);
      await this.redis.expire(key, windowSeconds);
      
      return {
        allowed: true,
        remaining: limit - currentCount - 1,
        resetTime: now + windowSeconds,
      };
    } catch (error) {
      console.error('Rate limit check error:', error);
      // Allow request if Redis is down
      return {
        allowed: true,
        remaining: limit,
        resetTime: Math.floor(Date.now() / 1000) + windowSeconds,
      };
    }
  }
  
  // Reset rate limit
  async resetRateLimit(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error('Rate limit reset error:', error);
    }
  }
}

// Queue service
export class QueueService {
  private redis: Redis;
  
  constructor() {
    this.redis = getRedis();
  }
  
  // Add job to queue
  async enqueue(queueName: string, job: any, priority: number = 0): Promise<void> {
    try {
      const jobData = {
        id: `${Date.now()}-${Math.random()}`,
        data: job,
        priority,
        timestamp: Date.now(),
      };
      
      await this.redis.zadd(`queue:${queueName}`, priority, JSON.stringify(jobData));
    } catch (error) {
      console.error('Queue enqueue error:', error);
    }
  }
  
  // Get next job from queue
  async dequeue<T>(queueName: string): Promise<T | null> {
    try {
      const jobs = await this.redis.zrange(`queue:${queueName}`, 0, 0, 'WITHSCORES');
      
      if (jobs.length === 0) {
        return null;
      }
      
      const jobData = JSON.parse(jobs[0]);
      await this.redis.zrem(`queue:${queueName}`, jobs[0]);
      
      return jobData.data as T;
    } catch (error) {
      console.error('Queue dequeue error:', error);
      return null;
    }
  }
  
  // Get queue length
  async getQueueLength(queueName: string): Promise<number> {
    try {
      return await this.redis.zcard(`queue:${queueName}`);
    } catch (error) {
      console.error('Queue length error:', error);
      return 0;
    }
  }
  
  // Clear queue
  async clearQueue(queueName: string): Promise<void> {
    try {
      await this.redis.del(`queue:${queueName}`);
    } catch (error) {
      console.error('Queue clear error:', error);
    }
  }
}

// Export instances
export const cacheService = new CacheService();
export const sessionService = new SessionService();
export const rateLimitService = new RateLimitService();
export const queueService = new QueueService();

// Close Redis connection
export async function closeRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
  }
} 