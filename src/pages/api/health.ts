import type { APIRoute } from 'astro';
import { getHealthStatus } from '@/services/healthService';

export const GET: APIRoute = async () => {
  const health = getHealthStatus();

  return new Response(JSON.stringify(health), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
};
