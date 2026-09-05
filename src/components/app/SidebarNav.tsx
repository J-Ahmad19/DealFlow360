import { Link, useLocation } from 'react-router-dom';
import { useAuth, type UserRole } from '../../contexts/AuthContext';
import { PermissionGuard } from '../auth/PermissionGuard';
import {
  LayoutDashboard,
  FileText,
  Kanban,
  CheckSquare,
  Truck,
  Receipt,
  Repeat,
  Building2,
  Package,
  BarChart3,
  Settings,
  ShieldCheck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SidebarNavProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

interface NavItem {
  label: string;
  path: string;
  icon: any;
  permission?: string;
  role?: UserRole | UserRole[];
  badge?: string | number;
}

const navCategories: { category: string; items: NavItem[] }[] = [
  {
    category: 'Operations',
    items: [
      { label: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
      { label: 'Quotations', path: '/app/quotations', icon: FileText, permission: 'QUOTATION_READ' },
      { label: 'Deal Pipeline', path: '/app/pipeline', icon: Kanban, role: ['admin', 'sales_manager', 'sales_rep'] },
      { label: 'Customers', path: '/app/customers', icon: Building2, role: ['admin', 'sales_manager', 'sales_rep'] },
    ],
  },
  {
    category: 'Governance',
    items: [
      { label: 'Approvals Queue', path: '/app/approvals', icon: CheckSquare, role: ['admin', 'sales_manager', 'finance'], badge: 4 },
      { label: 'Fulfillment & Stock', path: '/app/fulfillment', icon: Truck, permission: 'FULFILLMENT_MANAGE' },
      { label: 'Invoices & Billing', path: '/app/billing', icon: Receipt, permission: 'BILLING_RECONCILE' },
      { label: 'Subscriptions', path: '/app/subscriptions', icon: Repeat, role: ['admin', 'finance', 'sales_rep'] },
    ],
  },
  {
    category: 'Commercial',
    items: [
      { label: 'Product Catalog', path: '/app/products', icon: Package, role: ['admin', 'sales_manager'] },
      { label: 'Commercial Reports', path: '/app/reports', icon: BarChart3, permission: 'REPORT_VIEW' },
      { label: 'System Settings', path: '/app/settings', icon: Settings, permission: 'USER_MANAGE' },
    ],
  },
];

export default function SidebarNav({ collapsed, onToggleCollapse }: SidebarNavProps) {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <aside
      className={`bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 transition-all duration-300 z-40 relative select-none ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Sidebar Header Branding & Collapse Button */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800 shrink-0">
        <Link to="/app/dashboard" className="flex items-center gap-3 group overflow-hidden">
          <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center p-1.5 shrink-0 shadow-md group-hover:scale-105 transition-transform">
            <img src="/logo.png" alt="DealFlow360 Logo" className="w-full h-full object-contain" />
          </div>

          {!collapsed && (
            <div className="truncate">
              <span className="font-black text-lg tracking-tight text-white block leading-none">
                Deal<span className="text-brand-400">Flow</span>360
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mt-1">
                Commercial Engine
              </span>
            </div>
          )}
        </Link>

        <button
          onClick={onToggleCollapse}
          className="hidden md:flex p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation Group Links */}
      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-6 custom-scrollbar">
        {navCategories.map((group) => (
          <div key={group.category} className="space-y-1">
            {!collapsed && (
              <p className="px-3 text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                {group.category}
              </p>
            )}

            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path !== '/app/dashboard' && location.pathname.startsWith(item.path));

              return (
                <PermissionGuard key={item.path} permission={item.permission} role={item.role}>
                  <Link
                    to={item.path}
                    title={collapsed ? item.label : undefined}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-black transition-all group relative ${
                      isActive
                        ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                    } ${collapsed ? 'justify-center' : ''}`}
                  >
                    <Icon size={18} className={`shrink-0 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />

                    {!collapsed && <span className="truncate flex-1">{item.label}</span>}

                    {item.badge && !collapsed && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${isActive ? 'bg-white/20 text-white' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                        {item.badge}
                      </span>
                    )}

                    {collapsed && item.badge && (
                      <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    )}
                  </Link>
                </PermissionGuard>
              );
            })}
          </div>
        ))}
      </div>

      {/* Sidebar Footer Role Active Indicator */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60 shrink-0">
        {!collapsed ? (
          <div className="p-3 rounded-2xl bg-slate-850 border border-slate-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center shrink-0 border border-brand-500/30">
              <ShieldCheck size={18} />
            </div>
            <div className="truncate">
              <p className="text-[11px] font-black text-slate-200 uppercase tracking-wider truncate">
                {user?.role ? user.role.replace('_', ' ') : 'Sales Rep'}
              </p>
              <p className="text-[10px] font-bold text-slate-500 truncate">Role Permissions Active</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center p-1" title={`Role Active: ${user?.role}`}>
            <div className="w-8 h-8 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center border border-brand-500/30">
              <ShieldCheck size={16} />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
