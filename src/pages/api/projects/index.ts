import type { APIRoute } from 'astro';
import { projectService } from '@/services/projectService';
import { createProjectSchema } from '@/schemas/project';

export const GET: APIRoute = async ({ url }) => {
  const searchQuery = url.searchParams.get('q') || undefined;
  const tag = url.searchParams.get('tag') || undefined;
  const specType = url.searchParams.get('type') || undefined;

  const projects = await projectService.listProjects({ searchQuery, tag, specType });

  return new Response(
    JSON.stringify({
      success: true,
      data: projects,
      total: projects.length,
      timestamp: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
};

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json();
    const validationResult = createProjectSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Validation failed',
          issues: validationResult.error.issues,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const { name, description, specContent, specFormat } =
      validationResult.data;
    const project = await projectService.createProject(
      {
        name,
        description,
        specContent,
        specFormat,
      },
      locals.user?.id
    );

    return new Response(
      JSON.stringify({
        success: true,
        data: project,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 201,
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
