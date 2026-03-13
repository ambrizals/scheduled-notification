import { z } from 'zod';

export const dbSchema = z.object({
  DB_USER: z.string(),
  DB_PWD: z.string(),
  DB_NAME: z.string(),
  DB_PORT: z.coerce.number().default(5432),
  DB_HOST: z.string().default('localhost'),
});
