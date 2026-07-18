import React from 'react';
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';

const statusConfig = {
  // Ride statuses
  Published:   { label: 'Published',   classes: 'bg-green-50 text-green-700 ring-green-600/20' },
  Full:        { label: 'Full',         classes: 'bg-slate-100 text-slate-600 ring-slate-500/20' },
  Cancelled:   { label: 'Cancelled',   classes: 'bg-red-50 text-red-700 ring-red-600/20' },
  Completed:   { label: 'Completed',   classes: 'bg-green-50 text-green-700 ring-green-600/20' },
  // Booking statuses
  Requested:   { label: 'Requested',   classes: 'bg-amber-50 text-amber-700 ring-amber-600/20' },
  Accepted:    { label: 'Accepted',    classes: 'bg-blue-50 text-blue-700 ring-blue-600/20' },
  Rejected:    { label: 'Rejected',    classes: 'bg-red-50 text-red-700 ring-red-600/20' },
  // Trip statuses
  Booked:      { label: 'Booked',      classes: 'bg-amber-50 text-amber-700 ring-amber-600/20' },
  Started:     { label: 'Started',     classes: 'bg-orange-50 text-orange-700 ring-orange-600/20' },
  InProgress:  { label: 'In Progress', classes: 'bg-blue-50 text-blue-700 ring-blue-600/20' },
  // Payment
  Pending:     { label: 'Pending',     classes: 'bg-amber-50 text-amber-700 ring-amber-600/20' },
  Failed:      { label: 'Failed',      classes: 'bg-red-50 text-red-700 ring-red-600/20' },
};

export function StatusBadge({ status, className }) {
  const config = statusConfig[status] || { label: status, classes: 'bg-slate-100 text-slate-600 ring-slate-500/20' };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset',
          config.classes,
          className
        )
      )}
    >
      {config.label}
    </span>
  );
}
