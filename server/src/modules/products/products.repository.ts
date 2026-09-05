import { db } from '../../db/client.js';
import { products, productCategories } from '../../db/schema/dealflow.js';
import { eq } from 'drizzle-orm';
import { CreateProductCategoryDto, UpdateProductCategoryDto, CreateProductDto, UpdateProductDto } from './products.types.js';

export const ProductsRepository = {
  createCategory: async (data: CreateProductCategoryDto) => {
    const [category] = await db.insert(productCategories).values(data).returning();
    return category;
  },

  listCategories: async () => {
    return db.query.productCategories.findMany();
  },

  getCategoryById: async (id: string) => {
    return db.query.productCategories.findFirst({
      where: eq(productCategories.id, id),
    });
  },

  updateCategory: async (id: string, data: UpdateProductCategoryDto) => {
    const [category] = await db
      .update(productCategories)
      .set(data)
      .where(eq(productCategories.id, id))
      .returning();
    return category;
  },

  createProduct: async (data: CreateProductDto) => {
    const [product] = await db.insert(products).values(data).returning();
    return product;
  },

  listProducts: async (activeOnly: boolean = false) => {
    return db.query.products.findMany({
      where: activeOnly ? eq(products.active, true) : undefined,
    });
  },

  getProductById: async (id: string) => {
    return db.query.products.findFirst({
      where: eq(products.id, id),
    });
  },

  updateProduct: async (id: string, data: UpdateProductDto) => {
    const [product] = await db
      .update(products)
      .set(data)
      .where(eq(products.id, id))
      .returning();
    return product;
  },
};
