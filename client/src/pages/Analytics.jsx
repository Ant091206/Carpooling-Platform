import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageShell from '../components/shared/PageShell.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import SummaryCard from '../components/ui/SummaryCard.jsx';
import MetricCard from '../components/ui/MetricCard.jsx';
import AnalyticsChart from '../components/ui/AnalyticsChart.jsx';
import {
  TrendingUp,
  Users,
  Car,
  DollarSign,
  Compass,
  ArrowLeft,
  Calendar,
  Star,
  Activity,
  Award,
  ChevronRight,
  Route
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function Analytics() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState('daily');
  const [summary, setSummary] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [ridesData, setRidesData] = useState([]);
  const [usersData, setUsersData] = useState([]);
  const [paymentsData, setPaymentsData] = useState(null);
  const [ratingsData, setRatingsData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

      const [
        summaryRes,
        revenueRes,
        ridesRes,
        usersRes,
        paymentsRes,
        ratingsRes
      ] = await Promise.all([
        axios.get(`${baseUrl}/analytics/dashboard`, { headers }),
        axios.get(`${baseUrl}/analytics/revenue?period=${period}`, { headers }),
        axios.get(`${baseUrl}/analytics/rides?period=${period}`, { headers }),
        axios.get(`${baseUrl}/analytics/users?period=${period}`, { headers }),
        axios.get(`${baseUrl}/analytics/payments`, { headers }),
        axios.get(`${baseUrl}/analytics/ratings`, { headers })
      ]);

      setSummary(summaryRes.data.data);
      setRevenueData(revenueRes.data.data || []);
      setRidesData(ridesRes.data.data || []);
      setUsersData(usersRes.data.data || []);
      setPaymentsData(paymentsRes.data.data);
      setRatingsData(ratingsRes.data.data);
    } catch (e) {
      toast.error('Failed to load system analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  if (loading) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" />
      </div>
    );
  }

  return (
    <PageShell
      eyebrow="Analytics"
      title="Enterprise Analytics Trends"
      description="Real-time ride share volumes, growth rates, revenue, and satisfaction statistics."
      action={
        <div className="flex gap-2">
          <Button variant="slate" icon={ArrowLeft} onClick={() => navigate('/reports')}>
            Back to Dashboard
          </Button>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-emerald-600 transition"
          >
            <option value="daily">Daily View</option>
            <option value="weekly">Weekly View</option>
            <option value="monthly">Monthly View</option>
          </select>
        </div>
      }
    >
      {/* KPI Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard icon={Users} label="Total Commuters" value={summary?.totalUsers || 0} color="emerald" />
        <SummaryCard icon={Car} label="Total Shared Rides" value={summary?.totalRides || 0} color="blue" />
        <SummaryCard icon={DollarSign} label="Gross Bookings Revenue" value={`₹${summary?.totalRevenue?.toLocaleString()}`} color="indigo" />
        <SummaryCard icon={Star} label="Average Satisfaction" value={`${summary?.averageRating?.toFixed(1)}★`} color="amber" />
      </div>

      {/* Main Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Trend */}
        <Card className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm">
          <h3 className="font-heading text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-700" /> Booking Revenue Trend
          </h3>
          <AnalyticsChart data={revenueData} dataKey="revenue" name="Revenue (INR)" color="#059669" />
        </Card>

        {/* Ride Share Trends */}
        <Card className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm">
          <h3 className="font-heading text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" /> Carpool Share Volumes
          </h3>
          <AnalyticsChart data={ridesData} dataKey="completed" name="Completed Rides" type="bar" color="#2563eb" />
        </Card>

        {/* User Growth */}
        <Card className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm">
          <h3 className="font-heading text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-600" /> Commuters Growth Trend
          </h3>
          <AnalyticsChart data={usersData} dataKey="totalUsers" name="Total Commuters" type="line" color="#4f46e5" />
        </Card>

        {/* Peak Booking Hours */}
        <Card className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm">
          <h3 className="font-heading text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-amber-600" /> Peak Booking Hours
          </h3>
          <AnalyticsChart data={summary?.peakBookingHours} dataKey="count" xKey="hour" name="Bookings Count" type="bar" color="#d97706" />
        </Card>
      </div>

      {/* Advanced Snapshot Lists */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Top Drivers */}
        <Card className="p-5 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-4">
          <h4 className="font-heading text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Award className="h-5 w-5 text-emerald-700" /> Top Shared Drivers
          </h4>
          <div className="divide-y divide-slate-50">
            {summary?.topDrivers?.map((driver, i) => (
              <div key={driver.id} className="flex justify-between items-center py-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs font-bold text-slate-400">#{i+1}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{driver.name}</p>
                    <p className="text-xxs text-slate-400 truncate">{driver.email}</p>
                  </div>
                </div>
                <Badge variant="success">{driver.ridesCount} Rides</Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Passengers */}
        <Card className="p-5 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-4">
          <h4 className="font-heading text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Award className="h-5 w-5 text-blue-600" /> Top Shared Commuters
          </h4>
          <div className="divide-y divide-slate-50">
            {summary?.topPassengers?.map((passenger, i) => (
              <div key={passenger.id} className="flex justify-between items-center py-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs font-bold text-slate-400">#{i+1}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{passenger.name}</p>
                    <p className="text-xxs text-slate-400 truncate">{passenger.email}</p>
                  </div>
                </div>
                <Badge variant="info">{passenger.bookingsCount} Bookings</Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Routes */}
        <Card className="p-5 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-4">
          <h4 className="font-heading text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Route className="h-5 w-5 text-amber-600" /> Top Share Routes
          </h4>
          <div className="divide-y divide-slate-50">
            {summary?.topRoutes?.map((route, i) => (
              <div key={route.route} className="flex justify-between items-center py-3">
                <p className="text-xs font-bold text-slate-700 truncate max-w-[70%]">{route.route}</p>
                <Badge variant="warning">{route.count} Trips</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
