import { PricingRepository } from './pricing.repository.js';
import {
  CreatePriceListDto, UpdatePriceListDto,
  CreatePriceListItemDto, UpdatePriceListItemDto,
  CreateDiscountPolicyDto, UpdateDiscountPolicyDto
} from './pricing.types.js';
import { NotFoundError } from '../../core/errors/AppError.js';
import { db } from '../../db/client.js';
import { auditLogs } from '../../db/schema/dealflow.js';

export const PricingService = {
  createPriceList: async (data: CreatePriceListDto, actorId: string) => {
    return PricingRepository.createPriceList(data);
  },

  listPriceLists: async () => {
    return PricingRepository.listPriceLists();
  },

  getPriceList: async (id: string) => {
    const list = await PricingRepository.getPriceListById(id);
    if (!list) throw new NotFoundError('Price list not found');
    return list;
  },

  updatePriceList: async (id: string, data: UpdatePriceListDto, actorId: string) => {
    const list = await PricingRepository.updatePriceList(id, data);
    if (!list) throw new NotFoundError('Price list not found');
    return list;
  },

  addPriceListItem: async (priceListId: string, data: CreatePriceListItemDto, actorId: string) => {
    const list = await PricingRepository.getPriceListById(priceListId);
    if (!list) throw new NotFoundError('Price list not found');
    return PricingRepository.addPriceListItem(priceListId, data);
  },

  listPriceListItems: async (priceListId: string) => {
    return PricingRepository.listPriceListItems(priceListId);
  },

  updatePriceListItem: async (priceListId: string, productId: string, data: UpdatePriceListItemDto, actorId: string) => {
    const item = await PricingRepository.updatePriceListItem(priceListId, productId, data);
    if (!item) throw new NotFoundError('Price list item not found');
    return item;
  },

  createDiscountPolicy: async (data: CreateDiscountPolicyDto, actorId: string) => {
    return PricingRepository.createDiscountPolicy(data);
  },

  listDiscountPolicies: async () => {
    return PricingRepository.listDiscountPolicies();
  },

  updateDiscountPolicy: async (id: string, data: UpdateDiscountPolicyDto, actorId: string) => {
    const policy = await PricingRepository.updateDiscountPolicy(id, data);
    if (!policy) throw new NotFoundError('Discount policy not found');
    return policy;
  },
};
