import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ShieldCheck, Building } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Workflow', href: '#workflow' },
  { label: 'Benefits', href: '#benefits' },
  { label: 'Testimonials', href: '#testimonials' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, customer } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md border-b-2 border-slate-100 py-3 shadow-sm'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center border-b-4 border-slate-200 group-hover:border-b-0 group-hover:translate-y-1 transition-all duration-150 p-1 shadow-sm">
            <img src="/logo.png" alt="DealFlow360 Logo" className="w-full h-full object-contain" />
          </div>
          <span className="font-display font-black text-xl text-slate-900 tracking-tight">
            Deal<span className="text-brand-500">Flow</span>360
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-all"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop Action Buttons: [Get Started] [Sign In] [View My Quote] */}
        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <Link
              to="/app/dashboard"
              className="btn-tactile btn-primary px-5 py-2.5 text-sm flex items-center gap-2"
            >
              <ShieldCheck size={16} />
              Internal Workspace
            </Link>
          ) : customer ? (
            <Link
              to="/portal/dashboard"
              className="btn-tactile btn-secondary px-5 py-2.5 text-sm flex items-center gap-2"
            >
              <Building size={16} />
              Quotation Portal
            </Link>
          ) : (
            <>
              {/* Sign In -> internal login */}
              <Link
                to="/auth/login"
                className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
              >
                Sign In
              </Link>

              {/* View My Quote -> customer portal login */}
              <Link
                to="/portal/login"
                className="px-4 py-2 text-sm font-bold text-secondary-600 hover:text-secondary-700 hover:bg-secondary-50 rounded-xl transition-all border border-secondary-200"
              >
                View My Quote
              </Link>

              {/* Get Started -> internal signup */}
              <Link
                to="/auth/signup"
                className="btn-tactile btn-primary px-5 py-2.5 text-sm rounded-xl ml-1"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} strokeWidth={3} /> : <Menu size={20} strokeWidth={3} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden overflow-hidden bg-white/95 backdrop-blur-md border-t-2 border-slate-100"
          >
            <div className="px-6 py-5 space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-4 border-t-2 border-slate-100 space-y-2">
                <Link
                  to="/auth/login"
                  onClick={() => setMobileOpen(false)}
                  className="block text-center px-4 py-3 text-sm font-bold text-slate-700 bg-slate-100 rounded-xl"
                >
                  Sign In
                </Link>
                <Link
                  to="/portal/login"
                  onClick={() => setMobileOpen(false)}
                  className="block text-center px-4 py-3 text-sm font-bold text-secondary-600 border border-secondary-200 rounded-xl"
                >
                  View My Quote
                </Link>
                <Link
                  to="/auth/signup"
                  onClick={() => setMobileOpen(false)}
                  className="btn-tactile btn-primary w-full text-center py-3 text-sm"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
