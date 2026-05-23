import React from 'react';

interface BookingStatusBadgeProps {
  status: 'scheduled' | 'cancelled' | 'completed' | 'confirmed' | string;
}

export const BookingStatusBadge: React.FC<BookingStatusBadgeProps> = ({ status }) => {
  const normalizedStatus = status.toLowerCase();

  const styles: Record<string, string> = {
    scheduled: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50',
    confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50',
    cancelled: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/50',
    completed: 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800/30 dark:text-gray-400 dark:border-gray-700/50',
  };

  const currentStyle = styles[normalizedStatus] || 'bg-blue-50 text-blue-700 border-blue-200';

  const labels: Record<string, string> = {
    scheduled: 'Scheduled',
    confirmed: 'Confirmed',
    cancelled: 'Cancelled',
    completed: 'Completed',
  };

  const label = labels[normalizedStatus] || status;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${currentStyle}`}>
      {label}
    </span>
  );
};

export default BookingStatusBadge;
