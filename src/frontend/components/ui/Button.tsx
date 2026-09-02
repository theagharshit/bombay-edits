import React from 'react';
import { cn } from '@/frontend/utils/formatters';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'gold' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-body uppercase tracking-[0.18em] transition-colors rounded-none focus:outline-none focus:ring-1 focus:ring-champagne-gold disabled:opacity-50 disabled:cursor-not-allowed';

  const sizeStyles = {
    sm: 'text-[10px] px-4 py-2',
    md: 'text-[11px] px-6 py-3',
    lg: 'text-[12px] px-8 py-4',
  };

  const variantStyles = {
    primary: 'bg-dark-espresso text-cream hover:bg-dark-espresso/90 border border-dark-espresso',
    secondary: 'bg-cream text-dark-espresso hover:bg-sand border border-beige-line',
    gold: 'bg-champagne-gold text-dark-espresso hover:bg-champagne-gold/90 font-medium',
    outline: 'border border-dark-espresso text-dark-espresso bg-transparent hover:bg-dark-espresso hover:text-cream',
    ghost: 'text-dark-espresso hover:bg-cream/60',
  };

  return (
    <button
      className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="inline-flex items-center gap-2">
          <svg className="animate-spin h-3.5 w-3.5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
};
