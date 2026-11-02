import { z } from 'zod';

export const validateSpecSchema = z.object({
  specContent: z.string().min(5, 'Specification content is required'),
  format: z.enum(['json', 'yaml', 'auto']).default('auto'),
});

export type ValidateSpecSchemaInput = z.infer<typeof validateSpecSchema>;
