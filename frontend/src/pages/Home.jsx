// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  CalendarIcon, 
  UserGroupIcon, 
  ClipboardDocumentListIcon, 
  ClockIcon,
  CheckBadgeIcon,
  UserPlusIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ChartBarIcon,
  BuildingOfficeIcon,
  HeartIcon
} from '@heroicons/react/24/outline';

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        } else {
          setStats(null);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
        setStats(null);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const getDashboardPath = () => {
    if (!isAuthenticated) return '/register';
    if (user?.role === 'patient') return '/patient/dashboard';
    if (user?.role === 'doctor') return '/doctor/dashboard';
    if (user?.role === 'admin') return '/admin/dashboard';
    return '/register';
  };

  const getButtonText = () => {
    if (!isAuthenticated) return 'Get Started';
    return 'Go to Dashboard';
  };

  const getHeroTitle = () => {
    if (!isAuthenticated) return 'Book Doctor Appointments in Seconds';
    if (user?.role === 'patient') return 'Welcome Back to Your Health Hub';
    if (user?.role === 'doctor') return 'Manage Your Practice Efficiently';
    if (user?.role === 'admin') return 'Hospital Management Dashboard';
    return 'Book Doctor Appointments in Seconds';
  };

  const getHeroSubtitle = () => {
    if (!isAuthenticated) {
      return 'Connect with trusted healthcare professionals, manage appointments, and access your medical records all in one place — anytime, anywhere.';
    }
    if (user?.role === 'patient') {
      return 'View your appointments, access prescriptions, and manage your health journey seamlessly.';
    }
    if (user?.role === 'doctor') {
      return 'Manage your schedule, view patient appointments, and provide quality care efficiently.';
    }
    if (user?.role === 'admin') {
      return 'Oversee hospital operations, manage staff, and track key performance metrics.';
    }
    return 'Connect with trusted healthcare professionals, manage appointments, and access your medical records all in one place — anytime, anywhere.';
  };

  const getCTATitle = () => {
    if (!isAuthenticated) return 'Ready to Get Started?';
    if (user?.role === 'patient') return 'Continue Your Health Journey';
    if (user?.role === 'doctor') return 'Manage Your Practice';
    if (user?.role === 'admin') return 'Manage Your Hospital';
    return 'Ready to Get Started?';
  };

  const getCTASubtitle = () => {
    if (!isAuthenticated) {
      return 'Join thousands of patients and healthcare providers on our platform.';
    }
    if (user?.role === 'patient') {
      return 'Access your dashboard to view appointments, prescriptions, and more.';
    }
    if (user?.role === 'doctor') {
      return 'Access your dashboard to manage appointments and patient care.';
    }
    if (user?.role === 'admin') {
      return 'Access your dashboard to manage hospital operations and analytics.';
    }
    return 'Join thousands of patients and healthcare providers on our platform.';
  };

  // Loading Skeleton for Stats
  const StatsSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-xl p-6 shadow-md border border-gray-100 animate-pulse">
          <div className="w-10 h-10 bg-gray-200 rounded-full mx-auto mb-3"></div>
          <div className="h-8 bg-gray-200 rounded w-24 mx-auto mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ========== HERO SECTION ========== */}
      <section className="w-full bg-gradient-to-br from-teal-600 via-cyan-700 to-blue-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 -right-40 w-96 h-96 bg-emerald-400 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-400 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-300 rounded-full blur-3xl"></div>
        </div>

        {/* Medical Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.03]">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="medical-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <circle cx="30" cy="30" r="3" fill="white" />
                <path d="M30 15 L30 45 M15 30 L45 30" stroke="white" strokeWidth="1.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#medical-pattern)" />
          </svg>
        </div>

        <div className="relative max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center max-w-4xl mx-auto">
            {/* Role Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-white/20">
              <ShieldCheckIcon className="w-4 h-4 text-emerald-300" />
              <span className="text-xs font-medium text-white/90">
                {isAuthenticated ? `Welcome, ${user?.name || user?.role}` : 'Secure & Trusted Platform'}
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 leading-tight">
              {getHeroTitle().split('in Seconds')[0]}
              {getHeroTitle().includes('in Seconds') && (
                <>
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-cyan-200 to-blue-200">
                    in Seconds
                  </span>
                </>
              )}
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-blue-100 max-w-2xl mx-auto mb-8 leading-relaxed">
              {getHeroSubtitle()}
            </p>

            {/* CTA Button - Role Aware */}
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to={getDashboardPath()}
                className="group bg-white text-teal-700 hover:bg-slate-50 px-8 py-3.5 rounded-xl text-base font-semibold transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                {getButtonText()}
                <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              {!isAuthenticated && (
                <Link
                  to="/login"
                  className="bg-transparent border-2 border-white/80 hover:bg-white/10 backdrop-blur-sm px-8 py-3.5 rounded-xl text-base font-semibold transition-all duration-300"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 80L60 70C120 60 240 40 360 35C480 30 600 30 720 35C840 40 960 50 1080 55C1200 60 1320 60 1380 60L1440 60V80H0Z" fill="#f1f5f9"/>
          </svg>
        </div>
      </section>

      {/* ========== FEATURES SECTION ========== */}
      <section className="w-full py-16 px-4 bg-slate-50">
        <div className="max-w-full mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 bg-teal-100 text-teal-700 rounded-full text-sm font-semibold mb-4">
              Features
            </span>
            <h2 className="text-2xl md:text-4xl font-bold text-slate-900 mb-3">
              {isAuthenticated && user?.role === 'patient'
                ? 'Everything You Need for Better Healthcare'
                : 'Comprehensive Healthcare Management'}
            </h2>
            <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto">
              {isAuthenticated && user?.role === 'patient'
                ? 'Manage your health journey with ease and confidence'
                : 'Streamline hospital operations with our complete solution'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {isAuthenticated && user?.role === 'patient' ? (
              <>
                <FeatureCard
                  icon={<CalendarIcon className="w-7 h-7 text-teal-600" />}
                  title="Easy Booking"
                  description="Book appointments with your preferred doctors in just a few clicks"
                  color="teal"
                />
                <FeatureCard
                  icon={<ClockIcon className="w-7 h-7 text-cyan-600" />}
                  title="Track Appointments"
                  description="View upcoming, past, and cancelled appointments at a glance"
                  color="cyan"
                />
                <FeatureCard
                  icon={<ClipboardDocumentListIcon className="w-7 h-7 text-emerald-600" />}
                  title="View Prescriptions"
                  description="Access your digital prescriptions and medical history securely"
                  color="emerald"
                />
                <FeatureCard
                  icon={<CheckBadgeIcon className="w-7 h-7 text-blue-600" />}
                  title="24/7 Access"
                  description="Manage your healthcare needs anytime from any device"
                  color="blue"
                />
              </>
            ) : (
              <>
                <FeatureCard
                  icon={<UserGroupIcon className="w-7 h-7 text-teal-600" />}
                  title="Doctor Management"
                  description="Manage doctor profiles, schedules, and availability with ease"
                  color="teal"
                />
                <FeatureCard
                  icon={<UserPlusIcon className="w-7 h-7 text-cyan-600" />}
                  title="Patient Portal"
                  description="Patients can book appointments and access their health records"
                  color="cyan"
                />
                <FeatureCard
                  icon={<CalendarIcon className="w-7 h-7 text-emerald-600" />}
                  title="Appointment Scheduling"
                  description="Real-time scheduling with automated conflict detection"
                  color="emerald"
                />
                <FeatureCard
                  icon={<ChartBarIcon className="w-7 h-7 text-blue-600" />}
                  title="Analytics Dashboard"
                  description="Complete system oversight with comprehensive analytics"
                  color="blue"
                />
              </>
            )}
          </div>
        </div>
      </section>

      {/* ========== LIVE STATS SECTION ========== */}
      <section className="w-full py-16 px-4 bg-white">
        <div className="max-w-full mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 bg-teal-100 text-teal-700 rounded-full text-sm font-semibold mb-4">
              Our Impact
            </span>
            <h2 className="text-2xl md:text-4xl font-bold text-slate-900">
              Making Healthcare Accessible
            </h2>
          </div>

          {loading ? (
            <StatsSkeleton />
          ) : stats && Object.keys(stats).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stats.patients !== undefined && (
                <StatCard
                  number={stats.patients}
                  label="Registered Patients"
                  icon={<UserGroupIcon className="w-7 h-7 mx-auto mb-3 text-teal-600" />}
                  color="teal"
                />
              )}
              {stats.doctors !== undefined && (
                <StatCard
                  number={stats.doctors}
                  label="Expert Doctors"
                  icon={<UserPlusIcon className="w-7 h-7 mx-auto mb-3 text-cyan-600" />}
                  color="cyan"
                />
              )}
              {stats.appointments !== undefined && (
                <StatCard
                  number={stats.appointments}
                  label="Appointments Booked"
                  icon={<CalendarIcon className="w-7 h-7 mx-auto mb-3 text-emerald-600" />}
                  color="emerald"
                />
              )}
              {stats.departments !== undefined && (
                <StatCard
                  number={stats.departments}
                  label="Departments"
                  icon={<BuildingOfficeIcon className="w-7 h-7 mx-auto mb-3 text-blue-600" />}
                  color="blue"
                />
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <p className="text-sm">No statistics available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* ========== CTA FOOTER SECTION ========== */}
      <section className="w-full py-16 px-4 bg-gradient-to-r from-teal-600 via-cyan-700 to-blue-800">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-2xl md:text-4xl font-bold mb-4">
            {getCTATitle()}
          </h2>
          <p className="text-base md:text-lg text-white/90 mb-6">
            {getCTASubtitle()}
          </p>
          <Link
            to={getDashboardPath()}
            className="inline-flex items-center gap-3 bg-white text-teal-700 hover:bg-slate-50 px-8 py-3.5 rounded-xl text-base font-semibold transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1"
          >
            {getButtonText()}
            <ArrowRightIcon className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

// ========== COMPONENTS ==========
const FeatureCard = ({ icon, title, description, color }) => {
  const colors = {
    teal: 'hover:border-teal-200 hover:shadow-teal-100',
    cyan: 'hover:border-cyan-200 hover:shadow-cyan-100',
    emerald: 'hover:border-emerald-200 hover:shadow-emerald-100',
    blue: 'hover:border-blue-200 hover:shadow-blue-100'
  };

  return (
    <div className={`bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-slate-100 ${colors[color]}`}>
      <div className="bg-gradient-to-br from-slate-50 to-white w-14 h-14 rounded-xl flex items-center justify-center mb-4 mx-auto">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-slate-900 mb-2 text-center">{title}</h3>
      <p className="text-sm text-slate-600 text-center leading-relaxed">{description}</p>
    </div>
  );
};

const StatCard = ({ number, label, icon, color }) => {
  const colors = {
    teal: 'border-teal-200 hover:shadow-teal-100',
    cyan: 'border-cyan-200 hover:shadow-cyan-100',
    emerald: 'border-emerald-200 hover:shadow-emerald-100',
    blue: 'border-blue-200 hover:shadow-blue-100'
  };

  return (
    <div className={`bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border ${colors[color]}`}>
      {icon}
      <div className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
        {typeof number === 'number' ? number.toLocaleString() : '—'}
      </div>
      <div className="text-sm text-slate-600 font-medium mt-1">{label}</div>
    </div>
  );
};

export default Home;