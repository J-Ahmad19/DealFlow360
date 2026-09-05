import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { apiFetch } from '../../lib/api';

export default function FulfillmentList() {
  const navigate = useNavigate();
  const [data, setData] = useState<{ stock: any[], orders: any[] }>({ stock: [], orders: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await apiFetch('/fulfillment');
        setData(res || { stock: [], orders: [] });
      } catch (err) {
        console.error('Failed to load fulfillment data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-24 min-h-[60vh]">
        <Loader2 className="animate-spin text-brand-500" size={48} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 card-tactile bg-white p-6 sm:p-10 min-h-[calc(100vh-4rem)] relative mb-12">
      <div>
        <h1 className="text-4xl font-display font-black text-slate-900 tracking-tight">
          Fulfillment and Stock (List)
        </h1>
        <p className="text-slate-500 font-bold text-base mt-2">
          Live stock per warehouse, plus every order that still needs fulfilling
        </p>
      </div>

      <div className="bg-white rounded-3xl border-2 border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 border-b-2 border-slate-200">
            <tr>
              <th className="px-6 py-4 font-black uppercase tracking-wider text-xs">Warehouse</th>
              <th className="px-6 py-4 font-black uppercase tracking-wider text-xs">Product</th>
              <th className="px-6 py-4 font-black uppercase tracking-wider text-xs">In Stock</th>
              <th className="px-6 py-4 font-black uppercase tracking-wider text-xs">Reserved</th>
              <th className="px-6 py-4 font-black uppercase tracking-wider text-xs">Available</th>
            </tr>
          </thead>
          <tbody className="text-slate-900 divide-y-2 divide-slate-50">
            {data.stock.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center font-bold text-slate-400">No stock data available.</td></tr>
            ) : (
              data.stock.map((item, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold">{item.warehouseName}</td>
                  <td className="px-6 py-4 font-bold">{item.productName}</td>
                  <td className="px-6 py-4 font-black text-slate-900">{item.available + item.reserved}</td>
                  <td className="px-6 py-4 font-black text-slate-400">{item.reserved}</td>
                  <td className="px-6 py-4 font-black text-brand-500">{item.available}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <h3 className="text-xl font-black text-blue-500 pt-4">Orders Awaiting Fulfillment</h3>

      <div className="bg-white rounded-3xl border-2 border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 border-b-2 border-slate-200">
            <tr>
              <th className="px-6 py-4 font-black uppercase tracking-wider text-xs">Order</th>
              <th className="px-6 py-4 font-black uppercase tracking-wider text-xs">Customer</th>
              <th className="px-6 py-4 font-black uppercase tracking-wider text-xs">Status</th>
              <th className="px-6 py-4 font-black uppercase tracking-wider text-xs">Warehouses</th>
            </tr>
          </thead>
          <tbody className="text-slate-900 divide-y-2 divide-slate-50">
            {data.orders.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center font-bold text-slate-400">No orders pending fulfillment.</td></tr>
            ) : (
              data.orders.map((order) => (
                <tr 
                  key={order.id} 
                  onClick={() => navigate(`/app/fulfillment/${order.id}`)}
                  className="hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <td className="px-6 py-5 font-black text-slate-700 group-hover:text-brand-500 transition-colors">
                    Q-{order.id.slice(-6).toUpperCase()}
                  </td>
                  <td className="px-6 py-5 font-bold">{order.customerName || 'Unknown Customer'}</td>
                  <td className="px-6 py-5 font-black text-amber-500 capitalize">
                    {order.status === 'confirmed' ? 'Split Pending' : order.status}
                  </td>
                  <td className="px-6 py-5 font-bold text-slate-600">Pending Calculation</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-[#322c1d] border-2 border-[#524424] rounded-2xl p-5 shadow-sm mt-6">
        <p className="text-[#e1b12c] font-bold text-sm leading-relaxed">
          Click an order row to open its warehouse split detail.
        </p>
      </div>
    </div>
  );
}