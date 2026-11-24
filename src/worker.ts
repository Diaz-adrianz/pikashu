import { Worker } from 'bullmq';
import Redis from 'ioredis';
import { expireBookings } from './features/booking/services';
import { completeTrips, generateTrips } from './features/schedule/services';
import { ensureRecurringJobs, JOB_QUEUE_NAME } from './lib/queue';

const connection = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

async function main() {
  await ensureRecurringJobs();

  const worker = new Worker(
    JOB_QUEUE_NAME,
    async (job) => {
      switch (job.name) {
        case 'generate-trips':
          return { created: await generateTrips() };
        case 'expire-bookings':
          return { expired: await expireBookings() };
        case 'complete-trips':
          return await completeTrips();
        default:
          throw new Error(`Unknown job: ${job.name}`);
      }
    },
    { connection, concurrency: 1 }
  );

  worker.on('completed', (job) =>
    console.log(`[worker] ${job.name} completed`, job.returnvalue)
  );
  worker.on('failed', (job, error) =>
    console.error(`[worker] ${job?.name} failed`, error)
  );

  console.log(`[worker] listening on ${JOB_QUEUE_NAME}`);
}

main().catch((error) => {
  console.error('[worker] startup failed', error);
  process.exitCode = 1;
});
