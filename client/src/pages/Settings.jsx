import { ChevronRight, CreditCard, HelpCircle, History, MapPin, Settings as SettingsIcon, Shield, UserRound, Car } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageShell from '../components/shared/PageShell.jsx';
import Card from '../components/ui/Card.jsx';

const items = [
  ['My Trips', '/my-trips', UserRound], ['My Vehicle', '/my-vehicle', Car], ['Payment Methods', '/wallet', CreditCard], ['Ride History', '/ride-history', History], ['Saved Places', '/dashboard', MapPin], ['Help & Support', '/settings', HelpCircle],
];

export default function Settings() {
  return <PageShell eyebrow="Preferences" title="Settings" description="Quick access to account, ride, payment, and support sections."><Card className="divide-y divide-emerald-100 p-2">{items.map(([label, to, Icon]) => <Link key={label} to={to} className="flex items-center justify-between rounded-2xl px-4 py-4 hover:bg-emerald-50"><span className="flex items-center gap-3 font-bold text-slate-800"><span className="grid h-10 w-10 place-items-center rounded-full bg-emerald-100 text-emerald-700"><Icon className="h-4 w-4" /></span>{label}</span><ChevronRight className="h-5 w-5 text-slate-400" /></Link>)}</Card><Card className="flex items-center gap-4"><Shield className="h-8 w-8 text-emerald-700" /><div><h3 className="font-heading text-xl font-extrabold text-slate-950">Enterprise verified</h3><p className="text-slate-600">Employee-only access, masked contacts, and lifecycle status tracking.</p></div></Card></PageShell>;
}
