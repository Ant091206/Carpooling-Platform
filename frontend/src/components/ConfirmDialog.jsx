import React, { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';

export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Confirm', confirmVariant = 'danger', isLoading = false }) {
  if (!isOpen) return null;

  const confirmClasses = confirmVariant === 'danger'
    ? 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'
    : 'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 z-10">
        <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
        <p className="text-sm text-slate-500 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="inline-flex items-center justify-center rounded-lg border-2 border-slate-200 bg-transparent hover:bg-slate-50 text-slate-700 h-10 px-4 text-sm font-medium transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={twMerge(clsx(
              'inline-flex items-center justify-center rounded-lg h-10 px-4 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50',
              confirmClasses
            ))}
          >
            {isLoading ? (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : null}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
