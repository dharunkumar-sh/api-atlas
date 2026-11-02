import type {
  ParsedOpenApiSpec,
  OpenApiValidationIssue,
} from '@/types/openapi';

export function validateParsedSpec(
  spec: ParsedOpenApiSpec
): OpenApiValidationIssue[] {
  const issues: OpenApiValidationIssue[] = [];

  if (!spec.endpoints || spec.endpoints.length === 0) {
    issues.push({
      severity: 'warning',
      message: 'No paths/endpoints found in this specification',
      path: 'paths',
    });
  }

  const seenOperationIds = new Set<string>();

  for (const ep of spec.endpoints) {
    // Check operation ID uniqueness
    if (ep.operationId) {
      if (seenOperationIds.has(ep.operationId)) {
        issues.push({
          severity: 'warning',
          message: `Duplicate operationId found: "${ep.operationId}"`,
          path: `paths.${ep.path}.${ep.method.toLowerCase()}.operationId`,
        });
      } else {
        seenOperationIds.add(ep.operationId);
      }
    }

    // Check path parameters are declared in parameters list
    const pathParamsInUrl = Array.from(ep.path.matchAll(/\{([^}]+)\}/g)).map(
      (m) => m[1]
    );
    for (const pName of pathParamsInUrl) {
      const declared = ep.parameters.find(
        (p) => p.name === pName && p.in === 'path'
      );
      if (!declared) {
        issues.push({
          severity: 'error',
          message: `Path parameter "{${pName}}" in URL is missing parameter definition`,
          path: `paths.${ep.path}.${ep.method.toLowerCase()}.parameters`,
        });
      }
    }

    // Check responses
    if (Object.keys(ep.responses).length === 0) {
      issues.push({
        severity: 'warning',
        message: `Endpoint ${ep.method} ${ep.path} has no response definitions`,
        path: `paths.${ep.path}.${ep.method.toLowerCase()}.responses`,
      });
    }
  }

  return issues;
}
