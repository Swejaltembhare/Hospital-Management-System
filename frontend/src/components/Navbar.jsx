import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  HeartPulse,
  Stethoscope,
  UserCheck,
  ShieldCheck,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
    navigate("/");
  };

  const getDashboardLink = () => {
    if (!user) return "/";
    switch (user.role) {
      case "patient":
        return "/patient/dashboard";
      case "doctor":
        return "/doctor/dashboard";
      case "admin":
        return "/admin/dashboard";
      default:
        return "/";
    }
  };

  const getRoleIcon = () => {
    if (!user) return null;
    switch (user.role) {
      case "patient":
        return <UserCheck className="w-4 h-4 text-emerald-600" />;
      case "doctor":
        return <Stethoscope className="w-4 h-4 text-emerald-600" />;
      case "admin":
        return <ShieldCheck className="w-4 h-4 text-teal-600" />;
      default:
        return null;
    }
  };

  return (
    <nav className="w-full bg-white border-b border-slate-200 sticky top-0 z-50 shadow-2xs font-sans">
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo Banner */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-emerald-600 blur-xs opacity-30 group-hover:opacity-60 transition" />
                <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-emerald-700 flex items-center justify-center shadow-sm">
                  <HeartPulse className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>

              <div>
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
          <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  to={getDashboardLink()}
                  className="text-slate-700 hover:text-emerald-700 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors"
                >
                  Dashboard
                </Link>

                {user?.role === "patient" && (
                  <>
                    <Link
                      to="/patient/doctors"
                      className="text-slate-700 hover:text-emerald-700 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors"
                    >
                      Doctors
                    </Link>
                    <Link
                      to="/patient/appointments"
                      className="text-slate-700 hover:text-emerald-700 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors"
                    >
                      Appointments
                    </Link>
                  </>
                )}

                {user?.role === "doctor" && (
                  <Link
                    to="/doctor/appointments"
                    className="text-slate-700 hover:text-emerald-700 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors"
                  >
                    Appointments
                  </Link>
                )}

                <div className="flex items-center space-x-3 border-l border-slate-200 pl-4 ml-2">
                  <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80">
                    {getRoleIcon()}
                    <span className="text-xs font-bold text-slate-800">
                      {user?.fullName}
                    </span>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-slate-700 hover:text-emerald-700 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-2xs transition-all cursor-pointer"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Drawer Navigation Trigger */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-slate-700 hover:text-emerald-700 p-2 rounded-xl focus:outline-none cursor-pointer"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu Content */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 shadow-md">
          <div className="px-4 pt-2 pb-4 space-y-1 font-medium">
            {isAuthenticated ? (
              <>
                <Link
                  to={getDashboardLink()}
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-xl text-sm font-bold text-slate-800 hover:text-emerald-700 hover:bg-slate-50"
                >
                  Dashboard
                </Link>

                {user?.role === "patient" && (
                  <>
                    <Link
                      to="/patient/doctors"
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-3 py-2.5 rounded-xl text-sm font-bold text-slate-800 hover:text-emerald-700 hover:bg-slate-50"
                    >
                      Doctors
                    </Link>
                    <Link
                      to="/patient/appointments"
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-3 py-2.5 rounded-xl text-sm font-bold text-slate-800 hover:text-emerald-700 hover:bg-slate-50"
                    >
                      Appointments
                    </Link>
                  </>
                )}

                {user?.role === "doctor" && (
                  <Link
                    to="/doctor/appointments"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-2.5 rounded-xl text-sm font-bold text-slate-800 hover:text-emerald-700 hover:bg-slate-50"
                  >
                    Appointments
                  </Link>
                )}

                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl">
                    {getRoleIcon()}
                    <span className="text-xs font-bold text-slate-800">
                      {user?.fullName} ({user?.role})
                    </span>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold text-rose-600 hover:bg-rose-50 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-2 pt-1">
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full text-center px-4 py-2.5 rounded-xl text-sm font-bold border border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full text-center px-4 py-2.5 rounded-xl text-sm font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-2xs"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;