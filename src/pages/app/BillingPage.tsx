import ModuleShellPlaceholder from './ModuleShellPlaceholder';
import { Receipt } from 'lucide-react';

export default function BillingPage() {
  return (
    <ModuleShellPlaceholder
      title="Invoices & Billing Reconciliation"
      category="Governance"
      description="Invoice generation, payment reconciliation, credit note issuance, and billing logs."
      icon={Receipt}
      requiredPermission="BILLING_RECONCILE"
      stats={[
        { label: 'Unbilled Invoices', value: '9', badge: 'Due Soon' },
        { label: 'Total Reconciled', value: '$840K' },
        { label: 'Overdue Payments', value: '2', badge: 'Followup Needed' },
        { label: 'Credit Notes', value: '1' },
      ]}
    />
  );
}
