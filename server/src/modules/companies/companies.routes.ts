import { Router } from 'express';
import { CompaniesController } from './companies.controller.js';
import { authenticate } from '../../core/middleware/authenticate.js';

const router = Router();
router.use(authenticate);
router.get('/', CompaniesController.list);

export const companiesRoutes = router;