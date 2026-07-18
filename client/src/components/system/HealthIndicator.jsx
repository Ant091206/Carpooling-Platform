export default function HealthIndicator({ status = 'HEALTHY', showLabel = true }) {
  const isHealthy = status === 'HEALTHY' || status === 'UP';
  const isWarning = status === 'WARN' || status === 'WARNING';

  return (
    <div className="flex items-center gap-2">
      <span className="relative flex h-3 w-3">
        <span
          className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${
            isHealthy ? 'bg-emerald-400' : isWarning ? 'bg-amber-400' : 'bg-red-400'
          }`}
        />
        <span
          className={`relative inline-flex h-3 w-3 rounded-full ${
            isHealthy ? 'bg-emerald-500' : isWarning ? 'bg-amber-500' : 'bg-red-500'
          }`}
        />
      </span>
      {showLabel && (
        <span
          className={`text-xs font-bold ${
            isHealthy ? 'text-emerald-600' : isWarning ? 'text-amber-600' : 'text-red-600'
          }`}
        >
          {status}
        </span>
      )}
    </div>
  );
}
