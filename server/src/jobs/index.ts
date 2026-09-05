import { processBillingJob } from './billing.job.js';
import { processDealHealthJob } from './dealHealth.job.js';
import { processRecommendationJob } from './recommendation.job.js';
import { processNotificationJob } from './notifications.job.js';

export {
  processBillingJob,
  processDealHealthJob,
  processRecommendationJob,
  processNotificationJob,
};

export interface JobRunSummary {
  billing: Awaited<ReturnType<typeof processBillingJob>>;
  dealHealth: Awaited<ReturnType<typeof processDealHealthJob>>;
  recommendation: Awaited<ReturnType<typeof processRecommendationJob>>;
  notifications: Awaited<ReturnType<typeof processNotificationJob>>;
}

/**
 * Execute a single iteration of all DealFlow360 background workers.
 * Each job operates independently with isolated error handling and transactions.
 */
export async function runAllJobs(): Promise<JobRunSummary> {
  console.log('🔄 [BackgroundScheduler] Starting execution sweep for all jobs...');
  const startTime = Date.now();

  const [billing, dealHealth, recommendation, notificationsResults] = await Promise.all([
    processBillingJob(),
    processDealHealthJob(),
    processRecommendationJob(),
    processNotificationJob(),
  ]);

  const durationMs = Date.now() - startTime;
  console.log(`✅ [BackgroundScheduler] Sweep completed in ${durationMs}ms.`);

  return {
    billing,
    dealHealth,
    recommendation,
    notifications: notificationsResults,
  };
}

let schedulerTimer: NodeJS.Timeout | null = null;

/**
 * Start recurring background scheduler loop.
 *
 * @param intervalMs Cycle interval in milliseconds (default: 60,000ms / 1 min)
 */
export function startJobScheduler(intervalMs: number = 60000): void {
  if (schedulerTimer) {
    console.warn('⚠️ [BackgroundScheduler] Scheduler is already running.');
    return;
  }

  console.log(`⚡ [BackgroundScheduler] Initializing background job loop (Interval: ${intervalMs / 1000}s)...`);

  // Run initial sweep after 5 seconds to let server finish startup
  setTimeout(() => {
    runAllJobs().catch((err) =>
      console.error('❌ [BackgroundScheduler] Error in initial job sweep:', err)
    );
  }, 5000);

  // Set recurring interval
  schedulerTimer = setInterval(() => {
    runAllJobs().catch((err) =>
      console.error('❌ [BackgroundScheduler] Error in background job cycle:', err)
    );
  }, intervalMs);
}

/**
 * Stop background scheduler loop cleanly.
 */
export function stopJobScheduler(): void {
  if (schedulerTimer) {
    clearInterval(schedulerTimer);
    schedulerTimer = null;
    console.log('🛑 [BackgroundScheduler] Background job scheduler stopped.');
  }
}
