import { db } from '../../db/client.js';
import { approvalRules } from '../../db/schema/dealflow.js';
import { withCache, invalidatePattern } from '../../core/cache/redis.client.js';
import { CacheKey, TTL } from '../../core/cache/cache.keys.js';

export interface ApprovalRoute {
  approverRole: 'admin' | 'sales_manager' | 'finance' | 'sales_rep';
  sequence: number;
}

export class ApprovalRoutingEngine {
  /**
   * Determine the required approval routing for a given risk score.
   * Leverages Redis cache-aside for approval policies (15m TTL).
   * If no rules apply (e.g., risk is very low), returns an empty array (implying auto-approval).
   */
  async getApprovalRouting(riskScore: number): Promise<ApprovalRoute[]> {
    const cacheKey = CacheKey.approvalPolicy('v1');

    const allRules = await withCache(cacheKey, TTL.APPROVAL_POLICY, async () => {
      return db
        .select({
          approverRole: approvalRules.approverRole,
          minRisk: approvalRules.minRisk,
          maxRisk: approvalRules.maxRisk,
          sequence: approvalRules.sequence,
        })
        .from(approvalRules)
        .orderBy(approvalRules.sequence);
    });

    return allRules
      .filter((r) => riskScore >= r.minRisk && riskScore <= r.maxRisk)
      .map((r) => ({
        approverRole: r.approverRole as ApprovalRoute['approverRole'],
        sequence: r.sequence,
      }));
  }

  static async invalidateCache(): Promise<void> {
    await invalidatePattern('dealflow:approval-policy:*');
  }
}
