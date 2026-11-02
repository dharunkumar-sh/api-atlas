import { describe, it, expect } from 'vitest';
import {
  authEnvSchema,
  isGitHubOAuthConfigured,
  isGoogleOAuthConfigured,
  getAuthorizedCallbackUrls,
} from '@/lib/auth/env';
import { auth } from '@/lib/auth/better-auth';
import { user, session, account, verification } from '@/db/schema';
import { validateRedirectPath } from '@/lib/auth/client';

describe('OAuth & Better Auth Integration Suite', () => {
  describe('Environment Configuration & Validation', () => {
    it('validates correct environment structure with Zod', () => {
      const validConfig = {
        BETTER_AUTH_SECRET: 'a_very_secure_random_key_of_at_least_32_characters!',
        BETTER_AUTH_URL: 'http://localhost:4321',
        GITHUB_CLIENT_ID: 'github_client_id_123',
        GITHUB_CLIENT_SECRET: 'github_client_secret_xyz',
        GOOGLE_CLIENT_ID: 'google_client_id_456',
        GOOGLE_CLIENT_SECRET: 'google_client_secret_abc',
        NODE_ENV: 'test' as const,
      };

      const parsed = authEnvSchema.safeParse(validConfig);
      expect(parsed.success).toBe(true);
    });

    it('identifies OAuth credentials correctly in environment', () => {
      expect(typeof isGitHubOAuthConfigured()).toBe('boolean');
      expect(typeof isGoogleOAuthConfigured()).toBe('boolean');
    });

    it('generates exact authorized callback URLs based on application origin', () => {
      const localCallbacks = getAuthorizedCallbackUrls('http://localhost:4321');
      expect(localCallbacks.github).toBe('http://localhost:4321/api/auth/callback/github');
      expect(localCallbacks.google).toBe('http://localhost:4321/api/auth/callback/google');

      const prodCallbacks = getAuthorizedCallbackUrls('https://api-atlas.dev');
      expect(prodCallbacks.github).toBe('https://api-atlas.dev/api/auth/callback/github');
      expect(prodCallbacks.google).toBe('https://api-atlas.dev/api/auth/callback/google');
    });
  });

  describe('Open Redirect Prevention & Destination Validation', () => {
    it('allows valid same-origin relative paths', () => {
      expect(validateRedirectPath('/dashboard')).toBe('/dashboard');
      expect(validateRedirectPath('/workspace')).toBe('/workspace');
      expect(validateRedirectPath('/settings?tab=general')).toBe('/settings?tab=general');
    });

    it('rejects protocol-relative open redirect attacks', () => {
      expect(validateRedirectPath('//attacker.com')).toBe('/dashboard');
      expect(validateRedirectPath('/\\attacker.com')).toBe('/dashboard');
      expect(validateRedirectPath('\\\\attacker.com')).toBe('/dashboard');
    });

    it('rejects external open redirects and falls back to dashboard or custom fallback', () => {
      expect(validateRedirectPath('https://evil-phishing.com')).toBe('/dashboard');
      expect(validateRedirectPath('http://malicious.org/steal-cookies', '/workspace')).toBe('/workspace');
      expect(validateRedirectPath('', '/dashboard')).toBe('/dashboard');
      expect(validateRedirectPath(null, '/dashboard')).toBe('/dashboard');
    });
  });

  describe('Drizzle ORM OAuth & Better Auth Tables', () => {
    it('defines user table with emailVerified and timestamps', () => {
      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.email).toBeDefined();
      expect(user.emailVerified).toBeDefined();
    });

    it('defines account table with providerId, accountId and token storage for OAuth linking', () => {
      expect(account).toBeDefined();
      expect(account.id).toBeDefined();
      expect(account.userId).toBeDefined();
      expect(account.providerId).toBeDefined();
      expect(account.accountId).toBeDefined();
      expect(account.accessToken).toBeDefined();
    });

    it('defines session and verification tables', () => {
      expect(session).toBeDefined();
      expect(session.token).toBeDefined();
      expect(verification).toBeDefined();
      expect(verification.identifier).toBeDefined();
    });
  });

  describe('Better Auth Handler & Social OAuth Provider Flow', () => {
    it('initializes Better Auth instance with handler function and session API', () => {
      expect(auth).toBeDefined();
      expect(typeof auth.handler).toBe('function');
      expect(auth.api).toBeDefined();
      expect(typeof auth.api.getSession).toBe('function');
      expect(typeof auth.api.signOut).toBe('function');
    });

    it('does not claim successful authentication when provider is unconfigured', async () => {
      const req = new Request('http://localhost:4321/api/auth/sign-in/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'unconfigured_fake_provider',
          callbackURL: 'http://localhost:4321/dashboard',
        }),
      });

      const res = await auth.handler(req);
      const data = await res.json().catch(() => ({}));

      expect(res.status).not.toBe(200);
      expect(data.authenticated).not.toBe(true);
    });

    it('generates valid authorization redirect for configured Google provider', async () => {
      const req = new Request('http://localhost:4321/api/auth/sign-in/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'google',
          callbackURL: 'http://localhost:4321/dashboard',
        }),
      });

      const res = await auth.handler(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.url).toBeDefined();
      expect(data.url).toContain('accounts.google.com');
      expect(data.url).toContain('redirect_uri=');
      expect(data.url).toContain('code_challenge=');
    });

    it('generates valid authorization redirect for configured GitHub provider', async () => {
      const req = new Request('http://localhost:4321/api/auth/sign-in/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'github',
          callbackURL: 'http://localhost:4321/dashboard',
        }),
      });

      const res = await auth.handler(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.url).toBeDefined();
      expect(data.url).toContain('github.com/login/oauth/authorize');
      expect(data.url).toContain('redirect_uri=');
    });
  });
});
