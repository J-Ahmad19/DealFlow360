import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Loader2, Send, ShieldCheck } from 'lucide-react';
import { apiFetch, ApiError } from '../../lib/api';

const statusLabel: Record<string, string> = {
  draft: 'Draft',
  pending_approval: 'Pending Approval',
  approved: 'Approved',
  rejected: 'Rejected',
  revision_required: 'Revision Requested',
  fulfillment: 'Fulfillment',
  confirmed: 'Confirmed',
  under_negotiation: 'Under Negotiation',
};

export default function PortalQuotationNegotiationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [quote, setQuote] = useState<any>(null);
  const [lines, setLines] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [discount, setDiscount] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        if (!id) return;
        const response = await apiFetch(`/portal/quotations/${id}`);
        setQuote(response.data?.quotation ?? null);
        setLines(response.data?.lines ?? []);
      } catch (err: any) {
        console.error('Failed to load portal quotation', err);
        setToast({ type: 'error', message: err.message || 'Unable to load quotation' });
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  const total = useMemo(
    () => lines.reduce((sum, line) => sum + Number((line.total ?? 0) || 0), 0),
    [lines]
  );

  const handleDiscountChange = (lineId: string, value: string) => {
    const numeric = Math.max(0, Math.min(100, Number(value) || 0));
    setLines((current) =>
      current.map((line) =>
        line.id === lineId
          ? { ...line, discount: numeric }
          : line
      )
    );
  };

  const handleSubmitCounter = async () => {
    if (!id) return;
    if (!lines.some((line) => line.discount !== undefined && Number(line.discount) >= 0)) {
      setToast({ type: 'error', message: 'Please enter a valid discount request.' });
      return;
    }

    setSaving(true);
    try {
      const modifications = lines.map((line) => ({
        lineId: line.id,
        discount: Number(line.discount ?? 0),
      }));

      const result = await apiFetch(`/portal/quotations/${id}/counter-offer`, {
        method: 'POST',
        body: JSON.stringify({ modifications }),
      });

      if (result?.data?.status === 'pending_approval') {
        setToast({ type: 'success', message: 'Counter-offer submitted for approval.' });
      } else {
        setToast({ type: 'success', message: 'Counter-offer accepted and quote moved forward.' });
      }

      const refreshed = await apiFetch(`/portal/quotations/${id}`);
      setQuote(refreshed.data?.quotation ?? null);
      setLines(refreshed.data?.lines ?? []);
    } catch (err: any) {
      const error = err instanceof ApiError ? err.message : 'Unable to submit request.';
      setToast({ type: 'error', message: error });
    } finally {
      setSaving(false);
    }
  };

  const handleAddMessage = async () => {
    if (!id || !message.trim()) return;
    try {
      await apiFetch(`/portal/quotations/${id}/messages`, {
        method: 'POST',
        body: JSON.stringify({ message: message.trim() }),
      });
      setMessage('');
      setToast({ type: 'success', message: 'Comment sent to the sales team.' });
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Unable to send message.' });
    }
  };

  const handleConfirm = async () => {
    if (!id) return;
    setSubmitting(true);
    try {
      const result = await apiFetch(`/portal/quotations/${id}/confirm`, {
        method: 'POST',
        body: JSON.stringify({
          modifications: lines.map((line) => ({
            lineId: line.id,
            discount: Number(line.discount ?? 0),
          })),
        }),
      });

      const nextStatus = result?.data?.status ?? 'confirmed';
      setToast({
        type: 'success',
        message:
          nextStatus === 'pending_approval'
            ? 'Final terms exceeded the policy threshold and were routed back to approval.'
            : 'Quotation confirmed and moved directly to fulfillment.',
      });

      const refreshed = await apiFetch(`/portal/quotations/${id}`);
      setQuote(refreshed.data?.quotation ?? null);
      setLines(refreshed.data?.lines ?? []);
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Unable to confirm quotation.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <Loader2 className="animate-spin mr-3" size={20} />
        Loading quotation...
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="rounded-2xl border border-red-400 bg-red-500/10 p-8 text-red-100">
          Quotation not found or access denied.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 rounded-2xl border border-sky-400/30 bg-sky-500/10 px-4 py-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sm font-black">11</div>
              <div>
                <div className="text-xs uppercase tracking-[0.25em] text-sky-100/70">Customer Portal</div>
                <div className="text-2xl font-black">DealFlow360</div>
              </div>
            </div>
            <div className="flex gap-2"> 
              <button className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-bold">My Quotation</button>
              <button className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-bold">Messages</button>
              <button className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-bold">Profile</button>
            </div>
          </div>
        </div>

        <h1 className="mb-2 text-4xl font-black tracking-tight">Customer Portal Negotiation Screen</h1>
        <p className="mb-6 text-slate-400">Customer reviews and negotiates the quote directly, no email needed.</p>

        <div className="mb-8 inline-flex items-center rounded-xl border border-amber-400/40 bg-amber-500/10 px-4 py-2 text-sm font-black text-amber-200">
          Status: {statusLabel[quote.status] || quote.status}
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-900">
          <div className="grid grid-cols-1 gap-0 md:grid-cols-2">
            <div className="border-b border-slate-700 p-4 md:border-b-0 md:border-r">
              <div className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-slate-400">Quote</div>
              <div className="text-2xl font-black">{quote.title}</div>
            </div>
            <div className="p-4">
              <div className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-slate-400">Total</div>
              <div className="text-3xl font-black text-sky-300">${total.toLocaleString()}</div>
            </div>
          </div>

          <div className="border-t border-slate-700 p-4">
            <div className="mb-4 grid grid-cols-[1fr_2fr] gap-4 text-xs font-black uppercase tracking-[0.2em] text-slate-400">
              <div>Line</div>
              <div>Customer Comment</div>
            </div>

            <div className="space-y-3">
              {lines.map((line) => (
                <div key={line.id} className="grid grid-cols-[1fr_2fr] gap-4 rounded-xl border border-slate-700 bg-slate-800/80 p-3">
                  <div className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-slate-900 px-3 py-2">
                    <span className="font-bold text-white">{line.productNameSnapshot}</span>
                    <label className="text-xs uppercase tracking-[0.2em] text-slate-400">{line.quantity}x</label>
                  </div>
                  <div className="flex gap-3">
                    <input
                      value={line.discount ?? 0}
                      onChange={(e) => handleDiscountChange(line.id, e.target.value)}
                      className="w-full rounded-xl border border-slate-600 bg-slate-900 px-3 py-2 font-bold text-white outline-none focus:border-sky-400"
                      placeholder="Discount %"
                      type="number"
                      min={0}
                      max={100}
                    />
                    <button
                      type="button"
                      onClick={() => handleDiscountChange(line.id, String(Math.max(0, Number(line.discount ?? 0) - 5)))}
                      className="rounded-xl border border-slate-600 px-3 py-2 text-xs font-black uppercase tracking-[0.2em] text-slate-200"
                    >
                      -5%
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-700 p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm font-bold text-slate-300">Counter discount proposal</div>
              <div className="text-xs uppercase tracking-[0.25em] text-slate-500">Live review</div>
            </div>
            <div className="flex gap-3">
              <input
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                type="number"
                min={0}
                max={100}
                placeholder="e.g. 10"
                className="w-full rounded-xl border border-slate-600 bg-slate-900 px-3 py-3 font-bold text-white outline-none focus:border-sky-400"
              />
              <button
                type="button"
                onClick={() => {
                  const value = Number(discount ?? 0);
                  const next = Number.isFinite(value) ? value : 0;
                  setLines((current) => current.map((line) => ({ ...line, discount: next })));
                  setDiscount('');
                }}
                className="rounded-xl border border-sky-400 bg-sky-500/20 px-4 py-3 text-sm font-black text-sky-100"
              >
                Apply
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-lg font-black">Customer Comment</div>
              <button className="rounded-xl border border-slate-600 px-3 py-2 text-xs font-black uppercase tracking-[0.2em] text-slate-200">
                Submit Request
              </button>
            </div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="Add a line comment or request a change"
              className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 font-medium text-white outline-none focus:border-sky-400"
            />
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={handleAddMessage}
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-slate-800 px-4 py-2 text-sm font-black text-white"
              >
                <Send size={16} /> Send Comment
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4">
            <div className="mb-4 text-lg font-black">Actions</div>
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleSubmitCounter}
                disabled={saving}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-sky-500 bg-sky-600/20 px-4 py-3 text-sm font-black text-sky-100 disabled:opacity-70"
              >
                {saving ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                Submit Request
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-500 bg-emerald-600/20 px-4 py-3 text-sm font-black text-emerald-100 disabled:opacity-70"
              >
                {submitting ? <Loader2 className="animate-spin" size={16} /> : <ShieldCheck size={16} />}
                Confirm Quotation
              </button>
            </div>
          </div>
        </div>

        {toast && (
          <div className={`mt-6 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold ${toast.type === 'success' ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-100' : 'border-red-500/40 bg-red-500/10 text-red-100'}`}>
            {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {toast.message}
          </div>
        )}
      </div>
    </div>
  );
}
