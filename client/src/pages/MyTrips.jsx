import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../components/shared/PageShell.jsx';
import Card from '../components/ui/Card.jsx';
import Badge from '../components/ui/Badge.jsx';
import Button from '../components/ui/Button.jsx';
import bookingService from '../services/booking.service.js';
import rideService from '../services/ride.service.js';

const statusBadgeVariant = {
  // Booking statuses
  'PENDING': 'warning',
  'ACCEPTED': 'success',
  'REJECTED': 'danger',
  'CANCELLED': 'danger',
  
  // Ride statuses
  'Scheduled': 'warning',
  'Started': 'success',
  'In Progress': 'success',
  'Completed': 'success',
  'Cancelled': 'danger'
};

export default function MyTrips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMyTrips = async () => {
      try {
        setLoading(true);
        const tripsList = [];

        // 1. Fetch passenger bookings
        try {
          const bookings = await bookingService.listBookings();
          bookings.forEach(b => {
            tripsList.push({
              id: `booking_${b.id}`,
              tripId: b.rideId, // We link to the ride detail page!
              route: `${b.ride.pickupName} to ${b.ride.destinationName}`,
              role: 'Passenger',
              date: new Date(b.ride.departureTime).toLocaleDateString(),
              time: new Date(b.ride.departureTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
              vehicle: b.driver.name,
              fare: parseFloat(b.ride.farePerSeat) * b.requestedSeats,
              status: b.status,
              rawTime: b.ride.departureTime
            });
          });
        } catch (e) {
          console.error("Passenger bookings fetch failed:", e.message);
        }

        // 2. Fetch driver rides
        try {
          const rides = await rideService.getMyRides();
          rides.forEach(r => {
            tripsList.push({
              id: `ride_${r.id}`,
              tripId: r.id,
              route: `${r.pickup_name} to ${r.destination_name}`,
              role: 'Driver',
              date: new Date(r.departure_time).toLocaleDateString(),
              time: new Date(r.departure_time).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
              vehicle: r.vehicle_model || 'Your Vehicle',
              fare: r.fare_per_seat,
              status: r.ride_status,
              rawTime: r.departure_time
            });
          });
        } catch (e) {
          console.error("Driver rides fetch failed:", e.message);
        }

        // Sort: newest departure time first
        tripsList.sort((a, b) => new Date(b.rawTime) - new Date(a.rawTime));
        setTrips(tripsList);
      } finally {
        setLoading(false);
      }
    };

    loadMyTrips();
  }, []);

  return (
    <PageShell 
      eyebrow="Trips" 
      title="My Trips" 
      description="Track booked, active, completed, and payment-pending carpool trips."
    >
      {loading ? (
        <div className="space-y-4">
          <div className="h-20 bg-slate-100 rounded-3xl animate-pulse" />
          <div className="h-20 bg-slate-100 rounded-3xl animate-pulse" />
        </div>
      ) : trips.length > 0 ? (
        <div className="grid gap-5">
          {trips.map((trip) => (
            <Link key={trip.id} to={`/trips/${trip.tripId}`}>
              <Card hover className="grid gap-4 md:grid-cols-[1fr_auto] p-5 bg-white border border-slate-100">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="font-heading text-xl font-extrabold text-slate-950">{trip.route}</h3>
                    <Badge variant={statusBadgeVariant[trip.status] || 'warning'}>{trip.status}</Badge>
                  </div>
                  <p className="mt-2 text-slate-600 text-sm font-medium">
                    <span className="font-bold text-emerald-800 uppercase tracking-wider">{trip.role}</span> &bull; {trip.date} at {trip.time} &bull; {trip.role === 'Passenger' ? `Driver: ${trip.vehicle}` : `Vehicle: ${trip.vehicle}`}
                  </p>
                </div>
                <div className="flex items-center">
                  <p className="font-heading text-2xl font-extrabold text-emerald-700">
                    INR {trip.fare}
                  </p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-[2.5rem] border-2 border-dashed border-slate-200 bg-slate-50/50 p-16 text-center">
          <p className="font-bold text-slate-600 text-lg">No commutes scheduled</p>
          <p className="text-sm text-slate-400 mt-1 max-w-xs mx-auto">Explore carpools around your workspace or offer seats to share costs.</p>
          <div className="flex gap-4 justify-center mt-6">
            <Link to="/find-ride"><Button size="md">Find a Ride</Button></Link>
            <Link to="/offer-ride"><Button variant="secondary" size="md">Offer a Ride</Button></Link>
          </div>
        </div>
      )}
    </PageShell>
  );
}
