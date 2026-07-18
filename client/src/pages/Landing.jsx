import { motion } from 'framer-motion';
import { ArrowRight, BadgeCheck, ShieldAlert, CreditCard, Compass, BarChart3, BellRing, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import IllustrationBlob from '../components/ui/IllustrationBlob.jsx';
import { HeroCarpool } from '../illustrations/CarpoolIllustrations.jsx';

const corporateLogos = [
  { name: 'Google', url: '#' },
  { name: 'Microsoft', url: '#' },
  { name: 'TCS', url: '#' },
  { name: 'Infosys', url: '#' },
  { name: 'Accenture', url: '#' },
  { name: 'IBM', url: '#' }
];

const features = [
  { icon: BadgeCheck, title: 'Verified Employees', text: 'Auto-checks company email domains to restrict pool shares strictly to colleagues.' },
  { icon: Compass, title: 'Real-time Tracking', text: 'Live GPS route updates, chat timelines, and lifetime ETAs checkouts.' },
  { icon: CreditCard, title: 'Secure Payments', text: 'Seamless corporate recharges and automated payment gateway checkouts.' },
  { icon: Sparkles, title: 'Ride Matching', text: 'Smart route calculations geocoding nearby hosts commuting on same schedule.' },
  { icon: BarChart3, title: 'Corporate Analytics', text: 'Complete carbon footprints offsets charts and commuter travel stats.' },
  { icon: BellRing, title: 'Live Notifications', text: 'Socket connections delivering instant alerts about requests and updates.' }
];

export default function Landing() {
  return (
    <div className="space-y-24 pb-20">
      {/* HERO SECTION */}
      <section className="grid min-h-[calc(100vh-11rem)] items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] pt-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.4 }}
          className="space-y-8"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-100 px-4 py-1.5 text-xs font-bold text-emerald-800 shadow-sm">
            <Sparkles className="h-4 w-4 text-emerald-600 animate-pulse" /> Verified Corporate Commuting
          </span>
          <div className="space-y-5">
            <h1 className="font-heading text-5xl font-extrabold leading-tight text-slate-950 md:text-6xl">
              Employee-only <span className="text-emerald-600">Ride Sharing</span>
            </h1>
            <p className="font-heading text-xl font-bold text-slate-700 leading-normal">
              Safe. Verified. Affordable.
            </p>
            <p className="max-w-xl text-md leading-relaxed text-slate-600">
              Enterprise-grade commuting for modern workplaces. Share rides, split commute expenses, and offset your carbon footprint with coworkers.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/register">
              <Button size="lg" icon={ArrowRight}>Create Account</Button>
            </Link>
            <a href="#features">
              <Button size="lg" variant="secondary">Learn More</Button>
            </a>
          </div>
        </motion.div>

        <IllustrationBlob className="min-h-[420px] p-6 relative flex items-center justify-center">
          <div className="w-full max-w-[460px] animate-pulseSlow">
            <HeroCarpool />
          </div>
        </IllustrationBlob>
      </section>

      {/* TRUSTED LOGOS SECTION */}
      <section className="py-6 border-y border-slate-100 bg-slate-50/50 rounded-3xl p-8">
        <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-6">
          Trusted by employees at leading workplaces
        </p>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-6 items-center justify-items-center opacity-60">
          {corporateLogos.map((logo) => (
            <span 
              key={logo.name} 
              className="text-lg font-extrabold font-heading text-slate-500 tracking-wider hover:text-emerald-700 transition duration-300"
            >
              {logo.name}
            </span>
          ))}
        </div>
      </section>

      {/* FEATURES GRID SECTION */}
      <section id="features" className="space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-emerald-700">Platform Features</p>
          <h2 className="font-heading text-3xl font-extrabold text-slate-950 sm:text-4xl">
            Everything your workspace commute needs.
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            Employee-only rides designed for repeat schedules, masking contact details and verifying corporate domain codes.
          </p>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, text }) => (
            <Card key={title} hover className="p-6 bg-white border border-slate-50 hover:border-emerald-100 transition shadow-sm rounded-3xl space-y-4">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
                <Icon className="h-5 w-5" />
              </span>
              <div className="space-y-2">
                <h3 className="font-heading text-xl font-extrabold text-slate-950">{title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{text}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="rounded-[2.5rem] bg-emerald-600 text-white p-8 md:p-12 shadow-xl shadow-emerald-950/20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="relative grid gap-8 md:grid-cols-3">
          {['Confirm Commute Route', 'Book Verified Ride', 'Track Live & Chat'].map((item, index) => (
            <div key={item} className="flex gap-4 items-start">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-emerald-700 font-extrabold text-sm border border-emerald-500 shadow-inner">
                {index + 1}
              </span>
              <div>
                <h3 className="font-heading text-lg font-extrabold text-emerald-50">{item}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-emerald-100/80">
                  Pre-screened workspaces make sharing a ride simple, ensuring safety and masks coordinates encryption.
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
