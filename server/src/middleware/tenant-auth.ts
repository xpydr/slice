import { FastifyRequest, FastifyReply, RouteGenericInterface } from 'fastify';
import { db } from '../db';
import { verifyToken, getSessionByToken } from '../services/jwt-service';

export interface AuthenticatedRequest<T extends RouteGenericInterface = RouteGenericInterface> extends FastifyRequest<T> {
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

    const apiKey = authHeader.substring(7);

    const tenant = await db.getTenantByApiKey(apiKey);

    if (!tenant) {
      return reply.code(401).send({
        success: false,
        error: 'Invalid API key',
      });
    }

    if (tenant.apiKeyStatus !== 'active') {
      return reply.code(403).send({
        success: false,
        error: 'API key is revoked or expired',
      });
    }

    if (tenant.apiKeyExpiresAt && tenant.apiKeyExpiresAt < new Date()) {
      return reply.code(403).send({
        success: false,
        error: 'API key has expired',
      });
    }

    (request as AuthenticatedRequest).tenant = {
      id: tenant.id,
      name: tenant.name,
      status: tenant.status,
    }

    db.updateApiKeyLastUsed(tenant.apiKeyId).catch((err) => {
    });
  } catch (error) {
    return reply.code(500).send({
      success: false,
      error: 'Authentication failed',
    });
  }
}

/**
 * Middleware to authenticate requests using JWT token from HTTP-only cookie
 * Used for dashboard/analytics access (frontend → backend)
 * Reads token from 'auth_token' cookie, validates it, and checks session in database
 */
export async function authenticateTenantSession(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const token = request.cookies.auth_token;

    if (!token) {
      return reply.code(401).send({
        success: false,
        error: 'Missing authentication cookie',
      });
    }

    const session = await getSessionByToken(token);
    if (!session) {
      return reply.code(401).send({
        success: false,
        error: 'Invalid or expired session',
      });
    }

    const tenant = await db.getTenant(session.tenantId);
    if (!tenant) {
      return reply.code(401).send({
        success: false,
        error: 'Tenant not found',
      });
    }

    if (tenant.status === 'suspended') {
      return reply.code(403).send({
        success: false,
        error: `Tenant account is ${tenant.status}`,
      });
    }

    db.updateSessionLastUsed(session.id).catch(console.error);

    (request as AuthenticatedRequest).tenant = {
      id: tenant.id,
      name: tenant.name,
      status: tenant.status,
    }
  } catch (error) {
    console.error('Session authentication error:', error);
    return reply.code(500).send({
      success: false,
      error: 'Authentication failed',
    });
  }
}

/**
 * Middleware to authenticate requests using either API key (bearer token) or JWT session
 * First attempts bearer token authentication, then falls back to session authentication
 * Used for endpoints that need to support both tenant server (API key) and dashboard (session) access
 */
export async function authenticateTenantOrSession(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const authHeader = request.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const apiKey = authHeader.substring(7);

      const tenant = await db.getTenantByApiKey(apiKey);

      if (tenant) {
        if (tenant.apiKeyStatus !== 'active') {
        } else if (tenant.apiKeyExpiresAt && tenant.apiKeyExpiresAt < new Date()) {
        } else {
          (request as AuthenticatedRequest).tenant = {
            id: tenant.id,
            name: tenant.name,
            status: tenant.status,
          };

          db.updateApiKeyLastUsed(tenant.apiKeyId).catch(console.error);
          return;
        }
      }
    }

    const token = request.cookies.auth_token;

    if (!token) {
      return reply.code(401).send({
        success: false,
        error: 'Missing authentication. Provide either Authorization header with Bearer token or authentication cookie',
      });
    }

    const session = await getSessionByToken(token);
    if (!session) {
      return reply.code(401).send({
        success: false,
        error: 'Invalid or expired session',
      });
    }

    const tenant = await db.getTenant(session.tenantId);
    if (!tenant) {
      return reply.code(401).send({
        success: false,
        error: 'Tenant not found',
      });
    }

    if (tenant.status === 'suspended') {
      return reply.code(403).send({
        success: false,
        error: `Tenant account is ${tenant.status}`,
      });
    }

    db.updateSessionLastUsed(session.id).catch(console.error);

    (request as AuthenticatedRequest).tenant = {
      id: tenant.id,
      name: tenant.name,
      status: tenant.status,
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return reply.code(500).send({
      success: false,
      error: 'Authentication failed',
    });
  }
}