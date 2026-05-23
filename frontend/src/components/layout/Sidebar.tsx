import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar,
  Clock,
  Link as LinkIcon,
  BookOpen,
  LogOut,
  ChevronDown,
  BarChart3,
} from 'lucide-react';
import { cn } from '../../utils/cn';

interface SidebarProps {
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const [popoverOpen, setPopoverOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setPopoverOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navigation = [
    { name: 'Bookings', href: '/bookings', icon: Calendar },
    { name: 'Event Types', href: '/event-types', icon: LinkIcon },
    { name: 'Availability', href: '/availability', icon: Clock },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  ];

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col w-64 bg-white border-r border-gray-150 h-screen sticky top-0 font-sans',
        className
      )}
    >
      {/* Sidebar Header Brand Logo */}
      <div className="flex items-center gap-2.5 px-6 h-16 border-b border-gray-150">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-black text-white">
          <BookOpen className="w-4 h-4 font-bold" />
        </div>
        <span className="text-sm font-bold tracking-tight text-gray-900">
          CalClone
        </span>
      </div>

      {/* Navigation Panel */}
      <nav className="flex-1 px-4 py-6 flex flex-col gap-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 text-sm font-semibold rounded-xl transition-all duration-150',
                isActive
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              )}
            >
              <Icon className={cn('w-4 h-4', isActive ? 'text-gray-900' : 'text-gray-400')} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer User Avatar popover controls */}
      <div className="p-4 border-t border-gray-150 relative" ref={popoverRef}>
        <button
          onClick={() => setPopoverOpen(!popoverOpen)}
          className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 active:bg-gray-100/70 border border-transparent hover:border-gray-100 transition text-left focus:outline-none"
        >
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.fullName || 'User'}
              className="w-8 h-8 rounded-full border border-gray-100"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-700">
              {user?.fullName?.[0] || 'U'}
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-900 truncate">
              {user?.fullName || 'User Account'}
            </p>
            <p className="text-[10px] text-gray-500 truncate">
              {user?.email || 'host@calclone.com'}
            </p>
          </div>
          <ChevronDown size={14} className="text-gray-400 shrink-0" />
        </button>

        {/* Dropdown Menu */}
        {popoverOpen && (
          <div className="absolute left-4 right-4 bottom-20 bg-white rounded-2xl border border-gray-150 shadow-lg p-1.5 flex flex-col gap-0.5 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
            <button
              onClick={async () => {
                setPopoverOpen(false);
                await logout();
              }}
              className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition w-full text-left"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              <span>Sign out</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
