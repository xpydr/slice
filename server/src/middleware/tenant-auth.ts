import { FastifyRequest, FastifyReply } from 'fastify';
import { db } from '../db';

export interface AuthenticatedRequest extends FastifyRequest {
  tenant?: {
    id: string;
    name: string;
    status: string;
  }
}

/**
 * Middleware to authenticate requests using API key
 * Expects API key in Authorization header: "Bearer sk_live_..."
 */
export async function authenticateTenant(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.code(401).send({
        success: false,
        error: 'Missing or invalid Authorization header. Expected: Bearer <api_key>',
      });
    }

    const apiKey = authHeader.substring(7); // Remove "Bearer " prefix

    // Find tenant by API key
    const tenant = await db.getTenantByApiKey(apiKey);

    if (!tenant) {
      return reply.code(401).send({
        success: false,
        error: 'Invalid API key',
      });
    }

    // Check tenant status
    if (tenant.status !== 'active') {
      return reply.code(403).send({
        success: false,
        error: `Tenant account is ${tenant.status}`,
      });
    }

    // Check API key status
    if (tenant.apiKeyStatus !== 'active') {
      return reply.code(403).send({
        success: false,
        error: 'API key is revoked or expired',
      });
    }

    // Check if API key is expired
    if (tenant.apiKeyExpiresAt && tenant.apiKeyExpiresAt < new Date()) {
      return reply.code(403).send({
        success: false,
        error: 'API key has expired',
      });
    }

    // Attach tenant to request
    (request as AuthenticatedRequest).tenant = {
      id: tenant.id,
      name: tenant.name,
      status: tenant.status,
    }

    // Update last used timestamp (fire and forget)
    db.updateApiKeyLastUsed(tenant.apiKeyId).catch(console.error);
  } catch (error) {
    console.error('Authentication error:', error);
    return reply.code(500).send({
      success: false,
      error: 'Authentication failed',
    });
  }
}