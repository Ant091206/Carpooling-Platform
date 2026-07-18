import React, { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

export const Select = forwardRef(({ label, error, className, id, children, ...props }, ref) => {
  const selectId = id || Math.random().toString(36).substring(7);
  
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-slate-700 mb-1.5">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        className={twMerge(
          'w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all',
          error && 'border-red-300 focus:ring-red-500',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p className="mt-1.5 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';
