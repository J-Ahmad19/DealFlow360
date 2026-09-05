import ModuleShellPlaceholder from './ModuleShellPlaceholder';
import { FileText } from 'lucide-react';

export default function QuotationsPage() {
  return (
    <ModuleShellPlaceholder
      title="Quotations & Builder"
      category="Operations"
      description="Create, configure, calculate tiered discounts, and manage commercial quotation life-cycle."
      icon={FileText}
      requiredPermission="QUOTATION_READ"
      stats={[
        { label: 'Active Quotes', value: '18', badge: '+3 this week' },
        { label: 'Draft Quotes', value: '6' },
        { label: 'Pending Approval', value: '4', badge: 'Action Required' },
        { label: 'Conversion Rate', value: '68.4%' },
      ]}
    />
  );
}
