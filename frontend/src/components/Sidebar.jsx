import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Search, PlusCircle, Map, Wallet, Car, Settings, LogOut, BookOpen } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const navigation = [
  { name: 'Dashboard',  href: '/dashboard',  icon: LayoutDashboard },
  { name: 'Find Ride',  href: '/find-ride',  icon: Search },
  { name: 'Offer Ride', href: '/offer-ride', icon: PlusCircle },
  { name: 'My Rides',   href: '/my-rides',   icon: Car },
  { name: 'My Trips',   href: '/trips',      icon: Map },
  { name: 'Wallet',     href: '/wallet',     icon: Wallet },
  { name: 'Vehicle',    href: '/vehicle',    icon: BookOpen },
  { name: 'Settings',   href: '/settings',   icon: Settings },
];

export function Sidebar() {
  return (
    <div className="hidden md:flex md:w-64 md:flex-col border-r border-slate-200 bg-white">
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-slate-200">
        <div className="flex items-center gap-2 text-primary-600">
          <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
            <span className="font-bold text-primary-600 text-xl">E</span>
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">Carpool</span>
        </div>
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto">
        <nav className="flex-1 space-y-1 px-4 py-4">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                twMerge(
                  clsx(
                    'group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors',
                    isActive
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  )
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={twMerge(
                      clsx(
                        'mr-3 h-5 w-5 flex-shrink-0 transition-colors',
                        isActive ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-500'
                      )
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 mt-auto border-t border-slate-200">
          <button className="group flex w-full items-center px-3 py-2.5 text-sm font-medium rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors">
            <LogOut className="mr-3 h-5 w-5 flex-shrink-0 text-slate-400 group-hover:text-red-500" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
