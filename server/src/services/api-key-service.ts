import crypto from 'crypto';

/**
 * Generates a secure API key for tenant authentication
 * Format: sk_live_XXXX... (32+ characters)
 */
export function generateApiKey(): string {
  // Generate 24 random bytes (192 bits of entropy)
  const randomBytes = crypto.randomBytes(24);
  
  // Base64 URL-safe encoding
  const key = randomBytes.toString('base64url');
  
  // Prefix for identification
  return `sk_live_${key}`;
}

/**
 * Hashes an API key for secure storage
 */
export function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

/**
 * Extracts the prefix from an API key (first 8 chars after prefix)
 */
export function getApiKeyPrefix(key: string): string {
  // Extract first 8 characters after "sk_live_"
  const match = key.match(/^sk_live_([a-zA-Z0-9_-]{8})/);
  return match ? `sk_live_${match[1]}` : key.substring(0, 16);
}

/**
 * Validates API key format
 */
export function isValidApiKeyFormat(key: string): boolean {
  return /^sk_live_[a-zA-Z0-9_-]{32,}$/.test(key);
}

/**
 * Verifies an API key against a hash
 */
export function verifyApiKey(key: string, hash: string): boolean {
  const keyHash = hashApiKey(key);
  return crypto.timingSafeEqual(
    Buffer.from(keyHash),
    Buffer.from(hash)
  );
}

