import { QuotationsRepository } from './quotations.repository.js';
import {
  CreateQuotationInput,
  UpdateQuotationInput,
  QuotationStatus,
  isValidTransition,
} from './quotations.types.js';
import { db } from '../../db/client.js';
import { products } from '../../db/schema/dealflow.js';
import { eq } from 'drizzle-orm';
import { AuditService } from '../../core/audit/audit.service.js';
import { AuditAction } from '../../core/audit/audit.types.js';

export class QuotationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'QuotationError';
  }
}

export const QuotationsService = {
  createQuotation: async (data: CreateQuotationInput, actorId: string) => {
    const processedLines = [];
    let overallSubtotal = 0;
    let overallTotal = 0;
    let overallTax = 0;
    let overallDiscountAmt = 0;

    for (const line of data.lines) {
      const product = await db.query.products.findFirst({ where: eq(products.id, line.productId) });
      if (!product) throw new QuotationError(`Product not found: ${line.productId}`);

      const unitPrice = product.price;
      const quantity = line.quantity;
      const discountPercent = line.discount;
      const taxRate = 10;

      const baseSubtotal = unitPrice * quantity;
      const discountAmount = Math.round((baseSubtotal * discountPercent) / 100);
      const subtotal = baseSubtotal - discountAmount;
      const taxAmount = Math.round((subtotal * taxRate) / 100);
      const total = subtotal + taxAmount;

      processedLines.push({ productId: product.id, productNameSnapshot: product.name, unitPrice, quantity, taxRate, discount: discountPercent, subtotal, total });
      overallSubtotal += subtotal;
      overallTotal += total;
      overallTax += taxAmount;
      overallDiscountAmt += discountAmount;
    }

    const riskScore = overallTotal > 1000000 ? 80 : 20;
    const margin = 20;

    const quotationData = {
      title: data.title,
      customerId: data.customerId,
      ownerId: actorId,
      status: 'draft' as QuotationStatus,
      amount: overallTotal,
      subtotal: overallSubtotal,
      tax: overallTax,
      discount: overallDiscountAmt,
      margin,
      riskScore,
    };

    const quotation = await QuotationsRepository.create(quotationData, processedLines);

    await AuditService.log({
      actorId,
      entityType: 'quotation',
      entityId: quotation.id,
      action: AuditAction.QUOTATION_CREATED,
      after: { ...quotationData, id: quotation.id },
    });

    return QuotationsRepository.getById(quotation.id);
  },

  getQuotation: async (id: string) => QuotationsRepository.getById(id),

  listQuotations: async () => QuotationsRepository.getAll(),

  updateQuotation: async (id: string, data: UpdateQuotationInput, actorId: string) => {
    const existing = await QuotationsRepository.getById(id);
    if (!existing) throw new QuotationError('Quotation not found');

    if (!['draft', 'revision_required', 'under_negotiation'].includes(existing.status)) {
      throw new QuotationError(`Cannot update quotation in status: ${existing.status}`);
    }

    let processedLines = undefined;
    const quotationData: any = {};

    if (data.title) quotationData.title = data.title;
    if (data.customerId) quotationData.customerId = data.customerId;

    if (data.lines && data.lines.length > 0) {
      processedLines = [];
      let overallSubtotal = 0, overallTotal = 0, overallTax = 0, overallDiscountAmt = 0;

      for (const line of data.lines) {
        const product = await db.query.products.findFirst({ where: eq(products.id, line.productId) });
        if (!product) throw new QuotationError(`Product not found: ${line.productId}`);

        const unitPrice = product.price;
        const quantity = line.quantity;
        const discountPercent = line.discount;
        const taxRate = 10;
        
        const baseSubtotal = unitPrice * quantity;
        const discountAmount = Math.round((baseSubtotal * discountPercent) / 100);
        const subtotal = baseSubtotal - discountAmount;
        const taxAmount = Math.round((subtotal * taxRate) / 100);
        const total = subtotal + taxAmount;

        processedLines.push({ productId: product.id, productNameSnapshot: product.name, unitPrice, quantity, taxRate, discount: discountPercent, subtotal, total });
        overallSubtotal += subtotal;
        overallTotal += total;
        overallTax += taxAmount;
        overallDiscountAmt += discountAmount;
      }

      quotationData.amount = overallTotal;
      quotationData.subtotal = overallSubtotal;
      quotationData.tax = overallTax;
      quotationData.discount = overallDiscountAmt;
    }

    await QuotationsRepository.update(id, quotationData, processedLines);

    const discountChanged = data.lines && existing.discount !== quotationData.discount;
    await AuditService.log({
      actorId,
      entityType: 'quotation',
      entityId: id,
      action: discountChanged ? AuditAction.DISCOUNT_CHANGED : AuditAction.QUOTATION_UPDATED,
      before: { status: existing.status, discount: existing.discount, subtotal: existing.subtotal },
      after: quotationData,
    });

    return QuotationsRepository.getById(id);
  },

  changeStatus: async (id: string, newStatus: QuotationStatus, actorId: string, reason?: string) => {
    const existing = await QuotationsRepository.getById(id);
    if (!existing) throw new QuotationError('Quotation not found');

    if (!isValidTransition(existing.status as QuotationStatus, newStatus)) {
      throw new QuotationError(`Invalid state transition from ${existing.status} to ${newStatus}`);
    }

    await QuotationsRepository.update(id, { status: newStatus }, undefined);

    const actionMap: Record<string, string> = {
      pending_approval: AuditAction.QUOTATION_SUBMITTED,
      approved: AuditAction.APPROVAL_APPROVED,
      rejected: AuditAction.APPROVAL_REJECTED,
      revision_required: AuditAction.APPROVAL_REVISION_REQUESTED,
    };

    await AuditService.log({
      actorId,
      entityType: 'quotation',
      entityId: id,
      action: actionMap[newStatus] ?? AuditAction.QUOTATION_STATUS_CHANGED,
      reason,
      before: { status: existing.status },
      after: { status: newStatus },
    });

    return QuotationsRepository.getById(id);
  },
};