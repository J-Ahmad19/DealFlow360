import { inArray } from 'drizzle-orm';
import { db } from '../db/client.js';
import { quotations } from '../db/schema/dealflow.js';
import { RecommendationEngine } from '../modules/recommendations/recommendation.engine.js';

export interface ProcessRecommendationResult {
  scanned: number;
  refreshed: number;
  errors: number;
}

/**
 * Recommendation Refresh Worker Job
 *
 * Pre-computes and refreshes upsell / cross-sell recommendations for active quotations
 * (in 'draft', 'pending_approval', or 'under_negotiation' state) and populates the Redis cache.
 * Keeps expensive cart recommendation queries out of the critical HTTP response path.
 */
export async function processRecommendationJob(): Promise<ProcessRecommendationResult> {
  const timestamp = new Date().toISOString();
  console.log(`[Worker:Recommendation] [${timestamp}] Starting recommendation pre-compute refresh...`);

  const result: ProcessRecommendationResult = {
    scanned: 0,
    refreshed: 0,
    errors: 0,
  };

  try {
    // 1. Fetch open active quotations
    const activeQuotes = await db
      .select({ id: quotations.id })
      .from(quotations)
      .where(inArray(quotations.status, ['draft', 'pending_approval', 'under_negotiation']));

    result.scanned = activeQuotes.length;
    console.log(`[Worker:Recommendation] Found ${activeQuotes.length} active quotations to refresh.`);

    const engine = new RecommendationEngine();
    const defaultMarginThreshold = 10; // 10% minimum margin threshold

    for (const q of activeQuotes) {
      try {
        // Pre-compute & cache in Redis (5m TTL)
        const recs = await engine.getRecommendations(q.id, defaultMarginThreshold);
        result.refreshed++;
        console.log(
          `[Worker:Recommendation] Refreshed ${recs.length} recommendations for quotation ID ${q.id}`
        );
      } catch (err: any) {
        result.errors++;
        console.error(
          `[Worker:Recommendation] Failed to refresh recommendations for quotation ID ${q.id}:`,
          err.message || err
        );
      }
    }
  } catch (err: any) {
    console.error('[Worker:Recommendation] Critical error during job execution:', err.message || err);
  }

  console.log(
    `[Worker:Recommendation] Job completed. Scanned: ${result.scanned}, Refreshed: ${result.refreshed}, Errors: ${result.errors}`
  );

  return result;
}
