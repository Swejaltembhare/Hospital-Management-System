import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  User,
  Video,
  Search,
  ArrowUpDown,
  X,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  FileText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";

const MyAppointments = () => {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Retrieve patient appointments schedule
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await api.get("/patients/appointments");
      setAppointments(response.data.appointments || []);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error(error.response?.data?.error || "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;

    try {
      await api.put(`/patients/appointments/${appointmentId}/cancel`);
      toast.success("Appointment cancelled successfully");
      await fetchAppointments();
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      toast.error(error.response?.data?.error || "Failed to cancel appointment");
    }
  };

  const handleReschedule = (appointment) => {
    if (!appointment?._id) return;
    navigate("/patient/doctors", {
      state: { reschedule: true, appointment },
    });
  };

  const handleViewPrescription = (appointmentId) => {
    if (!appointmentId) return;
    // Redirects directly to patient prescription detail page
    navigate(`/patient/prescriptions?appointmentId=${appointmentId}`);
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: { color: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock, label: "Pending" },
      confirmed: { color: "bg-teal-50 text-teal-700 border-teal-200", icon: CalendarCheck, label: "Confirmed" },
      completed: { color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2, label: "Completed" },
      cancelled: { color: "bg-rose-50 text-rose-700 border-rose-200", icon: XCircle, label: "Cancelled" },
    };
    return configs[status?.toLowerCase()] || configs.pending;
  };

  // Filter, search, and sort appointment records
  const filteredAndSortedAppointments = useMemo(() => {
    let filtered = [...appointments];

    if (filter !== "all") {
      filtered = filtered.filter((apt) => apt.status === filter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((apt) => {
        const docName = apt.doctor?.user?.fullName?.toLowerCase() || "";
        const spec = apt.doctor?.specialization?.toLowerCase() || "";
        const dept = apt.doctor?.department?.toLowerCase() || "";
        return docName.includes(query) || spec.includes(query) || dept.includes(query);
      });
    }

    switch (sortBy) {
      case "latest":
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      case "oldest":
        filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      case "upcoming":
        filtered = filtered
          .filter((apt) => new Date(apt.date) >= new Date())
          .sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      default:
        break;
    }

    return filtered;
  }, [appointments, filter, searchQuery, sortBy]);

  const stats = useMemo(() => {
    const total = appointments.length;
    const upcoming = appointments.filter(
      (apt) => apt.status === "confirmed" && new Date(apt.date) >= new Date()
    ).length;
    const completed = appointments.filter((apt) => apt.status === "completed").length;
    const cancelled = appointments.filter((apt) => apt.status === "cancelled").length;

    return { total, upcoming, completed, cancelled };
  }, [appointments]);

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-slate-50/60 p-6 flex flex-col items-center justify-center">
        <Clock className="w-8 h-8 text-emerald-700 animate-spin mb-2" />
        <p className="text-slate-500 font-medium text-xs">Loading appointments schedule...</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-50/60 pb-12 font-sans">
      <main className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 space-y-6">
        
        {/* Appointments Hero Banner */}
        <div className="w-full bg-emerald-700 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              My Appointments
            </h2>
            <p className="text-emerald-100 text-xs sm:text-sm mt-1.5 font-medium">
              View, reschedule, or check the status of all your scheduled consultations.
            </p>
          </div>
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Appointment Status Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total", value: stats.total, color: "text-slate-900 bg-white" },
            { label: "Upcoming", value: stats.upcoming, color: "text-emerald-700 bg-emerald-50/50" },
            { label: "Completed", value: stats.completed, color: "text-emerald-700 bg-emerald-50/50" },
            { label: "Cancelled", value: stats.cancelled, color: "text-rose-600 bg-rose-50/50" },
          ].map((stat) => (
            <div key={stat.label} className={`p-4 rounded-2xl border border-slate-100 shadow-sm ${stat.color}`}>
              <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">{stat.label}</p>
              <p className="text-2xl font-black mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Search & Status Filter Controls */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by doctor or specialization..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-semibold text-slate-800"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-700 outline-none font-semibold cursor-pointer"
              >
                <option value="latest">Latest First</option>
                <option value="oldest">Oldest First</option>
                <option value="upcoming">Upcoming First</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
            {["all", "pending", "confirmed", "completed", "cancelled"].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors cursor-pointer ${
                  filter === status ? "bg-emerald-700 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Appointments Feed Grid */}
        {filteredAndSortedAppointments.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 p-10 text-center shadow-sm max-w-md mx-auto my-8">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No Appointments Found</h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">Try adjusting your filters or book a new consultation.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAndSortedAppointments.map((appointment) => {
              const statusConfig = getStatusConfig(appointment.status);
              const StatusIcon = statusConfig.icon;

              return (
                <div key={appointment._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700 font-bold overflow-hidden flex-shrink-0">
                        {appointment.doctor?.profilePhoto ? (
                          <img src={appointment.doctor.profilePhoto} alt="Doctor" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-6 h-6" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                          Dr. {(appointment.doctor?.user?.fullName || "Doctor").replace(/^Dr\.\s*/i, "")}
                        </h3>
                        <p className="text-xs text-emerald-700 font-semibold">{appointment.doctor?.specialization || "General Medicine"}</p>
                      </div>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${statusConfig.color}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {statusConfig.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-slate-400 font-medium">Date</span>
                      <p className="font-bold text-slate-800 mt-0.5">
                        {new Date(appointment.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium">Time Slot</span>
                      <p className="font-bold text-slate-800 mt-0.5">{appointment.timeSlot || "N/A"}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium">Type</span>
                      <p className="font-bold text-slate-800 mt-0.5">{appointment.type === "video" ? "Video Call" : "In-Person"}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium">Fee</span>
                      <p className="font-bold text-slate-800 mt-0.5">₹{appointment.fee || appointment.doctor?.consultationFee || 0}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <button
                      onClick={() => setSelectedAppointment(appointment)}
                      className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
                    >
                      View Full Details
                    </button>

                    <div className="flex items-center gap-2">
                      {appointment.status === "pending" && (
                        <button
                          onClick={() => handleCancelAppointment(appointment._id)}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-bold transition cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}

                      {appointment.status === "confirmed" && (
                        <>
                          <button
                            onClick={() => handleReschedule(appointment)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition cursor-pointer"
                          >
                            Reschedule
                          </button>
                          {appointment.type === "video" && (
                            <button
                              onClick={() => navigate(`/patient/video-call/${appointment._id}`)}
                              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                            >
                              <Video className="w-3.5 h-3.5" /> Join Call
                            </button>
                          )}
                        </>
                      )}

                      {appointment.status === "completed" && (
                        <button
                          onClick={() => handleViewPrescription(appointment._id)}
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-emerald-100"
                        >
                          <FileText className="w-3.5 h-3.5" /> Prescription
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </main>

      {/* Appointment Detail Modal */}
      <AnimatePresence>
        {selectedAppointment && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900">Appointment Overview</h3>
                <button onClick={() => setSelectedAppointment(null)} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold uppercase tracking-wider">Doctor</span>
                  <p className="font-bold text-slate-800 text-sm mt-0.5">
                    Dr. {(selectedAppointment.doctor?.user?.fullName || "Doctor").replace(/^Dr\.\s*/i, "")}
                  </p>
                </div>
                {selectedAppointment.reason && (
                  <div>
                    <span className="text-slate-400 font-semibold uppercase tracking-wider">Reason for Visit</span>
                    <p className="text-slate-700 font-medium mt-0.5">{selectedAppointment.reason}</p>
                  </div>
                )}
                {selectedAppointment.symptoms && (
                  <div>
                    <span className="text-slate-400 font-semibold uppercase tracking-wider">Symptoms</span>
                    <p className="text-slate-700 font-medium mt-0.5">{selectedAppointment.symptoms}</p>
                  </div>
                )}
                <div>
                  <span className="text-slate-400 font-semibold uppercase tracking-wider">Booking Reference</span>
                  <p className="font-mono text-slate-600 font-medium mt-0.5">{selectedAppointment.bookingId || selectedAppointment._id}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 text-right">
                <button
                  onClick={() => setSelectedAppointment(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyAppointments;