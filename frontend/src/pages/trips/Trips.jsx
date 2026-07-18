import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Clock, Navigation, X, ChevronRight, Car, Users,
  MapPin, CheckCircle, AlertCircle, Calendar, Search
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { StatusBadge } from '../../components/StatusBadge';
import { CardSkeleton } from '../../components/Skeleton';
import { ErrorState } from '../../components/ErrorState';
import { EmptyState } from '../../components/EmptyState';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { carpoolAPI } from '../../services/api';

function TripCard({ booking, onViewDetails, onCancel }) {
  const ride = booking.ride || booking;
  const departureTime = ride.departure_time || booking.departure_time;
  const formattedTime = departureTime
    ? new Date(departureTime).toLocaleString([], {
        weekday: 'short', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : 'N/A';

  const pickupName = ride.pickup_name || booking.pickup_name;
  const destName = ride.destination_name || booking.destination_name;
  const driverName = ride.driver_name || booking.driver_name;
  const vehicleModel = ride.vehicle_model || booking.vehicle_model;
  const fare = booking.fare_total || ride.fare_per_seat;
  const bookingStatus = booking.status;
  const canCancel = ['Requested', 'Accepted'].includes(bookingStatus);

  return (
    <Card className="hover:border-primary-200 transition-all border border-slate-100">
      <div className="flex items-start justify-between mb-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <StatusBadge status={bookingStatus} />
            {ride.is_recurring && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 text-xs font-medium">
                Recurring
              </span>
            )}
          </div>
          <h3 className="font-semibold text-slate-900">
            {pickupName} → {destName}
          </h3>
          <p className="text-sm text-slate-400 flex items-center gap-1.5 mt-0.5">
            <Clock className="w-3.5 h-3.5" />
            {formattedTime}
          </p>
        </div>
        <div className="text-right flex-shrink-0 ml-4">
          <div className="text-xs text-slate-500 mb-0.5">Total Fare</div>
          <div className="font-bold text-lg text-slate-900">₹{fare}</div>
          <div className="text-xs text-slate-400">{booking.seats_booked} seat{booking.seats_booked !== 1 ? 's' : ''}</div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-xs flex-shrink-0">
            {(driverName || 'D').split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900">{driverName || 'Driver'}</p>
            <p className="text-xs text-slate-400">{vehicleModel || 'Vehicle'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canCancel && (
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => onCancel(booking)}
            >
              <X className="w-4 h-4" />
              Cancel
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() => onViewDetails(booking)}
          >
            Details
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

const TABS = [
  { id: 'upcoming', label: 'Upcoming', statuses: ['Requested', 'Accepted'] },
  { id: 'active',   label: 'Active',   statuses: ['Booked', 'Started', 'InProgress'] },
  { id: 'past',     label: 'Past',     statuses: ['Completed', 'Cancelled', 'Rejected'] },
];

export function Trips() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await carpoolAPI.getMyBookings();
      setBookings(res.data?.data || res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load trips.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const currentStatuses = TABS.find((t) => t.id === activeTab)?.statuses || [];

  const filteredBookings = bookings.filter((b) => {
    const statusMatch = currentStatuses.includes(b.status);
    if (!searchQuery) return statusMatch;
    const q = searchQuery.toLowerCase();
    const pickup = (b.ride?.pickup_name || b.pickup_name || '').toLowerCase();
    const dest = (b.ride?.destination_name || b.destination_name || '').toLowerCase();
    return statusMatch && (pickup.includes(q) || dest.includes(q));
  });

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setCancelLoading(true);
    try {
      await carpoolAPI.cancelBooking(cancelTarget.id);
      toast.success('Booking cancelled successfully.');
      setCancelTarget(null);
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel booking.');
    } finally {
      setCancelLoading(false);
    }
  };

  const handleViewDetails = (booking) => {
    navigate(`/trips/${booking.id}`);
  };

  const tabCounts = TABS.map((tab) => ({
    ...tab,
    count: bookings.filter((b) => tab.statuses.includes(b.status)).length,
  }));

  return (
    <>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Trips</h1>
            <p className="text-slate-500">Track and manage your ride bookings.</p>
          </div>
          <Button onClick={() => navigate('/find-ride')} className="gap-2 self-start md:self-auto">
            <Search className="w-4 h-4" />
            Find a Ride
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search by pickup or destination..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
          />
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 border-b border-slate-200">
          {tabCounts.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={twMerge(clsx(
                'px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2',
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              ))}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={clsx(
                  'inline-flex items-center justify-center rounded-full text-xs font-semibold px-2 py-0.5',
                  activeTab === tab.id ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-600'
                )}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        )}

        {!loading && error && (
          <Card><ErrorState message={error} onRetry={fetchBookings} /></Card>
        )}

        {!loading && !error && filteredBookings.length === 0 && (
          <Card>
            <EmptyState
              icon={Calendar}
              title={`No ${activeTab} trips`}
              description={
                activeTab === 'upcoming'
                  ? 'You have no upcoming bookings. Find a ride to get started.'
                  : `No ${activeTab} trips found.`
              }
              action={
                activeTab === 'upcoming' && (
                  <Button onClick={() => navigate('/find-ride')} className="gap-2">
                    <Search className="w-4 h-4" />
                    Find a Ride
                  </Button>
                )
              }
            />
          </Card>
        )}

        {!loading && !error && filteredBookings.length > 0 && (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <TripCard
                key={booking.id}
                booking={booking}
                onViewDetails={handleViewDetails}
                onCancel={(b) => setCancelTarget(b)}
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancel}
        isLoading={cancelLoading}
        title="Cancel Booking"
        message="Are you sure you want to cancel this booking? This action cannot be undone."
        confirmLabel="Yes, Cancel Booking"
        confirmVariant="danger"
      />
    </>
  );
}
