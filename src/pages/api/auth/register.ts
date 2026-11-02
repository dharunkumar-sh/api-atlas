import type { APIRoute } from 'astro';
import { authService } from '@/services/authService';

export const POST: APIRoute = async ({ request, clientAddress, cookies }) => {
  try {
    const body = await request.json();
    const userAgent = request.headers.get('user-agent') || undefined;
    const ip = clientAddress || request.headers.get('x-forwarded-for') || undefined;

    const result = await authService.register(body, { ip, userAgent });

    if (!result.success || !result.session) {
      return new Response(
        JSON.stringify({
          success: false,
          error: result.error || 'Registration failed',
        }),
        {
          status: result.statusCode || 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Set secure HTTP-only session cookie
    cookies.set('atlas_session', result.session.id, {
      path: '/',
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return new Response(
      JSON.stringify({
        success: true,
        user: result.user,
        message: 'Account registered successfully',
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    console.error('[API] Register error:', err);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'An internal server error occurred. Please try again.',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
