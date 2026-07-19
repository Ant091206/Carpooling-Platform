import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { ErrorState } from '../../components/ErrorState';
import { Skeleton } from '../../components/Skeleton';
import { carpoolAPI } from '../../services/api';
import { Car, Navigation, Wallet, Leaf, ArrowRight } from 'lucide-react';

export function Dashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [rides, setRides] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const [meRes, ridesRes, bookingsRes, walletRes] = await Promise.all([
          carpoolAPI.me(),
          carpoolAPI.getMyRides(),
          carpoolAPI.getMyBookings(),
          carpoolAPI.getWallet(),
        ]);

        setProfile(meRes.data?.data || meRes.data);
        setRides(ridesRes.data?.data || ridesRes.data || []);
        setBookings(bookingsRes.data?.data || bookingsRes.data || []);
        setWallet(walletRes.data?.data || walletRes.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const activeRidesCount = rides.filter((ride) => ['Published', 'Full', 'Started', 'InProgress'].includes(ride.status)).length;
  const upcomingTripsCount = bookings.filter((booking) => ['Requested', 'Accepted', 'Booked', 'Started', 'InProgress'].includes(booking.status)).length;
  const completedTripsCount = bookings.filter((booking) => booking.status === 'Completed').length;
  const upcomingBooking = bookings.find((booking) => ['Requested', 'Accepted', 'Booked'].includes(booking.status));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Good morning{profile?.first_name ? `, ${profile.first_name}` : ''}
          </h1>
          <p className="text-slate-500">Here's your carpooling overview for today.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2" onClick={() => navigate('/find-ride')}>
            <Navigation className="w-4 h-4" />
            Find Ride
          </Button>
          <Button className="gap-2" onClick={() => navigate('/offer-ride')}>
            <Car className="w-4 h-4" />
            Offer Ride
          </Button>
        </div>
      </div>

      {error && (
        <Card>
          <ErrorState message={error} onRetry={() => window.location.reload()} />
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Rides" value={loading ? <Skeleton className="h-7 w-20" /> : activeRidesCount} icon={Car} trend="Live" />
        <StatCard title="Upcoming Trips" value={loading ? <Skeleton className="h-7 w-20" /> : upcomingTripsCount} icon={Navigation} trend="Today" />
        <StatCard title="Wallet Balance" value={loading ? <Skeleton className="h-7 w-20" /> : `₹${wallet?.balance?.toFixed(2) || '0.00'}`} icon={Wallet} trend="Available" />
        <StatCard title="Completed Trips" value={loading ? <Skeleton className="h-7 w-20" /> : completedTripsCount} icon={Leaf} trend="Done" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <Card className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Upcoming Ride</h2>
            <button
              type="button"
              onClick={() => navigate(upcomingBooking ? `/trips/${upcomingBooking.id}` : '/find-ride')}
              className="text-sm text-primary-600 font-medium hover:text-primary-700 flex items-center gap-1"
            >
              {upcomingBooking ? 'View details' : 'Find a ride'} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 flex items-center justify-between border border-slate-100">
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
                {upcomingBooking?.ride?.driver_name?.slice(0, 2).toUpperCase() || 'DR'}
              </div>
              <div>
                <h3 className="font-medium text-slate-900">
                  {upcomingBooking?.ride?.pickup_name || 'No upcoming ride'}
                  {' → '}
                  {upcomingBooking?.ride?.destination_name || 'Search now'}
                </h3>
                <p className="text-sm text-slate-500">
                  {upcomingBooking?.ride?.departure_time
                    ? new Date(upcomingBooking.ride.departure_time).toLocaleString([], {
                        weekday: 'long', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                      })
                    : 'No ride scheduled'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-slate-900">
                {upcomingBooking ? (upcomingBooking.status || 'Confirmed') : 'No ride'}
              </div>
              <div className="text-sm text-slate-500">
                {upcomingBooking?.ride?.vehicle_model || 'Vehicle info unavailable'}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Wallet Balance</h2>
          <div className="text-3xl font-bold text-slate-900 mb-2">
            {loading ? <Skeleton className="h-10 w-36" /> : `₹${wallet?.balance?.toFixed(2) || '0.00'}`}
          </div>
          <p className="text-sm text-slate-500 mb-4">Available for your next rides</p>
          <Button fullWidth variant="outline" onClick={() => navigate('/wallet')}>
            Top Up Wallet
          </Button>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend }) {
  return (
    <Card className="flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 rounded-lg bg-primary-50 text-primary-600">
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
          {trend}
        </span>
      </div>
      <div>
        <h3 className="text-sm font-medium text-slate-500">{title}</h3>
        <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
      </div>
    </Card>
  );
}
