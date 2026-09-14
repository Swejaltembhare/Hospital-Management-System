import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Stethoscope,
  CalendarPlus,
  CalendarCheck,
  LogOut,
  Menu,
  X,
  HeartPulse,
  ChevronDown,
} from 'lucide-react';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { path: '/patient/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/patient/doctors', label: 'Find Doctors', icon: Stethoscope },
  { path: '/patient/book-appointment', label: 'Book Appointment', icon: CalendarPlus },
  { path: '/patient/appointments', label: 'My Appointments', icon: CalendarCheck },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Monitor scroll height to apply active elevation styling
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Dismiss mobile side drawer when browser width expands to desktop breakpoint
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Dismiss profile dropdown on outside clicks
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isDropdownOpen && !e.target.closest('.dropdown-container')) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const userInitial = user?.fullName?.charAt(0)?.toUpperCase() || 'P';
  const userName = user?.fullName || 'Patient';
  const userEmail = user?.email || 'patient@email.com';

  return (
    <>
      {/* Sticky Primary Header Navbar */}
      <nav
        className={`sticky top-0 z-50 w-full bg-white border-b border-slate-200/80 transition-shadow duration-300 font-sans ${
          isScrolled ? 'shadow-md shadow-slate-200/50' : 'shadow-2xs'
        }`}
      >
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
          <div className="flex items-center justify-between h-16 sm:h-20">
            
            {/* Standardized MediCare Brand Logo */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors"
                aria-label="Open navigation menu"
              >
                <Menu className="h-5 w-5 text-slate-700" />
              </button>

              <Link to="/" className="flex items-center gap-3 group">
                <div className="relative">
                  <div className="absolute inset-0 rounded-2xl bg-emerald-600 blur-xs opacity-30 group-hover:opacity-60 transition" />
                  <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-emerald-700 flex items-center justify-center shadow-sm">
                    <HeartPulse className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                </div>

                <div className="hidden sm:block">
                  <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-none">
                    MediCare
                  </h1>
                  <p className="text-[10px] sm:text-[11px] uppercase tracking-widest text-slate-500 font-bold mt-0.5">
                    Hospital Management System
                  </p>
                </div>
              </Link>
            </div>

            {/* Desktop Link Item Menu */}
            <div className="hidden lg:flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
                      isActive
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'text-slate-700 hover:text-emerald-700 hover:bg-slate-100/80'
                    }`
                  }
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>

            {/* Patient Account Dropdown Container */}
            <div className="relative dropdown-container">
              <button
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2.5 p-1.5 pr-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Profile menu"
              >
                <div className="relative">
                  <div className="h-9 w-9 rounded-full bg-emerald-700 flex items-center justify-center text-white font-bold text-sm shadow-2xs">
                    {userInitial}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-emerald-500 rounded-full border-2 border-white" />
                </div>

                <div className="hidden lg:block text-left">
                  <p className="text-sm font-bold text-slate-900 leading-tight">
                    {userName}
                  </p>
                </div>

                <ChevronDown
                  className={`hidden lg:block h-4 w-4 text-slate-400 transition-transform duration-200 ${
                    isDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 p-2"
                  >
                    <div className="p-3 border-b border-slate-100 bg-slate-50/50 rounded-xl mb-1">
                      <p className="font-bold text-sm text-slate-900 truncate">{userName}</p>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{userEmail}</p>
                      <span className="inline-flex mt-2 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[11px] rounded-full font-bold border border-emerald-100">
                        Patient Account
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        handleLogout();
                      }}
                      className="flex items-center gap-3 w-full px-3 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    >
                      <LogOut className="h-4 w-4 text-rose-500" />
                      <span>Log Out</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </nav>

      {/* Responsive Mobile Drawer Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-80 bg-white shadow-2xl z-50 lg:hidden flex flex-col font-sans"
            >
              {/* Drawer Logo Banner */}
              <div className="flex items-center justify-between p-4 border-b border-slate-100">
                <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 group">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-2xl bg-emerald-600 blur-xs opacity-30 group-hover:opacity-60 transition" />
                    <div className="relative w-10 h-10 rounded-2xl bg-emerald-700 flex items-center justify-center shadow-sm">
                      <HeartPulse className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  <div>
                    <h1 className="text-lg font-extrabold text-slate-900 tracking-tight leading-none">
                      MediCare
                    </h1>
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mt-0.5">
                      Hospital Management System
                    </p>
                  </div>
                </Link>

                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5 text-slate-600" />
                </button>
              </div>

              {/* Drawer User Banner */}
              <div className="p-4 border-b border-slate-100 bg-emerald-50/40">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-full bg-emerald-700 flex items-center justify-center text-white font-bold text-base shadow-2xs">
                    {userInitial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{userName}</p>
                    <p className="text-xs text-slate-500 truncate">{userEmail}</p>
                  </div>
                </div>
              </div>

              {/* Drawer Links */}
              <div className="p-3 flex-1 overflow-y-auto space-y-1">
                {NAV_ITEMS.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                        isActive
                          ? 'bg-emerald-700 text-white shadow-2xs'
                          : 'text-slate-700 hover:bg-slate-100/80 hover:text-emerald-700'
                      }`
                    }
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>

              {/* Drawer Logout Action */}
              <div className="p-3 border-t border-slate-100">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <LogOut className="h-5 w-5 text-rose-500" />
                  <span>Log Out</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;