import React from 'react';
import { Calendar } from 'lucide-react';

interface EmptyBookingsProps {
  tab: 'upcoming' | 'past';
}

export const EmptyBookings: React.FC<EmptyBookingsProps> = ({ tab }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white border border-gray-150 rounded-2xl shadow-sm dark:bg-gray-900 dark:border-gray-800/80">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-50 text-gray-400 dark:bg-gray-800 dark:text-gray-500 mb-4">
        <Calendar className="w-6 h-6" aria-hidden="true" />
      </div>
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
        No {tab} bookings found
      </h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-sm">
        {tab === 'upcoming'
          ? "You don't have any upcoming scheduling appointments. Share your booking links to invite attendees!"
          : 'Your historical records are empty. Completed and cancelled booking sessions will be archived here.'}
      </p>
    </div>
  );
};

export default EmptyBookings;
