import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, Plus } from 'lucide-react';
import { apiFetch } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

export default function SubscriptionsList() {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const [data, setData] = useState<{ stats: any, list: any[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await apiFetch('/subscriptions');
        setData(res);
      } catch (err) {
        console.error('Failed to load subscriptions:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-24 min-h-[60vh]">
        <Loader2 className="animate-spin text-brand-500" size={48} />
      </div>
    );
  }

  const stats = data?.stats || { active: 0, paused: 0, canceled: 0 };
  const list = data?.list || [];

  return (
    <div className="max-w-7xl mx-auto space-y-6 card-tactile bg-white p-6 sm:p-10 min-h-[calc(100vh-4rem)] relative mb-12">
      
      {/* Header Section */}
      <div>
        <h1 className="text-4xl font-display font-black text-slate-900 tracking-tight">
          Subscriptions (List)
        </h1>
        <p className="text-slate-500 font-bold text-base mt-2">
          Every recurring plan across every customer, regardless of which order it came from
        </p>
      </div>

      {/* Stats Row */}
      <div className="flex flex-wrap items-center gap-4 pt-4">
        <div className="bg-brand-500 text-white font-black px-5 py-2.5 rounded-xl border-b-4 border-brand-700 shadow-sm">
          {stats.active} Active
        </div>
        <div className="bg-amber-500 text-white font-black px-5 py-2.5 rounded-xl border-b-4 border-amber-700 shadow-sm">
          {stats.paused} Paused
        </div>
        <div className="bg-red-400 text-white font-black px-5 py-2.5 rounded-xl border-b-4 border-red-600 shadow-sm">
          {stats.canceled} Cancelled
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 overflow-hidden mt-6">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 border-b-2 border-slate-200">
            <tr>
              <th className="px-6 py-4 font-black uppercase tracking-wider text-xs">Customer</th>
              <th className="px-6 py-4 font-black uppercase tracking-wider text-xs">Plan</th>
              <th className="px-6 py-4 font-black uppercase tracking-wider text-xs">Cycle</th>
              <th className="px-6 py-4 font-black uppercase tracking-wider text-xs">Next Bill</th>
              <th className="px-6 py-4 font-black uppercase tracking-wider text-xs">Status</th>
            </tr>
          </thead>
          <tbody className="text-slate-900 divide-y-2 divide-slate-50">
            {list.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-bold">
                  No recurring plans found.
                </td>
              </tr>
            ) : (
              list.map((sub, idx) => (
                <tr 
                  key={idx} 
                  onClick={() => navigate(`/app/subscriptions/${sub.id}`)}
                  className="hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <td className="px-6 py-5 font-bold group-hover:text-brand-500 transition-colors">{sub.customerName}</td>
                  <td className="px-6 py-5 font-black text-slate-700">{sub.productName}</td>
                  <td className="px-6 py-5 font-bold text-slate-500 capitalize">{sub.interval}</td>
                  <td className="px-6 py-5 font-black text-slate-900">
                    {sub.status === 'canceled' ? '-' : new Date(sub.currentPeriodEnd).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-6 py-5 font-black capitalize text-slate-700">
                    {sub.status}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Info Box */}
      <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5 shadow-sm flex items-start gap-3 mt-6">
        <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={20} />
        <p className="text-amber-700 font-bold text-sm leading-relaxed">
          Click a subscription row to open its billing detail and proration history.
        </p>
      </div>

      {hasRole(['admin']) && (
        <div className="pt-4">
          <button className="btn-tactile bg-white border-2 border-slate-200 text-slate-800 hover:bg-slate-50 px-6 py-3 text-sm flex items-center gap-2 rounded-xl font-black">
            <Plus size={16} />
            New Plan (Admin)
          </button>
        </div>
      )}
    </div>
  );
}