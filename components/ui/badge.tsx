import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'danger' | 'warning' | 'info' | 'secondary' | 'outline';
}

export function Badge({ className, variant = 'secondary', children, ...props }: BadgeProps) {
  const variants = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    danger: 'bg-red-50 text-red-700 border-red-200/80',
    warning: 'bg-amber-50 text-amber-700 border-amber-200/80',
    info: 'bg-blue-50 text-blue-700 border-blue-200/80',
    secondary: 'bg-gray-100 text-gray-700 border-gray-200/60',
    outline: 'bg-transparent text-gray-600 border-gray-200',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
