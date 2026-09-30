import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-xs';
    
    const variants = {
      primary: 'bg-amber-500 hover:bg-amber-600 text-white active:bg-amber-700 font-semibold',
      secondary: 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200/80',
      outline: 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900',
      ghost: 'bg-transparent text-gray-700 hover:bg-gray-100/80 hover:text-gray-900 shadow-none',
      danger: 'bg-red-600 hover:bg-red-700 text-white active:bg-red-800',
      success: 'bg-emerald-600 hover:bg-emerald-700 text-white active:bg-emerald-800',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 gap-1.5',
      md: 'text-sm px-4 py-2 gap-2',
      lg: 'text-base px-6 py-3 gap-2.5 font-semibold',
      icon: 'p-2 text-sm aspect-square',
    };

    return (
      <button
        ref={ref}
        suppressHydrationWarning
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-current" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
