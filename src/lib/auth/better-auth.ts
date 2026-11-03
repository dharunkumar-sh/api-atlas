import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db, user, session, account, verification } from '@/db';
import {
  getAuthEnv,
  isGitHubOAuthConfigured,
  isGoogleOAuthConfigured,
} from './env';

const env = getAuthEnv();

const baseURL = env.BETTER_AUTH_URL || 'http://localhost:4321';

// Configure social providers dynamically based on available environment credentials
const socialProviders: Record<string, { clientId: string; clientSecret: string; redirectURI?: string }> = {};

if (isGitHubOAuthConfigured() && env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET) {
  socialProviders.github = {
    clientId: env.GITHUB_CLIENT_ID,
    clientSecret: env.GITHUB_CLIENT_SECRET,
    redirectURI: `${baseURL.replace(/\/+$/, '')}/api/auth/callback/github`,
  };
}

if (isGoogleOAuthConfigured() && env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  socialProviders.google = {
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    redirectURI: `${baseURL.replace(/\/+$/, '')}/api/auth/callback/google`,
  };
}

// Fallback development secret if none provided in environment
const authSecret =
  env.BETTER_AUTH_SECRET ||
  process.env.AUTH_SECRET ||
  'api-atlas-default-development-secret-minimum-32-chars-long';

// Build options
const authOptions: Parameters<typeof betterAuth>[0] = {
  secret: authSecret,
  baseURL,
  trustedOrigins: [
    'https://apiatlas-docs.vercel.app',
    'https://*.vercel.app',
    'http://localhost:4321',
    'http://127.0.0.1:4321',
  ],
  user: {
    additionalFields: {
      authMethod: {
        type: 'string',
        required: false,
        defaultValue: 'email',
        input: false,
      },
      passwordHash: {
        type: 'string',
        required: false,
        input: false,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  socialProviders,
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ['google', 'github'],
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (createdUser, context) => {
          try {
            // Determine auth method from request context or accounts
            let authMethod = 'email';
            const path = context?.request?.url || '';
            if (path.includes('github')) {
              authMethod = 'github';
            } else if (path.includes('google')) {
              authMethod = 'google';
            }
            if (createdUser.id) {
              const { userRepository } = await import('@/db');
              await userRepository.updateAuthMethod(createdUser.id, authMethod);
            }
          } catch (hookErr) {
            console.warn('[Better Auth Hook] Error updating authMethod:', hookErr);
          }
        },
      },
    },
    session: {
      create: {
        after: async (createdSession, context) => {
          try {
            if (createdSession.userId) {
              const path = context?.request?.url || '';
              let authMethod = '';
              if (path.includes('github')) {
                authMethod = 'github';
              } else if (path.includes('google')) {
                authMethod = 'google';
              } else if (path.includes('sign-in') || path.includes('sign_in') || path.includes('sign-up')) {
                authMethod = 'email';
              }
              if (authMethod) {
                const { userRepository } = await import('@/db');
                await userRepository.updateAuthMethod(createdSession.userId, authMethod);
              }
            }
          } catch (hookErr) {
            console.warn('[Better Auth Hook] Error updating session authMethod:', hookErr);
          }
        },
      },
    },
  },
  advanced: {
    useSecureCookies: process.env.NODE_ENV === 'production',
  },
};

// If Drizzle DB instance is available with PostgreSQL, attach drizzle adapter
if (db && process.env.DATABASE_URL) {
  authOptions.database = drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user,
      session,
      account,
      verification,
    },
  });
}

/**
 * Main Better Auth Instance for API Atlas
 */
export const auth = betterAuth(authOptions);

/**
 * Helper to fetch session on server-side requests (Astro API routes & middleware)
 */
export async function getBetterAuthSession(request: Request) {
  try {
    return await auth.api.getSession({
      headers: request.headers,
    });
  } catch (err) {
    console.error('[Better Auth] Error validating session:', err);
    return null;
  }
}

export { isGitHubOAuthConfigured, isGoogleOAuthConfigured };
