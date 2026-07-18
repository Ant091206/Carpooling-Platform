import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Car, Plus, MapPin, Clock, Users, ChevronRight,
  CheckCircle, X, Play, Search
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

function MyRideCard({ ride, onStart, onComplete, onCancel }) {
  const departureTime = ride.departure_time
    ? new Date(ride.departure_time).toLocaleString([], {
        weekday: 'short', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : 'N/A';

  const seatsUsed = (ride.total_seats || ride.available_seats) - ride.available_seats;

  return (
    <Card className="border border-slate-100 hover:border-primary-200 transition-all">
      <div className="flex items-start justify-between mb-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <StatusBadge status={ride.status} />
            {ride.is_recurring && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 text-xs font-medium">
                Recurring
              </span>
            )}
          </div>
          <h3 className="font-semibold text-slate-900">
            {ride.pickup_name} → {ride.destination_name}
          </h3>
          <p className="text-sm text-slate-400 flex items-center gap-1.5 mt-0.5">
            <Clock className="w-3.5 h-3.5" />
            {departureTime}
          </p>
        </div>
        <div className="text-right flex-shrink-0 ml-4">
          <div className="text-xs text-slate-500 mb-0.5">Fare/seat</div>
          <div className="font-bold text-lg text-slate-900">₹{ride.fare_per_seat}</div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1.5 text-slate-500">
            <Users className="w-4 h-4 text-slate-400" />
            {seatsUsed}/{ride.total_seats || ride.available_seats} seats booked
          </span>
          {ride.vehicle_model && (
            <span className="flex items-center gap-1.5 text-slate-500">
              <Car className="w-4 h-4 text-slate-400" />
              {ride.vehicle_model}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {ride.status === 'Published' && (
            <>
              <Button
                size="sm"
                variant="ghost"
                className="text-green-600 hover:text-green-700 hover:bg-green-50 gap-1.5"
                onClick={() => onStart(ride)}
              >
                <Play className="w-4 h-4" />
                Start
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 gap-1.5"
                onClick={() => onCancel(ride)}
              >
                <X className="w-4 h-4" />
                Cancel
              </Button>
            </>
          )}
          {ride.status === 'Full' && (
            <Button
              size="sm"
              variant="ghost"
              className="text-green-600 hover:text-green-700 hover:bg-green-50 gap-1.5"
              onClick={() => onStart(ride)}
            >
              <Play className="w-4 h-4" />
              Start
            </Button>
          )}
          {(ride.status === 'Started' || ride.status === 'InProgress') && (
            <Button
              size="sm"
              className="gap-1.5 bg-green-600 hover:bg-green-700"
              onClick={() => onComplete(ride)}
            >
              <CheckCircle className="w-4 h-4" />
              Complete
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

export function MyRides() {
  const navigate = useNavigate();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionTarget, setActionTarget] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('active');

  const fetchRides = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await carpoolAPI.getMyRides();
      setRides(res.data?.data || res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load rides.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRides();
  }, [fetchRides]);

  const activeRideStatuses = ['Published', 'Full', 'Started', 'InProgress'];
  const pastRideStatuses = ['Completed', 'Cancelled'];

  const filteredRides = rides.filter((r) =>
    activeTab === 'active' ? activeRideStatuses.includes(r.status) : pastRideStatuses.includes(r.status)
  );

  const handleAction = async () => {
    if (!actionTarget || !actionType) return;
    setActionLoading(true);
    try {
      if (actionType === 'start') {
        await carpoolAPI.startRide(actionTarget.id);
        toast.success('Ride started!');
      } else if (actionType === 'complete') {
        await carpoolAPI.completeRide(actionTarget.id);
        toast.success('Ride completed!');
      } else if (actionType === 'cancel') {
        await carpoolAPI.cancelRide(actionTarget.id);
        toast.success('Ride cancelled.');
      }
      setActionTarget(null);
      setActionType(null);
      fetchRides();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const dialogConfig = {
    start: {
      title: 'Start Ride',
      message: 'Are you ready to start this ride? Passengers will be notified.',
      confirmLabel: 'Start Ride',
      confirmVariant: 'primary',
    },
    complete: {
      title: 'Complete Ride',
      message: 'Mark this ride as completed? All passengers will be prompted for payment.',
      confirmLabel: 'Complete Ride',
      confirmVariant: 'primary',
    },
    cancel: {
      title: 'Cancel Ride',
      message: 'Are you sure you want to cancel this ride? All bookings will be cancelled.',
      confirmLabel: 'Yes, Cancel Ride',
      confirmVariant: 'danger',
    },
  };

  const config = actionType ? dialogConfig[actionType] : {};

  return (
    <>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Rides</h1>
            <p className="text-slate-500">Manage rides you've offered to colleagues.</p>
          </div>
          <Button onClick={() => navigate('/offer-ride')} className="gap-2 self-start md:self-auto">
            <Plus className="w-4 h-4" />
            Offer a Ride
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 border-b border-slate-200">
          {[
            { id: 'active', label: 'Active Rides' },
            { id: 'past', label: 'Past Rides' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={twMerge(clsx(
                'px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              ))}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        )}

        {!loading && error && (
          <Card><ErrorState message={error} onRetry={fetchRides} /></Card>
        )}

        {!loading && !error && filteredRides.length === 0 && (
          <Card>
            <EmptyState
              icon={Car}
              title={activeTab === 'active' ? 'No active rides' : 'No past rides'}
              description={
                activeTab === 'active'
                  ? "You haven't offered any rides yet."
                  : 'Your completed and cancelled rides will appear here.'
              }
              action={
                activeTab === 'active' && (
                  <Button onClick={() => navigate('/offer-ride')} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Offer a Ride
                  </Button>
                )
              }
            />
          </Card>
        )}

        {!loading && !error && filteredRides.length > 0 && (
          <div className="space-y-4">
            {filteredRides.map((ride) => (
              <MyRideCard
                key={ride.id}
                ride={ride}
                onStart={(r) => { setActionTarget(r); setActionType('start'); }}
                onComplete={(r) => { setActionTarget(r); setActionType('complete'); }}
                onCancel={(r) => { setActionTarget(r); setActionType('cancel'); }}
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!actionTarget}
        onClose={() => { setActionTarget(null); setActionType(null); }}
        onConfirm={handleAction}
        isLoading={actionLoading}
        title={config.title || ''}
        message={config.message || ''}
        confirmLabel={config.confirmLabel || 'Confirm'}
        confirmVariant={config.confirmVariant || 'primary'}
      />
    </>
  );
}
