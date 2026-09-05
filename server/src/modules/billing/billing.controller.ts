import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { db } from '../../db/client.js';
import { eq } from 'drizzle-orm';
import { orders, billingSchedules, subscriptions, payments } from '../../db/schema/dealflow.js';
import { BillingEngine } from './billing.engine.js';
import { SubscriptionService } from './subscription.service.js';
import { OrderService } from './order.service.js';
import { BillingService } from './billing.service.js';

const billingEngine = new BillingEngine();
const subscriptionService = new SubscriptionService(billingEngine);
const orderService = new OrderService(billingEngine, subscriptionService);

export async function listInvoices(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await BillingService.getInvoiceOverview();
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function getInvoice(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const invoice = await BillingService.getInvoiceById(req.params.id);
    if (!invoice) {
      res.status(404).json({ error: 'Invoice not found' });
      return;
    }
    res.json(invoice);
  } catch (err) {
    next(err);
  }
}

export async function createOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { quotationId } = z.object({ quotationId: z.string().uuid() }).parse(req.body);
    const order = await orderService.createOrderFromQuotation(quotationId);
    res.status(201).json({ data: order });
  } catch (err) {
    next(err);
  }
}

export async function getOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }
    res.json({ data: order });
  } catch (err) {
    next(err);
  }
}

export async function getOrderBilling(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const schedules = await db.select().from(billingSchedules).where(eq(billingSchedules.orderId, id));
    const subs = await db.select().from(subscriptions).where(eq(subscriptions.orderId, id));
    const pays = await db.select().from(payments).where(eq(payments.orderId, id));
    
    res.json({ 
      data: {
        schedules,
        subscriptions: subs,
        payments: pays
      } 
    });
  } catch (err) {
    next(err);
  }
}

export async function processPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { amount, idempotencyKey } = z.object({
      amount: z.number().positive(),
      idempotencyKey: z.string().min(1)
    }).parse(req.body);

    const payment = await billingEngine.processPayment(id, amount, idempotencyKey);
    res.json({ data: payment, message: 'Payment processed' });
  } catch (err) {
    next(err);
  }
}

export async function modifySubscription(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Basic modify placeholder - in reality this would prorate and update period etc.
    res.json({ message: 'Subscription modified' });
  } catch (err) {
    next(err);
  }
}

export async function cancelSubscription(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { idempotencyKey } = z.object({ idempotencyKey: z.string().min(1) }).parse(req.body);
    const sub = await subscriptionService.cancelSubscription(id, idempotencyKey);
    res.json({ data: sub, message: 'Subscription canceled and proration processed' });
  } catch (err) {
    next(err);
  }
}
