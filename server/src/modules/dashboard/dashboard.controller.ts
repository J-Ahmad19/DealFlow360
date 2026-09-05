import { Request, Response } from 'express';
import { db } from '../../db/client.js';
import { quotations, dealHealthAlerts, approvals } from '../../db/schema/dealflow.js';
import { eq, inArray, sql } from 'drizzle-orm';

export const DashboardController = {
  getStats: async (req: Request, res: Response) => {
    try {
      const actorId = (req as any).user.id;
      const role = (req as any).user.role;

      // 1. Open Quotations (Draft, Pending Approval, Under Negotiation, Revision Required)
      const openQuotationsQuery = await db
        .select({ count: sql<number>`count(*)` })
        .from(quotations)
        .where(inArray(quotations.status, ['draft', 'pending_approval', 'under_negotiation', 'revision_required']));
      
      const openQuotations = openQuotationsQuery[0]?.count || 0;

      // 2. Pending Approvals
      const pendingApprovalsQuery = await db
        .select({ count: sql<number>`count(*)` })
        .from(approvals)
        .where(eq(approvals.status, 'pending'));

      const pendingApprovals = pendingApprovalsQuery[0]?.count || 0;

      // 3. At-Risk Deals (Unresolved Health Alerts)
      const atRiskQuery = await db
        .select({ count: sql<number>`count(*)` })
        .from(dealHealthAlerts)
        .where(eq(dealHealthAlerts.unresolved, true));

      const atRiskDeals = atRiskQuery[0]?.count || 0;

      // 4. Recent Activity (Mocked for now, or we can fetch recent audit logs)
      const recentActivity = [
        '- Acme Corp quotation approved by Finance',
        '- Beta Industries requested a discount change',
        '- East Depot stock updated for Order #2291',
      ];

      res.json({
        openQuotations: Number(openQuotations),
        pendingApprovals: Number(pendingApprovals),
        atRiskDeals: Number(atRiskDeals),
        recentActivity,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },
};
