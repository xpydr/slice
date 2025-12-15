import argon2 from 'argon2';

/**
 * Generate a 6-digit numeric verification code
 * @returns 6-digit code as string (e.g., "123456")
 */
export function generateCode(): string {
  // Generate random 6-digit number (100000 to 999999)
  const code = Math.floor(100000 + Math.random() * 900000);
  return code.toString();
}

/**
 * Hash a verification code using argon2
 * @param code Plain text verification code
 * @returns Hashed code string
 */
export async function hashCode(code: string): Promise<string> {
  return await argon2.hash(code);
}

/**
 * Verify a code against a hash
 * @param input Plain text code from user
 * @param hash Hashed code from database
 * @returns True if code matches, false otherwise
 */
export async function verifyCode(input: string, hash: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, input);
  } catch (error) {
    console.error('Code verification error:', error);
    return false;
  }
}
