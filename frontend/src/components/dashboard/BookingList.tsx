import React from 'react';
import { Booking } from '@calclone/types';
import BookingCard from './BookingCard';
import EmptyBookings from './EmptyBookings';

interface BookingListProps {
  bookings: Booking[];
  loading: boolean;
  tab: 'upcoming' | 'past';
  onCancelClick: (booking: Booking) => void;
  onClickDetails: (id: string) => void;
}

export const BookingList: React.FC<BookingListProps> = ({
  bookings,
  loading,
  tab,
  onCancelClick,
  onClickDetails,
}) => {
  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-28 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-2xl border border-gray-150 dark:border-gray-800/80"
          />
        ))}
      </div>
    );
  }

  if (bookings.length === 0) {
    return <EmptyBookings tab={tab} />;
  }

  return (
    <div className="flex flex-col gap-4">
      {bookings.map((booking) => (
        <BookingCard
          key={booking.id || (booking as any)._id}
          booking={booking}
          onCancelClick={onCancelClick}
          onClickDetails={onClickDetails}
        />
      ))}
    </div>
  );
};

export default BookingList;
