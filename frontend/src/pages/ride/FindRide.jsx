import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { MapPin, Calendar, Clock, Users, Search, Filter, X } from 'lucide-react';
import { Card } from '../../components/Card';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { StatusBadge } from '../../components/StatusBadge';
import { CardSkeleton } from '../../components/Skeleton';
import { ErrorState } from '../../components/ErrorState';
import { EmptyState } from '../../components/EmptyState';
import { carpoolAPI } from '../../services/api';

function RideCard({ ride, onSelect }) {
  const initials = ride.driver_name
    ? ride.driver_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'DR';

  const departureTime = ride.departure_time
    ? new Date(ride.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '--:--';
  const departureDate = ride.departure_time
    ? new Date(ride.departure_time).toLocaleDateString([], { month: 'short', day: 'numeric' })
    : '';

  return (
    <Card
      className="hover:border-primary-200 transition-all cursor-pointer group border border-slate-100"
      onClick={() => onSelect(ride)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center font-bold text-primary-700 text-sm flex-shrink-0">
            {initials}
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 text-sm group-hover:text-primary-600 transition-colors">
              {ride.driver_name || 'Driver'}
            </h4>
            <p className="text-xs text-slate-500">{ride.vehicle_model || 'Vehicle'}</p>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="font-bold text-lg text-slate-900">₹{ride.fare_per_seat}</div>
          <div className="text-xs text-slate-500">per seat</div>
        </div>
      </div>

      {/* Route */}
      <div className="space-y-2 relative before:absolute before:inset-y-3 before:left-2 before:w-0.5 before:bg-slate-200 mb-4">
        <div className="flex gap-3 items-start text-sm relative z-10">
          <div className="w-4 h-4 rounded-full bg-white border-4 border-slate-300 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-medium text-slate-900 leading-tight">{ride.pickup_name}</div>
            <div className="text-xs text-slate-400">{departureTime} · {departureDate}</div>
          </div>
        </div>
        <div className="flex gap-3 items-start text-sm relative z-10">
          <div className="w-4 h-4 rounded-full bg-white border-4 border-primary-500 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-medium text-slate-900 leading-tight">{ride.destination_name}</div>
            {ride.duration_min && (
              <div className="text-xs text-slate-400">~{Math.round(ride.duration_min)} min · {ride.distance_km} km</div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <div className="flex items-center gap-1.5 text-sm">
          <Users className="w-4 h-4 text-slate-400" />
          <span className={ride.available_seats > 0 ? 'text-green-600 font-medium' : 'text-red-500 font-medium'}>
            {ride.available_seats} seat{ride.available_seats !== 1 ? 's' : ''} left
          </span>
        </div>
        <StatusBadge status={ride.status} />
      </div>
    </Card>
  );
}

export function FindRide() {
  const navigate = useNavigate();
  const { register, handleSubmit, reset, watch } = useForm({
    defaultValues: { date: new Date().toISOString().split('T')[0], seats: 1 },
  });

  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const onSearch = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const params = {
        pickup: data.pickup,
        destination: data.destination,
        date: data.date,
        seats: data.seats || 1,
      };
      const res = await carpoolAPI.findRides(params);
      setRides(res.data?.data || res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to search rides.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSelectRide = (ride) => {
    navigate(`/rides/${ride.id}`);
  };

  const handleClear = () => {
    reset();
    setRides([]);
    setSearched(false);
    setError(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Find a Ride</h1>
          <p className="text-slate-500">Search available rides shared by your colleagues.</p>
        </div>
      </div>

      {/* Search Form */}
      <Card>
        <form onSubmit={handleSubmit(onSearch)}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none top-6">
                <MapPin className="h-4 w-4 text-slate-400" />
              </div>
              <Input
                label="Pickup Location"
                placeholder="e.g. Koramangala"
                className="pl-9"
                {...register('pickup', { required: true })}
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none top-6">
                <MapPin className="h-4 w-4 text-primary-500" />
              </div>
              <Input
                label="Destination"
                placeholder="e.g. Electronic City"
                className="pl-9"
                {...register('destination', { required: true })}
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none top-6">
                <Calendar className="h-4 w-4 text-slate-400" />
              </div>
              <Input
                label="Date"
                type="date"
                className="pl-9"
                {...register('date', { required: true })}
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none top-6">
                <Users className="h-4 w-4 text-slate-400" />
              </div>
              <Input
                label="Seats Needed"
                type="number"
                min={1}
                max={8}
                className="pl-9"
                {...register('seats', { min: 1 })}
              />
            </div>
          </div>
          <div className="flex gap-3 items-center">
            <Button type="submit" isLoading={loading} className="gap-2 flex-1 md:flex-none">
              <Search className="w-4 h-4" />
              Search Rides
            </Button>
            {searched && (
              <Button type="button" variant="ghost" size="sm" onClick={handleClear} className="gap-1.5 text-slate-500">
                <X className="w-4 h-4" />
                Clear
              </Button>
            )}
          </div>
        </form>
      </Card>

      {/* Results */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      )}

      {!loading && error && (
        <Card>
          <ErrorState message={error} onRetry={handleSubmit(onSearch)} />
        </Card>
      )}

      {!loading && !error && searched && rides.length === 0 && (
        <Card>
          <EmptyState
            icon={Search}
            title="No rides found"
            description="No rides match your search. Try different locations or a different date."
          />
        </Card>
      )}

      {!loading && !error && rides.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              <span className="font-semibold text-slate-900">{rides.length}</span> ride{rides.length !== 1 ? 's' : ''} found
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {rides.map((ride) => (
              <RideCard key={ride.id} ride={ride} onSelect={handleSelectRide} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
