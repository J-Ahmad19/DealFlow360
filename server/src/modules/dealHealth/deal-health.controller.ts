import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { db } from '../../db/client.js';
import { dealHealthAlerts } from '../../db/schema/dealflow.js';
import { and, count, desc, eq } from 'drizzle-orm';
import { AuditService } from '../../core/audit/audit.service.js';
import { AuditAction } from '../../core/audit/audit.types.js';
import { withCache, invalidatePattern } from '../../core/cache/redis.client.js';
import { CacheKey, TTL } from '../../core/cache/cache.keys.js';

// ─── GET /deal-health ─────────────────────────────────────────────────────────
// Summary grouped by severity (cached via Redis, 2m TTL)

export async function getSummary(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const cacheKey = CacheKey.dashboardHealth('global');

    const data = await withCache(cacheKey, TTL.DASHBOARD, async () => {
      const summary = await db
        .select({
          severity: dealHealthAlerts.severity,
          total: count(dealHealthAlerts.id),
        })
        .from(dealHealthAlerts)
        .where(eq(dealHealthAlerts.unresolved, true))
        .groupBy(dealHealthAlerts.severity);

      const openTotal = summary.reduce((s, r) => s + r.total, 0);
      return { openTotal, bySeverity: summary };
    });

    res.json({ data });
  } catch (err) {
    next(err);
  }
}

// ─── GET /deal-health/alerts ──────────────────────────────────────────────────
// Filterable list of open alerts

const AlertQuerySchema = z.object({
  type: z.string().optional(),
  severity: z.string().optional(),
  quotationId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export async function getAlerts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { type, severity, quotationId, page, limit } = AlertQuerySchema.parse(req.query);
    const offset = (page - 1) * limit;

    const conditions = [eq(dealHealthAlerts.unresolved, true)];
    if (type) conditions.push(eq(dealHealthAlerts.type, type as any));
    if (severity) conditions.push(eq(dealHealthAlerts.severity, severity as any));
    if (quotationId) conditions.push(eq(dealHealthAlerts.quotationId, quotationId));

    const alerts = await db
      .select()
      .from(dealHealthAlerts)
      .where(and(...conditions))
      .orderBy(desc(dealHealthAlerts.score), desc(dealHealthAlerts.createdAt))
      .limit(limit)
      .offset(offset);

    res.json({ data: alerts, page, limit });
  } catch (err) {
    next(err);
  }
}

// ─── POST /deal-health/:id/escalate ──────────────────────────────────────────
// Escalate alert to critical severity

export async function escalateAlert(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const actorId = (req as any).user?.id;

    const [updated] = await db
      .update(dealHealthAlerts)
      .set({ severity: 'critical' })
      .where(eq(dealHealthAlerts.id, id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: 'Alert not found' });
      return;
    }

    // Invalidate dashboard health cache on escalation
    await invalidatePattern('dealflow:dashboard:health:*');

    // Audit the escalation
    if (actorId) {
      await AuditService.log({
        actorId,
        entityType: 'deal',
        entityId: updated.quotationId,
        action: AuditAction.DEAL_HEALTH_ESCALATED,
        before: { severity: 'high' },
        after: { severity: 'critical' },
        ...AuditService.fromRequest(req),
      });
    }

    res.json({ data: updated, message: 'Alert escalated to critical' });
  } catch (err) {
    next(err);
  }
}
