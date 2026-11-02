import { describe, it, expect, beforeEach } from 'vitest';
import {
  isValidEmail,
  evaluatePassword,
  authenticate,
  register,
  requestPasswordReset,
} from '@/components/auth/authStore';

describe('Auth Utilities & Store', () => {
  describe('isValidEmail', () => {
    it('validates standard email formats correctly', () => {
      expect(isValidEmail('developer@api-atlas.dev')).toBe(true);
      expect(isValidEmail('ada.lovelace@sub.domain.co.uk')).toBe(true);
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('invalid@')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('evaluatePassword', () => {
    it('evaluates password criteria properly', () => {
      const weak = evaluatePassword('pass');
      expect(weak.hasMinLength).toBe(false);
      expect(weak.score).toBeLessThanOrEqual(1);

      const strong = evaluatePassword('AtlasSec2026!');
      expect(strong.hasMinLength).toBe(true);
      expect(strong.hasUppercase).toBe(true);
      expect(strong.hasNumber).toBe(true);
      expect(strong.hasSpecialChar).toBe(true);
      expect(strong.score).toBe(4);
    });
  });

  describe('Authentication flow', () => {
    const testEmail = 'developer@api-atlas.dev';
    const testPassword = 'AtlasDev2026!';

    beforeEach(async () => {
      // Register a real test user if not already registered
      await register('Atlas Engineer', testEmail, testPassword);
    });

    it('fails on non-existent account', async () => {
      const res = await authenticate('nonexistent@domain.com', 'SomePassword123!');
      expect(res.success).toBe(false);
      expect(res.error).toContain('No account found');
    });

    it('authenticates registered user with correct password', async () => {
      const res = await authenticate(testEmail, testPassword);
      expect(res.success).toBe(true);
      expect(res.session?.user.email).toBe(testEmail);
    });

    it('fails with incorrect password for registered user', async () => {
      const res = await authenticate(testEmail, 'WrongPassword!');
      expect(res.success).toBe(false);
      expect(res.error).toContain('Incorrect password');
    });

    it('registers new user and allows login with same credentials', async () => {
      const uniqueEmail = `test_${Date.now()}@domain.com`;
      const reg = await register('Test Dev', uniqueEmail, 'SuperSecure123!');
      expect(reg.success).toBe(true);
      expect(reg.session?.user.name).toBe('Test Dev');

      // Duplicate registration should fail
      const dup = await register('Test Dev 2', uniqueEmail, 'SuperSecure123!');
      expect(dup.success).toBe(false);
      expect(dup.error).toContain('already exists');

      // Login with newly registered credentials should succeed
      const login = await authenticate(uniqueEmail, 'SuperSecure123!');
      expect(login.success).toBe(true);
      expect(login.session?.user.email).toBe(uniqueEmail);
    });

    it('validates password reset request', async () => {
      const notFound = await requestPasswordReset('unknown@domain.com');
      expect(notFound.success).toBe(false);

      const found = await requestPasswordReset(testEmail);
      expect(found.success).toBe(true);
    });
  });
});
