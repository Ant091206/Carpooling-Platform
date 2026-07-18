import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, children }) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-heading text-2xl font-extrabold text-slate-900">{title}</h3>
              <button onClick={onClose} className="rounded-full p-2 text-slate-500 hover:bg-slate-100" aria-label="Close modal">
                <X className="h-5 w-5" />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
