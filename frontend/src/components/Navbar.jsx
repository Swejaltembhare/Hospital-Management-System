import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUserMd, FaHospitalUser, FaUserShield, FaSignOutAlt, FaBars, FaTimes, FaHeartbeat } from 'react-icons/fa';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    switch(user.role) {
      case 'patient': return '/patient/dashboard';
      case 'doctor': return '/doctor/dashboard';
      case 'admin': return '/admin/dashboard';
      default: return '/';
    }
  };

  const getRoleIcon = () => {
    if (!user) return null;
    switch(user.role) {
      case 'patient': return <FaHospitalUser className="text-blue-500" />;
      case 'doctor': return <FaUserMd className="text-green-500" />;
      case 'admin': return <FaUserShield className="text-purple-500" />;
      default: return null;
    }
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-full max-w-7 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link
              to="/"
              className="flex items-center gap-3 group"
            >
              {/* Logo */}
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 blur-md opacity-30 group-hover:opacity-60 transition"></div>

                <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-600 flex items-center justify-center shadow-xl">
                  <FaHeartbeat className="text-white text-2xl" />
                </div>
              </div>

              {/* Text */}
              <div>
                <h1 className="text-xl font-extrabold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  MediCare
                </h1>

                <p className="text-[11px] uppercase tracking-widest text-gray-500">
                  Hospital Management System
                </p>
              </div>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link 
                  to={getDashboardLink()} 
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>
                
                {user?.role === 'patient' && (
                  <>
                    <Link to="/patient/doctors" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                      Doctors
                    </Link>
                    <Link to="/patient/appointments" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                      Appointments
                    </Link>
                  </>
                )}
                
                {user?.role === 'doctor' && (
                  <Link to="/doctor/appointments" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                    Appointments
                  </Link>
                )}

                <div className="flex items-center space-x-2 ml-4">
                  {getRoleIcon()}
                  <span className="text-sm font-medium text-gray-700">
                    {user?.fullName}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center text-red-600 hover:text-red-800 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    <FaSignOutAlt className="mr-1" />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  Login
                </Link>
                <Link to="/register" className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium">
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600 focus:outline-none"
            >
              {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {isAuthenticated ? (
              <>
                <Link to={getDashboardLink()} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">
                  Dashboard
                </Link>
                {user?.role === 'patient' && (
                  <>
                    <Link to="/patient/doctors" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">
                      Doctors
                    </Link>
                    <Link to="/patient/appointments" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">
                      Appointments
                    </Link>
                  </>
                )}
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-800 hover:bg-gray-50"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">
                  Login
                </Link>
                <Link to="/register" className="block px-3 py-2 rounded-md text-base font-medium bg-blue-600 text-white hover:bg-blue-700">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;