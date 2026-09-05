import ModuleShellPlaceholder from './ModuleShellPlaceholder';
import { Building2 } from 'lucide-react';

export default function CustomersPage() {
  return (
    <ModuleShellPlaceholder
      title="Customers & Account Management"
      category="Operations"
      description="Enterprise accounts directory, buyer contacts, credit tier limits, and relationship history."
      icon={Building2}
      requiredRoles={['admin', 'sales_manager', 'sales_rep']}
      stats={[
        { label: 'Total Accounts', value: '86' },
        { label: 'Tier A Enterprise', value: '24' },
        { label: 'Active Quotations', value: '31' },
        { label: 'Avg LTV', value: '$94K' },
      ]}
    />
  );
}
