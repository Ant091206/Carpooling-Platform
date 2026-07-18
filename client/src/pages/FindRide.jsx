import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import PageShell from '../components/shared/PageShell.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import Badge from '../components/ui/Badge.jsx';
import { availableRides } from '../mock/carpoolData.js';

export default function FindRide() {
  const [step, setStep] = useState('form');
  const [query, setQuery] = useState(null);
  const { register, handleSubmit, formState: { errors } } = useForm();
  const submit = (data) => { setQuery(data); setStep('confirm'); toast.success('Route found. Confirm to view rides.'); };

  return (
    <PageShell eyebrow="Ride search" title="Find a Ride" description="Search by pickup, destination, time, and seats. Confirm the route before booking.">
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.2fr]">
        <Card>
          <form onSubmit={handleSubmit(submit)} className="space-y-4">
            <Input icon={MapPin} label="Pickup" placeholder="Indiranagar" error={errors.pickup?.message} {...register('pickup', { required: 'Pickup is required' })} />
            <Input icon={MapPin} label="Destination" placeholder="Acme Tech Park" error={errors.destination?.message} {...register('destination', { required: 'Destination is required' })} />
            <div className="grid gap-4 sm:grid-cols-2"><Input icon={Calendar} label="Date" type="date" error={errors.date?.message} {...register('date', { required: 'Date is required' })} /><Input icon={Clock} label="Time" type="time" error={errors.time?.message} {...register('time', { required: 'Time is required' })} /></div>
            <Input icon={Users} label="Seats" type="number" min="1" max="4" placeholder="1" error={errors.seats?.message} {...register('seats', { required: 'Seats required' })} />
            <Button type="submit" className="w-full" size="lg">Continue</Button>
          </form>
        </Card>
        <div className="space-y-6">
          {step === 'form' && <RoutePanel title="Route confirmation" text="Enter the ride details to preview your route, stops, and matching rides." />}
          {step === 'confirm' && <RoutePanel title={`${query.pickup} to ${query.destination}`} text={`Leaving ${query.date} at ${query.time} for ${query.seats} seat(s).`} action={<Button onClick={() => setStep('rides')}>Show Available Rides</Button>} />}
          {step === 'rides' && availableRides.map((ride) => <RideCard key={ride.id} ride={ride} />)}
        </div>
      </div>
    </PageShell>
  );
}

function RoutePanel({ title, text, action }) {
  return <Card className="space-y-5"><div className="h-48 rounded-[2rem] bg-[#EAF6EF] p-6"><div className="h-full rounded-[2rem] border-2 border-dashed border-emerald-300 bg-white/50 p-5"><div className="flex h-full flex-col justify-between"><MapPin className="h-8 w-8 text-emerald-700" /><div className="border-t-2 border-dashed border-emerald-400" /><MapPin className="h-8 w-8 self-end text-emerald-700" /></div></div></div><div><h3 className="font-heading text-2xl font-extrabold text-slate-950">{title}</h3><p className="mt-2 text-slate-600">{text}</p></div>{action}</Card>;
}

function RideCard({ ride }) {
  return <Card hover className="space-y-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-heading text-xl font-extrabold text-slate-950">{ride.driver}</h3><p className="text-sm text-slate-600">{ride.vehicle} - rating {ride.rating}</p></div><Badge>{ride.status}</Badge></div><div className="grid gap-3 sm:grid-cols-4"><Info label="Route" value={`${ride.from} to ${ride.to}`} /><Info label="Time" value={ride.time} /><Info label="Seats" value={ride.seats} /><Info label="Fare" value={`INR ${ride.fare}`} /></div><Button onClick={() => toast.success('Booking confirmed. Trip added to My Trips.')} className="w-full">Book Ride</Button></Card>;
}
function Info({ label, value }) { return <div><p className="text-xs font-bold uppercase text-emerald-700">{label}</p><p className="mt-1 font-bold text-slate-900">{value}</p></div>; }
