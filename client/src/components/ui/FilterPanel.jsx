import { Calendar, Filter, User, Compass, Briefcase } from 'lucide-react';
import Card from './Card.jsx';
import Input from './Input.jsx';

const REPORT_TYPES = [
  { value: 'RIDE', label: 'Ride Report' },
  { value: 'PAYMENT', label: 'Payment Report' },
  { value: 'USER', label: 'User Report' },
  { value: 'DRIVER', label: 'Driver Performance Report' },
  { value: 'PASSENGER', label: 'Passenger Activity Report' },
  { value: 'REVENUE', label: 'Revenue Report' },
  { value: 'BOOKING', label: 'Booking Report' },
  { value: 'RATING', label: 'Ratings Report' }
];

export default function FilterPanel({ filters = {}, onChange = () => {} }) {
  const handleFilterChange = (key, val) => {
    onChange({ ...filters, [key]: val });
  };

  return (
    <Card className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-6">
      <h3 className="font-heading text-lg font-extrabold text-slate-950 flex items-center gap-2">
        <Filter className="h-5 w-5 text-emerald-700" /> Filter Criteria
      </h3>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Report Type */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Report Type</label>
          <select
            value={filters.type || ''}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-emerald-600 focus:bg-white transition"
          >
            <option value="">Select Report Type</option>
            {REPORT_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        {/* Date Filters */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Start Date</label>
          <input
            type="date"
            value={filters.startDate || ''}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-emerald-600 focus:bg-white transition"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">End Date</label>
          <input
            type="date"
            value={filters.endDate || ''}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-emerald-600 focus:bg-white transition"
          />
        </div>

        {/* Export Format */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Export Format</label>
          <select
            value={filters.fileType || ''}
            onChange={(e) => handleFilterChange('fileType', e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-emerald-600 focus:bg-white transition"
          >
            <option value="">Select Format</option>
            <option value="CSV">CSV</option>
            <option value="XLSX">Excel (.xlsx)</option>
            <option value="PDF">PDF</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 pt-2 border-t border-slate-50">
        {/* Additional Filters */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Department</label>
          <input
            type="text"
            placeholder="e.g. Engineering"
            value={filters.department || ''}
            onChange={(e) => handleFilterChange('department', e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-emerald-600 focus:bg-white transition"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Ride Status</label>
          <select
            value={filters.rideStatus || ''}
            onChange={(e) => handleFilterChange('rideStatus', e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-emerald-600 focus:bg-white transition"
          >
            <option value="">All Statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Started">Started</option>
            <option value="InProgress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Payment Status</label>
          <select
            value={filters.paymentStatus || ''}
            onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-emerald-600 focus:bg-white transition"
          >
            <option value="">All Payments</option>
            <option value="PENDING">Pending</option>
            <option value="SUCCESS">Success</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </div>
      </div>
    </Card>
  );
}
