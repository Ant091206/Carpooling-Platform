const tabs = [
  { key: 'all',      label: 'All' },
  { key: 'unread',   label: 'Unread' },
  { key: 'BOOKING',  label: 'Booking' },
  { key: 'PAYMENT',  label: 'Payments' },
  { key: 'RIDE',     label: 'Rides' },
  { key: 'SYSTEM',   label: 'System' },
];

export default function NotificationFilter({ active, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map(tab => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all duration-200 ${
            active === tab.key
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
              : 'bg-white text-slate-500 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
