import { lazy, Suspense } from 'react';
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
import PaymentDetailsPage from '../pages/PaymentDetails.jsx';
import RideHistory from '../pages/RideHistory.jsx';
import Reports from '../pages/Reports.jsx';
import Settings from '../pages/Settings.jsx';
import NotFound from '../pages/NotFound.jsx';

// Module 10 — Lazy-loaded Wallet & Payment pages
const WalletDashboard = lazy(() => import('../pages/Wallet/WalletDashboard.jsx'));
const RechargeWallet  = lazy(() => import('../pages/Wallet/RechargeWallet.jsx'));
const WalletHistory   = lazy(() => import('../pages/Wallet/WalletHistory.jsx'));
const PaymentPage     = lazy(() => import('../pages/Payment/PaymentPage.jsx'));
const PaymentHistory  = lazy(() => import('../pages/Payment/PaymentHistory.jsx'));
const PaymentDetails  = lazy(() => import('../pages/Payment/PaymentDetails.jsx'));

const LazyPage = ({ Component }) => (
  <Suspense fallback={<div className="grid min-h-[50vh] place-items-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" /></div>}>
    <Component />
  </Suspense>
);

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

      // Module 6 — Ride search, booking, driver management
      { path: 'find-ride',       element: protect(FindRide) },
      { path: 'offer-ride',      element: protect(OfferRide) },
      { path: 'my-rides',        element: protect(MyRides) },

      // Module 7 — Trips, wallet, reports
      { path: 'my-trips',        element: protect(MyTrips) },
      { path: 'trips/:tripId',   element: protect(TripDetail) },
      { path: 'wallet',          element: <ProtectedRoute><LazyPage Component={WalletDashboard} /></ProtectedRoute> },
      { path: 'wallet/recharge', element: <ProtectedRoute><LazyPage Component={RechargeWallet} /></ProtectedRoute> },
      { path: 'wallet/history',  element: <ProtectedRoute><LazyPage Component={WalletHistory} /></ProtectedRoute> },
      { path: 'wallet/transactions', element: protect(TransactionHistory) },
      { path: 'wallet/transactions/:id', element: protect(PaymentDetailsPage) },
      { path: 'payment',         element: <ProtectedRoute><LazyPage Component={PaymentPage} /></ProtectedRoute> },
      { path: 'payment/history', element: <ProtectedRoute><LazyPage Component={PaymentHistory} /></ProtectedRoute> },
      { path: 'payment/:id',     element: <ProtectedRoute><LazyPage Component={PaymentDetails} /></ProtectedRoute> },
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
