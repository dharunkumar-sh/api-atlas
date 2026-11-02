import type { APIRoute } from 'astro';
import { authService } from '@/services/authService';
import { auth } from '@/lib/auth/better-auth';

export const POST: APIRoute = async ({ cookies, request }) => {
  try {
    // 1. Better Auth sign-out
    try {
      await auth.api.signOut({
        headers: request.headers,
      });
    } catch {
      // Ignore if no active Better Auth session
    }

    // 2. Atlas native session sign-out
    const sessionId = cookies.get('atlas_session')?.value;
    if (sessionId) {
      await authService.signOut(sessionId);
    }

    // 3. Clear all session cookies
    cookies.delete('atlas_session', { path: '/' });
    cookies.delete('better-auth.session_token', { path: '/' });
    cookies.delete('better-auth.csrf_token', { path: '/' });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Signed out successfully',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    console.error('[API] Sign-out error:', err);
    cookies.delete('atlas_session', { path: '/' });
    cookies.delete('better-auth.session_token', { path: '/' });
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Signed out',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
