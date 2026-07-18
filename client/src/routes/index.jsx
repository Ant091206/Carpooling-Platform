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
import MyRides from '../pages/MyRides.jsx';
import MyTrips from '../pages/MyTrips.jsx';
import TripDetail from '../pages/TripDetail.jsx';
import MyVehicle from '../pages/MyVehicle.jsx';
import Wallet from '../pages/Wallet.jsx';
import TransactionHistory from '../pages/TransactionHistory.jsx';
import PaymentDetails from '../pages/PaymentDetails.jsx';
import RideHistory from '../pages/RideHistory.jsx';
import Reports from '../pages/Reports.jsx';
import Settings from '../pages/Settings.jsx';
import NotFound from '../pages/NotFound.jsx';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return (
    <div className="grid min-h-[50vh] place-items-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" />
    </div>
  );
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

export const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return (
    <div className="grid min-h-[50vh] place-items-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" />
    </div>
  );
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
};

const protect = (Page) => <ProtectedRoute><Page /></ProtectedRoute>;

export const appRoutes = [
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true,             element: <Home /> },
      { path: 'login',           element: <PublicRoute><Login /></PublicRoute> },
      { path: 'register',        element: <PublicRoute><Register /></PublicRoute> },
      { path: 'profile-setup',   element: protect(ProfileSetup) },
      { path: 'dashboard',       element: protect(Dashboard) },

      // Module 6 â€” Ride search, booking, driver management
      { path: 'find-ride',       element: protect(FindRide) },
      { path: 'offer-ride',      element: protect(OfferRide) },
      { path: 'my-rides',        element: protect(MyRides) },

      // Module 7 â€” Trips, wallet, reports
      { path: 'my-trips',        element: protect(MyTrips) },
      { path: 'trips/:tripId',   element: protect(TripDetail) },
      { path: 'wallet',          element: protect(Wallet) },
      { path: 'wallet/transactions', element: protect(TransactionHistory) },
      { path: 'wallet/transactions/:id', element: protect(PaymentDetails) },
      { path: 'ride-history',    element: protect(RideHistory) },
      { path: 'reports',         element: protect(Reports) },

      // Supporting pages
      { path: 'my-vehicle',      element: protect(MyVehicle) },
      { path: 'settings',        element: protect(Settings) },
      { path: '*',               element: <NotFound /> },
    ],
  },
];

export default appRoutes;

