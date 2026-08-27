import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  glow?: boolean;
  strong?: boolean;
}

export function Card({ children, glow, strong, className = '', ...props }: CardProps) {
  const base = strong ? 'kelma-card-strong' : 'kelma-card';
  const glowCls = glow ? 'kelma-glow-teal' : '';
  return (
    <div className={`rounded-2xl p-6 ${base} ${glowCls} ${className}`} {...props}>
      {children}
    </div>
  );
}