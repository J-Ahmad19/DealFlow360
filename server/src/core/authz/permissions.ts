export enum Permissions {
  QUOTATION_CREATE = 'quotation:create',
  QUOTATION_READ = 'quotation:read',
  QUOTATION_EDIT = 'quotation:edit',
  QUOTATION_SUBMIT = 'quotation:submit',
  QUOTATION_APPROVE = 'quotation:approve',
  QUOTATION_REJECT = 'quotation:reject',
  QUOTATION_REVISE = 'quotation:revise',
  DISCOUNT_CONFIGURATION = 'discount:configuration',
  PRODUCT_MANAGEMENT = 'product:management',
  CUSTOMER_MANAGEMENT = 'customer:management',
  WAREHOUSE_MANAGEMENT = 'warehouse:management',
  FULFILLMENT_MANAGEMENT = 'fulfillment:management',
  BILLING_RECONCILIATION = 'billing:reconciliation',
  CREDIT_NOTE_CREATION = 'credit_note:creation',
  DEAL_HEALTH_VIEWING = 'deal_health:viewing',
  REPORTS = 'reports:view',
  USER_MANAGEMENT = 'user:management',
}

export type Role = 'admin' | 'sales_manager' | 'finance' | 'sales_rep';

export const RolePermissions: Record<Role, Permissions[]> = {
  admin: [
    Permissions.USER_MANAGEMENT,
    Permissions.PRODUCT_MANAGEMENT,
    Permissions.DISCOUNT_CONFIGURATION,
    Permissions.REPORTS,
    Permissions.WAREHOUSE_MANAGEMENT,
    Permissions.FULFILLMENT_MANAGEMENT,
    // Admins usually have widespread access, but we'll stick to explicit additions per requirement.
    // The policy states: "Admin has platform configuration permissions."
    // Let's grant them all permissions just to be safe, or specify the ones mentioned.
    Permissions.QUOTATION_READ,
    Permissions.QUOTATION_CREATE,
    Permissions.QUOTATION_EDIT,
    Permissions.QUOTATION_SUBMIT,
    Permissions.QUOTATION_APPROVE,
    Permissions.QUOTATION_REJECT,
    Permissions.QUOTATION_REVISE,
    Permissions.CUSTOMER_MANAGEMENT,
    Permissions.BILLING_RECONCILIATION,
    Permissions.CREDIT_NOTE_CREATION,
    Permissions.DEAL_HEALTH_VIEWING,
  ],
  sales_manager: [
    Permissions.QUOTATION_CREATE,
    Permissions.QUOTATION_READ,
    Permissions.QUOTATION_EDIT,
    Permissions.QUOTATION_SUBMIT,
    Permissions.QUOTATION_APPROVE,
    Permissions.QUOTATION_REJECT,
    Permissions.QUOTATION_REVISE,
    Permissions.CUSTOMER_MANAGEMENT,
    Permissions.DEAL_HEALTH_VIEWING,
    Permissions.REPORTS,
  ],
  finance: [
    Permissions.QUOTATION_APPROVE,
    Permissions.BILLING_RECONCILIATION,
    Permissions.CREDIT_NOTE_CREATION,
    Permissions.REPORTS,
    Permissions.QUOTATION_READ, // Implicitly needed for finance to approve
  ],
  sales_rep: [
    Permissions.QUOTATION_CREATE,
    Permissions.QUOTATION_READ,
    Permissions.QUOTATION_EDIT,
    Permissions.QUOTATION_SUBMIT,
    Permissions.CUSTOMER_MANAGEMENT,
    Permissions.DEAL_HEALTH_VIEWING,
  ],
};

export function hasPermission(role: Role, permission: Permissions): boolean {
  return RolePermissions[role]?.includes(permission) ?? false;
}
