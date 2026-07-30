// src/pages/patient/PatientDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  CalendarCheck, 
  User, 
  Clock, 
  Star, 
  Calendar,
  FileText,
  Stethoscope,
  ChevronRight,
  Activity,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalAppointments: 0,
    upcomingAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0
  });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/patients/appointments`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const appointments = response.data.appointments || [];
      
      const now = new Date();
      const upcoming = appointments.filter(apt => 
        new Date(apt.date) >= now && apt.status === 'pending'
      );
      const completed = appointments.filter(apt => apt.status === 'completed');
      const cancelled = appointments.filter(apt => apt.status === 'cancelled');

      setStats({
        totalAppointments: appointments.length,
        upcomingAppointments: upcoming.length,
        completedAppointments: completed.length,
        cancelledAppointments: cancelled.length
      });

      setRecentAppointments(appointments.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusMap = {
      pending: { color: 'bg-amber-50 text-amber-700 border-amber-200', icon: AlertCircle },
      confirmed: { color: 'bg-blue-50 text-blue-700 border-blue-200', icon: CalendarCheck },
      completed: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle },
      cancelled: { color: 'bg-red-50 text-red-700 border-red-200', icon: XCircle }
    };
    const StatusIcon = statusMap[status]?.icon || AlertCircle;
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusMap[status]?.color || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
        <StatusIcon className="w-3 h-3 mr-1.5" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Skeleton loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            {/* Skeleton Welcome */}
            <div className="animate-pulse">
              <div className="h-10 w-64 bg-gray-200 rounded"></div>
              <div className="h-5 w-80 bg-gray-200 rounded mt-2"></div>
            </div>

            {/* Skeleton Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
                  <div className="flex items-center">
                    <div className="w-14 h-14 bg-gray-200 rounded-xl"></div>
                    <div className="ml-4 flex-1">
                      <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 mt-1"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Skeleton Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-8 bg-gray-200 rounded w-1/2 mt-2"></div>
                    </div>
                    <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Skeleton Recent */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse">
              <div className="px-6 py-4 border-b border-gray-100">
                <div className="h-6 bg-gray-200 rounded w-48"></div>
              </div>
              <div className="divide-y divide-gray-100">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="h-5 bg-gray-200 rounded w-40"></div>
                        <div className="h-4 bg-gray-200 rounded w-32 mt-1"></div>
                      </div>
                      <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative mb-10"
        >
          <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-3xl p-8 sm:p-10 overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
            
            <div className="relative z-10">
              <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                {getGreeting()}, {user?.fullName?.split(' ')[0] || 'Patient'}! 👋
              </h1>
              <p className="text-blue-100 mt-2 text-sm sm:text-base">
                Manage your appointments and health records from one place.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Quick Action Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          {[
            {
              to: "/patient/doctors",
              icon: Stethoscope,
              title: "Find Doctors",
              description: "Search and book appointment",
              gradient: "from-blue-500 to-blue-600",
              bgGradient: "from-blue-50 to-blue-100/50",
              iconBg: "bg-blue-100",
              iconColor: "text-blue-600"
            },
            {
              to: "/patient/appointments",
              icon: Calendar,
              title: "My Appointments",
              description: "View all appointments",
              gradient: "from-emerald-500 to-emerald-600",
              bgGradient: "from-emerald-50 to-emerald-100/50",
              iconBg: "bg-emerald-100",
              iconColor: "text-emerald-600"
            },
            {
              to: "/patient/medical-history",
              icon: FileText,
              title: "Medical History",
              description: "View reports and records",
              gradient: "from-purple-500 to-purple-600",
              bgGradient: "from-purple-50 to-purple-100/50",
              iconBg: "bg-purple-100",
              iconColor: "text-purple-600"
            }
          ].map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 * (index + 1) }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
            >
              <Link
                to={action.to}
                className={`block bg-gradient-to-br ${action.bgGradient} rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-white/50 backdrop-blur-sm group`}
              >
                <div className="flex items-center">
                  <div className={`${action.iconBg} p-3 rounded-xl`}>
                    <action.icon className={`w-6 h-6 ${action.iconColor}`} />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-base font-semibold text-slate-900">
                      {action.title}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {action.description}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Statistics Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8"
        >
          {[
            {
              icon: Users,
              label: "Total Appointments",
              value: stats.totalAppointments,
              gradient: "from-blue-500 to-blue-600",
              bgGradient: "from-blue-50 to-blue-100/50",
              iconBg: "bg-blue-100",
              iconColor: "text-blue-600"
            },
            {
              icon: CalendarCheck,
              label: "Upcoming",
              value: stats.upcomingAppointments,
              gradient: "from-emerald-500 to-emerald-600",
              bgGradient: "from-emerald-50 to-emerald-100/50",
              iconBg: "bg-emerald-100",
              iconColor: "text-emerald-600"
            },
            {
              icon: CheckCircle,
              label: "Completed",
              value: stats.completedAppointments,
              gradient: "from-purple-500 to-purple-600",
              bgGradient: "from-purple-50 to-purple-100/50",
              iconBg: "bg-purple-100",
              iconColor: "text-purple-600"
            },
            {
              icon: XCircle,
              label: "Cancelled",
              value: stats.cancelledAppointments,
              gradient: "from-red-500 to-red-600",
              bgGradient: "from-red-50 to-red-100/50",
              iconBg: "bg-red-100",
              iconColor: "text-red-600"
            }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 * (index + 1) }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className={`bg-gradient-to-br ${stat.bgGradient} rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-white/50 backdrop-blur-sm`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium">{stat.label}</p>
                  <motion.p 
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 + (index * 0.1) }}
                    className={`text-2xl sm:text-3xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}
                  >
                    {stat.value}
                  </motion.p>
                </div>
                <div className={`${stat.iconBg} p-2.5 sm:p-3 rounded-xl`}>
                  <stat.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.iconColor}`} />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Recent Appointments */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-white/50"
        >
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Recent Appointments
            </h2>
            <Link
              to="/patient/appointments"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors"
            >
              View All
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="divide-y divide-slate-100">
            {recentAppointments.length > 0 ? (
              <AnimatePresence>
                {recentAppointments.map((appointment, index) => (
                  <motion.div
                    key={appointment._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-blue-50/20 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate">
                        Dr. {appointment.doctor?.user?.fullName || 'Unknown'}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(appointment.date).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {appointment.timeSlot}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span className="text-slate-400">
                          {appointment.doctor?.specialization || 'General'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <StatusBadge status={appointment.status} />
                      <Link
                        to={`/patient/appointments/${appointment._id}`}
                        className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                        aria-label="View appointment details"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            ) : (
              <div className="px-6 py-12 text-center">
                <div className="text-6xl mb-4">📋</div>
                <p className="text-slate-500 font-medium">No appointments yet</p>
                <p className="text-sm text-slate-400 mt-1">Book your first appointment today</p>
                <Link
                  to="/patient/doctors"
                  className="inline-flex items-center gap-2 mt-4 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors text-sm font-medium shadow-lg shadow-blue-600/20"
                >
                  <Stethoscope className="w-4 h-4" />
                  Find a Doctor
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PatientDashboard;