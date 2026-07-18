import { useState, useEffect, useRef } from 'react';

export default function NotificationBadge({ count = 0 }) {
  const [animate, setAnimate] = useState(false);
  const prevCount = useRef(count);

  useEffect(() => {
    if (count > prevCount.current) {
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 600);
      return () => clearTimeout(timer);
    }
    prevCount.current = count;
  }, [count]);

  if (count === 0) return null;

  return (
    <span
      className={`absolute -right-1.5 -top-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-lg transition-transform ${
        animate ? 'scale-125' : 'scale-100'
      }`}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}
