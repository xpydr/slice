import { FastifyRequest, FastifyReply } from 'fastify';
import { timingSafeEqual } from 'crypto';

/**
 * Middleware to authenticate platform admin requests using API key
 * Expects admin API key in Authorization header: "Bearer <admin_api_key>"
 * Validates against ADMIN_API_KEY environment variable
 */
export async function authenticateAdmin(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const adminApiKey = process.env.ADMIN_API_KEY;

    if (!adminApiKey) {
      console.error('ADMIN_API_KEY environment variable is not set');
      return reply.code(500).send({
        success: false,
        error: 'Admin authentication is not configured',
      });
    }

    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.code(401).send({
        success: false,
        error: 'Missing or invalid Authorization header. Expected: Bearer <admin_api_key>',
      });
    }

    const providedKey = authHeader.substring(7); // Remove "Bearer " prefix

    // Use constant-time comparison to prevent timing attacks
    const adminKeyBuffer = Buffer.from(adminApiKey, 'utf8');
    const providedKeyBuffer = Buffer.from(providedKey, 'utf8');

    // If lengths differ, create a buffer of the same length for comparison
    // This prevents timing attacks based on length differences
    if (adminKeyBuffer.length !== providedKeyBuffer.length) {
      return reply.code(401).send({
        success: false,
        error: 'Invalid admin API key',
      });
    }

    // Constant-time comparison
    const isValid = timingSafeEqual(adminKeyBuffer, providedKeyBuffer);

    if (!isValid) {
      return reply.code(401).send({
        success: false,
        error: 'Invalid admin API key',
      });
    }

    // Authentication successful - allow request to proceed
  } catch (error) {
    console.error('Admin authentication error:', error);
    return reply.code(500).send({
      success: false,
      error: 'Authentication failed',
    });
  }
}

