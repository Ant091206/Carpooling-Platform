import React from 'react';
import { Bell, Menu } from 'lucide-react';

export function Navbar() {
  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0">
      <div className="flex items-center md:hidden">
        <button type="button" className="text-slate-500 hover:text-slate-600">
          <span className="sr-only">Open sidebar</span>
          <Menu className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>
      <div className="flex-1 px-4 flex justify-end">
        <div className="ml-4 flex items-center md:ml-6 gap-4">
          <button className="bg-white p-1 rounded-full text-slate-400 hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 relative">
            <span className="sr-only">View notifications</span>
            <Bell className="h-6 w-6" aria-hidden="true" />
            <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
          </button>

          <div className="relative">
            <button className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
              <span className="sr-only">Open user menu</span>
              <div className="h-8 w-8 rounded-full bg-primary-100 border border-primary-200 flex items-center justify-center text-primary-700 font-medium">
                JD
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
