import { Outlet } from 'react-router-dom';
import { PageTransition } from '../components/PageTransition';

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Left side: Illustration & Branding */}
      <div className="hidden md:flex md:w-1/2 bg-primary-900 text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
              <span className="font-bold text-white text-xl">E</span>
            </div>
            <span className="font-semibold text-xl tracking-tight">Enterprise Carpooling</span>
          </div>
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Commute better,<br />together.
          </h1>
          <p className="text-primary-100 text-lg max-w-md">
            Join thousands of employees saving time, money, and the environment with our intelligent carpooling platform.
          </p>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute top-24 -right-24 w-72 h-72 bg-secondary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        
        <div className="relative z-10 text-sm text-primary-200">
          &copy; {new Date().getFullYear()} Odoo Hackathon
        </div>
      </div>

      {/* Right side: Auth Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </div>
      </div>
    </div>
  );
}
