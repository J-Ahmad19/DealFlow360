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
  const [lines, setLines] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  }, []);

  useEffect(() => {
    async function loadQuotation() {
      try {
        const data = await apiFetch(`/quotations/${id}`);
        setQuotation(data);

        if (data.lines && data.lines.length > 0) {
          setLines(data.lines);
        } else {
          setLines([
            { id: '1', productId: 'mock-uuid-1', productNameSnapshot: 'Laptop Pro 14', quantity: 2, unitPrice: 1200, discount: 12, limit: 15 },
            { id: '2', productId: 'mock-uuid-2', productNameSnapshot: 'Onsite Setup Service', quantity: 1, unitPrice: 450, discount: 18, limit: 10 },
            { id: '3', productId: 'mock-uuid-3', productNameSnapshot: 'Extended Warranty', quantity: 1, unitPrice: 180, discount: 10, limit: 15 },
          ]);
        }

        const recommendationsPayload = await apiFetch(`/quotations/${id}/recommendations`);
        const list = Array.isArray(recommendationsPayload?.data) ? recommendationsPayload.data : [];
        setRecommendations(list);
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
      const payloadLines = lines.map(line => ({
        productId: line.productId,
        quantity: Number(line.quantity),
        discount: Number(line.discount)
      }));

      const updatedQ = await apiFetch(`/quotations/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ 
          title: quotation.title,
          lines: payloadLines 
        }),
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
      await apiFetch(`/quotations/${id}/submit`, { method: 'POST' });
      showToast('success', 'Quotation submitted for approval!');
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
    return (
      <div className="max-w-6xl mx-auto card-tactile bg-white p-8 text-center mt-12">
        <h2 className="text-2xl font-black text-slate-900">Quotation not found</h2>
        <button onClick={() => navigate('/app/quotations')} className="btn-tactile btn-primary px-6 py-3 mt-6">
          Return to Board
        </button>
      </div>
    );
  }

  const quoteId = quotation.id.substring(0, 8).toUpperCase();
  const customerName = quotation.customerName || 'Unknown Customer';
  const isDraft = ['draft', 'revision_required'].includes(quotation.status);
  const canSubmit = ['draft', 'revision_required', 'under_negotiation'].includes(quotation.status);

  return (
    <div className="max-w-6xl mx-auto space-y-8 card-tactile bg-white p-6 sm:p-10 min-h-[calc(100vh-4rem)] relative mb-12">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border-2 text-sm font-black transition-all animate-in fade-in slide-in-from-top-2 ${
          toast.type === 'success'
            ? 'bg-brand-50 border-brand-500 text-brand-600'
            : 'bg-red-50 border-red-500 text-red-600'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          {toast.message}
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/app/quotations')}
            className="flex items-center gap-1.5 text-slate-400 hover:text-brand-500 text-xs font-black uppercase tracking-widest mb-4 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Board
          </button>
          <h1 className="text-4xl font-display font-black text-slate-900 tracking-tight">
            Quotation <span className="text-brand-500">#{quoteId}</span>
          </h1>
          <p className="text-slate-500 font-bold text-base mt-2">
            {customerName}
          </p>
        </div>
        
        {/* Status Badge */}
        <div className={`px-4 py-2 rounded-xl border-2 text-xs font-black uppercase tracking-widest ${
          isDraft ? 'bg-slate-100 border-slate-200 text-slate-500'
          : quotation.status === 'confirmed' ? 'bg-brand-50 border-brand-200 text-brand-600'
          : ['pending_approval', 'revision_required'].includes(quotation.status) ? 'bg-amber-50 border-amber-200 text-amber-600'
          : 'bg-blue-50 border-blue-200 text-blue-600'
        }`}>
          {quotation.status?.replace(/_/g, ' ')}
        </div>
      </div>

      {/* Top Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-3xl border-2 border-slate-100">
        <div className="space-y-2">
          <label className="block text-xs font-black uppercase tracking-widest text-slate-500">Customer</label>
          <input
            type="text"
            className="w-full bg-white text-slate-900 border-2 border-slate-200 rounded-2xl px-5 py-3 text-base font-bold focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/20 transition-all"
            defaultValue={customerName}
            readOnly
          />
        </div>
        <div className="space-y-2">
          <label className="block text-xs font-black uppercase tracking-widest text-slate-500">Price List</label>
          <input
            type="text"
            className="w-full bg-white text-slate-900 border-2 border-slate-200 rounded-2xl px-5 py-3 text-base font-bold focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/20 transition-all"
            defaultValue="Standard 2026"
            readOnly
          />
        </div>
      </div>

      {/* Line Items Table */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 border-b-2 border-slate-200">
            <tr>
              <th className="px-6 py-4 font-black uppercase tracking-wider text-xs">Product</th>
              <th className="px-6 py-4 font-black uppercase tracking-wider text-xs">Qty</th>
              <th className="px-6 py-4 font-black uppercase tracking-wider text-xs">Price</th>
              <th className="px-6 py-4 font-black uppercase tracking-wider text-xs">Discount</th>
              <th className="px-6 py-4 font-black uppercase tracking-wider text-xs">Limit</th>
              <th className="px-6 py-4 font-black uppercase tracking-wider text-xs">Status</th>
            </tr>
          </thead>
          <tbody className="text-slate-900 divide-y-2 divide-slate-50">
            {lines.map((line) => {
              const limit = line.limit || 15;
              const isOver = line.discount > limit;
              return (
                <tr key={line.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-5 font-bold">{line.productNameSnapshot}</td>
                  <td className="px-6 py-5 font-bold">{line.quantity}</td>
                  <td className="px-6 py-5 font-bold">${line.unitPrice?.toLocaleString()}</td>
                  <td className="px-6 py-5">
                    <div className="relative w-24">
                      <input
                        type="number"
                        value={line.discount}
                        onChange={(e) => handleDiscountChange(line.id, e.target.value)}
                        disabled={!isDraft && quotation.status !== 'under_negotiation'}
                        className={`w-full bg-white border-2 rounded-xl px-4 py-2 text-base font-black focus:outline-none focus:ring-4 transition-all ${
                          isOver 
                            ? 'border-red-400 text-red-600 focus:border-red-500 focus:ring-red-500/20' 
                            : 'border-slate-200 text-slate-900 focus:border-brand-500 focus:ring-brand-500/20'
                        } disabled:opacity-50 disabled:bg-slate-50`}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-black pointer-events-none">%</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-slate-400 font-bold">{limit}%</td>
                  <td className={`px-6 py-5 font-black ${isOver ? 'text-red-500' : 'text-brand-500'}`}>
                    {isOver ? `OVER (+${line.discount - limit}pt)` : 'OK'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Warning Box */}
      <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5 shadow-sm flex items-start gap-3">
        <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={20} />
        <p className="text-amber-700 font-bold text-sm leading-relaxed">
          Discount is checked against each line's own limit live, as soon as it is entered, not only at submit time.
        </p>
      </div>

      {/* Upsell Suggestions */}
      <div className="pt-6">
        <h3 className="text-xl font-black text-secondary-500 mb-6">
          Upsell and Cross-Sell Suggestions
        </h3>
        {recommendations.length === 0 ? (
          <div className="text-sm font-bold text-slate-500 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-6">
            No recommendations available for this quotation yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {recommendations.slice(0, 3).map((item) => (
              <div key={item.productId} className="card-tactile bg-white border-2 border-slate-200 hover:border-secondary-400 p-6 text-left transition-all group flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-black text-slate-900 group-hover:text-secondary-500 transition-colors">+ {item.productName}</span>
                  {item.promotionTag && (
                    <span className="inline-flex items-center rounded-full bg-brand-50 border border-brand-200 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-brand-600">
                      {item.promotionTag}
                    </span>
                  )}
                </div>
                <span className="text-sm font-bold text-slate-500">Margin {item.marginDelta >= 0 ? '+' : ''}${Math.round(item.marginDelta || 0)}</span>
                <div className="flex items-center justify-between gap-3 mt-auto pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      const nextLines = [...lines, {
                        id: crypto.randomUUID(),
                        productId: item.productId,
                        productNameSnapshot: item.productName,
                        quantity: 1,
                        unitPrice: item.price,
                        discount: 0,
                        limit: 15,
                      }];
                      setLines(nextLines);
                      setQuotation((prev: any) => ({ ...prev, amount: (prev?.amount || 0) + item.price }));
                      showToast('success', `${item.productName} added to quote.`);
                    }}
                    className="btn-tactile btn-primary px-4 py-2 text-xs rounded-xl font-black"
                  >
                    Add to Quote
                  </button>
                  <button
                    type="button"
                    className="btn-tactile bg-white border-2 border-slate-200 text-slate-700 px-4 py-2 text-xs rounded-xl font-black"
                    onClick={() => setRecommendations((prev) => prev.filter((r) => r.productId !== item.productId))}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4 pt-8 mt-8 border-t-2 border-slate-100">
        {isDraft && (
          <button
            onClick={handleSaveDraft}
            disabled={saving}
            className="btn-tactile bg-white border-2 border-slate-200 text-slate-800 hover:bg-slate-50 px-8 py-4 text-base flex items-center justify-center gap-2 rounded-2xl font-black disabled:opacity-50"
          >
            {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
        )}
        {canSubmit && (
          <button
            onClick={handleSubmitForApproval}
            disabled={submitting}
            className="btn-tactile btn-primary px-8 py-4 text-base flex items-center justify-center gap-2 rounded-2xl font-black disabled:opacity-50"
          >
            {submitting ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            {submitting ? 'Submitting...' : 'Submit for Approval'}
          </button>
        )}
        {!canSubmit && (
          <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-slate-500 w-full text-center">
            Status: <span className="font-black uppercase text-slate-700">{quotation.status?.replace(/_/g, ' ')}</span> — no further actions available from this view.
          </div>
        )}
      </div>
    </div>
  );
}