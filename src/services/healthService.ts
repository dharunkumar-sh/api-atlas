import { APP_CONFIG } from '@/config';

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'down';
  version: string;
  uptimeSeconds: number;
  environment: string;
  memoryUsage: {
    rssMb: number;
    heapUsedMb: number;
    heapTotalMb: number;
  };
  features: {
    mockServerEnabled: boolean;
    specParser: boolean;
  };
  timestamp: string;
}

export function getHealthStatus(): HealthStatus {
  const mem = process.memoryUsage();
  return {
    status: 'healthy',
    version: APP_CONFIG.version,
    uptimeSeconds: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
    memoryUsage: {
      rssMb: Math.round(mem.rss / 1024 / 1024),
      heapUsedMb: Math.round(mem.heapUsed / 1024 / 1024),
      heapTotalMb: Math.round(mem.heapTotal / 1024 / 1024),
    },
    features: {
      mockServerEnabled: APP_CONFIG.enableMockServer,
      specParser: true,
    },
    timestamp: new Date().toISOString(),
  };
}
