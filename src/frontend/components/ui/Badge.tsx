import React from 'react';
import { cn } from '@/frontend/utils/formatters';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'new' | 'bestseller' | 'gold' | 'muted';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = 'new',
  ...props
}) => {
  const baseStyles = 'inline-block text-[9px] uppercase tracking-[0.18em] px-2 py-1 font-medium select-none';

  const variantStyles = {
    new: 'bg-cream text-dark-espresso border border-beige-line',
    bestseller: 'bg-dark-espresso text-cream',
    gold: 'bg-champagne-gold text-dark-espresso',
    muted: 'bg-sand text-chocolate-brown border border-beige-line',
  };

  return (
    <span className={cn(baseStyles, variantStyles[variant], className)} {...props}>
      {children}
    </span>
  );
};
