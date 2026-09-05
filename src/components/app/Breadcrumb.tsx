import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const routeLabels: Record<string, { label: string; category?: string }> = {
  dashboard: { label: 'Dashboard', category: 'Overview' },
  quotations: { label: 'Quotations', category: 'Operations' },
  pipeline: { label: 'Deal Pipeline', category: 'Operations' },
  approvals: { label: 'Approvals Queue', category: 'Governance' },
  fulfillment: { label: 'Fulfillment & Stock', category: 'Governance' },
  billing: { label: 'Billing & Invoices', category: 'Governance' },
  subscriptions: { label: 'Subscriptions', category: 'Governance' },
  customers: { label: 'Customers & Accounts', category: 'Operations' },
  products: { label: 'Product Catalog', category: 'Commercial' },
  reports: { label: 'Commercial Reports', category: 'Commercial' },
  settings: { label: 'System Settings', category: 'Administration' },
};

export default function Breadcrumb() {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean); // e.g. ['app', 'quotations']
  const currentSegment = pathSegments[1] || 'dashboard';

  const routeInfo = routeLabels[currentSegment] || {
    label: currentSegment.charAt(0).toUpperCase() + currentSegment.slice(1),
    category: 'Application',
  };

  return (
    <nav className="flex items-center gap-2 text-xs font-bold text-slate-500" aria-label="Breadcrumb">
      <Link
        to="/app/dashboard"
        className="flex items-center gap-1 hover:text-slate-900 transition-colors p-1 rounded-lg hover:bg-slate-100"
        title="App Home"
      >
        <Home size={14} className="text-slate-400" />
        <span className="hidden sm:inline">App</span>
      </Link>

      <ChevronRight size={12} className="text-slate-300 shrink-0" />

      {routeInfo.category && (
        <>
          <span className="text-slate-400 font-extrabold hidden md:inline">{routeInfo.category}</span>
          <ChevronRight size={12} className="text-slate-300 shrink-0 hidden md:inline" />
        </>
      )}

      <span className="font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/60">
        {routeInfo.label}
      </span>
    </nav>
  );
}
