import { env } from './env';

export const APP_CONFIG = {
  name: env.PUBLIC_APP_NAME,
  description: env.PUBLIC_APP_DESCRIPTION,
  version: '0.1.0-alpha',
  isDev: env.NODE_ENV === 'development',
  isProd: env.NODE_ENV === 'production',
  maxSpecSizeBytes: env.MAX_SPEC_SIZE_MB * 1024 * 1024,
  maxSpecSizeMB: env.MAX_SPEC_SIZE_MB,
  enableMockServer: env.ENABLE_MOCK_SERVER,
  navLinks: [
    { label: 'Overview', href: '/overview', icon: 'compass' },
    { label: 'Dashboard', href: '/dashboard', icon: 'layout-dashboard' },
    { label: 'Workspace', href: '/workspace', icon: 'layers' },
    { label: 'Settings', href: '/settings', icon: 'settings' },
  ],
  links: {
    github: 'https://github.com/api-atlas/api-atlas',
    docs: '/docs',
  },
} as const;

export * from './env';
