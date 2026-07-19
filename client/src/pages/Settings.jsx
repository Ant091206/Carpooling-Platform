import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ChevronRight, CreditCard, HelpCircle, History, MapPin, Shield, UserRound, Car } from 'lucide-react';
import PageShell from '../components/shared/PageShell.jsx';
import Card from '../components/ui/Card.jsx';
import SavedPlacesManager from '../components/settings/SavedPlacesManager.jsx';
import HelpSupportView from '../components/settings/HelpSupportView.jsx';

export default function Settings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentView = searchParams.get('tab') || 'menu';

  const menuItems = [
    { label: 'My Trips', to: '/my-trips', icon: UserRound, type: 'link' },
    { label: 'My Vehicle', to: '/my-vehicle', icon: Car, type: 'link' },
    { label: 'Payment Methods', to: '/wallet', icon: CreditCard, type: 'link' },
    { label: 'Ride History', to: '/ride-history', icon: History, type: 'link' },
    { label: 'Saved Places', tab: 'saved-places', icon: MapPin, type: 'tab' },
    { label: 'Help & Support', tab: 'help-support', icon: HelpCircle, type: 'tab' },
  ];

  return (
    <PageShell 
      eyebrow="Preferences & Account" 
      title={currentView === 'saved-places' ? 'Saved Places' : currentView === 'help-support' ? 'Help & Support' : 'Settings'} 
      description="Manage your commute locations, preferences, payment options, and help desk."
      action={
        currentView !== 'menu' && (
          <button 
            onClick={() => setSearchParams({})} 
            className="text-xs font-bold text-emerald-700 hover:underline"
          >
            ← Back to Settings Menu
          </button>
        )
      }
    >
      {currentView === 'saved-places' && <SavedPlacesManager />}

      {currentView === 'help-support' && <HelpSupportView />}

      {currentView === 'menu' && (
        <div className="space-y-6">
          <Card className="divide-y divide-emerald-100 p-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              if (item.type === 'link') {
                return (
                  <Link 
                    key={item.label} 
                    to={item.to} 
                    className="flex items-center justify-between rounded-2xl px-4 py-4 hover:bg-emerald-50 transition"
                  >
                    <span className="flex items-center gap-3 font-bold text-slate-800">
                      <span className="grid h-10 w-10 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                        <Icon className="h-4 w-4" />
                      </span>
                      {item.label}
                    </span>
                    <ChevronRight className="h-5 w-5 text-slate-400" />
                  </Link>
                );
              }

              return (
                <button 
                  key={item.label}
                  onClick={() => setSearchParams({ tab: item.tab })}
                  className="w-full flex items-center justify-between rounded-2xl px-4 py-4 hover:bg-emerald-50 transition text-left"
                >
                  <span className="flex items-center gap-3 font-bold text-slate-800">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                      <Icon className="h-4 w-4" />
                    </span>
                    {item.label}
                  </span>
                  <ChevronRight className="h-5 w-5 text-slate-400" />
                </button>
              );
            })}
          </Card>

          <Card className="flex items-center gap-4 bg-white border border-slate-100 p-6">
            <Shield className="h-8 w-8 text-emerald-700 shrink-0" />
            <div>
              <h3 className="font-heading text-xl font-extrabold text-slate-950">Enterprise Verified Workspace</h3>
              <p className="text-xs text-slate-600">Employee-only access, masked contacts, and lifecycle status tracking.</p>
            </div>
          </Card>
        </div>
      )}
    </PageShell>
  );
}
