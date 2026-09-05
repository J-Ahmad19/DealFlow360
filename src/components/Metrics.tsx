import { useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import gsap from 'gsap';

const metrics = [
  { value: '500+', label: 'Companies', description: 'Using DealFlow360' },
  { value: '$2.4B', label: 'Revenue Managed', description: 'Through the platform' },
  { value: '37%', label: 'Faster Closures', description: 'Average improvement' },
  { value: '99.9%', label: 'Uptime SLA', description: 'Enterprise-grade reliability' },
];

const logos = [
  'Acme Corp', 'TechVenture', 'GlobalTrade', 'InnovateCo', 'DataFlow',
  'CloudScale', 'RevenueFirst', 'DealMasters',
];

export default function Metrics() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  useEffect(() => {
    if (!isInView) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.metric-item',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power3.out',
          stagger: 0.1,
        }
      );
    }, ref);
    return () => ctx.revert();
  }, [isInView]);

  return (
    <section ref={ref} className="py-24 lg:py-32 bg-slate-50 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm font-semibold text-brand-600 uppercase tracking-wider mb-3"
          >
            Trusted by Industry Leaders
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-950 leading-tight"
          >
            Numbers that speak for themselves
          </motion.h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {metrics.map((metric, idx) => (
            <div
              key={idx}
              className="metric-item opacity-0 text-center rounded-2xl p-8 clay hover:shadow-lg transition-shadow duration-300"
            >
              <p className="font-display text-4xl lg:text-5xl font-extrabold gradient-text mb-2">
                {metric.value}
              </p>
              <p className="font-display text-sm font-bold text-slate-800 mb-1">
                {metric.label}
              </p>
              <p className="text-xs text-slate-400">{metric.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center mb-10">
          <p className="text-sm text-slate-400 font-medium">
            Powering sales operations at leading companies
          </p>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6">
          {logos.map((logo, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-center gap-2 text-slate-300 hover:text-slate-500 transition-colors duration-300"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-200/60 flex items-center justify-center">
                <span className="text-xs font-bold text-slate-400">
                  {logo.split(' ').map((w) => w[0]).join('')}
                </span>
              </div>
              <span className="font-display text-sm font-semibold tracking-tight">
                {logo}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
