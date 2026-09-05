import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
} from 'lucide-react';
import { apiFetch } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import ForgotPasswordModal from './ForgotPasswordModal';

interface AuthCardProps {
  initialMode?: 'login' | 'signup';
}

export default function AuthCard({ initialMode = 'login' }: AuthCardProps) {
  void initialMode;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid work email address.');
      return false;
    }

    if (!password) {
      setError('Please enter your password.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      const res = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (res.user) {
        loginUser(res.user);
      }

      navigate('/app/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-xl">
      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        defaultEmail={email}
        isPortal={false}
      />

      <div className="card-tactile overflow-hidden bg-white p-6 sm:p-8">
        <div className="mb-6 flex items-center gap-3 border-b border-slate-200 pb-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-slate-200 bg-brand-50 shadow-sm">
            <img src="/logo.png" alt="DealFlow360 Logo" className="h-8 w-8 object-contain" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-brand-600">Operations</p>
            <h1 className="text-2xl font-black text-slate-900">DealFlow360</h1>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm font-black uppercase tracking-widest text-brand-600">Welcome back</p>
          <h2 className="mt-2 text-3xl font-black text-slate-900">Log in</h2>
          <p className="mt-2 text-sm font-bold text-slate-500">Access your sales workspace and approvals.</p>
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-5 flex items-center gap-3 rounded-2xl border border-danger-500/30 bg-red-50 px-3 py-3 text-sm font-bold text-red-600"
            >
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {successMsg && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-5 flex items-center gap-3 rounded-2xl border border-brand-200 bg-brand-50 px-3 py-3 text-sm font-bold text-brand-700"
            >
              <CheckCircle2 size={16} className="shrink-0" />
              <span>{successMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-700">
              Work email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-bold text-slate-900 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 placeholder:text-slate-400"
                required
              />
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <label className="text-xs font-black uppercase tracking-widest text-slate-700">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-xs font-black text-brand-600 transition hover:text-brand-700"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 py-3 pl-11 pr-12 text-sm font-bold text-slate-900 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 placeholder:text-slate-400"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-tactile btn-primary w-full px-5 py-4 text-base"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Logging in...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Log in
                <ArrowRight size={18} />
              </span>
            )}
          </button>
        </form>

        <div className="mt-6 rounded-2xl border border-brand-100 bg-brand-50 px-4 py-3 text-center text-xs font-bold text-brand-700">
          Need customer portal access?{' '}
          <Link to="/portal/signup" className="font-black underline-offset-2 hover:underline">
            Create account
          </Link>
        </div>

        <div className="mt-5 flex items-center justify-center gap-3 text-sm font-black text-slate-500">
          <Link to="/" className="transition hover:text-slate-700">
            Back to home
          </Link>
          <span className="text-slate-300">|</span>
          <Link to="/portal/login" className="transition hover:text-slate-700">
            Customer login
          </Link>
        </div>
      </div>
    </div>
  );
}
