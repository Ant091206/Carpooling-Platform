import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Car, ChevronDown, LogOut, Menu, User, X, Activity } from 'lucide-react';
import Button from './Button.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import NotificationBell from '../notifications/NotificationBell.jsx';

const baseAppLinks = [
  ['Dashboard',  '/dashboard'],
  ['Find Ride',  '/find-ride'],
  ['Offer Ride', '/offer-ride'],
  ['My Rides',   '/my-rides'],
  ['My Trips',   '/my-trips'],
  ['Wallet',     '/wallet'],
  ['Payments',   '/payment/history'],
];

export default function TopNavbar({ publicMode = false }) {
  const [open, setOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const appLinks = user?.role === 'ADMIN'
    ? [...baseAppLinks, ['System', '/system']]
    : baseAppLinks;

  const links = isAuthenticated && !publicMode ? appLinks : [['Benefits', '/#benefits'], ['How it works', '/#how-it-works']];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-emerald-100 bg-[#EAF6EF]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to={isAuthenticated && !publicMode ? '/dashboard' : '/'} className="flex items-center gap-3 font-heading text-xl font-extrabold text-slate-950">
          <span className="rounded-2xl bg-emerald-600 p-2 text-white shadow-lg shadow-emerald-200">
            <Car className="h-5 w-5" />
          </span>
          EnterprisePool
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map(([label, to]) => (
            <NavLink
              key={label}
              to={to}
              className={({ isActive }) => `rounded-full px-4 py-2 text-sm font-bold transition ${isActive ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:bg-white/70 hover:text-emerald-700'}`}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {isAuthenticated && !publicMode ? (
            <>
              <NotificationBell />
              <Link to="/profile-setup" className="flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                  <User className="h-4 w-4" />
                </span>
                <span>{user?.name || user?.email || 'Profile'}</span>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </Link>
              <Button variant="ghost" icon={LogOut} onClick={handleLogout}>Logout</Button>
            </>
          ) : (
            <>
              <Button as={Link} variant="ghost" onClick={() => navigate('/login')}>Sign In</Button>
              <Button onClick={() => navigate('/register')}>Get Started</Button>
            </>
          )}
        </div>

        <button onClick={() => setOpen((value) => !value)} className="rounded-full bg-white p-3 text-slate-700 shadow-sm lg:hidden" aria-label="Toggle navigation">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-emerald-100 bg-[#EAF6EF] px-4 py-4 lg:hidden">
          <div className="mx-auto grid max-w-7xl gap-2">
            {links.map(([label, to]) => (
              <Link key={label} to={to} onClick={() => setOpen(false)} className="rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-700">
                {label}
              </Link>
            ))}
            {isAuthenticated && !publicMode ? (
              <button onClick={handleLogout} className="rounded-2xl bg-emerald-600 px-4 py-3 text-left text-sm font-bold text-white">Logout</button>
            ) : (
              <Link to="/login" onClick={() => setOpen(false)} className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white">Sign In</Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
