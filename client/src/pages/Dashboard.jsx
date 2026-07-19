import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Car, Home, MapPin, Search, Users, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import Card from '../components/ui/Card.jsx';
import Badge from '../components/ui/Badge.jsx';
import PageShell from '../components/shared/PageShell.jsx';
import { DriverIllustration, PassengerIllustration } from '../illustrations/CarpoolIllustrations.jsx';
import bookingService from '../services/booking.service.js';
import rideService from '../services/ride.service.js';
import authService from '../services/auth.service.js';

export default function Dashboard() {
  const { user } = useAuth();
  const [upcomingTrip, setUpcomingTrip] = useState(null);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // 1. Fetch saved places
        try {
          const saved = await authService.getSavedPlaces();
          setPlaces(saved || []);
        } catch (e) {
          console.error("Saved places error:", e.message);
        }

        // 2. Fetch driver rides & passenger bookings to find the most imminent trip
        let imminent = null;
        
        try {
          const passengerBookings = await bookingService.listBookings(); // passenger bookings
          const activeBookings = passengerBookings.filter(b => b.status === 'ACCEPTED' || b.status === 'PENDING');
          
          const driverRides = await rideService.getMyRides();
          const activeRides = driverRides.filter(r => r.ride_status === 'Scheduled');

          const tripsList = [];
          
          activeBookings.forEach(b => {
            const pickup = b.ride?.pickupName || b.ride?.pickup_name || '—';
            const dest = b.ride?.destinationName || b.ride?.destination_name || '—';
            const time = b.ride?.departureTime || b.ride?.departure_time;
            const fare = parseFloat(b.ride?.farePerSeat || b.ride?.fare_per_seat || 0) * (b.requestedSeats || 1);
            tripsList.push({
              id: b.id,
              type: 'passenger',
              rideId: b.rideId,
              route: `${pickup} → ${dest}`,
              time,
              fare,
              status: b.status,
              link: b.trip ? `/trips/${b.trip.id}` : '/my-trips'
            });
          });

          activeRides.forEach(r => {
            const pickup = r.pickup_name || r.pickupName || '—';
            const dest = r.destination_name || r.destinationName || '—';
            const time = r.departure_time || r.departureTime;
            tripsList.push({
              id: r.id,
              type: 'driver',
              rideId: r.id,
              route: `${pickup} → ${dest}`,
              time,
              fare: r.fare_per_seat || r.farePerSeat,
              status: r.ride_status || r.rideStatus,
              link: '/my-rides'
            });
          });

          // Sort trips by time ascending (earliest first), guard against null times
          tripsList.sort((a, b) => new Date(a.time || 0) - new Date(b.time || 0));
          if (tripsList.length > 0) {
            imminent = tripsList[0];
          }
        } catch (e) {
          console.error("Trips fetching error:", e.message);
        }

        setUpcomingTrip(imminent);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <PageShell 
      eyebrow="Home" 
      title={`Good morning, ${user?.name || 'teammate'}`} 
      description="Plan a greener commute, review upcoming rides, and keep your saved places close."
    >
      {user?.role === 'ADMIN' && (
        <div className="mb-6 p-4 rounded-3xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center gap-3">
          <ShieldAlert className="h-6 w-6 text-amber-700 shrink-0" />
          <div>
            <p className="font-bold">Administrator Panel Active</p>
            <p className="text-sm text-amber-800">You can monitor system activities, manage user statuses and review carpool metrics. <Link to="/reports" className="font-bold underline text-amber-950">Go to Admin Reports</Link></p>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Link to="/find-ride">
          <Card hover className="flex min-h-64 flex-col justify-between overflow-hidden bg-white p-6">
            <div className="flex items-start justify-between">
              <div>
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-100 text-emerald-700">
                  <Search className="h-5 w-5" />
                </span>
                <h2 className="mt-5 font-heading text-3xl font-extrabold text-slate-950">Find a Ride</h2>
                <p className="mt-2 text-slate-600">Search verified employee rides for your office route.</p>
              </div>
              <div className="h-36 w-44 shrink-0">
                <PassengerIllustration />
              </div>
            </div>
          </Card>
        </Link>
        <Link to="/offer-ride">
          <Card hover className="flex min-h-64 flex-col justify-between overflow-hidden bg-white p-6">
            <div className="flex items-start justify-between">
              <div>
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-100 text-emerald-700">
                  <Car className="h-5 w-5" />
                </span>
                <h2 className="mt-5 font-heading text-3xl font-extrabold text-slate-950">Offer a Ride</h2>
                <p className="mt-2 text-slate-600">Publish seats, select a vehicle, and share commute costs.</p>
              </div>
              <div className="h-36 w-44 shrink-0">
                <DriverIllustration />
              </div>
            </div>
          </Card>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] mt-6">
        {/* Upcoming Trip Card */}
        <Card className="p-6 flex flex-col justify-between space-y-4 bg-white">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-2xl font-extrabold text-slate-950">Upcoming Trip</h3>
            {upcomingTrip && <Badge variant={upcomingTrip.status === 'ACCEPTED' ? 'success' : 'warning'}>{upcomingTrip.status}</Badge>}
          </div>

          {loading ? (
            <div className="h-28 rounded-3xl bg-[#EAF6EF] flex items-center justify-center animate-pulse">
              <span className="text-emerald-700 font-bold">Refreshing commute schedule...</span>
            </div>
          ) : upcomingTrip ? (
            <>
              <div className="grid gap-4 rounded-3xl bg-[#EAF6EF] p-5 sm:grid-cols-3">
                <div>
                  <p className="text-xs font-bold uppercase text-emerald-700">Route</p>
                  <p className="mt-1 font-bold text-slate-900 truncate">{upcomingTrip.route}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-emerald-700">Time</p>
                  <p className="mt-1 font-bold text-slate-900 truncate">
                    {new Date(upcomingTrip.time).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} at {new Date(upcomingTrip.time).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-emerald-700">Commuter Role</p>
                  <p className="mt-1 font-bold text-slate-900 uppercase">{upcomingTrip.type}</p>
                </div>
              </div>
              <div>
                <Link to={upcomingTrip.link} className="inline-flex font-bold text-emerald-700 hover:text-emerald-800 transition">
                  View trip details & open chat &rarr;
                </Link>
              </div>
            </>
          ) : (
            <div className="rounded-3xl border-2 border-dashed border-slate-200 p-8 text-center bg-slate-50/50">
              <p className="font-bold text-slate-600">No scheduled rides found</p>
              <p className="text-sm text-slate-400 mt-1">Book or publish a ride to see it here.</p>
            </div>
          )}
        </Card>

        {/* Saved Places Card */}
        <Card className="p-6 bg-white space-y-4">
          <h3 className="font-heading text-2xl font-extrabold text-slate-950">Saved Places</h3>
          
          {loading ? (
            <div className="space-y-2 animate-pulse">
              <div className="h-14 bg-slate-100 rounded-2xl" />
              <div className="h-14 bg-slate-100 rounded-2xl" />
            </div>
          ) : places.length > 0 ? (
            <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
              {places.map((place) => {
                const nameText = place.placeName || place.name || 'Location';
                return (
                  <div key={place.id} className="flex gap-3 rounded-2xl border border-emerald-100 p-3 items-center">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-emerald-50 text-emerald-700 shrink-0">
                      {nameText.toLowerCase() === 'home' ? <Home className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                    </span>
                    <div className="overflow-hidden">
                      <p className="font-bold text-slate-900">{nameText}</p>
                      <p className="text-sm text-slate-600 truncate">{place.address}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-slate-100 p-6 text-center text-slate-500">
              <p className="text-sm">You haven't saved any locations yet.</p>
              <Link to="/settings" className="text-sm font-bold text-emerald-700 hover:underline mt-2 inline-block">Configure in Settings</Link>
            </div>
          )}
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 mt-6">
        <Metric icon={CalendarDays} label="Trips this month" value="12" />
        <Metric icon={Users} label="Active poolers" value="84" />
        <Metric icon={MapPin} label="Total CO2 saved" value="48.5 kg" />
      </div>
    </PageShell>
  );
}

function Metric({ icon: Icon, label, value }) {
  return (
    <Card className="flex items-center gap-4 bg-white p-5">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-100 text-emerald-700">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-sm font-bold text-slate-500">{label}</p>
        <p className="font-heading text-2xl font-extrabold text-slate-950">{value}</p>
      </div>
    </Card>
  );
}
