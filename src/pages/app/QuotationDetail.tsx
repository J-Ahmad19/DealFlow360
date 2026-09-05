import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Save, Send, Loader2 } from 'lucide-react';
import { apiFetch } from '../../lib/api';

export default function QuotationDetail() {
  const { id } = useParams();
  const [quotation, setQuotation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadQuotation() {
      try {
        const data = await apiFetch(`/quotations/${id}`);
        setQuotation(data);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="animate-spin text-slate-400" size={32} />
      </div>
    );
  }

  if (!quotation) {
    return <div className="text-red-500 font-bold">Quotation not found</div>;
  }

  const quoteId = quotation.id.split('-')[0].substring(0, 8); // Just show a part for display
  const customerName = quotation.customerName || 'Unknown Customer';

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Quotation Detail: {quoteId} ({customerName})
        </h1>
        <p className="text-slate-500 font-bold text-sm mt-1">
          Opened by clicking a row on the Quotations list. Add products, apply discounts, review upsells.
        </p>
      </div>

      {/* Top Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-black text-slate-700 uppercase mb-2">Customer</label>
          <input
            type="text"
            className="w-full bg-slate-900 text-slate-300 border-2 border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
            defaultValue={customerName}
            readOnly
          />
        </div>
        <div>
          <label className="block text-xs font-black text-slate-700 uppercase mb-2">Price List</label>
          <input
            type="text"
            className="w-full bg-slate-900 text-slate-300 border-2 border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
            defaultValue="Standard 2026"
            readOnly
          />
        </div>
      </div>

      {/* Line Items Table */}
      <div className="bg-slate-900 rounded-2xl border-2 border-slate-700 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-800 text-slate-400 border-b-2 border-slate-700">
            <tr>
              <th className="px-4 py-3 font-black">Product</th>
              <th className="px-4 py-3 font-black">Qty</th>
              <th className="px-4 py-3 font-black">Price</th>
              <th className="px-4 py-3 font-black">Discount</th>
              <th className="px-4 py-3 font-black">Limit</th>
              <th className="px-4 py-3 font-black">Status</th>
            </tr>
          </thead>
          <tbody className="text-slate-200 divide-y divide-slate-800">
            {quotation.lines?.map((line: any) => {
              const limit = 15; // Hardcoded limit for visual demonstration; in real app this would come from product/tier rules
              const isOver = line.discount > limit;
              return (
                <tr key={line.id || line.productId}>
                  <td className="px-4 py-4">{line.productNameSnapshot}</td>
                  <td className="px-4 py-4">{line.quantity}</td>
                  <td className="px-4 py-4">${line.unitPrice}</td>
                  <td className={`px-4 py-4 ${isOver ? 'text-amber-400' : ''}`}>{line.discount}%</td>
                  <td className="px-4 py-4 text-slate-400">{limit}%</td>
                  <td className={`px-4 py-4 font-black ${isOver ? 'text-red-400' : 'text-emerald-400'}`}>
                    {isOver ? `OVER (+${line.discount - limit}pt)` : 'OK'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Warning Box */}
      <div className="bg-amber-500/10 border-2 border-amber-500/50 rounded-2xl p-4">
        <p className="text-amber-500 font-bold text-sm">
          Discount is checked against each line's own limit line, as soon as it is entered, not only at submit time.
        </p>
      </div>

      {/* Upsell Suggestions */}
      <div>
        <h3 className="text-lg font-black text-slate-900 mb-4 text-blue-500">
          Upsell and Cross-Sell Suggestions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button className="bg-slate-900 border-2 border-slate-700 hover:border-slate-500 rounded-2xl p-4 text-left transition-colors">
            <p className="font-bold text-slate-200">+ Wireless Mouse</p>
            <p className="text-xs text-slate-400 mt-1">Margin +$74</p>
          </button>
          <button className="bg-slate-900 border-2 border-slate-700 hover:border-slate-500 rounded-2xl p-4 text-left transition-colors">
            <p className="font-bold text-slate-200">+ Docking Station</p>
            <p className="text-xs text-slate-400 mt-1">Promo: 12% off</p>
          </button>
          <button className="bg-slate-900 border-2 border-slate-700 hover:border-slate-500 rounded-2xl p-4 text-left transition-colors">
            <p className="font-bold text-slate-200">+ Care Plan 3yr</p>
            <p className="text-xs text-slate-400 mt-1">Margin +$49</p>
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4 pt-4 border-t-2 border-slate-200">
        <button className="btn-tactile px-6 py-3 text-sm flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl">
          <Save size={18} />
          Save Draft
        </button>
        <button className="btn-tactile px-6 py-3 text-sm flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl">
          <Send size={18} />
          Submit for Approval
        </button>
      </div>
    </div>
  );
}
