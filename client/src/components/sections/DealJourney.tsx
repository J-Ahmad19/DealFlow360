import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import { motion } from 'framer-motion';

const steps = [
  {
    number: '01',
    title: 'Quotation',
    description: 'Build precise quotations with live pricing, product lines, and customer context.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'Discount Analysis',
    description: 'Real-time discount impact on margins with deviation tracking and approval triggers.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Approval',
    description: 'Clear approval chains with visible escalation reasons and full audit trails.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
  {
    number: '04',
    title: 'Fulfillment',
    description: 'Warehouse allocation, shipment tracking, and split-order optimization.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" />
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
  },
  {
    number: '05',
    title: 'Billing',
    description: 'Hybrid billing for one-time products and recurring subscriptions in one order.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  },
  {
    number: '06',
    title: 'Negotiation',
    description: 'Customer-facing view for reviewing, commenting, countering, and confirming terms.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    number: '07',
    title: 'Deal Health',
    description: 'KPI blocks for stalled deals, discount anomalies, delivery risks, and pipeline health.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
];

export function DealJourney() {
  const sectionRef = useScrollAnimation({ stagger: 0.08 });

  return (
    <section id="workflow" className="py-24 bg-cadence/40 paper-grain">
      <div className="max-w-7xl mx-auto px-6 lg:px-8" ref={sectionRef}>
        {/* Section header */}
        <div className="text-center mb-16" data-animate>
          <span className="text-xs font-semibold text-accent uppercase tracking-widest">
            End-to-End Workflow
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-ink tracking-tight mt-3 mb-4">
            The Complete Deal Journey
          </h2>
          <p className="text-lg text-ink-muted max-w-2xl mx-auto">
            From initial quotation to confirmed deal health, every stage is designed
            as a precise instrument in your sales operations workflow.
          </p>
        </div>

        {/* Journey timeline */}
        <div className="relative">
          {/* Connection line */}
          <div className="absolute top-12 left-0 right-0 h-px bg-rule hidden lg:block" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4 lg:gap-3">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                data-animate
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="relative bg-card border border-rule rounded-card p-5 shadow-card hover:shadow-card-hover transition-shadow group"
              >
                {/* Step number */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-accent-light border border-accent/20 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-colors duration-200">
                    {step.icon}
                  </div>
                  <span className="text-xs font-bold text-ink-faint tracking-wider">
                    {step.number}
                  </span>
                </div>

                <h3 className="text-base font-bold text-ink mb-1.5">{step.title}</h3>
                <p className="text-base text-ink-muted leading-relaxed">{step.description}</p>

                {/* Connector arrow (hidden on mobile) */}
                {index < steps.length - 1 && (
                  <div className="absolute -right-3 top-12 text-rule hidden lg:block z-10">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                      <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" fill="none" />
                    </svg>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
