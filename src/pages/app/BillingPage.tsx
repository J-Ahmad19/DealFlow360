import { useEffect, useMemo, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Loader2, Receipt, TrendingUp, AlertTriangle, CircleDollarSign } from 'lucide-react';
import { apiFetch } from '../../lib/api';
import BillingDetail from './BillingDetail';

type InvoiceRow = {
  id: string;
  invoiceNumber: string;
  customerName: string;
  status: string;
  amount: number;
  dueAt: string | null;
  orderId: string | null;
};

function BillingList() {
  const navigate = useNavigate();
  const [data, setData] = useState<{ summary: any; invoices: InvoiceRow[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInvoices() {
      try {
        const result = await apiFetch('/billing/invoices');
        setData(result || { summary: { totalInvoices: 0, paidInvoices: 0, overdueInvoices: 0, draftInvoices: 0, totalOutstanding: 0 }, invoices: [] });
      } catch (err) {
        console.error('Failed to load invoices:', err);
        setData({ summary: { totalInvoices: 0, paidInvoices: 0, overdueInvoices: 0, draftInvoices: 0, totalOutstanding: 0 }, invoices: [] });
      } finally {
        setLoading(false);
      }
    }

    loadInvoices();
  }, []);

  const summary = useMemo(() => data?.summary || { totalInvoices: 0, paidInvoices: 0, overdueInvoices: 0, draftInvoices: 0, totalOutstanding: 0 }, [data]);
  const invoices = data?.invoices || [];

  const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-24 min-h-[60vh]">
        <Loader2 className="animate-spin text-brand-500" size={48} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 card-tactile bg-white p-6 sm:p-10 min-h-[calc(100vh-4rem)] relative mb-12">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 font-extrabold text-xs uppercase tracking-widest mb-3">
          <Receipt size={14} />
          Billing & Invoices
        </div>
        <h1 className="text-4xl font-display font-black text-slate-900 tracking-tight">
          Invoices & Billing Reconciliation
        </h1>
        <p className="text-slate-500 font-bold text-base mt-2">
          Invoice generation, payment reconciliation, and customer billing health across all active deals.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <div className="rounded-3xl border-2 border-slate-200 bg-slate-50 p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">Total invoices</p>
            <Receipt className="text-brand-500" size={18} />
          </div>
          <p className="mt-4 text-3xl font-black text-slate-900">{summary.totalInvoices}</p>
        </div>
        <div className="rounded-3xl border-2 border-brand-200 bg-brand-50 p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-widest text-brand-700">Paid</p>
            <CircleDollarSign className="text-brand-600" size={18} />
          </div>
          <p className="mt-4 text-3xl font-black text-slate-900">{summary.paidInvoices}</p>
        </div>
        <div className="rounded-3xl border-2 border-amber-200 bg-amber-50 p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-widest text-amber-700">Overdue</p>
            <AlertTriangle className="text-amber-600" size={18} />
          </div>
          <p className="mt-4 text-3xl font-black text-slate-900">{summary.overdueInvoices}</p>
        </div>
        <div className="rounded-3xl border-2 border-secondary-200 bg-secondary-50 p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-widest text-secondary-700">Outstanding</p>
            <TrendingUp className="text-secondary-500" size={18} />
          </div>
          <p className="mt-4 text-3xl font-black text-slate-900">{formatCurrency(summary.totalOutstanding)}</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border-2 border-slate-200 overflow-hidden mt-6">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 border-b-2 border-slate-200">
            <tr>
              <th className="px-6 py-4 font-black uppercase tracking-wider text-xs">Invoice</th>
              <th className="px-6 py-4 font-black uppercase tracking-wider text-xs">Customer</th>
              <th className="px-6 py-4 font-black uppercase tracking-wider text-xs">Amount</th>
              <th className="px-6 py-4 font-black uppercase tracking-wider text-xs">Due date</th>
              <th className="px-6 py-4 font-black uppercase tracking-wider text-xs">Status</th>
            </tr>
          </thead>
          <tbody className="text-slate-900 divide-y-2 divide-slate-50">
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-bold">
                  No invoices found for this workspace.
                </td>
              </tr>
            ) : (
              invoices.map((invoice) => (
                <tr key={invoice.id} onClick={() => navigate(`/app/billing/${invoice.id}`)} className="hover:bg-slate-50 transition-colors cursor-pointer group">
                  <td className="px-6 py-5 font-black text-slate-700 group-hover:text-brand-500 transition-colors">{invoice.invoiceNumber}</td>
                  <td className="px-6 py-5 font-bold">{invoice.customerName || 'Unknown Customer'}</td>
                  <td className="px-6 py-5 font-black text-slate-900">{formatCurrency(invoice.amount)}</td>
                  <td className="px-6 py-5 font-bold text-slate-600">
                    {invoice.dueAt ? new Date(invoice.dueAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${
                      invoice.status === 'paid' ? 'bg-brand-50 text-brand-700 border-brand-200' :
                      invoice.status === 'overdue' ? 'bg-red-50 text-red-700 border-red-200' :
                      invoice.status === 'sent' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-slate-100 text-slate-700 border-slate-200'}
                    `}>
                      {invoice.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-[#322c1d] border-2 border-[#524424] rounded-2xl p-5 shadow-sm mt-6">
        <p className="text-[#e1b12c] font-bold text-sm leading-relaxed">
          Billing data is synced from orders, billing schedules, and invoice records so every active deal can be reviewed in one place.
        </p>
      </div>
    </div>
  );
}

export default function BillingPage() {
  return (
    <Routes>
      <Route index element={<BillingList />} />
      <Route path=":id" element={<BillingDetail />} />
    </Routes>
  );
}
