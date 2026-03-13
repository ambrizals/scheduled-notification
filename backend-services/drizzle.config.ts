import { defineConfig } from 'drizzle-kit';
import { dbSchema } from './src/config/db.config';

const ENV = dbSchema.parse(process.env);
const isLocal = ['local', 'test'].includes(process.env.NODE_ENV || 'local');

export default defineConfig({
  out: './drizzle',
  schema: './src/database/schema/index.ts',
  dialect: 'postgresql',
  dbCredentials: {
    host: ENV.DB_HOST,
    port: ENV.DB_PORT,
    user: ENV.DB_USER,
    password: ENV.DB_PWD,
    database: ENV.DB_NAME,
    ssl: isLocal ? false : { rejectUnauthorized: false },
  },
  verbose: true,
});
