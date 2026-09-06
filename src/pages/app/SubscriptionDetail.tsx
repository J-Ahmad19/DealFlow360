import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, AlertCircle } from 'lucide-react';
import { apiFetch } from '../../lib/api';

export default function SubscriptionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showModifyForm, setShowModifyForm] = useState(false);
  const [selectedInterval, setSelectedInterval] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');

  useEffect(() => {
    async function loadDetail() {
      try {
        const res = await apiFetch(`/subscriptions/${id}`);
        const nextData = res?.data || res;
        setData(nextData);
        if (nextData?.subscription?.interval) {
          setSelectedInterval(nextData.subscription.interval);
        }
      } catch (err) {
        console.error('Failed to load subscription detail:', err);
      } finally {
        setLoading(false);
      }
    }
    if (id) loadDetail();
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel? A prorated refund will be issued automatically.')) return;
    
    setActionLoading(true);
    try {
      const idempotencyKey = crypto.randomUUID();
      await apiFetch(`/subscriptions/${id}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ idempotencyKey }),
      });
      
      // Refresh the page data to show the new 'canceled' state
      const res = await apiFetch(`/subscriptions/${id}`);
      setData(res?.data || res);
    } catch (err: any) {
      alert(err.message || 'Failed to cancel subscription.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleModify = async () => {
    if (!id) return;

    setActionLoading(true);
    try {
      const idempotencyKey = crypto.randomUUID();
      const res = await apiFetch(`/subscriptions/${id}/modify`, {
        method: 'POST',
        body: JSON.stringify({ idempotencyKey, interval: selectedInterval }),
      });

      const refreshed = await apiFetch(`/subscriptions/${id}`);
      const nextData = refreshed?.data || refreshed;
      setData(nextData);
      setSelectedInterval(nextData?.subscription?.interval || selectedInterval);
      setShowModifyForm(false);
      alert(res?.message || 'Subscription modification initiated.');
    } catch (err: any) {
      alert(err.message || 'Failed to modify subscription.');
    } finally {
      setActionLoading(false);
    }
  };

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
  const isCanceled = sub.status === 'canceled';
  const proration = data.proration || { refundRate: 0, refundAmount: 0, creditNoteRequired: false };

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

      {isCanceled && (
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5 shadow-sm flex items-start gap-3">
          <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
          <p className="text-red-700 font-bold text-sm leading-relaxed">
            This subscription has been canceled. Any applicable prorated refunds have been issued.
          </p>
        </div>
      )}

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
                data.oneTimeLines.map((line: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
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
              {data.recurringLines.map((line: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-5 font-bold">{line.productName}</td>
                  <td className="px-6 py-5 font-black text-slate-900 capitalize">{sub.interval}</td>
                  <td className="px-6 py-5 font-bold text-slate-500">
                    {isCanceled ? '—' : new Date(sub.currentPeriodEnd).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-6 py-5 font-black text-slate-900">${line.total.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border-2 border-blue-200 bg-blue-50 p-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-blue-600">Upcoming billing</p>
            <p className="mt-2 text-2xl font-black text-slate-900">
              {sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
            </p>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-blue-600">Proration</p>
            <p className="mt-2 text-xl font-black text-slate-900">
              {proration.creditNoteRequired ? `$${Number(proration.refundAmount || 0).toLocaleString()} credit` : 'No credit required'}
            </p>
          </div>
        </div>
      </div>

      {!isCanceled && (
        <div className="space-y-5 pt-8 mt-8 border-t-2 border-slate-100">
          {showModifyForm && (
            <div className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-5">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Billing interval</p>
                  <select
                    value={selectedInterval}
                    onChange={(e) => setSelectedInterval(e.target.value as 'monthly' | 'quarterly' | 'yearly')}
                    className="w-full md:w-64 px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-900 font-bold focus:border-brand-500 focus:ring-0"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowModifyForm(false)}
                    className="btn-tactile bg-white border-2 border-slate-200 text-slate-700 px-5 py-3 text-sm rounded-xl font-black"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleModify}
                    disabled={actionLoading}
                    className="btn-tactile btn-primary px-5 py-3 text-sm rounded-xl font-black"
                  >
                    {actionLoading ? <Loader2 size={16} className="animate-spin" /> : 'Apply Changes'}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => setShowModifyForm((prev) => !prev)}
              disabled={actionLoading}
              className="btn-tactile bg-white border-2 border-slate-200 text-slate-800 hover:bg-slate-50 px-8 py-4 text-base flex items-center justify-center gap-2 rounded-2xl font-black transition-all disabled:opacity-50"
            >
              {actionLoading ? <Loader2 size={18} className="animate-spin" /> : null}
              Modify Subscription
            </button>

            <button
              onClick={handleCancel}
              disabled={actionLoading}
              className="btn-tactile bg-white border-2 border-red-500 text-red-600 hover:bg-red-50 active:border-b-0 active:translate-y-1 px-8 py-4 text-base flex items-center justify-center gap-2 rounded-2xl font-black transition-all disabled:opacity-50"
            >
              {actionLoading ? <Loader2 size={18} className="animate-spin" /> : null}
              Cancel Subscription
            </button>
          </div>
        </div>
      )}
    </div>
  );
}