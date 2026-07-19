import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { EmptyState } from '../../components/EmptyState';
import { CardSkeleton } from '../../components/Skeleton';
import { PlusCircle, Car, RefreshCw, Star, Trash2 } from 'lucide-react';
import { carpoolAPI } from '../../services/api';

export function Vehicle() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      vehicle_name: '',
      brand: '',
      model: '',
      registration_number: '',
      fuel_type: 'Petrol',
      seat_capacity: 4,
    },
  });

  const fetchVehicles = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await carpoolAPI.getVehicles();
      setVehicles(res.data?.data || res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load vehicles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleSetDefault = async (id) => {
    setActionLoading(true);
    try {
      await carpoolAPI.setDefaultVehicle(id);
      toast.success('Default vehicle updated');
      fetchVehicles();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not set default vehicle.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemove = async (id) => {
    setActionLoading(true);
    try {
      await carpoolAPI.deleteVehicle(id);
      toast.success('Vehicle removed');
      fetchVehicles();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete vehicle.');
    } finally {
      setActionLoading(false);
    }
  };

  const onAddVehicle = async (data) => {
    setActionLoading(true);
    try {
      await carpoolAPI.addVehicle({
        vehicle_name: data.vehicle_name,
        brand: data.brand,
        model: data.model,
        registration_number: data.registration_number,
        fuel_type: data.fuel_type,
        seat_capacity: Number(data.seat_capacity),
      });
      toast.success('Vehicle added successfully');
      reset();
      fetchVehicles();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add vehicle.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Vehicles</h1>
          <p className="text-slate-500">Manage vehicles you use for carpooling.</p>
        </div>
        <Button className="gap-2" onClick={() => navigate('/offer-ride')}>
          <PlusCircle className="w-4 h-4" /> Add Ride
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, idx) => (
            <CardSkeleton key={idx} />
          ))}
        </div>
      ) : error ? (
        <Card>
          <EmptyState
            icon={Car}
            title="Unable to load vehicles"
            description={error}
          />
        </Card>
      ) : vehicles.length === 0 ? (
        <Card>
          <EmptyState
            icon={Car}
            title="No vehicles found"
            description="Add your first vehicle so you can publish rides and share your commute."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {vehicles.map((vehicle) => (
            <Card key={vehicle.id} className="border border-slate-200">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                  <Car className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900">{vehicle.vehicle_name}</h3>
                  <p className="text-sm text-slate-500">{vehicle.brand} • {vehicle.model}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm border-y border-slate-100 py-3">
                <div>
                  <span className="block text-slate-500">Registration</span>
                  <span className="font-medium text-slate-900">{vehicle.registration_number}</span>
                </div>
                <div>
                  <span className="block text-slate-500">Seats</span>
                  <span className="font-medium text-slate-900">{vehicle.seat_capacity}</span>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3">
                <Button
                  size="sm"
                  variant={vehicle.is_default ? 'primary' : 'outline'}
                  className="flex-1"
                  onClick={() => handleSetDefault(vehicle.id)}
                  disabled={vehicle.is_default || actionLoading}
                >
                  <Star className="w-4 h-4" />
                  {vehicle.is_default ? 'Default' : 'Set Default'}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => handleRemove(vehicle.id)}
                  disabled={actionLoading}
                >
                  <Trash2 className="w-4 h-4" />
                  Remove
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Add New Vehicle</h2>
            <p className="text-sm text-slate-500">Register a vehicle for sharing with colleagues.</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchVehicles} className="gap-2">
            <RefreshCw className="w-4 h-4" /> Refresh
          </Button>
        </div>

        <form className="grid grid-cols-1 lg:grid-cols-2 gap-6" onSubmit={handleSubmit(onAddVehicle)}>
          <Input
            label="Vehicle Name"
            placeholder="Toyota Camry"
            error={errors.vehicle_name?.message}
            {...register('vehicle_name', { required: 'Vehicle name is required' })}
          />
          <Input
            label="Brand"
            placeholder="Toyota"
            error={errors.brand?.message}
            {...register('brand', { required: 'Brand is required' })}
          />
          <Input
            label="Model"
            placeholder="Camry"
            error={errors.model?.message}
            {...register('model', { required: 'Model is required' })}
          />
          <Input
            label="Registration Number"
            placeholder="ABC-1234"
            error={errors.registration_number?.message}
            {...register('registration_number', { required: 'Registration number is required' })}
          />
          <Select
            label="Fuel Type"
            error={errors.fuel_type?.message}
            {...register('fuel_type', { required: 'Fuel type is required' })}
          >
            <option value="Petrol">Petrol</option>
            <option value="Diesel">Diesel</option>
            <option value="CNG">CNG</option>
            <option value="Electric">Electric</option>
            <option value="Hybrid">Hybrid</option>
          </Select>
          <Input
            label="Seat Capacity"
            type="number"
            placeholder="4"
            error={errors.seat_capacity?.message}
            {...register('seat_capacity', {
              required: 'Seat capacity is required',
              valueAsNumber: true,
              min: { value: 1, message: 'Seat capacity must be at least 1' },
              max: { value: 10, message: 'Seat capacity cannot exceed 10' },
            })}
          />

          <div className="lg:col-span-2 flex justify-end">
            <Button type="submit" isLoading={isSubmitting || actionLoading}>
              Add Vehicle
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
