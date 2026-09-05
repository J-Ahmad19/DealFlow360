import { Router } from 'express';
import { ApprovalRulesController } from './approvalRules.controller.js';
import { authenticate } from '../../core/middleware/authenticate.js';
import { requireRole } from '../../core/middleware/requireRole.js';

export const approvalRulesRoutes = Router();

// Apply authentication middleware
approvalRulesRoutes.use(authenticate);

// Restricted to admin and finance
const manageRoles = ['admin', 'finance'];
const readRoles = ['admin', 'finance', 'sales_manager'];

approvalRulesRoutes.post('/', requireRole(manageRoles), ApprovalRulesController.createRule);
approvalRulesRoutes.get('/', requireRole(readRoles), ApprovalRulesController.listRules);
approvalRulesRoutes.get('/:id', requireRole(readRoles), ApprovalRulesController.getRule);
approvalRulesRoutes.patch('/:id', requireRole(manageRoles), ApprovalRulesController.updateRule);
