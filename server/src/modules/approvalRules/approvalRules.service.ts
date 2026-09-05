import { ApprovalRulesRepository } from './approvalRules.repository.js';
import { CreateApprovalRuleDto, UpdateApprovalRuleDto } from './approvalRules.types.js';
import { NotFoundError } from '../../core/errors/AppError.js';
import { db } from '../../db/client.js';
import { auditLogs } from '../../db/schema/dealflow.js';

export const ApprovalRulesService = {
  createRule: async (data: CreateApprovalRuleDto, actorId: string) => {
    return ApprovalRulesRepository.createRule(data);
  },

  listRules: async () => {
    return ApprovalRulesRepository.listRules();
  },

  getRule: async (id: string) => {
    const rule = await ApprovalRulesRepository.getRuleById(id);
    if (!rule) throw new NotFoundError('Approval rule not found');
    return rule;
  },

  updateRule: async (id: string, data: UpdateApprovalRuleDto, actorId: string) => {
    const rule = await ApprovalRulesRepository.updateRule(id, data);
    if (!rule) throw new NotFoundError('Approval rule not found');
    return rule;
  },
};
