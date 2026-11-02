import type { APIRoute } from 'astro';
import { validateSpecSchema } from '@/schemas/openapi';
import { parseOpenApi, validateParsedSpec } from '@/utils/openapi';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = validateSpecSchema.safeParse(body);

    if (!validated.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid request payload',
          issues: validated.error.issues,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const { specContent, format } = validated.data;
    const parseResult = parseOpenApi(specContent, format);

    if (parseResult.success && parseResult.spec) {
      const semanticIssues = validateParsedSpec(parseResult.spec);
      parseResult.issues.push(...semanticIssues);
    }

    return new Response(
      JSON.stringify({
        success: parseResult.success,
        format: parseResult.format,
        specSummary: parseResult.spec
          ? {
              title: parseResult.spec.info.title,
              version: parseResult.spec.info.version,
              specType: parseResult.spec.specType,
              endpointsCount: parseResult.spec.endpointsCount,
              serversCount: parseResult.spec.servers.length,
            }
          : null,
        issues: parseResult.issues,
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
