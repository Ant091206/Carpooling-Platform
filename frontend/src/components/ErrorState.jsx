import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
        <AlertCircle className="w-7 h-7 text-red-500" />
      </div>
      <h3 className="text-base font-semibold text-slate-900 mb-1">Failed to load data</h3>
      <p className="text-sm text-slate-500 max-w-xs mb-5">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Try Again
        </Button>
      )}
    </div>
  );
}
