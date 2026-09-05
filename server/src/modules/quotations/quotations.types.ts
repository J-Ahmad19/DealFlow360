import { z } from 'zod';

export const quotationStatusSchema = z.enum([
  'draft',
  'pending_approval',
  'approved',
  'rejected',
  'revision_required',
  'fulfillment',
  'confirmed',
  'under_negotiation',
]);

export type QuotationStatus = z.infer<typeof quotationStatusSchema>;

export const quotationLineSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive('Quantity must be positive'),
  discount: z.number().int().min(0).max(100, 'Discount cannot exceed 100%'),
});

export type QuotationLineInput = z.infer<typeof quotationLineSchema>;

export const createQuotationSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  customerId: z.string().uuid(),
  lines: z.array(quotationLineSchema).min(1, 'At least one line item is required'),
});

export type CreateQuotationInput = z.infer<typeof createQuotationSchema>;

export const updateQuotationSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255).optional(),
  customerId: z.string().uuid().optional(),
  lines: z.array(quotationLineSchema).min(1, 'At least one line item is required').optional(),
});

export type UpdateQuotationInput = z.infer<typeof updateQuotationSchema>;

// State Machine valid transitions (expanded to support Kanban drag-drop)
export const QUOTATION_STATE_TRANSITIONS: Record<QuotationStatus, QuotationStatus[]> = {
  draft:             ['pending_approval', 'approved', 'under_negotiation'],
  pending_approval:  ['approved', 'rejected', 'revision_required', 'draft', 'under_negotiation'],
  approved:          ['fulfillment', 'under_negotiation', 'confirmed'],
  rejected:          ['draft'],
  revision_required: ['draft', 'pending_approval'],
  fulfillment:       ['confirmed'],
  confirmed:         ['under_negotiation'],
  under_negotiation: ['pending_approval', 'confirmed', 'draft', 'approved'],
};

export function isValidTransition(from: QuotationStatus, to: QuotationStatus): boolean {
  const allowed = QUOTATION_STATE_TRANSITIONS[from];
  return allowed ? allowed.includes(to) : false;
}
