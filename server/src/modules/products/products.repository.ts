import { db } from '../../db/client.js';
import { products, productCategories } from '../../db/schema/dealflow.js';
import { CreateProductCategoryDto, UpdateProductCategoryDto, CreateProductDto, UpdateProductDto } from './products.types.js';
import { eq, asc } from 'drizzle-orm';

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
    const { attributes, variants, priceLists, ...productData } = data as any;
    const [product] = await db.insert(products).values({
      ...productData,
      attributes: attributes ?? variants ?? [],
    }).returning();
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
    const { attributes, variants, priceLists, ...productData } = data as any;

    const updatePayload: Record<string, any> = { ...productData };
    if (attributes !== undefined || variants !== undefined) {
      updatePayload.attributes = attributes ?? variants ?? [];
    }

    const [product] = await db
      .update(products)
      .set(updatePayload)
      .where(eq(products.id, id))
      .returning();
    return product;
  },

  deleteProduct: async (id: string) => {
    const [product] = await db
      .delete(products)
      .where(eq(products.id, id))
      .returning({ id: products.id });
    return product;
  },
};
