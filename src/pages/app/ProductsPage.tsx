import ModuleShellPlaceholder from './ModuleShellPlaceholder';
import { Package } from 'lucide-react';

export default function ProductsPage() {
  return (
    <ModuleShellPlaceholder
      title="Product & Pricing Catalog"
      category="Commercial"
      description="Manage SKU product catalogs, list prices, volume discount curves, and bundle configurations."
      icon={Package}
      requiredRoles={['admin', 'sales_manager']}
      stats={[
        { label: 'Active SKUs', value: '310' },
        { label: 'Discount Rules', value: '14' },
        { label: 'Bundles Configured', value: '8' },
        { label: 'Catalog Updates', value: '3 Today' },
      ]}
    />
  );
}
