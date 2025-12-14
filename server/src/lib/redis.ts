import Redis from 'ioredis';

let redisClient: Redis | null = null;
let isConnected = false;
let connectionAttempted = false;

/**
 * Get or create Redis client singleton
 */
export function getRedisClient(): Redis | null {
  if (redisClient) {
    return redisClient;
  }

  // Only attempt connection if Redis config is provided
  const host = process.env.REDIS_HOST;
  const port = process.env.REDIS_PORT;

  // If no Redis config, return null (will use in-memory fallback)
  if (!host && !port) {
    return null;
  }

  try {
    redisClient = new Redis({
      host: host || 'localhost',
      port: parseInt(port || '6379', 10),
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
    });

    return redisClient;
  } catch (error) {
    console.error('[Redis] Failed to create Redis client:', error);
    isConnected = false;
    connectionAttempted = true;
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
} {
  const client = getRedisClient();
  return {
    connected: isRedisAvailable(),
    attempted: connectionAttempted,
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  }
}

/**
 * Get Redis key prefix from environment
 */
export function getRedisKeyPrefix(): string {
  return process.env.REDIS_KEY_PREFIX || 'slice:cache:';
}
