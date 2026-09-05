import { ProductsRepository } from './products.repository.js';
import { CreateProductCategoryDto, UpdateProductCategoryDto, CreateProductDto, UpdateProductDto } from './products.types.js';
import { NotFoundError } from '../../core/errors/AppError.js';
import { db } from '../../db/client.js';
import { auditLogs } from '../../db/schema/dealflow.js';

export const ProductsService = {
  createCategory: async (data: CreateProductCategoryDto, actorId: string) => {
    const category = await ProductsRepository.createCategory(data);
    return category; // Category auditing usually skipped or could be added
  },

  listCategories: async () => {
    return ProductsRepository.listCategories();
  },

  updateCategory: async (id: string, data: UpdateProductCategoryDto, actorId: string) => {
    const category = await ProductsRepository.updateCategory(id, data);
    if (!category) {
      throw new NotFoundError('Category not found');
    }
    return category;
  },

  createProduct: async (data: CreateProductDto, actorId: string) => {
    const product = await ProductsRepository.createProduct(data);
    await db.insert(auditLogs).values({
      entityType: 'product',
      entityId: product.id,
      actorId,
      action: 'create',
    });
    return product;
  },

  listProducts: async (activeOnly: boolean = false) => {
    return ProductsRepository.listProducts(activeOnly);
  },

  getProduct: async (id: string) => {
    const product = await ProductsRepository.getProductById(id);
    if (!product) {
      throw new NotFoundError('Product not found');
    }
    return product;
  },

  updateProduct: async (id: string, data: UpdateProductDto, actorId: string) => {
    const product = await ProductsRepository.updateProduct(id, data);
    if (!product) {
      throw new NotFoundError('Product not found');
    }
    await db.insert(auditLogs).values({
      entityType: 'product',
      entityId: product.id,
      actorId,
      action: 'update',
    });
    return product;
  },
};
