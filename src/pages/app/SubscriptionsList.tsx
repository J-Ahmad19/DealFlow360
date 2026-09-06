import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, Plus, X } from 'lucide-react';
import { apiFetch } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

type FormState = {
  customerId: string;
  productId: string;
  interval: 'monthly' | 'quarterly' | 'yearly';
};

export default function SubscriptionsList() {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const [data, setData] = useState<{ stats: any, list: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<Array<{ id: string; name: string }>>([]);
  const [products, setProducts] = useState<Array<{ id: string; name: string }>>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    customerId: '',
    productId: '',
    interval: 'monthly',
  });

  const loadData = async () => {
    try {
      const [subsRes, companiesRes, productsRes] = await Promise.all([
        apiFetch('/subscriptions'),
        apiFetch('/companies').catch(() => []),
        apiFetch('/products').catch(() => []),
      ]);

      setData(subsRes);
      setCustomers(Array.isArray(companiesRes) ? companiesRes : companiesRes?.data ?? []);
      setProducts(Array.isArray(productsRes) ? productsRes : productsRes?.data ?? []);
    } catch (err) {
      console.error('Failed to load subscriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleCreate = async () => {
    if (!form.customerId || !form.productId) {
      setError('Please select both a customer and a product.');
      return;
    }

    try {
      setCreating(true);
      setError(null);
      await apiFetch('/subscriptions', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setShowCreateModal(false);
      setForm({ customerId: '', productId: '', interval: 'monthly' });
      await loadData();
    } catch (err: any) {
      console.error('Failed to create subscription:', err);
      setError(err.message || 'Unable to create subscription.');
    } finally {
      setCreating(false);
    }
  };

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
      <div>
        <h1 className="text-4xl font-display font-black text-slate-900 tracking-tight">
          Subscriptions (List)
        </h1>
        <p className="text-slate-500 font-bold text-base mt-2">
          Every recurring plan across every customer, regardless of which order it came from
        </p>
      </div>

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

      <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5 shadow-sm flex items-start gap-3 mt-6">
        <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={20} />
        <p className="text-amber-700 font-bold text-sm leading-relaxed">
          Click a subscription row to open its billing detail and proration history.
        </p>
      </div>

      {hasRole(['admin']) && (
        <div className="pt-4">
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="btn-tactile bg-white border-2 border-slate-200 text-slate-800 hover:bg-slate-50 px-6 py-3 text-sm flex items-center gap-2 rounded-xl font-black"
          >
            <Plus size={16} />
            New Plan (Admin)
          </button>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/55 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-2xl rounded-[24px] border-2 border-slate-200 bg-white p-6 shadow-[0_16px_0_#e2e8f0]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-slate-900">Create subscription</h2>
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  setError(null);
                }}
                className="rounded-xl border-2 border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
                aria-label="Close create subscription form"
              >
                <X size={16} />
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">{error}</div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.22em] text-slate-500 mb-2">Customer</label>
                <select
                  value={form.customerId}
                  onChange={(e) => setForm((prev) => ({ ...prev, customerId: e.target.value }))}
                  className="w-full border-2 border-slate-200 bg-slate-50 rounded-xl px-4 py-3 text-slate-900 font-bold focus:border-brand-500 focus:outline-none"
                >
                  <option value="">Select customer</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>{customer.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.22em] text-slate-500 mb-2">Product</label>
                <select
                  value={form.productId}
                  onChange={(e) => setForm((prev) => ({ ...prev, productId: e.target.value }))}
                  className="w-full border-2 border-slate-200 bg-slate-50 rounded-xl px-4 py-3 text-slate-900 font-bold focus:border-brand-500 focus:outline-none"
                >
                  <option value="">Select product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>{product.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.22em] text-slate-500 mb-2">Billing interval</label>
                <select
                  value={form.interval}
                  onChange={(e) => setForm((prev) => ({ ...prev, interval: e.target.value as FormState['interval'] }))}
                  className="w-full border-2 border-slate-200 bg-slate-50 rounded-xl px-4 py-3 text-slate-900 font-bold focus:border-brand-500 focus:outline-none"
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  setError(null);
                }}
                className="btn-tactile btn-secondary px-5 py-3 text-[11px] font-black tracking-[0.18em]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreate}
                disabled={creating}
                className="btn-tactile btn-primary px-5 py-3 text-[11px] font-black tracking-[0.18em]"
              >
                {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                {creating ? 'Creating...' : 'Create Subscription'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}