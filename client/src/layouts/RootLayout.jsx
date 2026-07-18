import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Car, LogOut, User, MapPin } from 'lucide-react';

export default function RootLayout() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Premium Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo Brand */}
          <Link to="/" className="flex items-center space-x-2 text-brand-600 font-extrabold text-xl tracking-tight">
            <div className="bg-brand-600 text-white p-2 rounded-xl shadow-md shadow-brand-200">
              <Car className="h-5 w-5" />
            </div>
            <span>EnterprisePool</span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-8 text-sm font-semibold text-slate-600">
            <Link to="/" className="hover:text-brand-600 transition-colors">Home</Link>
            {isAuthenticated && (
              <>
                <Link to="/dashboard" className="hover:text-brand-600 transition-colors">Dashboard</Link>
                <Link to="/rides" className="hover:text-brand-600 transition-colors flex items-center gap-1">
                  <MapPin className="h-4 w-4" /> Find Rides
                </Link>
              </>
            )}
          </nav>

          {/* Profile Actions */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <span className="hidden sm:inline-block text-sm font-medium text-slate-700">
                  Hi, {user.name || user.email}
                </span>
                <div className="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center border border-brand-200">
                  <User className="h-4 w-4 text-brand-600" />
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-600 rounded-full hover:bg-slate-100 transition-all duration-200"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex space-x-3">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-slate-700 px-4 py-2 hover:bg-slate-100 rounded-xl transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-semibold text-white bg-brand-600 px-4 py-2 hover:bg-brand-700 rounded-xl shadow-sm shadow-brand-100 hover:shadow-md transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Workspace */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm">© {new Date().getFullYear()} Enterprise Carpooling Platform. All rights reserved.</p>
          <div className="flex space-x-6 text-sm">
            <a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#terms" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#support" className="hover:text-white transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
