import { Link } from 'react-router-dom';
import PageShell from '../components/shared/PageShell.jsx';
import Card from '../components/ui/Card.jsx';
import Badge from '../components/ui/Badge.jsx';
import { trips } from '../mock/carpoolData.js';

const tone = { Booked: 'blue', Started: 'amber', 'In Progress': 'amber', Completed: 'green', 'Payment Pending': 'red' };

export default function MyTrips() {
  return <PageShell eyebrow="Trips" title="My Trips" description="Track booked, active, completed, and payment-pending carpool trips."><div className="grid gap-5">{trips.map((trip) => <Link key={trip.id} to={`/trips/${trip.id}`}><Card hover className="grid gap-4 md:grid-cols-[1fr_auto]"><div><div className="flex flex-wrap items-center gap-3"><h3 className="font-heading text-xl font-extrabold text-slate-950">{trip.route}</h3><Badge tone={tone[trip.status] || 'slate'}>{trip.status}</Badge></div><p className="mt-2 text-slate-600">{trip.role} - {trip.date}, {trip.time} - {trip.vehicle}</p></div><p className="font-heading text-2xl font-extrabold text-emerald-700">INR {trip.fare}</p></Card></Link>)}</div></PageShell>;
}
