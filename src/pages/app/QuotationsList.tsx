import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, List, Loader2 } from 'lucide-react';
import { apiFetch } from '../../lib/api';

const COLUMNS = ['Draft', 'Pending Approval', 'Under Negotiation', 'Confirmed'];

const STATUS_MAP: Record<string, string> = {
  'draft': 'Draft',
  'pending_approval': 'Pending Approval',
  'revision_required': 'Pending Approval', // group together for simplicity
  'under_negotiation': 'Under Negotiation',
  'confirmed': 'Confirmed',
  'approved': 'Confirmed',
  'fulfillment': 'Confirmed',
};

export default function QuotationsList() {
  const [quotations, setQuotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadQuotations() {
      try {
        const data = await apiFetch('/quotations');
        setQuotations(data);
      } catch (err) {
        console.error('Failed to load quotations:', err);
      } finally {
        setLoading(false);
      }
    }
    loadQuotations();
  }, []);
  return (
    <div className="space-y-6 max-w-full overflow-x-auto pb-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Quotations (List)
        </h1>
        <p className="text-slate-500 font-bold text-sm mt-1">
          Every quotation in the system, one row per quotation, click a row to open it
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="animate-spin text-slate-400" size={32} />
        </div>
      ) : (

      {/* Kanban Board */}
      <div className="flex items-start gap-4 min-w-max pb-4">
        {COLUMNS.map((column) => (
          <div
            key={column}
            className="w-80 shrink-0 bg-slate-100 rounded-2xl p-4 border-2 border-slate-200"
          >
            <h3 className="font-display font-black text-sm text-slate-700 mb-4">{column}</h3>
            
            <div className="space-y-3">
              {quotations.filter((q) => STATUS_MAP[q.status] === column).map((quote) => (
                <Link
                  key={quote.id}
                  to={`/app/quotations/${quote.id}`}
                  className="block bg-slate-900 text-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
                >
                  <p className="text-sm font-bold">
                    {quote.customerName || 'Unknown Customer'} - ${quote.amount?.toLocaleString()}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
      )}

      <div className="flex items-center gap-4 sticky left-0">
        <Link
          to="/app/quotations?action=new"
          className="btn-tactile btn-primary px-6 py-3 text-sm flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl"
        >
          <Plus size={18} />
          + New Quotation
        </Link>
        <button className="btn-tactile px-6 py-3 text-sm flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl">
          <List size={18} />
          Switch to Table View
        </button>
      </div>
    </div>
  );
}
