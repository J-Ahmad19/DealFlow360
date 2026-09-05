import { Link } from 'react-router-dom';
import { Plus, List } from 'lucide-react';

const DUMMY_QUOTATIONS = [
  { id: 'Q-1042', customer: 'Acme Corp', amount: '$12,400', status: 'Draft' },
  { id: 'Q-1043', customer: 'Delta LLC', amount: '$3,200', status: 'Draft' },
  { id: 'Q-1044', customer: 'Beta Industries', amount: '$29,500', status: 'Pending Approval' },
  { id: 'Q-1045', customer: 'Gamma Co', amount: '$15,500', status: 'Under Negotiation' },
  { id: 'Q-1046', customer: 'Orion Ltd', amount: '$41,000', status: 'Confirmed' },
];

const COLUMNS = ['Draft', 'Pending Approval', 'Under Negotiation', 'Confirmed'];

export default function QuotationsList() {
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

      {/* Kanban Board */}
      <div className="flex items-start gap-4 min-w-max pb-4">
        {COLUMNS.map((column) => (
          <div
            key={column}
            className="w-80 shrink-0 bg-slate-100 rounded-2xl p-4 border-2 border-slate-200"
          >
            <h3 className="font-display font-black text-sm text-slate-700 mb-4">{column}</h3>
            
            <div className="space-y-3">
              {DUMMY_QUOTATIONS.filter((q) => q.status === column).map((quote) => (
                <Link
                  key={quote.id}
                  to={`/app/quotations/${quote.id}`}
                  className="block bg-slate-900 text-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
                >
                  <p className="text-sm font-bold">
                    {quote.customer} - {quote.amount}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

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
