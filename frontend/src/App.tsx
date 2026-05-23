import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './context/AuthContext';
import ForceLightTheme from './components/ForceLightTheme';
import ErrorBoundary from './components/ErrorBoundary';

// Layouts
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages (will be fully implemented in subsequent steps)
import LandingPage from './app/page';
import LoginPage from './app/login/page';
import GoogleCallbackPage from './app/auth/callback/page';
import BookingsPage from './app/bookings/page';
import EventTypesPage from './app/event-types/page';
import AvailabilityPage from './app/availability/page';
import AnalyticsPage from './app/analytics/page';
import PublicBookingPage from './app/book/slug/page';
import ConfirmationPage from './app/confirmation/page';

export default function App() {
  return (
    <HelmetProvider>
      <ErrorBoundary>
        <AuthProvider>
          <BrowserRouter>
            <ForceLightTheme />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/auth/callback" element={<GoogleCallbackPage />} />
              
              {/* Public Dynamic Booking & Confirmation */}
              <Route path="/book/:slug" element={<PublicBookingPage />} />
              <Route path="/confirmation" element={<ConfirmationPage />} />

              {/* Protected Host Dashboard Space */}
              <Route element={<ProtectedRoute><Outlet /></ProtectedRoute>}>
                <Route path="/dashboard" element={<Navigate to="/bookings" replace />} />
                <Route path="/bookings" element={<BookingsPage />} />
                <Route path="/event-types" element={<EventTypesPage />} />
                <Route path="/availability" element={<AvailabilityPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
              </Route>

              {/* Fallback Catch All */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ErrorBoundary>
    </HelmetProvider>
  );
}
