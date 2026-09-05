import { eq } from 'drizzle-orm';
import { db } from '../../db/client.js';
import { companies, discountPolicies } from '../../db/schema/dealflow.js';
import { withCache, invalidatePattern } from '../../core/cache/redis.client.js';
import { CacheKey, TTL } from '../../core/cache/cache.keys.js';

interface RawCachedPolicy {
  baseLimit: number;
  categoryLimitsObj: Record<string, number>;
}

export class DiscountPolicyRepository {
  /**
   * Fetch all discount policies for a given customer.
   * Leverages Redis cache-aside (10m TTL) with DB fallback.
   */
  async getPoliciesForCustomer(customerId: string) {
    const [customer] = await db
      .select({ tierId: companies.tierId })
      .from(companies)
      .where(eq(companies.id, customerId));

    if (!customer || !customer.tierId) {
      return { baseLimit: 0, categoryLimits: new Map<string, number>() };
    }

    const tierId = customer.tierId;
    const cacheKey = CacheKey.pricingPolicy(tierId, customerId);

    const cached: RawCachedPolicy = await withCache(
      cacheKey,
      TTL.PRICING_POLICY,
      async () => {
        const policies = await db
          .select()
          .from(discountPolicies)
          .where(eq(discountPolicies.tierId, tierId));

        let baseLimit = 0;
        const categoryLimitsObj: Record<string, number> = {};

        for (const policy of policies) {
          if (policy.categoryId === null) {
            baseLimit = policy.discountPercent;
          } else {
            categoryLimitsObj[policy.categoryId] = policy.discountPercent;
          }
        }

        return { baseLimit, categoryLimitsObj };
      }
    );

    const categoryLimits = new Map<string, number>(
      Object.entries(cached.categoryLimitsObj || {})
    );

    return { baseLimit: cached.baseLimit, categoryLimits };
  }

  static async invalidateCache(tierId?: string) {
    if (tierId) {
      await invalidatePattern(`dealflow:pricing:${tierId}:*`);
    } else {
      await invalidatePattern(`dealflow:pricing:*`);
    }
  }
}
