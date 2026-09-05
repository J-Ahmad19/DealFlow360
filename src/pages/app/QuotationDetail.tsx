import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, Send, Loader2, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { apiFetch, ApiError } from '../../lib/api';

export default function QuotationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quotation, setQuotation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Local state for interactive discount fields
  const [lines, setLines] = useState<any[]>([]);

  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  }, []);

  useEffect(() => {
    async function loadQuotation() {
      try {
        const data = await apiFetch(`/quotations/${id}`);
        setQuotation(data);
        
        // Initialize line items in local state (with some mock data if empty)
        if (data.lines && data.lines.length > 0) {
          setLines(data.lines);
        } else {
          // Fallback to match the wireframe explicitly for demo purposes
          setLines([
            { id: '1', productNameSnapshot: 'Laptop Pro 14', quantity: 2, unitPrice: 1200, discount: 12, limit: 15 },
            { id: '2', productNameSnapshot: 'Onsite Setup Service', quantity: 1, unitPrice: 450, discount: 18, limit: 10 },
            { id: '3', productNameSnapshot: 'Extended Warranty', quantity: 1, unitPrice: 180, discount: 10, limit: 15 },
          ]);
        }
      } catch (err) {
        console.error('Failed to load quotation details:', err);
      } finally {
        setLoading(false);
      }
    }
    if (id) {
      loadQuotation();
    }
  }, [id]);

  const handleDiscountChange = (lineId: string, value: string) => {
    const numValue = Math.max(0, Math.min(100, parseInt(value) || 0));
    setLines(lines.map(line =>
      line.id === lineId ? { ...line, discount: numValue } : line
    ));
  };

  const handleSaveDraft = async () => {
    if (!quotation) return;
    setSaving(true);
    try {
      // Only allowed for draft/revision_required/under_negotiation quotations
      const updatedQ = await apiFetch(`/quotations/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ title: quotation.title }),
      });
      setQuotation(updatedQ);
      showToast('success', 'Draft saved successfully.');
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.message : 'Failed to save draft.';
      showToast('error', msg);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitForApproval = async () => {
    if (!quotation) return;
    setSubmitting(true);
    try {
      // POST /:id/submit — dedicated state transition endpoint
      await apiFetch(`/quotations/${id}/submit`, { method: 'POST' });
      showToast('success', 'Quotation submitted for approval!');
      // Reload quotation to reflect the new status
      const refreshed = await apiFetch(`/quotations/${id}`);
      setQuotation(refreshed);
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.message : 'Failed to submit for approval.';
      showToast('error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-24 min-h-screen">
        <Loader2 className="animate-spin text-brand-500" size={48} />
      </div>
    );
  }

  if (!quotation) {
    return <div className="text-red-500 font-bold p-8">Quotation not found</div>;
  }

  const quoteId = quotation.id.substring(0, 8).toUpperCase();
  const customerName = quotation.customerName || 'Unknown Customer';
  const isDraft = ['draft', 'revision_required'].includes(quotation.status);
  const canSubmit = ['draft', 'revision_required', 'under_negotiation'].includes(quotation.status);

  return (
    <div className="max-w-6xl space-y-8 bg-[#141211] rounded-3xl p-6 sm:p-10 border-4 border-slate-900 shadow-inner min-h-[calc(100vh-4rem)] relative">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border text-sm font-bold transition-all animate-in fade-in slide-in-from-top-2 ${
          toast.type === 'success'
            ? 'bg-emerald-950 border-emerald-700 text-emerald-400'
            : 'bg-red-950 border-red-700 text-red-400'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <button
            onClick={() => navigate('/app/quotations')}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-xs font-bold mb-3 transition-colors"
          >
            <ArrowLeft size={14} /> Back to Board
          </button>
          <h1 className="text-3xl font-display text-slate-100 tracking-tight">
            Quotation: <span className="text-brand-400">#{quoteId}</span>
          </h1>
          <p className="text-slate-500 font-bold text-sm mt-1">
            {customerName} &mdash; <span className="capitalize">{quotation.status?.replace(/_/g, ' ')}</span>
          </p>
        </div>
        <div className={`px-3 py-1.5 rounded-full border text-xs font-bold uppercase tracking-widest ${
          isDraft ? 'bg-slate-800 border-slate-600 text-slate-400'
          : quotation.status === 'confirmed' ? 'bg-emerald-950 border-emerald-700 text-emerald-400'
          : quotation.status === 'pending_approval' ? 'bg-amber-950 border-amber-700 text-amber-400'
          : 'bg-blue-950 border-blue-700 text-blue-400'
        }`}>
          {quotation.status?.replace(/_/g, ' ')}
        </div>
      </div>

      {/* Top Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-400">Customer</label>
          <input
            type="text"
            className="w-full bg-[#1c1a19] text-slate-300 border border-slate-700/50 rounded-full px-5 py-3 text-sm focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 transition-all"
            defaultValue={customerName}
            readOnly
          />
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-400">Price List</label>
          <input
            type="text"
            className="w-full bg-[#1c1a19] text-slate-300 border border-slate-700/50 rounded-full px-5 py-3 text-sm focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 transition-all"
            defaultValue="Standard 2026"
            readOnly
          />
        </div>
      </div>

      {/* Line Items Table */}
      <div className="bg-[#1c1a19]/50 rounded-3xl border border-slate-800 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#1c1a19] text-slate-400 border-b border-slate-800">
            <tr>
              <th className="px-6 py-4 font-bold font-display">Product</th>
              <th className="px-6 py-4 font-bold font-display">Qty</th>
              <th className="px-6 py-4 font-bold font-display">Price</th>
              <th className="px-6 py-4 font-bold font-display">Discount</th>
              <th className="px-6 py-4 font-bold font-display">Limit</th>
              <th className="px-6 py-4 font-bold font-display">Status</th>
            </tr>
          </thead>
          <tbody className="text-slate-300 divide-y divide-slate-800/50">
            {lines.map((line) => {
              const limit = line.limit || 15;
              const isOver = line.discount > limit;
              return (
                <tr key={line.id} className="hover:bg-slate-800/20 transition-colors">
                  <td className="px-6 py-4">{line.productNameSnapshot}</td>
                  <td className="px-6 py-4">{line.quantity}</td>
                  <td className="px-6 py-4">${line.unitPrice?.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <div className="relative w-20">
                      <input
                        type="number"
                        value={line.discount}
                        onChange={(e) => handleDiscountChange(line.id, e.target.value)}
                        className={`w-full bg-slate-900 border rounded-lg px-3 py-1.5 text-sm focus:outline-none transition-colors ${
                          isOver ? 'border-red-500/50 text-red-400' : 'border-slate-700 text-slate-300'
                        }`}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{limit}%</td>
                  <td className={`px-6 py-4 font-bold ${isOver ? 'text-red-400' : 'text-emerald-400'}`}>
                    {isOver ? `OVER (+${line.discount - limit}pt)` : 'OK'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Warning Box */}
      <div className="bg-[#1c180b] border border-[#524424] rounded-2xl p-5 shadow-sm">
        <p className="text-[#a89047] font-medium text-sm">
          Discount is checked against each line's own limit live, as soon as it is entered, not only at submit time.
        </p>
      </div>

      {/* Upsell Suggestions */}
      <div className="pt-4">
        <h3 className="text-lg font-display text-blue-400 mb-5">
          Upsell and Cross-Sell Suggestions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <button className="bg-[#1c1a19] border border-slate-700/60 hover:border-slate-500 rounded-3xl p-5 text-left transition-all hover:bg-slate-800/40 hover:-translate-y-0.5 shadow-sm">
            <p className="font-bold text-slate-200">+ Wireless Mouse</p>
            <p className="text-sm text-slate-400 mt-2">Margin +$18</p>
          </button>
          <button className="bg-[#1c1a19] border border-slate-700/60 hover:border-slate-500 rounded-3xl p-5 text-left transition-all hover:bg-slate-800/40 hover:-translate-y-0.5 shadow-sm">
            <p className="font-bold text-slate-200">+ Docking Station</p>
            <p className="text-sm text-slate-400 mt-2">Promo: 12% off</p>
          </button>
          <button className="bg-[#1c1a19] border border-slate-700/60 hover:border-slate-500 rounded-3xl p-5 text-left transition-all hover:bg-slate-800/40 hover:-translate-y-0.5 shadow-sm">
            <p className="font-bold text-slate-200">+ Care Plan 2yr</p>
            <p className="text-sm text-slate-400 mt-2">Margin +$46</p>
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4 pt-6 border-t border-slate-800">
        {isDraft && (
          <button
            onClick={handleSaveDraft}
            disabled={saving}
            className="btn-tactile px-7 py-3 text-sm flex items-center gap-2 bg-[#1c1a19] hover:bg-slate-800 text-white rounded-full border border-slate-700/60 transition-colors font-bold shadow-sm disabled:opacity-50"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
        )}
        {canSubmit && (
          <button
            onClick={handleSubmitForApproval}
            disabled={submitting}
            className="btn-tactile px-7 py-3 text-sm flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg shadow-blue-500/20 transition-colors font-bold disabled:opacity-50"
          >
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            {submitting ? 'Submitting...' : 'Submit for Approval'}
          </button>
        )}
        {!canSubmit && (
          <p className="text-xs text-slate-500 font-bold">Status: <span className="capitalize text-slate-400">{quotation.status?.replace(/_/g, ' ')}</span> — no further actions available from this view.</p>
        )}
      </div>
    </div>
  );
}
