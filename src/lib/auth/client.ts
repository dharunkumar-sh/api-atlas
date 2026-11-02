import { createAuthClient } from 'better-auth/client';

/**
 * Official Better Auth client instance for API Atlas
 */
export const authClient = createAuthClient({
  baseURL: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:4321',
});

export type OAuthProvider = 'github' | 'google';

export interface OAuthSignInResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Validates and sanitizes destination redirect path to strictly prevent open redirects.
 * Only same-origin relative paths are accepted.
 */
export function validateRedirectPath(
  url?: string | null,
  fallback = '/dashboard'
): string {
  if (!url || typeof url !== 'string') return fallback;
  const trimmed = url.trim();
  if (!trimmed) return fallback;

  // Protect against protocol-relative attacks (//evil.com or /\evil.com)
  if (
    trimmed.startsWith('//') ||
    trimmed.startsWith('/\\') ||
    trimmed.startsWith('\\\\')
  ) {
    return fallback;
  }

  // Safe relative paths starting with a single '/'
  if (trimmed.startsWith('/') && !trimmed.startsWith('/\\')) {
    return trimmed;
  }

  // If absolute URL provided, verify it strictly matches the current origin
  try {
    if (typeof window !== 'undefined') {
      const parsed = new URL(trimmed, window.location.origin);
      if (parsed.origin === window.location.origin) {
        return `${parsed.pathname}${parsed.search}${parsed.hash}`;
      }
    }
  } catch {
    // Malformed URL, fallback safely
  }

  return fallback;
}

/**
 * Retrieves the intended redirect destination from URL search params or provided fallback.
 */
export function getIntendedDestination(fallback = '/dashboard'): string {
  if (typeof window === 'undefined') return fallback;
  const params = new URLSearchParams(window.location.search);
  const redirectParam = params.get('redirect');
  return validateRedirectPath(redirectParam, fallback);
}

/**
 * Initiates OAuth authorization flow using Better Auth official sign-in method
 */
export async function initiateOAuthSignIn(
  provider: OAuthProvider,
  destination?: string
): Promise<OAuthSignInResult> {
  try {
    const origin =
      typeof window !== 'undefined' ? window.location.origin : 'http://localhost:4321';
    const targetPath = validateRedirectPath(destination || getIntendedDestination('/dashboard'));
    const callbackURL = `${origin}${targetPath}`;

    // Use official Better Auth social sign-in API
    const res = await authClient.signIn.social({
      provider,
      callbackURL,
    });

    if (res.error) {
      const providerUpper = provider.toUpperCase();
      const code = res.error.code || '';
      const message =
        code === 'PROVIDER_NOT_FOUND' || res.error.message === 'Provider not found'
          ? `${providerUpper} OAuth is not configured on this server. Please add ${providerUpper}_CLIENT_ID and ${providerUpper}_CLIENT_SECRET to .env.`
          : res.error.message || `Unable to initiate ${provider} sign-in.`;

      return {
        success: false,
        error: message,
      };
    }

    if (res.data?.url) {
      // Initiate supported redirect mechanism to provider authorization page
      window.location.href = res.data.url;
      return {
        success: true,
        url: res.data.url,
      };
    }

    return {
      success: false,
      error: `No authorization URL returned by ${provider}.`,
    };
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : `Network error connecting to authentication backend for ${provider}.`;
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Retrieve current user session using Better Auth session API
 */
export async function getClientSession() {
  try {
    const sessionRes = await authClient.getSession();
    return sessionRes?.data || null;
  } catch {
    return null;
  }
}

/**
 * Official sign-out using Better Auth client API
 */
export async function clientSignOut() {
  try {
    await authClient.signOut();
    return true;
  } catch {
    return false;
  }
}
