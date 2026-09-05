import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import { motion } from 'framer-motion';

const features = [
  {
    category: 'B2B Sales Platforms',
    items: [
      'End-to-end deal lifecycle management',
      'Multi-stage approval workflows',
      'Real-time margin and discount analysis',
    ],
  },
  {
    category: 'Enterprise CRM/ERP',
    items: [
      'Customer negotiation interfaces',
      'Hybrid billing for products + subscriptions',
      'Warehouse allocation and fulfillment',
    ],
  },
  {
    category: 'Revenue Operations',
    items: [
      'Deal health dashboards with KPI tracking',
      'Discount anomaly detection',
      'Pipeline risk scoring and alerts',
    ],
  },
  {
    category: 'Sales Intelligence',
    items: [
      'Upsell and cross-sell recommendations',
      'Audit trail for every decision',
      'Editorial-grade data visualization',
    ],
  },
];

const trustLogos = [
  'Accenture', 'Deloitte', 'McKinsey', 'Bain', 'BCG', 'Kearney',
];

export function Features() {
  const sectionRef = useScrollAnimation({ stagger: 0.08 });
  const logosRef = useScrollAnimation({ y: 20 });

  return (
    <section id="features" className="py-24 bg-cadence/40 paper-grain">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section header */}
        <div ref={sectionRef} className="text-center mb-16" data-animate>
          <span className="text-xs font-semibold text-accent uppercase tracking-widest">
            Best Suited For
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-ink tracking-tight mt-3 mb-4">
            Built for Commercial Intelligence
          </h2>
          <p className="text-lg text-ink-muted max-w-2xl mx-auto">
            DealFlow360 works where the product must communicate both
            commercial intelligence and operational trust.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-20" ref={sectionRef}>
          {features.map((feature, index) => (
            <motion.div
              key={feature.category}
              data-animate
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className="bg-card border border-rule rounded-card p-6 shadow-card hover:shadow-card-hover transition-all duration-200"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-card bg-accent-light border border-accent/10 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    {index === 0 && <><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></>}
                    {index === 1 && <><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></>}
                    {index === 2 && <><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></>}
                    {index === 3 && <><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></>}
                  </svg>
                </div>
                <h3 className="text-base font-bold text-ink">{feature.category}</h3>
              </div>
              <ul className="space-y-2.5">
                {feature.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                    <span className="text-base text-ink-secondary leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Trust bar */}
        <div ref={logosRef} className="text-center" data-animate>
          <p className="text-xs font-semibold text-ink-muted uppercase tracking-widest mb-8">
            Trusted by revenue operations teams at
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
            {trustLogos.map((logo) => (
              <span
                key={logo}
                className="text-lg font-bold text-ink-faint/60 tracking-tight hover:text-ink-muted transition-colors cursor-default"
              >
                {logo}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
