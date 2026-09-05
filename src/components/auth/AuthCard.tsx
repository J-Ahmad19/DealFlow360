import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  User,
  Building2,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
  Building,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiFetch } from '../../lib/api';
import ForgotPasswordModal from './ForgotPasswordModal';

type Mode = 'login' | 'signup';
type AccountType = 'internal' | 'customer';

interface AuthCardProps {
  initialMode?: Mode;
}

const mockTeams = [
  { id: 'sales-hq', name: 'Global Sales HQ' },
  { id: 'emea-team', name: 'EMEA Enterprise Team' },
  { id: 'apac-team', name: 'APAC Growth Ops' },
  { id: 'finance-rev', name: 'Finance & Revenue Team' },
];

export default function AuthCard({ initialMode = 'login' }: AuthCardProps) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [accountType, setAccountType] = useState<AccountType>('internal');
  
  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [companyName, setCompanyName] = useState('sales-hq');
  const [customCompany, setCustomCompany] = useState('');
  const [signupRole, setSignupRole] = useState('sales_rep');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Status & Modals
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const { loginUser } = useAuth();
  const navigate = useNavigate();

  // Password Strength Calculation for Signup
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const passwordScore = getPasswordStrength(password);

  const validateForm = () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid work email address.');
      return false;
    }
    if (mode === 'signup' && !fullName.trim()) {
      setError('Please enter your full name.');
      return false;
    }
    if (accountType === 'internal' && !password) {
      setError('Please enter your password.');
      return false;
    }
    if (mode === 'signup' && accountType === 'internal' && password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return false;
    }
    if (mode === 'signup' && !agreeTerms) {
      setError('You must agree to the Terms of Service to create an account.');
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
      if (accountType === 'customer') {
        // Customer Portal Access
        if (mode === 'login' || mode === 'signup') {
          const res = await apiFetch('/portal/auth/request-link', {
            method: 'POST',
            body: JSON.stringify({ email }),
          });
          setSuccessMsg(res.message || 'Magic access link has been sent to your email address!');
        }
      } else {
        // Internal User Flow
        if (mode === 'login') {
          const res = await apiFetch('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
          });
          if (res.user) {
            loginUser(res.user);
          }
          navigate('/app/dashboard');
        } else {
          const res = await apiFetch('/auth/signup', {
            method: 'POST',
            body: JSON.stringify({
              email,
              fullName,
              password,
              role: signupRole,
            }),
          });
          if (res.user) {
            loginUser(res.user);
          }
          navigate('/app/dashboard');
        }
      }
    } catch (err: any) {
      setError(err.message || `Failed to ${mode === 'login' ? 'log in' : 'create account'}. Please check your credentials.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        defaultEmail={email}
        isPortal={accountType === 'customer'}
      />

      <div className="card-tactile bg-white rounded-3xl p-8 sm:p-10 shadow-xl border-2 border-slate-200/80 relative overflow-hidden">
        {/* Top Header Branding */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-4 group">
            <div className="w-10 h-10 rounded-2xl bg-white border-b-2 border-slate-200 flex items-center justify-center p-1.5 shadow-sm group-hover:border-b-0 group-hover:translate-y-0.5 transition-all">
              <img src="/logo.png" alt="DealFlow360 Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-black text-2xl tracking-tight text-slate-900">
              Deal<span className="text-brand-500">Flow</span>360
            </span>
          </Link>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Login / Signup</h1>
          <p className="text-slate-500 font-bold text-sm mt-1.5">
            Entry point for internal users and customers
          </p>
        </div>

        {/* Tab Switcher (Log In | Sign Up) */}
        <div className="relative p-1 bg-slate-100/90 rounded-2xl mb-6 grid grid-cols-2 gap-1 border border-slate-200/60">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError('');
              setSuccessMsg('');
            }}
            className={`relative py-3 rounded-xl font-black text-sm transition-colors z-10 ${
              mode === 'login' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {mode === 'login' && (
              <motion.div
                layoutId="auth-tab-pill"
                className="absolute inset-0 bg-white rounded-xl shadow-sm border border-slate-200/80 -z-10"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            Log In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError('');
              setSuccessMsg('');
            }}
            className={`relative py-3 rounded-xl font-black text-sm transition-colors z-10 ${
              mode === 'signup' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {mode === 'signup' && (
              <motion.div
                layoutId="auth-tab-pill"
                className="absolute inset-0 bg-white rounded-xl shadow-sm border border-slate-200/80 -z-10"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            Sign Up
          </button>
        </div>

        {/* Account Type Selector (Internal Sales vs Customer Portal) */}
        <div className="mb-6">
          <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
            Select Account Role
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setAccountType('internal')}
              className={`p-3.5 rounded-2xl border-2 text-left transition-all flex items-start gap-3 ${
                accountType === 'internal'
                  ? 'border-brand-500 bg-brand-50/50 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
              }`}
            >
              <div className={`p-2 rounded-xl shrink-0 ${accountType === 'internal' ? 'bg-brand-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                <ShieldCheck size={18} />
              </div>
              <div>
                <p className="font-extrabold text-xs text-slate-900">Internal User</p>
                <p className="text-[11px] font-bold text-slate-500">Sales, Approvers & Ops</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setAccountType('customer')}
              className={`p-3.5 rounded-2xl border-2 text-left transition-all flex items-start gap-3 ${
                accountType === 'customer'
                  ? 'border-secondary-400 bg-secondary-50/50 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
              }`}
            >
              <div className={`p-2 rounded-xl shrink-0 ${accountType === 'customer' ? 'bg-secondary-400 text-white' : 'bg-slate-200 text-slate-600'}`}>
                <Building size={18} />
              </div>
              <div>
                <p className="font-extrabold text-xs text-slate-900">Customer Portal</p>
                <p className="text-[11px] font-bold text-slate-500">Clients & Buyers</p>
              </div>
            </button>
          </div>
        </div>

        {/* Excalidraw Wireframe Callout Banner */}
        <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 text-amber-900 font-bold text-xs leading-relaxed flex items-start gap-3">
          <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0 animate-pulse" />
          <span>
            {accountType === 'internal' ? (
              <>After login, internal users land on the <strong className="font-black text-amber-950">Sales Dashboard</strong>.</>
            ) : (
              <>Customers land on their <strong className="font-black text-amber-950">Quotation Portal</strong> via magic link authorization.</>
            )}
          </span>
        </div>

        {/* Alert Notifications */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl font-bold text-sm border border-red-100 flex items-center gap-3"
            >
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-brand-50 text-brand-700 rounded-2xl font-bold text-sm border border-brand-200 flex items-center gap-3"
            >
              <CheckCircle2 size={18} className="shrink-0 text-brand-600" />
              <span>{successMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name field (Only on Sign Up) */}
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all font-bold text-slate-900 placeholder:text-slate-400 text-sm"
                  required
                />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
              Work Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all font-bold text-slate-900 placeholder:text-slate-400 text-sm"
                required
              />
            </div>
          </div>

          {/* Password Field (Internal Accounts) */}
          {accountType === 'internal' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-xs font-black text-brand-600 hover:text-brand-700 hover:underline transition-colors"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3.5 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all font-bold text-slate-900 placeholder:text-slate-400 text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Password Strength Bar (Sign Up) */}
              {mode === 'signup' && password.length > 0 && (
                <div className="mt-2.5 space-y-1">
                  <div className="flex gap-1.5 h-1.5 w-full">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-full rounded-full flex-1 transition-all duration-300 ${
                          passwordScore >= step
                            ? step === 1
                              ? 'bg-red-500'
                              : step === 2
                              ? 'bg-amber-500'
                              : step === 3
                              ? 'bg-blue-500'
                              : 'bg-brand-500'
                            : 'bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-[11px] font-bold text-slate-500 text-right">
                    {passwordScore === 1 && 'Weak'}
                    {passwordScore === 2 && 'Fair'}
                    {passwordScore === 3 && 'Good'}
                    {passwordScore === 4 && 'Strong password'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Company / Team Selector (Shown for multi-team setups) */}
          {accountType === 'internal' && (
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                Company / Team Setup
              </label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <select
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full pl-11 pr-8 py-3.5 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all font-bold text-slate-900 text-sm appearance-none"
                >
                  {mockTeams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                  <option value="custom">+ Create / Enter Custom Organization</option>
                </select>
              </div>

              {companyName === 'custom' && (
                <div className="mt-2">
                  <input
                    type="text"
                    value={customCompany}
                    onChange={(e) => setCustomCompany(e.target.value)}
                    placeholder="Enter Organization / Team Name"
                    className="w-full px-4 py-3 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all font-bold text-slate-900 text-sm"
                    required
                  />
                </div>
              )}
            </div>
          )}
          {/* Role Selector — only sales_rep on public signup; admins created by system */}
          {mode === 'signup' && accountType === 'internal' && (
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                Your Role
              </label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { value: 'sales_rep', label: 'Sales Representative', desc: 'Create quotes, manage deals' },
                ].map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setSignupRole(r.value)}
                    className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 text-left transition-all ${
                      signupRole === r.value
                        ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-500/20'
                        : 'border-slate-100 bg-slate-50 hover:border-slate-200'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      signupRole === r.value ? 'border-brand-500 bg-brand-500' : 'border-slate-300'
                    }`}>
                      {signupRole === r.value && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900">{r.label}</p>
                      <p className="text-xs font-medium text-slate-500">{r.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-slate-400 font-medium">
                💡 Manager, Finance &amp; Admin roles are assigned by your organization admin after signup.
              </p>
            </div>
          )}
          {mode === 'signup' && (
            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="terms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-brand-500 focus:ring-brand-500"
              />
              <label htmlFor="terms" className="text-xs font-bold text-slate-600">
                I agree to DealFlow360's{' '}
                <a href="#terms" className="text-brand-600 hover:underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#privacy" className="text-brand-600 hover:underline">
                  Privacy Policy
                </a>
              </label>
            </div>
          )}

          {/* Primary Action Button (Tactile 3D press) */}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-tactile btn-primary py-4 rounded-2xl font-black text-white text-base mt-4 flex items-center justify-center gap-2 group shadow-lg shadow-brand-500/20"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </span>
            ) : (
              <>
                <span>
                  {accountType === 'customer'
                    ? 'Request Magic Link'
                    : mode === 'login'
                    ? 'Log In'
                    : 'Create Account'}
                </span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Footer Toggle Link */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-slate-500 font-bold text-sm">
            {mode === 'login' ? (
              <>
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setError('');
                    setSuccessMsg('');
                  }}
                  className="text-brand-600 hover:text-brand-700 font-black hover:underline transition-colors"
                >
                  Sign Up Link
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError('');
                    setSuccessMsg('');
                  }}
                  className="text-brand-600 hover:text-brand-700 font-black hover:underline transition-colors"
                >
                  Log In
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
