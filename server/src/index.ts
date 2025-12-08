import Fastify from 'fastify';
import validateRouter from './routes/validate';
import adminRouter from './routes/admin';

const fastify = Fastify({
  logger: true
});

const PORT = parseInt(process.env.PORT || '3000', 10);

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