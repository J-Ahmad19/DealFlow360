import { Router } from 'express';
import { CustomersController } from './customers.controller.js';
import { authenticate } from '../../core/middleware/authenticate.js';
import { requireRole } from '../../core/middleware/requireRole.js';

export const customersRoutes = Router();

// Apply authentication middleware to all customer routes
customersRoutes.use(authenticate);
customersRoutes.use(requireRole(['admin', 'sales_manager', 'finance', 'sales_rep']));

// Companies
customersRoutes.post('/', CustomersController.createCompany);
customersRoutes.get('/', CustomersController.listCompanies);
customersRoutes.get('/:id', CustomersController.getCompany);
customersRoutes.patch('/:id', CustomersController.updateCompany);

// Contacts
customersRoutes.post('/:companyId/contacts', CustomersController.addContact);
customersRoutes.get('/:companyId/contacts', CustomersController.listContacts);
customersRoutes.patch('/:companyId/contacts/:contactId', CustomersController.updateContact);
