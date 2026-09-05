import { UserContext } from '../../../../modules/auth/auth.types.js';
import { ResourcePolicy } from '../helpers.js';
import { db } from '../../../db/client.js';
import { quotations, approvals } from '../../../db/schema/dealflow.js';
import { eq, and } from 'drizzle-orm';

export const QuotationPolicy = {
  /**
   * canEdit checks if the user is the owner of the quotation, or if they are an admin/sales_manager.
   */
  canEdit: (async (user: UserContext, resourceId?: string) => {
    if (!resourceId) return false;
    
    // Admins and managers can edit any quotation
    if (user.role === 'admin' || user.role === 'sales_manager') {
      return true;
    }

    // Otherwise, check ownership
    const quotation = await db.query.quotations.findFirst({
      where: eq(quotations.id, resourceId),
      columns: { ownerId: true },
    });

    if (!quotation) return false;

    return quotation.ownerId === user.id;
  }) as ResourcePolicy,

  /**
   * canApprove checks if there's a pending approval step assigned to this user's role
   */
  canApprove: (async (user: UserContext, resourceId?: string) => {
    if (!resourceId) return false;

    // Check if there is a pending approval for this quotation that matches the user's role
    const pendingApproval = await db.query.approvals.findFirst({
      where: and(
        eq(approvals.quotationId, resourceId),
        eq(approvals.status, 'pending'),
        eq(approvals.approverRole, user.role as any)
      ),
    });

    return !!pendingApproval;
  }) as ResourcePolicy,
};
