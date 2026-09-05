import { DealHealthEngine } from './deal-health.engine.js';

const SCAN_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes

let scanInterval: ReturnType<typeof setInterval> | null = null;
const engine = new DealHealthEngine();

export function startDealHealthScheduler(): void {
  if (scanInterval) return; // already running

  // Run once immediately on startup (non-blocking)
  engine.scan().then(({ inserted, skipped }) => {
    console.log(`[DealHealth] Initial scan: ${inserted} alerts inserted, ${skipped} skipped (dedup)`);
  }).catch((err) => {
    console.error('[DealHealth] Initial scan error:', err);
  });

  scanInterval = setInterval(() => {
    engine.scan().then(({ inserted, skipped }) => {
      console.log(`[DealHealth] Scan: ${inserted} new alerts, ${skipped} skipped`);
    }).catch((err) => {
      console.error('[DealHealth] Scan error:', err);
    });
  }, SCAN_INTERVAL_MS);

  console.log(`[DealHealth] Scheduler started. Scanning every ${SCAN_INTERVAL_MS / 60000} minutes.`);
}

export function stopDealHealthScheduler(): void {
  if (scanInterval) {
    clearInterval(scanInterval);
    scanInterval = null;
  }
}
