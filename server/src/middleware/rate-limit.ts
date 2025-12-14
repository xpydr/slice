import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthenticatedRequest } from './tenant-auth';
import { getRedisClient, isRedisAvailable, getRedisKeyPrefix } from '../lib/redis';

// In-memory store for rate limiting (fallback when Redis is unavailable)
interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX || '100', 10);
const RATE_LIMIT_TIME_WINDOW = parseInt(process.env.RATE_LIMIT_TIME_WINDOW || '60000', 10); // 1 minute in milliseconds

/**
 * Get rate limit record from Redis or in-memory fallback
 */
async function getRateLimitRecord(key: string): Promise<RateLimitRecord | null> {
  const redisClient = getRedisClient();
  const prefix = getRedisKeyPrefix();
  const fullKey = `${prefix}ratelimit:${key}`;
  const now = Date.now();

  // Try Redis first
  if (isRedisAvailable() && redisClient) {
    try {
      // Use hash to store count and resetTime
      const hash = await redisClient.hgetall(fullKey);
      if (hash && hash.count && hash.resetTime) {
        const record: RateLimitRecord = {
          count: parseInt(hash.count, 10),
          resetTime: parseInt(hash.resetTime, 10),
        };
        // Check if expired
        if (record.resetTime > now) {
          return record;
        } else {
          // Delete expired entry
          await redisClient.del(fullKey);
        }
      }
    } catch (error) {
      console.error('[RateLimit] Redis GET error, falling back to memory:', error);
      // Fall through to in-memory
    }
  }

  // Fallback to in-memory
  const record = rateLimitStore.get(key);
  if (record && record.resetTime > now) {
    return record;
  }

  // Remove expired entry
  if (record && record.resetTime <= now) {
    rateLimitStore.delete(key);
  }

  return null;
}

/**
 * Set rate limit record in Redis or in-memory fallback
 */
async function setRateLimitRecord(key: string, count: number, resetTime: number): Promise<void> {
  const redisClient = getRedisClient();
  const prefix = getRedisKeyPrefix();
  const fullKey = `${prefix}ratelimit:${key}`;
  const now = Date.now();
  const ttlSeconds = Math.ceil((resetTime - now) / 1000);

  // Try Redis first
  if (isRedisAvailable() && redisClient) {
    try {
      // Use hash to store count and resetTime
      await redisClient.hset(fullKey, {
        count: count.toString(),
        resetTime: resetTime.toString(),
      });
      await redisClient.expire(fullKey, ttlSeconds);
      return;
    } catch (error) {
      console.error('[RateLimit] Redis SET error, falling back to memory:', error);
      // Fall through to in-memory
    }
  }

  // Fallback to in-memory
  rateLimitStore.set(key, { count, resetTime });
}

/**
 * Increment rate limit count atomically in Redis or in-memory fallback
 */
async function incrementRateLimitCount(key: string, resetTime: number): Promise<RateLimitRecord> {
  const redisClient = getRedisClient();
  const prefix = getRedisKeyPrefix();
  const fullKey = `${prefix}ratelimit:${key}`;
  const now = Date.now();
  const ttlSeconds = Math.ceil((resetTime - now) / 1000);

  // Try Redis first
  if (isRedisAvailable() && redisClient) {
    try {
      // Use HINCRBY for atomic increment of count in hash
      const count = await redisClient.hincrby(fullKey, 'count', 1);
      
      // Ensure resetTime is set (in case this is a new key)
      await redisClient.hset(fullKey, 'resetTime', resetTime.toString());
      
      // Set TTL if this is a new key (count === 1)
      if (count === 1) {
        await redisClient.expire(fullKey, ttlSeconds);
      }
      
      return { count, resetTime };
    } catch (error) {
      console.error('[RateLimit] Redis INCR error, falling back to memory:', error);
      // Fall through to in-memory
    }
  }

  // Fallback to in-memory
  const record = rateLimitStore.get(key);
  if (record && record.resetTime > now) {
    record.count += 1;
    return record;
  } else {
    // Create new record
    const newRecord: RateLimitRecord = {
      count: 1,
      resetTime: now + RATE_LIMIT_TIME_WINDOW,
    };
    rateLimitStore.set(key, newRecord);
    return newRecord;
  }
}

/**
 * Clean up expired rate limit entries (in-memory only, Redis handles TTL automatically)
 */
function cleanupExpiredRateLimits(): void {
  const now = Date.now();
  const keysToDelete: string[] = [];

  for (const [key, record] of rateLimitStore.entries()) {
    if (record.resetTime <= now) {
      keysToDelete.push(key);
    }
  }

  keysToDelete.forEach(key => rateLimitStore.delete(key));
}

/**
 * Rate limiting middleware per tenant
 * Uses tenant ID from authenticated request to track rate limits
 */
export async function rateLimitMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  // Skip rate limiting for health check
  if (request.url === '/health') {
    return;
  }

  // Get tenant ID from authenticated request
  const authenticatedRequest = request as AuthenticatedRequest;
  const tenantId = authenticatedRequest.tenant?.id;

  // If no tenant ID (unauthenticated request), skip rate limiting
  // Authentication middleware will handle unauthorized requests
  if (!tenantId) {
    return;
  }

  const now = Date.now();
  const key = `tenant:${tenantId}`;

  // Clean up expired entries periodically (in-memory only, 1% chance)
  if (Math.random() < 0.01) {
    cleanupExpiredRateLimits();
  }

  // Get existing record
  let record = await getRateLimitRecord(key);

  if (!record || record.resetTime < now) {
    // First request or window expired, create new record
    const resetTime = now + RATE_LIMIT_TIME_WINDOW;
    await setRateLimitRecord(key, 1, resetTime);

    // Set rate limit headers
    reply.header('X-RateLimit-Limit', RATE_LIMIT_MAX.toString());
    reply.header('X-RateLimit-Remaining', (RATE_LIMIT_MAX - 1).toString());
    reply.header('X-RateLimit-Reset', new Date(resetTime).toISOString());
    return;
  }

  // Increment count atomically
  record = await incrementRateLimitCount(key, record.resetTime);

  // Check if limit exceeded
  if (record.count > RATE_LIMIT_MAX) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);
    
    reply.header('X-RateLimit-Limit', RATE_LIMIT_MAX.toString());
    reply.header('X-RateLimit-Remaining', '0');
    reply.header('X-RateLimit-Reset', new Date(record.resetTime).toISOString());
    reply.header('Retry-After', retryAfter.toString());
    
    return reply.code(429).send({
      success: false,
      error: 'Rate limit exceeded. Please try again later.',
      retryAfter,
    });
  }

  // Set rate limit headers
  reply.header('X-RateLimit-Limit', RATE_LIMIT_MAX.toString());
  reply.header('X-RateLimit-Remaining', (RATE_LIMIT_MAX - record.count).toString());
  reply.header('X-RateLimit-Reset', new Date(record.resetTime).toISOString());
}

