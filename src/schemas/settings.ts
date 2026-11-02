import { z } from 'zod';

export const userSettingsSchema = z.object({
  theme: z.enum(['dark', 'light', 'system']).default('dark'),
  compactView: z.boolean().default(false),
  defaultHttpMethod: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']).default('GET'),
  showDeprecatedEndpoints: z.boolean().default(true),
  autoValidateOnPaste: z.boolean().default(true),
  telemetryEnabled: z.boolean().default(false),
  apiTimeoutSeconds: z.number().min(1).max(120).default(30),
  mockLatencyMs: z.number().min(0).max(5000).default(150).optional(),
});

export type UserSettings = z.infer<typeof userSettingsSchema>;
