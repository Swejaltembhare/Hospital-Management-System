// // src/pages/patient/MyAppointments.jsx
// import React, { useState, useEffect, useMemo } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   Calendar,
//   Clock,
//   User,
//   Stethoscope,
//   Building2,
//   Video,
//   UserRound,
//   Search,
//   ArrowUpDown,
//   X,
//   CalendarCheck,
//   CheckCircle2,
//   XCircle,
//   Clock as ClockIcon,
//   FileText,
//   Download,
//   CalendarPlus,
//   MapPin,
//   CreditCard,
//   Info,
//   AlertCircle,
// } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import toast from "react-hot-toast";
// import api from "../services/api";

// const MyAppointments = () => {
//   const navigate = useNavigate();
//   const [appointments, setAppointments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [filter, setFilter] = useState("all");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [sortBy, setSortBy] = useState("latest");

//   useEffect(() => {
//     fetchAppointments();
//   }, []);

//   const fetchAppointments = async () => {
//     try {
//       setLoading(true);
//       const response = await api.get("/patients/appointments");
//       setAppointments(response.data.appointments || []);
//     } catch (error) {
//       console.error("Error fetching appointments:", error);
//       toast.error("Failed to load appointments");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCancelAppointment = async (appointmentId) => {
//     if (!window.confirm("Are you sure you want to cancel this appointment?"))
//       return;

//     try {
//       await api.put(`/patients/appointments/${appointmentId}/cancel`);
//       toast.success("Appointment cancelled successfully");
//       fetchAppointments();
//     } catch (error) {
//       console.error("Error cancelling appointment:", error);
//       toast.error("Failed to cancel appointment");
//     }
//   };

//   const handleReschedule = (appointment) => {
//     navigate("/patient/doctors", { state: { reschedule: appointment } });
//   };

//   const handleJoinVideoCall = (appointment) => {
//     navigate(`/patient/video-call/${appointment._id}`);
//   };

//   const handleViewPrescription = (appointment) => {
//     navigate(`/patient/prescriptions/${appointment._id}`);
//   };

//   const handleDownloadReport = (appointment) => {
//     toast.success("Report downloading...");
//   };

//   const getStatusConfig = (status) => {
//     const configs = {
//       pending: {
//         color: "bg-yellow-50 text-yellow-700 border-yellow-200",
//         icon: ClockIcon,
//         label: "Pending",
//       },
//       confirmed: {
//         color: "bg-blue-50 text-blue-700 border-blue-200",
//         icon: CalendarCheck,
//         label: "Confirmed",
//       },
//       completed: {
//         color: "bg-emerald-50 text-emerald-700 border-emerald-200",
//         icon: CheckCircle2,
//         label: "Completed",
//       },
//       cancelled: {
//         color: "bg-red-50 text-red-700 border-red-200",
//         icon: XCircle,
//         label: "Cancelled",
//       },
//     };
//     return configs[status] || configs.pending;
//   };

//   const filteredAndSortedAppointments = useMemo(() => {
//     let filtered = [...appointments];

//     if (filter !== "all") {
//       filtered = filtered.filter((apt) => apt.status === filter);
//     }

//     if (searchQuery.trim()) {
//       const query = searchQuery.toLowerCase().trim();
//       filtered = filtered.filter(
//         (apt) =>
//           apt.doctor?.user?.fullName?.toLowerCase().includes(query) ||
//           apt.doctor?.specialization?.toLowerCase().includes(query) ||
//           apt.doctor?.department?.toLowerCase().includes(query),
//       );
//     }

//     switch (sortBy) {
//       case "latest":
//         filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
//         break;
//       case "oldest":
//         filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
//         break;
//       case "upcoming":
//         filtered = filtered
//           .filter((apt) => new Date(apt.date) >= new Date())
//           .sort((a, b) => new Date(a.date) - new Date(b.date));
//         break;
//       default:
//         break;
//     }

//     return filtered;
//   }, [appointments, filter, searchQuery, sortBy]);

//   const stats = useMemo(() => {
//     const total = appointments.length;
//     const upcoming = appointments.filter(
//       (apt) => apt.status === "confirmed" && new Date(apt.date) >= new Date(),
//     ).length;
//     const completed = appointments.filter(
//       (apt) => apt.status === "completed",
//     ).length;
//     const cancelled = appointments.filter(
//       (apt) => apt.status === "cancelled",
//     ).length;

//     return { total, upcoming, completed, cancelled };
//   }, [appointments]);

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 p-4 md:p-8">
//         <div className="max-w-7xl mx-auto">
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
//             {[1, 2, 3, 4].map((i) => (
//               <div
//                 key={i}
//                 className="bg-white rounded-2xl shadow-sm p-6 animate-pulse"
//               >
//                 <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
//                 <div className="h-8 bg-gray-200 rounded w-1/3"></div>
//               </div>
//             ))}
//           </div>
//           <div className="bg-white rounded-2xl shadow-sm p-4 mb-6 animate-pulse">
//             <div className="flex gap-2">
//               {[1, 2, 3, 4, 5].map((i) => (
//                 <div key={i} className="h-10 bg-gray-200 rounded-lg w-20"></div>
//               ))}
//             </div>
//           </div>
//           <div className="space-y-4">
//             {[1, 2, 3].map((i) => (
//               <div
//                 key={i}
//                 className="bg-white rounded-2xl shadow-sm p-6 animate-pulse"
//               >
//                 <div className="flex items-center gap-4">
//                   <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
//                   <div className="flex-1">
//                     <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
//                     <div className="h-4 bg-gray-200 rounded w-1/4"></div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 p-4 md:p-8">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <motion.div
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="mb-8"
//         >
//           <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//             <div>
//               <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
//                 My Appointments
//               </h1>
//               <p className="text-gray-500 mt-1">
//                 Manage all your healthcare appointments in one place
//               </p>
//             </div>
//             <button
//               onClick={() => navigate("/patient/doctors")}
//               className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white px-6 py-3 rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
//             >
//               <CalendarPlus className="w-5 h-5" />
//               Book Appointment
//             </button>
//           </div>
//         </motion.div>

//         {/* Statistics */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.1 }}
//           className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
//         >
//           {[
//             {
//               label: "Total Appointments",
//               value: stats.total,
//               icon: Calendar,
//               color: "from-blue-500 to-blue-600",
//             },
//             {
//               label: "Upcoming",
//               value: stats.upcoming,
//               icon: CalendarCheck,
//               color: "from-emerald-500 to-emerald-600",
//             },
//             {
//               label: "Completed",
//               value: stats.completed,
//               icon: CheckCircle2,
//               color: "from-green-500 to-green-600",
//             },
//             {
//               label: "Cancelled",
//               value: stats.cancelled,
//               icon: XCircle,
//               color: "from-red-500 to-red-600",
//             },
//           ].map((stat, index) => (
//             <motion.div
//               key={stat.label}
//               initial={{ opacity: 0, scale: 0.9 }}
//               animate={{ opacity: 1, scale: 1 }}
//               transition={{ delay: 0.1 * (index + 1) }}
//               className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20"
//             >
//               <div className="flex items-center justify-between mb-2">
//                 <span className="text-gray-500 text-sm font-medium">
//                   {stat.label}
//                 </span>
//                 <div
//                   className={`bg-gradient-to-r ${stat.color} p-2 rounded-xl`}
//                 >
//                   <stat.icon className="w-4 h-4 text-white" />
//                 </div>
//               </div>
//               <div className="text-2xl font-bold text-gray-800">
//                 {stat.value}
//               </div>
//             </motion.div>
//           ))}
//         </motion.div>

//         {/* Filters & Search */}
//         <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-4 md:p-6 mb-6 border border-white/20 sticky top-4 z-10">
//           <div className="flex flex-col lg:flex-row gap-4">
//             <div className="flex-1 relative">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//               <input
//                 type="text"
//                 placeholder="Search by doctor, specialization, or department..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//               />
//               {searchQuery && (
//                 <button
//                   onClick={() => setSearchQuery("")}
//                   className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                 >
//                   <X className="w-5 h-5" />
//                 </button>
//               )}
//             </div>

//             <div className="flex items-center gap-2">
//               <ArrowUpDown className="w-5 h-5 text-gray-400" />
//               <select
//                 value={sortBy}
//                 onChange={(e) => setSortBy(e.target.value)}
//                 className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               >
//                 <option value="latest">Latest First</option>
//                 <option value="oldest">Oldest First</option>
//                 <option value="upcoming">Upcoming First</option>
//               </select>
//             </div>
//           </div>

//           <div className="flex flex-wrap gap-2 mt-4">
//             {["all", "pending", "confirmed", "completed", "cancelled"].map(
//               (status) => (
//                 <button
//                   key={status}
//                   onClick={() => setFilter(status)}
//                   className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
//                     filter === status
//                       ? "bg-gradient-to-r from-blue-600 to-emerald-600 text-white shadow-md"
//                       : "bg-gray-100 text-gray-600 hover:bg-gray-200"
//                   }`}
//                 >
//                   {status.charAt(0).toUpperCase() + status.slice(1)}
//                 </button>
//               ),
//             )}
//           </div>
//         </div>

//         {/* Appointments List */}
//         {filteredAndSortedAppointments.length === 0 ? (
//           <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-12 text-center border border-white/20">
//             <div className="flex flex-col items-center">
//               <div className="bg-gradient-to-br from-blue-100 to-emerald-100 rounded-full p-6 mb-6">
//                 <Calendar className="w-16 h-16 text-blue-600" />
//               </div>
//               <h3 className="text-2xl font-bold text-gray-800 mb-2">
//                 No Appointments Found
//               </h3>
//               <p className="text-gray-500 mb-6 max-w-md">
//                 {searchQuery || filter !== "all"
//                   ? "No appointments match your current filters. Try adjusting your search criteria."
//                   : "You haven't booked any appointments yet. Start your healthcare journey today!"}
//               </p>
//               {searchQuery || filter !== "all" ? (
//                 <button
//                   onClick={() => {
//                     setSearchQuery("");
//                     setFilter("all");
//                   }}
//                   className="text-blue-600 font-medium hover:text-blue-700"
//                 >
//                   Clear all filters
//                 </button>
//               ) : (
//                 <button
//                   onClick={() => navigate("/patient/doctors")}
//                   className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white px-8 py-3 rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all"
//                 >
//                   Book Your First Appointment
//                 </button>
//               )}
//             </div>
//           </div>
//         ) : (
//           <div className="space-y-4">
//             {filteredAndSortedAppointments.map((appointment) => {
//               const statusConfig = getStatusConfig(appointment.status);
//               const StatusIcon = statusConfig.icon;

//               return (
//                 <div
//                   key={appointment._id}
//                   className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-white/20 hover:shadow-xl transition-shadow duration-300"
//                 >
//                   <div className="p-6">
//                     <div className="flex flex-col lg:flex-row lg:items-start gap-4">
//                       {/* Doctor Info */}
//                       <div className="flex-1">
//                         <div className="flex items-start gap-4">
//                           <div className="relative flex-shrink-0">
//                             <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-emerald-100 flex items-center justify-center overflow-hidden">
//                               {appointment.doctor?.profilePhoto ? (
//                                 <img
//                                   src={appointment.doctor.profilePhoto}
//                                   alt={appointment.doctor.user?.fullName}
//                                   className="w-full h-full object-cover"
//                                 />
//                               ) : (
//                                 <User className="w-8 h-8 text-blue-600" />
//                               )}
//                             </div>
//                             {appointment.type === "video" && (
//                               <div className="absolute -top-1 -right-1 bg-blue-600 rounded-full p-1">
//                                 <Video className="w-3 h-3 text-white" />
//                               </div>
//                             )}
//                           </div>

//                           <div className="flex-1 min-w-0">
//                             <div className="flex flex-wrap items-center gap-2 mb-1">
//                               <h3 className="text-lg font-semibold text-gray-800 truncate">
//                                 Dr. {appointment.doctor?.user?.fullName || "Unknown"}
//                               </h3>
//                               <span
//                                 className={`px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.color} flex items-center gap-1 whitespace-nowrap`}
//                               >
//                                 <StatusIcon className="w-3 h-3" />
//                                 {statusConfig.label}
//                               </span>
//                             </div>

//                             <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-2">
//                               <span className="flex items-center gap-1">
//                                 <Stethoscope className="w-4 h-4 text-blue-500" />
//                                 {appointment.doctor?.specialization || "General"}
//                               </span>
//                               <span className="flex items-center gap-1">
//                                 <Building2 className="w-4 h-4 text-emerald-500" />
//                                 {appointment.doctor?.department || "General"}
//                               </span>
//                               <span className="flex items-center gap-1">
//                                 <MapPin className="w-4 h-4 text-gray-400" />
//                                 {appointment.doctor?.hospital?.name || "Hospital"}
//                               </span>
//                             </div>

//                             <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
//                               <span className="flex items-center gap-1">
//                                 <Calendar className="w-4 h-4 text-gray-400" />
//                                 {new Date(appointment.date).toLocaleDateString(
//                                   "en-US",
//                                   {
//                                     weekday: "short",
//                                     year: "numeric",
//                                     month: "short",
//                                     day: "numeric",
//                                   }
//                                 )}
//                               </span>
//                               <span className="flex items-center gap-1">
//                                 <Clock className="w-4 h-4 text-gray-400" />
//                                 {appointment.timeSlot}
//                               </span>
//                               <span className="flex items-center gap-1">
//                                 <UserRound className="w-4 h-4 text-gray-400" />
//                                 {appointment.type === "video" ? "Video" : "Physical"}
//                               </span>
//                               <span className="flex items-center gap-1">
//                                 <CreditCard className="w-4 h-4 text-gray-400" />
//                                 ₹{appointment.fee ||
//                                   appointment.doctor?.consultationFee ||
//                                   0}
//                               </span>
//                             </div>

//                             {(appointment.symptoms ||
//                               appointment.reason ||
//                               appointment.notes) && (
//                               <div className="mt-3 p-3 bg-gray-50 rounded-xl space-y-1">
//                                 {appointment.reason && (
//                                   <p className="text-sm text-gray-700">
//                                     <span className="font-medium">Reason:</span>{" "}
//                                     {appointment.reason}
//                                   </p>
//                                 )}
//                                 {appointment.symptoms && (
//                                   <p className="text-sm text-gray-700">
//                                     <span className="font-medium">
//                                       Symptoms:
//                                     </span>{" "}
//                                     {appointment.symptoms}
//                                   </p>
//                                 )}
//                                 {appointment.notes && (
//                                   <p className="text-sm text-gray-700">
//                                     <span className="font-medium">Notes:</span>{" "}
//                                     {appointment.notes}
//                                   </p>
//                                 )}
//                               </div>
//                             )}

//                             <div className="mt-2 text-xs text-gray-400">
//                               Booking ID: {appointment.bookingId || appointment._id}
//                             </div>
//                           </div>
//                         </div>
//                       </div>

//                       {/* Actions */}
//                       <div className="flex flex-wrap gap-2 lg:flex-col lg:min-w-[140px]">
//                         {appointment.status === "pending" && (
//                           <button
//                             onClick={() =>
//                               handleCancelAppointment(appointment._id)
//                             }
//                             className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
//                           >
//                             <XCircle className="w-4 h-4" />
//                             Cancel
//                           </button>
//                         )}

//                         {appointment.status === "confirmed" && (
//                           <>
//                             <button
//                               onClick={() => {/* View details modal */}}
//                               className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
//                             >
//                               <Info className="w-4 h-4" />
//                               View Details
//                             </button>
//                             <button
//                               onClick={() => handleReschedule(appointment)}
//                               className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
//                             >
//                               <CalendarPlus className="w-4 h-4" />
//                               Reschedule
//                             </button>
//                             {appointment.type === "video" && (
//                               <button
//                                 onClick={() => handleJoinVideoCall(appointment)}
//                                 className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
//                               >
//                                 <Video className="w-4 h-4" />
//                                 Join Call
//                               </button>
//                             )}
//                           </>
//                         )}

//                         {appointment.status === "completed" && (
//                           <>
//                             <button
//                               onClick={() => handleViewPrescription(appointment)}
//                               className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
//                             >
//                               <FileText className="w-4 h-4" />
//                               Prescription
//                             </button>
//                             <button
//                               onClick={() => handleDownloadReport(appointment)}
//                               className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
//                             >
//                               <Download className="w-4 h-4" />
//                               Report
//                             </button>
//                           </>
//                         )}

//                         {appointment.status === "cancelled" && (
//                           <div className="bg-gray-100 text-gray-500 px-4 py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-2">
//                             <AlertCircle className="w-4 h-4" />
//                             Cancelled
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default MyAppointments;












// src/pages/patient/MyAppointments.jsx
import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  Building2,
  Video,
  UserRound,
  Search,
  ArrowUpDown,
  X,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock as ClockIcon,
  FileText,
  Download,
  CalendarPlus,
  MapPin,
  CreditCard,
  Info,
  AlertCircle,
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

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await api.get("/patients/appointments");
      setAppointments(response.data.appointments || []);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?"))
      return;

    try {
      await api.put(`/patients/appointments/${appointmentId}/cancel`);
      toast.success("Appointment cancelled successfully");
      fetchAppointments();
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      toast.error("Failed to cancel appointment");
    }
  };

  const handleReschedule = (appointment) => {
    navigate("/patient/doctors", { state: { reschedule: appointment } });
  };

  const handleJoinVideoCall = (appointment) => {
    navigate(`/patient/video-call/${appointment._id}`);
  };

  const handleViewPrescription = (appointment) => {
    navigate(`/patient/prescriptions/${appointment._id}`);
  };

  const handleDownloadReport = (appointment) => {
    toast.success("Report downloading...");
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        color: "bg-amber-50 text-amber-700 border-amber-200",
        icon: ClockIcon,
        label: "Pending",
      },
      confirmed: {
        color: "bg-cyan-50 text-cyan-700 border-cyan-200",
        icon: CalendarCheck,
        label: "Confirmed",
      },
      completed: {
        color: "bg-emerald-50 text-emerald-700 border-emerald-200",
        icon: CheckCircle2,
        label: "Completed",
      },
      cancelled: {
        color: "bg-red-50 text-red-700 border-red-200",
        icon: XCircle,
        label: "Cancelled",
      },
    };
    return configs[status] || configs.pending;
  };

  const filteredAndSortedAppointments = useMemo(() => {
    let filtered = [...appointments];

    if (filter !== "all") {
      filtered = filtered.filter((apt) => apt.status === filter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (apt) =>
          apt.doctor?.user?.fullName?.toLowerCase().includes(query) ||
          apt.doctor?.specialization?.toLowerCase().includes(query) ||
          apt.doctor?.department?.toLowerCase().includes(query),
      );
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
      (apt) => apt.status === "confirmed" && new Date(apt.date) >= new Date(),
    ).length;
    const completed = appointments.filter(
      (apt) => apt.status === "completed",
    ).length;
    const cancelled = appointments.filter(
      (apt) => apt.status === "cancelled",
    ).length;

    return { total, upcoming, completed, cancelled };
  }, [appointments]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl shadow-sm p-6 animate-pulse"
              >
                <div className="h-4 bg-slate-200 rounded w-1/2 mb-3"></div>
                <div className="h-8 bg-slate-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-4 mb-6 animate-pulse">
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-10 bg-slate-200 rounded-lg w-20"></div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl shadow-sm p-6 animate-pulse"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-slate-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-slate-200 rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                My Appointments
              </h1>
              <p className="text-slate-500 mt-1">
                Manage all your healthcare appointments in one place
              </p>
            </div>
            <button
              onClick={() => navigate("/patient/doctors")}
              className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-6 py-3 rounded-2xl font-medium shadow-lg shadow-teal-600/20 hover:shadow-xl hover:shadow-teal-600/30 transition-all flex items-center gap-2"
            >
              <CalendarPlus className="w-5 h-5" />
              Book Appointment
            </button>
          </div>
        </motion.div>

        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {[
            {
              label: "Total Appointments",
              value: stats.total,
              icon: Calendar,
              color: "from-teal-500 to-teal-600",
            },
            {
              label: "Upcoming",
              value: stats.upcoming,
              icon: CalendarCheck,
              color: "from-emerald-500 to-emerald-600",
            },
            {
              label: "Completed",
              value: stats.completed,
              icon: CheckCircle2,
              color: "from-emerald-500 to-emerald-600",
            },
            {
              label: "Cancelled",
              value: stats.cancelled,
              icon: XCircle,
              color: "from-red-500 to-red-600",
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * (index + 1) }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-500 text-sm font-medium">
                  {stat.label}
                </span>
                <div
                  className={`bg-gradient-to-r ${stat.color} p-2 rounded-xl`}
                >
                  <stat.icon className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-800">
                {stat.value}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Filters & Search */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-4 md:p-6 mb-6 border border-white/20 sticky top-4 z-10">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by doctor, specialization, or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-5 h-5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-700"
              >
                <option value="latest">Latest First</option>
                <option value="oldest">Oldest First</option>
                <option value="upcoming">Upcoming First</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {["all", "pending", "confirmed", "completed", "cancelled"].map(
              (status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    filter === status
                      ? "bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md shadow-teal-500/20"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ),
            )}
          </div>
        </div>

        {/* Appointments List */}
        {filteredAndSortedAppointments.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-12 text-center border border-white/20">
            <div className="flex flex-col items-center">
              <div className="bg-gradient-to-br from-teal-100 to-emerald-100 rounded-full p-6 mb-6">
                <Calendar className="w-16 h-16 text-teal-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">
                No Appointments Found
              </h3>
              <p className="text-slate-500 mb-6 max-w-md">
                {searchQuery || filter !== "all"
                  ? "No appointments match your current filters. Try adjusting your search criteria."
                  : "You haven't booked any appointments yet. Start your healthcare journey today!"}
              </p>
              {searchQuery || filter !== "all" ? (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setFilter("all");
                  }}
                  className="text-teal-600 font-medium hover:text-teal-700"
                >
                  Clear all filters
                </button>
              ) : (
                <button
                  onClick={() => navigate("/patient/doctors")}
                  className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-8 py-3 rounded-2xl font-medium shadow-lg shadow-teal-600/20 hover:shadow-xl hover:shadow-teal-600/30 transition-all"
                >
                  Book Your First Appointment
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAndSortedAppointments.map((appointment) => {
              const statusConfig = getStatusConfig(appointment.status);
              const StatusIcon = statusConfig.icon;

              return (
                <motion.div
                  key={appointment._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-white/20 hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                      {/* Doctor Info */}
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <div className="relative flex-shrink-0">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-100 to-emerald-100 flex items-center justify-center overflow-hidden">
                              {appointment.doctor?.profilePhoto ? (
                                <img
                                  src={appointment.doctor.profilePhoto}
                                  alt={appointment.doctor.user?.fullName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <User className="w-8 h-8 text-teal-600" />
                              )}
                            </div>
                            {appointment.type === "video" && (
                              <div className="absolute -top-1 -right-1 bg-teal-600 rounded-full p-1">
                                <Video className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <h3 className="text-lg font-semibold text-slate-800 truncate">
                                Dr. {appointment.doctor?.user?.fullName || "Unknown"}
                              </h3>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.color} flex items-center gap-1 whitespace-nowrap`}
                              >
                                <StatusIcon className="w-3 h-3" />
                                {statusConfig.label}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 mb-2">
                              <span className="flex items-center gap-1">
                                <Stethoscope className="w-4 h-4 text-teal-500" />
                                {appointment.doctor?.specialization || "General"}
                              </span>
                              <span className="flex items-center gap-1">
                                <Building2 className="w-4 h-4 text-emerald-500" />
                                {appointment.doctor?.department || "General"}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4 text-slate-400" />
                                {appointment.doctor?.hospital?.name || "Hospital"}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4 text-slate-400" />
                                {new Date(appointment.date).toLocaleDateString(
                                  "en-US",
                                  {
                                    weekday: "short",
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  }
                                )}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4 text-slate-400" />
                                {appointment.timeSlot}
                              </span>
                              <span className="flex items-center gap-1">
                                <UserRound className="w-4 h-4 text-slate-400" />
                                {appointment.type === "video" ? "Video" : "Physical"}
                              </span>
                              <span className="flex items-center gap-1">
                                <CreditCard className="w-4 h-4 text-slate-400" />
                                ₹{appointment.fee ||
                                  appointment.doctor?.consultationFee ||
                                  0}
                              </span>
                            </div>

                            {(appointment.symptoms ||
                              appointment.reason ||
                              appointment.notes) && (
                              <div className="mt-3 p-3 bg-slate-50 rounded-xl space-y-1 border border-slate-100">
                                {appointment.reason && (
                                  <p className="text-sm text-slate-700">
                                    <span className="font-medium">Reason:</span>{" "}
                                    {appointment.reason}
                                  </p>
                                )}
                                {appointment.symptoms && (
                                  <p className="text-sm text-slate-700">
                                    <span className="font-medium">
                                      Symptoms:
                                    </span>{" "}
                                    {appointment.symptoms}
                                  </p>
                                )}
                                {appointment.notes && (
                                  <p className="text-sm text-slate-700">
                                    <span className="font-medium">Notes:</span>{" "}
                                    {appointment.notes}
                                  </p>
                                )}
                              </div>
                            )}

                            <div className="mt-2 text-xs text-slate-400">
                              Booking ID: {appointment.bookingId || appointment._id}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2 lg:flex-col lg:min-w-[140px]">
                        {appointment.status === "pending" && (
                          <button
                            onClick={() =>
                              handleCancelAppointment(appointment._id)
                            }
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-md shadow-red-500/20"
                          >
                            <XCircle className="w-4 h-4" />
                            Cancel
                          </button>
                        )}

                        {appointment.status === "confirmed" && (
                          <>
                            <button
                              onClick={() => {/* View details modal */}}
                              className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-md shadow-cyan-500/20"
                            >
                              <Info className="w-4 h-4" />
                              View Details
                            </button>
                            <button
                              onClick={() => handleReschedule(appointment)}
                              className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20"
                            >
                              <CalendarPlus className="w-4 h-4" />
                              Reschedule
                            </button>
                            {appointment.type === "video" && (
                              <button
                                onClick={() => handleJoinVideoCall(appointment)}
                                className="bg-violet-500 hover:bg-violet-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-md shadow-violet-500/20"
                              >
                                <Video className="w-4 h-4" />
                                Join Call
                              </button>
                            )}
                          </>
                        )}

                        {appointment.status === "completed" && (
                          <>
                            <button
                              onClick={() => handleViewPrescription(appointment)}
                              className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20"
                            >
                              <FileText className="w-4 h-4" />
                              Prescription
                            </button>
                            <button
                              onClick={() => handleDownloadReport(appointment)}
                              className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-md shadow-cyan-500/20"
                            >
                              <Download className="w-4 h-4" />
                              Report
                            </button>
                          </>
                        )}

                        {appointment.status === "cancelled" && (
                          <div className="bg-slate-100 text-slate-500 px-4 py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            Cancelled
                          </div>
                        )}
                      </div>
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

export default MyAppointments;