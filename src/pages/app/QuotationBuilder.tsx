import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, Plus, Trash2, Save, Send } from 'lucide-react';
import { apiFetch } from '../../lib/api';

interface QuoteLine {
  productId: string;
  quantity: number;
  discount: number;
}

export default function QuotationBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id && id !== 'new');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [lines, setLines] = useState<QuoteLine[]>([]);

  // Reference Data State
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [custRes, prodRes] = await Promise.all([
          apiFetch('/companies').catch(() => []),
          apiFetch('/products').catch(() => [])
        ]);

        const customersData = custRes?.data || custRes;
        const productsData = prodRes?.data || prodRes;

        setCustomers(Array.isArray(customersData) ? customersData : []);
        setProducts(Array.isArray(productsData) ? productsData : []);

        if (isEditing) {
          const res = await apiFetch(`/quotations/${id}`);
          const quote = res?.data || res;

          setTitle(quote.title || '');
          setCustomerId(quote.customerId || '');

          if (quote.lines && quote.lines.length > 0) {
            setLines(
              quote.lines.map((l: any) => ({
                productId: l.productId,
                quantity: l.quantity,
                discount: l.discount,
              }))
            );
          } else {
            setLines([{ productId: '', quantity: 1, discount: 0 }]);
          }
        } else {
          setLines([{ productId: '', quantity: 1, discount: 0 }]);
        }
      } catch (err: any) {
        console.error(err);
        setError('Failed to load quotation data. Please try refreshing.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, isEditing]);

  const handleAddLine = () => {
    setLines([...lines, { productId: '', quantity: 1, discount: 0 }]);
  };

  const handleRemoveLine = (index: number) => {
    setLines(lines.filter((_, i) => i !== index));
  };

  const handleLineChange = (index: number, field: keyof QuoteLine, value: any) => {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], [field]: value };
    setLines(newLines);
  };

  const handleSave = async (submitForApproval = false) => {
    if (!title || !customerId || lines.some(l => !l.productId)) {
      setError('Please fill in all required fields and select products for all lines.');
      return;
    }

    setSaving(true);
    setError('');

    const payload = { title, customerId, lines };

    try {
      let savedQuote;
      if (isEditing) {
        savedQuote = await apiFetch(`/quotations/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
      } else {
        savedQuote = await apiFetch('/quotations', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }

      // If user clicked "Submit for Approval" instead of just "Save"
      if (submitForApproval) {
        await apiFetch(`/quotations/${savedQuote.id}/submit`, { method: 'POST' });
      }

      navigate('/app/quotations');
    } catch (err: any) {
      setError(err.message || 'Failed to save quotation.');
    } finally {
      setSaving(false);
    }
  };

  // Live Calculations for UI
  const liveTotals = lines.reduce((acc, line) => {
    const product = products.find(p => p.id === line.productId);
    if (!product) return acc;
    
    const baseTotal = product.price * line.quantity;
    const discountAmt = baseTotal * (line.discount / 100);
    const subtotal = baseTotal - discountAmt;
    
    acc.subtotal += subtotal;
    acc.discount += discountAmt;
    return acc;
  }, { subtotal: 0, discount: 0 });

  const tax = liveTotals.subtotal * 0.10; // 10% tax mock
  const total = liveTotals.subtotal + tax;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-24 min-h-[60vh]">
        <Loader2 className="animate-spin text-brand-500" size={48} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 card-tactile bg-white p-6 sm:p-10 min-h-[calc(100vh-4rem)] relative mb-12">
      
      {/* Header */}
      <div>
        <button
          onClick={() => navigate('/app/quotations')}
          className="flex items-center gap-1.5 text-slate-400 hover:text-brand-500 text-xs font-black uppercase tracking-widest mb-4 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Board
        </button>
        <h1 className="text-4xl font-display font-black text-slate-900 tracking-tight">
          {isEditing ? `Edit Quotation` : 'New Quotation'}
        </h1>
        <p className="text-slate-500 font-bold text-base mt-2">
          Configure products, quantities, and discounts.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-sm font-bold text-red-600">
          {error}
        </div>
      )}

      {/* Meta Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-3xl border-2 border-slate-200">
        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Deal Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Q3 Server Expansion"
            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-500 focus:ring-0 font-bold text-slate-900"
          />
        </div>
        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Customer</label>
          <select
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-500 focus:ring-0 font-bold text-slate-900 bg-white"
          >
            <option value="" disabled>Select a customer...</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Line Items */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-black text-slate-900">Products & Services</h3>
          <button 
            onClick={handleAddLine}
            className="text-brand-500 hover:text-brand-600 font-black text-sm flex items-center gap-1"
          >
            <Plus size={16} /> Add Line
          </button>
        </div>

        <div className="space-y-4">
          {lines.map((line, index) => (
            <div key={index} className="flex flex-wrap md:flex-nowrap items-center gap-4 bg-white border-2 border-slate-200 p-4 rounded-2xl">
              
              <div className="flex-1 min-w-[200px]">
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Product</label>
                <select
                  value={line.productId}
                  onChange={(e) => handleLineChange(index, 'productId', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border-2 border-slate-100 focus:border-brand-500 font-bold text-sm"
                >
                  <option value="" disabled>Select product...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} (${p.price})</option>
                  ))}
                </select>
              </div>

              <div className="w-24">
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Qty</label>
                <input
                  type="number"
                  min="1"
                  value={line.quantity}
                  onChange={(e) => handleLineChange(index, 'quantity', parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 rounded-lg border-2 border-slate-100 focus:border-brand-500 font-bold text-sm text-center"
                />
              </div>

              <div className="w-32">
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Discount (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={line.discount}
                  onChange={(e) => handleLineChange(index, 'discount', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg border-2 border-slate-100 focus:border-brand-500 font-bold text-sm text-center"
                />
              </div>

              <button 
                onClick={() => handleRemoveLine(index)}
                className="mt-5 p-2 text-slate-400 hover:text-red-500 transition-colors"
                disabled={lines.length === 1}
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Totals & Actions */}
      <div className="flex flex-col md:flex-row items-end md:items-center justify-between pt-8 border-t-2 border-slate-100 gap-6">
        
        <div className="bg-slate-50 px-6 py-4 rounded-2xl border-2 border-slate-200 w-full md:w-auto">
          <div className="flex justify-between gap-12 text-sm font-bold text-slate-500 mb-1">
            <span>Subtotal:</span>
            <span className="text-slate-900">${Math.round(liveTotals.subtotal).toLocaleString()}</span>
          </div>
          <div className="flex justify-between gap-12 text-sm font-bold text-slate-500 mb-2">
            <span>Est. Tax (10%):</span>
            <span className="text-slate-900">${Math.round(tax).toLocaleString()}</span>
          </div>
          <div className="flex justify-between gap-12 text-xl font-black text-brand-600 border-t-2 border-slate-200 pt-2">
            <span>Total:</span>
            <span>${Math.round(total).toLocaleString()}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="btn-tactile flex-1 md:flex-none bg-white border-2 border-slate-200 text-slate-800 hover:bg-slate-50 px-6 py-3 text-sm flex items-center justify-center gap-2 rounded-xl font-black"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save Draft
          </button>
          
          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="btn-tactile flex-1 md:flex-none btn-primary px-6 py-3 text-sm flex items-center justify-center gap-2 rounded-xl font-black"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            Submit for Approval
          </button>
        </div>
      </div>

    </div>
  );
}