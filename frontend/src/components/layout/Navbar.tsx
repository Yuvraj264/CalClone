import React from 'react';
import { Menu, BookOpen } from 'lucide-react';
import { cn } from '../../utils/cn';

interface NavbarProps {
  onMenuClick?: () => void;
  className?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuClick, className }) => {
  return (
    <header
      className={cn(
        'flex md:hidden items-center justify-between px-6 h-16 bg-white dark:bg-black border-b border-gray-150 dark:border-gray-800/80 sticky top-0 z-40',
        className
      )}
    >
      <div className="flex items-center gap-2.5">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-black text-white dark:bg-white dark:text-black">
          <BookOpen className="w-4 h-4 font-bold" />
        </div>
        <span className="text-sm font-bold tracking-tight text-gray-900 dark:text-white">
          CalClone
        </span>
      </div>

      <button
        onClick={onMenuClick}
        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-850"
      >
        <Menu className="w-5 h-5" />
      </button>
    </header>
  );
};

export default Navbar;
