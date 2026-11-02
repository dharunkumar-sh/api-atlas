import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z
    .string()
    .default('4321')
    .transform((val) => parseInt(val, 10)),
  HOST: z.string().default('localhost'),
  PUBLIC_APP_NAME: z.string().default('API Atlas'),
  PUBLIC_APP_DESCRIPTION: z
    .string()
    .default('Production Visual API Explorer for OpenAPI and REST APIs'),
  API_ATLAS_DATA_DIR: z.string().default('./.api-atlas'),
  MAX_SPEC_SIZE_MB: z
    .string()
    .default('10')
    .transform((val) => parseInt(val, 10)),
  ENABLE_MOCK_SERVER: z
    .string()
    .default('true')
    .transform((val) => val === 'true' || val === '1'),
});

export type EnvConfig = z.infer<typeof envSchema>;

function loadEnv(): EnvConfig {
  const rawEnv = {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    HOST: process.env.HOST,
    PUBLIC_APP_NAME: process.env.PUBLIC_APP_NAME,
    PUBLIC_APP_DESCRIPTION: process.env.PUBLIC_APP_DESCRIPTION,
    API_ATLAS_DATA_DIR: process.env.API_ATLAS_DATA_DIR,
    MAX_SPEC_SIZE_MB: process.env.MAX_SPEC_SIZE_MB,
    ENABLE_MOCK_SERVER: process.env.ENABLE_MOCK_SERVER,
  };

  const parsed = envSchema.safeParse(rawEnv);

  if (!parsed.success) {
    console.error(
      '❌ Invalid environment variables configuration:',
      parsed.error.issues
    );
    throw new Error('Invalid environment configuration');
  }

  return parsed.data;
}

export const env = loadEnv();
