import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Calendar, Car, Clock, MapPin, Users } from 'lucide-react';
import PageShell from '../components/shared/PageShell.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import Badge from '../components/ui/Badge.jsx';
import { vehicles } from '../mock/carpoolData.js';

export default function OfferRide() {
  const [confirm, setConfirm] = useState(null);
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: { vehicle: vehicles[0]?.id } });
  const onSubmit = (data) => setConfirm(data);

  return (
    <PageShell eyebrow="Driver mode" title="Offer a Ride" description="Publish your office route, select a registered vehicle, and invite colleagues to book seats.">
      <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
        <Card><form onSubmit={handleSubmit(onSubmit)} className="space-y-4"><Input icon={MapPin} label="Pickup" placeholder="HSR Layout" error={errors.pickup?.message} {...register('pickup', { required: 'Pickup is required' })} /><Input icon={MapPin} label="Destination" placeholder="Acme Tech Park" error={errors.destination?.message} {...register('destination', { required: 'Destination is required' })} /><div className="grid gap-4 sm:grid-cols-2"><Input icon={Calendar} label="Date" type="date" error={errors.date?.message} {...register('date', { required: 'Date is required' })} /><Input icon={Clock} label="Time" type="time" error={errors.time?.message} {...register('time', { required: 'Time is required' })} /></div><Input icon={Users} label="Available seats" type="number" min="1" max="4" error={errors.seats?.message} {...register('seats', { required: 'Available seats required' })} /><label className="block space-y-2"><span className="text-sm font-bold text-slate-700">Vehicle</span><select className="w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500" {...register('vehicle', { required: true })}>{vehicles.map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicle.model} - {vehicle.reg}</option>)}</select></label><Button type="submit" className="w-full" size="lg">Review Route</Button></form></Card>
        <Card className="space-y-5"><div className="flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-100 text-emerald-700"><Car className="h-5 w-5" /></span><div><h3 className="font-heading text-2xl font-extrabold text-slate-950">Route Confirmation</h3><p className="text-sm text-slate-600">Preview before publishing.</p></div></div>{confirm ? <div className="space-y-4"><Badge tone="blue">Ready to publish</Badge><p className="font-bold text-slate-900">{confirm.pickup} to {confirm.destination}</p><p className="text-slate-600">{confirm.date} at {confirm.time} - {confirm.seats} seats</p><Button onClick={() => toast.success('Ride published for employee bookings.')} className="w-full">Publish Ride</Button></div> : <div className="rounded-3xl border-2 border-dashed border-emerald-200 bg-[#EAF6EF] p-8 text-center text-slate-600">No vehicle? Add one from My Vehicle before publishing live rides.</div>}</Card>
      </div>
    </PageShell>
  );
}
