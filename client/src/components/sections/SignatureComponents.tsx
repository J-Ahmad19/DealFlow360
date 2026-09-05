import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import { motion } from 'framer-motion';
import { Badge } from '../ui/Badge';

const components = [
  {
    title: 'Quotation Builder',
    description: 'Dense but calm paper-like workspace with customer information, product cart, pricing, discounts, live margin, and risk summary.',
    preview: (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Product Cart</span>
          <Badge variant="accent">3 Items</Badge>
        </div>
        <div className="space-y-2">
          {['Enterprise License', 'Support Package', 'Implementation'].map((item, i) => (
            <div key={i} className="flex items-center justify-between py-1.5 border-b border-rule/50 last:border-0">
              <span className="text-xs text-ink">{item}</span>
              <span className="text-xs font-semibold text-ink tabular-nums">${
                ['2,400', '480', '15,000'][i]
              }</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    title: 'Approval Panel',
    description: 'Clear vertical approval chain showing Sales Manager → Finance, with visible reasons for escalation and an audit trail.',
    preview: (
      <div className="space-y-3">
        {[
          { role: 'Sales Rep', name: 'J. Martinez', status: 'approved', time: '2h ago' },
          { role: 'Sales Manager', name: 'R. Chen', status: 'approved', time: '1h ago' },
          { role: 'Finance', name: 'A. Patel', status: 'stalled', time: 'Pending' },
        ].map((step, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
              step.status === 'approved' ? 'bg-approved-bg text-approved' : 'bg-stalled-bg text-stalled'
            }`}>
              {step.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-ink truncate">{step.role}</div>
              <div className="text-[10px] text-ink-muted">{step.time}</div>
            </div>
            <Badge variant={step.status as 'approved' | 'stalled'} size="sm">
              {step.status === 'approved' ? '✓' : '⏳'}
            </Badge>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: 'Deal Risk Card',
    description: 'Compact metric panel showing risk score, discount deviation, margin impact, and approval requirement.',
    preview: (
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Risk Score', value: '62', color: 'text-stalled' },
          { label: 'Discount Dev.', value: '+4.2%', color: 'text-accent' },
          { label: 'Margin', value: '38.1%', color: 'text-approved' },
          { label: 'Approval', value: 'Required', color: 'text-accent' },
        ].map((metric, i) => (
          <div key={i} className="bg-cadence/50 rounded-control p-2.5">
            <div className="text-[10px] text-ink-muted uppercase tracking-wider">{metric.label}</div>
            <div className={`text-lg font-bold ${metric.color} tabular-nums`}>{metric.value}</div>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: 'Upsell Panel',
    description: 'Ranked recommendations with product name, promotion indicator, and immediate margin delta.',
    preview: (
      <div className="space-y-2">
        {[
          { name: 'Analytics Pro', promo: '15% off', delta: '+8.2%' },
          { name: 'API Access Tier', promo: null, delta: '+12.1%' },
          { name: 'Dedicated Support', promo: 'New', delta: '+5.7%' },
        ].map((item, i) => (
          <div key={i} className="flex items-center justify-between py-1.5 border-b border-rule/50 last:border-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-ink">{item.name}</span>
              {item.promo && (
                <Badge variant="accent" size="sm">{item.promo}</Badge>
              )}
            </div>
            <span className="text-xs font-bold text-approved tabular-nums">{item.delta}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: 'Warehouse Split',
    description: 'Recommended warehouse allocation, shipment count, and estimated cost with Accept and Override actions.',
    preview: (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-cadence/50 rounded-control p-2">
            <div className="text-[10px] text-ink-muted">Warehouse A</div>
            <div className="text-sm font-bold text-ink">32 units</div>
          </div>
          <div className="bg-cadence/50 rounded-control p-2">
            <div className="text-[10px] text-ink-muted">Warehouse B</div>
            <div className="text-sm font-bold text-ink">18 units</div>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="flex-1 text-[10px] font-medium bg-accent text-white rounded-control py-1.5 cursor-pointer">
            Accept Split
          </button>
          <button className="flex-1 text-[10px] font-medium bg-card border border-rule text-ink-secondary rounded-control py-1.5 cursor-pointer">
            Override
          </button>
        </div>
      </div>
    ),
  },
  {
    title: 'Deal Health Dashboard',
    description: 'Editorial KPI blocks and compact data modules for stalled deals, discount anomalies, delivery risks, and pipeline health.',
    preview: (
      <div className="space-y-2">
        {[
          { label: 'Stalled Deals', value: '7', trend: '+2', bad: true },
          { label: 'Discount Anomalies', value: '3', trend: '-1', bad: false },
          { label: 'Pipeline Value', value: '$2.4M', trend: '+12%', bad: false },
        ].map((kpi, i) => (
          <div key={i} className="flex items-center justify-between py-1.5 border-b border-rule/50 last:border-0">
            <span className="text-xs text-ink-muted">{kpi.label}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-ink tabular-nums">{kpi.value}</span>
              <span className={`text-[10px] font-medium ${kpi.bad ? 'text-rejected' : 'text-approved'}`}>
                {kpi.trend}
              </span>
            </div>
          </div>
        ))}
      </div>
    ),
  },
];

export function SignatureComponents() {
  const sectionRef = useScrollAnimation({ stagger: 0.06 });

  return (
    <section id="product" className="py-24 paper-grain">
      <div className="max-w-7xl mx-auto px-6 lg:px-8" ref={sectionRef}>
        {/* Section header */}
        <div className="text-center mb-16" data-animate>
          <span className="text-xs font-semibold text-accent uppercase tracking-widest">
            Signature Components
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-ink tracking-tight mt-3 mb-4">
            Built for Sales Intelligence
          </h2>
          <p className="text-lg text-ink-muted max-w-2xl mx-auto">
            Every component is designed as a precise instrument — information-dense,
            visually calm, and built for commercial decision-making.
          </p>
        </div>

        {/* Component grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {components.map((comp) => (
            <motion.div
              key={comp.title}
              data-animate
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-card border border-rule rounded-card shadow-card hover:shadow-card-hover transition-all duration-200 overflow-hidden group"
            >
              {/* Preview area */}
              <div className="p-5 bg-cadence/30 border-b border-rule">
                {comp.preview}
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="text-base font-bold text-ink mb-1.5 group-hover:text-accent transition-colors">
                  {comp.title}
                </h3>
                <p className="text-base text-ink-muted leading-relaxed">
                  {comp.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
