import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft } from 'lucide-react';
import { apiFetch } from '../../lib/api';

export default function SubscriptionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDetail() {
      try {
        const res = await apiFetch(`/subscriptions/${id}`);
        setData(res);
      } catch (err) {
        console.error('Failed to load subscription detail:', err);
      } finally {
        setLoading(false);
      }
    }
    if (id) loadDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-24 min-h-[60vh]">
        <Loader2 className="animate-spin text-brand-500" size={48} />
      </div>
    );
  }

  if (!data || !data.subscription) {
    return (
      <div className="max-w-6xl mx-auto card-tactile bg-white p-8 text-center mt-12">
        <h2 className="text-2xl font-black text-slate-900">Subscription not found</h2>
        <button onClick={() => navigate('/app/subscriptions')} className="btn-tactile btn-primary px-6 py-3 mt-6">
          Return to Subscriptions
        </button>
      </div>
    );
  }

  const sub = data.subscription;

  return (
    <div className="max-w-6xl mx-auto space-y-8 card-tactile bg-white p-6 sm:p-10 min-h-[calc(100vh-4rem)] relative mb-12">
      
      <div>
        <button
          onClick={() => navigate('/app/subscriptions')}
          className="flex items-center gap-1.5 text-slate-400 hover:text-brand-500 text-xs font-black uppercase tracking-widest mb-4 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Subscriptions
        </button>
        <h1 className="text-4xl font-display font-black text-slate-900 tracking-tight">
          Billing Detail: {sub.customerName} - {sub.productName}
        </h1>
        <p className="text-slate-500 font-bold text-base mt-2">
          Opened by clicking a row on the Subscriptions list
        </p>
      </div>

      <div className="pt-2">
        <h3 className="text-xl font-black text-blue-500 mb-4">One-Time Lines (from originating order)</h3>
        <div className="bg-white rounded-3xl border-2 border-slate-200 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 border-b-2 border-slate-200">
              <tr>
                <th className="px-6 py-4 font-black uppercase tracking-wider text-xs">Product</th>
                <th className="px-6 py-4 font-black uppercase tracking-wider text-xs">Qty</th>
                <th className="px-6 py-4 font-black uppercase tracking-wider text-xs">Amount</th>
              </tr>
            </thead>
            <tbody className="text-slate-900 divide-y-2 divide-slate-50">
              {data.oneTimeLines.length === 0 ? (
                <tr><td colSpan={3} className="px-6 py-6 text-center font-bold text-slate-400">No one-time products in the original order.</td></tr>
              ) : (
                data.oneTimeLines.map((line: any) => (
                  <tr key={line.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-5 font-bold">{line.productName}</td>
                    <td className="px-6 py-5 font-black text-slate-900">{line.quantity}</td>
                    <td className="px-6 py-5 font-black text-slate-900">${line.total.toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="pt-2">
        <h3 className="text-xl font-black text-blue-500 mb-4">Recurring Lines</h3>
        <div className="bg-white rounded-3xl border-2 border-slate-200 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 border-b-2 border-slate-200">
              <tr>
                <th className="px-6 py-4 font-black uppercase tracking-wider text-xs">Plan</th>
                <th className="px-6 py-4 font-black uppercase tracking-wider text-xs">Cycle</th>
                <th className="px-6 py-4 font-black uppercase tracking-wider text-xs">Next Bill Date</th>
                <th className="px-6 py-4 font-black uppercase tracking-wider text-xs">Amount</th>
              </tr>
            </thead>
            <tbody className="text-slate-900 divide-y-2 divide-slate-50">
              {data.recurringLines.map((line: any) => (
                <tr key={line.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-5 font-bold">{line.productName}</td>
                  <td className="px-6 py-5 font-black text-slate-900 capitalize">{sub.interval}</td>
                  <td className="px-6 py-5 font-bold text-slate-500">
                    {new Date(sub.currentPeriodEnd).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-6 py-5 font-black text-slate-900">${line.total.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {sub.status === 'active' && (
        <div className="flex flex-wrap items-center gap-4 pt-8 mt-8 border-t-2 border-slate-100">
          <button className="btn-tactile bg-white border-2 border-slate-200 text-slate-800 hover:bg-slate-50 px-8 py-4 text-base flex items-center justify-center gap-2 rounded-2xl font-black transition-all">
            Modify Subscription
          </button>
          
          <button className="btn-tactile bg-white border-2 border-red-500 text-red-600 hover:bg-red-50 active:border-b-0 active:translate-y-1 px-8 py-4 text-base flex items-center justify-center gap-2 rounded-2xl font-black transition-all">
            Cancel Subscription
          </button>
        </div>
      )}
    </div>
  );
}
