import { and, eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import { notifications } from '../db/schema/dealflow.js';

export interface ProcessNotificationResult {
  scanned: number;
  sent: number;
  skipped: number;
  errors: number;
}

/**
 * Notification Worker Job
 *
 * Scans `notifications` table where status = 'pending'.
 * Uses atomic state transitions (UPDATE ... WHERE status = 'pending') within DB transactions
 * to guarantee idempotency and prevent duplicate notification sends across concurrent workers.
 */
export async function processNotificationJob(): Promise<ProcessNotificationResult> {
  const timestamp = new Date().toISOString();
  console.log(`[Worker:Notifications] [${timestamp}] Starting notification processing job...`);

  const result: ProcessNotificationResult = {
    scanned: 0,
    sent: 0,
    skipped: 0,
    errors: 0,
  };

  try {
    // 1. Fetch pending notifications using partial index (notifications_worker_idx)
    const pendingNotifications = await db
      .select()
      .from(notifications)
      .where(eq(notifications.status, 'pending'));

    result.scanned = pendingNotifications.length;
    console.log(
      `[Worker:Notifications] Found ${pendingNotifications.length} pending notification(s) to send.`
    );

    for (const notif of pendingNotifications) {
      try {
        await db.transaction(async (tx) => {
          // 2. Atomic status update (Idempotency Guard: only proceeds if status is STILL 'pending')
          const [updated] = await tx
            .update(notifications)
            .set({
              status: 'sent',
              sentAt: new Date(),
            })
            .where(
              and(
                eq(notifications.id, notif.id),
                eq(notifications.status, 'pending')
              )
            )
            .returning();

          if (!updated) {
            // Already processed by a concurrent thread — skip safely
            result.skipped++;
            return;
          }

          // 3. Dispatch notification (Simulated email/push delivery)
          result.sent++;
          console.log(
            `[Worker:Notifications] [DISPATCH] Sent "${notif.title}" (Type: ${notif.type}) to Recipient ID ${
              notif.recipientId ?? 'System'
            }`
          );
        });
      } catch (err: any) {
        result.errors++;
        console.error(
          `[Worker:Notifications] [ERROR] Failed to send notification ID ${notif.id}:`,
          err.message || err
        );
      }
    }
  } catch (err: any) {
    console.error('[Worker:Notifications] Critical error during job execution:', err.message || err);
  }

  console.log(
    `[Worker:Notifications] Job completed. Scanned: ${result.scanned}, Sent: ${result.sent}, Skipped: ${result.skipped}, Errors: ${result.errors}`
  );

  return result;
}
