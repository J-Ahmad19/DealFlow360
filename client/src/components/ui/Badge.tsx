import { motion } from 'framer-motion';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'accent' | 'approved' | 'rejected' | 'stalled' | 'at-risk';
  size?: 'sm' | 'md';
}

const variantClasses = {
  default: 'bg-cadence text-ink-secondary border-rule',
  accent: 'bg-accent-light text-accent border-accent/20',
  approved: 'bg-approved-bg text-approved border-approved/20',
  rejected: 'bg-rejected-bg text-rejected border-rejected/20',
  stalled: 'bg-stalled-bg text-stalled border-stalled/20',
  'at-risk': 'bg-at-risk-bg text-at-risk border-at-risk/20',
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
};

export function Badge({ children, variant = 'default', size = 'sm' }: BadgeProps) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center font-medium rounded-control border ${variantClasses[variant]} ${sizeClasses[size]}`}
    >
      {children}
    </motion.span>
  );
}
