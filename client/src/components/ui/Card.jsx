import { motion } from 'framer-motion';

export default function Card({ children, className = '', hover = false }) {
  const Component = hover ? motion.div : 'div';
  const motionProps = hover ? { whileHover: { y: -5 }, transition: { type: 'spring', stiffness: 260, damping: 22 } } : {};

  return (
    <Component
      className={`rounded-3xl border border-emerald-100/80 bg-white p-6 shadow-xl shadow-emerald-900/5 ${className}`}
      {...motionProps}
    >
      {children}
    </Component>
  );
}
