import ModuleShellPlaceholder from './ModuleShellPlaceholder';
import { CheckSquare } from 'lucide-react';

export default function ApprovalsPage() {
  return (
    <ModuleShellPlaceholder
      title="Approvals Queue & Governance"
      category="Governance"
      description="Multi-tier discount approval requests, margin overrides, and commercial governance workflow."
      icon={CheckSquare}
      requiredRoles={['admin', 'sales_manager', 'finance']}
      stats={[
        { label: 'Pending Approvals', value: '4', badge: 'Action Needed' },
        { label: 'Approved Today', value: '7' },
        { label: 'Avg Turnaround', value: '2.4 hrs' },
        { label: 'Escalations', value: '1' },
      ]}
    />
  );
}
