import { ApprovalsRepository } from './approvals.repository.js';

export const ApprovalsService = {
  getApprovalQueue: async (userId: string, userRole: string) => {
    return await ApprovalsRepository.getQueue(userId, userRole);
  },

  getApprovalDetail: async (quotationId: string, userId: string, userRole: string) => {
    return await ApprovalsRepository.getDetailById(quotationId, userId, userRole);
  },
};