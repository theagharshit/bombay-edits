import React, { forwardRef } from 'react';
import { cn } from '@/frontend/utils/formatters';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="block text-[11px] uppercase tracking-[0.14em] text-chocolate-brown mb-2 font-medium"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            'w-full bg-cream border border-beige-line px-4 py-3 text-[13px] text-dark-espresso placeholder:text-muted-taupe focus:outline-none focus:border-dark-espresso transition-colors rounded-none',
            error && 'border-red-500 focus:border-red-500',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-[11px] text-red-600">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
