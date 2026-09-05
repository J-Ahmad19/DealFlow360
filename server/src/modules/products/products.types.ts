import { z } from 'zod';

export const createProductCategorySchema = z.object({
  name: z.string().min(1).max(100),
});

export const updateProductCategorySchema = createProductCategorySchema.partial();

export const createProductSchema = z.object({
  name: z.string().min(1).max(255),
  categoryId: z.string().uuid().nullable().optional(),
  active: z.boolean().optional(),
  price: z.number().int().min(0).optional(),
});

export const updateProductSchema = createProductSchema.partial();

export type CreateProductCategoryDto = z.infer<typeof createProductCategorySchema>;
export type UpdateProductCategoryDto = z.infer<typeof updateProductCategorySchema>;
export type CreateProductDto = z.infer<typeof createProductSchema>;
export type UpdateProductDto = z.infer<typeof updateProductSchema>;
