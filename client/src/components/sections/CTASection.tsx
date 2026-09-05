import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';

export function CTASection() {
  const sectionRef = useScrollAnimation();

  return (
    <section id="pricing" className="py-24 paper-grain">
      <div className="max-w-7xl mx-auto px-6 lg:px-8" ref={sectionRef}>
        <motion.div
          data-animate
          className="relative bg-card border border-rule rounded-feature shadow-elevated overflow-hidden"
        >
          {/* Background accent */}
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-accent/5 to-transparent pointer-events-none" />

          <div className="relative z-10 p-8 md:p-12 lg:p-16 text-center">
            <span className="text-xs font-semibold text-accent uppercase tracking-widest">
              Get Started
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-ink tracking-tight mt-4 mb-5">
              Ready to Transform Your{' '}
              <span className="text-accent">Sales Operations</span>?
            </h2>
            <p className="text-ink-muted max-w-2xl mx-auto mb-10 text-lg leading-relaxed">
              Start your 14-day free trial. No credit card required.
              Full access to every component, workflow, and dashboard.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Button variant="primary" size="lg">
                Start Free Trial
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Button>
              <Button variant="secondary" size="lg">
                Schedule a Demo
              </Button>
            </div>

            {/* Pricing tiers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
              {[
                {
                  tier: 'Starter',
                  price: '$49',
                  period: '/user/mo',
                  features: ['Up to 10 users', 'Basic quotation builder', 'Email support'],
                  popular: false,
                },
                {
                  tier: 'Professional',
                  price: '$99',
                  period: '/user/mo',
                  features: ['Unlimited users', 'Full workflow suite', 'Priority support', 'API access'],
                  popular: true,
                },
                {
                  tier: 'Enterprise',
                  price: 'Custom',
                  period: '',
                  features: ['Custom integrations', 'Dedicated CSM', 'SLA guarantee', 'On-premise option'],
                  popular: false,
                },
              ].map((plan) => (
                <div
                  key={plan.tier}
                  className={`relative bg-cadence/30 border rounded-card p-6 text-left transition-all duration-200 ${
                    plan.popular
                      ? 'border-accent shadow-card-hover'
                      : 'border-rule hover:border-border'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="text-[10px] font-bold text-white bg-accent px-3 py-1 rounded-full uppercase tracking-wider">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <div className="mb-4">
                    <h3 className="text-sm font-bold text-ink uppercase tracking-wider">{plan.tier}</h3>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-3xl font-bold text-ink">{plan.price}</span>
                      {plan.period && (
                        <span className="text-sm text-ink-muted">{plan.period}</span>
                      )}
                    </div>
                  </div>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-ink-secondary">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-approved)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={plan.popular ? 'primary' : 'secondary'}
                    size="sm"
                    className="w-full"
                  >
                    {plan.price === 'Custom' ? 'Contact Sales' : 'Get Started'}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
