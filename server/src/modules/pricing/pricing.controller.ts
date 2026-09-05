import { Request, Response, NextFunction } from 'express';
import { PricingService } from './pricing.service.js';
import { sendSuccess } from '../../core/http/response.js';
import {
  createPriceListSchema, updatePriceListSchema,
  createPriceListItemSchema, updatePriceListItemSchema,
  createDiscountPolicySchema, updateDiscountPolicySchema
} from './pricing.types.js';

export const PricingController = {
  createPriceList: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = createPriceListSchema.parse(req.body);
      const list = await PricingService.createPriceList(data, req.user!.id);
      sendSuccess(res, list, 201);
    } catch (err) {
      next(err);
    }
  },

  listPriceLists: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lists = await PricingService.listPriceLists();
      sendSuccess(res, lists);
    } catch (err) {
      next(err);
    }
  },

  getPriceList: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const list = await PricingService.getPriceList(req.params.id);
      sendSuccess(res, list);
    } catch (err) {
      next(err);
    }
  },

  updatePriceList: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = updatePriceListSchema.parse(req.body);
      const list = await PricingService.updatePriceList(req.params.id, data, req.user!.id);
      sendSuccess(res, list);
    } catch (err) {
      next(err);
    }
  },

  addPriceListItem: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = createPriceListItemSchema.parse(req.body);
      const item = await PricingService.addPriceListItem(req.params.id, data, req.user!.id);
      sendSuccess(res, item, 201);
    } catch (err) {
      next(err);
    }
  },

  listPriceListItems: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const items = await PricingService.listPriceListItems(req.params.id);
      sendSuccess(res, items);
    } catch (err) {
      next(err);
    }
  },

  updatePriceListItem: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = updatePriceListItemSchema.parse(req.body);
      const item = await PricingService.updatePriceListItem(req.params.id, req.params.productId, data, req.user!.id);
      sendSuccess(res, item);
    } catch (err) {
      next(err);
    }
  },

  createDiscountPolicy: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = createDiscountPolicySchema.parse(req.body);
      const policy = await PricingService.createDiscountPolicy(data, req.user!.id);
      sendSuccess(res, policy, 201);
    } catch (err) {
      next(err);
    }
  },

  listDiscountPolicies: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const policies = await PricingService.listDiscountPolicies();
      sendSuccess(res, policies);
    } catch (err) {
      next(err);
    }
  },

  updateDiscountPolicy: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = updateDiscountPolicySchema.parse(req.body);
      const policy = await PricingService.updateDiscountPolicy(req.params.id, data, req.user!.id);
      sendSuccess(res, policy);
    } catch (err) {
      next(err);
    }
  },
};
