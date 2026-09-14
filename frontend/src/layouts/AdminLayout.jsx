import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/admin/Sidebar';
import Navbar from '../components/admin/Navbar';
import { Toaster } from 'react-hot-toast';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Toaster position="top-right" />
      
      {/* Desktop Persistent Sidebar Drawer */}
      <div className="hidden lg:block">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      </div>

      {/* Mobile Slide-over Sidebar Drawer */}
      <div className="lg:hidden">
        <Sidebar
          open={mobileSidebarOpen}
          setOpen={setMobileSidebarOpen}
          mobile
          onClose={() => setMobileSidebarOpen(false)}
        />
      </div>

      {/* Main Administrative Page View Wrapper */}
      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? 'lg:pl-72' : 'lg:pl-0'
        }`}
      >
        <Navbar 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen}
          mobileSidebarOpen={mobileSidebarOpen}
          setMobileSidebarOpen={setMobileSidebarOpen}
        />
        <main className="p-4 sm:p-6 lg:p-8 mt-16">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;