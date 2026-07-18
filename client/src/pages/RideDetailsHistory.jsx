import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Users, ShieldCheck, CreditCard, MessageSquare, Navigation } from 'lucide-react';
import PageShell from '../components/shared/PageShell.jsx';
import Card from '../components/ui/Card.jsx';
import Badge from '../components/ui/Badge.jsx';
import Button from '../components/ui/Button.jsx';
import RideTimeline from '../components/RideTimeline.jsx';
import ReviewCard from '../components/ReviewCard.jsx';
import historyService from '../services/history.service.js';
import toast from 'react-hot-toast';

export default function RideDetailsHistory() {
  const { rideId } = useParams();
  const navigate = useNavigate();
  const [rideDetails, setRideDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const data = await historyService.getById(rideId);
        setRideDetails(data);
      } catch (error) {
        toast.error('Failed to load ride details.');
        navigate('/ride-history');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [rideId, navigate]);

  if (loading) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" />
      </div>
    );
  }

  if (!rideDetails) {
    return (
      <PageShell title="Details Not Found" description="The requested details could not be resolved.">
        <Card className="p-8 text-center text-slate-500">
          <p>Please return to history index.</p>
          <Link to="/ride-history">
            <Button className="mt-4">Back to History</Button>
          </Link>
        </Card>
      </PageShell>
    );
  }

  const {
    pickup,
    destination,
    distance,
    duration,
    status,
    departureTime,
    isDriver,
    driver,
    passengers,
    payment,
    reviews,
    timeline
  } = rideDetails;

  const displayDate = new Date(departureTime).toLocaleString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const statusColors = {
    Scheduled: 'blue',
    Started: 'indigo',
    InProgress: 'orange',
    Completed: 'green',
    Cancelled: 'red'
  };

  return (
    <PageShell
      eyebrow="Ride Details"
      title={`${pickup} to ${destination}`}
      description={displayDate}
      action={
        <Link to="/ride-history" className="font-bold text-emerald-700 flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to History
        </Link>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        {/* Left Side: Map, Timeline, Participants, Reviews */}
        <div className="space-y-6">
          {/* Map visualization block */}
          <Card className="p-6 bg-white space-y-4">
            <div className="h-72 rounded-[2rem] bg-[#EAF6EF] p-5 relative overflow-hidden flex items-center justify-center border border-emerald-100">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#047857_1px,transparent_1px)] [background-size:16px_16px]" />
              <div className="relative w-full h-full rounded-2xl border-2 border-dashed border-emerald-300 bg-white/80 p-6 flex flex-col justify-between items-center shadow-sm">
                <span className="font-extrabold text-emerald-700 bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-200 text-sm flex items-center gap-1.5">
                  <Navigation className="w-4 h-4 text-emerald-600 animate-pulse" />
                  Route Trace Map
                </span>
                
                <div className="w-full max-w-sm flex items-center justify-between text-xs font-bold text-slate-700 bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span className="truncate max-w-[120px]">{pickup}</span>
                  </div>
                  <div className="border-t border-dashed border-slate-300 flex-1 mx-2" />
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <span className="truncate max-w-[120px]">{destination}</span>
                  </div>
                </div>

                <div className="flex w-full justify-between items-center text-sm font-bold text-emerald-800">
                  <span>Distance: {distance.toFixed(1)} km</span>
                  <span>Duration: {duration} min</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Ride Timeline progression */}
          <Card className="p-6 bg-white space-y-4">
            <h3 className="font-heading text-xl font-extrabold text-slate-950">Ride timeline progression</h3>
            <div className="pt-2">
              <RideTimeline timeline={timeline} currentStatus={status} />
            </div>
          </Card>

          {/* User Participants List */}
          <Card className="p-6 bg-white space-y-4">
            <h3 className="font-heading text-xl font-extrabold text-slate-950 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-700" /> Pool participants
            </h3>
            
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Driver */}
              {driver && (
                <Link
                  to={`/profile-reviews/${driver.id}`}
                  className="flex items-center gap-4 bg-slate-50/50 hover:bg-emerald-50/30 border border-slate-100 hover:border-emerald-100 rounded-2xl p-4 transition-all duration-150"
                >
                  {driver.avatar ? (
                    <img
                      src={driver.avatar.startsWith('http') ? driver.avatar : `/${driver.avatar}`}
                      alt={driver.name}
                      className="w-12 h-12 rounded-full object-cover border border-emerald-100"
                    />
                  ) : (
                    <span className="grid h-12 w-12 place-items-center rounded-full bg-emerald-100 font-heading text-lg font-extrabold text-emerald-700">
                      {driver.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                    </span>
                  )}
                  <div>
                    <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-widest block">Driver</span>
                    <p className="font-heading font-extrabold text-slate-900 leading-snug">{driver.name}</p>
                    <p className="text-xs text-slate-500 font-medium">{driver.department || 'Odoo Team'}</p>
                  </div>
                </Link>
              )}

              {/* Passengers */}
              {passengers && passengers.map((p) => (
                <Link
                  key={p.id}
                  to={`/profile-reviews/${p.id}`}
                  className="flex items-center gap-4 bg-slate-50/50 hover:bg-emerald-50/30 border border-slate-100 hover:border-emerald-100 rounded-2xl p-4 transition-all duration-150"
                >
                  {p.avatar ? (
                    <img
                      src={p.avatar.startsWith('http') ? p.avatar : `/${p.avatar}`}
                      alt={p.name}
                      className="w-12 h-12 rounded-full object-cover border border-emerald-100"
                    />
                  ) : (
                    <span className="grid h-12 w-12 place-items-center rounded-full bg-emerald-100 font-heading text-lg font-extrabold text-emerald-700">
                      {p.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                    </span>
                  )}
                  <div>
                    <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-widest block">Passenger</span>
                    <p className="font-heading font-extrabold text-slate-900 leading-snug">{p.name}</p>
                    <p className="text-xs text-slate-500 font-medium">{p.department || 'Odoo Team'}</p>
                  </div>
                </Link>
              ))}
            </div>
          </Card>

          {/* Feedback reviews left for this ride */}
          <Card className="p-6 bg-white space-y-4">
            <h3 className="font-heading text-xl font-extrabold text-slate-950 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-700" /> Submitted feedback
            </h3>
            {reviews && reviews.length > 0 ? (
              <div className="grid gap-4">
                {reviews.map((rev) => (
                  <ReviewCard key={rev.id} review={rev} />
                ))}
              </div>
            ) : (
              <p className="text-sm font-medium text-slate-400 italic">No feedback reviews submitted for this commute yet.</p>
            )}
          </Card>
        </div>

        {/* Right Side: Status summary, Payment logs */}
        <div className="space-y-6">
          <Card className="p-6 bg-white space-y-5">
            <div className="flex items-center justify-between border-b border-slate-50 pb-4">
              <span className="text-sm font-bold text-slate-500">Commute Status</span>
              <Badge tone={statusColors[status] || 'slate'}>{status}</Badge>
            </div>

            {/* Payment Summary */}
            <div className="space-y-3">
              <h4 className="font-heading font-extrabold text-slate-950 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-emerald-700" /> Payment Details
              </h4>
              <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-slate-500">Fares split</span>
                  <span className="font-bold text-slate-900">₹{payment?.fare.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-slate-500">Payment Status</span>
                  <Badge tone={payment?.paymentStatus === 'PAID' ? 'green' : 'warning'}>
                    {payment?.paymentStatus || 'PENDING'}
                  </Badge>
                </div>
                <div className="border-t border-slate-100 pt-2 flex justify-between items-center font-extrabold text-emerald-800">
                  <span>Grand Total</span>
                  <span className="text-lg">₹{payment?.fare.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4 flex gap-2 text-xs font-bold text-emerald-800">
              <ShieldCheck className="h-4 w-4 text-emerald-700 shrink-0" />
              <span>Workspace-verified pooling commute session under mask security framework.</span>
            </div>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
