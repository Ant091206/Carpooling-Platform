import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Car, CheckCircle, Clock, Loader2, MapPin,
  AlertCircle, Users, ShieldCheck, Repeat
} from 'lucide-react';
import PageShell from '../components/shared/PageShell.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Badge from '../components/ui/Badge.jsx';
import Modal from '../components/ui/Modal.jsx';
import { ridesAPI, bookingsAPI } from '../services/api.js';

const statusTone = {
  Published: 'green', Full: 'slate', Cancelled: 'red', Completed: 'slate',
};

function InfoBox({ label, value }) {
  return (
    <div className="rounded-2xl border border-emerald-100 bg-[#EAF6EF]/60 p-4">
      <p className="text-xs font-extrabold uppercase tracking-widest text-emerald-700">{label}</p>
      <p className="mt-1 font-bold text-slate-900">{value || '—'}</p>
    </div>
  );
}

export default function RideDetails() {
  const { rideId } = useParams();
  const navigate = useNavigate();

  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({ defaultValues: { seats: 1 } });
  const seatsWatched = parseInt(watch('seats') || 1);

  const fetchRide = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await ridesAPI.getById(rideId);
      setRide(res.data?.data || res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load ride details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRide(); }, [rideId]);

  const onBook = async (data) => {
    setBookingLoading(true);
    try {
      await bookingsAPI.book({
        ride_id: parseInt(rideId),
        seats_booked: parseInt(data.seats),
      });
      toast.success('Ride booked! Check My Trips for details.');
      setModalOpen(false);
      navigate('/my-trips');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed — seat may be taken.');
      fetchRide(); // refresh seat count
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-emerald-700">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="font-bold">Loading ride details…</p>
      </div>
    );
  }

  if (error || !ride) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <AlertCircle className="h-10 w-10 text-red-400" />
        <p className="font-heading text-2xl font-extrabold text-slate-950">Ride not found</p>
        <p className="text-slate-500">{error}</p>
        <Button variant="secondary" onClick={() => navigate(-1)} icon={ArrowLeft}>Go Back</Button>
      </div>
    );
  }

  const departure = ride.departure_time ? new Date(ride.departure_time) : null;
  const canBook = ride.status === 'Published' && ride.available_seats > 0;
  const totalFare = ((ride.fare_per_seat || 0) * seatsWatched).toFixed(2);

  return (
    <>
      <PageShell
        eyebrow="Ride details"
        title={`${ride.pickup_name} → ${ride.destination_name}`}
        description={departure ? departure.toLocaleString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
        action={
          <Link to="/find-ride" className="font-bold text-emerald-700 flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to search
          </Link>
        }
      >
        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
          {/* Left panel */}
          <div className="space-y-6">
            {/* Status + route */}
            <Card className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-xl font-extrabold text-slate-950">Route</h2>
                <Badge tone={statusTone[ride.status] || 'slate'}>{ride.status}</Badge>
              </div>
              <div className="relative space-y-4 pl-6 before:absolute before:inset-y-2 before:left-2 before:w-0.5 before:rounded-full before:bg-emerald-200">
                <div className="relative">
                  <span className="absolute -left-6 mt-1.5 h-3 w-3 rounded-full border-2 border-slate-300 bg-white" />
                  <p className="font-bold text-slate-900">{ride.pickup_name}</p>
                  <p className="text-sm text-slate-500">
                    {departure ? departure.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </p>
                </div>
                <div className="relative">
                  <span className="absolute -left-6 mt-1.5 h-3 w-3 rounded-full border-2 border-emerald-500 bg-white" />
                  <p className="font-bold text-slate-900">{ride.destination_name}</p>
                  {ride.distance_km && (
                    <p className="text-sm text-slate-500">~{ride.distance_km} km · ~{Math.round(ride.duration_min || 0)} min</p>
                  )}
                </div>
              </div>
              {ride.is_recurring && (
                <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">
                  <Repeat className="h-4 w-4" /> Recurring daily ride
                </div>
              )}
            </Card>

            {/* Driver & Vehicle */}
            <Card className="space-y-4">
              <h2 className="font-heading text-xl font-extrabold text-slate-950">Driver & Vehicle</h2>
              <div className="flex items-center gap-4">
                <span className="grid h-14 w-14 place-items-center rounded-full bg-emerald-100 font-heading text-xl font-extrabold text-emerald-700">
                  {(ride.driver_name || 'DR').split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                </span>
                <div>
                  <p className="font-heading text-lg font-extrabold text-slate-950">{ride.driver_name || 'Driver'}</p>
                  <p className="text-sm text-slate-500">{ride.driver_department || 'Employee'}</p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <InfoBox label="Vehicle" value={ride.vehicle_model} />
                <InfoBox label="Registration" value={ride.registration_number} />
                <InfoBox label="Seats Available" value={`${ride.available_seats} of ${ride.total_seats || '?'}`} />
                <InfoBox label="Fare per seat" value={`₹${ride.fare_per_seat}`} />
              </div>
              {ride.notes && (
                <div className="rounded-2xl border border-emerald-100 bg-[#EAF6EF]/60 p-4">
                  <p className="text-xs font-extrabold uppercase tracking-widest text-emerald-700">Driver's Note</p>
                  <p className="mt-1 text-sm text-slate-700">{ride.notes}</p>
                </div>
              )}
              <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">
                <ShieldCheck className="h-4 w-4" /> Employee-verified ride within your organisation
              </div>
            </Card>
          </div>

          {/* Right: booking panel */}
          <div>
            <div className="sticky top-24">
              <Card className="space-y-5">
                <h2 className="font-heading text-xl font-extrabold text-slate-950">Book This Ride</h2>

                {canBook ? (
                  <>
                    <div className="rounded-2xl bg-emerald-50 p-4">
                      <p className="text-sm text-slate-600">Fare per seat</p>
                      <p className="font-heading text-3xl font-extrabold text-emerald-700">₹{ride.fare_per_seat}</p>
                      <p className="text-sm text-slate-500 mt-1">
                        {ride.available_seats} seat{ride.available_seats !== 1 ? 's' : ''} left
                      </p>
                    </div>
                    <Button icon={CheckCircle} className="w-full" size="lg" onClick={() => setModalOpen(true)}>
                      Book Now
                    </Button>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-3 py-6 text-center">
                    <AlertCircle className="h-8 w-8 text-slate-400" />
                    <p className="font-bold text-slate-700">
                      {ride.status === 'Full' ? 'All seats are taken.' : `This ride is ${ride.status}.`}
                    </p>
                    <Button variant="secondary" onClick={() => navigate('/find-ride')}>
                      Find Another Ride
                    </Button>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </PageShell>

      {/* Booking confirmation modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Confirm Booking">
        <form onSubmit={handleSubmit(onBook)} className="space-y-5">
          <div>
            <label className="block space-y-2">
              <span className="text-sm font-bold text-slate-700">Number of seats</span>
              <select
                className="w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm font-bold text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                {...register('seats', { required: true, min: 1, max: ride.available_seats })}
              >
                {Array.from({ length: Math.min(ride.available_seats, 8) }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>{n} seat{n !== 1 ? 's' : ''}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-[#EAF6EF] p-4 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">₹{ride.fare_per_seat} × {seatsWatched} seat{seatsWatched !== 1 ? 's' : ''}</span>
              <span className="font-bold text-slate-900">₹{totalFare}</span>
            </div>
            <div className="flex justify-between font-extrabold text-emerald-700 border-t border-emerald-200 pt-2">
              <span>Total</span>
              <span className="font-heading text-xl">₹{totalFare}</span>
            </div>
          </div>
          <Button type="submit" loading={bookingLoading} icon={CheckCircle} className="w-full" size="lg">
            Confirm Booking
          </Button>
        </form>
      </Modal>
    </>
  );
}
