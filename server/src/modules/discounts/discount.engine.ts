import { DiscountPolicyRepository } from './discount.repository.js';

export interface QuotationLineEvalInput {
  id: string;
  categoryId: string | null;
  unitPrice: number; // in cents
  quantity: number;
  discountPercent: number; // e.g. 15 for 15%
  marginPercent: number; // e.g. 20 for 20%
}

export interface QuotationEvalInput {
  customerId: string;
  lines: QuotationLineEvalInput[];
}

export interface RiskEvaluationResult {
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  reasons: string[];
}

export class DiscountEngine {
  constructor(private discountRepo: DiscountPolicyRepository) {}

  async evaluateQuotation(quotation: QuotationEvalInput): Promise<RiskEvaluationResult> {
    const policies = await this.discountRepo.getPoliciesForCustomer(quotation.customerId);
    
    let totalRiskScore = 0;
    const reasons: string[] = [];

    for (const line of quotation.lines) {
      let allowedDiscount = policies.baseLimit;
      
      if (line.categoryId && policies.categoryLimits.has(line.categoryId)) {
        const catLimit = policies.categoryLimits.get(line.categoryId)!;
        allowedDiscount = Math.min(allowedDiscount, catLimit);
      }

      const lineExcess = Math.max(0, line.discountPercent - allowedDiscount);
      
      if (lineExcess > 0) {
        totalRiskScore += lineExcess * 5; // e.g., 5 points per 1% excess
        reasons.push(`Line ${line.id} exceeds allowed discount by ${lineExcess}%`);
      }

      // Margin risk
      if (line.marginPercent < 20) {
        const marginDeficit = 20 - line.marginPercent;
        totalRiskScore += marginDeficit * 2; // e.g., 2 points per 1% below 20%
        reasons.push(`Line ${line.id} has low margin (${line.marginPercent}%)`);
      }

      // Category risk example: if category is 'Services', add base risk
      // For simplicity, we just look at margin and discount here, but we could add arbitrary category risk.
    }

    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (totalRiskScore > 50) {
      riskLevel = 'high';
    } else if (totalRiskScore > 20) {
      riskLevel = 'medium';
    }

    if (totalRiskScore === 0) {
      reasons.push('Quotation is within safe limits.');
    }

    return {
      riskScore: totalRiskScore,
      riskLevel,
      reasons,
    };
  }
}
