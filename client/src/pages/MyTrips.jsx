import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Car, Clock, ShieldCheck, User, Users, Wallet } from 'lucide-react';
import PageShell from '../components/shared/PageShell.jsx';
import Card from '../components/ui/Card.jsx';
import Badge from '../components/ui/Badge.jsx';
import Button from '../components/ui/Button.jsx';
import tripService from '../services/trip.service.js';
import toast from 'react-hot-toast';

const statusBadgeVariant = {
  'BOOKED': 'warning',
  'ACCEPTED': 'success',
  'STARTED': 'primary',
  'IN_PROGRESS': 'info',
  'COMPLETED': 'success',
  'CANCELLED': 'danger'
};

export default function MyTrips() {
  const [activeTab, setActiveTab] = useState('all');
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      let list = [];
      
      if (activeTab === 'all') {
        // Fetch all passenger trips + driver trips and merge them
        const [passengerTrips, driverTrips] = await Promise.all([
          tripService.getPassengerTrips(),
          tripService.getDriverTrips()
        ]);
        
        list = [
          ...passengerTrips.map(t => ({ ...t, role: 'Passenger' })),
          ...driverTrips.map(t => ({ ...t, role: 'Driver' }))
        ];
      } else if (activeTab === 'upcoming') {
        const upcoming = await tripService.getUpcomingTrips();
        list = upcoming.map(t => ({ ...t, role: 'Passenger' }));
      } else if (activeTab === 'ongoing') {
        const ongoing = await tripService.getOngoingTrips();
        list = ongoing.map(t => ({ ...t, role: 'Passenger' }));
      } else if (activeTab === 'completed') {
        const completed = await tripService.getCompletedTrips();
        list = completed.map(t => ({ ...t, role: 'Passenger' }));
      } else if (activeTab === 'driver') {
        const driver = await tripService.getDriverTrips();
        list = driver.map(t => ({ ...t, role: 'Driver' }));
      }

      // Sort by newest departure time first
      list.sort((a, b) => new Date(b.ride.departureTime) - new Date(a.ride.departureTime));
      setTrips(list);
    } catch (e) {
      toast.error('Failed to load trips.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, [activeTab]);

  const tabs = [
    { id: 'all', label: 'All Trips' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'ongoing', label: 'Ongoing' },
    { id: 'completed', label: 'Completed' },
    { id: 'driver', label: 'Driver Trips' }
  ];

  return (
    <PageShell 
      eyebrow="Trips" 
      title="My Trips" 
      description="Track booked, active, completed, and payment-pending carpool trips."
    >
      {/* Premium Tab Bar */}
      <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-4 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-full px-5 py-2.5 text-sm font-bold transition-all duration-300 ${
              activeTab === tab.id
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/10 scale-[1.02]'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="h-40 bg-slate-100 rounded-3xl animate-pulse" />
          <div className="h-40 bg-slate-100 rounded-3xl animate-pulse" />
        </div>
      ) : trips.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
          {trips.map((trip) => {
            const departure = new Date(trip.ride.departureTime);
            const bookingDate = new Date(trip.booking.bookingDate);
            const seats = trip.booking.requestedSeats;
            const fare = parseFloat(trip.ride.farePerSeat) * seats;
            
            return (
              <Card key={trip.id} hover className="overflow-hidden bg-white border border-slate-100 rounded-3xl flex flex-col justify-between">
                <div className="p-6">
                  {/* Top Bar of Trip Card */}
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                        trip.role === 'Driver' ? 'bg-indigo-55 bg-indigo-50 text-indigo-700' : 'bg-emerald-50 text-emerald-800'
                      }`}>
                        {trip.role}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        Booked: {bookingDate.toLocaleDateString()}
                      </span>
                    </div>
                    <Badge variant={statusBadgeVariant[trip.status] || 'warning'}>
                      {trip.status}
                    </Badge>
                  </div>

                  {/* Route & Details */}
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-heading text-lg font-extrabold text-slate-900 leading-tight">
                        {trip.ride.pickupName}
                      </h3>
                      <div className="w-0.5 h-3 bg-slate-200 my-1 ml-2.5" />
                      <h3 className="font-heading text-lg font-extrabold text-slate-900 leading-tight">
                        {trip.ride.destinationName}
                      </h3>
                    </div>

                    <hr className="border-slate-100 my-4" />

                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                      {/* Driver/Passenger Info */}
                      <div className="flex items-start gap-2.5">
                        <User className="h-4.5 w-4.5 text-slate-400 mt-0.5" />
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            {trip.role === 'Driver' ? 'Passenger' : 'Driver'}
                          </p>
                          <p className="text-sm font-bold text-slate-800 truncate">
                            {trip.role === 'Driver' ? trip.passenger.name : trip.driver.name}
                          </p>
                        </div>
                      </div>

                      {/* Vehicle Info */}
                      <div className="flex items-start gap-2.5">
                        <Car className="h-4.5 w-4.5 text-slate-400 mt-0.5" />
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Vehicle</p>
                          <p className="text-sm font-bold text-slate-800 truncate">
                            {trip.role === 'Driver' ? 'Your Vehicle' : (trip.ride.vehicle?.model || 'Shared Car')}
                          </p>
                        </div>
                      </div>

                      {/* Departure Info */}
                      <div className="flex items-start gap-2.5">
                        <Calendar className="h-4.5 w-4.5 text-slate-400 mt-0.5" />
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Departure</p>
                          <p className="text-sm font-bold text-slate-800">
                            {departure.toLocaleDateString()}
                          </p>
                          <p className="text-xs text-slate-500 font-semibold mt-0.5 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {departure.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>

                      {/* Seats & Cost */}
                      <div className="flex items-start gap-2.5">
                        <Users className="h-4.5 w-4.5 text-slate-400 mt-0.5" />
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Seats Booked</p>
                          <p className="text-sm font-bold text-slate-800">
                            {seats} {seats === 1 ? 'Seat' : 'Seats'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Bar: Action & Fare */}
                <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-1.5 text-emerald-800">
                    <Wallet className="h-4 w-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-500">Total Fare:</span>
                    <span className="text-lg font-extrabold text-emerald-700">
                      INR {fare.toFixed(2)}
                    </span>
                  </div>

                  <Link to={`/trips/${trip.id}`}>
                    <Button variant="secondary" size="sm">
                      View details
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="rounded-[2.5rem] border-2 border-dashed border-slate-200 bg-slate-50/50 p-16 text-center">
          <p className="font-bold text-slate-600 text-lg">No commutes found</p>
          <p className="text-sm text-slate-400 mt-1 max-w-xs mx-auto">
            You don't have any trips registered under this category.
          </p>
          <div className="flex gap-4 justify-center mt-6">
            <Link to="/find-ride"><Button size="md">Find a Ride</Button></Link>
            <Link to="/offer-ride"><Button variant="secondary" size="md">Offer a Ride</Button></Link>
          </div>
        </div>
      )}
    </PageShell>
  );
}

