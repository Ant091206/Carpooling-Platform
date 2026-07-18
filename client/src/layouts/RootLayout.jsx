import { Outlet, useLocation } from 'react-router-dom';
import TopNavbar from '../components/ui/TopNavbar.jsx';

const authPaths = ['/login', '/register', '/profile-setup'];

export default function RootLayout() {
  const { pathname } = useLocation();
  const isLanding = pathname === '/';
  const isAuth = authPaths.includes(pathname);

  return (
    <div className="min-h-screen bg-[#EAF6EF] text-slate-900">
      <TopNavbar publicMode={isLanding || isAuth} />
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      <footer className="border-t border-emerald-100 bg-white/70">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>Copyright {new Date().getFullYear()} Enterprise Carpooling Platform.</p>
          <div className="flex gap-5 font-bold text-slate-600">
            <a href="#privacy">Privacy</a>
            <a href="#terms">Terms</a>
            <a href="#support">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
