import crypto from 'node:crypto';

const SALT_BYTES = 16;
const KEY_LENGTH = 64;

/**
 * Hash password securely using Node.js scrypt with a unique cryptographically secure salt.
 * OWASP recommendation: scrypt (cost=16384, blockSize=8, parallelization=1)
 */
export async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(SALT_BYTES);
    crypto.scrypt(
      password,
      salt,
      KEY_LENGTH,
      { N: 16384, r: 8, p: 1, maxmem: 32 * 1024 * 1024 },
      (err, derivedKey) => {
        if (err) return reject(err);
        resolve(`scrypt$v1$${salt.toString('hex')}$${derivedKey.toString('hex')}`);
      }
    );
  });
}

/**
 * Verify password against stored scrypt hash using timing-safe comparison
 */
export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const parts = storedHash.split('$');
      if (parts.length !== 4 || parts[0] !== 'scrypt' || parts[1] !== 'v1') {
        return resolve(false);
      }

      const salt = Buffer.from(parts[2], 'hex');
      const originalHash = Buffer.from(parts[3], 'hex');

      crypto.scrypt(
        password,
        salt,
        originalHash.length,
        { N: 16384, r: 8, p: 1, maxmem: 32 * 1024 * 1024 },
        (err, derivedKey) => {
          if (err) return resolve(false);
          resolve(crypto.timingSafeEqual(originalHash, derivedKey));
        }
      );
    } catch {
      resolve(false);
    }
  });
}

/**
 * Generate cryptographically secure session token (256-bit entropy)
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}
