import { db } from '../../db/client.js';
import { quotations, quotationLines, negotiationThreads, products, approvals } from '../../db/schema/dealflow.js';
import { eq, inArray } from 'drizzle-orm';
import { CustomerContext, CustomerPolicy } from '../../core/authz/policies/customer.policy.js';
import { DiscountEngine } from '../discounts/discount.engine.js';
import { ApprovalRoutingEngine } from '../approvals/approval.engine.js';
import { UnauthorizedError } from '../../core/errors/AppError.js';
import { AuditService } from '../../core/audit/audit.service.js';
import { AuditAction } from '../../core/audit/audit.types.js';

export class PortalService {
  constructor(
    private discountEngine: DiscountEngine,
    private approvalEngine: ApprovalRoutingEngine
  ) {}

  async getPortalQuotation(customerCtx: CustomerContext, quotationId: string) {
    const canView = await CustomerPolicy.canViewQuotation(customerCtx, quotationId);
    if (!canView) throw new UnauthorizedError('Not authorized to view this quotation');

    const [quotation] = await db.select().from(quotations).where(eq(quotations.id, quotationId));
    const lines = await db.select().from(quotationLines).where(eq(quotationLines.quotationId, quotationId));
    const threads = await db.select().from(negotiationThreads).where(eq(negotiationThreads.quotationId, quotationId));

    // Strip internal fields
    const { margin, riskScore, ownerId, ...safeQuotation } = quotation;
    const safeLines = lines.map(({ subtotal, total, quantity, unitPrice, discount, taxRate, productNameSnapshot, id, productId }) => ({
      id, productId, productNameSnapshot, unitPrice, quantity, discount, taxRate, subtotal, total
    }));

    return { quotation: safeQuotation, lines: safeLines, threads };
  }

  async addMessage(customerCtx: CustomerContext, quotationId: string, message: string) {
    const canView = await CustomerPolicy.canViewQuotation(customerCtx, quotationId);
    if (!canView) throw new UnauthorizedError('Not authorized');

    const [thread] = await db.insert(negotiationThreads).values({
      quotationId,
      message: `[Customer]: ${message}`
    }).returning();

    await AuditService.log({
      actorId: customerCtx.contactId,
      entityType: 'quotation',
      entityId: quotationId,
      action: AuditAction.PORTAL_MESSAGE_ADDED,
    });
    return thread;
  }

  async confirm(customerCtx: CustomerContext, quotationId: string) {
    const canView = await CustomerPolicy.canViewQuotation(customerCtx, quotationId);
    if (!canView) throw new UnauthorizedError('Not authorized');

    const [updated] = await db.update(quotations)
      .set({ status: 'confirmed' })
      .where(eq(quotations.id, quotationId))
      .returning();

    await AuditService.log({
      actorId: customerCtx.contactId,
      entityType: 'quotation',
      entityId: quotationId,
      action: AuditAction.PORTAL_QUOTATION_CONFIRMED,
      after: { status: 'confirmed' },
    });
    return updated;
  }

  async counterOffer(customerCtx: CustomerContext, quotationId: string, modifications: { lineId: string, discount: number }[]) {
    return await db.transaction(async (tx) => {
      const canView = await CustomerPolicy.canViewQuotation(customerCtx, quotationId);
      if (!canView) throw new UnauthorizedError('Not authorized');

      const [quotation] = await tx.select().from(quotations).where(eq(quotations.id, quotationId));
      if (!quotation) throw new Error('Quotation not found');

      const lines = await tx.select().from(quotationLines).where(eq(quotationLines.quotationId, quotationId));
      
      const productIds = lines.map(l => l.productId);
      const prods = await tx.select().from(products).where(inArray(products.id, productIds));
      const productMap = new Map(prods.map(p => [p.id, p]));

      // 1. Update lines
      let totalDiscount = 0;
      let totalSubtotal = 0;
      let totalMarginValue = 0;

      const evalLines = lines.map(line => {
        const mod = modifications.find(m => m.lineId === line.id);
        const p = productMap.get(line.productId)!;
        
        let newDiscount = mod ? mod.discount : line.discount;
        // recalculate
        const subtotal = line.quantity * line.unitPrice;
        const discountAmount = Math.floor((subtotal * newDiscount) / 100);
        const total = subtotal - discountAmount + Math.floor((subtotal * line.taxRate) / 100);
        
        // margin = (price - cost) / price
        const effectiveUnitPrice = line.unitPrice * (1 - newDiscount / 100);
        const marginPercent = effectiveUnitPrice > 0 
            ? ((effectiveUnitPrice - p.cost) / effectiveUnitPrice) * 100 
            : 0;

        totalSubtotal += subtotal;
        totalDiscount += discountAmount;
        totalMarginValue += (effectiveUnitPrice - p.cost) * line.quantity;

        // update DB line
        tx.update(quotationLines)
          .set({ discount: newDiscount, subtotal, total })
          .where(eq(quotationLines.id, line.id))
          .execute(); // run in background of transaction

        return {
          id: line.id,
          categoryId: p.categoryId,
          unitPrice: line.unitPrice,
          quantity: line.quantity,
          discountPercent: newDiscount,
          marginPercent: marginPercent
        };
      });

      const overallMargin = totalSubtotal > 0 ? (totalMarginValue / totalSubtotal) * 100 : 0;

      // 2. Re-run engines
      const riskResult = await this.discountEngine.evaluateQuotation({
        customerId: quotation.customerId!,
        lines: evalLines
      });

      const requiredApprovals = await this.approvalEngine.getApprovalRouting(riskResult.riskScore);

      // 3. Update Quotation Status
      let newStatus: any = 'approved';
      if (requiredApprovals.length > 0) {
        newStatus = 'pending_approval';
        
        // Insert new approvals
        await tx.delete(approvals).where(eq(approvals.quotationId, quotationId));
        await tx.insert(approvals).values(
          requiredApprovals.map(r => ({
            quotationId,
            approverRole: r.approverRole,
            sequence: r.sequence,
            riskScore: riskResult.riskScore,
            status: 'pending'
          }))
        );
      }

      await tx.update(quotations)
        .set({ 
          subtotal: totalSubtotal,
          discount: totalDiscount,
          margin: Math.floor(overallMargin),
          riskScore: riskResult.riskScore,
          status: newStatus
        })
        .where(eq(quotations.id, quotationId));

      await AuditService.log({
        actorId: customerCtx.contactId,
        entityType: 'quotation',
        entityId: quotationId,
        action: AuditAction.PORTAL_COUNTER_OFFER,
        reason: `Counter-offer submitted. New status: ${newStatus}`,
        before: { status: quotation.status, riskScore: quotation.riskScore },
        after: { status: newStatus, riskScore: riskResult.riskScore },
      });

      return { status: newStatus };
    });
  }

}
