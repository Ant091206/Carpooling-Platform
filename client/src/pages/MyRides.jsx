import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Car, CheckCircle, Clock, Loader2, Plus, Play,
  X, AlertCircle, Users, ChevronRight
} from 'lucide-react';
import PageShell from '../components/shared/PageShell.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Badge from '../components/ui/Badge.jsx';
import Modal from '../components/ui/Modal.jsx';
import { ridesAPI } from '../services/api.js';

const statusTone = { Published: 'green', Full: 'blue', Cancelled: 'red', Completed: 'slate', Started: 'amber', InProgress: 'amber' };

function RideManageCard({ ride, onAction }) {
  const departure = ride.departure_time ? new Date(ride.departure_time) : null;
  const seatsUsed = (ride.total_seats || 0) - (ride.available_seats || 0);
  const canStart = ['Published', 'Full'].includes(ride.status);
  const isActive = ['Started', 'InProgress'].includes(ride.status);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 22 }}>
      <Card className="grid gap-4 md:grid-cols-[1fr_auto]">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="font-heading text-xl font-extrabold text-slate-950">
              {ride.pickup_name} → {ride.destination_name}
            </h3>
            <Badge tone={statusTone[ride.status] || 'slate'}>{ride.status}</Badge>
            {ride.is_recurring && <Badge tone="blue">Recurring</Badge>}
          </div>
          <p className="text-slate-600">
            {departure ? departure.toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
            {ride.vehicle_model ? ` · ${ride.vehicle_model}` : ''}
          </p>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1.5 text-slate-500">
              <Users className="h-4 w-4 text-emerald-400" />
              {seatsUsed}/{ride.total_seats || '?'} seats booked
            </span>
            <span className="font-extrabold text-emerald-700">₹{ride.fare_per_seat}/seat</span>
          </div>
        </div>
        <div className="flex flex-wrap items-start gap-2 md:flex-col md:items-end">
          {canStart && (
            <Button variant="secondary" icon={Play} size="sm" onClick={() => onAction(ride, 'start')}>
              Start Ride
            </Button>
          )}
          {isActive && (
            <Button icon={CheckCircle} size="sm" onClick={() => onAction(ride, 'complete')}>
              Mark Complete
            </Button>
          )}
          {['Published', 'Full'].includes(ride.status) && (
            <Button variant="ghost" size="sm" onClick={() => onAction(ride, 'cancel')}
              className="text-red-600 hover:bg-red-50">
              Cancel
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

const ACTION_CONFIG = {
  start:    { title: 'Start Ride',    message: 'Ready to start? Passengers will see the trip as active.', label: 'Start Now',    tone: 'primary' },
  complete: { title: 'Complete Ride', message: 'Mark this ride as completed? Passengers will be prompted for payment.', label: 'Complete', tone: 'primary' },
  cancel:   { title: 'Cancel Ride',  message: 'Cancel this ride? All pending bookings will be rejected.', label: 'Yes, Cancel', tone: 'danger' },
};

export default function MyRides() {
  const navigate = useNavigate();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('active');
  const [actionTarget, setActionTarget] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchRides = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await ridesAPI.getMyRides();
      setRides(res.data?.data || res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load rides.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRides(); }, [fetchRides]);

  const activeStatuses = ['Published', 'Full', 'Started', 'InProgress'];
  const pastStatuses   = ['Completed', 'Cancelled'];
  const filtered = rides.filter((r) =>
    tab === 'active' ? activeStatuses.includes(r.status) : pastStatuses.includes(r.status)
  );

  const handleAction = async () => {
    if (!actionTarget || !actionType) return;
    setActionLoading(true);
    try {
      if (actionType === 'start')    await ridesAPI.start(actionTarget.id);
      if (actionType === 'complete') await ridesAPI.complete(actionTarget.id);
      if (actionType === 'cancel')   await ridesAPI.cancel(actionTarget.id);
      toast.success(`Ride ${actionType}ed successfully.`);
      setActionTarget(null);
      setActionType(null);
      fetchRides();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const cfg = actionType ? ACTION_CONFIG[actionType] : {};

  return (
    <>
      <PageShell
        eyebrow="Driver view"
        title="My Rides"
        description="Manage rides you've offered. Start, complete, or cancel rides from here."
        action={
          <Button icon={Plus} onClick={() => navigate('/offer-ride')}>Offer a Ride</Button>
        }
      >
        {/* Tabs */}
        <div className="flex gap-1 rounded-2xl bg-white p-1 shadow-sm border border-emerald-100 w-fit">
          {[{ id: 'active', label: 'Active Rides' }, { id: 'past', label: 'Past Rides' }].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${tab === t.id ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-emerald-50'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading && (
          <div className="flex min-h-48 items-center justify-center gap-3 text-emerald-700">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p className="font-bold">Loading rides…</p>
          </div>
        )}

        {!loading && error && (
          <Card className="flex flex-col items-center gap-4 py-10 text-center">
            <AlertCircle className="h-8 w-8 text-red-400" />
            <p className="font-heading text-xl font-extrabold text-slate-950">{error}</p>
            <Button variant="secondary" onClick={fetchRides}>Retry</Button>
          </Card>
        )}

        {!loading && !error && filtered.length === 0 && (
          <Card className="flex flex-col items-center gap-4 py-12 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-emerald-100 text-emerald-600">
              <Car className="h-6 w-6" />
            </span>
            <p className="font-heading text-xl font-extrabold text-slate-950">
              {tab === 'active' ? 'No active rides' : 'No past rides'}
            </p>
            <p className="text-slate-500">
              {tab === 'active' ? 'Offer a ride to start sharing your commute.' : 'Your completed and cancelled rides will appear here.'}
            </p>
            {tab === 'active' && <Button icon={Plus} onClick={() => navigate('/offer-ride')}>Offer a Ride</Button>}
          </Card>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="space-y-5">
            {filtered.map((ride) => (
              <RideManageCard
                key={ride.id}
                ride={ride}
                onAction={(r, type) => { setActionTarget(r); setActionType(type); }}
              />
            ))}
          </div>
        )}
      </PageShell>

      {/* Action modal */}
      <Modal open={!!actionTarget} onClose={() => { setActionTarget(null); setActionType(null); }} title={cfg.title || ''}>
        <div className="space-y-5">
          <p className="text-slate-600">{cfg.message}</p>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => { setActionTarget(null); setActionType(null); }}>
              Cancel
            </Button>
            <Button
              loading={actionLoading}
              className={`flex-1 ${cfg.tone === 'danger' ? 'bg-red-600 hover:bg-red-700 shadow-red-200' : ''}`}
              onClick={handleAction}
            >
              {cfg.label}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
