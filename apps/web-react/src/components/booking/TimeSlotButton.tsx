import React from 'react';
import { cn } from '../../utils/cn';
import dayjs from 'dayjs';

interface TimeSlotButtonProps {
  time: string;
  selectedTime: string;
  onSelectTime: (time: string) => void;
}

export const TimeSlotButton: React.FC<TimeSlotButtonProps> = ({
  time,
  selectedTime,
  onSelectTime,
}) => {
  const isSelected = selectedTime === time;

  // Safely format the date-time ISO string or fallback if already formatted
  const displayTime = time.includes('T') ? dayjs(time).format('hh:mm A') : time;

  return (
    <button
      type="button"
      onClick={() => onSelectTime(time)}
      className={cn(
        'w-full py-2.5 px-4 text-sm font-semibold rounded-xl border text-center transition-all duration-150 focus:outline-none focus:ring-1 focus:ring-black',
        isSelected
          ? 'bg-gray-900 border-transparent text-white dark:bg-white dark:text-black'
          : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-350 dark:hover:border-gray-700'
      )}
    >
      {displayTime}
    </button>
  );
};

export default TimeSlotButton;
