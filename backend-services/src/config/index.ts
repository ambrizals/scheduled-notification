import z from 'zod';
import { dbSchema } from './db.config';
import { firebaseSchema } from './firebase.config';

export const envSchema = z
  .object({
    APP_NAME: z.string().default('POC'),
    APP_PORT: z.coerce.number().default(3000),
    NODE_ENV: z.enum(['local', 'test', 'production']),
    DB_HOST: z.string(),
    DB_PORT: z.coerce.number(),
    DB_USER: z.string(),
    DB_PWD: z.string(),
    DB_NAME: z.string(),
    REDIS_URL: z.string().default('redis://localhost:6379'),
  })
  .extend(dbSchema.shape)
  .extend(firebaseSchema.shape);

export const ENV = envSchema.parse(import.meta.env);
