export type HttpMethod =
  'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD' | 'TRACE';

export interface ApiServer {
  url: string;
  description?: string;
  variables?: Record<
    string,
    { default: string; description?: string; enum?: string[] }
  >;
}

export interface ApiParameter {
  name: string;
  in: 'query' | 'header' | 'path' | 'cookie';
  description?: string;
  required?: boolean;
  deprecated?: boolean;
  schemaType?: string;
  example?: unknown;
}

export interface ApiMediaType {
  schema?: Record<string, unknown>;
  example?: unknown;
  examples?: Record<string, unknown>;
}

export interface ApiRequestBody {
  description?: string;
  required?: boolean;
  content: Record<string, ApiMediaType>;
}

export interface ApiResponseDefinition {
  statusCode: string;
  description: string;
  headers?: Record<
    string,
    { description?: string; schema?: Record<string, unknown> }
  >;
  content?: Record<string, ApiMediaType>;
}

export interface ApiEndpoint {
  id: string;
  path: string;
  method: HttpMethod;
  summary?: string;
  description?: string;
  operationId?: string;
  tags: string[];
  deprecated?: boolean;
  parameters: ApiParameter[];
  requestBody?: ApiRequestBody;
  responses: Record<string, ApiResponseDefinition>;
}

export interface OpenApiInfo {
  title: string;
  version: string;
  description?: string;
  termsOfService?: string;
  contact?: {
    name?: string;
    url?: string;
    email?: string;
  };
  license?: {
    name: string;
    url?: string;
  };
}

export interface OpenApiTag {
  name: string;
  description?: string;
}

export interface ParsedOpenApiSpec {
  info: OpenApiInfo;
  version: string; // e.g. 3.0.3, 3.1.0, 2.0
  specType: 'openapi_3_0' | 'openapi_3_1' | 'swagger_2_0' | 'unknown';
  servers: ApiServer[];
  tags: OpenApiTag[];
  endpoints: ApiEndpoint[];
  endpointsCount: number;
}

export interface OpenApiValidationIssue {
  severity: 'error' | 'warning' | 'info';
  message: string;
  path?: string;
}

export interface OpenApiParseResult {
  success: boolean;
  format: 'json' | 'yaml' | 'unknown';
  spec?: ParsedOpenApiSpec;
  issues: OpenApiValidationIssue[];
}
