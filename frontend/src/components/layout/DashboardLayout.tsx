import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import MobileSidebar from './MobileSidebar';

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50/50 dark:bg-black">
      {/* Sticky Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Body */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Mobile Navbar */}
        <Navbar onMenuClick={() => setIsMobileOpen(true)} />

        {/* Animated Mobile Drawer */}
        <MobileSidebar isOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)} />

        {/* Children Render viewport */}
        <main className="flex-1 overflow-y-auto">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
