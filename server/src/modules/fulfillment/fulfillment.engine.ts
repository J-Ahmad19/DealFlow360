export interface WarehouseStock {
  warehouseId: string;
  warehouseName: string;
  availableQty: number;
  baseShippingCost: number;
}

export interface FulfillmentAllocation {
  warehouseId: string;
  warehouseName: string;
  quantity: number;
  cost: number;
}

export interface FulfillmentPlan {
  allocations: FulfillmentAllocation[];
  totalCost: number;
  isBackordered: boolean;
}

export class FulfillmentEngine {
  allocate(requestedQty: number, availableStocks: WarehouseStock[]): FulfillmentPlan {
    let remaining = requestedQty;
    let totalCost = 0;
    const allocations: FulfillmentAllocation[] = [];

    // Sort warehouses by shipping cost (cheapest first), then by available qty (highest first)
    const sortedStocks = [...availableStocks].sort((a, b) => {
      if (a.baseShippingCost !== b.baseShippingCost) {
        return a.baseShippingCost - b.baseShippingCost;
      }
      return b.availableQty - a.availableQty;
    });

    for (const stock of sortedStocks) {
      if (remaining <= 0) break;
      if (stock.availableQty <= 0) continue;

      const take = Math.min(remaining, stock.availableQty);
      remaining -= take;
      
      // Calculate a simple cost model: base cost + ($2 per unit)
      const cost = stock.baseShippingCost + (take * 2);
      totalCost += cost;

      allocations.push({
        warehouseId: stock.warehouseId,
        warehouseName: stock.warehouseName,
        quantity: take,
        cost: cost,
      });
    }

    return {
      allocations,
      totalCost,
      isBackordered: remaining > 0,
    };
  }
}