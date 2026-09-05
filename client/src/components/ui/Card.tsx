import { type ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}

const paddingClasses = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function Card({ children, className = '', hover = false, padding = 'md' }: CardProps) {
  return (
    <div
      className={`bg-card border border-rule rounded-card shadow-card ${paddingClasses[padding]} ${hover ? 'hover:shadow-card-hover hover:border-border transition-all duration-200' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
