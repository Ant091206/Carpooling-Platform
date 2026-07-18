import React from 'react';
import { useForm } from 'react-hook-form';
import { Card } from '../../components/Card';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { Button } from '../../components/Button';
import { MapPin, Calendar, Clock, Users, Car, CheckCircle } from 'lucide-react';

export function OfferRide() {
  const { register, handleSubmit } = useForm();
  
  const onSubmit = (data) => {
    console.log(data);
    // Call API here
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Offer a Ride</h1>
        <p className="text-slate-500">Share your commute and help others reach the office.</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900 border-b border-slate-100 pb-2">Route Details</h3>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-slate-400" />
                </div>
                <Input
                  label="Pickup Location"
                  placeholder="e.g. Home"
                  className="pl-10"
                  {...register('pickup', { required: true })}
                />
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-primary-500" />
                </div>
                <Input
                  label="Destination"
                  placeholder="e.g. Office HQ"
                  className="pl-10"
                  {...register('destination', { required: true })}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pt-6 pointer-events-none">
                    <Calendar className="h-5 w-5 text-slate-400" />
                  </div>
                  <Input
                    label="Date"
                    type="date"
                    className="pl-10"
                    {...register('date', { required: true })}
                  />
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pt-6 pointer-events-none">
                    <Clock className="h-5 w-5 text-slate-400" />
                  </div>
                  <Input
                    label="Time"
                    type="time"
                    className="pl-10"
                    {...register('time')}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900 border-b border-slate-100 pb-2">Ride Settings</h3>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pt-6 pointer-events-none">
                  <Car className="h-5 w-5 text-slate-400" />
                </div>
                <Select label="Vehicle" className="pl-10" {...register('vehicle')}>
                  <option value="camry">Toyota Camry (Default)</option>
                  <option value="add">Add new vehicle...</option>
                </Select>
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pt-6 pointer-events-none">
                  <Users className="h-5 w-5 text-slate-400" />
                </div>
                <Select label="Available Seats" className="pl-10" {...register('seats')}>
                  <option value="1">1 Seat</option>
                  <option value="2">2 Seats</option>
                  <option value="3">3 Seats</option>
                  <option value="4">4 Seats</option>
                </Select>
              </div>

              <Input
                label="Fare per seat ($)"
                type="number"
                placeholder="0.00"
                {...register('fare')}
              />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
            <Button type="button" variant="ghost">Cancel</Button>
            <Button type="submit" className="gap-2">
              <CheckCircle className="w-4 h-4" /> Publish Ride
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
