import { ProductsRepository } from './products.repository.js';
import { CreateProductCategoryDto, UpdateProductCategoryDto, CreateProductDto, UpdateProductDto } from './products.types.js';
import { NotFoundError } from '../../core/errors/AppError.js';
import { AuditService } from '../../core/audit/audit.service.js';
import { AuditAction } from '../../core/audit/audit.types.js';

export const ProductsService = {
  createCategory: async (data: CreateProductCategoryDto, actorId: string) => {
    const category = await ProductsRepository.createCategory(data);
    return category;
  },

  listCategories: async () => ProductsRepository.listCategories(),

  updateCategory: async (id: string, data: UpdateProductCategoryDto, actorId: string) => {
    const category = await ProductsRepository.updateCategory(id, data);
    if (!category) throw new NotFoundError('Category not found');
    return category;
  },

  createProduct: async (data: CreateProductDto, actorId: string) => {
    const product = await ProductsRepository.createProduct(data);
    await AuditService.log({
      actorId,
      entityType: 'product',
      entityId: product.id,
      action: AuditAction.PRODUCT_CREATED,
      after: product,
    });
    return product;
  },

  listProducts: async (activeOnly: boolean = false) => ProductsRepository.listProducts(activeOnly),

  getProduct: async (id: string) => {
    const product = await ProductsRepository.getProductById(id);
    if (!product) throw new NotFoundError('Product not found');
    return product;
  },

  updateProduct: async (id: string, data: UpdateProductDto, actorId: string) => {
    const existing = await ProductsRepository.getProductById(id);
    const product = await ProductsRepository.updateProduct(id, data);
    if (!product) throw new NotFoundError('Product not found');

    // If price changed, record as discount_changed for visibility
    const action = (data.price !== undefined && existing?.price !== data.price)
      ? AuditAction.PRODUCT_DISCOUNT_CHANGED
      : AuditAction.PRODUCT_UPDATED;

    await AuditService.log({
      actorId,
      entityType: 'product',
      entityId: product.id,
      action,
      before: existing,
      after: product,
    });
    return product;
  },

  deleteProduct: async (id: string, actorId: string) => {
    const existing = await ProductsRepository.getProductById(id);
    if (!existing) throw new NotFoundError('Product not found');

    const deleted = await ProductsRepository.deleteProduct(id);
    await AuditService.log({
      actorId,
      entityType: 'product',
      entityId: id,
      action: AuditAction.PRODUCT_UPDATED,
      before: existing,
      after: { id, deleted: true },
    });

    return deleted;
  },
};
