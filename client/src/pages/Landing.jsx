import { motion } from 'framer-motion';
import { ArrowRight, BadgeIndianRupee, Car, Leaf, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import IllustrationBlob from '../components/ui/IllustrationBlob.jsx';
import { DriverIllustration, HeroCarpool, PassengerIllustration } from '../illustrations/CarpoolIllustrations.jsx';

const benefits = [
  { icon: Leaf, title: 'Save time and fuel', text: 'Match with nearby colleagues, reduce empty seats, and keep daily commutes predictable.', art: HeroCarpool },
  { icon: Car, title: 'Become a driver', text: 'Publish office routes, choose seats, set fair splits, and manage trip status from one place.', art: DriverIllustration },
  { icon: Users, title: 'Ride as passenger', text: 'Find verified employee rides with driver details, route confirmation, and payment status.', art: PassengerIllustration },
];

export default function Landing() {
  return (
    <div className="space-y-20 pb-10">
      <section className="grid min-h-[calc(100vh-11rem)] items-center gap-10 lg:grid-cols-[1fr_0.9fr]">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="space-y-7">
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-emerald-700 shadow-sm">
            <BadgeIndianRupee className="h-4 w-4" /> Enterprise commute sharing
          </span>
          <div className="space-y-5">
            <h1 className="font-heading text-5xl font-extrabold leading-tight text-slate-950 md:text-6xl">EnterprisePool</h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-600">
              A clean employee carpooling website for finding rides, offering seats, tracking trips, managing vehicles, and handling commuter payments.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to="/register"><Button size="lg" icon={ArrowRight}>Get Started</Button></Link>
            <Link to="/login"><Button size="lg" variant="secondary">Sign In</Button></Link>
          </div>
        </motion.div>

        <IllustrationBlob className="min-h-[420px] p-6">
          <HeroCarpool />
        </IllustrationBlob>
      </section>

      <section id="benefits" className="space-y-8">
        <div className="max-w-2xl">
          <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-emerald-700">Onboarding highlights</p>
          <h2 className="mt-3 font-heading text-4xl font-extrabold text-slate-950">Commute together, with the tools teams need.</h2>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {benefits.map(({ icon: Icon, title, text, art: Art }) => (
            <Card key={title} hover className="space-y-5">
              <div className="h-44 rounded-[2rem] bg-[#EAF6EF] p-3"><Art /></div>
              <div className="space-y-3">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-100 text-emerald-700"><Icon className="h-5 w-5" /></span>
                <h3 className="font-heading text-2xl font-extrabold text-slate-950">{title}</h3>
                <p className="leading-7 text-slate-600">{text}</p>
              </div>
            </Card>
          ))}
        </div>
        <div className="flex items-center justify-center gap-3">
          <span className="h-2.5 w-8 rounded-full bg-emerald-600" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-200" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-200" />
        </div>
      </section>

      <section id="how-it-works" className="rounded-[2rem] bg-white p-8 shadow-xl shadow-emerald-900/5">
        <div className="grid gap-6 md:grid-cols-3">
          {['Confirm your route', 'Choose a verified ride', 'Track trip and payment'].map((item, index) => (
            <div key={item} className="flex gap-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-emerald-600 font-bold text-white">{index + 1}</span>
              <div>
                <h3 className="font-heading text-lg font-extrabold text-slate-950">{item}</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">Designed for repeat office commutes with clear status and route visibility.</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
