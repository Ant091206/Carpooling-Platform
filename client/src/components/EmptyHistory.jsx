import { Link } from 'react-router-dom';
import { CalendarRange, Plus, Search } from 'lucide-react';
import Button from './ui/Button.jsx';

export default function EmptyHistory({ tabName = 'completed' }) {
  const messages = {
    upcoming: {
      title: 'No upcoming commutes scheduled',
      desc: 'Looks like you do not have any bookings or rides lined up for the near future.',
      action: 'Find a Ride',
      link: '/find-ride',
      icon: Search
    },
    completed: {
      title: 'No completed rides in history',
      desc: 'Your ride archive is empty. Complete your first carpool to start building your ratings!',
      action: 'Publish a Ride',
      link: '/offer-ride',
      icon: Plus
    },
    cancelled: {
      title: 'No cancelled rides',
      desc: 'All clear! You do not have any cancelled rides or bookings in your records.',
      action: 'Go to Dashboard',
      link: '/dashboard',
      icon: CalendarRange
    }
  };

  const currentMsg = messages[tabName] || messages.completed;
  const Icon = currentMsg.icon;

  return (
    <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-slate-200 bg-slate-50/50 rounded-[2.5rem]">
      <div className="grid h-16 w-16 place-items-center rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-700 shadow-sm animate-bounce">
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="mt-5 font-heading text-2xl font-extrabold text-slate-900">{currentMsg.title}</h3>
      <p className="mt-2 text-slate-500 max-w-md font-medium text-sm leading-relaxed">
        {currentMsg.desc}
      </p>
      <Link to={currentMsg.link} className="mt-6">
        <Button icon={Plus}>{currentMsg.action}</Button>
      </Link>
    </div>
  );
}
