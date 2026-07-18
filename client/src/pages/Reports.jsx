import { useState, useEffect } from 'react';
import { Car, Fuel, IndianRupee, Route, Users, ShieldCheck, UserCheck, UserMinus, AlertTriangle } from 'lucide-react';
import PageShell from '../components/shared/PageShell.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Badge from '../components/ui/Badge.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import adminService from '../services/admin.service.js';
import toast from 'react-hot-toast';

const analyticsMock = [
  { label: 'Mon', trips: 14, distance: 110 },
  { label: 'Tue', trips: 18, distance: 145 },
  { label: 'Wed', trips: 22, distance: 180 },
  { label: 'Thu', trips: 16, distance: 130 },
  { label: 'Fri', trips: 25, distance: 210 },
  { label: 'Sat', trips: 5, distance: 40 },
  { label: 'Sun', trips: 2, distance: 15 }
];

export default function Reports() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  // Admin states
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [ridesList, setRidesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('metrics'); // metrics, users, rides

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const dashboardStats = await adminService.getDashboardStats();
      setStats(dashboardStats);

      const users = await adminService.getUsers();
      setUsersList(users);

      const rides = await adminService.getRides();
      setRidesList(rides);
    } catch (e) {
      toast.error('Failed to load administrative analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  const handleToggleUserStatus = async (userId, currentStatus) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await adminService.updateUserStatus(userId, nextStatus);
      toast.success(`User account status updated to ${nextStatus}.`);
      loadAdminData();
    } catch (e) {
      toast.error('Failed to update user status.');
    }
  };

  const handleAdminCancelRide = async (rideId) => {
    if (!window.confirm('Are you sure you want to cancel this ride? All accepted bookings will be invalidated.')) return;
    try {
      await adminService.cancelRide(rideId);
      toast.success('Ride cancelled by administrator.');
      loadAdminData();
    } catch (e) {
      toast.error('Failed to override ride status.');
    }
  };

  const maxTrips = Math.max(...analyticsMock.map((item) => item.trips));

  if (loading) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" />
      </div>
    );
  }

  // --- ADMIN INTERFACE ---
  if (isAdmin) {
    return (
      <PageShell 
        eyebrow="Admin Center" 
        title="Admin Control & Reports" 
        description="Monitor corporate platform metrics, approve accounts, and view ride logs."
      >
        <div className="flex gap-4 border-b border-slate-100 pb-3 mb-6">
          <button 
            onClick={() => setActiveTab('metrics')} 
            className={`font-bold text-sm px-4 py-2 rounded-full transition ${activeTab === 'metrics' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            System Metrics
          </button>
          <button 
            onClick={() => setActiveTab('users')} 
            className={`font-bold text-sm px-4 py-2 rounded-full transition ${activeTab === 'users' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            Manage Users ({usersList.length})
          </button>
          <button 
            onClick={() => setActiveTab('rides')} 
            className={`font-bold text-sm px-4 py-2 rounded-full transition ${activeTab === 'rides' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            Manage Rides ({ridesList.length})
          </button>
        </div>

        {activeTab === 'metrics' && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Metric icon={Users} label="Total Commuters" value={stats?.totalUsers || 0} />
              <Metric icon={Car} label="Published Rides" value={stats?.totalRides || 0} />
              <Metric icon={ShieldCheck} label="Bookings count" value={stats?.totalBookings || 0} />
              <Metric icon={Route} label="Corporate Organizations" value={stats?.totalOrgs || 0} />
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
              <Card className="p-6 bg-white">
                <h3 className="font-heading text-2xl font-extrabold text-slate-950">Active Commutes Volume</h3>
                <div className="mt-8 flex h-72 items-end gap-4">
                  {analyticsMock.map((item) => (
                    <div key={item.label} className="flex flex-1 flex-col items-center gap-3">
                      <div className="w-full rounded-t-3xl bg-emerald-500" style={{ height: `${(item.trips / maxTrips) * 220}px` }} />
                      <span className="text-sm font-bold text-slate-600">{item.label}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6 bg-white space-y-4">
                <h3 className="font-heading text-2xl font-extrabold text-slate-950">Recent Platform Rides</h3>
                <div className="space-y-3">
                  {stats?.recentRides?.map((ride) => (
                    <div key={ride.id} className="flex flex-col border border-emerald-100 p-3 rounded-2xl">
                      <div className="flex justify-between items-center text-xs font-bold text-emerald-800">
                        <span>Driver: {ride.driver.name}</span>
                        <Badge variant="warning">{ride.rideStatus}</Badge>
                      </div>
                      <p className="font-bold text-sm text-slate-900 mt-1">{ride.pickupName} &rarr; {ride.destinationName}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <Card className="p-6 bg-white">
            <h3 className="font-heading text-2xl font-extrabold text-slate-950 mb-4">Corporate Commuters Management</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <th className="pb-3 font-semibold">Name</th>
                    <th className="pb-3 font-semibold">Email</th>
                    <th className="pb-3 font-semibold">Org</th>
                    <th className="pb-3 font-semibold">Role</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {usersList.map((usr) => (
                    <tr key={usr.id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 font-bold text-slate-900">{usr.name}</td>
                      <td className="py-3.5">{usr.email}</td>
                      <td className="py-3.5 font-semibold text-xs text-emerald-800">{usr.organization?.name || 'Google Corp'}</td>
                      <td className="py-3.5 font-bold text-xs uppercase text-slate-500">{usr.role}</td>
                      <td className="py-3.5">
                        <Badge variant={usr.status === 'ACTIVE' ? 'success' : 'danger'}>{usr.status}</Badge>
                      </td>
                      <td className="py-3.5 text-right">
                        {usr.id !== user.id ? (
                          <Button 
                            variant={usr.status === 'ACTIVE' ? 'danger' : 'success'} 
                            size="sm"
                            onClick={() => handleToggleUserStatus(usr.id, usr.status)}
                          >
                            {usr.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                          </Button>
                        ) : (
                          <span className="text-xs text-slate-400 font-semibold italic">Current Admin</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {activeTab === 'rides' && (
          <Card className="p-6 bg-white">
            <h3 className="font-heading text-2xl font-extrabold text-slate-950 mb-4">Commute Rides Audit Logs</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <th className="pb-3 font-semibold">Route</th>
                    <th className="pb-3 font-semibold">Driver</th>
                    <th className="pb-3 font-semibold">Time</th>
                    <th className="pb-3 font-semibold">Seats</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {ridesList.map((ride) => (
                    <tr key={ride.id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 font-bold text-slate-900">{ride.pickupName} to {ride.destinationName}</td>
                      <td className="py-3.5">{ride.driver.name}</td>
                      <td className="py-3.5 text-xs font-semibold">{new Date(ride.departureTime).toLocaleString()}</td>
                      <td className="py-3.5 font-bold">{ride.availableSeats} Left</td>
                      <td className="py-3.5">
                        <Badge variant={ride.rideStatus === 'Cancelled' ? 'danger' : ride.rideStatus === 'Completed' ? 'success' : 'warning'}>{ride.rideStatus}</Badge>
                      </td>
                      <td className="py-3.5 text-right">
                        {ride.rideStatus === 'Scheduled' && (
                          <Button 
                            variant="danger" 
                            size="sm"
                            onClick={() => handleAdminCancelRide(ride.id)}
                          >
                            Cancel Ride
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </PageShell>
    );
  }

  // --- EMPLOYEE INTERFACE (COMMUTE ANALYTICS) ---
  return (
    <PageShell 
      eyebrow="Analytics" 
      title="Commute Reports" 
      description="Operational view of trips, distance, carbon footprint, and savings."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric icon={Car} label="Total commutes" value="12" />
        <Metric icon={Route} label="Commute Distance" value="175 km" />
        <Metric icon={Fuel} label="Fuel cost saved" value="INR 2,100" />
        <Metric icon={IndianRupee} label="Avg Cost/km" value="INR 6.80" />
      </div>
      
      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr] mt-6">
        <Card className="p-6 bg-white">
          <h3 className="font-heading text-2xl font-extrabold text-slate-950">Weekly Commutes Vol.</h3>
          <div className="mt-8 flex h-72 items-end gap-4">
            {analyticsMock.map((item) => (
              <div key={item.label} className="flex flex-1 flex-col items-center gap-3">
                <div className="w-full rounded-t-3xl bg-emerald-500" style={{ height: `${(item.trips / maxTrips) * 220}px` }} />
                <span className="text-sm font-bold text-slate-600">{item.label}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 bg-white">
          <h3 className="font-heading text-2xl font-extrabold text-slate-950">Carbon Footprint Saved</h3>
          <div className="mt-8 space-y-4">
            {analyticsMock.map((item) => (
              <div key={item.label}>
                <div className="mb-1 flex justify-between text-sm font-bold text-slate-600">
                  <span>{item.label}</span>
                  <span>{(item.distance * 0.2).toFixed(1)} kg CO2</span>
                </div>
                <div className="h-3 rounded-full bg-emerald-100">
                  <div className="h-3 rounded-full bg-emerald-600" style={{ width: `${Math.min(100, item.distance / 2.2)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </PageShell>
  );
}

function Metric({ icon: Icon, label, value }) {
  return (
    <Card className="p-5 bg-white border border-slate-100">
      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-100 text-emerald-700">
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-5 text-sm font-bold text-slate-500">{label}</p>
      <p className="font-heading text-2xl font-extrabold text-slate-950 mt-1">{value}</p>
    </Card>
  );
}
