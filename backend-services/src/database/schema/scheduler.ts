import { jsonb, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';

export const scheduledJobs = pgTable('scheduled_jobs', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: text('name').notNull(),
  runAt: timestamp('run_at').notNull(),
  payload: jsonb('payload'),
  status: varchar('status', { length: 50 }).notNull().default('pending'), // pending, completed, failed
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
