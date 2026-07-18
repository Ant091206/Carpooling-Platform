import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Car,
  Fuel,
  IndianRupee,
  Route,
  Users,
  ShieldCheck,
  UserCheck,
  AlertTriangle,
  Settings,
  BarChart3,
  Database,
  FileDown,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  Award,
  BookOpen
} from 'lucide-react';
import PageShell from '../components/shared/PageShell.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Badge from '../components/ui/Badge.jsx';
import Input from '../components/ui/Input.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import adminService from '../services/admin.service.js';
import axios from 'axios';
import toast from 'react-hot-toast';
import ReportTable from '../components/ui/ReportTable.jsx';
import SummaryCard from '../components/ui/SummaryCard.jsx';
import ExportModal from '../components/ui/ExportModal.jsx';

export default function Reports() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'ADMIN';

  // State
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [ridesList, setRidesList] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('metrics'); // metrics, reports, users, rides, config
  
  // Cost Settings
  const [fuelMultiplier, setFuelMultiplier] = useState(1.2);
  const [travelRate, setTravelRate] = useState(12);

  // Modal
  const [exportOpen, setExportOpen] = useState(false);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/reports`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReports(data.data || []);
    } catch (e) {
      console.error('Failed to load reports log:', e.message);
    }
  };

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const dashboardStats = await adminService.getDashboardStats();
      setStats(dashboardStats);

      const users = await adminService.getUsers();
      setUsersList(users);

      const rides = await adminService.getRides();
      setRidesList(rides);

      await fetchReports();

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
      // Standard users only see their reports list & metrics
      fetchReports().finally(() => setLoading(false));
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

  const handleGenerateReportSubmit = async (reportData) => {
    const token = localStorage.getItem('token');
    await axios.post(
      `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/reports/generate`,
      reportData,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    await fetchReports();
  };

  const handleDeleteReport = async (id) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/reports/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Report deleted successfully.');
      await fetchReports();
    } catch (e) {
      toast.error('Failed to delete report.');
    }
  };

  if (loading) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" />
      </div>
    );
  }

  return (
    <PageShell
      eyebrow={isAdmin ? "Admin Center" : "Reports"}
      title={isAdmin ? "Corporate Control & Reports" : "My Exported Reports"}
      description={
        isAdmin
          ? "Generate reports, export platform data, verify employees, and manage rides."
          : "View and download your commute and payment export reports."
      }
      action={
        <div className="flex gap-2">
          <Button icon={TrendingUp} onClick={() => navigate('/analytics')}>
            Analytics Trends
          </Button>
          <Button icon={FileDown} onClick={() => setExportOpen(true)} id="btn-open-export">
            Export Report
          </Button>
        </div>
      }
    >
      {/* Tab Navigation for Admin */}
      {isAdmin && (
        <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-3 mb-6">
          {[
            { id: 'metrics', label: 'Commuting Metrics' },
            { id: 'reports', label: `System Reports (${reports.length})` },
            { id: 'users', label: `Employee Verification (${usersList.length})` },
            { id: 'rides', label: `Ride Monitoring (${ridesList.length})` },
            { id: 'config', label: 'Cost Configuration' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`font-bold text-sm px-5 py-2.5 rounded-full transition ${
                activeTab === tab.id
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* METRICS VIEW (Admin only) */}
      {isAdmin && activeTab === 'metrics' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard icon={Users} label="Verified Employees" value={stats?.totalUsers || 0} color="emerald" />
            <SummaryCard icon={Car} label="Active Carpools" value={stats?.totalRides || 0} color="blue" />
            <SummaryCard icon={ShieldCheck} label="Settled Bookings" value={stats?.totalBookings || 0} color="indigo" />
            <SummaryCard icon={Route} label="Monitored Orgs" value={stats?.totalOrgs || 0} color="amber" />
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
            <Card className="p-6 bg-white border border-slate-50 shadow-sm rounded-[2rem]">
              <h3 className="font-heading text-xl font-extrabold text-slate-950 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-emerald-700" /> Commuting Trip Volume Trend
              </h3>
              <p className="text-slate-400 text-xs mt-1">Please visit the full Analytics tab for advanced charts and trends.</p>
              <div className="mt-8 flex h-60 items-end justify-center text-slate-400 font-semibold text-sm">
                <Link to="/analytics" className="text-emerald-700 hover:underline">Click here to open Analytics Trend Graphs ➔</Link>
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
                    <p className="font-bold text-sm text-slate-900 mt-2 truncate">
                      {ride.pickupName} &rarr; {ride.destinationName}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* REPORTS HISTORY TAB */}
      {(!isAdmin || activeTab === 'reports') && (
        <Card className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-heading text-2xl font-extrabold text-slate-950">Export Logs</h3>
            <Button size="sm" icon={FileDown} onClick={() => setExportOpen(true)}>
              New Export
            </Button>
          </div>
          <ReportTable
            reports={reports}
            onDelete={handleDeleteReport}
            onDownload={fetchReports}
          />
        </Card>
      )}

      {/* EMPLOYEE VERIFICATION TAB */}
      {isAdmin && activeTab === 'users' && (
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
                    <td className="py-4 font-bold text-slate-600">{usr.employeeId || 'N/A'}</td>
                    <td className="py-4 font-bold text-xs text-emerald-800">{usr.organization?.name || 'N/A'}</td>
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

      {/* RIDE MONITORING TAB */}
      {isAdmin && activeTab === 'rides' && (
        <Card className="p-6 bg-white border border-slate-50 shadow-sm rounded-[2rem] animate-fadeIn">
          <h3 className="font-heading text-2xl font-extrabold text-slate-950 mb-4">Workspace Ride Monitoring Board</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <th className="pb-3 font-semibold">Commute Route</th>
                  <th className="pb-3 font-semibold">Host Driver</th>
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
                      <Badge variant={ride.rideStatus === 'Cancelled' ? 'danger' : ride.rideStatus === 'Completed' ? 'success' : 'warning'}>
                        {ride.rideStatus}
                      </Badge>
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

      {/* COST CONFIGURATION TAB */}
      {isAdmin && activeTab === 'config' && (
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
              <span>Adjusting cost settings will update future published seat costs for employees.</span>
            </div>

            <Button type="submit" className="w-full mt-4" size="lg">Save Settings</Button>
          </form>
        </Card>
      )}

      {/* New Export Modal */}
      <ExportModal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        onSubmit={handleGenerateReportSubmit}
      />
    </PageShell>
  );
}
