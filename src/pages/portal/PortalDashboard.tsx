import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Loader2, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiFetch } from '../../lib/api';

const statusStyles: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700 border-slate-200',
  pending_approval: 'bg-amber-100 text-amber-700 border-amber-200',
  approved: 'bg-brand-50 text-brand-600 border-brand-200',
  under_negotiation: 'bg-amber-100 text-amber-700 border-amber-200',
  fulfilled: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  fulfillment: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  confirmed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
  revision_required: 'bg-violet-100 text-violet-700 border-violet-200',
};

const formatStatus = (status: string) =>
  status.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

export default function PortalDashboard() {
  const { customer, logoutCustomer } = useAuth();
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadQuotes() {
      try {
        const response = await apiFetch('/portal/quotations');
        setQuotes(response?.data ?? []);
      } catch (err) {
        console.error('Failed to load portal quotations', err);
      } finally {
        setLoading(false);
      }
    }

    loadQuotes();
  }, []);

  const handleLogout = async () => {
    await logoutCustomer();
    navigate('/portal/login');
  };

  return (
    <div className="min-h-screen bg-[#0b1b2b] font-display text-white">
      <header className="border-b border-slate-700/80 bg-[#0f2235] px-6 py-4 shadow-[0_2px_0_rgba(148,163,184,0.1)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 p-1.5">
              <img src="/logo.png" alt="DealFlow360" className="h-full w-full object-contain" />
            </div>
            <div className="flex items-center gap-2 text-lg font-black tracking-tight">
              <span>DealFlow360</span>
              <span className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-200">Portal</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-sm font-bold text-slate-200">
              {customer?.firstName} {customer?.lastName} ({customer?.company?.name})
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-black text-slate-100 transition hover:bg-white/10"
            >
              <LogOut size={14} />
              Log Out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-white">Customer Dashboard</h1>
            <p className="mt-2 text-base font-bold text-slate-300">Welcome back, {customer?.firstName}. View your company quotations here.</p>
          </div>
        </div>

        <div className="mb-8 rounded-3xl border border-slate-700 bg-slate-800/80 p-5 text-base font-bold text-slate-200 shadow-[0_12px_30px_rgba(15,23,42,0.25)]">
          This customer portal dashboard will display the quotations for your company ({customer?.company?.name}). Backend policies ensure you can only access your own data.
        </div>

        <div className="rounded-[24px] border border-slate-700 bg-slate-900/80 p-4 shadow-[0_12px_30px_rgba(15,23,42,0.2)]">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.24em] text-slate-400">Your quotations</div>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-emerald-200">
              <ShieldCheck size={12} />
              Secure access
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-[220px] items-center justify-center text-slate-300">
              <Loader2 className="mr-3 animate-spin" size={18} />
              Loading quotations...
            </div>
          ) : quotes.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-600 bg-slate-800/60 p-10 text-center text-slate-300">
              No quotations found for your company yet.
            </div>
          ) : (
            <div className="space-y-3">
              {quotes.map((quote) => (
                <button
                  key={quote.id}
                  type="button"
                  onClick={() => navigate(`/portal/quotations/${quote.id}`)}
                  className="flex w-full items-center justify-between gap-4 rounded-2xl border border-slate-700 bg-slate-800 px-4 py-4 text-left transition hover:border-sky-400 hover:bg-slate-800/90"
                >
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] ${statusStyles[quote.status] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                        {formatStatus(quote.status)}
                      </span>
                    </div>
                    <div className="truncate text-xl font-black text-white">{quote.title}</div>
                    <div className="mt-1 text-sm font-bold text-slate-400">
                      Last updated {new Date(quote.updatedAt || quote.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Total</div>
                    <div className="mt-1 text-2xl font-black text-sky-300">${Number(quote.amount || 0).toLocaleString()}</div>
                  </div>

                  <div className="ml-2 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-600 bg-slate-700 text-slate-100">
                    <ArrowRight size={18} />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
