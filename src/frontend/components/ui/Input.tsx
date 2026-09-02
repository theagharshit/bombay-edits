import React, { forwardRef } from 'react';
import { cn } from '@/frontend/utils/formatters';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor={id}
              className="block text-[11px] uppercase tracking-[0.16em] text-chocolate-brown font-medium"
            >
              {label}
            </label>
            {hint && <span className="text-[10px] text-muted-taupe tracking-wider">{hint}</span>}
          </div>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            'w-full bg-cream border border-beige-line px-4.5 py-3.5 text-[13px] text-dark-espresso placeholder:text-muted-taupe/80 focus:outline-none focus:border-dark-espresso focus:ring-1 focus:ring-dark-espresso/20 transition-all duration-200 rounded-none shadow-2xs',
            error && 'border-red-600 focus:border-red-600 focus:ring-red-500/20',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-[11px] text-red-600 font-medium">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
