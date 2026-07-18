import { useState, useEffect } from 'react';
import { Car, Fuel, IndianRupee, Route, Users, ShieldCheck, UserCheck, UserMinus, AlertTriangle, Settings, BarChart3, Database } from 'lucide-react';
import PageShell from '../components/shared/PageShell.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Badge from '../components/ui/Badge.jsx';
import Input from '../components/ui/Input.jsx';
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

  // Admin Data states
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [ridesList, setRidesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('metrics'); // metrics, users, rides, config

  // Cost configurations states (stored locally to persist administrative selections)
  const [fuelMultiplier, setFuelMultiplier] = useState(1.2);
  const [travelRate, setTravelRate] = useState(12);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const dashboardStats = await adminService.getDashboardStats();
      setStats(dashboardStats);

      const users = await adminService.getUsers();
      setUsersList(users);

      const rides = await adminService.getRides();
      setRidesList(rides);

      // Load config variables
      const savedFuel = localStorage.getItem('admin_fuel_multiplier');
      const savedRate = localStorage.getItem('admin_travel_rate_per_km');
      if (savedFuel) setFuelMultiplier(parseFloat(savedFuel));
      if (savedRate) setTravelRate(parseFloat(savedRate));
    } catch (e) {
      toast.error('Failed to query system records.');
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
      toast.success(`User access set to ${nextStatus}.`);
      loadAdminData();
    } catch (e) {
      toast.error('Failed to change commuter permissions.');
    }
  };

  const handleAdminCancelRide = async (rideId) => {
    if (!window.confirm('Cancel this ride? This action will refund all booked seats.')) return;
    try {
      await adminService.cancelRide(rideId);
      toast.success('Commute cancelled successfully.');
      loadAdminData();
    } catch (e) {
      toast.error('Failed to cancel ride.');
    }
  };

  const handleSaveConfig = (e) => {
    e.preventDefault();
    localStorage.setItem('admin_fuel_multiplier', String(fuelMultiplier));
    localStorage.setItem('admin_travel_rate_per_km', String(travelRate));
    toast.success('Corporate cost variables updated successfully!');
  };

  const maxTrips = Math.max(...analyticsMock.map((item) => item.trips));

  if (loading) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" />
      </div>
    );
  }

  // --- ADMIN COMPONENT ---
  if (isAdmin) {
    return (
      <PageShell 
        eyebrow="Admin Center" 
        title="Corporate Control Center" 
        description="Verify employees, audit rides logs, configure cost limits, and track metrics."
      >
        {/* Navigation tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-3 mb-6">
          <button 
            onClick={() => setActiveTab('metrics')} 
            className={`font-bold text-sm px-5 py-2.5 rounded-full transition ${activeTab === 'metrics' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            Commuting Metrics
          </button>
          <button 
            onClick={() => setActiveTab('users')} 
            className={`font-bold text-sm px-5 py-2.5 rounded-full transition ${activeTab === 'users' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            Employee Verification ({usersList.length})
          </button>
          <button 
            onClick={() => setActiveTab('rides')} 
            className={`font-bold text-sm px-5 py-2.5 rounded-full transition ${activeTab === 'rides' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            Ride Monitoring ({ridesList.length})
          </button>
          <button 
            onClick={() => setActiveTab('config')} 
            className={`font-bold text-sm px-5 py-2.5 rounded-full transition ${activeTab === 'config' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            Cost Configuration
          </button>
        </div>

        {/* METRICS VIEW */}
        {activeTab === 'metrics' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Metric icon={Users} label="Verified Employees" value={stats?.totalUsers || 0} />
              <Metric icon={Car} label="Active Carpools" value={stats?.totalRides || 0} />
              <Metric icon={ShieldCheck} label="Settled Bookings" value={stats?.totalBookings || 0} />
              <Metric icon={Route} label="Monitored Workspace Orgs" value={stats?.totalOrgs || 0} />
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
              <Card className="p-6 bg-white border border-slate-50 shadow-sm rounded-[2rem]">
                <h3 className="font-heading text-xl font-extrabold text-slate-950 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-emerald-700" /> Commuting Trip Volume Trend
                </h3>
                <div className="mt-8 flex h-72 items-end gap-4">
                  {analyticsMock.map((item) => (
                    <div key={item.label} className="flex flex-1 flex-col items-center gap-3">
                      <div className="w-full rounded-t-2xl bg-emerald-600 hover:bg-emerald-700 transition" style={{ height: `${(item.trips / maxTrips) * 200}px` }} />
                      <span className="text-xs font-bold text-slate-600">{item.label}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6 bg-white border border-slate-50 shadow-sm rounded-[2rem] space-y-4">
                <h3 className="font-heading text-xl font-extrabold text-slate-950 flex items-center gap-2">
                  <Database className="h-5 w-5 text-emerald-700" /> Recent Carpools Log
                </h3>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {stats?.recentRides?.slice(0, 5).map((ride) => (
                    <div key={ride.id} className="flex flex-col border border-slate-100 p-3.5 rounded-2xl bg-slate-50/50">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-slate-500">Host: {ride.driver.name}</span>
                        <Badge variant="success">{ride.rideStatus}</Badge>
                      </div>
                      <p className="font-bold text-sm text-slate-900 mt-2 truncate">{ride.pickupName} &rarr; {ride.destinationName}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* EMPLOYEE VERIFICATION / MANAGEMENT */}
        {activeTab === 'users' && (
          <Card className="p-6 bg-white border border-slate-50 shadow-sm rounded-[2rem] animate-fadeIn">
            <h3 className="font-heading text-2xl font-extrabold text-slate-950 mb-4">Commuter Directories & Access Toggles</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <th className="pb-3 font-semibold">Commuter</th>
                    <th className="pb-3 font-semibold">Contact Email</th>
                    <th className="pb-3 font-semibold">Employee ID</th>
                    <th className="pb-3 font-semibold">Workspace</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Access Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {usersList.map((usr) => (
                    <tr key={usr.id} className="hover:bg-slate-50/50">
                      <td className="py-4 font-bold text-slate-900 flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                          {usr.name[0]}
                        </div>
                        {usr.name}
                      </td>
                      <td className="py-4">{usr.email}</td>
                      <td className="py-4 font-bold text-slate-600">{usr.employeeId || 'EMP-113'}</td>
                      <td className="py-4 font-bold text-xs text-emerald-800">{usr.organization?.name || 'TCS Corp'}</td>
                      <td className="py-4">
                        <Badge variant={usr.status === 'ACTIVE' ? 'success' : 'danger'}>{usr.status}</Badge>
                      </td>
                      <td className="py-4 text-right">
                        {usr.id !== user.id ? (
                          <Button 
                            variant={usr.status === 'ACTIVE' ? 'danger' : 'success'} 
                            size="sm"
                            onClick={() => handleToggleUserStatus(usr.id, usr.status)}
                          >
                            {usr.status === 'ACTIVE' ? 'Block Access' : 'Verify Account'}
                          </Button>
                        ) : (
                          <span className="text-xs text-slate-400 font-semibold italic">Root Administrator</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* RIDE MONITORING */}
        {activeTab === 'rides' && (
          <Card className="p-6 bg-white border border-slate-50 shadow-sm rounded-[2rem] animate-fadeIn">
            <h3 className="font-heading text-2xl font-extrabold text-slate-950 mb-4">Workspace Ride Monitoring Board</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <th className="pb-3 font-semibold">Commute Route</th>
                    <th className="pb-3 font-semibold">Host Employee</th>
                    <th className="pb-3 font-semibold">Departure</th>
                    <th className="pb-3 font-semibold">Remaining Seats</th>
                    <th className="pb-3 font-semibold">Commute Status</th>
                    <th className="pb-3 font-semibold text-right">Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {ridesList.map((ride) => (
                    <tr key={ride.id} className="hover:bg-slate-50/50">
                      <td className="py-4 font-bold text-slate-900">{ride.pickupName} &rarr; {ride.destinationName}</td>
                      <td className="py-4">{ride.driver.name}</td>
                      <td className="py-4 text-xs font-semibold">{new Date(ride.departureTime).toLocaleString()}</td>
                      <td className="py-4 font-bold">{ride.availableSeats} Seats</td>
                      <td className="py-4">
                        <Badge variant={ride.rideStatus === 'Cancelled' ? 'danger' : ride.rideStatus === 'Completed' ? 'success' : 'warning'}>{ride.rideStatus}</Badge>
                      </td>
                      <td className="py-4 text-right">
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

        {/* FUEL & TRAVEL COST CONFIGURATION */}
        {activeTab === 'config' && (
          <Card className="p-6 bg-white border border-slate-50 shadow-sm rounded-[2rem] max-w-xl animate-fadeIn">
            <h3 className="font-heading text-2xl font-extrabold text-slate-950 flex items-center gap-2">
              <Settings className="h-6 w-6 text-emerald-700" /> Commuting Costs & Settings
            </h3>
            <p className="text-slate-500 text-sm mt-1 leading-normal">
              Define standard corporate multipliers for fuel adjustments and travel reimbursement rates per kilometer.
            </p>

            <form onSubmit={handleSaveConfig} className="space-y-4 mt-6">
              <Input 
                icon={Fuel}
                label="Fuel Cost Adjustment Multiplier"
                type="number"
                step="0.05"
                placeholder="1.20"
                value={fuelMultiplier}
                onChange={(e) => setFuelMultiplier(parseFloat(e.target.value))}
              />
              <Input 
                icon={IndianRupee}
                label="Travel Rate per Kilometer (INR)"
                type="number"
                placeholder="12"
                value={travelRate}
                onChange={(e) => setTravelRate(parseInt(e.target.value, 10))}
              />

              <div className="rounded-2xl bg-amber-50 p-4 border border-amber-100 flex gap-2 text-xs font-bold text-amber-800 mt-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-700" />
                <span>Adjusting cost settings will update future published seat costs for tcs.com employees.</span>
              </div>

              <Button type="submit" className="w-full mt-4" size="lg">Save Settings</Button>
            </form>
          </Card>
        )}
      </PageShell>
    );
  }

  // --- EMPLOYEE ANALYTICS VIEW ---
  return (
    <PageShell 
      eyebrow="Analytics" 
      title="Commute Efficiency Reports" 
      description="View commute distance metrics and carbon offsets for your workspace."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric icon={Car} label="Total rides shared" value="12" />
        <Metric icon={Route} label="Commuting Distance" value="175 km" />
        <Metric icon={Fuel} label="Estimated Fuel Saved" value="INR 2,100" />
        <Metric icon={IndianRupee} label="Average Commute Cost/km" value="INR 6.80" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr] mt-6">
        <Card className="p-6 bg-white border border-slate-50 shadow-sm rounded-[2.5rem]">
          <h3 className="font-heading text-2xl font-extrabold text-slate-950">Trips Volume Distribution</h3>
          <div className="mt-8 flex h-72 items-end gap-4">
            {analyticsMock.map((item) => (
              <div key={item.label} className="flex flex-1 flex-col items-center gap-3">
                <div className="w-full rounded-t-2xl bg-emerald-600" style={{ height: `${(item.trips / maxTrips) * 200}px` }} />
                <span className="text-xs font-bold text-slate-600">{item.label}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 bg-white border border-slate-50 shadow-sm rounded-[2.5rem] space-y-4">
          <h3 className="font-heading text-2xl font-extrabold text-slate-950">Carbon Emission Reductions</h3>
          <div className="space-y-4 pt-2">
            {analyticsMock.map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-600">
                  <span>{item.label}</span>
                  <span>{(item.distance * 0.2).toFixed(1)} kg CO2 Offset</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-emerald-600 animate-slideWidth" style={{ width: `${Math.min(100, item.distance / 2.2)}%` }} />
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
    <Card className="p-5 bg-white border border-slate-100 hover:border-emerald-100 transition shadow-sm rounded-2xl flex gap-3.5 items-center">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-700 shrink-0">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-xs font-bold uppercase text-slate-500 tracking-wider">{label}</p>
        <p className="font-heading text-2xl font-extrabold text-slate-950 mt-0.5">{value}</p>
      </div>
    </Card>
  );
}
