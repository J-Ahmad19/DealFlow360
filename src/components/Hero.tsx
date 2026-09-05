import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ArrowRight, Play, HeartPulse, Clock, BarChart3, ClipboardList } from 'lucide-react';
import { Link } from 'react-router-dom';

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
        <div className="hero-orb absolute top-20 left-[10%] w-72 h-72 rounded-full bg-secondary-400/10 blur-3xl" />
        <div className="hero-orb absolute bottom-20 right-[15%] w-96 h-96 rounded-full bg-brand-400/10 blur-3xl" />
        <div className="hero-orb absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-brand-300/5 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 w-full">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border-2 border-slate-200 border-b-4 mb-8"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-pulse" />
            <span className="text-sm font-bold text-slate-700 tracking-wide">
              AI-Powered Deal Intelligence
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] tracking-tight mb-6"
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
                  strokeWidth="4"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1, delay: 1, ease: 'easeInOut' }}
                />
                <defs>
                  <linearGradient id="hero-underline" x1="0" y1="0" x2="200" y2="0" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#58CC02" />
                    <stop offset="1" stopColor="#CE82FF" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-lg sm:text-xl text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto mb-10"
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
            <Link
              to="/signup"
              className="btn-tactile btn-primary px-8 py-4 text-lg"
            >
              Get Started Free
              <ArrowRight
                size={20}
                className="ml-2"
              />
            </Link>
            <a
              href="#workflow"
              className="btn-tactile btn-secondary px-8 py-4 text-lg"
            >
              <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center mr-2">
                <Play size={12} className="text-brand-600 ml-0.5" />
              </div>
              View Demo
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="mt-12 flex items-center justify-center gap-8 text-sm font-bold text-slate-400"
          >
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 text-brand-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Free 14-day trial
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 text-brand-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              No credit card required
            </span>
            <span className="hidden sm:flex items-center gap-2">
              <svg className="w-5 h-5 text-brand-500" fill="currentColor" viewBox="0 0 20 20">
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
    <div className="card-tactile relative overflow-hidden p-1 bg-white">
      <div className="rounded-[18px] overflow-hidden border-2 border-slate-100">
        <div className="bg-slate-50 px-5 py-3 border-b-2 border-slate-100 flex items-center gap-2">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-danger-500" />
            <div className="w-3 h-3 rounded-full bg-warning-500" />
            <div className="w-3 h-3 rounded-full bg-brand-500" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="px-6 py-1.5 bg-white rounded-xl text-xs text-slate-400 font-bold border-2 border-slate-100 font-mono tracking-tight">
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
            icon={<HeartPulse className="w-6 h-6 text-brand-500" />}
          />
          <DashboardCard
            label="Pending Approvals"
            value="7"
            trend="-2 from yesterday"
            color="amber"
            icon={<Clock className="w-6 h-6 text-warning-500" />}
          />
          <DashboardCard
            label="Gross Margin"
            value="32.8%"
            trend="+1.4%"
            color="blue"
            icon={<BarChart3 className="w-6 h-6 text-blue-500" />}
          />
          <DashboardCard
            label="Active Quotations"
            value="23"
            trend="4 closing this week"
            color="purple"
            icon={<ClipboardList className="w-6 h-6 text-secondary-500" />}
          />
        </div>

        <div className="p-6 pt-2 bg-white grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl border-2 border-slate-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h4 className="font-display font-bold text-slate-800 text-base">Deal Pipeline</h4>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">This Quarter</span>
            </div>
            <div className="space-y-4">
              {[
                { name: 'Enterprise Pro', value: 85, color: 'bg-brand-500' },
                { name: 'Growth Suite', value: 62, color: 'bg-secondary-400' },
                { name: 'Starter Pack', value: 91, color: 'bg-blue-400' },
              ].map((deal) => (
                <div key={deal.name}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-slate-700">{deal.name}</span>
                    <span className="text-sm font-bold text-slate-400">{deal.value}%</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${deal.color}`}
                      style={{ width: `${deal.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border-2 border-slate-100 p-6 bg-slate-50/50">
            <h4 className="font-display font-bold text-slate-800 text-base mb-5">Recent Activity</h4>
            <div className="space-y-4">
              {[
                { action: 'Quote approved', time: '2m ago', dot: 'bg-brand-500' },
                { action: 'Discount request', time: '15m ago', dot: 'bg-warning-500' },
                { action: 'Invoice sent', time: '1h ago', dot: 'bg-blue-500' },
                { action: 'Deal closed', time: '3h ago', dot: 'bg-secondary-400' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${item.dot}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-700 truncate">{item.action}</p>
                    <p className="text-xs font-bold text-slate-400">{item.time}</p>
                  </div>
                </div>
              ))}
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
  icon: React.ReactNode;
}) {
  const colorMap: Record<string, string> = {
    green: 'bg-brand-50 border-brand-200 text-brand-600',
    amber: 'bg-warning-500/10 border-warning-500/30 text-warning-600',
    blue: 'bg-blue-50 border-blue-200 text-blue-600',
    purple: 'bg-secondary-50 border-secondary-200 text-secondary-600',
  };

  return (
    <div className={`rounded-2xl p-5 border-2 ${colorMap[color]} shadow-sm`}>
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 bg-white rounded-xl border border-slate-100 shadow-sm">
          {icon}
        </div>
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right leading-tight max-w-[80px]">
          {label}
        </span>
      </div>
      <p className="font-display text-3xl font-black text-slate-800 mb-1">{value}</p>
      <p className="text-xs font-bold opacity-80">{trend}</p>
    </div>
  );
}
