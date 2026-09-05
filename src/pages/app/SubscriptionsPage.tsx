import ModuleShellPlaceholder from './ModuleShellPlaceholder';
import { Repeat } from 'lucide-react';

export default function SubscriptionsPage() {
  return (
    <ModuleShellPlaceholder
      title="Recurring Subscriptions"
      category="Governance"
      description="Manage SaaS recurring billing contracts, plan upgrades, auto-renewals, and churn prevention."
      icon={Repeat}
      requiredRoles={['admin', 'finance', 'sales_rep']}
      stats={[
        { label: 'Active Subscriptions', value: '142' },
        { label: 'MRR', value: '$118.5K', badge: '+4.2%' },
        { label: 'Renewals Next 30D', value: '19' },
        { label: 'Churn Rate', value: '1.2%' },
      ]}
    />
  );
}
