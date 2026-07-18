import { Link } from 'react-router-dom';
import IllustrationBlob from '../components/ui/IllustrationBlob.jsx';
import { HeroCarpool } from '../illustrations/CarpoolIllustrations.jsx';

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-[calc(100vh-12rem)] items-center gap-8 lg:grid-cols-2">
      <IllustrationBlob className="hidden min-h-[560px] p-8 lg:block">
        <div className="flex h-full flex-col justify-between">
          <div>
            <Link to="/" className="text-sm font-extrabold uppercase tracking-[0.18em] text-emerald-700">EnterprisePool</Link>
            <h1 className="mt-5 font-heading text-5xl font-extrabold leading-tight text-slate-950">Commutes that feel coordinated before the day starts.</h1>
            <p className="mt-5 max-w-lg text-lg leading-8 text-slate-600">Mint-clean tools for employees to find, offer, and complete shared rides with confidence.</p>
          </div>
          <div className="h-72"><HeroCarpool /></div>
        </div>
      </IllustrationBlob>
      <div className="mx-auto w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl shadow-emerald-900/10">
        <div className="mb-7 text-center">
          <h2 className="font-heading text-3xl font-extrabold text-slate-950">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{subtitle}</p>
        </div>
        {children}
        {footer && <div className="mt-7 text-center text-sm text-slate-600">{footer}</div>}
      </div>
    </div>
  );
}
