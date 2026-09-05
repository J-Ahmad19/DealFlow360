import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { Button } from '../ui/Button';

export function Hero() {
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.3 });

    tl.fromTo(
      badgeRef.current,
      { y: 10, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }
    )
      .fromTo(
        headlineRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: 'power2.out' },
        '-=0.2'
      );
  }, []);

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden paper-grain">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(var(--color-ink) 1px, transparent 1px), linear-gradient(90deg, var(--color-ink) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }} />
        {/* Accent glow */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/6 w-64 h-64 bg-accent/3 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-24 pb-20">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div ref={badgeRef} className="inline-flex items-center gap-2 px-4 py-1.5 bg-card border border-rule rounded-full mb-8 shadow-card opacity-0">
            <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            <span className="text-xs font-medium text-ink-secondary tracking-wide uppercase">
              B2B Sales Operations Platform
            </span>
          </div>

          {/* Headline */}
          <h1
            ref={headlineRef}
            className="text-5xl md:text-6xl lg:text-7xl font-bold text-ink tracking-tight leading-[1.08] mb-6 opacity-0"
          >
            Your Sales Command{' '}
            <span className="relative inline-block">
              <span className="relative z-10 text-accent">Desk</span>
              <span className="absolute bottom-1 left-0 right-0 h-3 bg-accent/10 -rotate-1" />
            </span>
            <br />
            <span className="text-ink-secondary font-semibold">
              Printed on Warm Technical Paper
            </span>
          </h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="text-lg md:text-xl text-ink-muted max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Manage the entire deal lifecycle — from quotation to approval, fulfillment,
            billing, negotiation, and deal health — in one precise, information-dense
            sales instrument panel.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Button variant="primary" size="lg">
              Start Free Trial
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Button>
            <Button variant="secondary" size="lg">
              View Demo
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3, duration: 0.8 }}
            className="grid grid-cols-3 max-w-lg mx-auto gap-8"
          >
            {[
              { value: '2.4x', label: 'Faster Closures' },
              { value: '34%', label: 'Margin Lift' },
              { value: '99.9%', label: 'Uptime SLA' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-ink tracking-tight">
                  {stat.value}
                </div>
                <div className="text-xs text-ink-muted mt-1 font-medium uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Hero visual - Quotation preview card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.8, ease: 'easeOut' }}
          className="mt-20 max-w-5xl mx-auto"
        >
          <div className="bg-card border border-rule rounded-feature shadow-elevated overflow-hidden">
            {/* Title bar */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-rule bg-cadence/50">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rejected/60" />
                  <span className="w-3 h-3 rounded-full bg-stalled/60" />
                  <span className="w-3 h-3 rounded-full bg-approved/60" />
                </div>
                <span className="text-xs font-medium text-ink-muted">Q-2024-0847 — Acme Corp Enterprise Suite</span>
              </div>
              <span className="text-xs font-medium text-accent bg-accent-light px-2 py-0.5 rounded-control">
                In Review
              </span>
            </div>

            {/* Content grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-rule">
              {/* Left: Line items */}
              <div className="md:col-span-2 bg-card p-5">
                <div className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-3">
                  Line Items
                </div>
                <div className="space-y-2">
                  {[
                    { name: 'Enterprise License (Annual)', qty: 50, price: '$2,400', total: '$120,000' },
                    { name: 'Premium Support Package', qty: 50, price: '$480', total: '$24,000' },
                    { name: 'Implementation Services', qty: 1, price: '$15,000', total: '$15,000' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-rule/50 last:border-0">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-ink">{item.name}</div>
                        <div className="text-xs text-ink-muted">Qty: {item.qty} × {item.price}</div>
                      </div>
                      <div className="text-sm font-semibold text-ink tabular-nums">{item.total}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Summary */}
              <div className="bg-cadence/30 p-5">
                <div className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-3">
                  Deal Summary
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-ink-muted">Subtotal</span>
                    <span className="text-sm font-semibold text-ink tabular-nums">$159,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-ink-muted">Discount (12%)</span>
                    <span className="text-sm font-semibold text-accent tabular-nums">-$19,080</span>
                  </div>
                  <div className="h-px bg-rule" />
                  <div className="flex justify-between">
                    <span className="text-sm font-semibold text-ink">Total</span>
                    <span className="text-lg font-bold text-ink tabular-nums">$139,920</span>
                  </div>
                  <div className="h-px bg-rule" />
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-ink-muted">Margin</span>
                    <span className="text-sm font-bold text-approved tabular-nums">42.3%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-ink-muted">Risk Score</span>
                    <span className="text-sm font-bold text-stalled tabular-nums">Medium</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
