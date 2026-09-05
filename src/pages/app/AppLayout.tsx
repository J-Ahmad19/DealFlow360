import { useState } from 'react';
import { Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useAuth, type UserRole } from '../../contexts/AuthContext';
import { PermissionGuard } from '../../components/auth/PermissionGuard';
import Dashboard from '../Dashboard';
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  Truck,
  Repeat,
  Receipt,
  HeartPulse,
  BarChart3,
  Package,
  Users,
  LogOut,
  ChevronDown
} from 'lucide-react';

const roleBadgeColors: Record<UserRole, string> = {
  admin: 'bg-red-500/10 text-red-700 border-red-200',
  sales_manager: 'bg-amber-500/10 text-amber-700 border-amber-200',
  finance: 'bg-blue-500/10 text-blue-700 border-blue-200',
  sales_rep: 'bg-brand-500/10 text-brand-700 border-brand-200',
};

const roleDisplayNames: Record<UserRole, string> = {
  admin: 'Administrator',
  sales_manager: 'Sales Manager',
  finance: 'Finance & Ops',
  sales_rep: 'Sales Representative',
};

export default function AppLayout() {
  const { user, logoutUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = async () => {
    await logoutUser();
    navigate('/auth/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard, permission: 'QUOTATION_READ' },
    { label: 'Quotations', path: '/app/quotations', icon: FileText, permission: 'QUOTATION_READ' },
    { label: 'Approvals', path: '/app/approvals', icon: CheckSquare, role: ['admin', 'sales_manager', 'finance'] },
    { label: 'Fulfillment', path: '/app/fulfillment', icon: Truck, permission: 'FULFILLMENT_MANAGE' },
    { label: 'Subscriptions', path: '/app/subscriptions', icon: Repeat, role: ['admin', 'finance', 'sales_rep'] },
    { label: 'Invoices', path: '/app/invoices', icon: Receipt, permission: 'BILLING_RECONCILE' },
    { label: 'Deal Health', path: '/app/deal-health', icon: HeartPulse, permission: 'DEAL_HEALTH_VIEW' },
    { label: 'Reports', path: '/app/reports', icon: BarChart3, permission: 'REPORT_VIEW' },
    { label: 'Products', path: '/app/products', icon: Package, permission: 'PRODUCT_MANAGE' },
    { label: 'Users', path: '/app/users', icon: Users, permission: 'USER_MANAGE' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-display flex flex-col">
      {/* Top Application Navbar */}
      <header className="bg-white border-b-2 border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <Link to="/app/dashboard" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-white border-b-2 border-slate-200 flex items-center justify-center p-1 shadow-sm">
                <img src="/logo.png" alt="DealFlow360" className="w-full h-full object-contain" />
              </div>
              <span className="font-black text-xl tracking-tight text-slate-900">
                Deal<span className="text-brand-500">Flow</span>360
              </span>
            </Link>
          </div>

          {/* User Profile & RBAC Role Indicator */}
          <div className="flex items-center gap-4 relative">
            {user && (
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${
                    roleBadgeColors[user.role as UserRole] || 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {roleDisplayNames[user.role as UserRole] || user.role}
                </span>

                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors border border-slate-200"
                  >
                    <div className="w-8 h-8 rounded-lg bg-brand-500 text-white font-black text-xs flex items-center justify-center">
                      {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="text-xs font-extrabold text-slate-800 hidden sm:inline">
                      {user.fullName}
                    </span>
                    <ChevronDown size={14} className="text-slate-400" />
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border-2 border-slate-200 py-2 z-50">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs font-black text-slate-900">{user.fullName}</p>
                        <p className="text-[11px] font-bold text-slate-400 truncate">{user.email}</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors mt-1"
                      >
                        <LogOut size={14} />
                        Log Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Wireframe Module Navigation Bar */}
        <div className="bg-slate-100/80 border-t border-slate-200 overflow-x-auto">
          <div className="max-w-7xl mx-auto px-6 flex items-center gap-1 py-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);

              return (
                <PermissionGuard
                  key={item.path}
                  permission={item.permission}
                  role={item.role as any}
                >
                  <Link
                    to={item.path}
                    className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                    }`}
                  >
                    <Icon size={14} />
                    {item.label}
                  </Link>
                </PermissionGuard>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Workspace View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        <Routes>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="quotations" element={<PlaceholderModule name="Quotations & Builder" />} />
          <Route path="approvals" element={<PlaceholderModule name="Approvals Queue" />} />
          <Route path="fulfillment" element={<PlaceholderModule name="Fulfillment & Stock Allocation" />} />
          <Route path="subscriptions" element={<PlaceholderModule name="Recurring Subscriptions" />} />
          <Route path="invoices" element={<PlaceholderModule name="Invoices & Billing" />} />
          <Route path="deal-health" element={<PlaceholderModule name="Deal Health & Anomaly Detection" />} />
          <Route path="reports" element={<PlaceholderModule name="Commercial Performance Reports" />} />
          <Route path="products" element={<PlaceholderModule name="Products & Pricing Catalog" />} />
          <Route path="users" element={<PlaceholderModule name="User & Role Management" />} />
          <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function PlaceholderModule({ name }: { name: string }) {
  return (
    <div className="card-tactile bg-white rounded-3xl p-8 border-2 border-slate-200/80 shadow-sm text-center py-16">
      <div className="w-16 h-16 rounded-2xl bg-brand-50 border-2 border-brand-200 flex items-center justify-center mx-auto mb-4 text-brand-600">
        <FileText size={32} />
      </div>
      <h2 className="text-2xl font-black text-slate-900 mb-2">{name}</h2>
      <p className="text-slate-500 font-bold text-sm max-w-md mx-auto mb-6">
        Connected to DealFlow360 backend REST API (`/api/v1`). Backend authentication and RBAC authorization are active.
      </p>
      <Link to="/app/dashboard" className="btn-tactile btn-primary px-6 py-3 text-sm inline-flex items-center gap-2">
        Return to Dashboard
      </Link>
    </div>
  );
}
