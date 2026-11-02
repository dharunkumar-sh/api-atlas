export * from './openapi';
export * from './project';
export * from './ui';

export interface ApiResponsePayload<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}
