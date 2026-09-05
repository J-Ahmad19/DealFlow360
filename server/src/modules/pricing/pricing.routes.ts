import { Router } from 'express';
import { PricingController } from './pricing.controller.js';
import { authenticate } from '../../core/middleware/authenticate.js';
import { requireRole } from '../../core/middleware/requireRole.js';

export const pricingRoutes = Router();

// Apply authentication middleware
pricingRoutes.use(authenticate);

// Everyone can view price lists and discounts
const readRoles = ['admin', 'sales_manager', 'finance', 'sales_rep'];
// Only admin and sales_manager can manage them
const manageRoles = ['admin', 'sales_manager'];

// Price Lists
pricingRoutes.post('/price-lists', requireRole(manageRoles), PricingController.createPriceList);
pricingRoutes.get('/price-lists', requireRole(readRoles), PricingController.listPriceLists);
pricingRoutes.get('/price-lists/:id', requireRole(readRoles), PricingController.getPriceList);
pricingRoutes.patch('/price-lists/:id', requireRole(manageRoles), PricingController.updatePriceList);

// Price List Items
pricingRoutes.post('/price-lists/:id/items', requireRole(manageRoles), PricingController.addPriceListItem);
pricingRoutes.get('/price-lists/:id/items', requireRole(readRoles), PricingController.listPriceListItems);
pricingRoutes.patch('/price-lists/:id/items/:productId', requireRole(manageRoles), PricingController.updatePriceListItem);

// Discount Policies
pricingRoutes.post('/discounts', requireRole(manageRoles), PricingController.createDiscountPolicy);
pricingRoutes.get('/discounts', requireRole(readRoles), PricingController.listDiscountPolicies);
pricingRoutes.patch('/discounts/:id', requireRole(manageRoles), PricingController.updateDiscountPolicy);
