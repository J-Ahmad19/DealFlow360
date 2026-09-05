import { z } from 'zod';

export const createPriceListSchema = z.object({
  name: z.string().min(1).max(255),
  active: z.boolean().optional(),
});

export const updatePriceListSchema = createPriceListSchema.partial();

export const createPriceListItemSchema = z.object({
  productId: z.string().uuid(),
  price: z.number().int().min(0),
});

export const updatePriceListItemSchema = z.object({
  price: z.number().int().min(0),
});

export const createDiscountPolicySchema = z.object({
  tierId: z.string().uuid(),
  categoryId: z.string().uuid().nullable().optional(),
  discountPercent: z.number().int().min(0).max(100),
});

export const updateDiscountPolicySchema = createDiscountPolicySchema.partial();

export type CreatePriceListDto = z.infer<typeof createPriceListSchema>;
export type UpdatePriceListDto = z.infer<typeof updatePriceListSchema>;
export type CreatePriceListItemDto = z.infer<typeof createPriceListItemSchema>;
export type UpdatePriceListItemDto = z.infer<typeof updatePriceListItemSchema>;
export type CreateDiscountPolicyDto = z.infer<typeof createDiscountPolicySchema>;
export type UpdateDiscountPolicyDto = z.infer<typeof updateDiscountPolicySchema>;
