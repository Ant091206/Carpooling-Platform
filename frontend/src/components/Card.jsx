import React from 'react';
import { twMerge } from 'tailwind-merge';

export function Card({ children, className, glass = false, ...props }) {
  return (
    <div 
      className={twMerge(
        'bg-white rounded-2xl p-6', 
        glass ? 'glass' : 'shadow-sm border border-slate-100',
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
}
