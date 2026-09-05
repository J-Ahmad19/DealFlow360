import { Router } from 'express';
import { ProductsController } from './products.controller.js';
import { authenticate } from '../../core/middleware/authenticate.js';
import { requireRole } from '../../core/middleware/requireRole.js';

const router = Router({ mergeParams: true });

// Enforce authentication globally for all product and category endpoints
router.use(authenticate);

// ─── Categories ─────────────────────────────────────────────────────────────
router.post(
  '/categories', 
  requireRole(['admin', 'sales_manager']), 
  ProductsController.createCategory
);

router.get(
  '/categories', 
  requireRole(['admin', 'sales_manager', 'finance', 'sales_rep']), 
  ProductsController.listCategories
);

router.patch(
  '/categories/:id', 
  requireRole(['admin', 'sales_manager']), 
  ProductsController.updateCategory
);


// ─── Products ───────────────────────────────────────────────────────────────
router.post(
  '/', 
  requireRole(['admin', 'sales_manager']), 
  ProductsController.createProduct
);

router.get(
  '/', 
  requireRole(['admin', 'sales_manager', 'finance', 'sales_rep']), 
  ProductsController.listProducts
);

router.get(
  '/:id', 
  requireRole(['admin', 'sales_manager', 'finance', 'sales_rep']), 
  ProductsController.getProduct
);

router.patch(
  '/:id', 
  requireRole(['admin', 'sales_manager']), 
  ProductsController.updateProduct
);

// Export both formats to ensure module resolution compatibility with Vite/TSX
export const productsRoutes = router;
export default router;