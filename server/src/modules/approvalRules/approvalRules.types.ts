import { z } from 'zod';

export const createApprovalRuleSchema = z.object({
  minRisk: z.number().int().min(0).optional(),
  maxRisk: z.number().int().min(0),
  approverRole: z.enum(['admin', 'sales_manager', 'finance', 'sales_rep']),
  sequence: z.number().int().min(1),
});

export const updateApprovalRuleSchema = createApprovalRuleSchema.partial();

export type CreateApprovalRuleDto = z.infer<typeof createApprovalRuleSchema>;
export type UpdateApprovalRuleDto = z.infer<typeof updateApprovalRuleSchema>;
