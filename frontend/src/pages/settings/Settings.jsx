import React from 'react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { User, Bell, Shield, HelpCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Settings() {
  const tabs = [
    { name: 'Profile', icon: User, current: true },
    { name: 'Notifications', icon: Bell, current: false },
    { name: 'Security', icon: Shield, current: false },
    { name: 'Help', icon: HelpCircle, current: false },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500">Manage your account preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64">
          <nav className="space-y-1">
            {tabs.map((item) => (
              <a
                key={item.name}
                href="#"
                className={twMerge(
                  clsx(
                    item.current
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                    'group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors'
                  )
                )}
              >
                <item.icon
                  className={twMerge(
                    clsx(
                      item.current ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-500',
                      'mr-3 h-5 w-5 flex-shrink-0'
                    )
                  )}
                />
                {item.name}
              </a>
            ))}
          </nav>
        </aside>

        <Card className="flex-1">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Profile Settings</h2>
          
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-2xl border-2 border-primary-200">
              JD
            </div>
            <div>
              <Button variant="outline" size="sm" className="mb-2">Change Avatar</Button>
              <p className="text-xs text-slate-500">JPG, GIF or PNG. Max size 2MB.</p>
            </div>
          </div>

          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="First Name" defaultValue="John" />
              <Input label="Last Name" defaultValue="Doe" />
            </div>
            <Input label="Email Address" type="email" defaultValue="john.doe@company.com" disabled />
            <Input label="Phone Number" type="tel" defaultValue="+1 (555) 123-4567" />
            
            <div className="pt-4 flex justify-end">
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
