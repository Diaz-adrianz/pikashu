import { Queue } from 'bullmq';
import Redis from 'ioredis';

export const JOB_QUEUE_NAME = 'pikashu-jobs';

let queue: Queue | undefined;

function getQueue() {
  if (!queue) {
    const connection = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
      maxRetriesPerRequest: null,
    });
    queue = new Queue(JOB_QUEUE_NAME, { connection });
  }
  return queue;
}

/**
 * ponytail: exact repeat strategy is unspecified; cron covers all three jobs.
 * Stable scheduler ids make registration idempotent across worker restarts.
 */
export async function ensureRecurringJobs() {
  const q = getQueue();
  const schedules = [
    { id: 'generate-trips', pattern: '5 * * * *' },
    { id: 'expire-bookings', pattern: '* * * * *' },
    { id: 'complete-trips', pattern: '*/5 * * * *' },
  ];

  await Promise.all(
    schedules.map(({ id, pattern }) =>
      q.upsertJobScheduler(
        id,
        { pattern, tz: 'Asia/Jakarta' },
        {
          name: id,
          data: {},
          opts: {
            removeOnComplete: { age: 3600 },
            removeOnFail: { age: 86400 },
          },
        }
      )
    )
  );
}
