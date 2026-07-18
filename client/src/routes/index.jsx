import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import RootLayout from '../layouts/RootLayout.jsx';
import Home from '../pages/Home.jsx';
import Login from '../pages/Login.jsx';
import Register from '../pages/Register.jsx';
import ProfileSetup from '../pages/ProfileSetup.jsx';
import Dashboard from '../pages/Dashboard.jsx';
import FindRide from '../pages/FindRide.jsx';
import OfferRide from '../pages/OfferRide.jsx';
import MyTrips from '../pages/MyTrips.jsx';
import TripDetail from '../pages/TripDetail.jsx';
import MyVehicle from '../pages/MyVehicle.jsx';
import Wallet from '../pages/Wallet.jsx';
import RideHistory from '../pages/RideHistory.jsx';
import Reports from '../pages/Reports.jsx';
import Settings from '../pages/Settings.jsx';
import NotFound from '../pages/NotFound.jsx';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="grid min-h-[50vh] place-items-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

export const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="grid min-h-[50vh] place-items-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" /></div>;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
};

const protectedPage = (Page) => <ProtectedRoute><Page /></ProtectedRoute>;

export const appRoutes = [
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'login', element: <PublicRoute><Login /></PublicRoute> },
      { path: 'register', element: <PublicRoute><Register /></PublicRoute> },
      { path: 'profile-setup', element: protectedPage(ProfileSetup) },
      { path: 'dashboard', element: protectedPage(Dashboard) },
      { path: 'find-ride', element: protectedPage(FindRide) },
      { path: 'offer-ride', element: protectedPage(OfferRide) },
      { path: 'my-trips', element: protectedPage(MyTrips) },
      { path: 'trips/:tripId', element: protectedPage(TripDetail) },
      { path: 'my-vehicle', element: protectedPage(MyVehicle) },
      { path: 'wallet', element: protectedPage(Wallet) },
      { path: 'ride-history', element: protectedPage(RideHistory) },
      { path: 'reports', element: protectedPage(Reports) },
      { path: 'settings', element: protectedPage(Settings) },
      { path: '*', element: <NotFound /> },
    ],
  },
];

export default appRoutes;
