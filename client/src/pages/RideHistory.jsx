import { useState, useEffect } from 'react';
import PageShell from '../components/shared/PageShell.jsx';
import Card from '../components/ui/Card.jsx';
import Badge from '../components/ui/Badge.jsx';
import bookingService from '../services/booking.service.js';
import rideService from '../services/ride.service.js';

export default function RideHistory() {
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setLoading(true);
        const list = [];

        // 1. Fetch passenger bookings
        try {
          const bookings = await bookingService.listBookings();
          bookings.filter(b => b.status === 'COMPLETED' || b.ride.rideStatus === 'Completed').forEach(b => {
            list.push({
              id: `booking_${b.id}`,
              route: `${b.ride.pickupName} to ${b.ride.destinationName}`,
              date: new Date(b.ride.departureTime).toLocaleDateString(),
              role: 'Passenger',
              fare: parseFloat(b.ride.farePerSeat) * b.requestedSeats,
              status: 'Settled',
              rawTime: b.ride.departureTime
            });
          });
        } catch (e) {
          console.error("History bookings error:", e.message);
        }

        // 2. Fetch driver rides
        try {
          const rides = await rideService.getMyRides();
          rides.filter(r => r.ride_status === 'Completed').forEach(r => {
            list.push({
              id: `ride_${r.id}`,
              route: `${r.pickup_name} to ${r.destination_name}`,
              date: new Date(r.departure_time).toLocaleDateString(),
              role: 'Driver',
              fare: r.fare_per_seat,
              status: 'Paid Out',
              rawTime: r.departure_time
            });
          });
        } catch (e) {
          console.error("History rides error:", e.message);
        }

        list.sort((a, b) => new Date(b.rawTime) - new Date(a.rawTime));
        setHistoryItems(list);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  return (
    <PageShell 
      eyebrow="Archive" 
      title="Ride History" 
      description="Completed rides with route, date, and settlement status."
    >
      {loading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-16 bg-slate-100 rounded-2xl" />
          <div className="h-16 bg-slate-100 rounded-2xl" />
        </div>
      ) : historyItems.length > 0 ? (
        <div className="grid gap-4">
          {historyItems.map((item) => (
            <Card key={item.id} className="grid gap-3 md:grid-cols-[1fr_auto_auto] p-5 bg-white border border-slate-100">
              <div>
                <h3 className="font-heading text-xl font-extrabold text-slate-950">{item.route}</h3>
                <p className="text-slate-600 text-sm mt-1">
                  <span className="font-bold text-emerald-800 tracking-wider uppercase text-xs">{item.role}</span> &bull; {item.date}
                </p>
              </div>
              <Badge variant="success">{item.status}</Badge>
              <p className="font-heading text-2xl font-extrabold text-emerald-700">INR {item.fare}</p>
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-[2.5rem] border-2 border-dashed border-slate-200 bg-slate-50/50 p-12 text-center text-slate-400">
          No past completed commutes in your archive records.
        </div>
      )}
    </PageShell>
  );
}
