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
    color: 'from-brand-500 to-brand-600',
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
    color: 'from-blue-500 to-blue-600',
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
    color: 'from-green-500 to-emerald-600',
    bg: 'bg-green-50',
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
    color: 'from-rose-500 to-pink-600',
    bg: 'bg-rose-50',
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
    color: 'from-purple-500 to-violet-600',
    bg: 'bg-purple-50',
    metric: '60%',
    metricLabel: 'less manual work',
  },
];

export default function Benefits() {
  return (
    <section id="benefits" className="py-24 lg:py-32 bg-white relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm font-semibold text-brand-600 uppercase tracking-wider mb-3"
          >
            Role-Based Benefits
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-950 leading-tight mb-5"
          >
            Built for every stakeholder
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-500 leading-relaxed"
          >
            DealFlow360 delivers tailored experiences and value for every
            role in your revenue organization, from the front line to the back office.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((role, idx) => {
            const Icon = role.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className={`group relative rounded-2xl p-7 clay hover:shadow-xl hover:shadow-slate-900/8 hover:-translate-y-1 transition-all duration-500 ${
                  idx === 4 ? 'md:col-span-2 lg:col-span-1' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-5">
                  <div className={`w-12 h-12 rounded-xl ${role.bg} flex items-center justify-center`}>
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${role.color} flex items-center justify-center`}>
                      <Icon size={20} className="text-white" />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-2xl font-bold text-slate-900">{role.metric}</p>
                    <p className="text-[11px] text-slate-400 font-medium">{role.metricLabel}</p>
                  </div>
                </div>

                <p className="text-xs font-semibold text-brand-600 uppercase tracking-wider mb-1">
                  {role.role}
                </p>
                <h3 className="font-display text-lg font-bold text-slate-900 mb-3">
                  {role.title}
                </h3>

                <ul className="space-y-2.5">
                  {role.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                      <svg
                        className="w-4 h-4 text-brand-500 mt-0.5 shrink-0"
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
