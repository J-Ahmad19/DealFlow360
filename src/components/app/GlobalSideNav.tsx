import { Link, useLocation } from 'react-router-dom';
import { PermissionGuard } from '../auth/PermissionGuard';
import UserMenu from './UserMenu';
import type { UserRole } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  Package,
  Repeat,
  Receipt,
  Activity,
  BarChart,
  Box,
} from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  permission?: string;
  role?: UserRole[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
  { label: 'Quotations', path: '/app/quotations', icon: FileText, permission: 'QUOTATION_READ' },
  { label: 'Approvals', path: '/app/approvals', icon: CheckSquare, role: ['admin', 'sales_manager', 'finance'] },
  { label: 'Fulfillment', path: '/app/fulfillment', icon: Package, permission: 'FULFILLMENT_MANAGE' },
  { label: 'Subscriptions', path: '/app/subscriptions', icon: Repeat, role: ['admin', 'finance', 'sales_rep'] },
  { label: 'Invoices', path: '/app/billing', icon: Receipt, permission: 'BILLING_RECONCILE' },
  { label: 'Deal Health', path: '/app/deal-health', icon: Activity },
  { label: 'Reports', path: '/app/reports', icon: BarChart, permission: 'REPORT_VIEW' },
  { label: 'Product', path: '/app/products', icon: Box, role: ['admin', 'sales_manager'] },
];

export default function GlobalSideNav() {
  const location = useLocation();

  return (
    <aside className="bg-slate-900 border-r-4 border-slate-950 w-64 shrink-0 flex flex-col h-screen overflow-hidden sticky top-0 z-40 shadow-xl hidden md:flex">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800 shrink-0">
        <Link to="/app/dashboard" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center p-1 shadow-sm group-hover:scale-105 transition-transform">
            <img src="/logo.png" alt="DealFlow360 Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="font-black text-sm tracking-tight text-white block leading-none">
              Deal<span className="text-brand-400">Flow</span>360
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1 custom-scrollbar">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path !== '/app/dashboard' && location.pathname.startsWith(item.path));

          const Icon = item.icon;

          const navLink = (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-black transition-all ${
                isActive
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400'} />
              <span>{item.label}</span>
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

      {/* Footer / User Profile */}
      <div className="p-4 border-t border-slate-800 shrink-0">
        <UserMenu sideNav />
      </div>
    </aside>
  );
}
