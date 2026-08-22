import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  glow?: boolean;
  strong?: boolean;
}

export function Card({ children, glow, strong, className = '', ...props }: CardProps) {
  const base = strong ? 'glass-strong' : 'glass';
  const glowCls = glow ? 'glow-teal' : '';
  return (
    <div className={`${base} rounded-2xl p-6 ${glowCls} ${className}`} {...props}>
      {children}
    </div>
  );
}
