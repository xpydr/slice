import jwt, { JwtPayload } from 'jsonwebtoken';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { db } from '../db';
import { TenantSession } from '../types';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const SESSION_EXPIRY_DAYS = parseInt(process.env.SESSION_EXPIRY_DAYS || '7', 10);

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}

// Type assertion: we've checked JWT_SECRET is not undefined above
const secret: string = JWT_SECRET;

/**
 * Hash a JWT token for secure storage
 */
function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Generate a JWT token for a tenant
 * @param tenantId Tenant ID to encode in token
 * @returns JWT token string
 */
export function generateToken(tenantId: string): string {
  return jwt.sign({ tenantId }, secret, {
    expiresIn: `${SESSION_EXPIRY_DAYS}d`, // Token expires in configured days
  });
}

/**
 * Verify and decode a JWT token
 * @param token JWT token string
 * @returns Decoded token with tenantId, or null if invalid
 */
export function verifyToken(token: string): { tenantId: string } | null {
  try {
    const decoded = jwt.verify(token, secret) as JwtPayload & { tenantId: string };
    if (typeof decoded === 'string' || !decoded.tenantId) {
      return null;
    }
    return { tenantId: decoded.tenantId };
  } catch (error) {
    return null;
  }
}

/**
 * Create a session for a tenant (generates JWT and stores session in database)
 * @param tenantId Tenant ID
 * @returns Object with token and session
 */
export async function createSession(tenantId: string): Promise<{ token: string; session: TenantSession }> {
  const token = generateToken(tenantId);
  const tokenHash = hashToken(token);
  
  // Calculate expiration date
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRY_DAYS);
  
  const session = await db.createSession(tenantId, tokenHash, expiresAt);
  
  return { token, session };
}

/**
 * Get session by token (validates token and retrieves session from database)
 * @param token JWT token string
 * @returns Session if valid, null otherwise
 */
export async function getSessionByToken(token: string): Promise<TenantSession | null> {
  // First verify the token is valid
  const decoded = verifyToken(token);
  if (!decoded) {
    return null;
  }
  
  // Get session from database
  const tokenHash = hashToken(token);
  const session = await db.getSessionByTokenHash(tokenHash);
  
  if (!session) {
    return null;
  }
  
  // Check if session is revoked or expired
  if (session.revokedAt || session.expiresAt < new Date()) {
    return null;
  }
  
  return session;
}

/**
 * Revoke a session
 * @param sessionId Session ID
 */
export async function revokeSession(sessionId: string): Promise<void> {
  await db.revokeSession(sessionId);
}

