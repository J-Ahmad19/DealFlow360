import { and, eq, lte } from 'drizzle-orm';
import { db } from '../db/client.js';
import { billingSchedules, invoices } from '../db/schema/dealflow.js';

export interface ProcessBillingResult {
  scanned: number;
  processed: number;
  skipped: number;
  errors: number;
}

/**
 * Billing Worker Job
 *
 * Scans `billing_schedules` where status = 'scheduled' and billingDate <= now.
 * Uses atomic state transition (UPDATE ... WHERE status = 'scheduled') to guarantee idempotency
 * and prevent duplicate billing across concurrent worker threads.
 * Processes each item within a DB transaction and creates the corresponding invoice record.
 */
export async function processBillingJob(): Promise<ProcessBillingResult> {
  const now = new Date();
  const timestamp = now.toISOString();
  console.log(`[Worker:Billing] [${timestamp}] Starting billing worker scan...`);

  const result: ProcessBillingResult = {
    scanned: 0,
    processed: 0,
    skipped: 0,
    errors: 0,
  };

  try {
    // 1. Fetch due items using partial index (billing_worker_idx)
    const dueItems = await db
      .select()
      .from(billingSchedules)
      .where(
        and(
          eq(billingSchedules.status, 'scheduled'),
          lte(billingSchedules.billingDate, now)
        )
      );

    result.scanned = dueItems.length;
    console.log(`[Worker:Billing] Found ${dueItems.length} due billing schedules to process.`);

    for (const schedule of dueItems) {
      try {
        await db.transaction(async (tx) => {
          // 2. Atomic state update (Idempotency Guard: only proceeds if status is STILL 'scheduled')
          const [updated] = await tx
            .update(billingSchedules)
            .set({ status: 'invoiced' })
            .where(
              and(
                eq(billingSchedules.id, schedule.id),
                eq(billingSchedules.status, 'scheduled')
              )
            )
            .returning();

          if (!updated) {
            // Already processed by a concurrent thread — skip safely
            result.skipped++;
            return;
          }

          // 3. Create invoice record
          const dueAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Net 30 days
          await tx.insert(invoices).values({
            billingId: schedule.id,
            status: 'sent',
            dueAt,
          });

          result.processed++;
          console.log(
            `[Worker:Billing] [SUCCESS] Invoiced schedule ID ${schedule.id} for Order ID ${schedule.orderId} (Amount: $${(
              schedule.amount / 100
            ).toFixed(2)})`
          );
        });
      } catch (err: any) {
        result.errors++;
        console.error(
          `[Worker:Billing] [ERROR] Failed to process schedule ID ${schedule.id}:`,
          err.message || err
        );
        // Safe retry behavior: catch error, leave item untouched or for retry, continue loop
      }
    }
  } catch (err: any) {
    console.error('[Worker:Billing] Critical error during job execution:', err.message || err);
  }

  console.log(
    `[Worker:Billing] Job completed. Scanned: ${result.scanned}, Processed: ${result.processed}, Skipped: ${result.skipped}, Errors: ${result.errors}`
  );

  return result;
}
