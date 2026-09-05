import { db } from '../../../db/client.js';
import { quotations } from '../../../db/schema/dealflow.js';
import { eq } from 'drizzle-orm';
import { UnauthorizedError } from '../../errors/AppError.js';

export interface CustomerContext {
  contactId: string;
  companyId: string;
}

export const CustomerPolicy = {
  /**
   * Ensures the authenticated customer belongs to the company that owns the quotation.
   */
  async canViewQuotation(customer: CustomerContext, quotationId: string): Promise<boolean> {
    if (!customer || !customer.companyId) {
      throw new UnauthorizedError('Authentication required');
    }

    const [quotation] = await db
      .select({ customerId: quotations.customerId })
      .from(quotations)
      .where(eq(quotations.id, quotationId))
      .limit(1);

    if (!quotation) {
      // If it doesn't exist, we can just return false. The controller will probably 404 earlier,
      // but if policy runs first, false means forbidden/not-found.
      return false;
    }

    return quotation.customerId === customer.companyId;
  },
};
