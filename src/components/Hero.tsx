import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ArrowRight, Play } from 'lucide-react';

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.hero-orb',
        { scale: 0.8, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 2,
          ease: 'power2.out',
          stagger: 0.3,
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen hero-gradient flex items-center pt-24 pb-20 overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="hero-orb absolute top-20 left-[10%] w-72 h-72 rounded-full bg-brand-400/10 blur-3xl" />
        <div className="hero-orb absolute bottom-20 right-[15%] w-96 h-96 rounded-full bg-warm-400/10 blur-3xl" />
        <div className="hero-orb absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-brand-300/5 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 w-full">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full clay-accent mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
            <span className="text-sm font-medium text-brand-700">
              Now with AI-Powered Deal Intelligence
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold text-slate-950 leading-[1.08] tracking-tight mb-6"
          >
            Turn Every Deal Into a{' '}
            <span className="relative inline-block">
              <span className="gradient-text">Smarter Deal</span>
              <svg
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 200 12"
                fill="none"
                preserveAspectRatio="none"
              >
                <motion.path
                  d="M2 8C40 2 80 2 100 4C120 6 160 6 198 3"
                  stroke="url(#hero-underline)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1, delay: 1, ease: 'easeInOut' }}
                />
                <defs>
                  <linearGradient id="hero-underline" x1="0" y1="0" x2="200" y2="0" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#ff8c00" />
                    <stop offset="1" stopColor="#ffc233" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-lg sm:text-xl text-slate-500 leading-relaxed max-w-2xl mx-auto mb-10"
          >
            The intelligent, self-governing sales operations platform that manages
            the complete Quote → Approval → Fulfillment → Billing workflow.
            Far beyond simple quote-to-invoice tools.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.65 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <a
              href="#cta"
              className="group inline-flex items-center gap-2.5 px-7 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-brand-500 to-brand-600 rounded-2xl shadow-xl shadow-brand-500/25 hover:shadow-brand-500/40 hover:-translate-y-0.5 transition-all duration-300"
            >
              Get Started Free
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </a>
            <a
              href="#workflow"
              className="group inline-flex items-center gap-2.5 px-7 py-3.5 text-base font-semibold text-slate-700 bg-white/80 rounded-2xl border border-slate-200 hover:border-slate-300 hover:bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center group-hover:bg-brand-100 transition-colors">
                <Play size={14} className="text-brand-600 ml-0.5" />
              </div>
              View Demo
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="mt-12 flex items-center justify-center gap-8 text-sm text-slate-400"
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-brand-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Free 14-day trial
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-brand-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              No credit card required
            </span>
            <span className="hidden sm:flex items-center gap-2">
              <svg className="w-4 h-4 text-brand-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Setup in 5 minutes
            </span>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mt-16 max-w-5xl mx-auto"
        >
          <DashboardPreview />
        </motion.div>
      </div>
    </section>
  );
}

function DashboardPreview() {
  return (
    <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-slate-900/10 border border-slate-200/50">
      <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-white/80 backdrop-blur-sm" />
      <div className="relative bg-white rounded-3xl p-1">
        <div className="rounded-2xl overflow-hidden border border-slate-100">
          <div className="bg-slate-50 px-5 py-3 border-b border-slate-100 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="px-4 py-1 bg-white rounded-lg text-xs text-slate-400 font-medium border border-slate-200">
                app.dealflow360.com/dashboard
              </div>
            </div>
          </div>

          <div className="p-6 bg-white grid grid-cols-2 lg:grid-cols-4 gap-4">
            <DashboardCard
              label="Deal Health Score"
              value="94.2%"
              trend="+3.1%"
              color="green"
              icon="❤️"
            />
            <DashboardCard
              label="Pending Approvals"
              value="7"
              trend="-2 from yesterday"
              color="amber"
              icon="⏳"
            />
            <DashboardCard
              label="Gross Margin"
              value="32.8%"
              trend="+1.4%"
              color="blue"
              icon="📊"
            />
            <DashboardCard
              label="Active Quotations"
              value="23"
              trend="4 closing this week"
              color="purple"
              icon="📋"
            />
          </div>

          <div className="p-6 pt-2 bg-white grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 clay rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-display font-semibold text-slate-800 text-sm">Deal Pipeline</h4>
                <span className="text-xs text-slate-400 font-medium">This Quarter</span>
              </div>
              <div className="space-y-3">
                {[
                  { name: 'Enterprise Pro', value: 85, color: 'bg-brand-500' },
                  { name: 'Growth Suite', value: 62, color: 'bg-brand-400' },
                  { name: 'Starter Pack', value: 91, color: 'bg-green-500' },
                ].map((deal) => (
                  <div key={deal.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-slate-600">{deal.name}</span>
                      <span className="text-xs text-slate-400">{deal.value}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${deal.color}`}
                        style={{ width: `${deal.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="clay-accent rounded-2xl p-5">
              <h4 className="font-display font-semibold text-slate-800 text-sm mb-3">Recent Activity</h4>
              <div className="space-y-3">
                {[
                  { action: 'Quote approved', time: '2m ago', dot: 'bg-green-500' },
                  { action: 'Discount request', time: '15m ago', dot: 'bg-amber-500' },
                  { action: 'Invoice sent', time: '1h ago', dot: 'bg-blue-500' },
                  { action: 'Deal closed', time: '3h ago', dot: 'bg-brand-500' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${item.dot}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-700 truncate">{item.action}</p>
                      <p className="text-[10px] text-slate-400">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardCard({
  label,
  value,
  trend,
  color,
  icon,
}: {
  label: string;
  value: string;
  trend: string;
  color: string;
  icon: string;
}) {
  const colorMap: Record<string, string> = {
    green: 'from-green-50 to-green-100/50 border-green-200/50',
    amber: 'from-amber-50 to-amber-100/50 border-amber-200/50',
    blue: 'from-blue-50 to-blue-100/50 border-blue-200/50',
    purple: 'from-purple-50 to-purple-100/50 border-purple-200/50',
  };

  return (
    <div className={`bg-gradient-to-br ${colorMap[color]} rounded-2xl p-4 border`}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-lg">{icon}</span>
        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className="font-display text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500 mt-1">{trend}</p>
    </div>
  );
}
