import { Router } from 'express';
import { ProductsController } from './products.controller.js';
import { authenticate } from '../../core/middleware/authenticate.js';
import { requireRole } from '../../core/middleware/requireRole.js';

export const productsRoutes = Router();

// Apply authentication middleware to all product routes
productsRoutes.use(authenticate);

// Categories
productsRoutes.post('/categories', requireRole(['admin', 'sales_manager']), ProductsController.createCategory);
productsRoutes.get('/categories', requireRole(['admin', 'sales_manager', 'finance', 'sales_rep']), ProductsController.listCategories);
productsRoutes.patch('/categories/:id', requireRole(['admin', 'sales_manager']), ProductsController.updateCategory);

// Products
productsRoutes.post('/', requireRole(['admin', 'sales_manager']), ProductsController.createProduct);
productsRoutes.get('/', requireRole(['admin', 'sales_manager', 'finance', 'sales_rep']), ProductsController.listProducts);
productsRoutes.get('/:id', requireRole(['admin', 'sales_manager', 'finance', 'sales_rep']), ProductsController.getProduct);
productsRoutes.patch('/:id', requireRole(['admin', 'sales_manager']), ProductsController.updateProduct);
