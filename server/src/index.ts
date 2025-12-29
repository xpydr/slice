import Fastify from 'fastify';
import validateRouter from './routes/validate';
import adminRouter from './routes/admin';
import billingRouter from './routes/billing';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import rateLimit from '@fastify/rate-limit';
import rawBody from 'fastify-raw-body';
import dotenv from 'dotenv';
import { rateLimitMiddleware } from './middleware/rate-limit';
import { cacheMiddleware } from './middleware/cache';
import { getRedisStatus, isRedisAvailable } from './lib/redis';

dotenv.config();

const fastify = Fastify({
  logger: true
});

const PORT = parseInt(process.env.PORT || '3001', 10);

// Register raw body plugin
fastify.register(rawBody, {
  field: 'rawBody',
  global: false,
});

// Register cookie plugin
fastify.register(cookie, {
  secret: process.env.JWT_SECRET || 'change-me-in-production',
  parseOptions: {},
});

// Register CORS
fastify.register(cors, {
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
  credentials: true, // Allow cookies to be sent
});

// Register rate limiting plugin (we'll use custom middleware instead)
// This is registered but we use custom middleware for per-tenant rate limiting
fastify.register(rateLimit, {
  max: 1000, // High limit, actual limiting done by custom middleware
  timeWindow: '1 minute',
  skipOnError: true,
});

// Add rate limiting hook (runs after authentication)
fastify.addHook('onRequest', async (request, reply) => {
  await rateLimitMiddleware(request, reply);
});

// Add caching hook for GET requests (runs after authentication)
fastify.addHook('onRequest', async (request, reply) => {
  await cacheMiddleware(request, reply);
});

// Health check
fastify.get('/health', async () => {
  const redisStatus = getRedisStatus();
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    cache: {
      type: isRedisAvailable() ? 'redis' : 'memory',
      redis: {
        connected: redisStatus.connected,
        host: redisStatus.host,
        port: redisStatus.port,
      },
    },
  };
});

// API Routes
fastify.register(validateRouter, { prefix: '/api/v1/validate' });
fastify.register(adminRouter, { prefix: '/api/v1/admin' });
fastify.register(billingRouter, { prefix: '/api/v1/billing' });

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`🚀 License Platform API running on http://localhost:${PORT}`);
    console.log(`📋 Health check: http://localhost:${PORT}/health`);
    console.log(`🔑 Validate endpoint: POST http://localhost:${PORT}/api/v1/validate`);
    console.log(`⚙️ Admin API: http://localhost:${PORT}/api/v1/admin`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();