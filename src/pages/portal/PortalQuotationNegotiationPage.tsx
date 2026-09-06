import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Loader2, Send, ShieldCheck, CreditCard } from 'lucide-react';
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
  paid: 'Paid',
};

// Helper function to load the Razorpay SDK dynamically
const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function PortalQuotationNegotiationPage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [quote, setQuote] = useState<any>(null);
  const [lines, setLines] = useState<any[]>([]);
  const [overallDiscount, setOverallDiscount] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Granular control over what is locked based on logical business steps
  const isNegotiationLocked = useMemo(() => {
    if (!quote) return true;
    // Customer cannot negotiate if it's already pending internal approval, confirmed, paid, etc.
    const lockedStatuses = ['pending_approval', 'confirmed', 'paid', 'fulfillment', 'rejected'];
    return lockedStatuses.includes(quote.status);
  }, [quote]);

  const isConfirmationLocked = useMemo(() => {
    if (!quote) return true;
    // Customer can only confirm if the quote is approved, or maybe under negotiation/draft.
    // They cannot confirm if it's already confirmed, paid, or waiting on sales approval.
    const lockedStatuses = ['pending_approval', 'confirmed', 'paid', 'fulfillment', 'rejected'];
    return lockedStatuses.includes(quote.status);
  }, [quote]);

  useEffect(() => {
    async function load() {
      try {
        if (!id) return;
        const response = await apiFetch(`/portal/quotations/${id}`);
        setQuote(response.data?.quotation ?? null);
        
        const initializedLines = (response.data?.lines ?? []).map((line: any) => ({
          ...line,
          inputDiscount: line.discount !== null && line.discount !== undefined ? String(line.discount) : '0'
        }));
        setLines(initializedLines);
      } catch (err: any) {
        setToast({ type: 'error', message: err.message || 'Unable to load quotation' });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const total = useMemo(
    () => lines.reduce((sum, line) => sum + Number(line.total ?? 0), 0),
    [lines]
  );

  const handleLineDiscountChange = (lineId: string, value: string) => {
    if (value !== '' && !/^\d+$/.test(value)) return;
    setLines((current) =>
      current.map((line) => (line.id === lineId ? { ...line, inputDiscount: value } : line))
    );
  };

  const handleLineDiscountBlur = (lineId: string) => {
    setLines((current) =>
      current.map((line) => {
        if (line.id !== lineId) return line;
        let numeric = Number(line.inputDiscount);
        if (isNaN(numeric)) numeric = 0;
        numeric = Math.max(0, Math.min(100, numeric)); 
        return { ...line, inputDiscount: String(numeric) };
      })
    );
  };

  const handleApplyOverallDiscount = () => {
    let numeric = Number(overallDiscount);
    if (isNaN(numeric) || overallDiscount === '') return;
    numeric = Math.max(0, Math.min(100, numeric));

    setLines((current) => 
      current.map((line) => ({ ...line, inputDiscount: String(numeric) }))
    );
    setOverallDiscount('');
  };

  const handleSubmitCounter = async () => {
    if (!id || isNegotiationLocked) return;

    setSaving(true);
    try {
      const modifications = lines.map((line) => {
        let disc = Number(line.inputDiscount);
        return {
          lineId: line.id,
          discount: isNaN(disc) ? 0 : Math.max(0, Math.min(100, disc)),
        };
      });

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
      setLines((refreshed.data?.lines ?? []).map((l: any) => ({ ...l, inputDiscount: String(l.discount || 0) })));
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Unable to submit request.' });
    } finally {
      setSaving(false);
    }
  };

  const handleConfirm = async () => {
    if (!id || isConfirmationLocked) return;
    setSubmitting(true);
    try {
      const modifications = lines.map((line) => ({
        lineId: line.id,
        discount: Number(line.inputDiscount) || 0,
      }));

      const result = await apiFetch(`/portal/quotations/${id}/confirm`, {
        method: 'POST',
        body: JSON.stringify({ modifications }),
      });

      const nextStatus = result?.data?.status ?? 'confirmed';
      setToast({
        type: 'success',
        message: nextStatus === 'pending_approval'
            ? 'Final terms exceeded the policy threshold and were routed back to approval.'
            : 'Quotation confirmed successfully.',
      });

      const refreshed = await apiFetch(`/portal/quotations/${id}`);
      setQuote(refreshed.data?.quotation ?? null);
      setLines((refreshed.data?.lines ?? []).map((l: any) => ({ ...l, inputDiscount: String(l.discount || 0) })));
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Unable to confirm quotation.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white"><Loader2 className="animate-spin mr-3" size={20} />Loading quotation...</div>;
  if (!quote) return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="rounded-2xl border border-red-400 bg-red-500/10 p-8 text-red-100">Quotation not found.</div></div>;

  return (
    <div className="min-h-screen bg-[#0b1221] text-white font-sans">
      <div className="mx-auto max-w-6xl px-4 py-8">
        
        <div className="mb-6 rounded-2xl border border-white/10 bg-[#0f172a] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm font-black">11</div>
            <div>
              <div className="text-xs font-bold tracking-widest text-slate-400 uppercase">Customer Portal</div>
              <div className="text-2xl font-black">DealFlow360</div>
            </div>
          </div>
          <div className="flex gap-2"> 
            <button className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold hover:bg-white/10 transition">My Quotation</button>
            <button className="rounded-xl border border-white/10 bg-transparent px-4 py-2 text-sm font-bold hover:bg-white/5 transition">Messages</button>
            <button className="rounded-xl border border-white/10 bg-transparent px-4 py-2 text-sm font-bold hover:bg-white/5 transition">Profile</button>
          </div>
        </div>

        <h1 className="mb-2 text-3xl font-black">Customer Portal Negotiation Screen</h1>
        <p className="mb-6 text-slate-400 text-sm">Customer reviews and negotiates the quote directly, no email needed.</p>

        <div className={`mb-8 inline-flex items-center rounded-full border px-4 py-1.5 text-xs font-black uppercase tracking-wider ${
          quote.status === 'pending_approval' ? 'border-amber-500/40 bg-amber-500/10 text-amber-300' :
          quote.status === 'confirmed' ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' :
          'border-sky-500/40 bg-sky-500/10 text-sky-300'
        }`}>
          Status: {statusLabel[quote.status] || quote.status}
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-700/60 bg-[#0f172a] mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="border-b border-slate-700/60 p-6 md:border-b-0 md:border-r">
              <div className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-400">Quote</div>
              <div className="text-2xl font-black">{quote.title}</div>
            </div>
            <div className="p-6">
              <div className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-400">Total</div>
              <div className="text-3xl font-black text-sky-400">${total.toLocaleString()}</div>
            </div>
          </div>

          <div className="border-t border-slate-700/60 p-6">
            <div className="mb-4 grid grid-cols-[1fr_2fr] gap-4 text-xs font-bold uppercase tracking-widest text-slate-400">
              <div>Line</div>
              <div>Customer Comment (Discount Request)</div>
            </div>

            <div className="space-y-4">
              {lines.map((line) => (
                <div key={line.id} className="grid grid-cols-[1fr_2fr] gap-4">
                  <div className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3">
                    <span className="font-semibold text-sm">{line.productNameSnapshot}</span>
                    <span className="text-xs font-bold text-slate-500">{line.quantity}X</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={line.inputDiscount}
                      onChange={(e) => handleLineDiscountChange(line.id, e.target.value)}
                      onBlur={() => handleLineDiscountBlur(line.id)}
                      disabled={isNegotiationLocked}
                      className="w-full rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm font-semibold text-white outline-none focus:border-sky-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="0"
                    />
                    <button
                      type="button"
                      onClick={() => {
                         const current = Number(line.inputDiscount) || 0;
                         handleLineDiscountChange(line.id, String(Math.max(0, current - 5)));
                         handleLineDiscountBlur(line.id);
                      }}
                      disabled={isNegotiationLocked}
                      className="shrink-0 rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-xs font-bold text-slate-300 hover:bg-slate-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      - 5 %
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-700/60 p-6">
            <div className="mb-3 flex justify-between">
              <label className="text-xs font-bold text-slate-400">Counter discount proposal</label>
              <span className="text-xs font-bold tracking-widest text-slate-500 uppercase">Live Review</span>
            </div>
            <div className="flex gap-3">
              <input
                type="text"
                value={overallDiscount}
                onChange={(e) => {
                  if (e.target.value === '' || /^\d+$/.test(e.target.value)) {
                    setOverallDiscount(e.target.value);
                  }
                }}
                disabled={isNegotiationLocked}
                placeholder="e.g. 10"
                className="w-full rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm font-semibold outline-none focus:border-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="button"
                onClick={handleApplyOverallDiscount}
                disabled={isNegotiationLocked || !overallDiscount}
                className="rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/50 px-6 py-3 text-sm font-bold hover:bg-sky-500/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Apply
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-[1fr_300px]">
          <div className="rounded-2xl border border-slate-700/60 bg-[#0f172a] p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold">Customer Comment</h2>
            </div>
            <textarea
              rows={4}
              placeholder="Add a line comment or request a change"
              className="w-full resize-none rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm outline-none focus:border-sky-500 mb-4"
            />
            <div className="flex justify-end">
              <button className="flex items-center gap-2 rounded-xl border border-slate-600 bg-transparent px-4 py-2 text-sm font-bold text-slate-300 hover:bg-slate-800 transition">
                <Send size={14} /> Send Comment
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-700/60 bg-[#0f172a] p-6">
            <h2 className="mb-4 font-bold">Actions</h2>
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleSubmitCounter}
                disabled={saving || isNegotiationLocked}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-sky-500/50 bg-sky-500/10 px-4 py-3 text-sm font-bold text-sky-400 transition hover:bg-sky-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {saving ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                Submit Request
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={submitting || isConfirmationLocked}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/50 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-400 transition hover:bg-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting ? <Loader2 className="animate-spin" size={16} /> : <ShieldCheck size={16} />}
                Confirm Quotation
              </button>
            </div>
          </div>
        </div>

        {toast && (
          <div className="mt-6 flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-400">
            <CheckCircle2 size={16} /> {toast.message}
          </div>
        )}
      </div>
    </div>
  );
}