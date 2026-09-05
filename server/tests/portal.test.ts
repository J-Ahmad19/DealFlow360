import { randomUUID } from 'node:crypto';
import { db } from '../src/db/client.js';
import { 
  products, quotations, quotationLines, companies, approvalRules, approvals, auditLogs, users, customerTiers, discountPolicies
} from '../src/db/schema/dealflow.js';
import { eq } from 'drizzle-orm';
import { PortalService } from '../src/modules/portal/portal.service.js';
import { DiscountEngine } from '../src/modules/discounts/discount.engine.js';
import { ApprovalRoutingEngine } from '../src/modules/approvals/approval.engine.js';
import { DiscountPolicyRepository } from '../src/modules/discounts/discount.repository.js';
import { CustomerContext } from '../src/core/authz/policies/customer.policy.js';

describe('Customer Negotiation Portal', () => {
  let customerId: string;
  let otherCustomerId: string;
  let productId: string;
  let quotationId: string;
  let lineId: string;
  let contactId: string;
  let tierId: string;
  let policyId: string;
  
  let portalService: PortalService;
  
  beforeAll(async () => {
    const discountRepo = new DiscountPolicyRepository();
    const discountEngine = new DiscountEngine(discountRepo);
    const approvalEngine = new ApprovalRoutingEngine();
    portalService = new PortalService(discountEngine, approvalEngine);

    tierId = randomUUID();
    await db.insert(customerTiers).values({
      id: tierId,
      name: 'Standard',
      description: 'Standard Tier'
    });

    policyId = randomUUID();
    await db.insert(discountPolicies).values({
      id: policyId,
      tierId,
      discountPercent: 10,
    });

    customerId = randomUUID();
    otherCustomerId = randomUUID();
    await db.insert(companies).values([
      { id: customerId, name: 'Portal Test Corp', tierId },
      { id: otherCustomerId, name: 'Other Corp', tierId }
    ]);

    contactId = randomUUID();
    await db.insert(users).values({
      id: contactId,
      email: 'contact@portaltest.com',
      fullName: 'Portal Contact',
      role: 'sales_rep', // arbitrary
    });

    productId = randomUUID();
    // high margin to avoid margin risk natively: price 1000, cost 100
    await db.insert(products).values({ 
      id: productId, name: 'Portal Product', price: 1000, cost: 100
    });

    // Create Approval Rules for testing (if risk > 10, needs approval)
    await db.insert(approvalRules).values({
      minRisk: 11,
      maxRisk: 1000,
      approverRole: 'sales_manager',
      sequence: 1
    });

    quotationId = randomUUID();
    await db.insert(quotations).values({ 
      id: quotationId, title: 'Portal Quote', customerId, status: 'draft',
      subtotal: 1000, total: 1000, riskScore: 0, margin: 90
    });
    
    lineId = randomUUID();
    await db.insert(quotationLines).values({
      id: lineId, quotationId, productId, productNameSnapshot: 'Product', 
      unitPrice: 1000, quantity: 1, subtotal: 1000, total: 1000, discount: 0
    });
  });

  afterAll(async () => {
    // Cleanup
    await db.delete(auditLogs).where(eq(auditLogs.entityId, quotationId));
    await db.delete(approvals).where(eq(approvals.quotationId, quotationId));
    await db.delete(quotationLines).where(eq(quotationLines.quotationId, quotationId));
    await db.delete(quotations).where(eq(quotations.id, quotationId));
    await db.delete(approvalRules).where(eq(approvalRules.approverRole, 'sales_manager'));
    await db.delete(products).where(eq(products.id, productId));
    await db.delete(users).where(eq(users.id, contactId));
    await db.delete(companies).where(eq(companies.id, customerId));
    await db.delete(companies).where(eq(companies.id, otherCustomerId));
    await db.delete(discountPolicies).where(eq(discountPolicies.id, policyId));
    await db.delete(customerTiers).where(eq(customerTiers.id, tierId));
  });

  const getCustomerCtx = (cId: string): CustomerContext => ({ companyId: cId, contactId });

  it('getPortalQuotation: should enforce customer ownership and strip internal fields', async () => {
    // Other customer fails
    await expect(portalService.getPortalQuotation(getCustomerCtx(otherCustomerId), quotationId))
      .rejects.toThrow('Not authorized');

    // Right customer succeeds
    const data = await portalService.getPortalQuotation(getCustomerCtx(customerId), quotationId);
    
    expect(data.quotation.id).toBe(quotationId);
    
    // Internal fields should be stripped
    expect((data.quotation as any).riskScore).toBeUndefined();
    expect((data.quotation as any).margin).toBeUndefined();
    expect((data.quotation as any).ownerId).toBeUndefined();
  });

  it('counterOffer: should allow direct confirmation if no risk thresholds are exceeded', async () => {
    // Ask for 5% discount (below 10% standard tier limit, so risk = 0)
    const result = await portalService.counterOffer(getCustomerCtx(customerId), quotationId, [
      { lineId, discount: 5 }
    ]);

    expect(result.status).toBe('approved'); // auto approved

    // Verify it was saved
    const [line] = await db.select().from(quotationLines).where(eq(quotationLines.id, lineId));
    expect(line.discount).toBe(5);
    
    // Verify audit log
    const logs = await db.select().from(auditLogs).where(eq(auditLogs.entityId, quotationId));
    expect(logs.length).toBeGreaterThan(0);
  });

  it('counterOffer: should require approval if risk thresholds are exceeded', async () => {
    // Ask for 50% discount (excess 40%, risk is huge)
    const result = await portalService.counterOffer(getCustomerCtx(customerId), quotationId, [
      { lineId, discount: 50 }
    ]);

    expect(result.status).toBe('pending_approval');

    // Verify approval records generated
    const requiredApprovals = await db.select().from(approvals).where(eq(approvals.quotationId, quotationId));
    expect(requiredApprovals.length).toBeGreaterThan(0);
    expect(requiredApprovals[0].approverRole).toBe('sales_manager');
    expect(requiredApprovals[0].status).toBe('pending');
  });
});
