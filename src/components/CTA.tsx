import { motion } from 'framer-motion';
import { ArrowRight, Zap, Lock, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CTA() {
  return (
    <section id="cta" className="py-24 lg:py-32 bg-white relative overflow-hidden">
      {/* Subtle ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-brand-400/8 blur-3xl" />
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-secondary-400/5 blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto px-6 relative text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border-2 border-brand-200 border-b-4 mb-10">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-pulse" />
            <span className="text-sm font-black text-brand-600 uppercase tracking-widest">
              Free 14-day trial · No credit card required
            </span>
          </div>

          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.1] mb-6">
            Ready to transform your{' '}
            <span className="gradient-text">sales operations</span>?
          </h2>

          <p className="text-lg sm:text-xl font-bold text-slate-500 leading-relaxed max-w-2xl mx-auto mb-12">
            Join 500+ companies that closed more deals, faster, with DealFlow360.
            Set up in under 5 minutes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              to="/signup"
              className="btn-tactile btn-primary px-10 py-5 text-lg"
            >
              Start Free Trial
              <ArrowRight size={20} className="ml-2" />
            </Link>
            <Link
              to="/login"
              className="btn-tactile btn-secondary px-10 py-5 text-lg"
            >
              Log in to Account
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
            {[
              { label: 'Setup in 5 minutes', icon: Zap, color: 'text-warning-500', bg: 'bg-amber-50 border-amber-100' },
              { label: 'No credit card needed', icon: Lock, color: 'text-brand-500', bg: 'bg-brand-50 border-brand-100' },
              { label: 'Cancel anytime', icon: RefreshCw, color: 'text-secondary-400', bg: 'bg-secondary-50 border-secondary-100' },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + idx * 0.1 }}
                  className={`flex items-center justify-center gap-3 px-5 py-4 rounded-2xl border-2 ${item.bg} font-bold text-sm text-slate-600`}
                >
                  <Icon size={18} className={item.color} strokeWidth={2.5} />
                  {item.label}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
