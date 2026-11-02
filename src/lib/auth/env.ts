import { z } from 'zod';

// Ensure .env is loaded in Node environments if not already loaded
if (typeof process !== 'undefined' && typeof process.loadEnvFile === 'function') {
  try {
    process.loadEnvFile('.env');
  } catch {
    // Ignore if .env is missing or already loaded
  }
}

function getEnvVar(key: string): string | undefined {
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  try {
    const metaEnv = (import.meta as { env?: Record<string, string> }).env;
    if (metaEnv && metaEnv[key]) {
      return metaEnv[key];
    }
  } catch {
    // import.meta.env not available in this context
  }
  return undefined;
}

/**
 * Server-Side Environment Variable Schema for Better Auth & OAuth Providers
 */
export const authEnvSchema = z.object({
  BETTER_AUTH_SECRET: z
    .string()
    .min(32, 'BETTER_AUTH_SECRET must be at least 32 characters long')
    .optional(),
  BETTER_AUTH_URL: z
    .string()
    .url('BETTER_AUTH_URL must be a valid URL')
    .default('http://localhost:4321'),
  DATABASE_URL: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export type AuthEnv = z.infer<typeof authEnvSchema>;

/**
 * Parses and validates environment variables.
 * Falls back safely in development if secrets have not yet been provisioned.
 */
export function getAuthEnv(): AuthEnv {
  const raw = {
    BETTER_AUTH_SECRET: getEnvVar('BETTER_AUTH_SECRET'),
    BETTER_AUTH_URL: getEnvVar('BETTER_AUTH_URL') || 'http://localhost:4321',
    DATABASE_URL: getEnvVar('DATABASE_URL'),
    GITHUB_CLIENT_ID: getEnvVar('GITHUB_CLIENT_ID'),
    GITHUB_CLIENT_SECRET: getEnvVar('GITHUB_CLIENT_SECRET'),
    GOOGLE_CLIENT_ID: getEnvVar('GOOGLE_CLIENT_ID'),
    GOOGLE_CLIENT_SECRET: getEnvVar('GOOGLE_CLIENT_SECRET'),
    NODE_ENV: getEnvVar('NODE_ENV') || 'development',
  };

  const parsed = authEnvSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      BETTER_AUTH_SECRET: raw.BETTER_AUTH_SECRET,
      BETTER_AUTH_URL: raw.BETTER_AUTH_URL,
      DATABASE_URL: raw.DATABASE_URL,
      GITHUB_CLIENT_ID: raw.GITHUB_CLIENT_ID,
      GITHUB_CLIENT_SECRET: raw.GITHUB_CLIENT_SECRET,
      GOOGLE_CLIENT_ID: raw.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: raw.GOOGLE_CLIENT_SECRET,
      NODE_ENV: (raw.NODE_ENV as 'development' | 'production' | 'test') || 'development',
    };
  }

  return parsed.data;
}

/**
 * Check if GitHub OAuth is fully configured with both client ID and client secret
 */
export function isGitHubOAuthConfigured(): boolean {
  const id = getEnvVar('GITHUB_CLIENT_ID')?.trim();
  const secret = getEnvVar('GITHUB_CLIENT_SECRET')?.trim();
  return Boolean(
    id &&
      secret &&
      id !== 'your_github_client_id_placeholder' &&
      secret !== 'your_github_client_secret_placeholder'
  );
}

/**
 * Check if Google OAuth is fully configured with both client ID and client secret
 */
export function isGoogleOAuthConfigured(): boolean {
  const id = getEnvVar('GOOGLE_CLIENT_ID')?.trim();
  const secret = getEnvVar('GOOGLE_CLIENT_SECRET')?.trim();
  return Boolean(
    id &&
      secret &&
      id !== 'your_google_client_id_placeholder' &&
      secret !== 'your_google_client_secret_placeholder'
  );
}

/**
 * Get authorized callback URLs for providers based on current origin
 */
export function getAuthorizedCallbackUrls(baseUrl = 'http://localhost:4321') {
  const trimmed = baseUrl.replace(/\/+$/, '');
  return {
    github: `${trimmed}/api/auth/callback/github`,
    google: `${trimmed}/api/auth/callback/google`,
  };
}
