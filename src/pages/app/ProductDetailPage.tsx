import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Save, CheckCircle2, AlertTriangle } from 'lucide-react';
import { apiFetch, ApiError } from '../../lib/api';

type ProductVariant = {
  attribute: string;
  values: string[];
  extraPrice?: number;
};

type ProductPriceList = {
  tier: string;
  currency: string;
  rule: string;
};

type ProductRecord = {
  id: string;
  name: string;
  categoryId?: string | null;
  active?: boolean;
  price?: number;
  cost?: number;
  taxPercent?: number;
  quantityOnHand?: number;
  description?: string | null;
  isRecurring?: boolean;
  billingInterval?: 'monthly' | 'quarterly' | 'yearly' | null;
  attributes?: ProductVariant[];
  priceLists?: ProductPriceList[];
};

const emptyForm = {
  name: '',
  categoryId: '',
  price: '0',
  cost: '0',
  taxPercent: '15',
  quantityOnHand: '0',
  description: '',
  isRecurring: false,
  billingInterval: 'monthly',
};

const formatCurrency = (value?: number | string) => {
  const amount = Number(value ?? 0);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductRecord | null>(null);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [productRes, categoryRes] = await Promise.all([
          apiFetch(`/products/${id}`),
          apiFetch('/products/categories').catch(() => ({ data: [] })),
        ]);

        const productData = productRes?.data ?? productRes ?? null;
        const categoryData = Array.isArray(categoryRes?.data)
          ? categoryRes.data
          : Array.isArray(categoryRes)
            ? categoryRes
            : [];

        setCategories(categoryData);

        if (!productData) {
          setProduct(null);
          return;
        }

        setProduct(productData);
        setForm({
          name: productData.name || '',
          categoryId: productData.categoryId || '',
          price: String(productData.price ?? 0),
          cost: String(productData.cost ?? 0),
          taxPercent: String(productData.taxPercent ?? 15),
          quantityOnHand: String(productData.quantityOnHand ?? 0),
          description: productData.description || '',
          isRecurring: Boolean(productData.isRecurring),
          billingInterval: productData.billingInterval || 'monthly',
        });
      } catch (err) {
        console.error('Failed to load product details:', err);
        setError(err instanceof ApiError ? err.message : 'Unable to load product details.');
      } finally {
        setLoading(false);
      }
    }

    if (id) loadData();
  }, [id]);

  const defaultVariants = useMemo<ProductVariant[]>(() => {
    const recordVariants = product?.attributes && product.attributes.length > 0
      ? product.attributes
      : [
          { attribute: 'Color', values: ['Blue', 'Black'], extraPrice: 0 },
          { attribute: 'RAM', values: ['4GB', '8GB'], extraPrice: 30 },
          { attribute: 'Manufacturer', values: ['Dell', 'HP'], extraPrice: 10 },
        ];

    return recordVariants;
  }, [product]);

  const defaultPriceLists = useMemo<ProductPriceList[]>(() => {
    const mapped = product?.priceLists && product.priceLists.length > 0
      ? product.priceLists
      : [
          { tier: 'Bronze', currency: 'USD', rule: 'Price, no adjustment' },
          { tier: 'Gold', currency: 'USD/EUR', rule: 'Price minus 10 percent base' },
        ];

    return mapped;
  }, [product]);

  const handleFieldChange = (field: keyof typeof emptyForm, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!id) return;

    try {
      setSaving(true);
      setError(null);

      const payload = {
        name: form.name.trim(),
        categoryId: form.categoryId || null,
        price: Number(form.price) || 0,
        cost: Number(form.cost) || 0,
        taxPercent: Number(form.taxPercent) || 15,
        quantityOnHand: Number(form.quantityOnHand) || 0,
        description: form.description.trim(),
        isRecurring: Boolean(form.isRecurring),
        billingInterval: form.isRecurring ? form.billingInterval : null,
        active: true,
        attributes: defaultVariants,
        priceLists: defaultPriceLists,
      };

      await apiFetch(`/products/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });

      const refreshed = await apiFetch(`/products/${id}`);
      setProduct(refreshed?.data ?? refreshed ?? null);
    } catch (err) {
      console.error('Failed to save product:', err);
      setError(err instanceof ApiError ? err.message : 'Unable to save product details.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-24 min-h-[60vh]">
        <Loader2 className="animate-spin text-brand-500" size={48} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto card-tactile bg-white p-8 text-center mt-12">
        <h2 className="text-2xl font-black text-slate-900">Product not found</h2>
        <button onClick={() => navigate('/app/products')} className="btn-tactile btn-primary px-6 py-3 mt-6">
          Back to catalog
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="card-tactile bg-white rounded-[20px] p-5 sm:p-6 border-2 border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => navigate('/app/products')}
            className="inline-flex items-center gap-2 text-slate-500 hover:text-brand-600 text-[11px] font-black uppercase tracking-[0.22em] transition-colors"
          >
            <ArrowLeft size={15} />
            Back to catalog
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 bg-slate-50 text-slate-700 text-[10px] font-black uppercase tracking-[0.18em]">
            <span className="w-2 h-2 rounded-full bg-brand-500" />
            Category: {categories.find((cat) => cat.id === product.categoryId)?.name || 'Cloud Infrastructure'}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-brand-50 border-2 border-brand-200 flex items-center justify-center text-brand-600">
              <CheckCircle2 size={22} />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">{product.name}</h1>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="btn-tactile btn-primary px-6 py-3 text-[11px] font-black tracking-[0.18em] rounded-2xl"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </div>

      <div className="rounded-[22px] border-2 border-[#283a46] bg-[#171d22] p-5 sm:p-6 shadow-[0_8px_0_#0f1720]">
        <h2 className="text-2xl font-black tracking-tight mb-6 text-slate-100">Product and pricelist</h2>

        {error && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_170px] gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 mb-2">Product name</label>
                <input
                  value={form.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  className="w-full border border-slate-600 bg-[#0d1418] rounded-xl px-4 py-3 text-base font-bold text-slate-100 focus:border-brand-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 mb-2">Tax %</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={form.taxPercent}
                  onChange={(e) => handleFieldChange('taxPercent', e.target.value)}
                  className="w-full border border-slate-600 bg-[#0d1418] rounded-xl px-4 py-3 text-base font-bold text-slate-100 focus:border-brand-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 mb-2">Category</label>
              <select
                value={form.categoryId}
                onChange={(e) => handleFieldChange('categoryId', e.target.value)}
                className="w-full border border-slate-600 bg-[#0d1418] rounded-xl px-4 py-3 text-base font-bold text-slate-100 focus:border-brand-400 focus:outline-none"
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 mb-2">Price</label>
              <input
                type="number"
                min="0"
                value={form.price}
                onChange={(e) => handleFieldChange('price', e.target.value)}
                className="w-full border border-slate-600 bg-[#0d1418] rounded-xl px-4 py-3 text-base font-bold text-slate-100 focus:border-brand-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 mb-2">Unit</label>
              <input
                value="Each"
                readOnly
                className="w-full border border-slate-600 bg-[#111b21] rounded-xl px-4 py-3 text-base font-bold text-slate-300"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 mb-2">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                className="w-full border border-slate-600 bg-[#0d1418] rounded-xl px-4 py-3 text-base font-bold text-slate-100 min-h-[112px] focus:border-brand-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 mb-2">Subscription</label>
                <div className="flex items-center justify-between gap-3 border border-slate-600 bg-[#0d1418] rounded-xl px-4 py-3">
                  <span className="text-sm font-bold text-slate-100">Yes / No</span>
                  <button
                    type="button"
                    onClick={() => handleFieldChange('isRecurring', !form.isRecurring)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${form.isRecurring ? 'bg-emerald-500' : 'bg-slate-700'}`}
                    aria-label="Toggle subscription"
                  >
                    <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition ${form.isRecurring ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 mb-2">Recurring</label>
                <select
                  value={form.billingInterval}
                  onChange={(e) => handleFieldChange('billingInterval', e.target.value)}
                  disabled={!form.isRecurring}
                  className="w-full border border-slate-600 bg-[#0d1418] rounded-xl px-4 py-3 text-base font-bold text-slate-100 focus:border-brand-400 focus:outline-none disabled:opacity-60"
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 mb-2">Quantity on hand</label>
              <input
                type="number"
                min="0"
                value={form.quantityOnHand}
                onChange={(e) => handleFieldChange('quantityOnHand', e.target.value)}
                className="w-full border border-slate-600 bg-[#0d1418] rounded-xl px-4 py-3 text-base font-bold text-slate-100 focus:border-brand-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 mb-2">Cost</label>
              <input
                type="number"
                min="0"
                value={form.cost}
                onChange={(e) => handleFieldChange('cost', e.target.value)}
                className="w-full border border-slate-600 bg-[#0d1418] rounded-xl px-4 py-3 text-base font-bold text-slate-100 focus:border-brand-400 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[20px] border-2 border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 border-b-2 border-slate-200 bg-slate-50 text-left text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">
          <div className="px-4 py-4">Attribute</div>
          <div className="px-4 py-4">Values</div>
          <div className="px-4 py-4">Extra price</div>
        </div>

        {defaultVariants.map((variant, index) => (
          <div key={`${variant.attribute}-${index}`} className="grid grid-cols-1 md:grid-cols-3 border-b border-slate-200 last:border-b-0">
            <div className="px-4 py-4 font-black text-slate-900">{variant.attribute}</div>
            <div className="px-4 py-4 font-bold text-slate-600">{variant.values.join(', ')}</div>
            <div className="px-4 py-4 font-bold text-slate-700">{variant.extraPrice ? `+$${variant.extraPrice}` : '$0'}</div>
          </div>
        ))}
      </div>

      <div className="rounded-[20px] border-2 border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 border-b-2 border-slate-200 bg-slate-50 text-left text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">
          <div className="px-4 py-4">Tier</div>
          <div className="px-4 py-4">Currency</div>
          <div className="px-4 py-4">Price Rule</div>
        </div>

        {defaultPriceLists.map((list, index) => (
          <div key={`${list.tier}-${index}`} className="grid grid-cols-1 md:grid-cols-3 border-b border-slate-200 last:border-b-0">
            <div className="px-4 py-4 font-black text-slate-900">{list.tier}</div>
            <div className="px-4 py-4 font-bold text-slate-600">{list.currency}</div>
            <div className="px-4 py-4 font-bold text-slate-700">{list.rule}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 px-4 py-4 text-sm font-bold text-amber-800 flex items-start gap-3">
        <AlertTriangle className="mt-0.5 shrink-0" size={18} />
        <div>
          <div className="font-black">Product details should be filled.</div>
          <div>Recurring order with this product will be invoiced at the beginning of the period.</div>
        </div>
      </div>

      <div className="rounded-2xl border-2 border-slate-200 bg-white p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm font-bold">
          <div>
            <div className="text-slate-500 uppercase tracking-[0.22em] text-[10px] font-black">Price</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{formatCurrency(form.price)}</div>
          </div>
          <div>
            <div className="text-slate-500 uppercase tracking-[0.22em] text-[10px] font-black">Tax</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{Number(form.taxPercent || 0)}%</div>
          </div>
          <div>
            <div className="text-slate-500 uppercase tracking-[0.22em] text-[10px] font-black">On Hand</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{Number(form.quantityOnHand || 0)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
