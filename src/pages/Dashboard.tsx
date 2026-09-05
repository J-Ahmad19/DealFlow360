import { useState, useEffect } from 'react';
import { PermissionGuard } from '../components/auth/PermissionGuard';
import { Link } from 'react-router-dom';
import { CheckSquare, Plus, Loader2 } from 'lucide-react';
import { apiFetch } from '../lib/api';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await apiFetch('/dashboard/stats');
        setStats(data);
      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);
  return (
    <div className="space-y-8 max-w-5xl">
      {/* Welcome Banner */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Sales Dashboard / Home
        </h1>
        <p className="text-slate-500 font-bold text-sm mt-1">
          Central hub, links out to every module below
        </p>
      </div>

      {/* Summary Cards Grid (Matching Wireframe Box 2) */}
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="animate-spin text-slate-400" size={32} />
        </div>
      ) : (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Card 1: Pending Approvals */}
        <PermissionGuard role={['admin', 'sales_manager', 'finance']}>
          <div className="rounded-3xl p-6 bg-slate-900 text-white shadow-sm relative overflow-hidden h-32 flex flex-col justify-between">
            <h3 className="font-display font-black text-sm text-slate-100">Pending Approvals</h3>
            <p className="text-xs font-bold text-slate-400">{stats?.pendingApprovals || 0} quotations waiting</p>
          </div>
        </PermissionGuard>

        {/* Card 2: Open Quotations */}
        <div className="rounded-3xl p-6 bg-slate-900 text-white shadow-sm relative overflow-hidden h-32 flex flex-col justify-between">
          <h3 className="font-display font-black text-sm text-slate-100">Open Quotations</h3>
          <p className="text-xs font-bold text-slate-400">{stats?.openQuotations || 0} active deals</p>
        </div>

        {/* Card 3: At-Risk Deals */}
        <div className="rounded-3xl p-6 bg-slate-900 text-white shadow-sm relative overflow-hidden h-32 flex flex-col justify-between">
          <h3 className="font-display font-black text-sm text-slate-100">At-Risk Deals</h3>
          <p className="text-xs font-bold text-slate-400">{stats?.atRiskDeals || 0} flagged by Deal Health</p>
        </div>
      </div>
      )}

      {/* Quick Actions (Below Cards) */}
      <div className="flex items-center gap-4 shrink-0">
        <PermissionGuard permission="QUOTATION_CREATE">
          <Link
            to="/app/quotations?action=new"
            className="btn-tactile btn-primary px-6 py-3 text-sm flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl"
          >
            <Plus size={18} />
            + New Quotation
          </Link>
        </PermissionGuard>

        <PermissionGuard role={['admin', 'sales_manager', 'finance']}>
          <Link
            to="/app/approvals"
            className="btn-tactile px-6 py-3 text-sm flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl"
          >
            <CheckSquare size={18} />
            View Approvals
          </Link>
        </PermissionGuard>
      </div>

      {/* Recent Activity Feed (Matching Wireframe Box 2) */}
      <div className="pt-4">
        <h2 className="font-display font-black text-slate-900 text-lg mb-4 text-blue-500 flex items-center gap-2">
          Recent Activity
        </h2>

        <div className="space-y-3">
          {loading ? (
            <p className="text-sm font-bold text-slate-400 leading-snug">Loading...</p>
          ) : (
            stats?.recentActivity?.map((title: string, idx: number) => (
              <p key={idx} className="text-sm font-bold text-slate-800 leading-snug">
                {title}
              </p>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
