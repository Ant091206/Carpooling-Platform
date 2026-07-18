import { Check, Circle } from 'lucide-react';

export default function RideTimeline({ timeline = [], currentStatus = '' }) {
  const steps = [
    { name: 'Accepted', statusKey: ['Scheduled', 'Started', 'InProgress', 'Completed'] },
    { name: 'Started', statusKey: ['Started', 'InProgress', 'Completed'] },
    { name: 'Reached Pickup', statusKey: ['InProgress', 'Completed'] },
    { name: 'Completed', statusKey: ['Completed'] }
  ];

  // Helper to determine status class
  const getStepStatus = (stepIndex) => {
    const activeKeys = steps[stepIndex].statusKey;
    const isCompleted = activeKeys.includes(currentStatus);
    
    // In progress is the first active key that matches but isn't completed to the next step
    const isCurrent = currentStatus === steps[stepIndex].statusKey[0];
    
    if (isCompleted) return 'completed';
    if (isCurrent) return 'current';
    return 'pending';
  };

  return (
    <div className="relative space-y-6 pl-8 before:absolute before:inset-y-2 before:left-3.5 before:w-0.5 before:rounded-full before:bg-slate-100">
      {steps.map((step, index) => {
        const stepStatus = getStepStatus(index);
        const eventData = timeline.find(t => t.event === step.name) || {};
        const isLast = index === steps.length - 1;

        // Custom colors for nodes
        const nodeStyles = {
          completed: 'bg-emerald-600 border-emerald-600 text-white ring-4 ring-emerald-100',
          current: 'bg-white border-orange-500 text-orange-500 ring-4 ring-orange-100 animate-pulse',
          pending: 'bg-white border-slate-200 text-slate-300'
        };

        const timeString = eventData.time
          ? new Date(eventData.time).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
          : '—:—';

        const dateString = eventData.time
          ? new Date(eventData.time).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
          : '';

        return (
          <div key={step.name} className="relative flex gap-4 text-sm">
            {/* Timeline node dot */}
            <span
              className={`absolute -left-8 mt-1 h-7.5 w-7.5 rounded-full border-2 flex items-center justify-center transition-all duration-300 z-10 ${
                nodeStyles[stepStatus]
              }`}
            >
              {stepStatus === 'completed' ? (
                <Check className="w-4 h-4 stroke-[3]" />
              ) : (
                <Circle className="w-2.5 h-2.5 fill-current" />
              )}
            </span>

            {/* Timeline content */}
            <div className="flex-1">
              <div className="flex flex-wrap justify-between items-baseline gap-2">
                <p className={`font-heading font-extrabold ${
                  stepStatus === 'completed' ? 'text-slate-900' : (stepStatus === 'current' ? 'text-orange-600' : 'text-slate-400')
                }`}>
                  {step.name}
                </p>
                {eventData.time && (
                  <span className="text-xs font-bold text-slate-400">
                    {dateString} {timeString}
                  </span>
                )}
              </div>
              <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                {eventData.description || `State marker for Odoo Carpooling Ride sequence: ${step.name.toLowerCase()}.`}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
