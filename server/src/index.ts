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

const isProduction = process.env.NODE_ENV === 'production';
const PORT = parseInt(process.env.PORT || '3001', 10);

// Validate required environment variables in production
if (isProduction) {
  const requiredEnvVars = ['JWT_SECRET', 'CORS_ORIGIN'];
  const missing = requiredEnvVars.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
}

const fastify = Fastify({
  logger: isProduction
    ? {
      level: process.env.LOG_LEVEL || 'info',
      transport: process.env.LOG_PRETTY
        ? { target: 'pino-pretty', options: { colorize: true } }
        : undefined,
    }
    : true,
  trustProxy: true, // Critical for Railway/production behind reverse proxy
  requestIdLogLabel: 'reqId',
  requestIdHeader: 'x-request-id',
  bodyLimit: 1048576, // 1MB limit for request body
  disableRequestLogging: false,
});

// Register raw body plugin
fastify.register(rawBody, {
  field: 'rawBody',
  global: false,
});

// Register cookie plugin
// JWT_SECRET is already validated above for production
fastify.register(cookie, {
  secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  parseOptions: {
    httpOnly: true,
    secure: isProduction, // Only send over HTTPS in production
    sameSite: isProduction ? 'strict' : 'lax',
  },
});

// Register CORS
const corsOrigin = process.env.CORS_ORIGIN || 'https://www.sliceapi.com';
// CORS_ORIGIN is already validated above for production
fastify.register(cors, {
  origin: isProduction ? corsOrigin : (corsOrigin || true),
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset', 'X-Request-Id'],
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

// Global error handler
fastify.setErrorHandler((error, request, reply) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  // Log error details
  fastify.log.error({
    err: error,
    reqId: request.id,
    url: request.url,
    method: request.method,
  }, 'Request error');

  // Don't expose internal error details in production
  const response: { success: false; error: string; requestId?: string } = {
    success: false,
    error: isProduction && statusCode === 500 ? 'Internal Server Error' : message,
  };

  // Include request ID for tracing
  if (request.id) {
    response.requestId = request.id;
  }

  reply.status(statusCode).send(response);
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

// Graceful shutdown handler
const gracefulShutdown = async (signal: string) => {
  fastify.log.info({ signal }, 'Received shutdown signal, closing server gracefully...');

  try {
    await fastify.close();
    fastify.log.info('Server closed successfully');
    process.exit(0);
  } catch (err) {
    fastify.log.error({ err }, 'Error during shutdown');
    process.exit(1);
  }
};

// Register shutdown handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', (error) => {
  fastify.log.fatal({ err: error }, 'Uncaught exception');
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  fastify.log.fatal({ err: reason, promise }, 'Unhandled rejection');
  gracefulShutdown('unhandledRejection');
});

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: PORT, host: '0.0.0.0' });

    const logMessage = isProduction
      ? `🚀 License Platform API running on port ${PORT} (production)`
      : `🚀 License Platform API running on http://localhost:${PORT}`;

    fastify.log.info(logMessage);
    fastify.log.info(`📋 Health check: http://localhost:${PORT}/health`);
    fastify.log.info(`🔑 Validate endpoint: POST http://localhost:${PORT}/api/v1/validate`);
    fastify.log.info(`⚙️ Admin API: http://localhost:${PORT}/api/v1/admin`);
  } catch (err) {
    fastify.log.error({ err }, 'Failed to start server');
    process.exit(1);
  }
};

start();