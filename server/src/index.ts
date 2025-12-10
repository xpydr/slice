import Fastify from 'fastify';
import validateRouter from './routes/validate';
import adminRouter from './routes/admin';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import dotenv from 'dotenv';

dotenv.config();

const fastify = Fastify({
  logger: true
});

const PORT = parseInt(process.env.PORT || '3001', 10);

// Register cookie plugin
fastify.register(cookie, {
  secret: process.env.JWT_SECRET || 'change-me-in-production',
  parseOptions: {},
});

// Register CORS
fastify.register(cors, {
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // Allow cookies to be sent
});

// Health check
fastify.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// API Routes
fastify.register(validateRouter, { prefix: '/api/v1/validate' });
fastify.register(adminRouter, { prefix: '/api/v1/admin' });

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