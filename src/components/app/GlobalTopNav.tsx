import { Link, useLocation } from 'react-router-dom';
import { PermissionGuard } from '../auth/PermissionGuard';
import UserMenu from './UserMenu';
import type { UserRole } from '../../contexts/AuthContext';

interface NavItem {
  label: string;
  path: string;
  permission?: string;
  role?: UserRole[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/app/dashboard' },
  { label: 'Quotations', path: '/app/quotations', permission: 'QUOTATION_READ' },
  { label: 'Approvals', path: '/app/approvals', role: ['admin', 'sales_manager', 'finance'] },
  { label: 'Fulfillment', path: '/app/fulfillment', permission: 'FULFILLMENT_MANAGE' },
  { label: 'Subscriptions', path: '/app/subscriptions', role: ['admin', 'finance', 'sales_rep'] },
  { label: 'Invoices', path: '/app/billing', permission: 'BILLING_RECONCILE' },
  { label: 'Deal Health', path: '/app/deal-health' }, // Add mapping later if needed
  { label: 'Reports', path: '/app/reports', permission: 'REPORT_VIEW' },
  { label: 'Product', path: '/app/products', role: ['admin', 'sales_manager'] },
];

export default function GlobalTopNav() {
  const location = useLocation();

  return (
    <header className="bg-slate-900 border-b-4 border-slate-950 sticky top-0 z-40 w-full h-16 flex items-center justify-between px-4 sm:px-6 shadow-sm shrink-0">
      <div className="flex items-center gap-6 overflow-x-auto custom-scrollbar no-scrollbar py-2">
        {/* Logo */}
        <Link to="/app/dashboard" className="flex items-center gap-2 group shrink-0 mr-4">
          <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center p-1 shadow-sm group-hover:scale-105 transition-transform">
            <img src="/logo.png" alt="DealFlow360 Logo" className="w-full h-full object-contain" />
          </div>
          <div className="hidden lg:block truncate">
            <span className="font-black text-sm tracking-tight text-white block leading-none">
              Deal<span className="text-brand-400">Flow</span>360
            </span>
          </div>
        </Link>

        {/* Horizontal Nav Links */}
        <nav className="flex items-center gap-1.5 shrink-0">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/app/dashboard' && location.pathname.startsWith(item.path));
            
            const navLink = (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 sm:px-4 py-2 rounded-full text-xs font-black transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {item.label}
              </Link>
            );

            if (item.permission || item.role) {
              return (
                <PermissionGuard key={item.path} permission={item.permission} role={item.role}>
                  {navLink}
                </PermissionGuard>
              );
            }
            return navLink;
          })}
        </nav>
      </div>

      <div className="flex items-center shrink-0 ml-4">
        {/* The UserMenu has a dropdown that looks best against light background, 
            so we might need to adjust its trigger text color to white */}
        <div className="text-white">
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
