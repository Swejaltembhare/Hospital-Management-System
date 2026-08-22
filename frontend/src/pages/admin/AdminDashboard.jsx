// // src/pages/admin/AdminDashboard.jsx
// import React, { useState, useEffect } from "react";
// import { motion } from "framer-motion";
// import { useAuth } from "../../context/AuthContext";
// import toast from "react-hot-toast";
// import {
//   Users,
//   Calendar,
//   Clock,
//   CheckCircle,
//   XCircle,
//   Activity,
//   Stethoscope,
//   Building2,
//   Settings,
//   Shield,
//   Mail,
//   Phone,
//   Star,
//   ChevronRight,
//   UserPlus,
//   Edit,
//   Trash2,
// } from "lucide-react";
// import Analytics from "../../components/admin/Analytics";
// import { adminAPI } from "../../services/api";

// const AdminDashboard = () => {
//   const { user } = useAuth();
//   const [stats, setStats] = useState(null);
//   const [recentActivities, setRecentActivities] = useState([]);
//   const [appointments, setAppointments] = useState([]);
//   const [doctors, setDoctors] = useState([]);
//   const [patients, setPatients] = useState([]);
//   const [systemHealth, setSystemHealth] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [showAllDoctors, setShowAllDoctors] = useState(false);
//   const [showAllPatients, setShowAllPatients] = useState(false);

//   useEffect(() => {
//     fetchDashboardData();
//   }, []);

//   const fetchDashboardData = async () => {
//     setLoading(true);
//     try {
//       const [statsRes, doctorsRes, patientsRes] = await Promise.all([
//         adminAPI.getStats(),
//         adminAPI.getDoctors({ limit: 10 }),
//         adminAPI.getPatients({ limit: 5 }),
//       ]);

//       console.log("Stats Response:", statsRes.data);
//       console.log("Doctors Response:", doctorsRes.data);
//       console.log("Patients Response:", patientsRes.data);

//       setStats(statsRes.data.data);
//       const doctorsData = doctorsRes.data.data || [];
//       setDoctors(Array.isArray(doctorsData) ? doctorsData : []);
//       const patientsData = patientsRes.data.data || [];
//       setPatients(Array.isArray(patientsData) ? patientsData : []);
//       setRecentActivities([]);
//       setAppointments([]);
//       setSystemHealth(null);
//     } catch (error) {
//       console.error("Error fetching dashboard data:", error);
//       toast.error("Failed to load dashboard data");
//       setStats({
//         totalDoctors: 0,
//         totalPatients: 0,
//         totalDepartments: 0,
//         totalAppointments: 0,
//         todayAppointments: 0,
//         pendingAppointments: 0,
//         completedAppointments: 0,
//         cancelledAppointments: 0,
//       });
//       setDoctors([]);
//       setPatients([]);
//       setRecentActivities([]);
//       setAppointments([]);
//       setSystemHealth(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) return <LoadingSkeleton />;

//   const statCards = [
//     {
//       label: "Total Doctors",
//       value: stats?.totalDoctors || 0,
//       icon: Stethoscope,
//       color: "from-teal-500 to-teal-600",
//     },
//     {
//       label: "Total Patients",
//       value: stats?.totalPatients || 0,
//       icon: Users,
//       color: "from-emerald-500 to-emerald-600",
//     },
//     {
//       label: "Departments",
//       value: stats?.totalDepartments || 0,
//       icon: Building2,
//       color: "from-cyan-500 to-cyan-600",
//     },
//     {
//       label: "Total Appointments",
//       value: stats?.totalAppointments || 0,
//       icon: Calendar,
//       color: "from-indigo-500 to-indigo-600",
//     },
//     {
//       label: "Today's Appointments",
//       value: stats?.todayAppointments || 0,
//       icon: Clock,
//       color: "from-blue-500 to-blue-600",
//     },
//     {
//       label: "Pending",
//       value: stats?.pendingAppointments || 0,
//       icon: Activity,
//       color: "from-yellow-500 to-yellow-600",
//     },
//     {
//       label: "Completed",
//       value: stats?.completedAppointments || 0,
//       icon: CheckCircle,
//       color: "from-emerald-500 to-emerald-600",
//     },
//     {
//       label: "Cancelled",
//       value: stats?.cancelledAppointments || 0,
//       icon: XCircle,
//       color: "from-red-500 to-red-600",
//     },
//   ];

//   const departments = [
//     ...new Set(doctors.map((d) => d.department).filter(Boolean)),
//   ];
//   const totalDoctors = doctors.length;

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50">
//       {/* Full width container - removed max-w-7xl and mx-auto */}
//       <div className="w-full px-4 md:px-8 py-4 md:py-8 space-y-6">
//         {/* ── Header Card ── Full Width ─────────────────────────── */}
//         <motion.div
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="w-full bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg p-6 border border-white/20"
//         >
//           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
//             <div className="flex items-center gap-4">
//               <div className="relative">
//                 <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center">
//                   {user?.profilePhoto ? (
//                     <img
//                       src={user.profilePhoto}
//                       alt={user.fullName}
//                       className="w-full h-full object-cover rounded-2xl"
//                     />
//                   ) : (
//                     <Shield className="w-10 h-10 text-white" />
//                   )}
//                 </div>
//                 <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1.5 border-2 border-white">
//                   <div className="w-2 h-2 bg-white rounded-full"></div>
//                 </div>
//               </div>
//               <div>
//                 <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
//                   Welcome back, {user?.fullName || "Admin"}! 👋
//                 </h1>
//                 <p className="text-gray-600 mt-1">
//                   MediCare Hospital Management System
//                 </p>
//                 <p className="text-sm text-gray-400 mt-1">
//                   {new Date().toLocaleDateString("en-US", {
//                     weekday: "long",
//                     year: "numeric",
//                     month: "long",
//                     day: "numeric",
//                   })}
//                 </p>
//               </div>
//             </div>
//             <div className="flex items-center gap-3">
//               <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200">
//                 <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
//                 <span className="text-sm font-medium text-emerald-700">
//                   System Online
//                 </span>
//               </div>
//               <motion.button
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//                 className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-lg hover:shadow-xl transition-all"
//               >
//                 <Settings className="w-4 h-4 inline mr-1" />
//                 System Settings
//               </motion.button>
//             </div>
//           </div>
//         </motion.div>

//         {/* ── 8 Statistics Cards ── Full Width ──────────────────── */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.1 }}
//           className="w-full grid grid-cols-2 md:grid-cols-4 gap-4"
//         >
//           {statCards.map((stat, index) => (
//             <motion.div
//               key={stat.label}
//               initial={{ opacity: 0, scale: 0.9 }}
//               animate={{ opacity: 1, scale: 1 }}
//               transition={{ delay: 0.05 * (index + 1) }}
//               whileHover={{ y: -5, transition: { duration: 0.2 } }}
//               className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-5 border border-white/20 hover:shadow-xl transition-all duration-300"
//             >
//               <div className="flex items-start justify-between">
//                 <div className="flex-1 min-w-0">
//                   <p className="text-xs font-medium text-gray-500 uppercase tracking-wider truncate">
//                     {stat.label}
//                   </p>
//                   <p className="text-2xl font-bold text-gray-800 mt-1">
//                     {stat.value}
//                   </p>
//                 </div>
//                 <div
//                   className={`bg-gradient-to-r ${stat.color} p-2.5 rounded-xl flex-shrink-0 ml-2`}
//                 >
//                   <stat.icon className="w-5 h-5 text-white" />
//                 </div>
//               </div>
//             </motion.div>
//           ))}
//         </motion.div>

//         {/* ── Analytics ── Full Width ───────────────────────────── */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.2 }}
//           className="w-full"
//         >
//           <Analytics />
//         </motion.div>

//         {/* ── Recent Activity + Doctors List ── Full Width ──────── */}
//         <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* Recent Activity */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.25 }}
//             className="lg:col-span-1 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-white/20"
//           >
//             <div className="p-6 border-b border-gray-100 flex justify-between items-center flex-shrink-0">
//               <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
//                 <Activity className="w-5 h-5 text-teal-600" />
//                 Recent Activity
//               </h3>
//               {recentActivities.length > 0 && (
//                 <span className="bg-teal-50 text-teal-600 px-3 py-1 rounded-full text-sm font-medium">
//                   {recentActivities.length}
//                 </span>
//               )}
//             </div>
//             <div className="p-4 max-h-[400px] overflow-y-auto">
//               {recentActivities.length > 0 ? (
//                 <div className="divide-y divide-gray-100">
//                   {recentActivities.map((activity, index) => (
//                     <motion.div
//                       key={activity.id || index}
//                       initial={{ opacity: 0, x: -10 }}
//                       animate={{ opacity: 1, x: 0 }}
//                       transition={{ delay: 0.04 * index }}
//                       className="py-3 flex items-start gap-3 hover:bg-gray-50 rounded-xl px-2 transition-colors"
//                     >
//                       <div
//                         className={`p-1.5 rounded-lg flex-shrink-0 ${
//                           activity.type === "new"
//                             ? "bg-blue-50 text-blue-600"
//                             : activity.type === "cancelled"
//                               ? "bg-red-50 text-red-600"
//                               : activity.type === "completed"
//                                 ? "bg-emerald-50 text-emerald-600"
//                                 : "bg-teal-50 text-teal-600"
//                         }`}
//                       >
//                         <Activity className="w-4 h-4" />
//                       </div>
//                       <div className="flex-1 min-w-0">
//                         <p className="text-sm text-gray-700 truncate">
//                           {activity.message}
//                         </p>
//                         <p className="text-xs text-gray-400 mt-0.5">
//                           {activity.time}
//                         </p>
//                       </div>
//                     </motion.div>
//                   ))}
//                 </div>
//               ) : (
//                 <div className="flex items-center justify-center py-12 text-center text-gray-500">
//                   <div>
//                     <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
//                     <p className="font-medium text-gray-600">
//                       No recent activity
//                     </p>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </motion.div>

//           {/* Doctors List - REAL DATA */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.3 }}
//             className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-white/20"
//           >
//             <div className="p-6 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
//               <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
//                 <Stethoscope className="w-5 h-5 text-teal-600" />
//                 Doctors
//                 <span className="bg-teal-50 text-teal-600 px-3 py-1 rounded-full text-sm font-medium ml-2">
//                   {totalDoctors}
//                 </span>
//               </h3>
//               <div className="flex items-center gap-2">
//                 <button
//                   onClick={() => setShowAllDoctors(!showAllDoctors)}
//                   className="text-sm text-teal-600 font-medium hover:text-teal-700 flex items-center gap-1"
//                 >
//                   {showAllDoctors ? "Show Less" : "View All"}
//                   <ChevronRight
//                     className={`w-4 h-4 transition-transform ${showAllDoctors ? "rotate-90" : ""}`}
//                   />
//                 </button>
//               </div>
//             </div>

//             <div className="p-4 max-h-[400px] overflow-y-auto">
//               {doctors && doctors.length > 0 ? (
//                 <div className="space-y-3">
//                   {(showAllDoctors ? doctors : doctors.slice(0, 4)).map(
//                     (doctor, index) => (
//                       <motion.div
//                         key={doctor._id || index}
//                         initial={{ opacity: 0, y: 10 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         transition={{ delay: 0.05 * index }}
//                         className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow"
//                       >
//                         <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
//                           <div className="flex items-center gap-3 min-w-0">
//                             <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-100 to-emerald-100 flex items-center justify-center flex-shrink-0">
//                               <Stethoscope className="w-6 h-6 text-teal-600" />
//                             </div>
//                             <div className="min-w-0">
//                               <p className="font-semibold text-gray-800 truncate">
//                                 Dr.{" "}
//                                 {doctor.user?.fullName ||
//                                   doctor.fullName ||
//                                   "Unknown"}
//                               </p>
//                               <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
//                                 <span className="bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full text-xs">
//                                   {doctor.department || "N/A"}
//                                 </span>
//                                 <span>•</span>
//                                 <span>
//                                   {doctor.specialization || "General"}
//                                 </span>
//                                 <span>•</span>
//                                 <span className="flex items-center gap-0.5">
//                                   <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
//                                   {doctor.rating || "4.5"}
//                                 </span>
//                               </div>
//                             </div>
//                           </div>
//                           <div className="flex flex-wrap items-center gap-3 ml-0 md:ml-4">
//                             <div className="flex items-center gap-1 text-xs text-gray-500">
//                               <Mail className="w-3 h-3" />
//                               <span className="truncate max-w-[120px]">
//                                 {doctor.user?.email || doctor.email || "N/A"}
//                               </span>
//                             </div>
//                             <div className="flex items-center gap-1 text-xs text-gray-500">
//                               <Phone className="w-3 h-3" />
//                               <span>
//                                 {doctor.user?.phoneNumber ||
//                                   doctor.phoneNumber ||
//                                   "N/A"}
//                               </span>
//                             </div>
//                             <div className="flex items-center gap-1">
//                               <span
//                                 className={`px-2 py-0.5 rounded-full text-xs font-medium ${
//                                   doctor.isAvailable !== false
//                                     ? "bg-emerald-50 text-emerald-700"
//                                     : "bg-red-50 text-red-700"
//                                 }`}
//                               >
//                                 {doctor.isAvailable !== false
//                                   ? "Available"
//                                   : "Unavailable"}
//                               </span>
//                             </div>
//                             <div className="flex gap-1">
//                               <button className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors">
//                                 <Edit className="w-4 h-4" />
//                               </button>
//                               <button className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors">
//                                 <Trash2 className="w-4 h-4" />
//                               </button>
//                             </div>
//                           </div>
//                         </div>
//                       </motion.div>
//                     ),
//                   )}
//                 </div>
//               ) : (
//                 <div className="flex items-center justify-center py-12 text-center text-gray-500">
//                   <div>
//                     <Stethoscope className="w-12 h-12 text-gray-300 mx-auto mb-3" />
//                     <p className="font-medium text-gray-600">
//                       No doctors found
//                     </p>
//                     <p className="text-sm text-gray-400 mt-1">
//                       Add your first doctor from the admin panel
//                     </p>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </motion.div>
//         </div>

//         {/* ── Quick Actions + Patient Overview ── Full Width ────── */}
//         <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* Quick Actions */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.35 }}
//             className="lg:col-span-1"
//           >
//             <QuickActions />
//           </motion.div>

//           {/* Patient Overview - REAL DATA */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.4 }}
//             className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-white/20"
//           >
//             <div className="p-6 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
//               <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
//                 <Users className="w-5 h-5 text-emerald-600" />
//                 Recent Patients
//                 <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-sm font-medium ml-2">
//                   {(patients && patients.length) || 0}
//                 </span>
//               </h3>
//               <div className="flex items-center gap-2">
//                 <button
//                   onClick={() => setShowAllPatients(!showAllPatients)}
//                   className="text-sm text-emerald-600 font-medium hover:text-emerald-700 flex items-center gap-1"
//                 >
//                   {showAllPatients ? "Show Less" : "View All"}
//                   <ChevronRight
//                     className={`w-4 h-4 transition-transform ${
//                       showAllPatients ? "rotate-90" : ""
//                     }`}
//                   />
//                 </button>
//               </div>
//             </div>
//             <div className="p-4 max-h-[300px] overflow-y-auto">
//               {patients && patients.length > 0 ? (
//                 <div className="space-y-3">
//                   {patients.slice(0, 5).map((patient, index) => (
//                     <motion.div
//                       key={patient._id || index}
//                       initial={{ opacity: 0, y: 10 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       transition={{ delay: 0.05 * index }}
//                       className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors"
//                     >
//                       <div className="flex items-center gap-3 min-w-0">
//                         <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center flex-shrink-0">
//                           <Users className="w-5 h-5 text-emerald-600" />
//                         </div>
//                         <div className="min-w-0">
//                           <p className="font-medium text-gray-800 truncate">
//                             {patient.user?.fullName ||
//                               patient.fullName ||
//                               "N/A"}
//                           </p>
//                           <p className="text-xs text-gray-500 truncate">
//                             {patient.user?.email || patient.email || "N/A"}
//                           </p>
//                         </div>
//                       </div>
//                       <div className="flex items-center gap-3">
//                         <span className="text-xs text-gray-500">
//                           {patient.bloodGroup || "N/A"}
//                         </span>
//                         <span
//                           className={`px-2 py-0.5 rounded-full text-xs font-medium ${
//                             patient.isActive !== false
//                               ? "bg-emerald-50 text-emerald-700"
//                               : "bg-red-50 text-red-700"
//                           }`}
//                         >
//                           {patient.isActive !== false ? "Active" : "Inactive"}
//                         </span>
//                       </div>
//                     </motion.div>
//                   ))}
//                 </div>
//               ) : (
//                 <div className="flex items-center justify-center py-12 text-center text-gray-500">
//                   <div>
//                     <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
//                     <p className="font-medium text-gray-600">
//                       No patients found
//                     </p>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </motion.div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminDashboard;





// src/pages/admin/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import {
  Users,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Activity,
  Stethoscope,
  Building2,
  Settings,
  Shield,
  Mail,
  Phone,
  Star,
  ChevronRight,
  UserPlus,
  Edit,
  Trash2,
} from "lucide-react";
import Analytics from "../../components/admin/Analytics";
import QuickActions from "../../components/admin/QuickActions";
import { adminAPI } from "../../services/api";

// Loading Skeleton Component (inline)
const LoadingSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50 p-4 md:p-8">
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="w-full bg-white/80 rounded-3xl shadow-lg p-6 border border-white/20">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-gray-200 animate-pulse"></div>
          <div className="flex-1">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-64 bg-gray-200 rounded mt-2 animate-pulse"></div>
            <div className="h-3 w-40 bg-gray-200 rounded mt-1 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white/80 rounded-2xl shadow-lg p-5 border border-white/20">
            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-16 bg-gray-200 rounded mt-2 animate-pulse"></div>
            <div className="w-10 h-10 bg-gray-200 rounded-xl ml-auto mt-2 animate-pulse"></div>
          </div>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="w-full bg-white/80 rounded-2xl shadow-lg p-6 border border-white/20">
        <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>
        <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
      </div>

      {/* Recent Activity & Doctors Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white/80 rounded-2xl shadow-lg p-6 border border-white/20">
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-3">
              <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="flex-1">
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 w-20 bg-gray-200 rounded mt-1 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
        <div className="lg:col-span-2 bg-white/80 rounded-2xl shadow-lg p-6 border border-white/20">
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-3 border-b border-gray-100">
              <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse"></div>
              <div className="flex-1">
                <div className="h-4 w-40 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 w-32 bg-gray-200 rounded mt-1 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [systemHealth, setSystemHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAllDoctors, setShowAllDoctors] = useState(false);
  const [showAllPatients, setShowAllPatients] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, doctorsRes, patientsRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getDoctors({ limit: 10 }),
        adminAPI.getPatients({ limit: 5 }),
      ]);

      console.log("Stats Response:", statsRes.data);
      console.log("Doctors Response:", doctorsRes.data);
      console.log("Patients Response:", patientsRes.data);

      setStats(statsRes.data.data);
      const doctorsData = doctorsRes.data.data || [];
      setDoctors(Array.isArray(doctorsData) ? doctorsData : []);
      const patientsData = patientsRes.data.data || [];
      setPatients(Array.isArray(patientsData) ? patientsData : []);
      setRecentActivities([]);
      setAppointments([]);
      setSystemHealth(null);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
      setStats({
        totalDoctors: 0,
        totalPatients: 0,
        totalDepartments: 0,
        totalAppointments: 0,
        todayAppointments: 0,
        pendingAppointments: 0,
        completedAppointments: 0,
        cancelledAppointments: 0,
      });
      setDoctors([]);
      setPatients([]);
      setRecentActivities([]);
      setAppointments([]);
      setSystemHealth(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSkeleton />;

  const statCards = [
    {
      label: "Total Doctors",
      value: stats?.totalDoctors || 0,
      icon: Stethoscope,
      color: "from-teal-500 to-teal-600",
    },
    {
      label: "Total Patients",
      value: stats?.totalPatients || 0,
      icon: Users,
      color: "from-emerald-500 to-emerald-600",
    },
    {
      label: "Departments",
      value: stats?.totalDepartments || 0,
      icon: Building2,
      color: "from-cyan-500 to-cyan-600",
    },
    {
      label: "Total Appointments",
      value: stats?.totalAppointments || 0,
      icon: Calendar,
      color: "from-indigo-500 to-indigo-600",
    },
    {
      label: "Today's Appointments",
      value: stats?.todayAppointments || 0,
      icon: Clock,
      color: "from-blue-500 to-blue-600",
    },
    {
      label: "Pending",
      value: stats?.pendingAppointments || 0,
      icon: Activity,
      color: "from-yellow-500 to-yellow-600",
    },
    {
      label: "Completed",
      value: stats?.completedAppointments || 0,
      icon: CheckCircle,
      color: "from-emerald-500 to-emerald-600",
    },
    {
      label: "Cancelled",
      value: stats?.cancelledAppointments || 0,
      icon: XCircle,
      color: "from-red-500 to-red-600",
    },
  ];

  const departments = [
    ...new Set(doctors.map((d) => d.department).filter(Boolean)),
  ];
  const totalDoctors = doctors.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50">
      {/* Full width container - removed max-w-7xl and mx-auto */}
      <div className="w-full px-4 md:px-8 py-4 md:py-8 space-y-6">
        {/* ── Header Card ── Full Width ─────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg p-6 border border-white/20"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center">
                  {user?.profilePhoto ? (
                    <img
                      src={user.profilePhoto}
                      alt={user.fullName}
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  ) : (
                    <Shield className="w-10 h-10 text-white" />
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1.5 border-2 border-white">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                  Welcome back, {user?.fullName || "Admin"}! 👋
                </h1>
                <p className="text-gray-600 mt-1">
                  MediCare Hospital Management System
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-emerald-700">
                  System Online
                </span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-lg hover:shadow-xl transition-all"
              >
                <Settings className="w-4 h-4 inline mr-1" />
                System Settings
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* ── 8 Statistics Cards ── Full Width ──────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="w-full grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {statCards.map((stat, index) => (
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
                  <p className="text-2xl font-bold text-gray-800 mt-1">
                    {stat.value}
                  </p>
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

        {/* ── Analytics ── Full Width ───────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full"
        >
          <Analytics />
        </motion.div>

        {/* ── Recent Activity + Doctors List ── Full Width ──────── */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="lg:col-span-1 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-white/20"
          >
            <div className="p-6 border-b border-gray-100 flex justify-between items-center flex-shrink-0">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Activity className="w-5 h-5 text-teal-600" />
                Recent Activity
              </h3>
              {recentActivities.length > 0 && (
                <span className="bg-teal-50 text-teal-600 px-3 py-1 rounded-full text-sm font-medium">
                  {recentActivities.length}
                </span>
              )}
            </div>
            <div className="p-4 max-h-[400px] overflow-y-auto">
              {recentActivities.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {recentActivities.map((activity, index) => (
                    <motion.div
                      key={activity.id || index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.04 * index }}
                      className="py-3 flex items-start gap-3 hover:bg-gray-50 rounded-xl px-2 transition-colors"
                    >
                      <div
                        className={`p-1.5 rounded-lg flex-shrink-0 ${
                          activity.type === "new"
                            ? "bg-blue-50 text-blue-600"
                            : activity.type === "cancelled"
                              ? "bg-red-50 text-red-600"
                              : activity.type === "completed"
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-teal-50 text-teal-600"
                        }`}
                      >
                        <Activity className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 truncate">
                          {activity.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {activity.time}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center py-12 text-center text-gray-500">
                  <div>
                    <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="font-medium text-gray-600">
                      No recent activity
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Doctors List - REAL DATA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-white/20"
          >
            <div className="p-6 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-teal-600" />
                Doctors
                <span className="bg-teal-50 text-teal-600 px-3 py-1 rounded-full text-sm font-medium ml-2">
                  {totalDoctors}
                </span>
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAllDoctors(!showAllDoctors)}
                  className="text-sm text-teal-600 font-medium hover:text-teal-700 flex items-center gap-1"
                >
                  {showAllDoctors ? "Show Less" : "View All"}
                  <ChevronRight
                    className={`w-4 h-4 transition-transform ${showAllDoctors ? "rotate-90" : ""}`}
                  />
                </button>
              </div>
            </div>

            <div className="p-4 max-h-[400px] overflow-y-auto">
              {doctors && doctors.length > 0 ? (
                <div className="space-y-3">
                  {(showAllDoctors ? doctors : doctors.slice(0, 4)).map(
                    (doctor, index) => (
                      <motion.div
                        key={doctor._id || index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 * index }}
                        className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-100 to-emerald-100 flex items-center justify-center flex-shrink-0">
                              <Stethoscope className="w-6 h-6 text-teal-600" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-800 truncate">
                                Dr.{" "}
                                {doctor.user?.fullName ||
                                  doctor.fullName ||
                                  "Unknown"}
                              </p>
                              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                                <span className="bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full text-xs">
                                  {doctor.department || "N/A"}
                                </span>
                                <span>•</span>
                                <span>
                                  {doctor.specialization || "General"}
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-0.5">
                                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                  {doctor.rating || "4.5"}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 ml-0 md:ml-4">
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Mail className="w-3 h-3" />
                              <span className="truncate max-w-[120px]">
                                {doctor.user?.email || doctor.email || "N/A"}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Phone className="w-3 h-3" />
                              <span>
                                {doctor.user?.phoneNumber ||
                                  doctor.phoneNumber ||
                                  "N/A"}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                  doctor.isAvailable !== false
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-red-50 text-red-700"
                                }`}
                              >
                                {doctor.isAvailable !== false
                                  ? "Available"
                                  : "Unavailable"}
                              </span>
                            </div>
                            <div className="flex gap-1">
                              <button className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ),
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center py-12 text-center text-gray-500">
                  <div>
                    <Stethoscope className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="font-medium text-gray-600">
                      No doctors found
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      Add your first doctor from the admin panel
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* ── Quick Actions + Patient Overview ── Full Width ────── */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="lg:col-span-1"
          >
            <QuickActions />
          </motion.div>

          {/* Patient Overview - REAL DATA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-white/20"
          >
            <div className="p-6 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                Recent Patients
                <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-sm font-medium ml-2">
                  {(patients && patients.length) || 0}
                </span>
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAllPatients(!showAllPatients)}
                  className="text-sm text-emerald-600 font-medium hover:text-emerald-700 flex items-center gap-1"
                >
                  {showAllPatients ? "Show Less" : "View All"}
                  <ChevronRight
                    className={`w-4 h-4 transition-transform ${
                      showAllPatients ? "rotate-90" : ""
                    }`}
                  />
                </button>
              </div>
            </div>
            <div className="p-4 max-h-[300px] overflow-y-auto">
              {patients && patients.length > 0 ? (
                <div className="space-y-3">
                  {patients.slice(0, 5).map((patient, index) => (
                    <motion.div
                      key={patient._id || index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * index }}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center flex-shrink-0">
                          <Users className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-800 truncate">
                            {patient.user?.fullName ||
                              patient.fullName ||
                              "N/A"}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {patient.user?.email || patient.email || "N/A"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500">
                          {patient.bloodGroup || "N/A"}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            patient.isActive !== false
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {patient.isActive !== false ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center py-12 text-center text-gray-500">
                  <div>
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="font-medium text-gray-600">
                      No patients found
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;