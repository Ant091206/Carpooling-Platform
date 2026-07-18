import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowLeft, MapPin, Clock, Car, Users, CheckCircle,
  Circle, X, AlertCircle, Navigation, Phone, MessageSquare
} from 'lucide-react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { StatusBadge } from '../../components/StatusBadge';
import { CardSkeleton } from '../../components/Skeleton';
import { ErrorState } from '../../components/ErrorState';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { carpoolAPI } from '../../services/api';

const TIMELINE_STEPS = [
  { key: 'Booked',     label: 'Booking Confirmed', icon: CheckCircle },
  { key: 'Started',    label: 'Trip Started',       icon: Navigation },
  { key: 'InProgress', label: 'In Progress',        icon: Navigation },
  { key: 'Completed',  label: 'Completed',          icon: CheckCircle },
];

const STATUS_ORDER = ['Booked', 'Started', 'InProgress', 'Completed'];

function TripTimeline({ tripStatus }) {
  const currentIdx = STATUS_ORDER.indexOf(tripStatus);

  return (
    <div className="space-y-0">
      {TIMELINE_STEPS.map((step, idx) => {
        const isDone = idx <= currentIdx;
        const isCurrent = idx === currentIdx;

        return (
          <div key={step.key} className="flex items-start gap-4">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-colors ${
                isDone
                  ? 'bg-primary-600 border-primary-600 text-white'
                  : 'bg-white border-slate-200 text-slate-300'
              }`}>
                <step.icon className="w-4 h-4" />
              </div>
              {idx < TIMELINE_STEPS.length - 1 && (
                <div className={`w-0.5 h-10 mt-1 transition-colors ${isDone ? 'bg-primary-300' : 'bg-slate-200'}`} />
              )}
            </div>
            <div className="pt-1 pb-10">
              <p className={`text-sm font-medium ${isDone ? 'text-slate-900' : 'text-slate-400'}`}>
                {step.label}
              </p>
              {isCurrent && (
                <p className="text-xs text-primary-600 font-medium mt-0.5">Current status</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function TripDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  const fetchBooking = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await carpoolAPI.getBookingById(id);
      setBooking(res.data?.data || res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load booking details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const handleCancel = async () => {
    setCancelLoading(true);
    try {
      await carpoolAPI.cancelBooking(id);
      toast.success('Booking cancelled.');
      navigate('/trips');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel booking.');
    } finally {
      setCancelLoading(false);
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

  if (error || !booking) {
    return (
      <div className="max-w-3xl mx-auto">
        <Button variant="ghost" size="sm" className="gap-2 mb-4" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <Card><ErrorState message={error || 'Booking not found.'} onRetry={fetchBooking} /></Card>
      </div>
    );
  }

  const ride = booking.ride || booking;
  const trip = booking.trip;
  const tripStatus = trip?.status || 'Booked';
  const canCancel = ['Requested', 'Accepted'].includes(booking.status);

  const departureTime = ride.departure_time || booking.departure_time;
  const formattedTime = departureTime
    ? new Date(departureTime).toLocaleString([], {
        weekday: 'long', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : 'N/A';

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
            <h1 className="text-2xl font-bold text-slate-900">Booking Details</h1>
            <p className="text-slate-500 text-sm">Booking #{booking.id}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left: Main Info */}
          <div className="md:col-span-2 space-y-5">
            {/* Booking Status */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-slate-900">Booking Status</h2>
                <StatusBadge status={booking.status} />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500 text-xs mb-0.5">Seats Booked</p>
                  <p className="font-medium text-slate-900">{booking.seats_booked}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs mb-0.5">Total Fare</p>
                  <p className="font-semibold text-primary-600">₹{booking.fare_total || ride.fare_per_seat}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs mb-0.5">Booked On</p>
                  <p className="font-medium text-slate-900">
                    {booking.booked_at ? new Date(booking.booked_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </Card>

            {/* Route */}
            <Card>
              <h2 className="font-semibold text-slate-900 mb-4">Route Details</h2>
              <div className="space-y-3 relative before:absolute before:inset-y-4 before:left-2 before:w-0.5 before:bg-slate-200 mb-4">
                <div className="flex gap-4 items-start relative z-10">
                  <div className="w-4 h-4 rounded-full bg-white border-4 border-slate-300 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-medium text-slate-900">{ride.pickup_name || booking.pickup_name}</p>
                    <p className="text-sm text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <Clock className="w-3.5 h-3.5" />
                      {formattedTime}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 items-start relative z-10">
                  <div className="w-4 h-4 rounded-full bg-white border-4 border-primary-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-medium text-slate-900">{ride.destination_name || booking.destination_name}</p>
                    {ride.distance_km && (
                      <p className="text-sm text-slate-400">~{ride.distance_km} km · ~{Math.round(ride.duration_min || 0)} min</p>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Driver */}
            <Card>
              <h2 className="font-semibold text-slate-900 mb-4">Driver & Vehicle</h2>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold flex-shrink-0">
                  {(ride.driver_name || 'D').split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">{ride.driver_name || 'Driver'}</p>
                  <p className="text-sm text-slate-500 flex items-center gap-1.5">
                    <Car className="w-3.5 h-3.5" />
                    {ride.vehicle_model || 'Vehicle'} · {ride.registration_number || ''}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Right: Timeline + Actions */}
          <div className="space-y-5">
            {/* Trip Timeline */}
            <Card>
              <h2 className="font-semibold text-slate-900 mb-5">Trip Timeline</h2>
              <TripTimeline tripStatus={tripStatus} />
            </Card>

            {/* Actions */}
            {canCancel && (
              <Card>
                <h2 className="font-semibold text-slate-900 mb-4">Actions</h2>
                <Button
                  variant="outline"
                  fullWidth
                  className="gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                  onClick={() => setShowCancelDialog(true)}
                >
                  <X className="w-4 h-4" />
                  Cancel Booking
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onConfirm={handleCancel}
        isLoading={cancelLoading}
        title="Cancel Booking"
        message="Are you sure you want to cancel this booking? This cannot be undone."
        confirmLabel="Yes, Cancel"
        confirmVariant="danger"
      />
    </>
  );
}
