import { useAuth, type UserRole } from '../contexts/AuthContext';
import { PermissionGuard } from '../components/auth/PermissionGuard';
import { Link } from 'react-router-dom';
import {
  FileText,
  CheckSquare,
  Clock,
  HeartPulse,
  BarChart3,
  Plus,
  ArrowRight,
  Activity,
  ShieldCheck
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();

  const roleLabel: Record<UserRole, string> = {
    admin: 'Administrator',
    sales_manager: 'Sales Manager',
    finance: 'Finance & Ops',
    sales_rep: 'Sales Representative',
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="card-tactile bg-white rounded-3xl p-8 border-2 border-slate-200/80 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 font-extrabold text-xs mb-3">
            <ShieldCheck size={14} />
            Authenticated User: {user?.role ? roleLabel[user.role as UserRole] || user.role : 'Sales Rep'}
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Sales Dashboard / Home
          </h1>
          <p className="text-slate-500 font-bold text-sm mt-1">
            Central hub for sales operations, commercial governance, and pipeline tracking.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <PermissionGuard permission="QUOTATION_CREATE">
            <Link
              to="/app/quotations?action=new"
              className="btn-tactile btn-primary px-5 py-3 text-sm flex items-center gap-2"
            >
              <Plus size={18} />
              + New Quotation
            </Link>
          </PermissionGuard>

          <PermissionGuard role={['admin', 'sales_manager', 'finance']}>
            <Link
              to="/app/approvals"
              className="btn-tactile btn-secondary px-5 py-3 text-sm flex items-center gap-2"
            >
              <CheckSquare size={18} />
              View Approvals
            </Link>
          </PermissionGuard>
        </div>
      </div>

      {/* Summary Cards Grid (Matching Wireframe Box 2) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Pending Approvals */}
        <PermissionGuard role={['admin', 'sales_manager', 'finance']}>
          <div className="rounded-3xl p-6 bg-amber-50 border-2 border-amber-200/80 shadow-sm relative overflow-hidden">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-white rounded-2xl border border-amber-200 shadow-sm text-amber-600">
                <Clock size={22} />
              </div>
              <span className="text-[11px] font-black text-amber-700 uppercase tracking-widest">
                Pending
              </span>
            </div>
            <p className="font-display text-4xl font-black text-slate-900 mb-1">4</p>
            <p className="text-xs font-bold text-amber-800">4 quotations waiting for approval</p>
          </div>
        </PermissionGuard>

        {/* Card 2: Open Quotations */}
        <div className="rounded-3xl p-6 bg-brand-50 border-2 border-brand-200/80 shadow-sm relative overflow-hidden">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-white rounded-2xl border border-brand-200 shadow-sm text-brand-600">
              <FileText size={22} />
            </div>
            <span className="text-[11px] font-black text-brand-700 uppercase tracking-widest">
              Active
            </span>
          </div>
          <p className="font-display text-4xl font-black text-slate-900 mb-1">12</p>
          <p className="text-xs font-bold text-brand-800">12 active deals in pipeline</p>
        </div>

        {/* Card 3: Deal Health Score */}
        <div className="rounded-3xl p-6 bg-purple-50 border-2 border-purple-200/80 shadow-sm relative overflow-hidden">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-white rounded-2xl border border-purple-200 shadow-sm text-purple-600">
              <HeartPulse size={22} />
            </div>
            <span className="text-[11px] font-black text-purple-700 uppercase tracking-widest">
              Health
            </span>
          </div>
          <p className="font-display text-4xl font-black text-slate-900 mb-1">94.2%</p>
          <p className="text-xs font-bold text-purple-800">0 critical anomalies detected</p>
        </div>

        {/* Card 4: Gross Margin */}
        <div className="rounded-3xl p-6 bg-blue-50 border-2 border-blue-200/80 shadow-sm relative overflow-hidden">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-white rounded-2xl border border-blue-200 shadow-sm text-blue-600">
              <BarChart3 size={22} />
            </div>
            <span className="text-[11px] font-black text-blue-700 uppercase tracking-widest">
              Margin
            </span>
          </div>
          <p className="font-display text-4xl font-black text-slate-900 mb-1">32.8%</p>
          <p className="text-xs font-bold text-blue-800">+1.4% vs last month</p>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Quotation Pipeline Overview */}
        <div className="lg:col-span-2 card-tactile bg-white rounded-3xl p-6 border-2 border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <div>
              <h2 className="font-display font-black text-slate-900 text-lg">Active Quotation Stream</h2>
              <p className="text-slate-400 font-bold text-xs">Recent active deals and commercial status</p>
            </div>
            <Link to="/app/quotations" className="text-xs font-black text-brand-600 hover:text-brand-700 flex items-center gap-1">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          <div className="space-y-3">
            {[
              { id: 'Q-1042', customer: 'Acme Corp', amount: '$151,040', status: 'PENDING_APPROVAL', risk: 'HIGH (Score: 72)', statusBg: 'bg-amber-100 text-amber-800' },
              { id: 'Q-1041', customer: 'Data Industries', amount: '$42,500', status: 'UNDER_NEGOTIATION', risk: 'LOW (Score: 12)', statusBg: 'bg-blue-100 text-blue-800' },
              { id: 'Q-1040', customer: 'Global Apex', amount: '$89,000', status: 'APPROVED', risk: 'LOW (Score: 5)', statusBg: 'bg-brand-100 text-brand-800' },
              { id: 'Q-1039', customer: 'TechCorp LLC', amount: '$24,000', status: 'FULFILLMENT', risk: 'LOW (Score: 0)', statusBg: 'bg-purple-100 text-purple-800' },
            ].map((item) => (
              <div key={item.id} className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/60 transition-all flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-slate-900">{item.id}</span>
                    <span className="text-xs font-bold text-slate-400">· {item.customer}</span>
                  </div>
                  <p className="text-xs font-bold text-slate-500 mt-0.5">Risk: {item.risk}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-sm text-slate-900">{item.amount}</p>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider mt-0.5 ${item.statusBg}`}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Feed (Matching Wireframe Box 2) */}
        <div className="card-tactile bg-white rounded-3xl p-6 border-2 border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <h2 className="font-display font-black text-slate-900 text-lg flex items-center gap-2">
              <Activity size={18} className="text-brand-500" />
              Recent Activity
            </h2>
          </div>

          <div className="space-y-4">
            {[
              { title: 'Acme Corp quotation approved by Finance', time: '10m ago', dot: 'bg-brand-500' },
              { title: 'Data Industries requested a discount change', time: '45m ago', dot: 'bg-amber-500' },
              { title: 'East Depot stock updated for Order #2291', time: '2h ago', dot: 'bg-blue-500' },
              { title: 'New counter-offer submitted for Q-1041', time: '3h ago', dot: 'bg-purple-500' },
              { title: 'Subscription recurring schedule processed', time: '5h ago', dot: 'bg-slate-400' },
            ].map((act, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div className={`w-2.5 h-2.5 rounded-full ${act.dot} mt-1.5 shrink-0`} />
                <div>
                  <p className="text-xs font-extrabold text-slate-800 leading-snug">{act.title}</p>
                  <p className="text-[11px] font-bold text-slate-400 mt-1">{act.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
