import { z } from 'zod';

export const dashboardMetricSchema = z.object({
  totalSpecs: z.number().int().nonnegative(),
  supportedFormats: z.array(z.string()).default(['YAML', 'JSON']),
  openApiTargets: z.array(z.string()).default(['v3.0', 'v3.1']),
  validationStatus: z.enum(['Active', 'Degraded', 'Idle']).default('Active'),
  totalEndpoints: z.number().int().nonnegative().default(0),
  totalServers: z.number().int().nonnegative().default(0),
});

export const dashboardOverviewSchema = z.object({
  metrics: dashboardMetricSchema,
  recentProjectsCount: z.number().int().nonnegative(),
  timestamp: z.string(),
});

export type DashboardMetric = z.infer<typeof dashboardMetricSchema>;
export type DashboardOverview = z.infer<typeof dashboardOverviewSchema>;

