'use strict';
'use client';

import React, { useEffect, useState } from 'react';
import { Booking } from '@calclone/types';
import BookingService from '../../services/booking.service';
import BookingTabs from '../../components/dashboard/BookingTabs';
import BookingList from '../../components/dashboard/BookingList';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageContainer from '../../components/layout/PageContainer';
import BookingDetailsModal from '../../components/dashboard/BookingDetailsModal';
import CancelBookingModal from '../../components/dashboard/CancelBookingModal';
import dayjs from 'dayjs';

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error';
}

export default function BookingsDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'success' });

  // Modal State
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedCancelBooking, setSelectedCancelBooking] = useState<any | null>(null);
  const [isCancelOpen, setIsCancelOpen] = useState(false);

  // 1. Fetch bookings on initialization
  const loadBookings = async () => {
    try {
      setLoading(true);
      const data = await BookingService.fetchBookings();
      setBookings(data || []);
    } catch (err: any) {
      console.error('Failed to load bookings:', err);
      showToast(err.response?.data?.message || 'Failed to retrieve bookings from server.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  // 2. Trigger notification toast
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 4000);
  };

  // 3. Handle appointment cancellation confirm
  const handleCancelConfirm = async (payload: { reason: string; feedback: string; source: 'host' | 'attendee' }) => {
    if (!selectedCancelBooking) return;
    const id = selectedCancelBooking.id || selectedCancelBooking._id;
    const previousBookings = [...bookings];

    setBookings((prev) =>
      prev.map((b) => {
        const bid = b.id || (b as any)._id;
        if (bid === id) {
          return { ...b, status: 'cancelled' };
        }
        return b;
      })
    );

    try {
      await BookingService.cancelBooking(id, payload);
      showToast('Booking cancelled successfully.', 'success');
      loadBookings();
    } catch (err: any) {
      console.error('Failed to cancel booking:', err);
      // Revert optimistic updates on error
      setBookings(previousBookings);
      showToast(err.response?.data?.message || 'Failed to cancel the booking appointment.', 'error');
    }
  };

  // 4. Divide bookings based on chronological target times
  const upcomingBookings = bookings.filter((b) => {
    const isCancelled = b.status === 'cancelled';
    const isCompleted = b.status === 'completed';
    const isPast = dayjs(b.startTime).isBefore(dayjs());
    return !isCancelled && !isCompleted && !isPast;
  });

  const pastBookings = bookings
    .filter((b) => {
      const isCancelled = b.status === 'cancelled';
      const isCompleted = b.status === 'completed';
      const isPast = dayjs(b.startTime).isBefore(dayjs());
      return isCancelled || isCompleted || isPast;
    })
    .sort((a, b) => dayjs(b.startTime).diff(dayjs(a.startTime))); // Latest past booking first

  const activeBookingsList = activeTab === 'upcoming' ? upcomingBookings : pastBookings;

  return (
    <DashboardLayout>
      <PageContainer>
        {/* Dynamic Alert Banner */}
        {toast.show && (
          <div className={`fixed top-4 right-4 z-50 flex items-center px-4 py-3 rounded-xl border shadow-lg transition-all duration-300 transform translate-y-0 ${
            toast.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900'
              : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-900'
          }`}>
            <span className="text-xs font-semibold">{toast.message}</span>
          </div>
        )}

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Bookings
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Monitor and manage guest reservations, calendar slot assignments, and cancellations.
            </p>
          </div>

          {/* Tab Selection */}
          <div className="bg-white border border-gray-150 rounded-2xl p-2 shadow-sm dark:bg-gray-900 dark:border-gray-800/80">
            <BookingTabs
              activeTab={activeTab}
              onChange={setActiveTab}
              upcomingCount={upcomingBookings.length}
              pastCount={pastBookings.length}
            />

            <div className="mt-6 p-2 sm:p-4">
              <BookingList
                bookings={activeBookingsList}
                loading={loading}
                tab={activeTab}
                onCancelClick={(booking) => {
                  setSelectedCancelBooking(booking);
                  setIsCancelOpen(true);
                }}
                onClickDetails={(id) => {
                  setSelectedBookingId(id);
                  setIsDetailsOpen(true);
                }}
              />
            </div>
          </div>
        </div>

        {/* Details Modal */}
        {selectedBookingId && (
          <BookingDetailsModal
            isOpen={isDetailsOpen}
            onClose={() => {
              setIsDetailsOpen(false);
              setSelectedBookingId(null);
            }}
            bookingId={selectedBookingId}
            onRefresh={loadBookings}
          />
        )}

        {/* Advanced Cancellation Modal */}
        {selectedCancelBooking && (
          <CancelBookingModal
            isOpen={isCancelOpen}
            onClose={() => {
              setIsCancelOpen(false);
              setSelectedCancelBooking(null);
            }}
            booking={selectedCancelBooking}
            onConfirm={handleCancelConfirm}
          />
        )}
      </PageContainer>
    </DashboardLayout>
  );
}
