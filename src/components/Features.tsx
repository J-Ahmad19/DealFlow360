import { useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import gsap from 'gsap';
import {
  ShieldCheck,
  TrendingUp,
  Warehouse,
  CreditCard,
  MessageSquare,
  Activity,
} from 'lucide-react';

const features = [
  {
    icon: ShieldCheck,
    title: 'Smart Discount Governance',
    description:
      'AI-driven discount approval workflows with margin-aware guardrails. Auto-escalate exceptions and enforce pricing policies without slowing deals down.',
    color: 'bg-brand-500',
    bg: 'bg-brand-50',
    items: ['Approval chains', 'Margin thresholds', 'Policy enforcement', 'Audit trail'],
  },
  {
    icon: TrendingUp,
    title: 'Live Upsell & Cross-sell',
    description:
      'Surface the right add-ons and bundles at the perfect moment in the sales cycle. Boost average deal value with intelligent product recommendations.',
    color: 'bg-blue-500',
    bg: 'bg-blue-50',
    items: ['AI suggestions', 'Bundle engine', 'Revenue tracking', 'Conversion analytics'],
  },
  {
    icon: Warehouse,
    title: 'Multi-Warehouse Fulfillment',
    description:
      'Orchestrate order fulfillment across multiple warehouses with real-time inventory visibility, automated routing, and carrier selection.',
    color: 'bg-secondary-400',
    bg: 'bg-secondary-50',
    items: ['Real-time stock', 'Smart routing', 'Carrier selection', 'Batch processing'],
  },
  {
    icon: CreditCard,
    title: 'Hybrid Billing',
    description:
      'Support one-time, subscription, usage-based, and milestone billing models in a single invoice. Handle complex multi-line billing scenarios effortlessly.',
    color: 'bg-brand-400',
    bg: 'bg-brand-50',
    items: ['Mixed billing', 'Auto-invoicing', 'Revenue recognition', 'Tax compliance'],
  },
  {
    icon: MessageSquare,
    title: 'Customer Negotiation',
    description:
      'Built-in negotiation workspace with version control on quotes, side-by-side comparison, and real-time collaboration between sales and customers.',
    color: 'bg-danger-500',
    bg: 'bg-red-50',
    items: ['Version control', 'Live collaboration', 'Digital signatures', 'Counter-offers'],
  },
  {
    icon: Activity,
    title: 'Deal Health Monitoring',
    description:
      'Continuous deal health scoring with risk alerts, sentiment analysis, and proactive recommendations to keep every deal on track to close.',
    color: 'bg-warning-500',
    bg: 'bg-amber-50',
    items: ['Health scoring', 'Risk alerts', 'Sentiment analysis', 'Win probability'],
  },
];

export default function Features() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  useEffect(() => {
    if (!isInView) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.feature-card',
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: 'power3.out',
          stagger: 0.12,
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, [isInView]);

  return (
    <section id="features" ref={sectionRef} className="py-24 lg:py-32 bg-slate-50 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm font-bold text-brand-600 uppercase tracking-widest mb-4"
          >
            Platform Features
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-tight mb-6"
          >
            Everything you need to close smarter
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg font-bold text-slate-500 leading-relaxed"
          >
            DealFlow360 goes far beyond basic quote generation. Each module
            is purpose-built to eliminate friction, protect margins, and
            accelerate revenue.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="feature-card opacity-0 group card-tactile p-8 cursor-default"
              >
                <div className={`w-14 h-14 rounded-[18px] ${feature.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border-2 border-transparent group-hover:border-white group-hover:shadow-sm`}>
                  <div className={`w-10 h-10 rounded-xl ${feature.color} flex items-center justify-center shadow-sm`}>
                    <Icon size={20} className="text-white" />
                  </div>
                </div>

                <h3 className="font-display text-xl font-black text-slate-800 mb-3">
                  {feature.title}
                </h3>
                <p className="text-sm font-bold text-slate-500 leading-relaxed mb-6">
                  {feature.description}
                </p>

                <ul className="space-y-3">
                  {feature.items.map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm font-bold text-slate-600">
                      <div className={`w-2 h-2 rounded-full ${feature.color}`} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
