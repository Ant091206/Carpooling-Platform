import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Car, Plus } from 'lucide-react';
import PageShell from '../components/shared/PageShell.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import Modal from '../components/ui/Modal.jsx';
import { vehicles as initialVehicles } from '../mock/carpoolData.js';

export default function MyVehicle() {
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const save = (data) => { setVehicles([...vehicles, { id: `veh-${Date.now()}`, ...data }]); setOpen(false); reset(); toast.success('Vehicle saved.'); };

  return <PageShell eyebrow="Garage" title="My Vehicle" description="Manage cars used for offering employee rides." action={<Button icon={Plus} onClick={() => setOpen(true)}>Add Vehicle</Button>}><div className="grid gap-5 md:grid-cols-2">{vehicles.map((vehicle) => <Card key={vehicle.id} hover className="space-y-4"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-100 text-emerald-700"><Car className="h-5 w-5" /></span><div><h3 className="font-heading text-2xl font-extrabold text-slate-950">{vehicle.model}</h3><p className="text-slate-600">{vehicle.reg} - {vehicle.seats} seats - {vehicle.fuel}</p></div><Button variant="secondary" onClick={() => { reset(vehicle); setOpen(true); }}>Edit Vehicle</Button></Card>)}</div><Modal open={open} onClose={() => setOpen(false)} title="Vehicle details"><form onSubmit={handleSubmit(save)} className="space-y-4"><Input label="Model" placeholder="Tata Nexon EV" error={errors.model?.message} {...register('model', { required: 'Model is required' })} /><Input label="Registration number" placeholder="KA 05 EV 2034" error={errors.reg?.message} {...register('reg', { required: 'Registration is required' })} /><Input label="Seating capacity" type="number" min="1" max="7" error={errors.seats?.message} {...register('seats', { required: 'Capacity is required' })} /><Input label="Fuel type" placeholder="Electric" {...register('fuel')} /><Button type="submit" className="w-full">Save Vehicle</Button></form></Modal></PageShell>;
}
