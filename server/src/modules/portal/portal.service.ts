import { db } from '../../db/client.js';
import {
  quotations,
  quotationLines,
  negotiationThreads,
  products,
  approvals,
  dealHealthAlerts,
  notifications,
  users,
} from '../../db/schema/dealflow.js';
import { eq, inArray, count, and } from 'drizzle-orm';
import { CustomerContext, CustomerPolicy } from '../../core/authz/policies/customer.policy.js';
import { DiscountEngine } from '../discounts/discount.engine.js';
import { ApprovalRoutingEngine } from '../approvals/approval.engine.js';
import { UnauthorizedError } from '../../core/errors/AppError.js';
import { AuditService } from '../../core/audit/audit.service.js';
import { AuditAction } from '../../core/audit/audit.types.js';

async function resolveAuditActorId(
  executor: any,
  contactId: string,
  fallbackUserId?: string | null
): Promise<string> {
  try {
    const [user] = await executor
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, contactId))
      .limit(1);

    if (user) return user.id;
    if (fallbackUserId) return fallbackUserId;

    const [anyUser] = await executor.select({ id: users.id }).from(users).limit(1);
    return anyUser?.id || contactId;
  } catch {
    return fallbackUserId || contactId;
  }
}

export class PortalService {
  constructor(
    private discountEngine: DiscountEngine,
    private approvalEngine: ApprovalRoutingEngine
  ) {}

  async listCustomerQuotations(customerCtx: CustomerContext) {
    const rows = await db
      .select()
      .from(quotations)
      .where(eq(quotations.customerId, customerCtx.companyId));

    return rows.map((quotation) => ({
      id: quotation.id,
      title: quotation.title,
      amount: quotation.amount || quotation.subtotal || 0,
      status: quotation.status,
      customerId: quotation.customerId,
      lastActivityAt: quotation.lastActivityAt,
      createdAt: quotation.createdAt,
      updatedAt: quotation.updatedAt,
    }));
  }

  async getPortalQuotation(customerCtx: CustomerContext, quotationId: string) {
    const canView = await CustomerPolicy.canViewQuotation(customerCtx, quotationId);
    if (!canView) throw new UnauthorizedError('Not authorized to view this quotation');

    const [quotation] = await db.select().from(quotations).where(eq(quotations.id, quotationId));
    if (!quotation) throw new Error('Quotation not found');

    const lines = await db.select().from(quotationLines).where(eq(quotationLines.quotationId, quotationId));
    const threads = await db
      .select()
      .from(negotiationThreads)
      .where(eq(negotiationThreads.quotationId, quotationId))
      .orderBy(negotiationThreads.createdAt);

    // Strip internal fields (margin, riskScore, ownerId) to maintain customer isolation
    const { margin, riskScore, ownerId, ...safeQuotation } = quotation;
    const safeLines = lines.map(({ subtotal, total, quantity, unitPrice, discount, taxRate, productNameSnapshot, id, productId }) => ({
      id, productId, productNameSnapshot, unitPrice, quantity, discount, taxRate, subtotal, total
    }));

    return { quotation: safeQuotation, lines: safeLines, threads };
  }

  async addMessage(customerCtx: CustomerContext, quotationId: string, message: string) {
    const canView = await CustomerPolicy.canViewQuotation(customerCtx, quotationId);
    if (!canView) throw new UnauthorizedError('Not authorized');

    const [quotation] = await db.select().from(quotations).where(eq(quotations.id, quotationId));
    if (!quotation) throw new Error('Quotation not found');

    const [thread] = await db.insert(negotiationThreads).values({
      quotationId,
      message: `[Customer]: ${message.trim()}`
    }).returning();

    // Update last activity timestamp for Deal Health tracking
    await db.update(quotations).set({ lastActivityAt: new Date() }).where(eq(quotations.id, quotationId));

    if (quotation.ownerId) {
      await db.insert(notifications).values({
        recipientId: quotation.ownerId,
        type: 'PORTAL_MESSAGE_ADDED',
        title: 'New Customer Message',
        message: `Customer commented on "${quotation.title}": "${message.slice(0, 100)}"`,
      });
    }

    const actorId = await resolveAuditActorId(db, customerCtx.contactId, quotation.ownerId);
    await AuditService.log({
      actorId,
      entityType: 'quotation',
      entityId: quotationId,
      action: AuditAction.PORTAL_MESSAGE_ADDED,
      reason: message.slice(0, 200),
    });

    return thread;
  }

  async confirm(customerCtx: CustomerContext, quotationId: string, modifications: { lineId: string, discount: number }[] = []) {
    return await db.transaction(async (tx) => {
      const canView = await CustomerPolicy.canViewQuotation(customerCtx, quotationId);
      if (!canView) throw new UnauthorizedError('Not authorized');

      const [quotation] = await tx.select().from(quotations).where(eq(quotations.id, quotationId));
      if (!quotation) throw new Error('Quotation not found');

      const lines = await tx.select().from(quotationLines).where(eq(quotationLines.quotationId, quotationId));
      if (lines.length === 0) throw new Error('Quotation has no lines to confirm');

      const productIds = lines.map((line) => line.productId);
      const productsList = await tx.select().from(products).where(inArray(products.id, productIds));
      const productMap = new Map(productsList.map((product) => [product.id, product]));

      let totalSubtotal = 0;
      let totalDiscount = 0;
      let totalMarginValue = 0;

      const lineUpdates: Promise<any>[] = [];

      const evalLines = lines.map((line) => {
        const adjustment = modifications.find((item) => item.lineId === line.id);
        const product = productMap.get(line.productId)!;
        const newDiscount = adjustment ? adjustment.discount : line.discount;
        const subtotal = line.quantity * line.unitPrice;
        const discountAmount = Math.floor((subtotal * newDiscount) / 100);
        const total = subtotal - discountAmount + Math.floor((subtotal * (line.taxRate ?? 0)) / 100);

        totalSubtotal += subtotal;
        totalDiscount += discountAmount;

        const effectiveUnitPrice = line.unitPrice * (1 - newDiscount / 100);
        totalMarginValue += (effectiveUnitPrice - (product.cost ?? 0)) * line.quantity;

        lineUpdates.push(
          tx.update(quotationLines)
            .set({ discount: newDiscount, subtotal, total })
            .where(eq(quotationLines.id, line.id))
        );

        return {
          id: line.id,
          categoryId: product.categoryId,
          unitPrice: line.unitPrice,
          quantity: line.quantity,
          discountPercent: newDiscount,
          marginPercent: effectiveUnitPrice > 0 ? ((effectiveUnitPrice - (product.cost ?? 0)) / effectiveUnitPrice) * 100 : 0,
        };
      });

      await Promise.all(lineUpdates);

      const overallMargin = totalSubtotal > 0 ? (totalMarginValue / totalSubtotal) * 100 : 0;
      const riskResult = await this.discountEngine.evaluateQuotation({
        customerId: quotation.customerId!,
        lines: evalLines,
      });
      const requiredApprovals = await this.approvalEngine.getApprovalRouting(riskResult.riskScore);

      const nextStatus = requiredApprovals.length > 0 ? 'pending_approval' : 'fulfillment';

      if (requiredApprovals.length > 0) {
        await tx.delete(approvals).where(eq(approvals.quotationId, quotationId));
        await tx.insert(approvals).values(
          requiredApprovals.map((route) => ({
            quotationId,
            approverRole: route.approverRole,
            sequence: route.sequence,
            riskScore: riskResult.riskScore,
            status: 'pending' as const,
          }))
        );
      } else {
        await tx.delete(approvals).where(eq(approvals.quotationId, quotationId));
      }

      const [updated] = await tx.update(quotations)
        .set({
          subtotal: totalSubtotal,
          discount: totalDiscount,
          amount: totalSubtotal - totalDiscount,
          margin: Math.floor(overallMargin),
          riskScore: riskResult.riskScore,
          status: nextStatus,
          lastActivityAt: new Date(),
        })
        .where(eq(quotations.id, quotationId))
        .returning();

      const actorId = await resolveAuditActorId(tx, customerCtx.contactId, quotation.ownerId);
      await AuditService.log({
        actorId,
        entityType: 'quotation',
        entityId: quotationId,
        action: AuditAction.PORTAL_QUOTATION_CONFIRMED,
        reason: nextStatus === 'pending_approval' ? 'Customer confirmed final terms, approval required' : 'Customer confirmed final terms and moved to fulfillment',
        before: { status: quotation.status, riskScore: quotation.riskScore },
        after: { status: nextStatus, riskScore: riskResult.riskScore },
      });

      return { ...updated, status: nextStatus };
    });
  }

  async counterOffer(
    customerCtx: CustomerContext,
    quotationId: string,
    modifications: { lineId: string; discount: number }[],
    comment?: string
  ) {
    return await db.transaction(async (tx) => {
      const canView = await CustomerPolicy.canViewQuotation(customerCtx, quotationId);
      if (!canView) throw new UnauthorizedError('Not authorized');

      const [quotation] = await tx.select().from(quotations).where(eq(quotations.id, quotationId));
      if (!quotation) throw new Error('Quotation not found');

      // Disallow negotiation on terminal or locked states
      const lockedStatuses = ['confirmed', 'fulfillment', 'paid', 'rejected'];
      if (lockedStatuses.includes(quotation.status)) {
        throw new Error(`Quotation cannot be negotiated in '${quotation.status}' status`);
      }

      const lines = await tx.select().from(quotationLines).where(eq(quotationLines.quotationId, quotationId));
      if (lines.length === 0) throw new Error('Quotation has no lines to modify');

      const productIds = lines.map((l) => l.productId);
      const prods = await tx.select().from(products).where(inArray(products.id, productIds));
      const productMap = new Map(prods.map((p) => [p.id, p]));

      // 1. Recalculate line totals and update DB
      let totalDiscount = 0;
      let totalSubtotal = 0;
      let totalMarginValue = 0;

      const lineUpdates: Promise<any>[] = [];

      const evalLines = lines.map((line) => {
        const mod = modifications.find((m) => m.lineId === line.id);
        const p = productMap.get(line.productId);
        const cost = p?.cost ?? 0;

        const newDiscount = mod !== undefined ? Math.max(0, Math.min(100, mod.discount)) : line.discount;
        const subtotal = line.quantity * line.unitPrice;
        const discountAmount = Math.floor((subtotal * newDiscount) / 100);
        const taxAmount = Math.floor((subtotal * (line.taxRate ?? 0)) / 100);
        const total = subtotal - discountAmount + taxAmount;

        const effectiveUnitPrice = line.unitPrice * (1 - newDiscount / 100);
        const marginPercent =
          effectiveUnitPrice > 0
            ? ((effectiveUnitPrice - cost) / effectiveUnitPrice) * 100
            : 0;

        totalSubtotal += subtotal;
        totalDiscount += discountAmount;
        totalMarginValue += (effectiveUnitPrice - cost) * line.quantity;

        lineUpdates.push(
          tx
            .update(quotationLines)
            .set({ discount: newDiscount, subtotal, total })
            .where(eq(quotationLines.id, line.id))
        );

        return {
          id: line.id,
          categoryId: p?.categoryId ?? null,
          unitPrice: line.unitPrice,
          quantity: line.quantity,
          discountPercent: newDiscount,
          marginPercent,
        };
      });

      await Promise.all(lineUpdates);

      const overallMargin = totalSubtotal > 0 ? (totalMarginValue / totalSubtotal) * 100 : 0;

      // 2. Re-run business engines: Discount Governance & Approval State Machine
      const riskResult = await this.discountEngine.evaluateQuotation({
        customerId: quotation.customerId!,
        lines: evalLines,
      });

      const requiredApprovals = await this.approvalEngine.getApprovalRouting(riskResult.riskScore);

      // 3. Determine next Quotation Status
      // If risk thresholds exceeded, quote re-enters approval chain
      // If within limits, becomes 'approved' (auto-approved / ready to confirm)
      const newStatus = requiredApprovals.length > 0 ? 'pending_approval' : 'approved';

      // 4. Update approvals table accordingly
      await tx.delete(approvals).where(eq(approvals.quotationId, quotationId));
      if (requiredApprovals.length > 0) {
        await tx.insert(approvals).values(
          requiredApprovals.map((r) => ({
            quotationId,
            approverRole: r.approverRole,
            sequence: r.sequence,
            riskScore: riskResult.riskScore,
            status: 'pending' as const,
          }))
        );
      }

      // 5. Update Quotation record
      const [updatedQuotation] = await tx
        .update(quotations)
        .set({
          subtotal: totalSubtotal,
          discount: totalDiscount,
          amount: totalSubtotal - totalDiscount,
          margin: Math.floor(overallMargin),
          riskScore: riskResult.riskScore,
          status: newStatus,
          lastActivityAt: new Date(),
        })
        .where(eq(quotations.id, quotationId))
        .returning();

      // 6. Record Negotiation Thread message
      const threadMessage = comment?.trim()
        ? `[Customer Counter-Offer]: ${comment.trim()}`
        : `[Customer Counter-Offer]: Proposed new discount terms. Status: ${newStatus}.`;
      await tx.insert(negotiationThreads).values({
        quotationId,
        message: threadMessage,
      });

      // 7. Check Deal Health: Flag EXCESSIVE_NEGOTIATION if negotiation cycle threshold met
      const [threadCountResult] = await tx
        .select({ count: count(negotiationThreads.id) })
        .from(negotiationThreads)
        .where(eq(negotiationThreads.quotationId, quotationId));

      const threadCount = Number(threadCountResult?.count ?? 0);
      if (threadCount >= 5) {
        const [existingAlert] = await tx
          .select({ id: dealHealthAlerts.id })
          .from(dealHealthAlerts)
          .where(
            and(
              eq(dealHealthAlerts.quotationId, quotationId),
              eq(dealHealthAlerts.type, 'EXCESSIVE_NEGOTIATION'),
              eq(dealHealthAlerts.unresolved, true)
            )
          )
          .limit(1);

        if (!existingAlert) {
          await tx.insert(dealHealthAlerts).values({
            quotationId,
            type: 'EXCESSIVE_NEGOTIATION',
            severity: 'medium',
            score: 65,
            reason: `Quotation has reached ${threadCount} negotiation cycles`,
            unresolved: true,
          });
        }
      }

      // 8. Event-driven Notification to sales rep / quotation owner
      if (quotation.ownerId) {
        await tx.insert(notifications).values({
          recipientId: quotation.ownerId,
          type: 'CUSTOMER_COUNTER_OFFERED',
          title: 'Customer Counter-Offer Submitted',
          message: `Customer proposed new discount terms on "${quotation.title}". New status: ${newStatus}.${
            requiredApprovals.length > 0 ? ' Requires internal manager approval.' : ''
          }`,
        });
      }

      // 9. Immutable Audit Trail
      const auditActorId = await resolveAuditActorId(tx, customerCtx.contactId, quotation.ownerId);
      await AuditService.log({
        actorId: auditActorId,
        entityType: 'quotation',
        entityId: quotationId,
        action: AuditAction.PORTAL_COUNTER_OFFER,
        reason: comment ? `Counter-offer: "${comment.slice(0, 100)}". New status: ${newStatus}` : `Counter-offer submitted. Status: ${newStatus}`,
        before: { status: quotation.status, riskScore: quotation.riskScore, discount: quotation.discount },
        after: { status: newStatus, riskScore: riskResult.riskScore, discount: totalDiscount },
      });

      return {
        status: newStatus,
        riskScore: riskResult.riskScore,
        riskLevel: riskResult.riskLevel,
        requiresApproval: requiredApprovals.length > 0,
        reasons: riskResult.reasons,
        quotation: {
          id: updatedQuotation.id,
          title: updatedQuotation.title,
          amount: updatedQuotation.amount,
          subtotal: updatedQuotation.subtotal,
          discount: updatedQuotation.discount,
          status: newStatus,
          lastActivityAt: updatedQuotation.lastActivityAt,
        },
      };
    });
  }
}
