import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, CheckCircle, Settings, AlertCircle } from 'lucide-react';
import { apiFetch } from '../../lib/api';

export default function FulfillmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDetail() {
      try {
        const res = await apiFetch(`/fulfillment/${id}`);
        setData(res);
      } catch (err: any) {
        setError(err.message || 'Failed to load details.');
      } finally {
        setLoading(false);
      }
    }
    if (id) loadDetail();
  }, [id]);

  const handleAccept = async () => {
    setActionLoading(true);
    setError('');
    try {
      await apiFetch(`/fulfillment/${id}/accept`, { method: 'POST' });
      navigate('/app/fulfillment');
    } catch (err: any) {
      setError(err.message || 'Failed to process fulfillment.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-24 min-h-[60vh]">
        <Loader2 className="animate-spin text-brand-500" size={48} />
      </div>
    );
  }

  if (error || !data || !data.order) {
    return (
      <div className="max-w-6xl mx-auto card-tactile bg-white p-8 text-center mt-12">
        <h2 className="text-2xl font-black text-red-600 mb-2">{error || 'Order not found'}</h2>
        <button onClick={() => navigate('/app/fulfillment')} className="btn-tactile btn-primary px-6 py-3 mt-6">
          Return to Fulfillment
        </button>
      </div>
    );
  }

  const quoteId = data.order.id.slice(-6).toUpperCase();
  const customerName = data.order.customerName || 'Unknown Customer';
  const totalShipmentCount = (data.splits || []).reduce((sum: number, split: any) => sum + (Number(split.shipments) || 0), 0);
  const totalSplitCost = (data.splits || []).reduce((sum: number, split: any) => sum + (Number(split.cost) || 0), 0);

  return (
    <div className="max-w-6xl mx-auto space-y-8 card-tactile bg-white p-6 sm:p-10 min-h-[calc(100vh-4rem)] relative mb-12">
      
      <div>
        <button
          onClick={() => navigate('/app/fulfillment')}
          className="flex items-center gap-1.5 text-slate-400 hover:text-brand-500 text-xs font-black uppercase tracking-widest mb-4 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Fulfillment
        </button>
        <h1 className="text-4xl font-display font-black text-slate-900 tracking-tight">
          Fulfillment Detail: Q-{quoteId} ({customerName})
        </h1>
        <p className="text-slate-500 font-bold text-base mt-2">
          Opened by clicking an order row on the Fulfillment list
        </p>
      </div>

      <div className="bg-white rounded-3xl border-2 border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 border-b-2 border-slate-200">
            <tr>
              <th className="px-6 py-4 font-black uppercase tracking-wider text-xs">Warehouse</th>
              <th className="px-6 py-4 font-black uppercase tracking-wider text-xs">Qty Fulfilled</th>
              <th className="px-6 py-4 font-black uppercase tracking-wider text-xs">Est. Shipments</th>
              <th className="px-6 py-4 font-black uppercase tracking-wider text-xs">Cost</th>
            </tr>
          </thead>
          <tbody className="text-slate-900 divide-y-2 divide-slate-50">
            {data.splits.length === 0 ? (
               <tr><td colSpan={4} className="px-6 py-8 text-center font-bold text-slate-400">No physical products require fulfillment.</td></tr>
            ) : (
              data.splits.map((split: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-5 font-bold">{split.warehouseName}</td>
                  <td className="px-6 py-5 font-black text-slate-900">{split.quantity} units</td>
                  <td className="px-6 py-5 font-bold text-slate-500">{split.shipments || 1}</td>
                  <td className="px-6 py-5 font-black text-slate-900">${Number(split.cost || 0).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-black uppercase tracking-widest text-slate-500">Estimated shipment count</p>
          <p className="mt-2 text-2xl font-black text-slate-900">{totalShipmentCount}</p>
        </div>
        <div className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-black uppercase tracking-widest text-slate-500">Estimated cost</p>
          <p className="mt-2 text-2xl font-black text-slate-900">${totalSplitCost.toLocaleString()}</p>
        </div>
      </div>

      {data.hasBackorder && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5 shadow-sm flex items-start gap-3 mt-6">
          <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={20} />
          <p className="text-amber-700 font-bold text-sm leading-relaxed">
            *Consolidate Remaining Backorder* prompt appears automatically once depots restock.
          </p>
        </div>
      )}

      {data.order.status === 'confirmed' && (
        <div className="flex flex-wrap items-center gap-4 pt-8 mt-8 border-t-2 border-slate-100">
          <button
            onClick={handleAccept}
            disabled={actionLoading || data.splits.length === 0}
            className="btn-tactile bg-[#3498db] border-b-4 border-[#2980b9] text-white hover:bg-[#2980b9] active:border-b-0 active:translate-y-1 px-8 py-4 text-base flex items-center justify-center gap-2 rounded-2xl font-black transition-all disabled:opacity-50"
          >
            {actionLoading ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle size={20} />}
            Accept Suggested Split
          </button>
          
          <button
            disabled={actionLoading}
            className="btn-tactile bg-white border-2 border-slate-200 text-slate-800 hover:bg-slate-50 px-8 py-4 text-base flex items-center justify-center gap-2 rounded-2xl font-black"
          >
            <Settings size={20} />
            Manual Override
          </button>
        </div>
      )}
    </div>
  );
}