import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Navigation, ArrowRight, DollarSign, Download, Star, FileText } from 'lucide-react';
import Badge from './ui/Badge.jsx';
import Button from './ui/Button.jsx';
import toast from 'react-hot-toast';

export default function HistoryCard({ ride, onReviewClick }) {
  const {
    id,
    rideId,
    pickup,
    destination,
    distance,
    duration,
    fare,
    status,
    paymentStatus,
    rideDate,
    ratingStatus,
    isDriver,
    driver,
    passenger
  } = ride;

  const displayDate = new Date(rideDate).toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const displayTime = new Date(rideDate).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit'
  });

  // Determine participant to display on the card
  const partner = isDriver ? passenger : driver;

  // Set color styling based on ride status
  const statusColors = {
    Scheduled: 'blue',
    Started: 'indigo',
    InProgress: 'orange',
    Completed: 'green',
    Cancelled: 'red'
  };

  const handleDownloadReceipt = () => {
    toast.success('Receipt downloading started... (Receipt format placeholder generated)');
  };

  return (
    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 hover:shadow-lg hover:border-emerald-100 transition-all duration-300 grid gap-5">
      {/* Header: Date/Time + Status Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-50 pb-4">
        <div className="flex items-center gap-3 text-slate-500 font-bold text-xs sm:text-sm">
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4 text-emerald-700" />
            {displayDate}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-emerald-700" />
            {displayTime}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone={statusColors[status] || 'slate'}>{status}</Badge>
          <Badge tone={paymentStatus === 'PAID' ? 'green' : (paymentStatus === 'PENDING' ? 'warning' : 'slate')}>
            {paymentStatus}
          </Badge>
        </div>
      </div>

      {/* Body: Partner details + Route flow */}
      <div className="grid gap-5 md:grid-cols-[1fr_auto]">
        {/* Partner Info and Route */}
        <div className="space-y-4">
          {partner && (
            <div className="flex items-center gap-3">
              {partner.avatar ? (
                <img
                  src={partner.avatar.startsWith('http') ? partner.avatar : `/${partner.avatar}`}
                  alt={partner.name}
                  className="w-10 h-10 rounded-full object-cover border border-emerald-100"
                />
              ) : (
                <span className="grid h-10 w-10 place-items-center rounded-full bg-emerald-100 font-heading text-sm font-extrabold text-emerald-700">
                  {partner.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                </span>
              )}
              <div>
                <p className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-widest">
                  {isDriver ? 'Passenger' : 'Driver'}
                </p>
                <h4 className="font-heading font-extrabold text-slate-900 leading-tight">
                  {partner.name}
                </h4>
              </div>
            </div>
          )}

          {/* Pickup and Destination route flow */}
          <div className="relative space-y-3 pl-6 before:absolute before:inset-y-1.5 before:left-2 before:w-0.5 before:rounded-full before:bg-emerald-100">
            <div className="relative text-sm font-medium text-slate-700">
              <span className="absolute -left-6 mt-1 h-2.5 w-2.5 rounded-full border-2 border-slate-300 bg-white" />
              <p className="font-bold text-slate-800 leading-none">Pickup</p>
              <p className="text-slate-500 mt-1 truncate max-w-lg">{pickup}</p>
            </div>
            <div className="relative text-sm font-medium text-slate-700">
              <span className="absolute -left-6 mt-1 h-2.5 w-2.5 rounded-full border-2 border-emerald-500 bg-white" />
              <p className="font-bold text-slate-800 leading-none">Destination</p>
              <p className="text-slate-500 mt-1 truncate max-w-lg">{destination}</p>
            </div>
          </div>
        </div>

        {/* Fare + Distance details panel */}
        <div className="flex flex-row md:flex-col md:text-right md:justify-center justify-between border-t border-slate-50 md:border-t-0 pt-4 md:pt-0 gap-4 shrink-0">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Fare</p>
            <p className="font-heading text-3xl font-black text-emerald-700 flex items-baseline md:justify-end">
              <span className="text-sm font-extrabold">₹</span>
              {fare.toFixed(2)}
            </p>
          </div>
          <div className="flex md:flex-col gap-2 md:gap-0">
            <p className="text-xs font-bold text-slate-500">
              <span className="text-slate-400 uppercase tracking-wider block md:inline md:after:content-[':'] md:mr-1">Distance</span>
              {distance.toFixed(1)} km
            </p>
            <p className="text-xs font-bold text-slate-500">
              <span className="text-slate-400 uppercase tracking-wider block md:inline md:after:content-[':'] md:mr-1">Duration</span>
              {duration} min
            </p>
          </div>
        </div>
      </div>

      {/* Footer: Interactive Action Buttons */}
      <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-slate-50/50">
        {/* Receipt Downloader */}
        <Button
          variant="secondary"
          size="sm"
          icon={Download}
          onClick={handleDownloadReceipt}
          className="border-slate-200 text-slate-600 hover:text-emerald-700 hover:border-emerald-200"
        >
          Receipt
        </Button>

        {/* View Details Router */}
        <Link to={`/ride-history/${rideId}`}>
          <Button variant="secondary" size="sm" icon={ArrowRight}>
            View Details
          </Button>
        </Link>

        {/* Review Submission Trigger */}
        {status === 'Completed' && (
          ratingStatus === 'REVIEWED' ? (
            <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider select-none">
              Reviewed ✓
            </span>
          ) : (
            <Button
              size="sm"
              icon={Star}
              onClick={() => onReviewClick(rideId, partner.id, partner.name, isDriver ? 'Passenger' : 'Driver')}
              className="bg-amber-500 border-amber-500 hover:bg-amber-600 hover:border-amber-600 text-white"
            >
              Review {isDriver ? 'Passenger' : 'Driver'}
            </Button>
          )
        )}
      </div>
    </div>
  );
}
