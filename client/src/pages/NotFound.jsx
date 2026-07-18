import { Link } from 'react-router-dom';
import Button from '../components/ui/Button.jsx';
import { EmptyStateIllustration } from '../illustrations/CarpoolIllustrations.jsx';

export default function NotFound() {
  return <div className="grid min-h-[60vh] place-items-center text-center"><div className="max-w-md"><div className="mx-auto h-56"><EmptyStateIllustration /></div><h1 className="font-heading text-4xl font-extrabold text-slate-950">Route not found</h1><p className="mt-3 text-slate-600">This page has no matching commute route.</p><Link to="/dashboard" className="mt-6 inline-flex"><Button>Go to Dashboard</Button></Link></div></div>;
}
