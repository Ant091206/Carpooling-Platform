import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Calendar, Car, CreditCard, MapPin, UserRound } from 'lucide-react';
import PageShell from '../components/shared/PageShell.jsx';
import Card from '../components/ui/Card.jsx';
import Badge from '../components/ui/Badge.jsx';
import Button from '../components/ui/Button.jsx';
import { walletAPI } from '../services/api.js';

const money = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(v || 0));

export default function PaymentDetails() {
  const { id } = useParams();
  const [tx, setTx] = useState(null);
  useEffect(() => { walletAPI.getTransactionDetails(id).then(({ data }) => setTx(data.data)).catch((e) => toast.error(e?.response?.data?.message || 'Could not load payment details.')); }, [id]);
  if (!tx) return <PageShell title="Payment Details"><Card>Loading payment details...</Card></PageShell>;
  const ride = tx.ride || tx.booking?.ride || {};
  return <PageShell eyebrow="Wallet" title={`Transaction #${tx.id}`} description="Detailed payment reference, ride, booking, and wallet information." action={<Link to="/wallet/transactions"><Button variant="secondary" icon={ArrowLeft}>Back</Button></Link>}><div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]"><Card className="space-y-5"><div className="flex items-start justify-between"><div><p className="text-sm font-bold uppercase tracking-widest text-emerald-700">Amount</p><p className="mt-2 font-heading text-5xl font-extrabold text-slate-950">{money(tx.amount)}</p></div><Badge tone={tx.type === 'DEBIT' ? 'red' : tx.type === 'REFUND' ? 'blue' : 'green'}>{tx.status}</Badge></div><Detail icon={CreditCard} label="Type" value={tx.type} /><Detail icon={Calendar} label="Created" value={new Date(tx.createdAt).toLocaleString()} /><Detail icon={UserRound} label="Sender" value={tx.sender?.name || 'System'} /><Detail icon={UserRound} label="Receiver" value={tx.receiver?.name || 'System'} /></Card><Card className="space-y-5"><h2 className="font-heading text-2xl font-extrabold text-slate-950">Ride & Booking Reference</h2><Detail icon={MapPin} label="Route" value={`${ride.pickupName || 'Pickup'} to ${ride.destinationName || 'Destination'}`} /><Detail icon={Calendar} label="Departure" value={ride.departureTime ? new Date(ride.departureTime).toLocaleString() : 'Not linked'} /><Detail icon={Car} label="Ride status" value={ride.rideStatus || 'Not linked'} /><Detail icon={CreditCard} label="Booking" value={tx.booking ? `#${tx.booking.id} - ${tx.booking.status}` : 'Not linked'} /><div className="rounded-3xl bg-emerald-50 p-4 text-sm font-bold text-emerald-800">{tx.description || 'Wallet transaction processed successfully.'}</div></Card></div></PageShell>;
}
function Detail({ icon: Icon, label, value }) { return <div className="flex gap-3 rounded-2xl border border-emerald-100 p-4"><Icon className="mt-1 h-5 w-5 text-emerald-700" /><div><p className="text-xs font-bold uppercase text-slate-500">{label}</p><p className="mt-1 font-bold text-slate-950">{value}</p></div></div>; }
