import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthenticatedRequest } from './tenant-auth';
import { getRedisClient, isRedisAvailable, getRedisKeyPrefix } from '../lib/redis';

// In-memory cache store (fallback when Redis is unavailable)
interface CacheEntry {
  data: any;
  expiresAt: number;
  tags: string[];
}

const cacheStore = new Map<string, CacheEntry>();

const CACHE_TTL = parseInt(process.env.CACHE_TTL || '300000', 10); // 5 minutes default

/**
 * Generate cache key from request
 */
function generateCacheKey(request: FastifyRequest, tenantId?: string): string {
  const method = request.method;
  const path = request.url.split('?')[0]; // Remove query string from path
  const queryString = request.url.includes('?') 
    ? request.url.split('?')[1] 
    : '';
  
  if (tenantId) {
    return `${method}:${path}:tenant:${tenantId}:${queryString}`;
  }
  return `${method}:${path}:${queryString}`;
}

/**
 * Get cache entry from Redis or in-memory fallback
 */
async function getCacheEntry(key: string): Promise<CacheEntry | null> {
  const redisClient = getRedisClient();
  const prefix = getRedisKeyPrefix();
  const fullKey = `${prefix}${key}`;

  // Try Redis first
  if (isRedisAvailable() && redisClient) {
    try {
      const value = await redisClient.get(fullKey);
      if (value) {
        const entry = JSON.parse(value) as CacheEntry;
        // Check if expired
        if (entry.expiresAt > Date.now()) {
          return entry;
        } else {
          // Delete expired entry
          await redisClient.del(fullKey);
          // Also remove from tag sets
          for (const tag of entry.tags) {
            await redisClient.srem(`${prefix}tags:${tag}`, fullKey);
          }
        }
      }
    } catch (error) {
      console.error('[Cache] Redis GET error, falling back to memory:', error);
      // Fall through to in-memory
    }
  }

  // Fallback to in-memory
  const entry = cacheStore.get(key);
  if (entry && entry.expiresAt > Date.now()) {
    return entry;
  }

  // Remove expired entry
  if (entry && entry.expiresAt <= Date.now()) {
    cacheStore.delete(key);
  }

  return null;
}

/**
 * Set cache entry in Redis or in-memory fallback
 */
async function setCacheEntry(key: string, entry: CacheEntry, ttlSeconds: number): Promise<void> {
  const redisClient = getRedisClient();
  const prefix = getRedisKeyPrefix();
  const fullKey = `${prefix}${key}`;

  // Try Redis first
  if (isRedisAvailable() && redisClient) {
    try {
      const multi = redisClient.multi();
      
      // Store the cache entry with TTL
      multi.setex(fullKey, ttlSeconds, JSON.stringify(entry));
      
      // Add key to tag sets
      for (const tag of entry.tags) {
        multi.sadd(`${prefix}tags:${tag}`, fullKey);
        // Set TTL on tag set (slightly longer than entry TTL to ensure cleanup)
        multi.expire(`${prefix}tags:${tag}`, ttlSeconds + 60);
      }
      
      await multi.exec();
      return;
    } catch (error) {
      console.error('[Cache] Redis SET error, falling back to memory:', error);
      // Fall through to in-memory
    }
  }

  // Fallback to in-memory
  cacheStore.set(key, entry);
}

/**
 * Delete cache keys from Redis or in-memory fallback
 */
async function deleteCacheKeys(keys: string[]): Promise<void> {
  if (keys.length === 0) return;

  const redisClient = getRedisClient();
  const prefix = getRedisKeyPrefix();

  // Try Redis first
  if (isRedisAvailable() && redisClient) {
    try {
      const fullKeys = keys.map(key => `${prefix}${key}`);
      await redisClient.del(...fullKeys);
      return;
    } catch (error) {
      console.error('[Cache] Redis DEL error, falling back to memory:', error);
      // Fall through to in-memory
    }
  }

  // Fallback to in-memory
  keys.forEach(key => cacheStore.delete(key));
}

/**
 * Get cache keys by tags from Redis or in-memory fallback
 */
async function getKeysByTags(tags: string[]): Promise<string[]> {
  const redisClient = getRedisClient();
  const prefix = getRedisKeyPrefix();
  const allKeys = new Set<string>();

  // Try Redis first
  if (isRedisAvailable() && redisClient) {
    try {
      for (const tag of tags) {
        const tagSetKey = `${prefix}tags:${tag}`;
        const keys = await redisClient.smembers(tagSetKey);
        keys.forEach(key => {
          // Remove prefix to get original key
          if (key.startsWith(prefix)) {
            allKeys.add(key.substring(prefix.length));
          }
        });
      }
      return Array.from(allKeys);
    } catch (error) {
      console.error('[Cache] Redis tag lookup error, falling back to memory:', error);
      // Fall through to in-memory
    }
  }

  // Fallback to in-memory
  const now = Date.now();
  for (const [key, entry] of cacheStore.entries()) {
    if (entry.expiresAt > now && entry.tags.some(tag => tags.includes(tag))) {
      allKeys.add(key);
    }
  }

  return Array.from(allKeys);
}

/**
 * Cache middleware for GET requests
 */
export async function cacheMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  // Only cache GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip caching for health check
  if (request.url === '/health') {
    return;
  }

  const authenticatedRequest = request as AuthenticatedRequest;
  const tenantId = authenticatedRequest.tenant?.id;

  // Only cache authenticated requests with tenant ID
  if (!tenantId) {
    return;
  }

  const cacheKey = generateCacheKey(request, tenantId);
  const entry = await getCacheEntry(cacheKey);
  const now = Date.now();

  // Check if cache entry exists and is valid
  if (entry && entry.expiresAt > now) {
    // Cache hit - return cached response
    reply.header('X-Cache', 'HIT');
    reply.header('Cache-Control', `public, max-age=${Math.floor((entry.expiresAt - now) / 1000)}`);
    return reply.send(entry.data);
  }

  // Store original send function
  const originalSend = reply.send.bind(reply);
  
  // Override send to cache the response
  reply.send = function(data: any) {
    // Only cache successful responses (status 200)
    if (reply.statusCode === 200 && data) {
      const expiresAt = now + CACHE_TTL;
      const ttlSeconds = Math.floor(CACHE_TTL / 1000);
      
      // Generate cache tags based on path
      const tags: string[] = [`tenant:${tenantId}`];
      if (request.url.includes('/products')) {
        tags.push(`tenant:${tenantId}:products`);
      } else if (request.url.includes('/plans')) {
        tags.push(`tenant:${tenantId}:plans`);
      } else if (request.url.includes('/licenses')) {
        tags.push(`tenant:${tenantId}:licenses`);
      } else if (request.url.includes('/users')) {
        tags.push(`tenant:${tenantId}:users`);
      } else if (request.url.includes('/audit-logs')) {
        tags.push(`tenant:${tenantId}:audit-logs`);
      }

      const cacheEntry: CacheEntry = {
        data,
        expiresAt,
        tags,
      };

      // Cache asynchronously (don't await to avoid blocking response)
      setCacheEntry(cacheKey, cacheEntry, ttlSeconds).catch(err => {
        console.error('[Cache] Failed to cache response:', err);
      });

      // Set cache headers
      reply.header('X-Cache', 'MISS');
      reply.header('Cache-Control', `public, max-age=${ttlSeconds}`);
    }

    return originalSend(data);
  };
}

/**
 * Invalidate cache entries by tags
 */
export async function invalidateCacheByTags(tags: string[]): Promise<void> {
  if (tags.length === 0) return;

  try {
    // Get all keys matching the tags
    const keysToDelete = await getKeysByTags(tags);
    
    if (keysToDelete.length > 0) {
      await deleteCacheKeys(keysToDelete);
    }

    // Also clean up tag sets in Redis
    const redisClient = getRedisClient();
    const prefix = getRedisKeyPrefix();
    
    if (isRedisAvailable() && redisClient) {
      try {
        const tagSetKeys = tags.map(tag => `${prefix}tags:${tag}`);
        await redisClient.del(...tagSetKeys);
      } catch (error) {
        console.error('[Cache] Failed to clean up tag sets:', error);
      }
    }
  } catch (error) {
    console.error('[Cache] Error invalidating cache by tags:', error);
  }
}

/**
 * Clean up expired cache entries (in-memory only, Redis handles TTL automatically)
 */
export function cleanupExpiredCache(): void {
  const now = Date.now();
  const keysToDelete: string[] = [];

  for (const [key, entry] of cacheStore.entries()) {
    if (entry.expiresAt <= now) {
      keysToDelete.push(key);
    }
  }

  keysToDelete.forEach(key => cacheStore.delete(key));
}

// Periodic cleanup for in-memory cache (every 5 minutes)
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupExpiredCache, 5 * 60 * 1000);
}
