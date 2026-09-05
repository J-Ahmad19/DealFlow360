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
    description: 'Generate intelligent quotes with real-time pricing and margin analysis.',
    color: 'bg-brand-500',
    bg: 'bg-brand-50',
    details: ['Smart pricing', 'Bundle suggestions'],
  },
  {
    icon: CheckCircle2,
    title: 'Approval',
    description: 'Automated multi-level approval workflows with SLA tracking.',
    color: 'bg-blue-500',
    bg: 'bg-blue-50',
    details: ['Auto-routing', 'SLA timers'],
  },
  {
    icon: Truck,
    title: 'Fulfillment',
    description: 'End-to-end order orchestration across warehouses with live inventory.',
    color: 'bg-secondary-400',
    bg: 'bg-secondary-50',
    details: ['Multi-warehouse', 'Pick & pack'],
  },
  {
    icon: Receipt,
    title: 'Billing',
    description: 'Hybrid billing engine supporting one-time and subscription models.',
    color: 'bg-warning-500',
    bg: 'bg-amber-50',
    details: ['Auto-invoicing', 'Tax engine'],
  },
  {
    icon: BarChart3,
    title: 'Reporting',
    description: 'Real-time dashboards and predictive analytics across the deal lifecycle.',
    color: 'bg-danger-500',
    bg: 'bg-red-50',
    details: ['Live dashboards', 'Forecasts'],
  },
];

export default function Workflow() {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <section id="workflow" ref={ref} className="py-24 lg:py-32 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm font-bold text-secondary-500 uppercase tracking-widest mb-4"
          >
            End-to-End Workflow
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-tight mb-6"
          >
            One platform. Complete lifecycle.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg font-bold text-slate-500 leading-relaxed"
          >
            From the first quote to the final invoice, every step is connected,
            automated, and intelligent. No handoffs, no gaps, no lost deals.
          </motion.p>
        </div>

        <div className="relative">
          {/* Connection line */}
          <div className="hidden lg:block absolute top-24 left-[10%] right-[10%] h-1 z-0">
            <div className="w-full h-full bg-slate-200 rounded-full" />
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
                  <div className="card-tactile p-6 text-center h-full">
                    <div className={`w-16 h-16 rounded-2xl ${step.bg} flex items-center justify-center mx-auto mb-6 border-2 border-transparent hover:border-white shadow-sm`}>
                      <div className={`w-12 h-12 rounded-xl ${step.color} flex items-center justify-center shadow-sm`}>
                        <Icon size={24} className="text-white" />
                      </div>
                    </div>

                    <h3 className="font-display text-lg font-black text-slate-900 mb-3">
                      {step.title}
                    </h3>
                    <p className="text-sm font-bold text-slate-500 leading-relaxed mb-5">
                      {step.description}
                    </p>

                    <ul className="space-y-2">
                      {step.details.map((detail, i) => (
                        <li key={i} className="text-xs text-slate-400 font-bold bg-slate-50 py-1.5 px-3 rounded-lg border-2 border-slate-100">
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {idx < steps.length - 1 && (
                    <div className="hidden lg:flex absolute top-24 -right-3 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white border-2 border-slate-200 items-center justify-center shadow-sm text-slate-400">
                      <ArrowRight size={14} strokeWidth={3} />
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
