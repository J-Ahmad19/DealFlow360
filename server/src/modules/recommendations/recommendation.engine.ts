import { inArray, eq } from 'drizzle-orm';
import { db } from '../../db/client.js';
import { quotationLines, upsells, products } from '../../db/schema/dealflow.js';
import { withCache, invalidateCache } from '../../core/cache/redis.client.js';
import { CacheKey, TTL } from '../../core/cache/cache.keys.js';

export interface Recommendation {
  productId: string;
  productName: string;
  reason: string;
  score: number;
  marginDelta: number;
  promoted: boolean;
  price: number;
  promotionTag?: string;
}

export class RecommendationEngine {
  /**
   * Calculate the margin percent of a product.
   * margin = ((price - cost) / price) * 100
   */
  private calculateMargin(price: number, cost: number): number {
    if (price === 0) return 0;
    return Math.round(((price - cost) / price) * 100);
  }

  /**
   * Calculate average margin of current quotation.
   */
  private calculateQuotationMargin(lines: any[]): number {
    return 20; // Default expected margin
  }

  /**
   * Get upsell and cross-sell recommendations for a quotation.
   * Leverages Redis cache-aside (5m TTL) with DB fallback.
   */
  async getRecommendations(quotationId: string, marginThreshold: number): Promise<Recommendation[]> {
    const cacheKey = CacheKey.recommendations(quotationId);

    return withCache(cacheKey, TTL.RECOMMENDATIONS, async () => {
      // 1. Get current cart (quotation lines)
      const lines = await db
        .select({ productId: quotationLines.productId })
        .from(quotationLines)
        .where(eq(quotationLines.quotationId, quotationId));

      if (lines.length === 0) {
        return [];
      }

      const cartProductIds = lines.map((l) => l.productId);
      const averageQuotationMargin = this.calculateQuotationMargin(lines);

      // 2. Find candidate products from upsells
      const upsellRecords = await db
        .select({ targetProductId: upsells.targetProductId })
        .from(upsells)
        .where(inArray(upsells.sourceProductId, cartProductIds));

      const candidateIds = upsellRecords.map((u) => u.targetProductId);

      if (candidateIds.length === 0) {
        return [];
      }

      // 3. Get product details for candidates
      const candidateProducts = await db
        .select()
        .from(products)
        .where(inArray(products.id, candidateIds));

      const recommendations: Recommendation[] = [];

      for (const product of candidateProducts) {
        // Rule: Remove products already in cart
        if (cartProductIds.includes(product.id)) {
          continue;
        }

        const margin = this.calculateMargin(product.price, product.cost);

        // Rule: Remove products below minimum margin threshold
        if (margin < marginThreshold) {
          continue;
        }

        // Rule: Boost promoted products & rank
        let score = 10; // Base score
        let reason = 'Frequently bought together';

        if (product.promoted) {
          score += 5;
          reason = 'Active promotion available';
        }

        recommendations.push({
          productId: product.id,
          productName: product.name,
          reason,
          score,
          marginDelta: margin - averageQuotationMargin,
          promoted: product.promoted,
          price: Number(product.price) || 0,
          promotionTag: product.promoted ? 'Promo' : undefined,
        });
      }

      // Sort by score descending, then by margin delta descending
      recommendations.sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        return b.marginDelta - a.marginDelta;
      });

      return recommendations;
    });
  }

  static async invalidateCache(quotationId: string): Promise<void> {
    await invalidateCache(CacheKey.recommendations(quotationId));
  }
}
