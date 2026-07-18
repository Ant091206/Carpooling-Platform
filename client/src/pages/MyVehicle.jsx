import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Car, Plus, Trash2, ShieldCheck, Fuel } from 'lucide-react';
import PageShell from '../components/shared/PageShell.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import Modal from '../components/ui/Modal.jsx';
import api from '../services/api.js';

const vehicleSchema = z.object({
  brand: z.string().min(1, 'Brand is required'),
  model: z.string().min(1, 'Model is required'),
  registration_number: z.string().min(1, 'Registration number is required'),
  fuel_type: z.enum(['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'], {
    errorMap: () => ({ message: 'Choose a valid fuel type' })
  }),
  seat_capacity: z.coerce.number().min(1, 'Minimum 1 seat').max(10, 'Maximum 10 seats')
});

export default function MyVehicle() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(vehicleSchema)
  });

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await api.get('/vehicle');
      setVehicles(response.data.data || []);
    } catch (err) {
      toast.error('Failed to load registered vehicles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const openAddModal = () => {
    setSelectedVehicle(null);
    reset({
      brand: '',
      model: '',
      registration_number: '',
      fuel_type: 'Electric',
      seat_capacity: 4
    });
    setOpen(true);
  };

  const openEditModal = (veh) => {
    setSelectedVehicle(veh);
    reset({
      brand: veh.brand || 'Tata',
      model: veh.model,
      registration_number: veh.plateNumber || veh.registration_number,
      fuel_type: veh.fuelType || 'Electric',
      seat_capacity: veh.capacity || veh.seat_capacity || 4
    });
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this vehicle?')) return;
    try {
      await api.delete(`/vehicle/${id}`);
      toast.success('Vehicle deleted successfully.');
      fetchVehicles();
    } catch (err) {
      toast.error('Failed to delete vehicle.');
    }
  };

  const handleSave = async (data) => {
    setSubmitting(true);
    // Align body attributes with backend validations
    const payload = {
      vehicle_name: `${data.brand} ${data.model}`,
      brand: data.brand,
      model: data.model,
      registration_number: data.registration_number,
      fuel_type: data.fuel_type,
      seat_capacity: parseInt(data.seat_capacity, 10),
      is_default: true
    };

    try {
      if (selectedVehicle) {
        await api.put(`/vehicle/${selectedVehicle.id}`, payload);
        toast.success('Vehicle updated successfully.');
      } else {
        await api.post('/vehicle', payload);
        toast.success('New vehicle registered successfully.');
      }
      setOpen(false);
      fetchVehicles();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register vehicle.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await api.patch(`/vehicle/default/${id}`);
      toast.success('Default vehicle updated.');
      fetchVehicles();
    } catch (err) {
      toast.error('Failed to set default vehicle.');
    }
  };

  return (
    <PageShell 
      eyebrow="Garage" 
      title="My Vehicle" 
      description="Manage cars used for offering employee rides." 
      action={<Button icon={Plus} onClick={openAddModal}>Add Vehicle</Button>}
    >
      {loading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-28 bg-slate-100 rounded-3xl" />
          <div className="h-28 bg-slate-100 rounded-3xl" />
        </div>
      ) : vehicles.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2">
          {vehicles.map((vehicle) => (
            <Card key={vehicle.id} className="p-5 bg-white border border-slate-100 hover:border-emerald-200 transition flex flex-col justify-between min-h-[220px]">
              <div>
                <div className="flex justify-between items-start">
                  <span className={`grid h-12 w-12 place-items-center rounded-2xl ${vehicle.isDefault ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    <Car className="h-5 w-5" />
                  </span>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => openEditModal(vehicle)}>Edit</Button>
                    <button 
                      onClick={() => handleDelete(vehicle.id)} 
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition border border-transparent hover:border-rose-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="font-heading text-2xl font-extrabold text-slate-950 truncate">
                    {vehicle.brand} {vehicle.model}
                  </h3>
                  <p className="text-slate-500 text-sm font-semibold mt-1">
                    Reg: {vehicle.plateNumber} &bull; Capacity: {vehicle.capacity} seats &bull; {vehicle.fuelType}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                {vehicle.isDefault ? (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                    <ShieldCheck className="h-3.5 w-3.5" /> Primary Commuter Vehicle
                  </span>
                ) : (
                  <button 
                    onClick={() => handleSetDefault(vehicle.id)} 
                    className="text-xs font-bold text-slate-500 hover:text-emerald-700 transition"
                  >
                    Set as Primary
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-[2.5rem] border-2 border-dashed border-slate-200 bg-slate-50/50 p-16 text-center">
          <Car className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <p className="font-bold text-slate-600 text-lg">No vehicles registered</p>
          <p className="text-sm text-slate-400 mt-1">Register a vehicle to start offering rides and sharing costs.</p>
          <Button className="mt-6" onClick={openAddModal} icon={Plus}>Add Vehicle</Button>
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={selectedVehicle ? 'Edit Vehicle' : 'Add Vehicle'}>
        <form onSubmit={handleSubmit(handleSave)} className="space-y-4 pt-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input 
              label="Brand/Make" 
              placeholder="Tata" 
              error={errors.brand?.message} 
              {...register('brand')} 
            />
            <Input 
              label="Model" 
              placeholder="Nexon EV" 
              error={errors.model?.message} 
              {...register('model')} 
            />
          </div>
          
          <Input 
            label="Registration plate number" 
            placeholder="KA 05 EV 2034" 
            error={errors.registration_number?.message} 
            {...register('registration_number')} 
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-800">Fuel type</label>
              <select 
                className="w-full rounded-2xl border border-slate-200 bg-white p-3.5 text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none"
                {...register('fuel_type')}
              >
                <option value="Electric">Electric</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="CNG">CNG</option>
              </select>
            </div>

            <Input 
              label="Seating capacity" 
              type="number" 
              min="1" 
              max="10" 
              error={errors.seat_capacity?.message} 
              {...register('seat_capacity')} 
            />
          </div>

          <Button type="submit" loading={submitting} className="w-full mt-4" size="lg">Save Vehicle</Button>
        </form>
      </Modal>
    </PageShell>
  );
}
