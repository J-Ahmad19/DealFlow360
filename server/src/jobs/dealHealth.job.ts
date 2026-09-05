import { DealHealthEngine } from '../modules/dealHealth/deal-health.engine.js';
import { invalidatePattern } from '../core/cache/redis.client.js';

export interface ProcessDealHealthResult {
  inserted: number;
  skipped: number;
  errors: number;
}

/**
 * Deal Health Worker Job
 *
 * Scans open deals to detect:
 *  1. Stalled quotations (inactive for > 72h)
 *  2. Discount anomalies (deviations from historical average)
 *  3. Delivery slippage (overdue fulfillments)
 *  4. Approval bottlenecks (pending for > 48h)
 *  5. Excessive negotiation cycles (> 5 messages)
 *
 * Deduplicates against existing unresolved alerts for idempotency.
 * Invalidates the Redis dashboard aggregate cache when new alerts are detected.
 */
export async function processDealHealthJob(): Promise<ProcessDealHealthResult> {
  const timestamp = new Date().toISOString();
  console.log(`[Worker:DealHealth] [${timestamp}] Starting deal health scan...`);

  const result: ProcessDealHealthResult = {
    inserted: 0,
    skipped: 0,
    errors: 0,
  };

  try {
    const engine = new DealHealthEngine();
    const scanResult = await engine.scan();

    result.inserted = scanResult.inserted;
    result.skipped = scanResult.skipped;

    if (scanResult.inserted > 0) {
      console.log(
        `[Worker:DealHealth] Created ${scanResult.inserted} new health alert(s). Invalidating Redis dashboard health cache.`
      );
      await invalidatePattern('dealflow:dashboard:health:*');
    } else {
      console.log(`[Worker:DealHealth] No new health alerts created.`);
    }
  } catch (err: any) {
    result.errors++;
    console.error('[Worker:DealHealth] Error during health scan:', err.message || err);
  }

  console.log(
    `[Worker:DealHealth] Job completed. Inserted: ${result.inserted}, Skipped: ${result.skipped}, Errors: ${result.errors}`
  );

  return result;
}
