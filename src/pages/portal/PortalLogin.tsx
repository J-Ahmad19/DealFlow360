import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../../lib/api';

export default function PortalLogin() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await apiFetch('/portal/auth/request-link', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });

      setMessage(res.message || 'If your account exists, a magic link has been sent.');
    } catch (err: any) {
      const statusMessage = err?.statusCode === 401 || err?.message?.toLowerCase().includes('account')
        ? 'This customer account is not registered yet. Please sign up first.'
        : err.message || 'Failed to request magic link';
      setError(statusMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 font-display p-6">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-6 group">
            <div className="w-8 h-8 rounded-xl bg-slate-100 border-b-2 border-slate-200 flex items-center justify-center p-1">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-black text-lg tracking-tight text-slate-900">
              Deal<span className="text-brand-500">Flow</span>360
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Customer Portal</h1>
          <p className="text-slate-500 font-medium mt-2">Log in to view your quotations</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl font-medium text-sm border border-red-100">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl font-medium text-sm border border-green-100">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
              placeholder="you@company.com"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-tactile btn-primary py-3.5 rounded-xl font-bold mt-2"
          >
            {loading ? 'Sending link...' : 'Send Magic Link'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          Need access?{' '}
          <Link to="/portal/signup" className="font-bold text-brand-600 hover:text-brand-500">
            Sign up first
          </Link>
        </div>
      </div>
    </div>
  );
}
