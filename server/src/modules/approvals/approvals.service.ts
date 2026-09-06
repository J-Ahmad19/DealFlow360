import { eq, and, asc } from 'drizzle-orm';
import { db } from '../../db/client.js';
import { approvals } from '../../db/schema/dealflow.js';
import { ApprovalsRepository } from './approvals.repository.js';
import { QuotationsService } from '../quotations/quotations.service.js';
import { AuditService } from '../../core/audit/audit.service.js';
import { AuditAction } from '../../core/audit/audit.types.js';

export const ApprovalsService = {
  getApprovalQueue: async (userId: string, userRole: string) => {
    return await ApprovalsRepository.getQueue(userId, userRole);
  },

  getApprovalDetail: async (quotationId: string, userId: string, userRole: string) => {
    return await ApprovalsRepository.getDetailById(quotationId, userId, userRole);
  },

  action: async (quotationId: string, actorId: string, actorRole: string, action: 'approve' | 'reject' | 'revise', note?: string) => {
    const quotation = await QuotationsService.getQuotation(quotationId);
    if (!quotation) throw new Error('Approval request not found');

    // 1. Fetch the active approval steps for this quotation
    const pendingApprovals = await db
      .select()
      .from(approvals)
      .where(
        and(
          eq(approvals.quotationId, quotationId),
          eq(approvals.status, 'pending')
        )
      )
      .orderBy(asc(approvals.sequence));

    const currentApproval = pendingApprovals[0];
    let nextQuotationStatus = quotation.status;

    // 2. Process the individual approval step if it exists
    if (currentApproval) {
      const approvalStatus = action === 'approve' ? 'approved' : 'rejected';
      
      await db
        .update(approvals)
        .set({ status: approvalStatus as any })
        .where(eq(approvals.id, currentApproval.id));

      if (action === 'reject') {
        nextQuotationStatus = 'rejected';
      } else if (action === 'revise') {
        nextQuotationStatus = 'revision_required';
      } else if (action === 'approve') {
        // If more steps remain (e.g. Finance), keep the master quote in pending_approval
        if (pendingApprovals.length > 1) {
          nextQuotationStatus = 'pending_approval';
        } else {
          nextQuotationStatus = 'approved'; 
        }
      }
    } else {
       // 3. GHOST APPROVAL FALLBACK:
       // The quote is pending_approval but has no rows in the approvals table.
       // Apply the action directly to the master quote to unblock the deal.
       if (action === 'approve') nextQuotationStatus = 'approved';
       if (action === 'reject') nextQuotationStatus = 'rejected';
       if (action === 'revise') nextQuotationStatus = 'revision_required';
    }

    // 4. Trigger quotation status change if necessary
    let result = quotation;
    if (nextQuotationStatus !== quotation.status) {
      result = await QuotationsService.changeStatus(
        quotationId, 
        nextQuotationStatus, 
        actorId, 
        note || `Reviewed by ${actorRole}`
      );
    }

    // 5. Audit the action
    await AuditService.log({
      actorId,
      entityType: 'quotation',
      entityId: quotationId,
      action: action === 'approve'
        ? AuditAction.APPROVAL_APPROVED
        : action === 'reject'
          ? AuditAction.APPROVAL_REJECTED
          : AuditAction.APPROVAL_REVISION_REQUESTED,
      reason: note || `Approval action: ${action}`,
      before: { status: quotation.status },
      after: { status: nextQuotationStatus },
    });

    return {
      quotationId,
      action,
      status: nextQuotationStatus,
      message: `Approval ${action} recorded successfully.`,
      quotation: result,
    };
  },
};