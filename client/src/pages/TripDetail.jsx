import { Link, useParams } from 'react-router-dom';
import { MessageCircle, Phone, ShieldCheck } from 'lucide-react';
import PageShell from '../components/shared/PageShell.jsx';
import Card from '../components/ui/Card.jsx';
import Badge from '../components/ui/Badge.jsx';
import Button from '../components/ui/Button.jsx';
import { trips } from '../mock/carpoolData.js';

export default function TripDetail() {
  const { tripId } = useParams();
  const trip = trips.find((item) => item.id === tripId) || trips[0];
  const steps = ['Booked', 'Started', 'In Progress', 'Payment Pending', 'Completed'];
  return <PageShell eyebrow="Trip detail" title={trip.route} description={`${trip.date} at ${trip.time}`} action={<Link to="/my-trips" className="font-bold text-emerald-700">Back to trips</Link>}><div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]"><Card className="space-y-5"><div className="h-72 rounded-[2rem] bg-[#EAF6EF] p-5"><div className="flex h-full flex-col justify-between rounded-[2rem] border-2 border-dashed border-emerald-300 bg-white/50 p-6"><span className="font-bold text-emerald-700">Live map placeholder</span><div className="border-t-2 border-dashed border-emerald-500" /><span className="self-end font-bold text-emerald-700">ETA 24 min</span></div></div><div className="grid gap-4 sm:grid-cols-2"><Info title="Driver" value={trip.driver} /><Info title="Passenger" value={trip.passenger} /><Info title="Vehicle" value={trip.vehicle} /><Info title="Registration" value={trip.reg} /></div></Card><Card className="space-y-6"><div className="flex items-center justify-between"><Badge>{trip.status}</Badge><div className="flex gap-2"><Button variant="secondary" icon={MessageCircle}>Chat</Button><Button variant="secondary" icon={Phone}>Call</Button></div></div><div className="space-y-4">{steps.map((step, index) => <div key={step} className="flex gap-3"><span className={`mt-1 h-4 w-4 rounded-full ${steps.indexOf(trip.status) >= index ? 'bg-emerald-600' : 'bg-emerald-100'}`} /><div><p className="font-bold text-slate-900">{step}</p><p className="text-sm text-slate-600">{index === 0 ? 'Ride seat reserved.' : 'Status updates appear here.'}</p></div></div>)}</div><div className="rounded-3xl bg-emerald-50 p-4 text-sm font-bold text-emerald-800"><ShieldCheck className="mr-2 inline h-4 w-4" />Employee verified trip with masked contact actions.</div></Card></div></PageShell>;
}
function Info({ title, value }) { return <div className="rounded-2xl border border-emerald-100 p-4"><p className="text-xs font-bold uppercase text-emerald-700">{title}</p><p className="mt-1 font-bold text-slate-950">{value}</p></div>; }
