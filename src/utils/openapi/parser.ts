import yaml from 'yaml';
import type {
  HttpMethod,
  ApiEndpoint,
  ApiParameter,
  ApiRequestBody,
  ApiResponseDefinition,
  ApiServer,
  OpenApiTag,
  ParsedOpenApiSpec,
  OpenApiParseResult,
  OpenApiValidationIssue,
} from '@/types/openapi';

const HTTP_METHODS: HttpMethod[] = [
  'GET',
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
  'OPTIONS',
  'HEAD',
  'TRACE',
];

export function detectFormat(content: string): 'json' | 'yaml' {
  const trimmed = content.trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    return 'json';
  }
  return 'yaml';
}

export function parseRawSpec(
  content: string,
  preferredFormat: 'json' | 'yaml' | 'auto' = 'auto'
): { parsed: Record<string, unknown>; format: 'json' | 'yaml' } {
  const format =
    preferredFormat === 'auto' ? detectFormat(content) : preferredFormat;

  if (format === 'json') {
    try {
      const parsed = JSON.parse(content);
      return { parsed, format: 'json' };
    } catch {
      // Fallback to yaml parser if JSON fails
      const parsed = yaml.parse(content);
      return { parsed, format: 'yaml' };
    }
  } else {
    try {
      const parsed = yaml.parse(content);
      return { parsed, format: 'yaml' };
    } catch {
      const parsed = JSON.parse(content);
      return { parsed, format: 'json' };
    }
  }
}

export function parseOpenApi(
  content: string,
  preferredFormat: 'json' | 'yaml' | 'auto' = 'auto'
): OpenApiParseResult {
  const issues: OpenApiValidationIssue[] = [];

  if (!content || !content.trim()) {
    return {
      success: false,
      format: 'unknown',
      issues: [
        {
          severity: 'error',
          message: 'Specification content is empty',
          path: '',
        },
      ],
    };
  }

  let rawObj: Record<string, unknown>;
  let detectedFormat: 'json' | 'yaml';

  try {
    const res = parseRawSpec(content, preferredFormat);
    rawObj = res.parsed;
    detectedFormat = res.format;
  } catch (err) {
    return {
      success: false,
      format: 'unknown',
      issues: [
        {
          severity: 'error',
          message: `Syntax error: ${err instanceof Error ? err.message : String(err)}`,
          path: '',
        },
      ],
    };
  }

  if (typeof rawObj !== 'object' || rawObj === null) {
    return {
      success: false,
      format: detectedFormat,
      issues: [
        {
          severity: 'error',
          message: 'Root specification must be an object/mapping',
        },
      ],
    };
  }

  // Detect spec type and version
  let specType: 'openapi_3_0' | 'openapi_3_1' | 'swagger_2_0' | 'unknown' =
    'unknown';
  let version = 'unknown';

  if (typeof rawObj.openapi === 'string') {
    version = rawObj.openapi;
    if (rawObj.openapi.startsWith('3.1')) {
      specType = 'openapi_3_1';
    } else if (rawObj.openapi.startsWith('3.0')) {
      specType = 'openapi_3_0';
    }
  } else if (typeof rawObj.swagger === 'string') {
    version = rawObj.swagger;
    specType = 'swagger_2_0';
    issues.push({
      severity: 'warning',
      message: `Swagger 2.0 detected (${version}). Consider upgrading to OpenAPI 3.0+`,
      path: 'swagger',
    });
  } else {
    issues.push({
      severity: 'warning',
      message:
        'Missing "openapi" or "swagger" version declaration. Assuming OpenAPI 3.0',
      path: 'openapi',
    });
    version = '3.0.0';
    specType = 'openapi_3_0';
  }

  // Info block
  const rawInfo = (rawObj.info as Record<string, unknown>) || {};
  const title =
    typeof rawInfo.title === 'string' ? rawInfo.title : 'Untitled API Spec';
  const infoVersion =
    typeof rawInfo.version === 'string' ? rawInfo.version : '1.0.0';
  const description =
    typeof rawInfo.description === 'string' ? rawInfo.description : undefined;

  if (!rawObj.info) {
    issues.push({
      severity: 'warning',
      message: 'Missing "info" metadata section',
      path: 'info',
    });
  }

  // Servers
  const servers: ApiServer[] = [];
  if (Array.isArray(rawObj.servers)) {
    for (const s of rawObj.servers) {
      if (s && typeof s.url === 'string') {
        servers.push({
          url: s.url,
          description:
            typeof s.description === 'string' ? s.description : undefined,
        });
      }
    }
  } else if (typeof rawObj.host === 'string') {
    // Swagger 2.0 fallback
    const basePath = typeof rawObj.basePath === 'string' ? rawObj.basePath : '';
    servers.push({
      url: `https://${rawObj.host}${basePath}`,
      description: 'Host server from Swagger 2.0',
    });
  }

  // Tags
  const tags: OpenApiTag[] = [];
  if (Array.isArray(rawObj.tags)) {
    for (const t of rawObj.tags) {
      if (t && typeof t.name === 'string') {
        tags.push({
          name: t.name,
          description:
            typeof t.description === 'string' ? t.description : undefined,
        });
      }
    }
  }

  // Endpoints from paths
  const endpoints: ApiEndpoint[] = [];
  const rawPaths =
    (rawObj.paths as Record<string, Record<string, unknown>>) || {};

  for (const [pathKey, pathItem] of Object.entries(rawPaths)) {
    if (!pathItem || typeof pathItem !== 'object') continue;

    for (const methodKey of Object.keys(pathItem)) {
      const upperMethod = methodKey.toUpperCase() as HttpMethod;
      if (!HTTP_METHODS.includes(upperMethod)) continue;

      const op = pathItem[methodKey] as Record<string, unknown>;
      if (!op || typeof op !== 'object') continue;

      const endpointId = `${upperMethod}-${pathKey.replace(/[^a-zA-Z0-9]/g, '_')}`;
      const summary = typeof op.summary === 'string' ? op.summary : undefined;
      const opDesc =
        typeof op.description === 'string' ? op.description : undefined;
      const operationId =
        typeof op.operationId === 'string' ? op.operationId : undefined;
      const opTags = Array.isArray(op.tags)
        ? (op.tags.filter((t) => typeof t === 'string') as string[])
        : [];
      const deprecated = Boolean(op.deprecated);

      // Parameters
      const parameters: ApiParameter[] = [];
      const rawParams = Array.isArray(op.parameters) ? op.parameters : [];
      for (const p of rawParams) {
        if (p && typeof p.name === 'string') {
          parameters.push({
            name: p.name,
            in: ['query', 'header', 'path', 'cookie'].includes(p.in)
              ? p.in
              : 'query',
            description:
              typeof p.description === 'string' ? p.description : undefined,
            required: Boolean(p.required),
            deprecated: Boolean(p.deprecated),
            schemaType:
              p.schema && typeof p.schema.type === 'string'
                ? p.schema.type
                : undefined,
            example: p.example,
          });
        }
      }

      // RequestBody
      let requestBody: ApiRequestBody | undefined;
      if (op.requestBody && typeof op.requestBody === 'object') {
        const rb = op.requestBody as Record<string, unknown>;
        const rawContent = (rb.content as Record<string, unknown>) || {};
        const content: Record<
          string,
          { schema?: Record<string, unknown>; example?: unknown }
        > = {};

        for (const [ct, val] of Object.entries(rawContent)) {
          if (val && typeof val === 'object') {
            const v = val as Record<string, unknown>;
            content[ct] = {
              schema: v.schema as Record<string, unknown> | undefined,
              example: v.example,
            };
          }
        }

        requestBody = {
          description:
            typeof rb.description === 'string' ? rb.description : undefined,
          required: Boolean(rb.required),
          content,
        };
      }

      // Responses
      const responses: Record<string, ApiResponseDefinition> = {};
      const rawResponses = (op.responses as Record<string, unknown>) || {};
      for (const [status, respObj] of Object.entries(rawResponses)) {
        if (respObj && typeof respObj === 'object') {
          const ro = respObj as Record<string, unknown>;
          responses[status] = {
            statusCode: status,
            description:
              typeof ro.description === 'string' ? ro.description : 'Response',
          };
        }
      }

      endpoints.push({
        id: endpointId,
        path: pathKey,
        method: upperMethod,
        summary,
        description: opDesc,
        operationId,
        tags: opTags,
        deprecated,
        parameters,
        requestBody,
        responses,
      });
    }
  }

  const parsedSpec: ParsedOpenApiSpec = {
    info: {
      title,
      version: infoVersion,
      description,
    },
    version,
    specType,
    servers,
    tags,
    endpoints,
    endpointsCount: endpoints.length,
  };

  const hasFatalErrors = issues.some((i) => i.severity === 'error');

  return {
    success: !hasFatalErrors,
    format: detectedFormat,
    spec: parsedSpec,
    issues,
  };
}
