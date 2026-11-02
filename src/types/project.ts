import type { ParsedOpenApiSpec } from './openapi';

export interface ApiProject {
  id: string;
  name: string;
  description?: string;
  version: string;
  specType: 'openapi_3_0' | 'openapi_3_1' | 'swagger_2_0' | 'unknown';
  specFormat: 'json' | 'yaml';
  endpointsCount: number;
  serversCount: number;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  rawSpec?: string;
  parsedSpec?: ParsedOpenApiSpec;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  specContent: string;
  specFormat?: 'json' | 'yaml' | 'auto';
}

export interface ProjectFilterOptions {
  searchQuery?: string;
  tag?: string;
  specType?: string;
  sortBy?: 'name' | 'updatedAt' | 'endpointsCount';
  sortOrder?: 'asc' | 'desc';
}
