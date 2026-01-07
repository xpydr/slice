import Redis from 'ioredis';

let redisClient: Redis | null = null;
let isConnected = false;
let connectionAttempted = false;
let connectionConfig: { type: 'url' | 'host-port' | 'none'; host?: string; port?: number } = { type: 'none' };

/**
 * Get or create Redis client singleton
 * Priority: REDIS_URL (production) > REDIS_HOST/REDIS_PORT (local) > in-memory fallback
 */
export function getRedisClient(): Redis | null {
  if (redisClient) {
    return redisClient;
  }

  const redisUrl = process.env.REDIS_URL;
  const host = process.env.REDIS_HOST;
  const port = process.env.REDIS_PORT;

  // If no Redis config at all, return null (will use in-memory fallback)
  if (!redisUrl && !host && !port) {
    connectionConfig = { type: 'none' };
    return null;
  }

  try {
    // Priority 1: Use REDIS_URL if provided (production)
    if (redisUrl) {
      connectionConfig = { type: 'url' };
      redisClient = new Redis(redisUrl, {
        retryStrategy: (times) => {
          // Retry with exponential backoff, max 3 seconds
          const delay = Math.min(times * 50, 3000);
          return delay;
        },
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        lazyConnect: true, // Don't connect immediately
      });
      console.log('[Redis] Using REDIS_URL for connection');
    } else {
      // Priority 2: Fall back to host/port config (local)
      connectionConfig = {
        type: 'host-port',
        host: host || 'localhost',
        port: parseInt(port || '6379', 10),
      };
      redisClient = new Redis({
        host: connectionConfig.host,
        port: connectionConfig.port,
        password: process.env.REDIS_PASSWORD || undefined,
        db: parseInt(process.env.REDIS_DB || '0', 10),
        retryStrategy: (times) => {
          // Retry with exponential backoff, max 3 seconds
          const delay = Math.min(times * 50, 3000);
          return delay;
        },
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        lazyConnect: true, // Don't connect immediately
      });
      console.log(`[Redis] Using host/port config: ${connectionConfig.host}:${connectionConfig.port}`);
    }

    // Connection event handlers
    redisClient.on('connect', () => {
      isConnected = true;
      connectionAttempted = true;
      console.log('[Redis] Connected to Redis server');
    });

    redisClient.on('ready', () => {
      isConnected = true;
      console.log('[Redis] Redis client ready');
    });

    redisClient.on('error', (err) => {
      isConnected = false;
      connectionAttempted = true;
      console.error('[Redis] Connection error:', err.message);
      // If connection fails, fall back to in-memory
      console.log('[Redis] Falling back to in-memory storage');
    });

    redisClient.on('close', () => {
      isConnected = false;
      console.log('[Redis] Connection closed');
    });

    redisClient.on('reconnecting', () => {
      isConnected = false;
      console.log('[Redis] Reconnecting...');
    });

    // Attempt to connect
    redisClient.connect().catch((err) => {
      isConnected = false;
      connectionAttempted = true;
      console.error('[Redis] Failed to connect:', err.message);
      console.log('[Redis] Falling back to in-memory storage');
      // Clear the client so it can be retried later if needed
      redisClient = null;
    });

    return redisClient;
  } catch (error) {
    console.error('[Redis] Failed to create Redis client:', error);
    isConnected = false;
    connectionAttempted = true;
    connectionConfig = { type: 'none' };
    console.log('[Redis] Falling back to in-memory storage');
    return null;
  }
}

/**
 * Check if Redis is available and connected
 */
export function isRedisAvailable(): boolean {
  const client = getRedisClient();
  return client !== null && isConnected && client.status === 'ready';
}

/**
 * Get Redis connection status information
 */
export function getRedisStatus(): {
  connected: boolean;
  attempted: boolean;
  host?: string;
  port?: number;
  configType?: 'url' | 'host-port' | 'none';
} {
  const client = getRedisClient();
  const redisUrl = process.env.REDIS_URL;
  
  return {
    connected: isRedisAvailable(),
    attempted: connectionAttempted,
    host: redisUrl ? undefined : (connectionConfig.host || process.env.REDIS_HOST || 'localhost'),
    port: redisUrl ? undefined : (connectionConfig.port || parseInt(process.env.REDIS_PORT || '6379', 10)),
    configType: connectionConfig.type,
  };
}

/**
 * Get Redis key prefix from environment
 */
export function getRedisKeyPrefix(): string {
  return process.env.REDIS_KEY_PREFIX || 'slice:cache:';
}
