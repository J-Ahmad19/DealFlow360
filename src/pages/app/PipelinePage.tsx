import ModuleShellPlaceholder from './ModuleShellPlaceholder';
import { Kanban } from 'lucide-react';

export default function PipelinePage() {
  return (
    <ModuleShellPlaceholder
      title="Deal Pipeline & Opportunities"
      category="Operations"
      description="Visual opportunity pipeline tracking, negotiation status, and deal velocity."
      icon={Kanban}
      requiredRoles={['admin', 'sales_manager', 'sales_rep']}
      stats={[
        { label: 'Pipeline Value', value: '$1.42M', badge: 'Active' },
        { label: 'Deals in Negotiation', value: '8' },
        { label: 'Avg Deal Cycle', value: '14 Days' },
        { label: 'Win Rate', value: '42%' },
      ]}
    />
  );
}
