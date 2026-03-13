import { drizzle } from 'drizzle-orm/bun-sql';
import { ENV } from '../config';
import { relations } from './relations';
import * as schema from './schema';

const isLocal = ['local', 'test'].includes(ENV.NODE_ENV);

export const db = drizzle({
  connection: {
    host: ENV.DB_HOST,
    port: ENV.DB_PORT,
    user: ENV.DB_USER,
    password: ENV.DB_PWD,
    database: ENV.DB_NAME,
    ssl: isLocal ? false : { rejectUnauthorized: false },
  },
  schema,
  relations,
});

export type AppDatabase = typeof db;
