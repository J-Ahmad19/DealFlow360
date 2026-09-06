import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { PortalService } from './portal.service.js';
import { CustomerContext } from '../../core/authz/policies/customer.policy.js';

// We inject these for now, in a real DI setup they'd be injected properly.
import { DiscountEngine } from '../discounts/discount.engine.js';
import { ApprovalRoutingEngine } from '../approvals/approval.engine.js';
import { DiscountPolicyRepository } from '../discounts/discount.repository.js';

const discountRepo = new DiscountPolicyRepository();
const discountEngine = new DiscountEngine(discountRepo);
const approvalEngine = new ApprovalRoutingEngine();
const portalService = new PortalService(discountEngine, approvalEngine);

function getCustomerContext(req: Request): CustomerContext {
  const customer = (req as any).customer as CustomerContext | undefined;

  if (!customer?.companyId || !customer?.contactId) {
    throw new Error('Customer authentication required');
  }

  return customer;
}

export async function listQuotations(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const ctx = getCustomerContext(req);
    const data = await portalService.listCustomerQuotations(ctx);
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

export async function getQuotation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const ctx = getCustomerContext(req);
    const data = await portalService.getPortalQuotation(ctx, id);
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

export async function addMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const ctx = getCustomerContext(req);
    const { message } = z.object({ message: z.string().min(1) }).parse(req.body);
    
    const thread = await portalService.addMessage(ctx, id, message);
    res.json({ data: thread });
  } catch (err) {
    next(err);
  }
}

export async function counterOffer(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const ctx = getCustomerContext(req);
    const { modifications, comment } = z.object({
      modifications: z.array(z.object({
        lineId: z.string().uuid(),
        discount: z.number().min(0).max(100)
      })),
      comment: z.string().optional()
    }).parse(req.body);

    const result = await portalService.counterOffer(ctx, id, modifications, comment);
    res.json({ data: result, message: 'Counter-offer submitted and evaluated' });
  } catch (err) {
    next(err);
  }
}

export async function confirmQuotation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const ctx = getCustomerContext(req);
    const result = await portalService.confirm(ctx, id);
    res.json({ data: result, message: 'Quotation confirmed' });
  } catch (err) {
    next(err);
  }
}
