import { Request, Response, NextFunction } from 'express';
import { ApprovalRulesService } from './approvalRules.service.js';
import { sendSuccess } from '../../core/http/response.js';
import { createApprovalRuleSchema, updateApprovalRuleSchema } from './approvalRules.types.js';

export const ApprovalRulesController = {
  createRule: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = createApprovalRuleSchema.parse(req.body);
      const rule = await ApprovalRulesService.createRule(data, req.user!.id);
      sendSuccess(res, rule, 201);
    } catch (err) {
      next(err);
    }
  },

  listRules: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const rules = await ApprovalRulesService.listRules();
      sendSuccess(res, rules);
    } catch (err) {
      next(err);
    }
  },

  getRule: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const rule = await ApprovalRulesService.getRule(req.params.id);
      sendSuccess(res, rule);
    } catch (err) {
      next(err);
    }
  },

  updateRule: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = updateApprovalRuleSchema.parse(req.body);
      const rule = await ApprovalRulesService.updateRule(req.params.id, data, req.user!.id);
      sendSuccess(res, rule);
    } catch (err) {
      next(err);
    }
  },
};
