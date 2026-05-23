import React from 'react';
import { Booking } from '@calclone/types';
import dayjs from 'dayjs';
import {
  Calendar,
  Clock,
  Mail,
  User,
} from 'lucide-react';
import BookingStatusBadge from './BookingStatusBadge';

interface BookingCardProps {
  booking: Booking;
  onCancelClick: (booking: Booking) => void;
  onClickDetails: (id: string) => void;
}

export const BookingCard: React.FC<BookingCardProps> = ({ booking, onCancelClick, onClickDetails }) => {
  const start = dayjs(booking.startTime);
  const end = dayjs(booking.endTime);

  const dateFormatted = start.format('dddd, MMMM D, YYYY');
  const timeRange = `${start.format('HH:mm')} - ${end.format('HH:mm')}`;

  const eventTitle = (booking.eventTypeId as any)?.title || 'Scheduled Meeting';

  const isCancelable =
    (((booking.status as any) === 'scheduled' || (booking.status as any) === 'confirmed' || (booking.status as any) === 'upcoming') &&
      start.isAfter(dayjs()));

  return (
    <div
      onClick={() => onClickDetails(booking.id || (booking as any)._id)}
      className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-white border border-gray-150 rounded-2xl shadow-sm hover:border-gray-300 dark:bg-gray-900 dark:border-gray-800/80 dark:hover:border-gray-700 cursor-pointer transition-all duration-150 gap-4"
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h4 className="text-sm font-bold text-gray-900 dark:text-white">
            {eventTitle}
          </h4>
          <BookingStatusBadge status={booking.status} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-4 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>{dateFormatted}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-gray-400" />
            <span>{timeRange}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <User className="w-4 h-4 text-gray-400" />
            <span>{booking.bookerName}</span>
          </div>

          <div className="flex items-center gap-1.5 sm:col-span-2 md:col-span-3">
            <Mail className="w-4 h-4 text-gray-400" />
            <a
              href={`mailto:${booking.bookerEmail}`}
              onClick={(e) => e.stopPropagation()}
              className="hover:underline text-gray-600 dark:text-gray-300"
            >
              {booking.bookerEmail}
            </a>
          </div>
        </div>
      </div>

      {isCancelable && (
        <div className="flex items-center md:justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCancelClick(booking);
            }}
            className="w-full md:w-auto px-4 py-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100/70 active:bg-rose-100 rounded-xl border border-rose-200/50 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/40 dark:hover:bg-rose-950/30 transition-all duration-150"
          >
            Cancel booking
          </button>
        </div>
      )}
    </div>
  );
};

export default BookingCard;
