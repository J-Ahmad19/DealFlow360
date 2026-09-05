import { db } from '../../db/client.js';
import { priceLists, priceListItems, discountPolicies } from '../../db/schema/dealflow.js';
import { eq, and } from 'drizzle-orm';
import {
  CreatePriceListDto, UpdatePriceListDto,
  CreatePriceListItemDto, UpdatePriceListItemDto,
  CreateDiscountPolicyDto, UpdateDiscountPolicyDto
} from './pricing.types.js';

export const PricingRepository = {
  // Price Lists
  createPriceList: async (data: CreatePriceListDto) => {
    const [list] = await db.insert(priceLists).values(data).returning();
    return list;
  },

  listPriceLists: async () => {
    return db.query.priceLists.findMany();
  },

  getPriceListById: async (id: string) => {
    return db.query.priceLists.findFirst({
      where: eq(priceLists.id, id),
    });
  },

  updatePriceList: async (id: string, data: UpdatePriceListDto) => {
    const [list] = await db
      .update(priceLists)
      .set(data)
      .where(eq(priceLists.id, id))
      .returning();
    return list;
  },

  // Price List Items
  addPriceListItem: async (priceListId: string, data: CreatePriceListItemDto) => {
    const [item] = await db.insert(priceListItems).values({ ...data, priceListId }).returning();
    return item;
  },

  listPriceListItems: async (priceListId: string) => {
    return db.query.priceListItems.findMany({
      where: eq(priceListItems.priceListId, priceListId),
    });
  },

  updatePriceListItem: async (priceListId: string, productId: string, data: UpdatePriceListItemDto) => {
    const [item] = await db
      .update(priceListItems)
      .set(data)
      .where(and(eq(priceListItems.priceListId, priceListId), eq(priceListItems.productId, productId)))
      .returning();
    return item;
  },

  // Discount Policies
  createDiscountPolicy: async (data: CreateDiscountPolicyDto) => {
    const [policy] = await db.insert(discountPolicies).values(data).returning();
    return policy;
  },

  listDiscountPolicies: async () => {
    return db.query.discountPolicies.findMany();
  },

  getDiscountPolicyById: async (id: string) => {
    return db.query.discountPolicies.findFirst({
      where: eq(discountPolicies.id, id),
    });
  },

  updateDiscountPolicy: async (id: string, data: UpdateDiscountPolicyDto) => {
    const [policy] = await db
      .update(discountPolicies)
      .set(data)
      .where(eq(discountPolicies.id, id))
      .returning();
    return policy;
  },
};
