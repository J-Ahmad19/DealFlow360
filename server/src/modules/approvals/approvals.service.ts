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

    const statusMap = {
      approve: 'approved',
      reject: 'rejected',
      revise: 'revision_required',
    } as const;

    const nextStatus = statusMap[action];
    const result = await QuotationsService.changeStatus(quotationId, nextStatus, actorId, note || `Reviewed by ${actorRole}`);

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
      after: { status: nextStatus },
    });

    return {
      quotationId,
      action,
      status: nextStatus,
      message: `Approval ${action} recorded successfully.`,
      quotation: result,
    };
  },
};