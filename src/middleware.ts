import { defineMiddleware } from 'astro:middleware';
import { authService } from '@/services/authService';
import { getBetterAuthSession } from '@/lib/auth/better-auth';

export const onRequest = defineMiddleware(async (context, next) => {
  let user: { id: string; name: string; email: string; role: string } | null = null;
  let session: { id: string; expiresAt: Date } | null = null;

  // 1. Check Better Auth session (OAuth callbacks and session cookies)
  try {
    const baSession = await getBetterAuthSession(context.request);
    if (baSession && baSession.user) {
      user = {
        id: baSession.user.id,
        name: baSession.user.name,
        email: baSession.user.email,
        role: (baSession.user as { role?: string }).role || 'developer',
      };
      session = {
        id: baSession.session.id,
        expiresAt:
          baSession.session.expiresAt instanceof Date
            ? baSession.session.expiresAt
            : new Date(baSession.session.expiresAt),
      };
    }
  } catch (err) {
    console.warn('[Middleware] Better Auth session verification error:', err);
  }

  // 2. If no Better Auth session found, check native atlas_session cookie
  if (!user) {
    const sessionId = context.cookies.get('atlas_session')?.value;
    if (sessionId) {
      const authData = await authService.validateSession(sessionId);
      if (authData) {
        user = authData.user;
        session = {
          id: authData.session.id,
          expiresAt:
            authData.session.expiresAt instanceof Date
              ? authData.session.expiresAt
              : new Date(authData.session.expiresAt),
        };
      } else {
        context.cookies.delete('atlas_session', { path: '/' });
      }
    }
  }

  context.locals.user = user;
  context.locals.session = session;

  const pathname = context.url.pathname;

  // 1. Protected HTML Routes (Server-side authorization)
  const protectedPages = ['/dashboard', '/settings'];
  const isProtectedPage = protectedPages.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isProtectedPage && !context.locals.user) {
    const redirectTarget = `/?auth=signin&redirect=${encodeURIComponent(pathname)}`;
    return context.redirect(redirectTarget, 302);
  }

  // 2. Protected API Endpoints (Mutations require server-side session)
  const isProtectedApiMutation =
    pathname.startsWith('/api/projects') && context.request.method !== 'GET';

  if (isProtectedApiMutation && !context.locals.user) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Unauthorized',
        message: 'Server-side session validation failed. Authentication required.',
      }),
      {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'WWW-Authenticate': 'Cookie name="atlas_session", name="better-auth.session_token"',
        },
      }
    );
  }

  return next();
});
