import type { APIRoute } from 'astro';
import { projectService } from '@/services/projectService';

export const GET: APIRoute = async ({ params }) => {
  const { id } = params;

  if (!id) {
    return new Response(
      JSON.stringify({ success: false, error: 'Project ID required' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  const project = await projectService.getProjectById(id);

  if (!project) {
    return new Response(
      JSON.stringify({ success: false, error: 'Project not found' }),
      {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  return new Response(JSON.stringify({ success: true, data: project }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const DELETE: APIRoute = async ({ params }) => {
  const { id } = params;

  if (!id) {
    return new Response(
      JSON.stringify({ success: false, error: 'Project ID required' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  const deleted = await projectService.deleteProject(id);

  if (!deleted) {
    return new Response(
      JSON.stringify({ success: false, error: 'Project not found' }),
      {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  return new Response(
    JSON.stringify({ success: true, message: 'Project deleted' }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
};
