import { Link } from 'react-router-dom';
import { CalendarDays, Car, Home, MapPin, Search, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import Card from '../components/ui/Card.jsx';
import Badge from '../components/ui/Badge.jsx';
import PageShell from '../components/shared/PageShell.jsx';
import { DriverIllustration, PassengerIllustration } from '../illustrations/CarpoolIllustrations.jsx';
import { savedPlaces, trips } from '../mock/carpoolData.js';

export default function Dashboard() {
  const { user } = useAuth();
  const upcoming = trips[0];

  return (
    <PageShell eyebrow="Home" title={`Good morning, ${user?.name || 'teammate'}`} description="Plan a greener commute, review upcoming rides, and keep your saved places close.">
      <div className="grid gap-6 lg:grid-cols-2">
        <Link to="/find-ride"><Card hover className="flex min-h-64 flex-col justify-between overflow-hidden bg-white"><div className="flex items-start justify-between"><div><span className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-100 text-emerald-700"><Search className="h-5 w-5" /></span><h2 className="mt-5 font-heading text-3xl font-extrabold text-slate-950">Find a Ride</h2><p className="mt-2 text-slate-600">Search verified employee rides for your office route.</p></div><div className="h-36 w-44"><PassengerIllustration /></div></div></Card></Link>
        <Link to="/offer-ride"><Card hover className="flex min-h-64 flex-col justify-between overflow-hidden bg-white"><div className="flex items-start justify-between"><div><span className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-100 text-emerald-700"><Car className="h-5 w-5" /></span><h2 className="mt-5 font-heading text-3xl font-extrabold text-slate-950">Offer a Ride</h2><p className="mt-2 text-slate-600">Publish seats, select a vehicle, and share commute costs.</p></div><div className="h-36 w-44"><DriverIllustration /></div></div></Card></Link>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card className="space-y-5"><div className="flex items-center justify-between"><h3 className="font-heading text-2xl font-extrabold text-slate-950">Upcoming Trip</h3><Badge>{upcoming.status}</Badge></div><div className="grid gap-4 rounded-3xl bg-[#EAF6EF] p-5 sm:grid-cols-3"><div><p className="text-xs font-bold uppercase text-emerald-700">Route</p><p className="mt-1 font-bold text-slate-900">{upcoming.route}</p></div><div><p className="text-xs font-bold uppercase text-emerald-700">Time</p><p className="mt-1 font-bold text-slate-900">{upcoming.date}, {upcoming.time}</p></div><div><p className="text-xs font-bold uppercase text-emerald-700">Fare</p><p className="mt-1 font-bold text-slate-900">INR {upcoming.fare}</p></div></div><Link to={`/trips/${upcoming.id}`} className="inline-flex font-bold text-emerald-700">View trip detail</Link></Card>
        <Card className="space-y-4"><h3 className="font-heading text-2xl font-extrabold text-slate-950">Saved Places</h3>{savedPlaces.map((place) => (<div key={place.id} className="flex gap-3 rounded-2xl border border-emerald-100 p-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-emerald-50 text-emerald-700">{place.name === 'Home' ? <Home className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}</span><div><p className="font-bold text-slate-900">{place.name}</p><p className="text-sm text-slate-600">{place.address}</p></div></div>))}</Card>
      </div>
      <div className="grid gap-4 sm:grid-cols-3"><Metric icon={CalendarDays} label="Trips this month" value="42" /><Metric icon={Users} label="Active poolers" value="186" /><Metric icon={MapPin} label="CO2 saved" value="128 kg" /></div>
    </PageShell>
  );
}

function Metric({ icon: Icon, label, value }) {
  return <Card className="flex items-center gap-4"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-100 text-emerald-700"><Icon className="h-5 w-5" /></span><div><p className="text-sm font-bold text-slate-500">{label}</p><p className="font-heading text-2xl font-extrabold text-slate-950">{value}</p></div></Card>;
}
