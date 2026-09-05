import ModuleShellPlaceholder from './ModuleShellPlaceholder';
import { Truck } from 'lucide-react';

export default function FulfillmentPage() {
  return (
    <ModuleShellPlaceholder
      title="Fulfillment & Stock Allocation"
      category="Governance"
      description="Warehouse inventory allocation, stock reservation, and order fulfillment tracking."
      icon={Truck}
      requiredPermission="FULFILLMENT_MANAGE"
      stats={[
        { label: 'Pending Allocations', value: '12' },
        { label: 'Fulfilled Today', value: '29' },
        { label: 'Low Stock Alerts', value: '3', badge: 'Alert' },
        { label: 'Warehouse Overrides', value: '2' },
      ]}
    />
  );
}
