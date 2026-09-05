// ─── Typed Key Builders + TTL Registry ───────────────────────────────────────
//
// All Redis keys used across DealFlow360 are defined here.
// Centralizing key construction:
//   1. Prevents typos / key collisions between modules.
//   2. Makes invalidation explicit — callers import the same builder they cache with.
//   3. TTLs are co-located with the key so you can audit cache lifetimes in one place.

// ─── TTLs (seconds) ───────────────────────────────────────────────────────────

export const TTL = {
  /** Discount / pricing policy — changes rarely, safe to cache 10 min */
  PRICING_POLICY:     60 * 10,
  /** Recommendations — quotation lines change frequently; 5 min max */
  RECOMMENDATIONS:    60 * 5,
  /** Dashboard health aggregates — 2 min staleness acceptable */
  DASHBOARD:          60 * 2,
  /** Approval rules — only change on admin writes; 15 min */
  APPROVAL_POLICY:    60 * 15,
  /** Idempotency keys — 24h window matches typical payment retry windows */
  IDEMPOTENCY:        60 * 60 * 24,
  /** Warehouse stock summary — 1 min TTL */
  STOCK:              60,
  /** Quotation summary view — 5 min TTL */
  QUOTE_SUMMARY:      60 * 5,
} as const;

// ─── Namespace prefix ─────────────────────────────────────────────────────────

const NS = 'dealflow';

// ─── Key Builders ─────────────────────────────────────────────────────────────

export const CacheKey = {
  /**
   * Discount / pricing policy for a specific customer tier.
   * dealflow:pricing:{tierId}:{customerId}
   */
  pricingPolicy: (tierId: string, customerId: string) =>
    `${NS}:pricing:${tierId}:${customerId}`,

  /**
   * Upsell/cross-sell recommendations for an active quotation.
   * dealflow:recommendations:{quotationId}
   */
  recommendations: (quotationId: string) =>
    `${NS}:recommendations:${quotationId}`,

  /**
   * Warehouse stock read cache.
   * dealflow:stock:{warehouseId}:{productId}
   */
  stock: (warehouseId: string, productId: string) =>
    `${NS}:stock:${warehouseId}:${productId}`,

  /**
   * Dashboard health aggregate summary.
   * dealflow:dashboard:health:{teamId}
   */
  dashboardHealth: (teamId: string = 'global') =>
    `${NS}:dashboard:health:${teamId}`,

  /**
   * Approval rules list (all rules, ordered by sequence).
   * dealflow:approval-policy:{version}
   */
  approvalPolicy: (version: string = 'v1') =>
    `${NS}:approval-policy:${version}`,

  /**
   * Quotation summary read view cache.
   * dealflow:quote:{quotationId}:summary
   */
  quoteSummary: (quotationId: string) =>
    `${NS}:quote:${quotationId}:summary`,

  /**
   * Idempotency key for payment/order creation.
   * dealflow:idempotency:{clientKey}
   */
  idempotency: (key: string) =>
    `${NS}:idempotency:${key}`,

  /**
   * Rate limiter bucket — used by rate-limit-redis store internally.
   * dealflow:rate:{limiterName}:{identifier}
   */
  rateLimit: (limiterName: string, identifier: string) =>
    `${NS}:rate:${limiterName}:${identifier}`,
} as const;
