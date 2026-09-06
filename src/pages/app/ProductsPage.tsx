import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Plus, Pencil, Trash2, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { apiFetch } from '../../lib/api';

type Product = {
  id: string;
  name: string;
  categoryId?: string | null;
  active: boolean;
  promoted?: boolean;
  isRecurring?: boolean;
  billingInterval?: string | null;
  price: number;
  cost?: number;
  createdAt?: string;
};

type Category = {
  id: string;
  name: string;
};

const emptyForm = {
  name: '',
  categoryId: '',
  price: '',
  active: true,
};

const formatCurrency = (value: number | string | undefined) => {
  const amount = Number(value ?? 0);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);

  const fetchCatalog = async () => {
    try {
      setLoading(true);
      const [productRes, categoryRes] = await Promise.all([
        apiFetch('/products').catch(() => ({ data: [] })),
        apiFetch('/products/categories').catch(() => ({ data: [] })),
      ]);

      const nextProducts = Array.isArray(productRes?.data) ? productRes.data : Array.isArray(productRes) ? productRes : [];
      const nextCategories = Array.isArray(categoryRes?.data) ? categoryRes.data : Array.isArray(categoryRes) ? categoryRes : [];

      setProducts(nextProducts);
      setCategories(nextCategories);
    } catch (err) {
      console.error('Failed to load products catalog:', err);
      setError('Unable to load product catalog from the database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const totalActive = useMemo(() => products.filter((p) => p.active).length, [products]);
  const categoriesCount = categories.length;
  const totalRevenue = useMemo(
    () => products.reduce((sum, product) => sum + Number(product.price || 0), 0),
    [products]
  );

  const handleChange = (field: keyof typeof emptyForm, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setError('Product name is required.');
      return;
    }

    const normalizedPrice = Number(form.price);
    if (!Number.isFinite(normalizedPrice) || normalizedPrice < 0) {
      setError('Valid price is required.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload = {
        name: form.name.trim(),
        categoryId: form.categoryId || null,
        price: Math.round(normalizedPrice),
        active: Boolean(form.active),
      };

      if (editingId) {
        await apiFetch(`/products/${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch('/products', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }

      resetForm();
      await fetchCatalog();
    } catch (err: any) {
      console.error('Failed to save product:', err);
      setError(err.message || 'Something went wrong while saving the product.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setError(null);
    setForm({
      name: product.name,
      categoryId: product.categoryId || '',
      price: String(product.price || 0),
      active: Boolean(product.active),
    });
  };

  const handleDelete = async (productId: string) => {
    if (!window.confirm('Delete this product from the catalog? This cannot be undone.')) return;

    try {
      await apiFetch(`/products/${productId}`, { method: 'DELETE' });
      await fetchCatalog();
      if (editingId === productId) resetForm();
    } catch (err: any) {
      console.error('Failed to delete product:', err);
      setError(err.message || 'Unable to delete this product.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="card-tactile bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200/80 shadow-sm overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-extrabold text-xs mb-3">
              <span className="w-2 h-2 rounded-full bg-brand-500" />
              Category: Commercial
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-brand-50 text-brand-600 border border-brand-200 shrink-0">
                <Package size={26} />
              </div>
              Product & Pricing Catalog
            </h1>
            <p className="text-slate-500 font-bold text-sm mt-2 max-w-2xl">
              Manage SKUs, list prices, and product availability from the live database.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <Link to="/app/dashboard" className="btn-tactile btn-secondary px-5 py-3 text-xs font-black">
              ← Return to Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <div className="rounded-3xl p-6 bg-white border-2 border-slate-200/80 shadow-sm">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Active SKUs</p>
          <p className="text-3xl font-black text-slate-900">{loading ? '…' : totalActive}</p>
        </div>
        <div className="rounded-3xl p-6 bg-white border-2 border-slate-200/80 shadow-sm">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Categories</p>
          <p className="text-3xl font-black text-slate-900">{loading ? '…' : categoriesCount}</p>
        </div>
        <div className="rounded-3xl p-6 bg-white border-2 border-slate-200/80 shadow-sm">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Total Catalog Value</p>
          <p className="text-3xl font-black text-slate-900">{loading ? '…' : formatCurrency(totalRevenue)}</p>
        </div>
        <div className="rounded-3xl p-6 bg-white border-2 border-slate-200/80 shadow-sm">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Status</p>
          <p className="text-3xl font-black text-emerald-600 flex items-center gap-2">
            <CheckCircle2 size={24} /> Live
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[380px_minmax(0,1fr)] gap-6">
        <form onSubmit={handleSubmit} className="card-tactile bg-white rounded-3xl p-6 border-2 border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-slate-900">
              {editingId ? 'Edit Product' : 'New Product'}
            </h2>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="btn-tactile btn-secondary px-3 py-2 text-xs font-black"
              >
                Cancel
              </button>
            )}
          </div>

          {error && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Product name</label>
              <input
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full border-2 border-slate-200 bg-slate-50 rounded-xl px-4 py-3 text-slate-900 font-bold focus:border-brand-500 focus:outline-none"
                placeholder="e.g. Enterprise License"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Category</label>
              <select
                value={form.categoryId}
                onChange={(e) => handleChange('categoryId', e.target.value)}
                className="w-full border-2 border-slate-200 bg-slate-50 rounded-xl px-4 py-3 text-slate-900 font-bold focus:border-brand-500 focus:outline-none"
              >
                <option value="">No category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Price (USD)</label>
              <input
                type="number"
                min="0"
                step="1"
                value={form.price}
                onChange={(e) => handleChange('price', e.target.value)}
                className="w-full border-2 border-slate-200 bg-slate-50 rounded-xl px-4 py-3 text-slate-900 font-bold focus:border-brand-500 focus:outline-none"
                placeholder="5000"
              />
            </div>

            <div className="flex items-center justify-between rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-3">
              <div>
                <p className="text-sm font-black text-slate-800">Product active</p>
                <p className="text-xs font-bold text-slate-500">Visible in the catalog and buying flows</p>
              </div>
              <button
                type="button"
                onClick={() => handleChange('active', !form.active)}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${form.active ? 'bg-emerald-500' : 'bg-slate-300'}`}
                aria-label="Toggle product active state"
              >
                <span
                  className={`inline-block h-5 w-5 rounded-full bg-white shadow transform transition ${form.active ? 'translate-x-6' : 'translate-x-1'}`}
                />
              </button>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="btn-tactile btn-primary w-full px-5 py-4 text-sm font-black rounded-2xl flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              {saving ? 'Saving...' : editingId ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>

        <div className="card-tactile bg-white rounded-3xl p-6 border-2 border-slate-200/80 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-black text-slate-900">Products</h2>
            <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-black uppercase tracking-widest text-slate-500">
              {products.length} rows
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 text-slate-500">
              <Loader2 className="animate-spin mr-3" size={18} />
              Loading catalog...
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-7 text-center text-slate-500 font-bold">
              No products available yet. Create your first product from the form.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 border-b-2 border-slate-200">
                  <tr>
                    <th className="px-4 py-4 font-black uppercase tracking-wider text-xs">Product</th>
                    <th className="px-4 py-4 font-black uppercase tracking-wider text-xs">Category</th>
                    <th className="px-4 py-4 font-black uppercase tracking-wider text-xs">Price</th>
                    <th className="px-4 py-4 font-black uppercase tracking-wider text-xs">Status</th>
                    <th className="px-4 py-4 font-black uppercase tracking-wider text-xs text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-slate-900 divide-y-2 divide-slate-50">
                  {products.map((product) => {
                    const categoryName = categories.find((cat) => cat.id === product.categoryId)?.name || 'Uncategorized';

                    return (
                      <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-4 font-black">{product.name}</td>
                        <td className="px-4 py-4 font-bold text-slate-500">{categoryName}</td>
                        <td className="px-4 py-4 font-black text-slate-900">{formatCurrency(product.price)}</td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider border ${
                              product.active
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            {product.active ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                            {product.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleEdit(product)}
                              className="btn-tactile bg-white border-2 border-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-black inline-flex items-center gap-1"
                            >
                              <Pencil size={14} /> Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(product.id)}
                              className="btn-tactile bg-red-50 border-2 border-red-200 text-red-700 px-3 py-2 rounded-xl text-xs font-black inline-flex items-center gap-1"
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
