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
import RideDetailsHistory from '../pages/RideDetailsHistory.jsx';
import ReviewsProfile from '../pages/ReviewsProfile.jsx';
import Reports from '../pages/Reports.jsx';
import Settings from '../pages/Settings.jsx';
import Notifications from '../pages/Notifications.jsx';
import NotificationSettings from '../pages/NotificationSettings.jsx';
import AdminDashboard from '../pages/admin/AdminDashboard.jsx';
import SystemDashboard from '../pages/system/SystemDashboard.jsx';
import SystemHealth from '../pages/system/SystemHealth.jsx';
import SystemLogs from '../pages/system/SystemLogs.jsx';
import SystemSettingsPage from '../pages/system/SystemSettingsPage.jsx';
import NotFound from '../pages/NotFound.jsx';
import ForgotPassword from '../pages/ForgotPassword.jsx';
import OtpVerification from '../pages/OtpVerification.jsx';
import CreateReport from '../pages/CreateReport.jsx';
import ReportHistory from '../pages/ReportHistory.jsx';
import Analytics from '../pages/Analytics.jsx';

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
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return (
    <div className="grid min-h-[50vh] place-items-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" />
    </div>
  );
  if (isAuthenticated) {
    return <Navigate to={user?.role === 'ADMIN' ? '/admin' : '/dashboard'} replace />;
  }
  return children;
};

export const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return (
    <div className="grid min-h-[50vh] place-items-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" />
    </div>
  );
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'ADMIN') return <Navigate to="/dashboard" replace />;
  return children;
};

export const EmployeeRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return (
    <div className="grid min-h-[50vh] place-items-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" />
    </div>
  );
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === 'ADMIN') return <Navigate to="/admin" replace />;
  return children;
};

const protect = (Page) => <ProtectedRoute><Page /></ProtectedRoute>;
const protectAdmin = (Page) => <AdminRoute><Page /></AdminRoute>;
const protectEmployee = (Page) => <EmployeeRoute><Page /></EmployeeRoute>;

export const appRoutes = [
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true,             element: <Home /> },
      { path: 'login',           element: <PublicRoute><Login /></PublicRoute> },
      { path: 'register',        element: <PublicRoute><Register /></PublicRoute> },
      { path: 'forgot-password', element: <PublicRoute><ForgotPassword /></PublicRoute> },
      { path: 'otp-verification', element: <PublicRoute><OtpVerification /></PublicRoute> },
      
      { path: 'profile-setup',   element: protect(ProfileSetup) },
      { path: 'dashboard',       element: protect(Dashboard) },

      // Module 6 — Ride search, booking, driver management
      { path: 'find-ride',       element: protectEmployee(FindRide) },
      { path: 'offer-ride',      element: protectEmployee(OfferRide) },
      { path: 'my-rides',        element: protectEmployee(MyRides) },

      // Module 7 — Trips, wallet, reports
      { path: 'my-trips',        element: protectEmployee(MyTrips) },
      { path: 'trips/:tripId',   element: protectEmployee(TripDetail) },
      
      { path: 'wallet',          element: <EmployeeRoute><LazyPage Component={WalletDashboard} /></EmployeeRoute> },
      { path: 'wallet/recharge', element: <EmployeeRoute><LazyPage Component={RechargeWallet} /></EmployeeRoute> },
      { path: 'wallet/history',  element: <EmployeeRoute><LazyPage Component={WalletHistory} /></EmployeeRoute> },
      { path: 'wallet/transactions', element: protectEmployee(TransactionHistory) },
      { path: 'wallet/transactions/:id', element: protectEmployee(PaymentDetailsPage) },
      
      { path: 'payment',         element: <EmployeeRoute><LazyPage Component={PaymentPage} /></EmployeeRoute> },
      { path: 'payment/history', element: <EmployeeRoute><LazyPage Component={PaymentHistory} /></EmployeeRoute> },
      { path: 'payment/:id',     element: <EmployeeRoute><LazyPage Component={PaymentDetails} /></EmployeeRoute> },
      
      { path: 'ride-history',    element: protect(RideHistory) },
      { path: 'ride-history/:rideId', element: protect(RideDetailsHistory) },
      
      { path: 'profile-reviews/:userId', element: protect(ReviewsProfile) },
      
      { path: 'reports',         element: protect(Reports) },
      { path: 'reports/create',  element: protect(CreateReport) },
      { path: 'reports/history', element: protect(ReportHistory) },
      { path: 'analytics',       element: protect(Analytics) },

      // Supporting pages
      { path: 'my-vehicle',      element: protectEmployee(MyVehicle) },
      { path: 'settings',        element: protect(Settings) },
      { path: 'notifications',   element: protect(Notifications) },
      { path: 'settings/notifications', element: protect(NotificationSettings) },

      // Module 13 — Enterprise Admin Dashboard
      { path: 'admin',           element: protectAdmin(AdminDashboard) },
      { path: 'system',          element: protectAdmin(SystemDashboard) },
      { path: 'system/health',   element: protectAdmin(SystemHealth) },
      { path: 'system/logs',     element: protectAdmin(SystemLogs) },
      { path: 'system/settings', element: protectAdmin(SystemSettingsPage) },

      { path: '*',               element: <NotFound /> },
    ],
  },
];

export default appRoutes;
