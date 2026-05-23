import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, Link as LinkIcon, BookOpen, LogOut, BarChart3 } from 'lucide-react';
import { cn } from '../../utils/cn';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileSidebar: React.FC<MobileSidebarProps> = ({ isOpen, onClose }) => {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  const handleSignOut = async () => {
    onClose();
    await logout();
  };

  const navigation = [
    { name: 'Bookings', href: '/bookings', icon: Calendar },
    { name: 'Event Types', href: '/event-types', icon: LinkIcon },
    { name: 'Availability', href: '/availability', icon: Clock },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex overflow-hidden font-sans">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-[1px]"
          />

          {/* Drawer Sidebar Content Panel */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative flex flex-col w-full max-w-xs bg-white border-r border-gray-150 h-full p-6 shadow-2xl z-10"
          >
            {/* Header with Close trigger */}
            <div className="flex items-center justify-between pb-6 border-b border-gray-150">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-black text-white">
                  <BookOpen className="w-4 h-4 font-bold" />
                </div>
                <span className="text-sm font-bold tracking-tight text-gray-900">
                  CalClone
                </span>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav list */}
            <nav className="flex-1 py-6 flex flex-col gap-1 overflow-y-auto">
              {navigation.map((item) => {
                const isActive = pathname.startsWith(item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={onClose}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-xl transition-all duration-150',
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

            {/* User card with dynamic logout */}
            <div className="pt-4 border-t border-gray-150 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
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
                <div className="flex flex-col min-w-0">
                  <p className="text-xs font-semibold text-gray-900 truncate">
                    {user?.fullName || 'User Account'}
                  </p>
                  <p className="text-[10px] text-gray-500 truncate">
                    {user?.email || 'host@calclone.com'}
                  </p>
                </div>
              </div>

              <button
                onClick={handleSignOut}
                className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition shrink-0"
                title="Sign out"
              >
                <LogOut className="w-4.5 h-4.5" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default MobileSidebar;
