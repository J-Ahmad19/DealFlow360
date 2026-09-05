import { Request, Response, NextFunction } from 'express';
import { ProductsService } from './products.service.js';
import { sendSuccess } from '../../core/http/response.js';
import { 
  createProductCategorySchema, 
  updateProductCategorySchema, 
  createProductSchema, 
  updateProductSchema 
} from './products.types.js';

export const ProductsController = {
  /**
   * CATEGORIES
   */
  createCategory: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = createProductCategorySchema.parse(req.body);
      // req.user is guaranteed by the authenticate middleware
      const category = await ProductsService.createCategory(data, req.user!.id);
      sendSuccess(res, category, 201);
    } catch (err) {
      next(err); // Passes Zod validation errors and DB errors to global error handler
    }
  },

  listCategories: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const categories = await ProductsService.listCategories();
      sendSuccess(res, categories);
    } catch (err) {
      next(err);
    }
  },

  updateCategory: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = updateProductCategorySchema.parse(req.body);
      const category = await ProductsService.updateCategory(req.params.id, data, req.user!.id);
      sendSuccess(res, category);
    } catch (err) {
      next(err);
    }
  },

  /**
   * PRODUCTS
   */
  createProduct: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = createProductSchema.parse(req.body);
      const product = await ProductsService.createProduct(data, req.user!.id);
      sendSuccess(res, product, 201);
    } catch (err) {
      next(err);
    }
  },

  listProducts: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Robustly handle optional query parameters for filtering
      const activeQuery = req.query.active;
      const activeOnly = activeQuery !== undefined ? activeQuery === 'true' : undefined;
      
      const products = await ProductsService.listProducts(activeOnly);
      sendSuccess(res, products);
    } catch (err) {
      next(err);
    }
  },

  getProduct: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const product = await ProductsService.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      sendSuccess(res, product);
    } catch (err) {
      next(err);
    }
  },

  updateProduct: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = updateProductSchema.parse(req.body);
      const product = await ProductsService.updateProduct(req.params.id, data, req.user!.id);
      sendSuccess(res, product);
    } catch (err) {
      next(err);
    }
  },
};