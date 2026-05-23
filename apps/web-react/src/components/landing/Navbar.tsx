import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Menu, X, ArrowRight, User, Calendar, Clock, LogOut } from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const status = loading ? 'loading' : isAuthenticated ? 'authenticated' : 'unauthenticated';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await logout();
  };

  return (
    <header className="sticky top-0 z-50 w-full px-4 sm:px-8 py-3.5 bg-white/90 backdrop-blur-md border-b border-[#e5e7eb] transition-all font-sans animate-none">
      <ForceLightThemeInject />
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Left Logo */}
        <Link to="/" className="flex items-center gap-1.5 group">
          <span className="text-xl font-bold tracking-tight text-[#111111]">
            Cal<span className="text-gray-900">.com</span>
          </span>
        </Link>

        {/* Center Navigation Links - Desktop */}
        <nav className="hidden lg:flex items-center gap-1">
          <div className="relative group">
            <button className="px-3 py-1.5 rounded-md text-sm font-semibold text-[#6b6b6b] hover:text-[#111111] hover:bg-gray-50 flex items-center gap-1 transition">
              Solutions <ChevronDown size={14} className="text-gray-400 group-hover:text-gray-600 transition" />
            </button>
          </div>
          <Link to="/bookings" className="px-3 py-1.5 rounded-md text-sm font-semibold text-[#6b6b6b] hover:text-[#111111] hover:bg-gray-50 transition">
            Enterprise
          </Link>
          <Link to="/bookings" className="px-3 py-1.5 rounded-md text-sm font-semibold text-[#6b6b6b] hover:text-[#111111] hover:bg-gray-50 transition">
            Cal.ai
          </Link>
          <div className="relative group">
            <button className="px-3 py-1.5 rounded-md text-sm font-semibold text-[#6b6b6b] hover:text-[#111111] hover:bg-gray-50 flex items-center gap-1 transition">
              Developer <ChevronDown size={14} className="text-gray-400 group-hover:text-gray-600 transition" />
            </button>
          </div>
          <div className="relative group">
            <button className="px-3 py-1.5 rounded-md text-sm font-semibold text-[#6b6b6b] hover:text-[#111111] hover:bg-gray-50 flex items-center gap-1 transition">
              Resources <ChevronDown size={14} className="text-gray-400 group-hover:text-gray-600 transition" />
            </button>
          </div>
          <Link to="/bookings" className="px-3 py-1.5 rounded-md text-sm font-semibold text-[#6b6b6b] hover:text-[#111111] hover:bg-gray-50 transition">
            Pricing
          </Link>
        </nav>

        {/* Right CTA Actions */}
        <div className="hidden sm:flex items-center gap-5">
          {status === 'loading' ? (
            <div className="w-8 h-8 rounded-full bg-gray-150 animate-pulse border border-gray-200" />
          ) : status === 'authenticated' && user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 p-1 pr-3 hover:bg-gray-50 rounded-full border border-gray-150 transition focus:outline-none"
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.fullName || 'User'}
                    className="w-7 h-7 rounded-full border border-gray-100"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-700">
                    {user.fullName?.[0] || 'U'}
                  </div>
                )}
                <span className="text-xs font-bold text-gray-800 shrink-0">{user.fullName?.split(' ')[0]}</span>
                <ChevronDown size={12} className="text-gray-400" />
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.12 }}
                    className="absolute right-0 mt-2.5 w-52 bg-white rounded-2xl border border-gray-150 shadow-lg p-2 flex flex-col gap-0.5 z-50"
                  >
                    <div className="px-3 py-2 border-b border-gray-100 flex flex-col gap-0.5 mb-1.5">
                      <span className="text-xs font-bold text-gray-900 leading-tight truncate">{user.fullName}</span>
                      <span className="text-[10px] font-semibold text-gray-400 truncate">{user.email}</span>
                    </div>

                    <Link
                      to="/bookings"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition"
                    >
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>Bookings</span>
                    </Link>

                    <Link
                      to="/event-types"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition"
                    >
                      <User className="w-4 h-4 text-gray-400" />
                      <span>Event Types</span>
                    </Link>

                    <Link
                      to="/availability"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition"
                    >
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>Availability</span>
                    </Link>

                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition w-full text-left mt-1.5 border-t border-gray-100 pt-2"
                    >
                      <LogOut className="w-4 h-4 text-rose-400" />
                      <span>Sign out</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <Link 
                to="/login" 
                className="text-sm font-semibold text-[#6b6b6b] hover:text-[#111111] transition"
              >
                Sign in
              </Link>
              <Link 
                to="/login" 
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#111111] text-white hover:bg-black transition flex items-center gap-1.5 group"
              >
                Get started <ArrowRight size={14} className="group-hover:translate-x-0.5 transition" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-md hover:bg-gray-100 text-[#111111]"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

      </div>

      {/* Mobile navigation overlays */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-[68px] left-0 w-full bg-white border-b border-[#e5e7eb] px-6 py-6 flex flex-col gap-4 shadow-lg lg:hidden z-40"
          >
            <span className="text-base font-semibold text-[#111111] py-2 border-b border-gray-50">Solutions</span>
            <Link to="/bookings" className="text-base font-semibold text-[#111111] py-2 border-b border-gray-50">Enterprise</Link>
            <Link to="/bookings" className="text-base font-semibold text-[#111111] py-2 border-b border-gray-50">Cal.ai</Link>
            <span className="text-base font-semibold text-[#111111] py-2 border-b border-gray-50">Developer</span>
            <span className="text-base font-semibold text-[#111111] py-2 border-b border-gray-50">Resources</span>
            <Link to="/bookings" className="text-base font-semibold text-[#111111] py-2 border-b border-gray-50">Pricing</Link>
            
            <div className="flex flex-col gap-3 mt-4">
              {status === 'loading' ? (
                <div className="h-10 bg-gray-100 rounded-xl animate-pulse" />
              ) : status === 'authenticated' && user ? (
                <>
                  <div className="px-2 py-1.5 flex items-center gap-3 border-b border-gray-100 pb-3">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.fullName || 'User'} className="w-9 h-9 rounded-full" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-700">{user.fullName?.[0]}</div>
                    )}
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-bold text-gray-900 leading-tight">{user.fullName}</span>
                      <span className="text-[10px] text-gray-500">{user.email}</span>
                    </div>
                  </div>
                  <Link 
                    to="/bookings" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 rounded-lg text-center font-semibold text-[#111111] border border-gray-200 hover:bg-gray-50 transition"
                  >
                    Go to Dashboard
                  </Link>
                  <button 
                    onClick={handleSignOut}
                    className="w-full py-2.5 rounded-lg text-center font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 rounded-lg text-center font-medium text-[#111111] border border-gray-200 hover:bg-gray-50 transition"
                  >
                    Sign in
                  </Link>
                  <Link 
                    to="/login" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 rounded-lg text-center font-semibold bg-[#111111] text-white hover:bg-black transition"
                  >
                    Get started
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </header>
  );
};

// Reusable micro-inject helper
const ForceLightThemeInject = () => {
  useEffect(() => {
    const force = () => {
      document.documentElement.classList.remove('dark');
      document.body?.classList.remove('dark');
    };
    force();
    const interval = setInterval(force, 200);
    return () => clearInterval(interval);
  }, []);
  return null;
};
