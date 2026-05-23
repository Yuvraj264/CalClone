import React from 'react';

interface BookingTabsProps {
  activeTab: 'upcoming' | 'past';
  onChange: (tab: 'upcoming' | 'past') => void;
  upcomingCount?: number;
  pastCount?: number;
}

export const BookingTabs: React.FC<BookingTabsProps> = ({
  activeTab,
  onChange,
  upcomingCount = 0,
  pastCount = 0,
}) => {
  return (
    <div className="flex border-b border-gray-150 dark:border-gray-800">
      <button
        onClick={() => onChange('upcoming')}
        className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all duration-150 ${
          activeTab === 'upcoming'
            ? 'border-gray-900 text-gray-900 dark:border-white dark:text-white'
            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
        }`}
      >
        <span>Upcoming</span>
        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
          activeTab === 'upcoming'
            ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-white'
            : 'bg-gray-50 text-gray-400 dark:bg-gray-800/40 dark:text-gray-500'
        }`}>
          {upcomingCount}
        </span>
      </button>

      <button
        onClick={() => onChange('past')}
        className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all duration-150 ${
          activeTab === 'past'
            ? 'border-gray-900 text-gray-900 dark:border-white dark:text-white'
            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
        }`}
      >
        <span>Past</span>
        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
          activeTab === 'past'
            ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-white'
            : 'bg-gray-50 text-gray-400 dark:bg-gray-800/40 dark:text-gray-500'
        }`}>
          {pastCount}
        </span>
      </button>
    </div>
  );
};

export default BookingTabs;
