import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  ArrowLeft, MapPin, Clock, Users, Car, Star,
  Calendar, DollarSign, CheckCircle, AlertCircle, Repeat
} from 'lucide-react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { StatusBadge } from '../../components/StatusBadge';
import { CardSkeleton } from '../../components/Skeleton';
import { ErrorState } from '../../components/ErrorState';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { carpoolAPI } from '../../services/api';

function InfoRow({ icon: Icon, label, value, className }) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 rounded-lg bg-slate-50 flex-shrink-0">
        <Icon className="w-4 h-4 text-slate-500" />
      </div>
      <div>
        <p className="text-xs text-slate-500 leading-none mb-0.5">{label}</p>
        <p className={`text-sm font-medium text-slate-900 ${className || ''}`}>{value}</p>
      </div>
    </div>
  );
}

export function RideDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors } } = useForm({ defaultValues: { seats: 1 } });

  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingBooking, setPendingBooking] = useState(null);

  const fetchRide = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await carpoolAPI.getRideById(id);
      setRide(res.data?.data || res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load ride details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRide();
  }, [id]);

  const onBookSubmit = (data) => {
    if (!ride || ride.available_seats < data.seats) {
      toast.error(`Only ${ride?.available_seats || 0} seat(s) available.`);
      return;
    }
    setPendingBooking(data);
    setShowConfirm(true);
  };

  const confirmBooking = async () => {
    if (!pendingBooking) return;
    setBookingLoading(true);
    try {
      const res = await carpoolAPI.bookRide({
        rideId: parseInt(id, 10),
        requestedSeats: parseInt(pendingBooking.seats, 10),
      });
      toast.success('Ride booked successfully!');
      setShowConfirm(false);
      navigate('/trips');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed. Please try again.');
      // Refresh ride to get updated seat count
      fetchRide();
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto">
        <Button variant="ghost" size="sm" className="gap-2 mb-4" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <Card><ErrorState message={error} onRetry={fetchRide} /></Card>
      </div>
    );
  }

  if (!ride) return null;

  const departureTime = ride.departure_time
    ? new Date(ride.departure_time).toLocaleString([], {
        weekday: 'short', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : 'N/A';

  const seatsWatched = parseInt(watch('seats') || 1);
  const totalFare = (ride.fare_per_seat * seatsWatched).toFixed(2);
  const canBook = ride.status === 'Published' && ride.available_seats > 0;

  return (
    <>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Ride Details</h1>
            <p className="text-slate-500 text-sm">Review and book this ride.</p>
          </div>
        </div>

        {/* Status banner */}
        {ride.status !== 'Published' && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <p className="text-sm text-amber-700">
              This ride is currently <strong>{ride.status}</strong> and cannot be booked.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main ride info */}
          <div className="md:col-span-2 space-y-5">
            {/* Route Card */}
            <Card>
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-slate-900">Route</h2>
                <StatusBadge status={ride.status} />
              </div>
              <div className="space-y-3 relative before:absolute before:inset-y-4 before:left-2 before:w-0.5 before:bg-slate-200">
                <div className="flex gap-4 items-start relative z-10">
                  <div className="w-4 h-4 rounded-full bg-white border-4 border-slate-300 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-medium text-slate-900">{ride.pickup_name}</p>
                    <p className="text-sm text-slate-400">{departureTime}</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start relative z-10 mt-1">
                  <div className="w-4 h-4 rounded-full bg-white border-4 border-primary-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-medium text-slate-900">{ride.destination_name}</p>
                    {ride.distance_km && (
                      <p className="text-sm text-slate-400">~{ride.distance_km} km · ~{Math.round(ride.duration_min || 0)} min</p>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Driver & Vehicle */}
            <Card>
              <h2 className="font-semibold text-slate-900 mb-4">Driver & Vehicle</h2>
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg flex-shrink-0">
                  {(ride.driver_name || 'D').split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{ride.driver_name || 'Driver'}</p>
                  <p className="text-sm text-slate-500">{ride.driver_department || 'Employee'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <InfoRow icon={Car} label="Vehicle" value={ride.vehicle_model || 'N/A'} />
                <InfoRow icon={Users} label="Seats Available" value={`${ride.available_seats} of ${ride.total_seats || ride.available_seats}`} />
                {ride.is_recurring && (
                  <InfoRow icon={Repeat} label="Recurring" value="Daily ride" />
                )}
                {ride.notes && (
                  <div className="col-span-2">
                    <p className="text-xs text-slate-500 mb-1">Notes from driver</p>
                    <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">{ride.notes}</p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Booking Sidebar */}
          <div>
            <Card className="sticky top-6">
              <h2 className="font-semibold text-slate-900 mb-4">Book This Ride</h2>
              {canBook ? (
                <form onSubmit={handleSubmit(onBookSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Number of Seats
                    </label>
                    <select
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      {...register('seats', { required: true, min: 1, max: ride.available_seats })}
                    >
                      {Array.from({ length: Math.min(ride.available_seats, 8) }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>{n} seat{n !== 1 ? 's' : ''}</option>
                      ))}
                    </select>
                    {errors.seats && (
                      <p className="mt-1 text-sm text-red-500">Please select valid seats</p>
                    )}
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">₹{ride.fare_per_seat} × {seatsWatched} seat{seatsWatched !== 1 ? 's' : ''}</span>
                      <span className="font-medium text-slate-900">₹{totalFare}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 flex justify-between font-semibold">
                      <span className="text-slate-700">Total</span>
                      <span className="text-primary-600 text-lg">₹{totalFare}</span>
                    </div>
                  </div>

                  <Button type="submit" fullWidth className="gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Book Now
                  </Button>
                </form>
              ) : (
                <div className="text-center py-4">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                    <AlertCircle className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="text-sm text-slate-500">
                    {ride.status === 'Full' ? 'This ride is fully booked.' : 'This ride is not available for booking.'}
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmBooking}
        isLoading={bookingLoading}
        title="Confirm Booking"
        message={`Book ${pendingBooking?.seats || 1} seat(s) for ₹${totalFare}? This will reserve your spot on the ride.`}
        confirmLabel="Confirm Booking"
        confirmVariant="primary"
      />
    </>
  );
}
