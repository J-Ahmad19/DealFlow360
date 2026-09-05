import ModuleShellPlaceholder from './ModuleShellPlaceholder';
import { BarChart3 } from 'lucide-react';

export default function ReportsPage() {
  return (
    <ModuleShellPlaceholder
      title="Commercial Performance Reports"
      category="Commercial"
      description="Margin breakdown, sales rep velocity, approval bottleneck analytics, and revenue trends."
      icon={BarChart3}
      requiredPermission="REPORT_VIEW"
      stats={[
        { label: 'Q3 Revenue', value: '$2.84M', badge: '+12% YoY' },
        { label: 'Avg Gross Margin', value: '34.2%' },
        { label: 'Discount Exposure', value: '8.4%' },
        { label: 'Deal Velocity', value: '11.2 Days' },
      ]}
    />
  );
}
