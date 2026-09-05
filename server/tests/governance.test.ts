import { jest } from '@jest/globals';
import { db } from '../src/db/client.js';
import { 
  customerTiers, 
  productCategories, 
  discountPolicies, 
  companies, 
  approvalRules 
} from '../src/db/schema/dealflow.js';
import { eq } from 'drizzle-orm';
import { DiscountPolicyRepository } from '../src/modules/discounts/discount.repository.js';
import { DiscountEngine } from '../src/modules/discounts/discount.engine.js';
import { ApprovalRoutingEngine } from '../src/modules/approvals/approval.engine.js';
import { randomUUID } from 'node:crypto';

describe('Discount Governance Engine', () => {
  let tierId: string;
  let categoryHardwareId: string;
  let categoryServicesId: string;
  let customerId: string;
  
  const discountRepo = new DiscountPolicyRepository();
  const discountEngine = new DiscountEngine(discountRepo);
  const approvalEngine = new ApprovalRoutingEngine();

  beforeAll(async () => {
    // 1. Setup Tier
    tierId = randomUUID();
    await db.insert(customerTiers).values({
      id: tierId,
      name: 'Gold',
    });

    // 2. Setup Categories
    categoryHardwareId = randomUUID();
    await db.insert(productCategories).values({
      id: categoryHardwareId,
      name: 'Hardware',
    });

    categoryServicesId = randomUUID();
    await db.insert(productCategories).values({
      id: categoryServicesId,
      name: 'Services',
    });

    // 3. Setup Discount Policies
    // Base Gold Tier Limit = 15%
    await db.insert(discountPolicies).values({
      tierId,
      discountPercent: 15,
    });
    // Category Limit: Hardware = 15% (same as base)
    await db.insert(discountPolicies).values({
      tierId,
      categoryId: categoryHardwareId,
      discountPercent: 15,
    });
    // Category Limit: Services = 10%
    await db.insert(discountPolicies).values({
      tierId,
      categoryId: categoryServicesId,
      discountPercent: 10,
    });

    // 4. Setup Customer
    customerId = randomUUID();
    await db.insert(companies).values({
      id: customerId,
      name: 'Acme Corp',
      tierId,
    });

    // 5. Setup Approval Rules
    await db.insert(approvalRules).values([
      { minRisk: 21, maxRisk: 50, approverRole: 'sales_manager', sequence: 1 }, // Medium risk
      { minRisk: 51, maxRisk: 1000, approverRole: 'sales_manager', sequence: 1 }, // High risk
      { minRisk: 51, maxRisk: 1000, approverRole: 'finance', sequence: 2 },       // High risk
    ]);
  });

  afterAll(async () => {
    // Cleanup
    await db.delete(approvalRules);
    await db.delete(companies).where(eq(companies.id, customerId));
    await db.delete(discountPolicies).where(eq(discountPolicies.tierId, tierId));
    await db.delete(productCategories).where(eq(productCategories.id, categoryHardwareId));
    await db.delete(productCategories).where(eq(productCategories.id, categoryServicesId));
    await db.delete(customerTiers).where(eq(customerTiers.id, tierId));
  });

  describe('DiscountEngine & RiskCalculator', () => {
    it('should return low risk for discount inside limit', async () => {
      const result = await discountEngine.evaluateQuotation({
        customerId,
        lines: [
          { id: '1', categoryId: categoryHardwareId, unitPrice: 10000, quantity: 1, discountPercent: 10, marginPercent: 30 }
        ]
      });

      expect(result.riskScore).toBe(0);
      expect(result.riskLevel).toBe('low');
      expect(result.reasons).toContain('Quotation is within safe limits.');
    });

    it('should return medium risk for category-specific violation', async () => {
      // Services has a 10% limit. We give 15% discount.
      // Excess is 5%. Risk score = 5 * 5 = 25.
      const result = await discountEngine.evaluateQuotation({
        customerId,
        lines: [
          { id: '2', categoryId: categoryServicesId, unitPrice: 10000, quantity: 1, discountPercent: 15, marginPercent: 30 }
        ]
      });

      expect(result.riskScore).toBe(25);
      expect(result.riskLevel).toBe('medium');
      expect(result.reasons[0]).toMatch(/exceeds allowed discount by 5%/);
    });

    it('should calculate multiple minor violations', async () => {
      // Hardware: limit 15, actual 17 (excess 2 -> 10 pts)
      // Services: limit 10, actual 12 (excess 2 -> 10 pts)
      // Low Margin: 18% (deficit 2 -> 4 pts)
      // Total risk: 24 (medium)
      const result = await discountEngine.evaluateQuotation({
        customerId,
        lines: [
          { id: '3', categoryId: categoryHardwareId, unitPrice: 10000, quantity: 1, discountPercent: 17, marginPercent: 30 },
          { id: '4', categoryId: categoryServicesId, unitPrice: 10000, quantity: 1, discountPercent: 12, marginPercent: 18 },
        ]
      });

      expect(result.riskScore).toBe(24);
      expect(result.riskLevel).toBe('medium');
    });

    it('should return high risk for high-risk quotation', async () => {
      // Hardware: limit 15, actual 30 (excess 15 -> 75 pts)
      const result = await discountEngine.evaluateQuotation({
        customerId,
        lines: [
          { id: '5', categoryId: categoryHardwareId, unitPrice: 10000, quantity: 1, discountPercent: 30, marginPercent: 5 }
        ]
      });

      // Margin deficit: 15 * 2 = 30 pts. Total = 105 pts.
      expect(result.riskScore).toBe(105);
      expect(result.riskLevel).toBe('high');
    });
  });

  describe('ApprovalRoutingEngine', () => {
    it('should return empty (auto approval) for low risk (score 10)', async () => {
      const routes = await approvalEngine.getApprovalRouting(10);
      expect(routes.length).toBe(0);
    });

    it('should return manager-only approval for medium risk (score 30)', async () => {
      const routes = await approvalEngine.getApprovalRouting(30);
      expect(routes.length).toBe(1);
      expect(routes[0].approverRole).toBe('sales_manager');
    });

    it('should return manager + finance approval for high risk (score 70)', async () => {
      const routes = await approvalEngine.getApprovalRouting(70);
      expect(routes.length).toBe(2);
      expect(routes[0].approverRole).toBe('sales_manager');
      expect(routes[1].approverRole).toBe('finance');
    });
  });
});
