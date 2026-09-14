import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  User,
  Search,
  X,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Check,
  AlertCircle,
  Filter,
  Phone,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Retrieve assigned doctor appointment bookings
  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/doctor/appointments");
      setAppointments(response.data.appointments || response.data || []);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Update appointment status (accept, reject, complete)
  const handleStatusUpdate = async (appointmentId, status) => {
    setActionLoadingId(appointmentId);
    try {
      try {
        await api.put(`/doctor/appointments/${appointmentId}/status`, { status });
      } catch (err) {
        await api.put(`/doctor/appointments/${appointmentId}`, { status });
      }

      toast.success(
        status === "confirmed"
          ? "Appointment accepted 🎉"
          : status === "cancelled"
          ? "Appointment rejected"
          : "Appointment marked as completed"
      );
      fetchAppointments();
    } catch (error) {
      console.error("Error updating appointment:", error);
      toast.error(error.response?.data?.error || error.response?.data?.message || "Failed to update appointment");
    } finally {
      setActionLoadingId(null);
    }
  };

  const getStatusConfig = (statusStr) => {
    const status = statusStr?.toLowerCase() || "pending";
    const configs = {
      pending: {
        color: "bg-amber-50 text-amber-700 border-amber-200",
        icon: Clock,
        label: "Pending",
      },
      confirmed: {
        color: "bg-teal-50 text-teal-700 border-teal-200",
        icon: CalendarCheck,
        label: "Confirmed",
      },
      approved: {
        color: "bg-teal-50 text-teal-700 border-teal-200",
        icon: CalendarCheck,
        label: "Confirmed",
      },
      completed: {
        color: "bg-emerald-50 text-emerald-700 border-emerald-200",
        icon: CheckCircle2,
        label: "Completed",
      },
      cancelled: {
        color: "bg-rose-50 text-rose-700 border-rose-200",
        icon: XCircle,
        label: "Cancelled",
      },
      rejected: {
        color: "bg-rose-50 text-rose-700 border-rose-200",
        icon: XCircle,
        label: "Cancelled",
      },
    };
    return configs[status] || configs.pending;
  };

  const getPatientName = (apt) =>
    apt.patientName ||
    apt.patient?.user?.fullName ||
    apt.patient?.fullName ||
    apt.patient?.name ||
    apt.user?.fullName ||
    "Patient";

  const getPatientPhone = (apt) =>
    apt.patientPhone ||
    apt.patient?.user?.phoneNumber ||
    apt.patient?.phoneNumber ||
    apt.patient?.phone ||
    "";

  // Filter and sort appointments by status and patient name
  const filteredAppointments = useMemo(() => {
    let filtered = [...appointments];

    if (filter !== "all") {
      filtered = filtered.filter((apt) => {
        const st = (apt.status || "pending").toLowerCase();
        if (filter === "confirmed") return st === "confirmed" || st === "approved";
        if (filter === "cancelled") return st === "cancelled" || st === "rejected";
        return st === filter;
      });
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((apt) =>
        getPatientName(apt).toLowerCase().includes(query)
      );
    }

    return filtered.sort((a, b) => new Date(b.date || Date.now()) - new Date(a.date || Date.now()));
  }, [appointments, filter, searchQuery]);

  // Calculate doctor metrics for daily overview
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    const todayCount = appointments.filter((apt) => {
      if (!apt.date) return false;
      const d = new Date(apt.date);
      return d >= today && d <= todayEnd;
    }).length;

    return {
      today: todayCount,
      pending: appointments.filter((apt) => (apt.status || "").toLowerCase() === "pending").length,
      completed: appointments.filter((apt) => (apt.status || "").toLowerCase() === "completed").length,
      total: appointments.length,
    };
  }, [appointments]);

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-slate-50/60 p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-[1920px] mx-auto space-y-6">
          <div className="w-full h-36 bg-slate-200 rounded-3xl animate-pulse" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-white rounded-2xl animate-pulse shadow-sm" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-50/60 pb-12 font-sans">
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 space-y-6">
        
        {/* Doctor Appointments Hero Banner */}
        <div className="w-full bg-emerald-700 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2.5">
                <CalendarCheck className="w-7 h-7 text-emerald-200" />
                My Appointments
              </h1>
              <p className="text-emerald-100 text-xs sm:text-sm mt-1.5 font-medium">
                Review and manage real-time patient appointment requests and schedules
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-white/20 text-xs font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
              <span>{stats.total} Total Bookings</span>
            </div>
          </div>
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Doctor Schedule Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[
            { label: "Today's Schedule", value: stats.today, icon: Calendar, iconBg: "bg-teal-50 text-teal-700" },
            { label: "Pending Requests", value: stats.pending, icon: Clock, iconBg: "bg-amber-50 text-amber-700" },
            { label: "Completed Visits", value: stats.completed, icon: CheckCircle2, iconBg: "bg-emerald-50 text-emerald-700" },
            { label: "Total Appointments", value: stats.total, icon: CalendarCheck, iconBg: "bg-blue-50 text-blue-700" },
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

        {/* Search Input and Filter Controls */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search patient name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-semibold"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 items-center">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mr-2 uppercase tracking-wider">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </div>
            {["all", "pending", "confirmed", "completed", "cancelled"].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                  filter === status
                    ? "bg-emerald-700 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Appointments Feed and Action Controls */}
        {filteredAppointments.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-12 text-center">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">No Appointments Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              {searchQuery || filter !== "all"
                ? "No matching patient records for the selected filters."
                : "You don't have any registered appointment requests."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAppointments.map((appointment) => {
              const currentStatus = (appointment.status || "pending").toLowerCase();
              const statusConfig = getStatusConfig(currentStatus);
              const StatusIcon = statusConfig.icon;
              const isActing = actionLoadingId === appointment._id;
              const patientPhone = getPatientPhone(appointment);

              return (
                <motion.div
                  key={appointment._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5 hover:border-slate-200 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    
                    <div className="flex items-start gap-4 min-w-0 flex-1">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 flex-shrink-0 font-bold shadow-xs">
                        <User className="w-6 h-6" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h3 className="text-base font-bold text-slate-900 truncate">
                            {getPatientName(appointment)}
                          </h3>
                          <span
                            className={`px-3 py-0.5 rounded-full text-xs font-semibold border ${statusConfig.color} flex items-center gap-1`}
                          >
                            <StatusIcon className="w-3.5 h-3.5" />
                            {statusConfig.label}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-2 flex-wrap font-medium">
                          <span className="flex items-center gap-1 text-slate-700">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {appointment.date
                              ? new Date(appointment.date).toLocaleDateString("en-US", {
                                  weekday: "short",
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })
                              : "N/A"}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-slate-700">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {appointment.timeSlot || "Standard Slot"}
                          </span>
                          {patientPhone && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1 text-slate-700">
                                <Phone className="w-3.5 h-3.5 text-slate-400" /> {patientPhone}
                              </span>
                            </>
                          )}
                        </div>

                        {(appointment.notes || appointment.reason) && (
                          <p className="mt-2.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 font-medium">
                            <span className="font-bold text-slate-800">Reason:</span>{" "}
                            {appointment.reason || appointment.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex sm:flex-col gap-2 flex-shrink-0 self-end sm:self-center w-full sm:w-auto min-w-[130px] justify-end">
                      {currentStatus === "pending" && (
                        <div className="flex gap-2 w-full sm:w-auto">
                          <button
                            onClick={() => handleStatusUpdate(appointment._id, "confirmed")}
                            disabled={isActing}
                            className="flex-1 sm:flex-initial bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-xs cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" /> Accept
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(appointment._id, "cancelled")}
                            disabled={isActing}
                            className="flex-1 sm:flex-initial bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-xs cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" /> Reject
                          </button>
                        </div>
                      )}

                      {(currentStatus === "confirmed" || currentStatus === "approved") && (
                        <button
                          onClick={() => handleStatusUpdate(appointment._id, "completed")}
                          disabled={isActing}
                          className="w-full sm:w-auto bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-xs cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Complete
                        </button>
                      )}

                      {currentStatus === "completed" && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-100 justify-center">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                        </span>
                      )}

                      {(currentStatus === "cancelled" || currentStatus === "rejected") && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-2 rounded-xl justify-center">
                          <AlertCircle className="w-3.5 h-3.5" /> Cancelled
                        </span>
                      )}
                    </div>

                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

export default DoctorAppointments;