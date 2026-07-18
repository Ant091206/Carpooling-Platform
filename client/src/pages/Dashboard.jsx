import { useAuth } from '../context/AuthContext.jsx';
import { Car, Compass, Leaf, Milestone } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Welcome Card */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Dashboard
          </h2>
          <p className="text-slate-500">
            Welcome back, <span className="font-semibold text-slate-800">{user?.name || user?.email}</span>. Here is your corporate transit summary.
          </p>
        </div>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200 capitalize">
          Role: {user?.role || 'passenger'}
        </span>
      </div>

      {/* Grid Status Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-brand-50 rounded-xl text-brand-600">
            <Car className="h-6 w-6" />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Total Commutes</p>
            <h4 className="text-2xl font-bold text-slate-900">0</h4>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 rounded-xl text-green-600">
            <Leaf className="h-6 w-6" />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">CO2 Saved</p>
            <h4 className="text-2xl font-bold text-slate-900">0 kg</h4>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
            <Milestone className="h-6 w-6" />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Shared Distance</p>
            <h4 className="text-2xl font-bold text-slate-900">0 km</h4>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
            <Compass className="h-6 w-6" />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Active Poolers</p>
            <h4 className="text-2xl font-bold text-slate-900">0</h4>
          </div>
        </div>
      </div>

      {/* Main Grid Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Recent Commutes / Schedule */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-900">Commute Timeline</h3>
          <div className="border border-dashed border-slate-200 rounded-2xl p-8 text-center text-slate-400 text-sm">
            No upcoming routes planned. Use search to find or host a ride.
          </div>
        </div>

        {/* Right Side: Quick Action Quick Access */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-900">Actions</h3>
          <div className="space-y-3">
            <button className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-2xl transition-all text-sm">
              Schedule Commute
            </button>
            <button className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-2xl transition-all text-sm">
              Register Ride History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
