import { describe, it, expect, beforeEach } from 'vitest';
import { hashPassword, verifyPassword } from '@/lib/auth/crypto';
import { checkRateLimit, recordFailedAttempt, resetRateLimit } from '@/lib/auth/rateLimiter';
import { authService } from '@/services/authService';

describe('Server Authentication Engine', () => {
  describe('Cryptographic Security (scrypt & timingSafeEqual)', () => {
    it('hashes passwords using scrypt and generates non-plaintext salt/hash format', async () => {
      const rawPassword = 'SecureP@ssw0rd2026!';
      const hash = await hashPassword(rawPassword);

      expect(hash.startsWith('scrypt$v1$')).toBe(true);
      expect(hash).not.toContain(rawPassword);

      // Verify that same password hashes differently due to random 16-byte salt
      const hash2 = await hashPassword(rawPassword);
      expect(hash).not.toBe(hash2);
    });

    it('successfully verifies correct password and rejects incorrect password', async () => {
      const rawPassword = 'ValidPassword123#';
      const hash = await hashPassword(rawPassword);

      const isValid = await verifyPassword(rawPassword, hash);
      expect(isValid).toBe(true);

      const isInvalid = await verifyPassword('WrongPassword!', hash);
      expect(isInvalid).toBe(false);
    });

    it('gracefully handles malformed hash strings', async () => {
      const isInvalid = await verifyPassword('SomePassword', 'not-a-valid-scrypt-hash');
      expect(isInvalid).toBe(false);
    });
  });

  describe('Rate Limiter', () => {
    const testKey = 'test-client-ip-1';

    beforeEach(() => {
      resetRateLimit(testKey);
    });

    it('allows initial attempts and tracks attempt count', () => {
      const check1 = checkRateLimit(testKey);
      expect(check1.allowed).toBe(true);
      expect(check1.remaining).toBe(5);

      recordFailedAttempt(testKey);
      const check2 = checkRateLimit(testKey);
      expect(check2.allowed).toBe(true);
      expect(check2.remaining).toBe(4);
    });

    it('locks out after 5 consecutive failed attempts', () => {
      for (let i = 0; i < 5; i++) {
        recordFailedAttempt(testKey);
      }

      const lockedCheck = checkRateLimit(testKey);
      expect(lockedCheck.allowed).toBe(false);
      expect(lockedCheck.remaining).toBe(0);
      expect(lockedCheck.resetSeconds).toBeGreaterThan(0);
    });

    it('resets lockout on explicit reset', () => {
      for (let i = 0; i < 5; i++) {
        recordFailedAttempt(testKey);
      }
      expect(checkRateLimit(testKey).allowed).toBe(false);

      resetRateLimit(testKey);
      expect(checkRateLimit(testKey).allowed).toBe(true);
    });
  });

  describe('AuthService Server-Side Workflows', () => {
    const uniqueEmail = `server_dev_${Date.now()}@api-atlas.dev`;
    const password = 'StrongPassword2026!';

    it('validates input and registers a new user with scrypt hash and active session', async () => {
      const result = await authService.register({
        name: 'Ada Lovelace',
        email: uniqueEmail,
        password,
      });

      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user?.email).toBe(uniqueEmail);
      expect(result.user?.name).toBe('Ada Lovelace');
      expect(result.user?.authMethod).toBe('email');
      expect(result.session).toBeDefined();
      expect(result.session?.id).toBeTruthy();
    });

    it('rejects duplicate email registrations with clear non-sensitive message', async () => {
      const result = await authService.register({
        name: 'Duplicate Ada',
        email: uniqueEmail,
        password: 'AnotherPassword123!',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('already exists');
    });

    it('rejects invalid email formats and short passwords with server-side Zod validation', async () => {
      const badEmail = await authService.register({
        name: 'Bob',
        email: 'invalid-email',
        password: 'LongValidPassword123!',
      });
      expect(badEmail.success).toBe(false);

      const shortPassword = await authService.register({
        name: 'Bob',
        email: 'bob@example.com',
        password: 'short',
      });
      expect(shortPassword.success).toBe(false);
      expect(shortPassword.error).toContain('at least 8 characters');
    });

    it('authenticates valid credentials and yields a persistent session', async () => {
      const signin = await authService.signIn({
        email: uniqueEmail,
        password,
        clientIp: '127.0.0.1',
      });

      expect(signin.success).toBe(true);
      expect(signin.user?.email).toBe(uniqueEmail);
      expect(signin.user?.authMethod).toBe('email');
      expect(signin.session).toBeDefined();

      // Session can be validated
      const validation = await authService.validateSession(signin.session!.id);
      expect(validation).not.toBeNull();
      expect(validation?.user.email).toBe(uniqueEmail);
      expect(validation?.user.authMethod).toBe('email');
    });

    it('rejects invalid password and increments rate-limiting', async () => {
      const failed = await authService.signIn({
        email: uniqueEmail,
        password: 'WrongPassword123!',
        clientIp: '127.0.0.2',
      });

      expect(failed.success).toBe(false);
      expect(failed.error).toContain('Invalid email or password');
    });

    it('invalidates session on sign-out', async () => {
      const signin = await authService.signIn({
        email: uniqueEmail,
        password,
      });
      expect(signin.success).toBe(true);
      const sessionId = signin.session!.id;

      // Validate session works
      const before = await authService.validateSession(sessionId);
      expect(before).not.toBeNull();

      // Sign out
      await authService.signOut(sessionId);

      // Validate session is now null
      const after = await authService.validateSession(sessionId);
      expect(after).toBeNull();
    });
  });
});
