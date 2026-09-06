import { useEffect, useMemo, useState } from 'react';
import { BarChart3, Loader2, ShieldCheck, Save, TrendingUp } from 'lucide-react';
import { apiFetch } from '../../lib/api';

type Product = {
  id: string;
  name: string;
  categoryId?: string | null;
  active?: boolean;
  price?: number;
};

type Category = {
  id: string;
  name: string;
};

type PriceList = {
  id: string;
  name: string;
  active?: boolean;
};

type DiscountPolicy = {
  id: string;
  tierId?: string | null;
  categoryId?: string | null;
  discountPercent?: number;
};

type ApprovalRule = {
  id: string;
  minRisk?: number;
  maxRisk?: number;
  approverRole?: string;
  sequence?: number;
};

const defaultTierMap = [
  { label: 'Bronze', maxDiscount: 5 },
  { label: 'Silver', maxDiscount: 10 },
  { label: 'Gold', maxDiscount: 15 },
];

export default function ReportsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [priceLists, setPriceLists] = useState<PriceList[]>([]);
  const [discountPolicies, setDiscountPolicies] = useState<DiscountPolicy[]>([]);
  const [approvalRules, setApprovalRules] = useState<ApprovalRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    categoryId: '',
    price: '0',
    active: true,
  });

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [productRes, categoryRes, pricingRes, discountRes, approvalRes] = await Promise.all([
        apiFetch('/products').catch(() => ({ data: [] })),
        apiFetch('/products/categories').catch(() => ({ data: [] })),
        apiFetch('/pricing/price-lists').catch(() => ({ data: [] })),
        apiFetch('/pricing/discounts').catch(() => ({ data: [] })),
        apiFetch('/approval-rules').catch(() => ({ data: [] })),
      ]);

      const nextProducts = Array.isArray(productRes?.data) ? productRes.data : Array.isArray(productRes) ? productRes : [];
      const nextCategories = Array.isArray(categoryRes?.data) ? categoryRes.data : Array.isArray(categoryRes) ? categoryRes : [];
      const nextPriceLists = Array.isArray(pricingRes?.data) ? pricingRes.data : Array.isArray(pricingRes) ? pricingRes : [];
      const nextDiscountPolicies = Array.isArray(discountRes?.data) ? discountRes.data : Array.isArray(discountRes) ? discountRes : [];
      const nextApprovalRules = Array.isArray(approvalRes?.data) ? approvalRes.data : Array.isArray(approvalRes) ? approvalRes : [];

      setProducts(nextProducts);
      setCategories(nextCategories);
      setPriceLists(nextPriceLists);
      setDiscountPolicies(nextDiscountPolicies);
      setApprovalRules(nextApprovalRules);

      if (nextProducts[0]) {
        setForm({
          name: nextProducts[0].name,
          categoryId: nextProducts[0].categoryId || '',
          price: String(nextProducts[0].price || 0),
          active: Boolean(nextProducts[0].active),
        });
      }
    } catch (err) {
      console.error('Failed to load admin reporting data:', err);
      setError('Unable to load reporting + pricing data from the database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const analytics = useMemo(() => {
    const totalProducts = products.length;
    const activeProducts = products.filter((p) => p.active).length;
    const totalPriceListValue = products.reduce((sum, product) => sum + Number(product.price || 0), 0);
    const maxDiscount = discountPolicies.reduce((max, item) => Math.max(max, Number(item.discountPercent || 0)), 0);

    return {
      activeProducts,
      approvalStages: approvalRules.length,
      totalProducts,
      totalPriceListValue,
      maxDiscount,
    };
  }, [products, discountPolicies, approvalRules]);

  const handleSavePricing = async () => {
    if (!form.name.trim()) {
      setError('Product name is required.');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const payload = {
        name: form.name.trim(),
        categoryId: form.categoryId || null,
        price: Number(form.price) || 0,
        active: Boolean(form.active),
      };

      if (products[0]?.id) {
        await apiFetch(`/products/${products[0].id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch('/products', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }

      await fetchAdminData();
    } catch (err: any) {
      console.error('Failed to save product pricing config:', err);
      setError(err.message || 'Product pricing update failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDiscountConfig = async () => {
    try {
      setSaving(true);
      setError(null);

      const updates = defaultTierMap.map((tier) => {
        const match = discountPolicies.find((policy) => policy.tierId === tier.label || policy.discountPercent === tier.maxDiscount);
        const targetId = match?.id;

        if (!targetId) return null;

        return apiFetch(`/pricing/discounts/${targetId}`, {
          method: 'PATCH',
          body: JSON.stringify({ discountPercent: tier.maxDiscount }),
        });
      }).filter(Boolean);

      await Promise.all(updates as Promise<any>[]);
      await fetchAdminData();
    } catch (err: any) {
      console.error('Failed to save discount config:', err);
      setError(err.message || 'Discount configuration update failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="card-tactile bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200/80 shadow-sm overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-extrabold text-xs mb-3">
              <span className="w-2 h-2 rounded-full bg-brand-500" />
              Admin only
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-brand-50 text-brand-600 border border-brand-200 shrink-0">
                <BarChart3 size={26} />
              </div>
              Admin / Reporting Dashboard
            </h1>
            <p className="text-slate-500 font-bold text-sm mt-2 max-w-2xl">
              Sales trends, approval workload, product pricing, and governance controls across the platform.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <div className="rounded-3xl p-6 bg-white border-2 border-slate-200/80 shadow-sm">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Products</p>
          <p className="text-3xl font-black text-slate-900">{loading ? '…' : analytics.totalProducts}</p>
        </div>
        <div className="rounded-3xl p-6 bg-white border-2 border-slate-200/80 shadow-sm">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Active SKUs</p>
          <p className="text-3xl font-black text-slate-900">{loading ? '…' : analytics.activeProducts}</p>
        </div>
        <div className="rounded-3xl p-6 bg-white border-2 border-slate-200/80 shadow-sm">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Approval Levels</p>
          <p className="text-3xl font-black text-slate-900">{loading ? '…' : analytics.approvalStages}</p>
        </div>
        <div className="rounded-3xl p-6 bg-white border-2 border-slate-200/80 shadow-sm">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Max Discount</p>
          <p className="text-3xl font-black text-slate-900">{loading ? '…' : `${analytics.maxDiscount}%`}</p>
        </div>
      </div>

      <div className="card-tactile bg-white rounded-3xl p-6 border-2 border-slate-200/80 shadow-sm">
        <div className="grid grid-cols-1 xl:grid-cols-[360px_minmax(0,1fr)] gap-6">
          <div className="rounded-2xl bg-slate-50 border-2 border-slate-200 p-5">
            <h2 className="text-xl font-black text-slate-900 mb-4">Product & Price List Management</h2>

            {error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full border-2 border-slate-200 bg-white rounded-xl px-4 py-3 text-slate-900 font-bold focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Category</label>
                <select
                  value={form.categoryId}
                  onChange={(e) => setForm((prev) => ({ ...prev, categoryId: e.target.value }))}
                  className="w-full border-2 border-slate-200 bg-white rounded-xl px-4 py-3 text-slate-900 font-bold focus:border-brand-500 focus:outline-none"
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Price</label>
                  <input
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                    className="w-full border-2 border-slate-200 bg-white rounded-xl px-4 py-3 text-slate-900 font-bold focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Unit</label>
                  <input
                    value="Each"
                    readOnly
                    className="w-full border-2 border-slate-200 bg-slate-100 rounded-xl px-4 py-3 text-slate-600 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Tax</label>
                <input
                  value="15%"
                  readOnly
                  className="w-full border-2 border-slate-200 bg-slate-100 rounded-xl px-4 py-3 text-slate-600 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Description</label>
                <textarea
                  value={form.name ? `${form.name} catalog item` : ''}
                  readOnly
                  className="w-full border-2 border-slate-200 bg-slate-100 rounded-xl px-4 py-3 text-slate-600 font-bold min-h-[88px]"
                />
              </div>

              <button
                type="button"
                onClick={handleSavePricing}
                disabled={saving}
                className="btn-tactile btn-primary w-full px-5 py-4 text-sm font-black rounded-2xl flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {saving ? 'Saving...' : 'Save pricing configuration'}
              </button>
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-2xl bg-slate-50 border-2 border-slate-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black text-slate-900">Live catalog</h3>
                <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  {products.length} SKUs
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-white text-slate-500 border-b-2 border-slate-200">
                    <tr>
                      <th className="px-3 py-3 font-black uppercase tracking-wider text-xs">Name</th>
                      <th className="px-3 py-3 font-black uppercase tracking-wider text-xs">Category</th>
                      <th className="px-3 py-3 font-black uppercase tracking-wider text-xs">Price</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-900 divide-y-2 divide-slate-100">
                    {products.slice(0, 6).map((product) => (
                      <tr key={product.id}>
                        <td className="px-3 py-3 font-black">{product.name}</td>
                        <td className="px-3 py-3 font-bold text-slate-500">{categories.find((cat) => cat.id === product.categoryId)?.name || 'Uncategorized'}</td>
                        <td className="px-3 py-3 font-black">${Number(product.price || 0).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 border-2 border-slate-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black text-slate-900">Price lists</h3>
                <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  {priceLists.length} lists
                </span>
              </div>

              <div className="space-y-3">
                {priceLists.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-white p-4 text-sm font-bold text-slate-500">
                    No price lists available.
                  </div>
                ) : (
                  priceLists.map((list) => (
                    <div key={list.id} className="flex items-center justify-between rounded-xl bg-white border-2 border-slate-200 px-4 py-3">
                      <div>
                        <div className="font-black text-slate-800">{list.name}</div>
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">{list.active ? 'Active' : 'Inactive'}</div>
                      </div>
                      <div className="text-brand-600 text-xl"><TrendingUp size={18} /></div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card-tactile bg-white rounded-3xl p-6 border-2 border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-black text-slate-900">Discount Tier & Approval Chain Setup</h2>
          <button
            type="button"
            onClick={handleSaveDiscountConfig}
            disabled={saving}
            className="btn-tactile btn-primary px-5 py-3 text-sm font-black rounded-2xl flex items-center gap-2"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
            Save configuration
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-slate-50 border-2 border-slate-200 p-5">
            <h3 className="text-lg font-black text-slate-900 mb-4">Discount ceilings</h3>
            <table className="w-full text-left text-sm">
              <thead className="bg-white text-slate-500 border-b-2 border-slate-200">
                <tr>
                  <th className="px-3 py-3 font-black uppercase tracking-wider text-xs">Tier</th>
                  <th className="px-3 py-3 font-black uppercase tracking-wider text-xs">Max Discount</th>
                </tr>
              </thead>
              <tbody className="text-slate-900 divide-y-2 divide-slate-100">
                {defaultTierMap.map((tier) => (
                  <tr key={tier.label}>
                    <td className="px-3 py-3 font-black">{tier.label}</td>
                    <td className="px-3 py-3 font-bold text-slate-600">{tier.maxDiscount} percent</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-2xl bg-slate-50 border-2 border-slate-200 p-5">
            <h3 className="text-lg font-black text-slate-900 mb-4">Approval chain</h3>
            <div className="space-y-3">
              {approvalRules.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-white p-4 text-sm font-bold text-slate-500">
                  No approval rule configured.
                </div>
              ) : (
                approvalRules.map((rule) => (
                  <div key={rule.id} className="rounded-xl bg-white border-2 border-slate-200 px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-black text-slate-800">{rule.approverRole || 'Approval role'}</span>
                      <span className="rounded-full bg-brand-50 text-brand-700 border border-brand-200 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest">
                        Sequence {rule.sequence || 1}
                      </span>
                    </div>
                    <div className="mt-2 text-sm font-bold text-slate-500">
                      {rule.minRisk ?? 0}% to {rule.maxRisk ?? 100}%
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border-2 border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">
          When a quote mixes categories with different ceilings, the system must compute a blended risk score and route to the highest required level. Audit logs capture user, timestamp, and reason for every approval or rejection.
        </div>
      </div>
    </div>
  );
}

