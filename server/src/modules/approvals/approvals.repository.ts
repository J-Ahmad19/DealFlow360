import { desc, eq, and, inArray } from 'drizzle-orm';
import { db } from '../../db/client.js';
import { quotations, companies, users, quotationLines, approvals } from '../../db/schema/dealflow.js';

const DEMO_QUEUE_STATUSES = [
  'draft',
  'pending_approval',
  'under_negotiation',
  'approved',
  'revision_required',
  'rejected',
  'confirmed',
  'fulfillment'
] as const;

export function normalizeQueueStatus(status: string | null | undefined): string {
  const value = String(status ?? '').trim();
  if (!value) return 'pending_approval';

  switch (value) {
    case 'pending':
      return 'pending_approval';
    case 'approved':
      return 'approved';
    case 'rejected':
      return 'rejected';
    default:
      return value;
  }
}

export const ApprovalsRepository = {
  getQueue: async (userId: string, userRole: string) => {
    
    // We select approverRole directly from the approvals table
    const rawRows = await db
      .select({
        id: quotations.id,
        status: quotations.status,
        riskScore: quotations.riskScore,
        updatedAt: quotations.updatedAt,
        ownerId: quotations.ownerId,
        customerName: companies.name,
        ownerName: users.fullName,
        approverRole: approvals.approverRole, // <--- This powers our new UI logic
        approvalStatus: approvals.status,
        approvalCreatedAt: approvals.createdAt,
      })
      .from(quotations)
      .leftJoin(companies, eq(quotations.customerId, companies.id))
      .leftJoin(users, eq(quotations.ownerId, users.id))
      .leftJoin(approvals, eq(approvals.quotationId, quotations.id))
      .where(
        userRole === 'sales_rep' || userRole === 'admin'
          ? inArray(quotations.status, [...DEMO_QUEUE_STATUSES])
          : and(
              eq(approvals.approverRole, userRole as any),
              eq(approvals.status, 'pending')
            )
      )
      .orderBy(desc(quotations.updatedAt));

    const uniqueQuotations = new Map();

    for (const row of rawRows) {
      const existing = uniqueQuotations.get(row.id);
      
      if (!existing || (row.approvalCreatedAt && existing.approvalCreatedAt && row.approvalCreatedAt > existing.approvalCreatedAt)) {
        uniqueQuotations.set(row.id, {
          ...row,
          status: normalizeQueueStatus(row.status),
          approvalStatus: row.approvalStatus ? normalizeQueueStatus(row.approvalStatus) : null,
        });
      }
    }

    return Array.from(uniqueQuotations.values());
  },

  getDetailById: async (quotationId: string, userId?: string, userRole?: string) => {
    const baseQuery = db
      .select({
        quotation: quotations,
        customerName: companies.name,
        ownerName: users.fullName,
      })
      .from(quotations)
      .leftJoin(companies, eq(quotations.customerId, companies.id))
      .leftJoin(users, eq(quotations.ownerId, users.id));

    const query = baseQuery.where(eq(quotations.id, quotationId));

    const q = await query.limit(1);

    if (!q || q.length === 0) return null;

    const lines = await db.query.quotationLines.findMany({
      where: eq(quotationLines.quotationId, quotationId),
    });

    return {
      ...q[0].quotation,
      customerName: q[0].customerName,
      ownerName: q[0].ownerName,
      lines,
    };
  },
};