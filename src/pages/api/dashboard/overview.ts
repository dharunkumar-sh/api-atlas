import type { APIRoute } from 'astro';
import { projectService } from '@/services/projectService';

export const GET: APIRoute = async () => {
  try {
    const overview = await projectService.getDashboardOverview();

    return new Response(
      JSON.stringify({
        success: true,
        data: overview,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        success: false,
        error: err instanceof Error ? err.message : 'Internal Server Error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

