import { useState, useEffect } from 'react';
import { 
  Users, Car, Navigation, Wallet, Building2, Settings as SettingsIcon, 
  CheckCircle, XCircle, Search, Plus, Edit, ShieldCheck, Activity, RefreshCw, DollarSign, Fuel, Filter
} from 'lucide-react';
import PageShell from '../../components/shared/PageShell.jsx';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import api from '../../services/api.js';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('participation');
  const [loading, setLoading] = useState(false);

  // State data for tabs
  const [participation, setParticipation] = useState(null);
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [userStatus, setUserStatus] = useState('');
  
  const [rides, setRides] = useState([]);
  const [rideSearch, setRideSearch] = useState('');
  const [rideStatus, setRideStatus] = useState('');

  const [payments, setPayments] = useState([]);
  const [paymentStats, setPaymentStats] = useState(null);

  const [organizations, setOrganizations] = useState([]);
  const [showOrgModal, setShowOrgModal] = useState(false);
  const [orgForm, setOrgForm] = useState({ name: '', companyCode: '', email: '', phone: '', address: '' });

  const [costConfig, setCostConfig] = useState({ fuelCostPerLiter: 102.50, fuelEfficiencyBaseline: 15.0, travelCostPerKm: 8.50, platformFeePercent: 5.0 });

  // Load participation metrics
  const fetchParticipation = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/participation');
      setParticipation(res.data.data);
    } catch (e) {
      toast.error('Failed to load participation metrics');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users', { params: { search: userSearch, status: userStatus } });
      setUsers(res.data.data.users || []);
    } catch (e) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Rides
  const fetchRides = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/rides', { params: { search: rideSearch, status: rideStatus } });
      setRides(res.data.data.rides || []);
    } catch (e) {
      toast.error('Failed to fetch rides');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Payments & Wallets
  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/payments');
      setPayments(res.data.data.payments || []);
      setPaymentStats(res.data.data.stats || null);
    } catch (e) {
      toast.error('Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Organizations
  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/organizations');
      setOrganizations(res.data.data.organizations || []);
    } catch (e) {
      toast.error('Failed to fetch organizations');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Cost Config
  const fetchCostConfig = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/cost-config');
      if (res.data.data) {
        setCostConfig(res.data.data);
      }
    } catch (e) {
      toast.error('Failed to load cost configurations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'participation') fetchParticipation();
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'rides') fetchRides();
    if (activeTab === 'wallets') fetchPayments();
    if (activeTab === 'organizations') fetchOrganizations();
    if (activeTab === 'costConfig') fetchCostConfig();
  }, [activeTab]);

  // Actions
  const handleToggleUserStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await api.patch(`/admin/users/${userId}/status`, { status: newStatus });
      toast.success(`User status changed to ${newStatus}`);
      fetchUsers();
    } catch (e) {
      toast.error('Failed to update user status');
    }
  };

  const handleCreateOrg = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/organizations', orgForm);
      toast.success('Organization created successfully!');
      setShowOrgModal(false);
      setOrgForm({ name: '', companyCode: '', email: '', phone: '', address: '' });
      fetchOrganizations();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to create organization');
    }
  };

  const handleSaveCostConfig = async (e) => {
    e.preventDefault();
    try {
      await api.put('/admin/cost-config', costConfig);
      toast.success('Cost configurations updated successfully!');
    } catch (e) {
      toast.error('Failed to update cost config');
    }
  };

  const tabs = [
    { id: 'participation', label: 'Participation', icon: Activity },
    { id: 'users', label: 'Employees', icon: Users },
    { id: 'rides', label: 'Ride Monitoring', icon: Navigation },
    { id: 'wallets', label: 'Wallet & Payments', icon: Wallet },
    { id: 'organizations', label: 'Organizations', icon: Building2 },
    { id: 'costConfig', label: 'Cost Configs', icon: Fuel },
  ];

  return (
    <PageShell 
      eyebrow="Administration" 
      title="Enterprise Admin Portal" 
      description="Manage organization employees, vehicles, commute rides, wallet transactions, and system fuel settings."
    >
      {/* Navigation Tabs Bar */}
      <div className="mb-6 flex flex-wrap gap-2 rounded-2xl bg-slate-100 p-1.5 border border-slate-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                isActive 
                  ? 'bg-emerald-700 text-white shadow-md shadow-emerald-200' 
                  : 'text-slate-600 hover:bg-white/60 hover:text-slate-900'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Employee Participation Dashboard */}
      {activeTab === 'participation' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="p-6 bg-white border border-slate-100 space-y-2">
              <div className="flex justify-between items-center text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Total Employees</span>
                <Users className="h-5 w-5 text-emerald-600" />
              </div>
              <p className="text-3xl font-extrabold text-slate-900">{participation?.totalEmployees ?? '-'}</p>
              <p className="text-xs text-slate-500">Registered organization staff</p>
            </Card>

            <Card className="p-6 bg-white border border-slate-100 space-y-2">
              <div className="flex justify-between items-center text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Participation Rate</span>
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-3xl font-extrabold text-blue-700">{participation?.participationRate ? `${participation.participationRate}%` : '-'}</p>
              <p className="text-xs text-slate-500">{participation?.totalDrivers || 0} Drivers & {participation?.totalPassengers || 0} Passengers</p>
            </Card>

            <Card className="p-6 bg-white border border-slate-100 space-y-2">
              <div className="flex justify-between items-center text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Completed Rides</span>
                <Navigation className="h-5 w-5 text-purple-600" />
              </div>
              <p className="text-3xl font-extrabold text-purple-700">{participation?.completedTrips ?? '-'}</p>
              <p className="text-xs text-slate-500">Out of {participation?.totalRides || 0} total offered rides</p>
            </Card>

            <Card className="p-6 bg-white border border-slate-100 space-y-2">
              <div className="flex justify-between items-center text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Active Organizations</span>
                <Building2 className="h-5 w-5 text-amber-600" />
              </div>
              <p className="text-3xl font-extrabold text-amber-700">{participation?.totalOrgs ?? '-'}</p>
              <p className="text-xs text-slate-500">Verified corporate entities</p>
            </Card>
          </div>

          <Card className="p-6 bg-white border border-slate-100 space-y-4">
            <h3 className="font-heading text-lg font-bold text-slate-900">Participation Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 space-y-2">
                <h4 className="font-bold text-emerald-900 text-sm">Car Owners & Drivers</h4>
                <p className="text-2xl font-black text-emerald-700">{participation?.totalDrivers || 0} Employees</p>
                <p className="text-xs text-emerald-800 leading-relaxed">Employees registered with verified personal commute vehicles available for pooling.</p>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 space-y-2">
                <h4 className="font-bold text-blue-900 text-sm">Co-Passengers</h4>
                <p className="text-2xl font-black text-blue-700">{participation?.totalPassengers || 0} Employees</p>
                <p className="text-xs text-blue-800 leading-relaxed">Employees booking seats for daily office commutes and shared corporate travel.</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 2: Employee Management */}
      {activeTab === 'users' && (
        <Card className="p-6 bg-white border border-slate-100 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h3 className="font-heading text-lg font-bold text-slate-900">Employee Directory</h3>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search name, email, ID..." 
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="rounded-xl border border-slate-200 pl-9 pr-4 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <Button onClick={fetchUsers} icon={RefreshCw} variant="secondary">Filter</Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase">
                <tr>
                  <th className="p-3">Employee</th>
                  <th className="p-3">Email & Phone</th>
                  <th className="p-3">Organization</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">
                      {u.name}
                      <span className="block text-[10px] text-slate-400 font-normal">ID: {u.employeeId}</span>
                    </td>
                    <td className="p-3 text-slate-600">
                      {u.email}
                      <span className="block text-[10px] text-slate-400">{u.phone || 'No phone'}</span>
                    </td>
                    <td className="p-3 font-medium text-slate-700">{u.organization?.name || u.organization || '-'}</td>
                    <td className="p-3 text-slate-600">{u.department || 'General'}</td>
                    <td className="p-3">
                      <Badge variant={u.role === 'ADMIN' ? 'success' : 'neutral'}>{u.role}</Badge>
                    </td>
                    <td className="p-3">
                      <Badge variant={u.status === 'ACTIVE' ? 'success' : 'danger'}>{u.status}</Badge>
                    </td>
                    <td className="p-3 text-right">
                      <Button 
                        size="sm"
                        variant={u.status === 'ACTIVE' ? 'danger' : 'secondary'}
                        onClick={() => handleToggleUserStatus(u.id, u.status)}
                      >
                        {u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 3: Ride Monitoring */}
      {activeTab === 'rides' && (
        <Card className="p-6 bg-white border border-slate-100 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h3 className="font-heading text-lg font-bold text-slate-900">Commute Ride Monitoring</h3>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Search pickup, destination..." 
                value={rideSearch}
                onChange={(e) => setRideSearch(e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
              />
              <Button onClick={fetchRides} icon={RefreshCw} variant="secondary">Refresh</Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase">
                <tr>
                  <th className="p-3">Driver</th>
                  <th className="p-3">Route</th>
                  <th className="p-3">Departure</th>
                  <th className="p-3">Seats & Fare</th>
                  <th className="p-3">Vehicle</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rides.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{r.driver?.name || 'N/A'}</td>
                    <td className="p-3 font-medium text-slate-800">
                      {r.pickupName} <span className="text-slate-400">➔</span> {r.destinationName}
                    </td>
                    <td className="p-3 text-slate-600">{new Date(r.departureTime).toLocaleString()}</td>
                    <td className="p-3 text-slate-700 font-bold">
                      {r.availableSeats} seats · INR {parseFloat(r.farePerSeat).toFixed(2)}/seat
                    </td>
                    <td className="p-3 text-slate-600">
                      {r.vehicle ? `${r.vehicle.model} (${r.vehicle.plateNumber})` : 'N/A'}
                    </td>
                    <td className="p-3">
                      <Badge variant={r.rideStatus === 'Completed' ? 'success' : r.rideStatus === 'Cancelled' ? 'danger' : 'warning'}>
                        {r.rideStatus}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 4: Wallet & Payments */}
      {activeTab === 'wallets' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card className="p-6 bg-white border border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Total System Revenue</span>
              <p className="text-3xl font-extrabold text-emerald-700">INR {(paymentStats?.totalRevenue || 0).toFixed(2)}</p>
            </Card>
            <Card className="p-6 bg-white border border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Refunded Amount</span>
              <p className="text-3xl font-extrabold text-amber-600">INR {(paymentStats?.totalRefunded || 0).toFixed(2)}</p>
            </Card>
            <Card className="p-6 bg-white border border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Transactions</span>
              <p className="text-3xl font-extrabold text-slate-900">{paymentStats?.transactionCount || 0}</p>
            </Card>
          </div>

          <Card className="p-6 bg-white border border-slate-100 space-y-4">
            <h3 className="font-heading text-lg font-bold text-slate-900">Payment Audit Trail</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase">
                  <tr>
                    <th className="p-3">Payer</th>
                    <th className="p-3">Receiver</th>
                    <th className="p-3">Method</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">{p.payer?.name || 'N/A'}</td>
                      <td className="p-3 text-slate-700">{p.receiver?.name || 'N/A'}</td>
                      <td className="p-3 font-bold text-slate-600">{p.paymentMethod}</td>
                      <td className="p-3 font-black text-emerald-800">INR {parseFloat(p.amount).toFixed(2)}</td>
                      <td className="p-3">
                        <Badge variant={p.status === 'SUCCESS' ? 'success' : 'danger'}>{p.status}</Badge>
                      </td>
                      <td className="p-3 text-slate-500">{new Date(p.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 5: Organizations */}
      {activeTab === 'organizations' && (
        <Card className="p-6 bg-white border border-slate-100 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-heading text-lg font-bold text-slate-900">Registered Corporate Entities</h3>
            <Button onClick={() => setShowOrgModal(true)} icon={Plus}>Add Organization</Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase">
                <tr>
                  <th className="p-3">Organization Name</th>
                  <th className="p-3">Company Code</th>
                  <th className="p-3">Email & Phone</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Registered Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {organizations.map((org) => (
                  <tr key={org.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{org.name}</td>
                    <td className="p-3"><Badge variant="neutral">{org.companyCode}</Badge></td>
                    <td className="p-3 text-slate-600">{org.email} <span className="block text-[10px] text-slate-400">{org.phone || '-'}</span></td>
                    <td className="p-3"><Badge variant={org.status === 'ACTIVE' ? 'success' : 'danger'}>{org.status}</Badge></td>
                    <td className="p-3 text-right text-slate-500">{new Date(org.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add Org Modal */}
          {showOrgModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
              <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl space-y-4">
                <h3 className="font-heading text-lg font-bold text-slate-900">Add New Organization</h3>
                <form onSubmit={handleCreateOrg} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Company Name</label>
                    <input 
                      type="text" 
                      required 
                      value={orgForm.name} 
                      onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Company Code</label>
                    <input 
                      type="text" 
                      required 
                      value={orgForm.companyCode} 
                      onChange={(e) => setOrgForm({ ...orgForm, companyCode: e.target.value.toUpperCase() })}
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Domain Email</label>
                    <input 
                      type="email" 
                      required 
                      value={orgForm.email} 
                      onChange={(e) => setOrgForm({ ...orgForm, email: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-3">
                    <Button variant="secondary" onClick={() => setShowOrgModal(false)}>Cancel</Button>
                    <Button type="submit">Create Entity</Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Tab 6: Fuel & Cost Configurations */}
      {activeTab === 'costConfig' && (
        <Card className="p-6 bg-white border border-slate-100 max-w-2xl space-y-6">
          <h3 className="font-heading text-lg font-bold text-slate-900 flex items-center gap-2">
            <Fuel className="h-5 w-5 text-emerald-600" /> System Fuel & Commute Cost Settings
          </h3>
          <form onSubmit={handleSaveCostConfig} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Fuel Cost per Liter (INR)</label>
              <input 
                type="number" 
                step="0.01"
                value={costConfig.fuelCostPerLiter} 
                onChange={(e) => setCostConfig({ ...costConfig, fuelCostPerLiter: parseFloat(e.target.value) })}
                className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-emerald-500 focus:outline-none font-bold text-slate-800"
              />
              <p className="text-[10px] text-slate-400 mt-1">Used to compute fuel cost in commute reports.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Baseline Vehicle Fuel Efficiency (KM/L)</label>
              <input 
                type="number" 
                step="0.1"
                value={costConfig.fuelEfficiencyBaseline} 
                onChange={(e) => setCostConfig({ ...costConfig, fuelEfficiencyBaseline: parseFloat(e.target.value) })}
                className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-emerald-500 focus:outline-none font-bold text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Base Travel Cost per KM (INR)</label>
              <input 
                type="number" 
                step="0.01"
                value={costConfig.travelCostPerKm} 
                onChange={(e) => setCostConfig({ ...costConfig, travelCostPerKm: parseFloat(e.target.value) })}
                className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-emerald-500 focus:outline-none font-bold text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Platform Commission Fee (%)</label>
              <input 
                type="number" 
                step="0.1"
                value={costConfig.platformFeePercent} 
                onChange={(e) => setCostConfig({ ...costConfig, platformFeePercent: parseFloat(e.target.value) })}
                className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-emerald-500 focus:outline-none font-bold text-slate-800"
              />
            </div>

            <Button type="submit" icon={CheckCircle}>Save Configurations</Button>
          </form>
        </Card>
      )}
    </PageShell>
  );
}
