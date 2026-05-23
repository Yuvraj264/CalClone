import React from 'react';
import dayjs from 'dayjs';
import { cn } from '../../utils/cn';

interface BookingCalendarProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export const BookingCalendar: React.FC<BookingCalendarProps> = ({
  selectedDate,
  onSelectDate,
}) => {
  // Generate the next 7 future days starting tomorrow
  const days = Array.from({ length: 7 }, (_, i) => {
    return dayjs().add(i + 1, 'day');
  });

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-bold text-gray-900 dark:text-white">
        Select a Date
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
        {days.map((day) => {
          const dateStr = day.format('YYYY-MM-DD');
          const isSelected = selectedDate === dateStr;
          const dayName = day.format('ddd');
          const dayNum = day.format('D');
          const monthName = day.format('MMM');

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => onSelectDate(dateStr)}
              className={cn(
                'flex flex-col items-center justify-center p-3 border rounded-xl transition-all duration-150 focus:outline-none focus:ring-1 focus:ring-black',
                isSelected
                  ? 'bg-gray-900 border-transparent text-white dark:bg-white dark:text-black'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-300 dark:hover:border-gray-700'
              )}
            >
              <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">
                {dayName}
              </span>
              <span className="text-lg font-bold my-0.5">{dayNum}</span>
              <span className="text-[10px] uppercase font-semibold opacity-60">
                {monthName}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BookingCalendar;
