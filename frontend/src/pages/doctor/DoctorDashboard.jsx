import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  Users,
  CheckCircle,
  User,
  Plus,
  Edit,
  Trash2,
  Save,
  Eye,
  Check,
  X,
  CalendarCheck,
  Settings,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { format, parseISO, isToday, isFuture } from "date-fns";
import toast from "react-hot-toast";
import api from "../../services/api";

const safeParseDate = (dateStr) => {
  try {
    return parseISO(dateStr);
  } catch {
    return null;
  }
};

const DoctorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Core Stats State
  const [stats, setStats] = useState({
    todayAppointments: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
    totalPatients: 0,
  });

  // Data Collections State
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [recentPatients, setRecentPatients] = useState([]);

  // UI & Modal States
  const [showAvailabilityForm, setShowAvailabilityForm] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [availabilityForm, setAvailabilityForm] = useState({
    day: "Monday",
    startTime: "09:00",
    endTime: "17:00",
  });
  const [deleteModal, setDeleteModal] = useState({ show: false, index: null });
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  // Navigation Handlers
  const handleViewAppointmentDetails = (appointment) => setSelectedAppointment(appointment);
  const handleViewPatientProfile = (patientId) => navigate(`/doctor/patients/${patientId}`);
  const handleEditProfile = () => navigate("/doctor/profile");
  const handleViewAllAppointments = () => navigate("/doctor/appointments");

  // Fetch Dashboard Stats & Schedule Data
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      const [appointmentsRes, patientsRes, availabilityRes] = await Promise.all([
        api.get("/doctor/appointments"),
        api.get("/doctor/patients"),
        api.get("/doctor/availability"),
      ]);

      const appointments = appointmentsRes.data.appointments || [];

      // Filter Today's Appointments
      const todayApts = appointments.filter((apt) => {
        const d = safeParseDate(apt.date);
        return d && isToday(d);
      });

      // Filter Upcoming Appointments (Next 7+ Days)
      const upcoming = appointments
        .filter((apt) => {
          const d = safeParseDate(apt.date);
          return d && !isToday(d) && isFuture(d);
        })
        .slice(0, 10);

      setStats({
        todayAppointments: todayApts.length,
        pendingAppointments: appointments.filter((apt) => apt.status === "pending").length,
        completedAppointments: appointments.filter((apt) => apt.status === "completed").length,
        totalPatients: patientsRes.data.patients?.length || 0,
      });

      setTodayAppointments(todayApts.slice(0, 10));
      setUpcomingAppointments(upcoming);
      setAvailability(availabilityRes.data.availableSlots || []);
      setRecentPatients((patientsRes.data.patients || []).slice(0, 5));
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Doctor Availability Operations
  const handleAddAvailability = async () => {
    try {
      const newSlot = {
        day: availabilityForm.day,
        startTime: availabilityForm.startTime,
        endTime: availabilityForm.endTime,
      };
      const updatedSlots = [...availability, newSlot];
      await api.put("/doctor/availability", { availableSlots: updatedSlots });
      setAvailability(updatedSlots);
      setAvailabilityForm({ day: "Monday", startTime: "09:00", endTime: "17:00" });
      setShowAvailabilityForm(false);
      toast.success("Availability slot added");
    } catch (error) {
      toast.error("Failed to add slot");
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
      await api.put("/doctor/availability", { availableSlots: updatedSlots });
      setAvailability(updatedSlots);
      setEditingSlot(null);
      setShowAvailabilityForm(false);
      setAvailabilityForm({ day: "Monday", startTime: "09:00", endTime: "17:00" });
      toast.success("Availability slot updated");
    } catch (error) {
      toast.error("Failed to update slot");
    }
  };

  const confirmDeleteAvailability = async () => {
    try {
      const updatedSlots = availability.filter((_, i) => i !== deleteModal.index);
      await api.put("/doctor/availability", { availableSlots: updatedSlots });
      setAvailability(updatedSlots);
      setDeleteModal({ show: false, index: null });
      toast.success("Availability slot deleted");
    } catch (error) {
      toast.error("Failed to delete slot");
      setDeleteModal({ show: false, index: null });
    }
  };

  const handleAppointmentAction = async (appointmentId, action) => {
    try {
      await api.put(`/doctor/appointments/${appointmentId}/${action}`);
      toast.success(`Appointment ${action}ed successfully`);
      fetchDashboardData();
    } catch (error) {
      toast.error(`Failed to ${action} appointment`);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-slate-50/60 p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-[1920px] mx-auto space-y-6">
          <div className="w-full h-36 bg-slate-200 rounded-3xl animate-pulse" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-white rounded-2xl animate-pulse shadow-sm" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-50/60 pb-12 font-sans">
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 space-y-6">
        
        {/* Doctor Dashboard Hero Banner */}
        <div className="w-full bg-emerald-700 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0 overflow-hidden shadow-md">
                {user?.profilePhoto ? (
                  <img
                    src={user.profilePhoto}
                    alt={user.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-9 h-9 text-white" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                    Welcome, Dr. {user?.fullName?.replace(/^Dr\.\s*/i, "") || "Doctor"}
                  </h1>
                </div>
                <p className="text-emerald-100 text-xs sm:text-sm mt-1 font-medium">
                  {user?.department || "General Medicine"} • {user?.specialization || "Specialist"}
                </p>
                <p className="text-emerald-200 text-xs mt-1 font-semibold">
                  {format(new Date(), "EEEE, MMMM d, yyyy")}
                </p>
              </div>
            </div>

            <button
              onClick={handleEditProfile}
              className="bg-white hover:bg-emerald-50 text-emerald-900 px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-all font-bold text-xs sm:text-sm whitespace-nowrap self-stretch sm:self-auto justify-center cursor-pointer"
            >
              <Settings className="w-4 h-4 text-emerald-700" />
              <span>Edit Profile</span>
            </button>
          </div>
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Delete Slot Confirmation Modal */}
        <AnimatePresence>
          {deleteModal.show && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setDeleteModal({ show: false, index: null })}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-rose-50 rounded-2xl">
                    <AlertCircle className="w-5 h-5 text-rose-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Delete Slot</h3>
                    <p className="text-xs text-slate-500">This action cannot be undone</p>
                  </div>
                </div>
                <p className="text-slate-600 mb-6 text-xs sm:text-sm font-medium">
                  Are you sure you want to delete this availability slot?
                </p>
                <div className="flex gap-2.5">
                  <button
                    onClick={confirmDeleteAvailability}
                    className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setDeleteModal({ show: false, index: null })}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* View Appointment Details Modal */}
        <AnimatePresence>
          {selectedAppointment && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedAppointment(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
                  <h3 className="text-base font-bold text-slate-900">Appointment Details</h3>
                  <button
                    onClick={() => setSelectedAppointment(null)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-3 text-xs sm:text-sm">
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Patient</span>
                    <span className="font-bold text-slate-900">
                      {selectedAppointment.patient?.user?.fullName || selectedAppointment.patient?.fullName || "Unknown Patient"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Date</span>
                    <span className="font-bold text-slate-900">
                      {selectedAppointment.date ? format(safeParseDate(selectedAppointment.date), "PPP") : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Time Slot</span>
                    <span className="font-bold text-slate-900">{selectedAppointment.timeSlot}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Status</span>
                    <span className="font-bold capitalize text-emerald-700">
                      {selectedAppointment.status}
                    </span>
                  </div>
                  {selectedAppointment.reason && (
                    <div className="pt-2">
                      <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Reason</span>
                      <p className="text-slate-700 mt-1 bg-slate-50 p-3 rounded-xl text-xs font-medium border border-slate-100">
                        {selectedAppointment.reason}
                      </p>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setSelectedAppointment(null)}
                  className="w-full mt-6 bg-emerald-700 hover:bg-emerald-800 text-white py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
                >
                  Close
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Doctor Operational Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[
            { label: "Today's Appointments", value: stats.todayAppointments, icon: Calendar, iconBg: "bg-teal-50 text-teal-700" },
            { label: "Pending Requests", value: stats.pendingAppointments, icon: Clock, iconBg: "bg-amber-50 text-amber-700" },
            { label: "Completed Appointments", value: stats.completedAppointments, icon: CheckCircle, iconBg: "bg-emerald-50 text-emerald-700" },
            { label: "Total Patients", value: stats.totalPatients, icon: Users, iconBg: "bg-blue-50 text-blue-700" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${stat.iconBg}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
          ))}
        </div>

        {/* Dashboard 2-Column Operational Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Primary Operations (Today's Schedule & Slots Manager) */}
          <div className="lg:col-span-2 space-y-6">

            {/* Today's Schedule Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                  Today's Schedule
                </h2>
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-50 text-emerald-700 text-xs px-3 py-1 rounded-full font-bold border border-emerald-100">
                    {todayAppointments.length}
                  </span>
                  <button
                    onClick={handleViewAllAppointments}
                    className="text-emerald-700 hover:text-emerald-800 text-xs font-bold flex items-center gap-0.5 cursor-pointer"
                  >
                    View All <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="p-5 max-h-[400px] overflow-y-auto">
                {todayAppointments.length > 0 ? (
                  <div className="space-y-3">
                    {todayAppointments.map((apt) => {
                      const patientName =
                        apt.patient?.user?.fullName ||
                        apt.patient?.fullName ||
                        "Unknown Patient";

                      return (
                        <div
                          key={apt._id}
                          className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div className="px-3 py-1.5 bg-white border border-slate-200 text-slate-800 rounded-xl font-bold text-xs whitespace-nowrap shadow-xs">
                              {apt.timeSlot?.split("-")[0]?.trim() || "--:--"}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                                {patientName}
                              </p>
                              <p className="text-xs text-slate-500 font-medium truncate">{apt.reason || "General Checkup"}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            {apt.status === "pending" && (
                              <>
                                <button
                                  onClick={() => handleAppointmentAction(apt._id, "confirm")}
                                  className="p-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-xs transition-all cursor-pointer border border-emerald-100"
                                  title="Accept"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleAppointmentAction(apt._id, "cancel")}
                                  className="p-2 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl text-xs transition-all cursor-pointer border border-rose-100"
                                  title="Reject"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleViewAppointmentDetails(apt)}
                              className="p-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-10 text-slate-400">
                    <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                    <p className="text-xs font-semibold">No appointments scheduled for today</p>
                  </div>
                )}
              </div>
            </div>

            {/* Availability Slots Manager Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-emerald-600" />
                  Availability Slots
                </h2>
                <button
                  onClick={() => {
                    setShowAvailabilityForm(true);
                    setEditingSlot(null);
                    setAvailabilityForm({ day: "Monday", startTime: "09:00", endTime: "17:00" });
                  }}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Add Slot
                </button>
              </div>

              <div className="p-5">
                {showAvailabilityForm && (
                  <div className="bg-slate-50 rounded-2xl p-4 mb-4 border border-slate-200">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <select
                        value={availabilityForm.day}
                        onChange={(e) => setAvailabilityForm({ ...availabilityForm, day: e.target.value })}
                        className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        {days.map((day) => (
                          <option key={day} value={day}>{day}</option>
                        ))}
                      </select>
                      <input
                        type="time"
                        value={availabilityForm.startTime}
                        onChange={(e) => setAvailabilityForm({ ...availabilityForm, startTime: e.target.value })}
                        className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <input
                        type="time"
                        value={availabilityForm.endTime}
                        onChange={(e) => setAvailabilityForm({ ...availabilityForm, endTime: e.target.value })}
                        className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={editingSlot !== null ? handleUpdateAvailability : handleAddAvailability}
                          className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white py-2 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Save className="w-3.5 h-3.5" /> Save
                        </button>
                        <button
                          onClick={() => {
                            setShowAvailabilityForm(false);
                            setEditingSlot(null);
                          }}
                          className="px-3 py-2 bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer hover:bg-slate-300 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {availability.length > 0 ? (
                    days.map((day) => {
                      const slots = availability.filter((slot) => slot.day === day);
                      if (slots.length === 0) return null;
                      return (
                        <div key={day} className="border border-slate-100 rounded-2xl overflow-hidden">
                          <div className="bg-slate-50 px-4 py-2 font-bold text-xs text-slate-800 uppercase tracking-wider">{day}</div>
                          {slots.map((slot, idx) => {
                            const actualIndex = availability.indexOf(slot);
                            return (
                              <div key={`${day}-${idx}`} className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100 text-xs font-semibold text-slate-700">
                                <span>{slot.startTime} - {slot.endTime}</span>
                                <div className="flex gap-1.5">
                                  <button onClick={() => handleEditAvailability(actualIndex)} className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg cursor-pointer">
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => setDeleteModal({ show: true, index: actualIndex })} className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer">
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
                    <div className="text-center py-6 text-slate-400">
                      <p className="text-xs font-semibold">No availability slots configured</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Feeds (Upcoming 7 Days & Recent Patients) */}
          <div className="space-y-6">

            {/* Upcoming Appointments Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <CalendarCheck className="w-5 h-5 text-emerald-600" />
                  Upcoming (7 Days)
                </h2>
                <span className="bg-slate-100 text-slate-700 text-xs px-3 py-1 rounded-full font-bold">
                  {upcomingAppointments.length}
                </span>
              </div>
              <div className="p-5 max-h-72 overflow-y-auto">
                {upcomingAppointments.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingAppointments.map((apt) => {
                      const aptDate = safeParseDate(apt.date);
                      const patientName =
                        apt.patient?.user?.fullName ||
                        apt.patient?.fullName ||
                        "Unknown Patient";

                      return (
                        <div key={apt._id} className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                          <div className="text-center bg-white rounded-xl px-3 py-1.5 border border-slate-200 min-w-[52px] shadow-xs">
                            <p className="text-[10px] font-extrabold text-emerald-700 uppercase leading-none">
                              {aptDate ? format(aptDate, "MMM") : "---"}
                            </p>
                            <p className="text-sm font-extrabold text-slate-900 leading-tight mt-0.5">
                              {aptDate ? format(aptDate, "d") : "--"}
                            </p>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                              {patientName}
                            </p>
                            <p className="text-xs text-slate-500 font-medium truncate mt-0.5">{apt.timeSlot}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-400">
                    <p className="text-xs font-semibold">No upcoming appointments</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Patients Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-600" />
                  Recent Patients
                </h2>
                <span className="text-xs text-slate-400 font-bold">{recentPatients.length}</span>
              </div>
              <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                {recentPatients.length > 0 ? (
                  recentPatients.map((patient) => {
                    const patientName =
                      patient.user?.fullName ||
                      patient.fullName ||
                      "Patient";

                    return (
                      <div
                        key={patient._id}
                        onClick={() => handleViewPatientProfile(patient._id)}
                        className="p-4 hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between"
                      >
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                            {patientName}
                          </p>
                          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                            {patient.gender || "N/A"} • {patient.age || "N/A"} yrs
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-6 text-center text-slate-400 text-xs font-semibold">No recent patients</div>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default DoctorDashboard;