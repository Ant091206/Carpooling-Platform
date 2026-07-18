import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthLayout } from './layouts/AuthLayout';
import { MainLayout } from './layouts/MainLayout';

// Auth
import { Login } from './pages/auth/Login';

// Eager-loaded core pages
import { Dashboard } from './pages/dashboard/Dashboard';
import { Wallet } from './pages/wallet/Wallet';
import { Settings } from './pages/settings/Settings';
import { Vehicle } from './pages/vehicle/Vehicle';

// Module 6 — Rides
import { FindRide } from './pages/ride/FindRide';
import { OfferRide } from './pages/ride/OfferRide';
import { RideDetails } from './pages/ride/RideDetails';
import { MyRides } from './pages/ride/MyRides';

// Module 7 — Trips / Bookings
import { Trips } from './pages/trips/Trips';
import { TripDetail } from './pages/trips/TripDetail';

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent" />
    </div>
  );
}

function App() {
  return (
    <>
      <Router>
        <Routes>
          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Route>

          {/* Main App Routes */}
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/vehicle" element={<Vehicle />} />
            <Route path="/wallet" element={<Wallet />} />

            {/* Module 6 — Ride flows */}
            <Route path="/find-ride" element={<FindRide />} />
            <Route path="/offer-ride" element={<OfferRide />} />
            <Route path="/rides/:id" element={<RideDetails />} />
            <Route path="/my-rides" element={<MyRides />} />

            {/* Module 7 — Trip / Booking flows */}
            <Route path="/trips" element={<Trips />} />
            <Route path="/trips/:id" element={<TripDetail />} />
          </Route>
        </Routes>
      </Router>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#0f172a',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07)',
            fontSize: '14px',
            fontWeight: '500',
          },
          success: {
            iconTheme: { primary: '#16a34a', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#dc2626', secondary: '#fff' },
          },
        }}
      />
    </>
  );
}

export default App;
