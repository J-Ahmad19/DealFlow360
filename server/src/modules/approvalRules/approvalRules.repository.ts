import { db } from '../../db/client.js';
import { approvalRules } from '../../db/schema/dealflow.js';
import { eq } from 'drizzle-orm';
import { CreateApprovalRuleDto, UpdateApprovalRuleDto } from './approvalRules.types.js';
import { ApprovalRoutingEngine } from '../approvals/approval.engine.js';

export const ApprovalRulesRepository = {
  createRule: async (data: CreateApprovalRuleDto) => {
    const [rule] = await db.insert(approvalRules).values(data).returning();
    await ApprovalRoutingEngine.invalidateCache();
    return rule;
  },

  listRules: async () => {
    return db.query.approvalRules.findMany({
      orderBy: (rules, { asc }) => [asc(rules.sequence)],
    });
  },

  getRuleById: async (id: string) => {
    return db.query.approvalRules.findFirst({
      where: eq(approvalRules.id, id),
    });
  },

  updateRule: async (id: string, data: UpdateApprovalRuleDto) => {
    const [rule] = await db
      .update(approvalRules)
      .set(data)
      .where(eq(approvalRules.id, id))
      .returning();
    await ApprovalRoutingEngine.invalidateCache();
    return rule;
  },
};
