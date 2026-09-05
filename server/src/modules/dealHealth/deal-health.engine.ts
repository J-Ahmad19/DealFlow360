import { db } from '../../db/client.js';
import {
  quotations,
  quotationLines,
  approvals,
  negotiationThreads,
  fulfillments,
  dealHealthAlerts,
} from '../../db/schema/dealflow.js';
import { and, count, eq, lt, lte, sql, inArray, notExists, not } from 'drizzle-orm';

// ─── Types ────────────────────────────────────────────────────────────────────

export type HealthAlertType =
  | 'STALLED'
  | 'DISCOUNT_ANOMALY'
  | 'DELIVERY_SLIPPAGE'
  | 'APPROVAL_BOTTLENECK'
  | 'EXCESSIVE_NEGOTIATION';

export type Severity = 'low' | 'medium' | 'high' | 'critical';

export interface HealthSignal {
  quotationId: string;
  type: HealthAlertType;
  severity: Severity;
  score: number;
  reason: string;
}

export interface DealHealthConfig {
  /** Hours of inactivity before a draft/negotiating quote is stalled. Default 72h */
  stalledThresholdHours: number;
  /** Relative % deviation from historical average discount before anomaly fires. Default 20 */
  discountAnomalyThresholdPct: number;
  /** Hours a pending approval step can sit before it's a bottleneck. Default 48h */
  approvalBottleneckHours: number;
  /** Number of negotiation messages before flagging excessive cycles. Default 5 */
  excessiveNegotiationCount: number;
}

const DEFAULT_CONFIG: DealHealthConfig = {
  stalledThresholdHours: 72,
  discountAnomalyThresholdPct: 20,
  approvalBottleneckHours: 48,
  excessiveNegotiationCount: 5,
};

// ─── Engine ───────────────────────────────────────────────────────────────────

export class DealHealthEngine {
  constructor(private config: DealHealthConfig = DEFAULT_CONFIG) {}

  // ── 1. Stalled Detection ───────────────────────────────────────────────────

  async detectStalled(): Promise<HealthSignal[]> {
    const cutoff = new Date(Date.now() - this.config.stalledThresholdHours * 60 * 60 * 1000);

    const rows = await db
      .select({ id: quotations.id, lastActivityAt: quotations.lastActivityAt })
      .from(quotations)
      .where(
        and(
          inArray(quotations.status, ['draft', 'under_negotiation']),
          lte(quotations.lastActivityAt, cutoff)
        )
      );

    return rows.map((q) => {
      const hoursStalled = Math.floor(
        (Date.now() - (q.lastActivityAt?.getTime() ?? Date.now())) / (1000 * 60 * 60)
      );
      const severity: Severity =
        hoursStalled > 168 ? 'critical' : hoursStalled > 96 ? 'high' : 'medium';

      return {
        quotationId: q.id,
        type: 'STALLED',
        severity,
        score: Math.min(100, Math.floor(hoursStalled / this.config.stalledThresholdHours) * 30),
        reason: `No activity for ${hoursStalled}h (threshold: ${this.config.stalledThresholdHours}h)`,
      };
    });
  }

  // ── 2. Discount Anomaly ────────────────────────────────────────────────────

  async detectDiscountAnomalies(): Promise<HealthSignal[]> {
    // Compute per-owner historical average discount across closed/approved quotes
    const historicalAvg = await db
      .select({
        ownerId: quotations.ownerId,
        avgDiscount: sql<number>`AVG(${quotations.discount}::float / NULLIF(${quotations.subtotal}, 0) * 100)`,
      })
      .from(quotations)
      .where(inArray(quotations.status, ['approved', 'confirmed', 'fulfillment']))
      .groupBy(quotations.ownerId);

    if (historicalAvg.length === 0) return [];

    const avgMap = new Map(historicalAvg.map((r) => [r.ownerId, r.avgDiscount ?? 0]));

    // Current open quotes with their effective discount %
    const openQuotes = await db
      .select({
        id: quotations.id,
        ownerId: quotations.ownerId,
        discount: quotations.discount,
        subtotal: quotations.subtotal,
      })
      .from(quotations)
      .where(inArray(quotations.status, ['draft', 'under_negotiation', 'pending_approval']));

    const signals: HealthSignal[] = [];

    for (const q of openQuotes) {
      const ownerAvg = avgMap.get(q.ownerId ?? '');
      if (ownerAvg === undefined || ownerAvg === 0) continue;

      const currentPct = q.subtotal > 0 ? (q.discount / q.subtotal) * 100 : 0;
      const deviation = currentPct - ownerAvg;
      const relativeDev = ownerAvg > 0 ? (deviation / ownerAvg) * 100 : 0;

      if (relativeDev > this.config.discountAnomalyThresholdPct) {
        const severity: Severity =
          relativeDev > 100 ? 'critical' : relativeDev > 60 ? 'high' : relativeDev > 30 ? 'medium' : 'low';

        signals.push({
          quotationId: q.id,
          type: 'DISCOUNT_ANOMALY',
          severity,
          score: Math.min(100, Math.floor(relativeDev)),
          reason: `Discount ${currentPct.toFixed(1)}% vs owner historical avg ${ownerAvg.toFixed(1)}% (+${relativeDev.toFixed(0)}% relative deviation)`,
        });
      }
    }

    return signals;
  }

  // ── 3. Delivery Promise Slippage ───────────────────────────────────────────

  async detectDeliverySlippage(): Promise<HealthSignal[]> {
    const now = new Date();

    // Find fulfillment rows that are past estimated date and still not shipped/delivered
    const overdue = await db
      .select({
        quotationId: fulfillments.quotationId,
        estimatedDate: fulfillments.estimatedDelivery,
      })
      .from(fulfillments)
      .where(
        and(
          lte(fulfillments.estimatedDelivery, now),
          // Not yet in delivered/shipped terminal state — use status not in shipped/delivered
          not(inArray(fulfillments.status, ['shipped', 'delivered']))
        )
      );

    return overdue.map((f) => {
      const daysLate = Math.floor(
        (Date.now() - (f.estimatedDate?.getTime() ?? Date.now())) / (1000 * 60 * 60 * 24)
      );
      const severity: Severity = daysLate > 14 ? 'critical' : daysLate > 7 ? 'high' : 'medium';

      return {
        quotationId: f.quotationId!,
        type: 'DELIVERY_SLIPPAGE',
        severity,
        score: Math.min(100, daysLate * 10),
        reason: `Delivery overdue by ${daysLate} day(s). Estimated: ${f.estimatedDate?.toISOString().split('T')[0]}`,
      };
    });
  }

  // ── 4. Approval Bottleneck ─────────────────────────────────────────────────

  async detectApprovalBottlenecks(): Promise<HealthSignal[]> {
    const cutoff = new Date(Date.now() - this.config.approvalBottleneckHours * 60 * 60 * 1000);

    const stuck = await db
      .select({
        quotationId: approvals.quotationId,
        approverRole: approvals.approverRole,
        createdAt: approvals.createdAt,
      })
      .from(approvals)
      .where(and(eq(approvals.status, 'pending'), lte(approvals.createdAt, cutoff)));

    return stuck.map((a) => {
      const hoursWaiting = Math.floor(
        (Date.now() - (a.createdAt?.getTime() ?? Date.now())) / (1000 * 60 * 60)
      );
      const severity: Severity =
        hoursWaiting > 96 ? 'critical' : hoursWaiting > 72 ? 'high' : 'medium';

      return {
        quotationId: a.quotationId!,
        type: 'APPROVAL_BOTTLENECK',
        severity,
        score: Math.min(100, Math.floor(hoursWaiting / this.config.approvalBottleneckHours) * 40),
        reason: `Approval pending ${hoursWaiting}h with ${a.approverRole} (threshold: ${this.config.approvalBottleneckHours}h)`,
      };
    });
  }

  // ── 5. Excessive Negotiation ───────────────────────────────────────────────

  async detectExcessiveNegotiation(): Promise<HealthSignal[]> {
    const rows = await db
      .select({
        quotationId: negotiationThreads.quotationId,
        messageCount: count(negotiationThreads.id),
      })
      .from(negotiationThreads)
      .groupBy(negotiationThreads.quotationId)
      .having(sql`COUNT(${negotiationThreads.id}) > ${this.config.excessiveNegotiationCount}`);

    return rows.map((r) => {
      const excess = r.messageCount - this.config.excessiveNegotiationCount;
      const severity: Severity = excess > 10 ? 'critical' : excess > 5 ? 'high' : 'medium';

      return {
        quotationId: r.quotationId!,
        type: 'EXCESSIVE_NEGOTIATION',
        severity,
        score: Math.min(100, excess * 10),
        reason: `${r.messageCount} negotiation messages (threshold: ${this.config.excessiveNegotiationCount})`,
      };
    });
  }

  // ── Full Scan + Deduplication + Persist ───────────────────────────────────

  async scan(): Promise<{ inserted: number; skipped: number }> {
    const [stalled, anomalies, slippage, bottlenecks, excessive] = await Promise.all([
      this.detectStalled(),
      this.detectDiscountAnomalies(),
      this.detectDeliverySlippage(),
      this.detectApprovalBottlenecks(),
      this.detectExcessiveNegotiation(),
    ]);

    const allSignals = [...stalled, ...anomalies, ...slippage, ...bottlenecks, ...excessive];
    if (allSignals.length === 0) return { inserted: 0, skipped: 0 };

    // Fetch existing open alerts for deduplication (same quotationId + type)
    const existingOpen = await db
      .select({ quotationId: dealHealthAlerts.quotationId, type: dealHealthAlerts.type })
      .from(dealHealthAlerts)
      .where(eq(dealHealthAlerts.unresolved, true));

    const existingSet = new Set(existingOpen.map((e) => `${e.quotationId}::${e.type}`));

    const toInsert = allSignals.filter(
      (s) => !existingSet.has(`${s.quotationId}::${s.type}`)
    );

    if (toInsert.length > 0) {
      await db.insert(dealHealthAlerts).values(
        toInsert.map((s) => ({
          quotationId: s.quotationId,
          type: s.type,
          severity: s.severity,
          score: s.score,
          reason: s.reason,
        }))
      );
    }

    return { inserted: toInsert.length, skipped: allSignals.length - toInsert.length };
  }
}
