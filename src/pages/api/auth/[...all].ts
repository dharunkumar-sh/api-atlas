import type { APIRoute } from 'astro';
import { auth } from '@/lib/auth/better-auth';

/**
 * Better Auth Catch-All API Handler for Astro SSR
 * Handles OAuth provider initialization, social redirects, callbacks,
 * account linking, session management, and sign-out.
 */
export const ALL: APIRoute = async (context) => {
  return auth.handler(context.request);
};
