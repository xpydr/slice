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

if (isProduction) {
  const requiredEnvVars = ['JWT_SECRET', 'CORS_ORIGIN'];
  const missing = requiredEnvVars.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
}

const fastify = Fastify({
  logger: isProduction && process.env.LOG_PRETTY
    ? { transport: { target: 'pino-pretty', options: { colorize: true } } }
    : true,
  trustProxy: true,
  requestIdLogLabel: 'reqId',
  requestIdHeader: 'x-request-id',
  bodyLimit: 1048576,
});

fastify.register(rawBody, {
  encoding: false,
  runFirst: true,
  field: 'rawBody',
  global: false,
});

fastify.register(cookie, {
  secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  parseOptions: {
    httpOnly: true,
    secure: isProduction, // Only send over HTTPS in production
    sameSite: isProduction ? 'none' : 'lax',
  },
});

const corsOrigin = process.env.CORS_ORIGIN || 'https://www.sliceapi.com';
fastify.register(cors, {
  origin: corsOrigin,
  credentials: true,
});

fastify.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute',
  skipOnError: true,
});

fastify.addHook('onRequest', async (request, reply) => {
  await rateLimitMiddleware(request, reply);
  await cacheMiddleware(request, reply);
});

fastify.setErrorHandler((error: unknown, request, reply) => {
  let statusCode = 500;
  let message = 'Internal Server Error';

  if (error && typeof error === 'object') {
    if ('statusCode' in error && typeof error.statusCode === 'number') {
      statusCode = error.statusCode;
    }
    if ('message' in error && typeof error.message === 'string') {
      message = error.message;
    }
  } else if (error instanceof Error) {
    message = error.message;
    if ('statusCode' in error && typeof (error as any).statusCode === 'number') {
      statusCode = (error as any).statusCode;
    }
  }

  fastify.log.error({
    err: error,
    reqId: request.id,
    url: request.url,
    method: request.method,
  }, 'Request error');

  const response: { success: false; error: string; requestId?: string } = {
    success: false,
    error: isProduction && statusCode === 500 ? 'Internal Server Error' : message,
  };

  if (request.id) {
    response.requestId = request.id;
  }

  reply.status(statusCode).send(response);
});

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

fastify.get('/robots.txt', async (_, reply) => {
  return reply
    .type('text/plain')
    .send(`User-agent: *\nDisallow: /`);
});

fastify.register(validateRouter, { prefix: '/api/v1/validate' });
fastify.register(adminRouter, { prefix: '/api/v1/admin' });
fastify.register(billingRouter, { prefix: '/api/v1/billing' });

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

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('uncaughtException', (error) => {
  fastify.log.fatal({ err: error }, 'Uncaught exception');
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  fastify.log.fatal({ err: reason, promise }, 'Unhandled rejection');
  gracefulShutdown('unhandledRejection');
});

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