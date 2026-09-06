import { randomUUID } from 'node:crypto';
import { jest } from '@jest/globals';
import { db } from '../src/db/client.js';
import {
  quotations,
  quotationLines,
  companies,
  users,
  products,
  negotiationThreads,
  approvals,
  dealHealthAlerts,
  fulfillments,
  notifications,
  auditLogs,
} from '../src/db/schema/dealflow.js';
import { eq } from 'drizzle-orm';
import { DealHealthEngine } from '../src/modules/dealHealth/deal-health.engine.js';
import { nudgeAlert } from '../src/modules/dealHealth/deal-health.controller.js';

// Use faster thresholds for tests
const engine = new DealHealthEngine({
  stalledThresholdHours: 1,       // 1h stalled threshold
  discountAnomalyThresholdPct: 20, // 20% relative deviation
  approvalBottleneckHours: 1,      // 1h bottleneck threshold
  excessiveNegotiationCount: 3,    // 3 messages threshold
});

describe('DealHealthEngine', () => {
  let ownerId: string;
  let customerId: string;
  let productId: string;

  const created: { table: string; id: string }[] = [];

  function track(table: string, id: string) {
    created.push({ table, id });
    return id;
  }

  async function makeQuotation(overrides: Partial<{
    status: string;
    lastActivityAt: Date;
    discount: number;
    subtotal: number;
    ownerId: string;
  }> = {}) {
    const id = randomUUID();
    await db.insert(quotations).values({
      id,
      title: 'Health Test Quote',
      customerId,
      ownerId: overrides.ownerId ?? ownerId,
      status: (overrides.status ?? 'draft') as any,
      lastActivityAt: overrides.lastActivityAt ?? new Date(),
      subtotal: overrides.subtotal ?? 0,
      discount: overrides.discount ?? 0,
      total: 0,
      tax: 0,
      margin: 50,
      riskScore: 0,
    });
    track('quotations', id);
    return id;
  }

  beforeAll(async () => {
    // Create a real user to satisfy FK
    ownerId = randomUUID();
    await db.insert(users).values({
      id: ownerId,
      email: `health-test-${ownerId.slice(0, 8)}@test.com`,
      fullName: 'Health Test Owner',
      role: 'sales_rep',
    });
    track('users', ownerId);

    customerId = randomUUID();
    await db.insert(companies).values({ id: customerId, name: 'Health Test Corp' });
    track('companies', customerId);

    productId = randomUUID();
    await db.insert(products).values({
      id: productId,
      name: 'Health Product',
      price: 1000,
      cost: 200,
    });
    track('products', productId);
  });

  afterAll(async () => {
    // Clean up in reverse FK order
    await db.delete(dealHealthAlerts).where(eq(dealHealthAlerts.quotationId, customerId));
    // Clean tracked items
    for (const item of created.reverse()) {
      if (item.table === 'quotations') {
        await db.delete(negotiationThreads).where(eq(negotiationThreads.quotationId, item.id));
        await db.delete(approvals).where(eq(approvals.quotationId, item.id));
        await db.delete(fulfillments).where(eq(fulfillments.quotationId, item.id));
        await db.delete(dealHealthAlerts).where(eq(dealHealthAlerts.quotationId, item.id));
        await db.delete(quotationLines).where(eq(quotationLines.quotationId, item.id));
        await db.delete(quotations).where(eq(quotations.id, item.id));
      } else if (item.table === 'users') {
        await db.delete(notifications).where(eq(notifications.recipientId, item.id));
        await db.delete(auditLogs).where(eq(auditLogs.actorId, item.id));
        await db.delete(users).where(eq(users.id, item.id));
      } else if (item.table === 'companies') {
        await db.delete(companies).where(eq(companies.id, item.id));
      } else if (item.table === 'products') {
        await db.delete(products).where(eq(products.id, item.id));
      }
    }
  });

  // ── Test 1: Stalled Detection ──────────────────────────────────────────────

  it('should detect stalled quotations past the threshold', async () => {
    // 3 hours ago — past our 1h test threshold
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
    const stalledId = await makeQuotation({ status: 'draft', lastActivityAt: threeHoursAgo });

    // Recent quotation should NOT be flagged
    const freshId = await makeQuotation({ status: 'draft', lastActivityAt: new Date() });

    const signals = await engine.detectStalled();
    const stalledSignals = signals.filter((s) => s.quotationId === stalledId);
    const freshSignals = signals.filter((s) => s.quotationId === freshId);

    expect(stalledSignals).toHaveLength(1);
    expect(stalledSignals[0].type).toBe('STALLED');
    expect(stalledSignals[0].severity).not.toBe(undefined);
    expect(freshSignals).toHaveLength(0);
  });

  // ── Test 2: Discount Anomaly ───────────────────────────────────────────────

  it('should detect discount anomalies deviating from historical average', async () => {
    // Seed historical approved quotes for the owner: avg 10% discount
    const hist1 = await makeQuotation({ status: 'approved', discount: 100, subtotal: 1000 });
    const hist2 = await makeQuotation({ status: 'approved', discount: 100, subtotal: 1000 });

    // Current draft with 50% discount (vs 10% avg — way above 20% relative deviation threshold)
    const anomalyId = await makeQuotation({ status: 'draft', discount: 500, subtotal: 1000 });

    // Current draft with 10% discount — should not flag
    const normalId = await makeQuotation({ status: 'draft', discount: 100, subtotal: 1000 });

    const signals = await engine.detectDiscountAnomalies();
    const anomalySignals = signals.filter((s) => s.quotationId === anomalyId);
    const normalSignals = signals.filter((s) => s.quotationId === normalId);

    expect(anomalySignals.length).toBeGreaterThan(0);
    expect(anomalySignals[0].type).toBe('DISCOUNT_ANOMALY');
    expect(normalSignals).toHaveLength(0);
  });

  // ── Test 3: Excessive Negotiation ─────────────────────────────────────────

  it('should detect excessive negotiation cycles', async () => {
    const excessiveId = await makeQuotation({ status: 'under_negotiation' });
    const normalId = await makeQuotation({ status: 'under_negotiation' });

    // Insert 4 messages (above threshold of 3)
    for (let i = 0; i < 4; i++) {
      await db.insert(negotiationThreads).values({
        quotationId: excessiveId,
        message: `Message ${i}`,
      });
    }
    // Normal quote: only 1 message
    await db.insert(negotiationThreads).values({
      quotationId: normalId,
      message: 'Hello',
    });

    const signals = await engine.detectExcessiveNegotiation();
    const excessiveSignals = signals.filter((s) => s.quotationId === excessiveId);
    const normalSignals = signals.filter((s) => s.quotationId === normalId);

    expect(excessiveSignals).toHaveLength(1);
    expect(excessiveSignals[0].type).toBe('EXCESSIVE_NEGOTIATION');
    expect(normalSignals).toHaveLength(0);
  });

  // ── Test 4: Deduplication via scan() ──────────────────────────────────────

  it('scan() should not insert duplicate alerts for the same open quotation+type', async () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const dedupId = await makeQuotation({ status: 'draft', lastActivityAt: twoHoursAgo });

    // First scan — should insert 1 STALLED alert
    const first = await engine.scan();
    const dedupAlertsAfterFirst = await db
      .select()
      .from(dealHealthAlerts)
      .where(eq(dealHealthAlerts.quotationId, dedupId));
    const stalledAlertsCount = dedupAlertsAfterFirst.filter((a) => a.type === 'STALLED').length;
    expect(stalledAlertsCount).toBe(1);

    // Second scan — should skip the duplicate (dedup)
    const second = await engine.scan();
    const dedupAlertsAfterSecond = await db
      .select()
      .from(dealHealthAlerts)
      .where(eq(dealHealthAlerts.quotationId, dedupId));
    const stalledAfterSecond = dedupAlertsAfterSecond.filter((a) => a.type === 'STALLED').length;

    expect(stalledAfterSecond).toBe(1); // Still just 1, not 2
    expect(second.skipped).toBeGreaterThanOrEqual(1);
  });

  it('should create a nudge notification when a deal-health alert is actioned', async () => {
    const alertQuoteId = await makeQuotation({ status: 'draft', lastActivityAt: new Date(Date.now() - 3 * 60 * 60 * 1000) });
    const [alert] = await db.insert(dealHealthAlerts).values({
      quotationId: alertQuoteId,
      type: 'STALLED',
      severity: 'high',
      score: 80,
      reason: 'No activity for 3 hours',
    }).returning();

    const req: any = {
      params: { id: alert.id },
      user: { id: ownerId, role: 'sales_manager' },
    };
    const res: any = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    await nudgeAlert(req, res, jest.fn());

    expect(res.status).not.toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: expect.stringContaining('nudge'),
    }));
  });
});
