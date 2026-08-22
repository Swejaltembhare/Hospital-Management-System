// src/pages/doctor/DoctorDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import Navbar from "../components/Navbar";
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  Users,
  Star,
  Activity,
  CheckCircle,
  XCircle,
  User,
  Plus,
  Edit,
  Trash2,
  Save,
  Eye,
  Check,
  X,
  Bell,
  TrendingUp,
  TrendingDown,
  CalendarCheck,
  FileText,
  Settings,
  ListChecks,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  format,
  parseISO,
  isToday,
  isFuture,
  addDays,
  isWithinInterval,
  startOfDay,
  endOfDay,
} from 'date-fns';
import toast from 'react-hot-toast';
import api from '../services/api';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  // ── Stats (4 cards only) ──────────────────────────────────────────
  const [stats, setStats] = useState({
    todayAppointments: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
    totalPatients: 0,
    averageRating: 0,
  });

  // ── Data states ───────────────────────────────────────────────────
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [recentPatients, setRecentPatients] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [notifications, setNotifications] = useState([]); // real API — no mock data
  const [revenue, setRevenue] = useState({ thisMonth: 0, lastMonth: 0, growth: 0 });

  // ── Availability form ─────────────────────────────────────────────
  const [showAvailabilityForm, setShowAvailabilityForm] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [availabilityForm, setAvailabilityForm] = useState({
    day: 'Monday',
    startTime: '09:00',
    endTime: '17:00',
  });

  // ── Custom delete modal (replaces window.confirm) ─────────────────
  const [deleteModal, setDeleteModal] = useState({ show: false, index: null });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // ── Fetch all dashboard data ──────────────────────────────────────
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      const [appointmentsRes, patientsRes, availabilityRes, reviewsRes] = await Promise.all([
        api.get('/doctor/appointments'),
        api.get('/doctor/patients'),
        api.get('/doctor/availability'),
        api.get('/doctor/ratings'),
      ]);

      const appointments = appointmentsRes.data.appointments || [];
      const todayApts = appointments.filter((apt) => isToday(parseISO(apt.date)));

      // Next 7 days (not today)
      const upcoming = appointments
        .filter((apt) => {
          const aptDate = parseISO(apt.date);
          return (
            !isToday(aptDate) &&
            isFuture(aptDate) &&
            isWithinInterval(aptDate, {
              start: startOfDay(addDays(new Date(), 1)),
              end: endOfDay(addDays(new Date(), 7)),
            })
          );
        })
        .slice(0, 10);

      // Revenue calculation from completed appointments
      const consultationFee = user?.consultationFee || 0;
      const now = new Date();
      const thisMonthCompleted = appointments.filter((apt) => {
        const d = parseISO(apt.date);
        return (
          apt.status === 'completed' &&
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      });
      const lastMonthNum = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
      const lastMonthYear =
        now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
      const lastMonthCompleted = appointments.filter((apt) => {
        const d = parseISO(apt.date);
        return (
          apt.status === 'completed' &&
          d.getMonth() === lastMonthNum &&
          d.getFullYear() === lastMonthYear
        );
      });
      const thisMonthRevenue = thisMonthCompleted.length * consultationFee;
      const lastMonthRevenue = lastMonthCompleted.length * consultationFee;
      const growth =
        lastMonthRevenue > 0
          ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
          : 0;

      setStats({
        todayAppointments: todayApts.length,
        pendingAppointments: appointments.filter((apt) => apt.status === 'pending').length,
        completedAppointments: appointments.filter((apt) => apt.status === 'completed').length,
        totalPatients: patientsRes.data.patients?.length || 0,
        averageRating: reviewsRes.data.averageRating || 0,
      });

      setTodayAppointments(todayApts.slice(0, 10));
      setUpcomingAppointments(upcoming);
      setAvailability(availabilityRes.data.availableSlots || []);
      setRecentPatients((patientsRes.data.patients || []).slice(0, 5));
      setPendingRequests(appointments.filter((apt) => apt.status === 'pending').slice(0, 5));
      setReviews(reviewsRes.data.reviews || []);
      setRevenue({ thisMonth: thisMonthRevenue, lastMonth: lastMonthRevenue, growth });
      // setNotifications(notificationsRes.data || []); // uncomment when API is ready
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // ── Availability Management ───────────────────────────────────────
  const handleAddAvailability = async () => {
    try {
      const newSlot = {
        day: availabilityForm.day,
        startTime: availabilityForm.startTime,
        endTime: availabilityForm.endTime,
      };
      const updatedSlots = [...availability, newSlot];
      await api.put('/doctor/availability', { availableSlots: updatedSlots });
      setAvailability(updatedSlots);
      setAvailabilityForm({ day: 'Monday', startTime: '09:00', endTime: '17:00' });
      setShowAvailabilityForm(false);
      toast.success('Availability slot added successfully');
    } catch (error) {
      console.error('Error adding availability:', error);
      toast.error('Failed to add availability slot');
    }
  };

  const handleEditAvailability = (index) => {
    const slot = availability[index];
    setEditingSlot(index);
    setAvailabilityForm({ day: slot.day, startTime: slot.startTime, endTime: slot.endTime });
    setShowAvailabilityForm(true);
  };

  const handleUpdateAvailability = async () => {
    try {
      const updatedSlots = [...availability];
      updatedSlots[editingSlot] = {
        day: availabilityForm.day,
        startTime: availabilityForm.startTime,
        endTime: availabilityForm.endTime,
      };
      await api.put('/doctor/availability', { availableSlots: updatedSlots });
      setAvailability(updatedSlots);
      setEditingSlot(null);
      setShowAvailabilityForm(false);
      setAvailabilityForm({ day: 'Monday', startTime: '09:00', endTime: '17:00' });
      toast.success('Availability slot updated successfully');
    } catch (error) {
      console.error('Error updating availability:', error);
      toast.error('Failed to update availability slot');
    }
  };

  // Open custom modal instead of window.confirm
  const handleDeleteAvailability = (index) => {
    setDeleteModal({ show: true, index });
  };

  const confirmDeleteAvailability = async () => {
    try {
      const updatedSlots = availability.filter((_, i) => i !== deleteModal.index);
      await api.put('/doctor/availability', { availableSlots: updatedSlots });
      setAvailability(updatedSlots);
      setDeleteModal({ show: false, index: null });
      toast.success('Availability slot deleted successfully');
    } catch (error) {
      console.error('Error deleting availability:', error);
      toast.error('Failed to delete availability slot');
      setDeleteModal({ show: false, index: null });
    }
  };

  const handleAppointmentAction = async (appointmentId, action) => {
    try {
      await api.put(`/doctor/appointments/${appointmentId}/${action}`);
      toast.success(`Appointment ${action}ed successfully`);
      fetchDashboardData();
    } catch (error) {
      console.error(`Error ${action} appointment:`, error);
      toast.error(`Failed to ${action} appointment`);
    }
  };

  // ── Loading Skeleton ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gray-200 rounded-full animate-pulse"></div>
              <div>
                <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
              </div>
            </div>
            <div className="h-10 bg-gray-200 rounded-xl w-32 animate-pulse"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">

        {/* ── Custom Delete Modal ─────────────────────────────────── */}
        <AnimatePresence>
          {deleteModal.show && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-white/20"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 bg-red-50 rounded-xl">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">Delete Slot</h3>
                    <p className="text-sm text-gray-500">This action cannot be undone</p>
                  </div>
                </div>
                <p className="text-gray-600 mb-6 text-sm">
                  Are you sure you want to delete this availability slot?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={confirmDeleteAvailability}
                    className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-2.5 rounded-xl font-medium hover:shadow-lg transition-all"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setDeleteModal({ show: false, index: null })}
                    className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Header Section ──────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg p-6 mb-8 border border-white/20"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center">
                  {user?.profilePhoto ? (
                    <img
                      src={user.profilePhoto}
                      alt={user.fullName}
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  ) : (
                    <User className="w-10 h-10 text-white" />
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1.5 border-2 border-white">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                  Welcome Back, Dr. {user?.fullName?.split(' ')[0] || 'Doctor'}!
                </h1>
                <p className="text-gray-600 mt-1">
                  {user?.department || 'Department'} • {user?.specialization || 'Specialization'}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  {format(new Date(), 'EEEE, MMMM d, yyyy')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-emerald-700">Online</span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-lg hover:shadow-xl transition-all"
              >
                <Settings className="w-4 h-4 inline mr-1" />
                Profile Settings
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* ── Statistics Cards — 4 only ───────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            {
              label: "Today's Appointments",
              value: stats.todayAppointments,
              icon: Calendar,
              color: 'from-blue-500 to-blue-600',
            },
            {
              label: 'Pending',
              value: stats.pendingAppointments,
              icon: Clock,
              color: 'from-yellow-500 to-yellow-600',
            },
            {
              label: 'Completed',
              value: stats.completedAppointments,
              icon: CheckCircle,
              color: 'from-emerald-500 to-emerald-600',
            },
            {
              label: 'Total Patients',
              value: stats.totalPatients,
              icon: Users,
              color: 'from-purple-500 to-purple-600',
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 * (index + 1) }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-5 border border-white/20 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider truncate">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
                </div>
                <div
                  className={`bg-gradient-to-r ${stat.color} p-2.5 rounded-xl flex-shrink-0 ml-2`}
                >
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Two Column Layout ───────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left Column - 2/3 ──────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Today's Appointments */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-white/20 h-[420px] flex flex-col"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center flex-shrink-0">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Today's Appointments
                </h2>
                <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                  {todayAppointments.length}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
                {todayAppointments.length > 0 ? (
                  todayAppointments.map((appointment, index) => (
                    <motion.div
                      key={appointment._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * index }}
                      className="p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-emerald-100 flex items-center justify-center flex-shrink-0">
                            <User className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-800 truncate">
                              {appointment.patient?.fullName || 'Unknown Patient'}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
                              <Clock className="w-3 h-3 flex-shrink-0" />
                              <span>{appointment.timeSlot}</span>
                              <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                                {appointment.type || 'Physical'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${
                              appointment.status === 'pending'
                                ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                : appointment.status === 'confirmed'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : appointment.status === 'completed'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                            }`}
                          >
                            {appointment.status.charAt(0).toUpperCase() +
                              appointment.status.slice(1)}
                          </span>
                          <div className="flex gap-1">
                            {appointment.status === 'pending' && (
                              <>
                                <button
                                  onClick={() =>
                                    handleAppointmentAction(appointment._id, 'confirm')
                                  }
                                  className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-colors"
                                  title="Accept"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() =>
                                    handleAppointmentAction(appointment._id, 'cancel')
                                  }
                                  className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                                  title="Reject"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            {appointment.status === 'confirmed' && (
                              <button
                                onClick={() =>
                                  handleAppointmentAction(appointment._id, 'complete')
                                }
                                className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                                title="Complete"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => {/* View details */}}
                              className="p-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full text-center text-gray-500">
                    <div>
                      <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p>No appointments scheduled for today</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* ── NEW: Today's Schedule Timeline ─────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-white/20"
            >
              <div className="p-6 border-b border-gray-100 flex-shrink-0">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  Today's Schedule Timeline
                </h2>
              </div>
              <div className="p-6">
                {todayAppointments.length > 0 ? (
                  <div className="relative">
                    {/* Vertical connecting line */}
                    <div className="absolute left-[52px] top-2 bottom-2 w-0.5 bg-gray-100 z-0"></div>
                    <div className="space-y-4">
                      {todayAppointments.map((apt, index) => (
                        <div key={apt._id} className="flex items-start gap-4">
                          {/* Time label */}
                          <div className="w-[44px] flex-shrink-0 text-right pt-1">
                            <span className="text-xs font-semibold text-gray-400 leading-none">
                              {apt.timeSlot?.split('-')[0]?.trim() || '--:--'}
                            </span>
                          </div>
                          {/* Status dot */}
                          <div className="flex-shrink-0 relative z-10 mt-1.5">
                            <div
                              className={`w-3.5 h-3.5 rounded-full border-2 border-white shadow ${
                                apt.status === 'pending'
                                  ? 'bg-yellow-400'
                                  : apt.status === 'confirmed'
                                  ? 'bg-blue-500'
                                  : apt.status === 'completed'
                                  ? 'bg-emerald-500'
                                  : 'bg-red-400'
                              }`}
                            ></div>
                          </div>
                          {/* Content card */}
                          <div
                            className={`flex-1 rounded-xl px-4 py-2.5 border ${
                              apt.status === 'pending'
                                ? 'bg-yellow-50 border-yellow-100'
                                : apt.status === 'confirmed'
                                ? 'bg-blue-50 border-blue-100'
                                : apt.status === 'completed'
                                ? 'bg-emerald-50 border-emerald-100'
                                : 'bg-red-50 border-red-100'
                            }`}
                          >
                            <div className="flex items-center justify-between flex-wrap gap-1">
                              <p className="font-semibold text-gray-800 text-sm">
                                {apt.patient?.fullName || 'Unknown Patient'}
                              </p>
                              <div className="flex items-center gap-2">
                                <span className="text-xs bg-white/70 px-2 py-0.5 rounded-full text-gray-600 font-medium">
                                  {apt.type || 'Physical'}
                                </span>
                                <span
                                  className={`text-xs font-semibold ${
                                    apt.status === 'pending'
                                      ? 'text-yellow-700'
                                      : apt.status === 'confirmed'
                                      ? 'text-blue-700'
                                      : apt.status === 'completed'
                                      ? 'text-emerald-700'
                                      : 'text-red-700'
                                  }`}
                                >
                                  {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                                </span>
                              </div>
                            </div>
                            {apt.reason && (
                              <p className="text-xs text-gray-500 mt-0.5 truncate">{apt.reason}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-10 text-center text-gray-500">
                    <div>
                      <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p>No schedule for today</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* ── NEW: Upcoming 7 Days ────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-white/20"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center flex-shrink-0">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <CalendarCheck className="w-5 h-5 text-indigo-600" />
                  Upcoming (Next 7 Days)
                </h2>
                <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-sm font-medium">
                  {upcomingAppointments.length}
                </span>
              </div>
              <div className="p-4 max-h-72 overflow-y-auto">
                {upcomingAppointments.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingAppointments.map((apt, index) => (
                      <motion.div
                        key={apt._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.04 * index }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors"
                      >
                        {/* Date badge */}
                        <div className="flex-shrink-0 text-center bg-white rounded-lg px-3 py-1.5 shadow-sm border border-gray-100 min-w-[52px]">
                          <p className="text-xs font-bold text-indigo-600 uppercase leading-none">
                            {format(parseISO(apt.date), 'MMM')}
                          </p>
                          <p className="text-lg font-bold text-gray-800 leading-tight">
                            {format(parseISO(apt.date), 'd')}
                          </p>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 truncate text-sm">
                            {apt.patient?.fullName || 'Unknown Patient'}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
                            <Clock className="w-3 h-3" />
                            <span>{apt.timeSlot}</span>
                            <span className="bg-gray-200 px-1.5 py-0.5 rounded-full">
                              {apt.type || 'Physical'}
                            </span>
                          </div>
                        </div>
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded-full flex-shrink-0 ${
                            apt.status === 'pending'
                              ? 'bg-yellow-50 text-yellow-700'
                              : apt.status === 'confirmed'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-gray-50 text-gray-600'
                          }`}
                        >
                          {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-10 text-center text-gray-500">
                    <div>
                      <CalendarCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p>No upcoming appointments in next 7 days</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Availability Management */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-white/20"
            >
              <div className="p-6 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-emerald-600" />
                  Availability Management
                </h2>
                <button
                  onClick={() => {
                    setShowAvailabilityForm(true);
                    setEditingSlot(null);
                    setAvailabilityForm({ day: 'Monday', startTime: '09:00', endTime: '17:00' });
                  }}
                  className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Slot
                </button>
              </div>

              <div className="p-4">
                {showAvailabilityForm && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-200"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <select
                        value={availabilityForm.day}
                        onChange={(e) =>
                          setAvailabilityForm({ ...availabilityForm, day: e.target.value })
                        }
                        className="px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {days.map((day) => (
                          <option key={day} value={day}>
                            {day}
                          </option>
                        ))}
                      </select>
                      <input
                        type="time"
                        value={availabilityForm.startTime}
                        onChange={(e) =>
                          setAvailabilityForm({ ...availabilityForm, startTime: e.target.value })
                        }
                        className="px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="time"
                        value={availabilityForm.endTime}
                        onChange={(e) =>
                          setAvailabilityForm({ ...availabilityForm, endTime: e.target.value })
                        }
                        className="px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={
                            editingSlot !== null ? handleUpdateAvailability : handleAddAvailability
                          }
                          className="flex-1 bg-gradient-to-r from-blue-600 to-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all"
                        >
                          <Save className="w-4 h-4 inline mr-1" />
                          {editingSlot !== null ? 'Update' : 'Save'}
                        </button>
                        <button
                          onClick={() => {
                            setShowAvailabilityForm(false);
                            setEditingSlot(null);
                          }}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {availability.length > 0 ? (
                    days.map((day) => {
                      const slots = availability.filter((slot) => slot.day === day);
                      if (slots.length === 0) return null;
                      return (
                        <div key={day} className="border border-gray-100 rounded-xl overflow-hidden">
                          <div className="bg-gray-50 px-4 py-2 font-medium text-gray-700">{day}</div>
                          {slots.map((slot, index) => {
                            const actualIndex = availability.indexOf(slot);
                            return (
                              <div
                                key={index}
                                className="flex items-center justify-between px-4 py-2 border-t border-gray-100"
                              >
                                <span className="text-gray-600">
                                  {slot.startTime} - {slot.endTime}
                                </span>
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => handleEditAvailability(actualIndex)}
                                    className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteAvailability(actualIndex)}
                                    className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p>No availability slots configured</p>
                      <button
                        onClick={() => {
                          setShowAvailabilityForm(true);
                          setEditingSlot(null);
                        }}
                        className="mt-2 text-blue-600 font-medium hover:text-blue-700"
                      >
                        Add your first slot
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* ── Right Column - 1/3 ─────────────────────────────────── */}
          <div className="space-y-6">

            {/* Recent Patients */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-white/20 h-[420px] flex flex-col"
            >
              <div className="p-5 border-b border-gray-100 flex-shrink-0">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  Recent Patients
                </h2>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
                {recentPatients.length > 0 ? (
                  recentPatients.map((patient, index) => (
                    <motion.div
                      key={patient._id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * index }}
                      className="p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 truncate">{patient.fullName}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
                            <span>{patient.age || 'N/A'} yrs</span>
                            <span>•</span>
                            <span>{patient.gender || 'N/A'}</span>
                            <span>•</span>
                            <span>
                              Last visit:{' '}
                              {patient.lastVisit
                                ? format(parseISO(patient.lastVisit), 'MMM d')
                                : 'Never'}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => {/* View medical history */}}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium whitespace-nowrap"
                        >
                          History →
                        </button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full text-center text-gray-500">
                    <div>
                      <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm">No patients yet</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Appointment Requests */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-white/20 h-[200px] flex flex-col"
            >
              <div className="p-5 border-b border-gray-100 flex justify-between items-center flex-shrink-0">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <ListChecks className="w-5 h-5 text-yellow-600" />
                  Appointment Requests
                </h2>
                <span className="bg-yellow-50 text-yellow-600 px-2 py-0.5 rounded-full text-xs font-medium">
                  {pendingRequests.length}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
                {pendingRequests.length > 0 ? (
                  pendingRequests.map((request) => (
                    <div key={request._id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 truncate">
                            {request.patient?.fullName || 'Unknown Patient'}
                          </p>
                          <p className="text-sm text-gray-500">{request.timeSlot}</p>
                        </div>
                        <div className="flex gap-1 ml-2 flex-shrink-0">
                          <button
                            onClick={() => handleAppointmentAction(request._id, 'confirm')}
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-colors"
                            title="Accept"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleAppointmentAction(request._id, 'cancel')}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                            title="Reject"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full text-center text-gray-500">
                    <div>
                      <CheckCircle className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm">No pending requests</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* ── NEW: Revenue Summary ────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-white/20"
            >
              <div className="p-5 border-b border-gray-100 flex-shrink-0">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Revenue Summary
                </h2>
              </div>
              <div className="p-5">
                <div className="flex items-end justify-between mb-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-medium tracking-wider mb-1">
                      This Month
                    </p>
                    <p className="text-3xl font-bold text-gray-800">
                      ₹{revenue.thisMonth.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm font-semibold ${
                      revenue.growth >= 0
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-red-50 text-red-700'
                    }`}
                  >
                    {revenue.growth >= 0 ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    {Math.abs(revenue.growth)}%
                  </div>
                </div>
                <div className="flex justify-between text-sm text-gray-500 bg-gray-50 rounded-xl px-4 py-3">
                  <span>Last Month</span>
                  <span className="font-semibold text-gray-700">
                    ₹{revenue.lastMonth.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Ratings & Reviews */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-white/20 h-[180px] flex flex-col"
            >
              <div className="p-5 border-b border-gray-100 flex-shrink-0">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Ratings & Reviews
                </h2>
              </div>
              <div className="flex-1 p-5 overflow-y-auto">
                <div className="flex items-center gap-4">
                  <div className="text-center flex-shrink-0">
                    <div className="text-3xl font-bold text-gray-800">
                      {stats.averageRating || 0}
                    </div>
                    <div className="flex items-center gap-0.5 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= Math.round(stats.averageRating || 0)
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{reviews.length} reviews</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    {reviews.slice(0, 3).map((review, index) => (
                      <div key={index} className="mb-2 last:mb-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-700 truncate">
                            {review.patientName}
                          </span>
                          <div className="flex items-center gap-0.5 flex-shrink-0">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3 h-3 ${
                                  star <= review.rating
                                    ? 'text-yellow-400 fill-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 truncate">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions — Write Prescription added */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-5 border border-white/20"
            >
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                Quick Actions
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'View Appointments', icon: Calendar, color: 'bg-blue-50 text-blue-600' },
                  { label: 'Manage Patients', icon: Users, color: 'bg-purple-50 text-purple-600' },
                  {
                    label: 'Write Prescription',
                    icon: FileText,
                    color: 'bg-teal-50 text-teal-600',
                  },
                  { label: 'Edit Profile', icon: Settings, color: 'bg-gray-50 text-gray-600' },
                ].map((action) => (
                  <button
                    key={action.label}
                    className={`${action.color} p-3 rounded-xl text-sm font-medium hover:shadow-md transition-all flex items-center justify-center gap-2`}
                  >
                    <action.icon className="w-4 h-4" />
                    <span className="truncate">{action.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Notifications — no mock data, fetched from real API */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-white/20 h-[180px] flex flex-col"
            >
              <div className="p-5 border-b border-gray-100 flex-shrink-0">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-blue-600" />
                  Notifications
                </h2>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div key={notification.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-1.5 rounded-full flex-shrink-0 ${
                            notification.type === 'new'
                              ? 'bg-blue-50 text-blue-600'
                              : notification.type === 'cancelled'
                              ? 'bg-red-50 text-red-600'
                              : 'bg-yellow-50 text-yellow-600'
                          }`}
                        >
                          {notification.type === 'new' ? (
                            <Calendar className="w-3 h-3" />
                          ) : notification.type === 'cancelled' ? (
                            <XCircle className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-700 truncate">{notification.message}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{notification.time}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full text-center text-gray-500">
                    <div>
                      <Bell className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm">No notifications</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;