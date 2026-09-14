import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  CalendarCheck,
  User,
  LogOut,
  Menu,
  X,
  HeartPulse,
  ChevronDown,
  Stethoscope,
} from 'lucide-react';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Monitor page scrolling position for header shadow
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Reset mobile menu drawer state on viewport resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle click events outside profile dropdown to dismiss menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest('.dropdown-container')) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  const navItems = [
    { path: '/doctor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/doctor/appointments', label: 'Appointments', icon: CalendarCheck },
  ];

  const dropdownItems = [
    { label: 'My Profile', icon: User, path: '/doctor/profile' },
    { label: 'Logout', icon: LogOut, path: '/logout' },
  ];

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <>
      {/* Primary Navigation Bar Container */}
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
                aria-label="Toggle menu"
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

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
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

            {/* Doctor Profile Menu Container */}
            <div className="flex items-center gap-2">
              <div className="relative dropdown-container">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                  aria-label="Profile menu"
                >
                  <div className="relative">
                    <div className="h-9 w-9 rounded-full bg-emerald-700 flex items-center justify-center text-white font-bold text-sm shadow-2xs">
                      {user?.fullName?.charAt(0)?.toUpperCase() || 'D'}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-emerald-500 rounded-full border-2 border-white" />
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-bold text-slate-900 leading-tight">
                      Dr. {user?.fullName || 'Doctor'}
                    </p>
                    <p className="text-xs text-slate-500 leading-tight">
                      {user?.specialization || user?.department || 'Doctor'}
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
                        <p className="font-bold text-sm text-slate-900 truncate">
                          Dr. {user?.fullName || 'Doctor'}
                        </p>
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {user?.email || 'doctor@email.com'}
                        </p>
                        <span className="inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[11px] rounded-full font-bold border border-emerald-100">
                          <Stethoscope className="h-3 w-3" />
                          {user?.department || 'Doctor'}
                        </span>
                      </div>
                      
                      <div className="space-y-0.5">
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
                            className={`flex items-center gap-3 w-full px-3 py-2.5 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                              item.label === 'Logout'
                                ? 'text-rose-600 hover:bg-rose-50'
                                : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <item.icon
                              className={`h-4 w-4 ${
                                item.label === 'Logout' ? 'text-rose-500' : 'text-slate-500'
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

      {/* Mobile Menu Drawer Overlay */}
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
              {/* Drawer Logo Header */}
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
                    {user?.fullName?.charAt(0)?.toUpperCase() || 'D'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">
                      Dr. {user?.fullName || 'Doctor'}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {user?.email || 'doctor@email.com'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Drawer Navigation Links */}
              <div className="p-3 flex-1 overflow-y-auto space-y-1">
                {navItems.map((item) => (
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

                <div className="my-3 border-t border-slate-100" />

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
                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
                      item.label === 'Logout'
                        ? 'text-rose-600 hover:bg-rose-50'
                        : 'text-slate-700 hover:bg-slate-100/80 hover:text-emerald-700'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;