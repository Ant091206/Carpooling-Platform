import PageShell from '../components/shared/PageShell.jsx';
import Card from '../components/ui/Card.jsx';
import Badge from '../components/ui/Badge.jsx';
import { history } from '../mock/carpoolData.js';

export default function RideHistory() {
  return <PageShell eyebrow="Archive" title="Ride History" description="Completed rides with route, date, distance, and settlement status."><div className="grid gap-4">{history.map((item) => <Card key={item.id} className="grid gap-3 md:grid-cols-[1fr_auto_auto]"><div><h3 className="font-heading text-xl font-extrabold text-slate-950">{item.route}</h3><p className="text-slate-600">{item.date} - {item.distance} km</p></div><Badge>{item.status}</Badge><p className="font-heading text-2xl font-extrabold text-emerald-700">INR {item.fare}</p></Card>)}</div></PageShell>;
}
