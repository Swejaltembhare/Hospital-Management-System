// components/patient/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Stethoscope,
  CalendarPlus,
  CalendarCheck,
  Bell,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Hospital,
  ChevronDown,
} from 'lucide-react';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest('.dropdown-container')) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  // Navigation items
  const navItems = [
    { path: '/patient/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/patient/doctors', label: 'Find Doctors', icon: Stethoscope },
    { path: '/patient/book-appointment', label: 'Book Appointment', icon: CalendarPlus },
    { path: '/patient/appointments', label: 'My Appointments', icon: CalendarCheck },
  ];

  // Dropdown menu items
  const dropdownItems = [
    { label: 'My Profile', icon: User, path: '/patient/profile' },
    { label: 'Settings', icon: Settings, path: '/patient/settings' },
    { label: 'Logout', icon: LogOut, path: '/logout' },
  ];

  // Notifications data
  const notifications = [
    {
      id: 1,
      title: 'Appointment confirmed with Dr. Smith',
      time: '5 min ago',
    },
    {
      id: 2,
      title: 'Your lab results are ready',
      time: '1 hour ago',
    },
    {
      id: 3,
      title: 'Reminder: Follow-up visit tomorrow',
      time: '3 hours ago',
    },
  ];

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <>
      <nav
        className={`sticky top-0 z-50 w-full bg-white border-b border-gray-200/80 transition-shadow duration-300 ${
          isScrolled ? 'shadow-md shadow-gray-200/50' : 'shadow-sm'
        }`}
      >
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[72px] lg:h-[80px]">
            {/* Left Section - Logo */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                aria-label="Toggle menu"
              >
                <Menu className="h-5 w-5 text-gray-700" />
              </button>

              <NavLink
                to="/patient/dashboard"
                className="flex items-center gap-3 group"
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20 group-hover:shadow-blue-600/30 transition-shadow duration-300">
                    <Hospital className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="hidden sm:block">
                  <h2 className="text-lg font-semibold text-gray-900 leading-tight tracking-tight">
                    MediCare HMS
                  </h2>
                  <p className="text-xs text-gray-500 font-medium tracking-wide uppercase">
                    Patient Portal
                  </p>
                </div>
              </NavLink>
            </div>

            {/* Center Section - Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ease-in-out ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 hover:bg-blue-700'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100/80'
                    }`
                  }
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2">
              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(false)}
                  className="relative p-2.5 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5 text-gray-700" />
                  <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full ring-2 ring-white"></span>
                </button>
              </div>

              {/* Patient Profile */}
              <div className="relative dropdown-container">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                  aria-label="Profile menu"
                >
                  <div className="relative">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm shadow-md shadow-blue-600/20">
                      {user?.fullName?.charAt(0)?.toUpperCase() || 'P'}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></span>
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-medium text-gray-900 leading-tight">
                      {user?.fullName || 'Patient'}
                    </p>
                    <p className="text-xs text-gray-500 leading-tight">
                      ID: #{user?.patientId || '12345'}
                    </p>
                  </div>
                  <ChevronDown
                    className={`hidden lg:block h-4 w-4 text-gray-400 transition-transform duration-200 ${
                      isDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl shadow-gray-900/10 border border-gray-200/80 overflow-hidden z-50"
                    >
                      <div className="p-4 border-b border-gray-200/80">
                        <p className="font-semibold text-gray-900">
                          {user?.fullName || 'Patient'}
                        </p>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {user?.email || 'patient@email.com'}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="inline-flex px-2.5 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full font-medium border border-blue-100">
                            Patient
                          </span>                        </div>
                      </div>
                      <div className="py-1.5">
                        {dropdownItems.map((item) => (
                          <button
                            key={item.label}
                            onClick={() => {
                              if (item.label === 'Logout') {
                                handleLogout();
                              } else {
                                navigate(item.path);
                              }
                              setIsDropdownOpen(false);
                            }}
                            className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm transition-colors duration-150 ${
                              item.label === 'Logout'
                                ? 'text-red-600 hover:bg-red-50'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <item.icon
                              className={`h-4 w-4 ${
                                item.label === 'Logout'
                                  ? 'text-red-500'
                                  : 'text-gray-500'
                              }`}
                            />
                            <span>{item.label}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Slide-in Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-80 bg-white shadow-2xl z-50 lg:hidden"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200/80">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                    <Hospital className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 leading-tight">
                      MediCare HMS
                    </h2>
                    <p className="text-xs text-gray-500 font-medium tracking-wide uppercase">
                      Patient Portal
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>

              {/* Drawer Profile */}
              <div className="p-4 border-b border-gray-200/80 bg-gradient-to-br from-blue-50/50 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-lg shadow-md shadow-blue-600/20">
                    {user?.fullName?.charAt(0)?.toUpperCase() || 'P'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {user?.fullName || 'Patient'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email || 'patient@email.com'}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="inline-flex px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                        ID: #{user?.patientId || '12345'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Drawer Navigation */}
              <div className="p-3">
                <div className="space-y-1">
                  {navItems.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                            : 'text-gray-700 hover:bg-gray-100/80 hover:text-blue-600'
                        }`
                      }
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </NavLink>
                  ))}
                </div>

                {/* Drawer Divider */}
                <div className="my-4 border-t border-gray-200/80"></div>

                {/* Drawer Actions */}
                <div className="space-y-1">
                  {dropdownItems.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => {
                        if (item.label === 'Logout') {
                          handleLogout();
                        } else {
                          navigate(item.path);
                        }
                        setIsMobileMenuOpen(false);
                      }}
                      className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
                        item.label === 'Logout'
                          ? 'text-red-600 hover:bg-red-50'
                          : 'text-gray-700 hover:bg-gray-100/80 hover:text-blue-600'
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;