import { z } from 'zod';

export const createProductCategorySchema = z.object({
  name: z.string().min(1).max(100),
});

export const updateProductCategorySchema = createProductCategorySchema.partial();

const productVariantSchema = z.object({
  attribute: z.string().min(1),
  values: z.array(z.string().min(1)),
  extraPrice: z.number().int().min(0).optional(),
});

const productPriceListSchema = z.object({
  tier: z.string().min(1),
  currency: z.string().min(1),
  rule: z.string().min(1),
});

export const createProductSchema = z.object({
  name: z.string().min(1).max(255),
  categoryId: z.string().uuid().nullable().optional(),
  active: z.boolean().optional(),
  price: z.number().int().min(0).optional(),
  cost: z.number().int().min(0).optional(),
  description: z.string().max(2000).optional(),
  taxPercent: z.number().int().min(0).max(100).optional(),
  quantityOnHand: z.number().int().min(0).optional(),
  isRecurring: z.boolean().optional(),
  billingInterval: z.enum(['monthly', 'quarterly', 'yearly']).nullable().optional(),
  attributes: z.array(productVariantSchema).optional(),
  variants: z.array(productVariantSchema).optional(),
  priceLists: z.array(productPriceListSchema).optional(),
});

export const updateProductSchema = createProductSchema.partial();

export type CreateProductCategoryDto = z.infer<typeof createProductCategorySchema>;
export type UpdateProductCategoryDto = z.infer<typeof updateProductCategorySchema>;
export type CreateProductDto = z.infer<typeof createProductSchema>;
export type UpdateProductDto = z.infer<typeof updateProductSchema>;
