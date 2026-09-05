import { useRef } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  CheckCircle2,
  Truck,
  Receipt,
  BarChart3,
  ArrowRight,
} from 'lucide-react';

const steps = [
  {
    icon: FileText,
    title: 'Quotation',
    description: 'Generate intelligent quotes with real-time pricing, margin analysis, and AI-powered product recommendations.',
    color: 'from-brand-500 to-amber-500',
    bg: 'bg-brand-50',
    details: ['Smart pricing', 'Bundle suggestions', 'Margin calculator'],
  },
  {
    icon: CheckCircle2,
    title: 'Approval',
    description: 'Automated multi-level approval workflows with delegation rules, SLA tracking, and exception handling.',
    color: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-50',
    details: ['Auto-routing', 'SLA timers', 'Delegate chains'],
  },
  {
    icon: Truck,
    title: 'Fulfillment',
    description: 'End-to-end order orchestration across warehouses with real-time inventory and carrier optimization.',
    color: 'from-green-500 to-emerald-500',
    bg: 'bg-green-50',
    details: ['Multi-warehouse', 'Pick & pack', 'Track & trace'],
  },
  {
    icon: Receipt,
    title: 'Billing',
    description: 'Hybrid billing engine supporting one-time, subscription, usage-based, and milestone payment models.',
    color: 'from-purple-500 to-violet-500',
    bg: 'bg-purple-50',
    details: ['Auto-invoicing', 'Revenue rec', 'Tax engine'],
  },
  {
    icon: BarChart3,
    title: 'Reporting',
    description: 'Real-time dashboards, predictive analytics, and automated reporting across the entire deal lifecycle.',
    color: 'from-rose-500 to-pink-500',
    bg: 'bg-rose-50',
    details: ['Live dashboards', 'Forecasts', 'Custom reports'],
  },
];

export default function Workflow() {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <section id="workflow" ref={ref} className="py-24 lg:py-32 bg-slate-50 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm font-semibold text-brand-600 uppercase tracking-wider mb-3"
          >
            End-to-End Workflow
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-950 leading-tight mb-5"
          >
            One platform. Complete lifecycle.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-500 leading-relaxed"
          >
            From the first quote to the final invoice, every step is connected,
            automated, and intelligent. No handoffs, no gaps, no lost deals.
          </motion.p>
        </div>

        <div className="relative">
          {/* Connection line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2 z-0">
            <div className="w-full h-full bg-gradient-to-r from-brand-300 via-brand-400 to-brand-300 rounded-full opacity-30" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 relative z-10">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.12, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="relative"
                >
                  <div className="bg-white rounded-2xl p-6 border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-lg hover:shadow-slate-900/5 transition-all duration-500 hover:-translate-y-1 text-center">
                    <div className={`w-16 h-16 rounded-2xl ${step.bg} flex items-center justify-center mx-auto mb-5`}>
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}>
                        <Icon size={24} className="text-white" />
                      </div>
                    </div>

                    <h3 className="font-display text-base font-bold text-slate-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-slate-500 leading-relaxed mb-4">
                      {step.description}
                    </p>

                    <ul className="space-y-1.5">
                      {step.details.map((detail, i) => (
                        <li key={i} className="text-xs text-slate-400 font-medium">
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {idx < steps.length - 1 && (
                    <div className="hidden lg:flex absolute top-1/2 -right-3 -translate-y-1/2 z-20 w-6 h-6 rounded-full bg-white border border-slate-200 items-center justify-center shadow-sm">
                      <ArrowRight size={12} className="text-brand-500" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
