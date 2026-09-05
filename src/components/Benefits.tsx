import { motion } from 'framer-motion';
import {
  User,
  Users,
  Calculator,
  HeartHandshake,
  Settings,
} from 'lucide-react';

const roles = [
  {
    icon: User,
    role: 'Sales Reps',
    title: 'Close deals faster, earn more',
    benefits: [
      'Smart quote builder with AI suggestions',
      'Real-time margin visibility',
      'One-click upsell recommendations',
      'Mobile-first deal management',
      'Automated follow-up reminders',
    ],
    color: 'bg-brand-500',
    bg: 'bg-brand-50',
    metric: '37%',
    metricLabel: 'faster deal closure',
  },
  {
    icon: Users,
    role: 'Managers',
    title: 'Visibility and control at scale',
    benefits: [
      'Team performance dashboards',
      'Deal pipeline forecasting',
      'Approval delegation rules',
      'Activity tracking and coaching',
      'Territory and quota management',
    ],
    color: 'bg-blue-500',
    bg: 'bg-blue-50',
    metric: '2.4x',
    metricLabel: 'pipeline visibility',
  },
  {
    icon: Calculator,
    role: 'Finance & Operations',
    title: 'Revenue precision and compliance',
    benefits: [
      'Automated revenue recognition',
      'Hybrid billing orchestration',
      'Multi-currency support',
      'Audit-ready compliance logs',
      'Real-time margin analysis',
    ],
    color: 'bg-secondary-400',
    bg: 'bg-secondary-50',
    metric: '99.7%',
    metricLabel: 'billing accuracy',
  },
  {
    icon: HeartHandshake,
    role: 'Customers',
    title: 'Transparent and fast experience',
    benefits: [
      'Self-service quote portal',
      'Real-time order tracking',
      'Digital contract signing',
      'Clear pricing breakdowns',
      'Direct communication channel',
    ],
    color: 'bg-danger-500',
    bg: 'bg-red-50',
    metric: '4.8/5',
    metricLabel: 'customer satisfaction',
  },
  {
    icon: Settings,
    role: 'Admins',
    title: 'Governance without bottlenecks',
    benefits: [
      'Configurable approval workflows',
      'Role-based access control',
      'Integration management',
      'System health monitoring',
      'Custom policy engine',
    ],
    color: 'bg-warning-500',
    bg: 'bg-amber-50',
    metric: '60%',
    metricLabel: 'less manual work',
  },
];

export default function Benefits() {
  return (
    <section id="benefits" className="py-24 lg:py-32 bg-slate-50 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm font-bold text-secondary-500 uppercase tracking-widest mb-4"
          >
            Role-Based Benefits
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-tight mb-6"
          >
            Built for every stakeholder
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg font-bold text-slate-500 leading-relaxed"
          >
            DealFlow360 delivers tailored experiences and value for every
            role in your revenue organization, from the front line to the back office.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {roles.map((role, idx) => {
            const Icon = role.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className={`card-tactile p-8 ${
                  idx === 4 ? 'md:col-span-2 lg:col-span-1' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-8">
                  <div className={`w-14 h-14 rounded-[18px] ${role.bg} flex items-center justify-center border-2 border-transparent hover:border-white shadow-sm transition-all`}>
                    <div className={`w-10 h-10 rounded-xl ${role.color} flex items-center justify-center shadow-sm`}>
                      <Icon size={20} className="text-white" />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-3xl font-black text-slate-800">{role.metric}</p>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">{role.metricLabel}</p>
                  </div>
                </div>

                <p className="text-xs font-bold text-brand-500 uppercase tracking-widest mb-2">
                  {role.role}
                </p>
                <h3 className="font-display text-xl font-black text-slate-900 mb-5">
                  {role.title}
                </h3>

                <ul className="space-y-3">
                  {role.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm font-bold text-slate-600">
                      <svg
                        className={`w-5 h-5 ${role.color.replace('bg-', 'text-')} shrink-0`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
