import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Download, CheckCircle2 } from 'lucide-react';
import { apiFetch, ApiError } from '../../lib/api';

export default function BillingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState<'reissue' | 'download' | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadInvoice() {
      try {
        const result = await apiFetch(`/billing/invoices/${id}`);
        setInvoice(result || null);
      } catch (err) {
        console.error('Failed to load invoice detail:', err);
      } finally {
        setLoading(false);
      }
    }

    if (id) loadInvoice();
  }, [id]);

  const statusMeta = useMemo(() => {
    if (!invoice) return { label: 'Draft', tone: 'bg-slate-100 text-slate-700 border-slate-200' };

    const toneMap: Record<string, string> = {
      paid: 'bg-brand-50 text-brand-700 border-brand-200',
      sent: 'bg-amber-50 text-amber-700 border-amber-200',
      overdue: 'bg-red-50 text-red-700 border-red-200',
      draft: 'bg-slate-100 text-slate-700 border-slate-200',
    };

    return {
      label: invoice.status || 'draft',
      tone: toneMap[invoice.status] || toneMap.draft,
    };
  }, [invoice]);

  const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value || 0);

  const handleReissueInvoice = async () => {
    if (!id || !invoice) return;

    setBusyAction('reissue');
    setError(null);

    try {
      const response = await apiFetch(`/billing/invoices/${id}/reissue`, {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const updated = response?.data ?? response;
      setInvoice((prev: any) => ({ ...prev, ...updated, status: updated.status || prev?.status }));
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Unable to re-issue invoice.';
      setError(message);
      console.error('Failed to re-issue invoice:', err);
    } finally {
      setBusyAction(null);
    }
  };

  const handleDownloadSummary = async () => {
    if (!id) return;

    setBusyAction('download');
    setError(null);

    try {
      const payload = await apiFetch(`/billing/invoices/${id}/summary`);
      const summaryText = JSON.stringify(payload, null, 2);
      const blob = new Blob([summaryText], { type: 'application/json' });
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${invoice?.invoiceNumber || 'invoice'}-summary.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Unable to download invoice summary.';
      setError(message);
      console.error('Failed to download invoice summary:', err);
    } finally {
      setBusyAction(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-24 min-h-[60vh]">
        <Loader2 className="animate-spin text-brand-500" size={48} />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="max-w-5xl mx-auto card-tactile bg-white p-8 text-center mt-12">
        <h2 className="text-2xl font-black text-slate-900">Invoice not found</h2>
        <button onClick={() => navigate('/app/billing')} className="btn-tactile btn-primary px-6 py-3 mt-6">
          Return to Invoices
        </button>
      </div>
    );
  }

  const stages = [
    { key: 'confirmed', label: 'Order Confirmed', active: true },
    { key: 'shipped', label: 'Shipped', active: true },
    { key: 'invoiced', label: 'Invoiced', active: true },
    { key: 'paid', label: 'Paid', active: invoice.status === 'paid' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 card-tactile bg-white p-6 sm:p-10 min-h-[calc(100vh-4rem)] relative mb-12">
      <div>
        <button
          onClick={() => navigate('/app/billing')}
          className="flex items-center gap-1.5 text-slate-400 hover:text-brand-500 text-xs font-black uppercase tracking-widest mb-4 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Invoices
        </button>
        <h1 className="text-4xl font-display font-black text-slate-900 tracking-tight">
          Invoice Detail: {invoice.invoiceNumber} ({invoice.customerName})
        </h1>
        <p className="text-slate-500 font-bold text-base mt-2">
          Opened by clicking a row on the Invoices list
        </p>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        {stages.map((stage, index) => {
          const isActive = stage.active;
          const isLast = index === stages.length - 1;

          return (
            <div key={stage.key} className="flex items-center gap-3">
              <div className="flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full border-4 border-white shadow-sm flex items-center justify-center ${
                  isActive ? 'bg-brand-500 text-white' : 'bg-slate-200 text-slate-500'
                }`}>
                  {isActive ? <CheckCircle2 size={18} /> : <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-wider ${isActive ? 'text-slate-800' : 'text-slate-400'}`}>
                  {stage.label}
                </span>
              </div>
              {!isLast && <div className="w-16 h-1 rounded-full bg-slate-200" />}
            </div>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-2xl border-2 border-slate-200 bg-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-700 text-slate-200 border-b border-slate-600">
            <tr>
              <th className="px-6 py-4 font-black uppercase tracking-wider text-xs">Invoice #</th>
              <th className="px-6 py-4 font-black uppercase tracking-wider text-xs">Amount</th>
              <th className="px-6 py-4 font-black uppercase tracking-wider text-xs">Status</th>
              <th className="px-6 py-4 font-black uppercase tracking-wider text-xs">Due Date</th>
            </tr>
          </thead>
          <tbody className="text-white divide-y divide-slate-700">
            <tr>
              <td className="px-6 py-4 font-black">{invoice.invoiceNumber}</td>
              <td className="px-6 py-4 font-black">{formatCurrency(invoice.amount)}</td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${statusMeta.tone}`}>
                  {statusMeta.label}
                </span>
              </td>
              <td className="px-6 py-4 font-bold text-slate-200">
                {invoice.dueAt ? new Date(invoice.dueAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleReissueInvoice}
          disabled={busyAction !== null}
          className="btn-tactile btn-primary px-6 py-3 text-xs rounded-xl disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {busyAction === 'reissue' ? 'Re-issuing...' : 'Re-issue Payment'}
        </button>
        <button
          onClick={handleDownloadSummary}
          disabled={busyAction !== null}
          className="btn-tactile btn-secondary px-6 py-3 text-xs rounded-xl flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Download size={14} />
          {busyAction === 'download' ? 'Preparing...' : 'Download Summary'}
        </button>
      </div>

      <div className="bg-[#322c1d] border-2 border-[#524424] rounded-2xl p-5 shadow-sm">
        <p className="text-[#e1b12c] font-bold text-sm leading-relaxed">
          Partial invoicing stays reconciled with partial delivery, nothing is billed before it ships.
        </p>
      </div>
    </div>
  );
}
