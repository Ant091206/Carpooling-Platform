import { Link } from 'react-router-dom';
import { Car, Shield, Navigation, Users } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className="space-y-16">
      {/* Hero Block */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-brand-900 to-brand-950 text-white px-8 py-20 md:py-28 shadow-xl shadow-slate-200">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-600/30 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-3xl space-y-6 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">
            Now Live for Enterprises
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
            Optimize Your Daily Corporate Commutes
          </h1>
          <p className="text-slate-300 text-lg sm:text-xl leading-relaxed max-w-2xl">
            Connect with colleagues, share rides safely, lower carbon emissions, and streamline company travel with the Enterprise Carpooling Platform.
          </p>
          <div className="pt-4 flex flex-wrap gap-4">
            <Link
              to="/register"
              className="px-6 py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-2xl shadow-lg shadow-brand-500/20 transition-all"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-2xl border border-white/10 transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Value Propositions */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="h-12 w-12 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
            <Shield className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Corporate Identity Verification</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Every user is validated using enterprise email auth, ensuring secure rides with verified colleagues.
          </p>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="h-12 w-12 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
            <Navigation className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Mapbox Smart Route-Matching</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Real-time visual routes powered by Mapbox Directions to optimize pickups and dropoffs along the commute path.
          </p>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="h-12 w-12 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
            <Users className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Cost Sharing & Reporting</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Seamlessly calculate shared commute costs or track carbon footprints for corporate sustainability goals.
          </p>
        </div>
      </section>
    </div>
  );
}
