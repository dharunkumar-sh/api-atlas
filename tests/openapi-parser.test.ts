import { describe, it, expect } from 'vitest';
import { detectFormat, parseOpenApi } from '../src/utils/openapi/parser';
import { validateParsedSpec } from '../src/utils/openapi/validator';

const sampleYamlSpec = `
openapi: 3.0.3
info:
  title: Test Products API
  version: 2.1.0
  description: Product catalog service
servers:
  - url: https://api.example.com/v1
paths:
  /products:
    get:
      summary: List products
      operationId: getProducts
      tags:
        - catalog
      responses:
        '200':
          description: OK
  /products/{id}:
    get:
      summary: Get single product
      operationId: getProductById
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: OK
`;

const sampleJsonSpec = JSON.stringify({
  openapi: '3.1.0',
  info: {
    title: 'Users Service',
    version: '1.0.0',
  },
  servers: [{ url: 'https://users.api.local' }],
  paths: {
    '/users': {
      post: {
        summary: 'Create user',
        operationId: 'createUser',
        responses: {
          '201': {
            description: 'User created',
          },
        },
      },
    },
  },
});

describe('OpenAPI Parser Utilities', () => {
  it('correctly detects JSON vs YAML formats', () => {
    expect(detectFormat('{"key": "value"}')).toBe('json');
    expect(detectFormat('  [{"id": 1}]')).toBe('json');
    expect(detectFormat('openapi: 3.0.0\ninfo:')).toBe('yaml');
  });

  it('parses valid YAML specification successfully', () => {
    const result = parseOpenApi(sampleYamlSpec);

    expect(result.success).toBe(true);
    expect(result.format).toBe('yaml');
    expect(result.spec?.info.title).toBe('Test Products API');
    expect(result.spec?.info.version).toBe('2.1.0');
    expect(result.spec?.specType).toBe('openapi_3_0');
    expect(result.spec?.endpointsCount).toBe(2);
    expect(result.spec?.endpoints[0].method).toBe('GET');
    expect(result.spec?.endpoints[0].path).toBe('/products');
  });

  it('parses valid JSON specification successfully', () => {
    const result = parseOpenApi(sampleJsonSpec);

    expect(result.success).toBe(true);
    expect(result.format).toBe('json');
    expect(result.spec?.info.title).toBe('Users Service');
    expect(result.spec?.specType).toBe('openapi_3_1');
    expect(result.spec?.endpointsCount).toBe(1);
    expect(result.spec?.endpoints[0].method).toBe('POST');
  });

  it('gracefully handles invalid syntax or empty input', () => {
    const emptyResult = parseOpenApi('');
    expect(emptyResult.success).toBe(false);
    expect(emptyResult.issues.length).toBeGreaterThan(0);

    const malformedResult = parseOpenApi('{ invalid json content:');
    expect(malformedResult.success).toBe(false);
  });

  it('validates semantic constraints such as declared path parameters', () => {
    const parsed = parseOpenApi(sampleYamlSpec);
    expect(parsed.spec).toBeDefined();
    if (parsed.spec) {
      const issues = validateParsedSpec(parsed.spec);
      // Both path parameters are properly declared in sampleYamlSpec
      expect(issues.filter((i) => i.severity === 'error')).toHaveLength(0);
    }
  });
});
