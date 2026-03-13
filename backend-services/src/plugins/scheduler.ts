import { eq } from 'drizzle-orm';
import { Elysia } from 'elysia';
import Redis from 'ioredis';
import { ENV } from '../config';
import { db } from '../database';
import { scheduledJobs } from '../database/schema';

export interface SchedulerJob {
  id: string;
  name: string;
  runAt: Date | number;
  payload?: unknown;
}

export type JobHandler = (payload: unknown) => void | Promise<void>;

/**
 * Distributed Scheduler Plugin for Elysia using Redis Sorted Sets.
 * This pattern allows multiple instances to share a single job queue safely.
 */
export const schedulerPlugin = (handlers: Record<string, JobHandler> = {}) => {
  const redis = new Redis(ENV.REDIS_URL);
  const REDIS_KEY = 'scheduler:jobs';
  let pollInterval: Timer;

  /**
   * Atomic Lua script to fetch and remove a job that is ready to run.
   * This ensures that in a distributed environment, only ONE instance picks up a specific job.
   */
  const LUA_FETCH_JOB = `
    local job = redis.call('ZRANGEBYSCORE', KEYS[1], '-inf', ARGV[1], 'LIMIT', 0, 1)
    if job[1] then
        redis.call('ZREM', KEYS[1], job[1])
        return job[1]
    end
    return nil
  `;

  const poll = async () => {
    try {
      const now = Date.now();
      const jobData = await redis.eval(LUA_FETCH_JOB, 1, REDIS_KEY, now);

      if (jobData && typeof jobData === 'string') {
        const job: SchedulerJob = JSON.parse(jobData);
        console.log(`[Redis Scheduler] Picking up job: ${job.name} (${job.id})`);

        try {
          const handler = handlers[job.name];
          if (handler) {
            await handler(job.payload);

            // Update Drizzle status for observability
            await db
              .update(scheduledJobs)
              .set({ status: 'completed' })
              .where(eq(scheduledJobs.id, job.id));
          } else {
            console.error(`[Redis Scheduler] No handler for: ${job.name}`);
          }
        } catch (err: unknown) {
          const error = err as Error;
          console.error(`[Redis Scheduler] Job execution failed:`, error.message);
          await db
            .update(scheduledJobs)
            .set({ status: 'failed' })
            .where(eq(scheduledJobs.id, job.id));
        }

        // Check for more jobs immediately if we found one
        setImmediate(() => poll());
      }
    } catch (err: unknown) {
      const error = err as Error;
      console.error(`[Redis Scheduler] Polling error:`, error.message);
    }
  };

  return new Elysia({ name: 'scheduler' })
    .onStart(() => {
      console.log('[Redis Scheduler] Starting distributed worker...');
      // Poll every 1 second (tunable based on precision requirements)
      pollInterval = setInterval(() => poll(), 1000);
    })
    .onStop(() => {
      console.log('[Redis Scheduler] Shutting down...');
      clearInterval(pollInterval);
      redis.disconnect();
    })
    .decorate('scheduler', {
      /**
       * Schedule a job in Redis (Distributed) and DB (Observability)
       */
      schedule: async (job: SchedulerJob) => {
        const timestamp = job.runAt instanceof Date ? job.runAt.getTime() : job.runAt;
        const jobJson = JSON.stringify(job);

        // 1. Add to Redis Sorted Set
        await redis.zadd(REDIS_KEY, timestamp, jobJson);

        // 2. Mirror in DB for history/UI visibility
        await db
          .insert(scheduledJobs)
          .values({
            id: job.id,
            name: job.name,
            runAt: new Date(timestamp),
            payload: job.payload,
            status: 'pending',
          })
          .onConflictDoUpdate({
            target: [scheduledJobs.id],
            set: { runAt: new Date(timestamp), payload: job.payload, status: 'pending' },
          });

        console.log(
          `[Redis Scheduler] Job ${job.id} queued for ${new Date(timestamp).toISOString()}`,
        );
      },

      cancel: async (id: string) => {
        // Unfortunately, ZREM requires the exact member string.
        // For a full cancel feature with Redis, we would need an ID -> Payload mapping.
        // For now, we update DB status. The poller will skip if it's already "cancelled" in logic if added.
        await db.update(scheduledJobs).set({ status: 'cancelled' }).where(eq(scheduledJobs.id, id));
        return true;
      },
    });
};
