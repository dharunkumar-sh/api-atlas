import type { APIRoute } from 'astro';
import { authService } from '@/services/authService';
import { getBetterAuthSession } from '@/lib/auth/better-auth';

export const GET: APIRoute = async ({ cookies, request }) => {
  // 1. Check for active Better Auth session (OAuth or Better Auth session cookie)
  try {
    const baSession = await getBetterAuthSession(request);
    if (baSession && baSession.user) {
      const userObj = baSession.user as { role?: string; authMethod?: string };
      return new Response(
        JSON.stringify({
          authenticated: true,
          user: {
            id: baSession.user.id,
            name: baSession.user.name,
            email: baSession.user.email,
            role: userObj.role || 'developer',
            authMethod: userObj.authMethod || 'oauth',
            image: baSession.user.image,
          },
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store, no-cache, must-revalidate',
          },
        }
      );
    }
  } catch (err) {
    console.warn('[Session API] Better Auth session check error:', err);
  }

  // 2. Check for legacy/native atlas_session cookie
  const sessionId = cookies.get('atlas_session')?.value;

  if (!sessionId) {
    return new Response(
      JSON.stringify({
        authenticated: false,
        user: null,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  }

  const result = await authService.validateSession(sessionId);

  if (!result) {
    cookies.delete('atlas_session', { path: '/' });
    return new Response(
      JSON.stringify({
        authenticated: false,
        user: null,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  }

  return new Response(
    JSON.stringify({
      authenticated: true,
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
        authMethod: result.user.authMethod || 'email',
      },
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  );
};
