import { Link } from 'react-router-dom';
import { Plus, Search, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import Breadcrumb from './Breadcrumb';
import UserMenu from './UserMenu';
import { PermissionGuard } from '../auth/PermissionGuard';

interface TopNavProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export default function TopNav({ sidebarOpen, onToggleSidebar }: TopNavProps) {
  return (
    <header className="bg-white border-b-2 border-slate-200 sticky top-0 z-30 shadow-sm h-16 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left: Sidebar Toggle & Breadcrumb Navigation */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
          title={sidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
          aria-label="Toggle navigation sidebar"
        >
          {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
        </button>

        {/* Mobile Logo */}
        <Link to="/app/dashboard" className="flex items-center gap-2 md:hidden">
          <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center p-1">
            <img src="/logo.png" alt="DealFlow360" className="w-full h-full object-contain" />
          </div>
        </Link>

        <div className="hidden sm:block">
          <Breadcrumb />
        </div>
      </div>

      {/* Center / Search Quick Command Input */}
      <div className="hidden lg:flex items-center flex-1 max-w-xs relative">
        <Search size={16} className="absolute left-3 text-slate-400" />
        <input
          type="text"
          placeholder="Search deals, quotes, customers... (⌘K)"
          className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-100/80 border border-slate-200/80 text-xs font-bold text-slate-800 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 outline-none transition-all placeholder:text-slate-400"
          readOnly
        />
      </div>

      {/* Right: Quick Action & User Profile Menu */}
      <div className="flex items-center gap-3">
        <PermissionGuard permission="QUOTATION_CREATE">
          <Link
            to="/app/quotations?action=new"
            className="btn-tactile btn-primary px-3.5 py-2 text-xs font-black hidden sm:flex items-center gap-1.5 shadow-sm"
          >
            <Plus size={16} />
            <span>New Quote</span>
          </Link>
        </PermissionGuard>

        <UserMenu />
      </div>
    </header>
  );
}
