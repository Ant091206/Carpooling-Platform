import { motion } from 'framer-motion';

export default function PageShell({ eyebrow, title, description, children, action }) {
  return (
    <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          {eyebrow && <p className="mb-2 text-sm font-extrabold uppercase tracking-[0.18em] text-emerald-700">{eyebrow}</p>}
          <h1 className="font-heading text-3xl font-extrabold text-slate-950 sm:text-4xl">{title}</h1>
          {description && <p className="mt-3 max-w-2xl text-slate-600">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </motion.section>
  );
}
