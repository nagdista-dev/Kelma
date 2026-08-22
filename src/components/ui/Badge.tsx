import type { ReactNode } from 'react';

type BadgeVariant = 'violet' | 'emerald' | 'amber' | 'red';

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

export function Badge({ variant = 'violet', children, className = '' }: BadgeProps) {
  return (
    <span className={`badge-${variant} ${className}`}>
      {children}
    </span>
  );
}
