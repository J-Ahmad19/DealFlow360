import { WarehouseStock } from './warehouse.repository.js';

export interface Allocation {
  warehouseId: string;
  quantity: number;
}

export interface FulfillmentPlan {
  allocations: Allocation[];
  totalShipments: number;
  totalCost: number;
  isBackordered: boolean;
  unfulfilledQty: number;
}

export class FulfillmentEngine {
  private splitPenalty = 10; // $10 penalty per split shipment

  /**
   * Find allocation x1..xn to minimize cost and shipments.
   * Simple Greedy approach for now:
   * Try to fulfill from a single warehouse if possible (minimizes shipments).
   * If not possible, take from warehouses sorted by availableQty (desc) or baseShippingCost (asc).
   */
  public allocate(requiredQty: number, stocks: WarehouseStock[]): FulfillmentPlan {
    if (requiredQty === 0) {
      return { allocations: [], totalShipments: 0, totalCost: 0, isBackordered: false, unfulfilledQty: 0 };
    }

    const totalAvailable = stocks.reduce((sum, w) => sum + w.availableQty, 0);
    
    if (totalAvailable < requiredQty) {
      // Backorder scenario
      // Allocate everything we have, remainder is backordered
      const allocations: Allocation[] = [];
      let cost = 0;
      let shipments = 0;
      
      for (const w of stocks) {
        if (w.availableQty > 0) {
          allocations.push({ warehouseId: w.warehouseId, quantity: w.availableQty });
          cost += w.baseShippingCost;
          shipments++;
        }
      }
      
      const unfulfilledQty = requiredQty - totalAvailable;
      if (shipments > 1) {
        cost += (shipments - 1) * this.splitPenalty;
      }
      
      return {
        allocations,
        totalShipments: shipments,
        totalCost: cost,
        isBackordered: true,
        unfulfilledQty,
      };
    }

    // We have enough stock. Try to find a single warehouse first to avoid split penalty
    const singleSources = stocks.filter(w => w.availableQty >= requiredQty);
    if (singleSources.length > 0) {
      // Pick the one with the lowest base shipping cost
      singleSources.sort((a, b) => a.baseShippingCost - b.baseShippingCost);
      const chosen = singleSources[0];
      return {
        allocations: [{ warehouseId: chosen.warehouseId, quantity: requiredQty }],
        totalShipments: 1,
        totalCost: chosen.baseShippingCost,
        isBackordered: false,
        unfulfilledQty: 0,
      };
    }

    // Need to split shipments. 
    // Greedy approach: sort by largest availableQty to minimize shipment count
    const sortedStocks = [...stocks].sort((a, b) => {
      // First sort by qty desc
      if (b.availableQty !== a.availableQty) {
        return b.availableQty - a.availableQty;
      }
      // Tie breaker: shipping cost asc
      return a.baseShippingCost - b.baseShippingCost;
    });

    const allocations: Allocation[] = [];
    let remainingQty = requiredQty;
    let cost = 0;
    let shipments = 0;

    for (const w of sortedStocks) {
      if (remainingQty <= 0) break;
      if (w.availableQty === 0) continue;

      const toTake = Math.min(remainingQty, w.availableQty);
      allocations.push({ warehouseId: w.warehouseId, quantity: toTake });
      remainingQty -= toTake;
      cost += w.baseShippingCost;
      shipments++;
    }

    if (shipments > 1) {
      cost += (shipments - 1) * this.splitPenalty;
    }

    return {
      allocations,
      totalShipments: shipments,
      totalCost: cost,
      isBackordered: false,
      unfulfilledQty: 0,
    };
  }
}
