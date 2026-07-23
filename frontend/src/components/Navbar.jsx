import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  Home, 
  Stethoscope, 
  Calendar,
  Pill,
  History 
} from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    setIsMenuOpen(false);
  };

  const navLinks = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/doctors', label: 'Doctors', icon: Stethoscope },
    { to: '/appointments', label: 'Appointments', icon: Calendar },
    { to: '/prescriptions', label: 'Prescriptions', icon: Pill },
    { to: '/history', label: 'History', icon: History },
  ];

  return (
    <nav className="bg-surface-container-lowest border-b border-outline-variant/30 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-on-primary">
              <span className="text-2xl">🏥</span>
            </div>
            <span className="text-headline-md text-primary font-bold hidden sm:block">MediPrecise</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-body-md text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1"
              >
                <link.icon size={18} />
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link to="/dashboard" className="flex items-center gap-2 px-3 py-2 text-body-md text-on-surface hover:bg-surface-container-low rounded-xl transition-colors">
                  <User size={18} />
                  <span>{user?.name || 'Profile'}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-label-md text-error hover:bg-error/10 rounded-xl transition-colors flex items-center gap-2"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 text-label-md text-primary hover:bg-primary/5 rounded-xl transition-colors">
                  Sign In
                </Link>
                <Link to="/register" className="px-4 py-2 bg-primary text-on-primary rounded-xl text-label-md hover:bg-primary-container transition-all shadow-md hover:shadow-lg">
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-surface-container-low transition-colors"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-surface-container-lowest border-t border-outline-variant/30">
          <div className="px-4 py-3 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="flex items-center gap-3 px-3 py-2 text-body-md text-on-surface-variant hover:bg-surface-container-low rounded-xl transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <link.icon size={20} />
                {link.label}
              </Link>
            ))}
            
            <div className="pt-3 border-t border-outline-variant/30">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-3 px-3 py-2 text-body-md text-on-surface hover:bg-surface-container-low rounded-xl transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User size={20} />
                    {user?.name || 'Profile'}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 text-body-md text-error hover:bg-error/10 rounded-xl transition-colors"
                  >
                    <LogOut size={20} />
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-center text-label-md text-primary hover:bg-primary/5 rounded-xl transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 text-center bg-primary text-on-primary rounded-xl text-label-md hover:bg-primary-container transition-all"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;