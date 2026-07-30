// // src/pages/admin/Patients.jsx
// import React, { useState, useEffect } from "react";
// import { motion } from "framer-motion";
// import {
//   Users,
//   Search,
//   UserPlus,
//   Eye,
//   Edit,
//   Trash2,
//   Phone,
//   Mail,
//   Calendar,
//   ChevronLeft,
//   ChevronRight,
//   Download,
//   Filter,
//   User,
//   MapPin,
//   Clock,
//   XCircle,
// } from "lucide-react";
// import { adminAPI } from "../../services/api";
// import toast from "react-hot-toast";

// const Patients = () => {
//   const [patients, setPatients] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [selectedPatient, setSelectedPatient] = useState(null);
//   const itemsPerPage = 6;

//   useEffect(() => {
//     fetchPatients();
//   }, []);

//   const fetchPatients = async () => {
//     setLoading(true);
//     try {
//       const response = await adminAPI.getPatients();

//       // STEP 1: Debug log to see what backend is sending
//       console.log("Patients Response:", response.data);
//       console.log("Patients Data Array:", response.data.data);

//       if (response.data.success) {
//         setPatients(response.data.data);
//         console.log("Patients set successfully:", response.data.data.length);
//       } else {
//         console.log("Response success is false:", response.data);
//       }
//     } catch (error) {
//       console.error("Error fetching patients:", error);
//       toast.error("Failed to load patients");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = async (id) => {
//     if (window.confirm("Are you sure you want to delete this patient?")) {
//       try {
//         const response = await adminAPI.deletePatient(id);
//         if (response.data.success) {
//           toast.success("Patient deleted successfully");
//           fetchPatients();
//         }
//       } catch (error) {
//         console.error("Error deleting patient:", error);
//         toast.error("Failed to delete patient");
//       }
//     }
//   };

//   // STEP 2 & 3: Export functionality
//   const handleExport = () => {
//     try {
//       // Check if there are patients to export
//       if (patients.length === 0) {
//         toast.error("No patients to export");
//         return;
//       }

//       // STEP 3: Prepare CSV data with proper fields
//       const headers = [
//         "Name",
//         "Email",
//         "Phone",
//         "Gender",
//         "Blood Group",
//         "Status",
//         "Registration Date",
//       ];

//       // STEP 4: Create CSV rows
//       const rows = patients.map((patient) => {
//         const fullName =
//           patient.user?.fullName || patient.fullName || "Unknown";
//         const email = patient.user?.email || patient.email || "N/A";
//         const phone = patient.user?.phoneNumber || patient.phoneNumber || "";
//         const gender = patient.gender || "Unknown";
//         const bloodGroup = patient.bloodGroup || "N/A";
//         const status =
//           patient.status === "active" || patient.isActive !== false
//             ? "Active"
//             : "Inactive";
//         const registeredDate = patient.createdAt
//   ? new Date(patient.createdAt).toLocaleDateString("en-GB")
//   : "N/A";

//         return [
//   fullName,
//   email,
//   `="${phone}"`,
//   gender,
//   bloodGroup,
//   status,
//   registeredDate,
// ];
//       });

//       // STEP 4: Create CSV content
//       const csvContent = [
//         headers.join(","),
//         ...rows.map((row) => row.join(",")),
//       ].join("\n");

//       // STEP 5: Create blob and download
//       const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
//       const link = document.createElement("a");
//       const url = URL.createObjectURL(blob);

//       link.setAttribute("href", url);
//       link.setAttribute(
//         "download",
//         `patients_${new Date().toISOString().split("T")[0]}.csv`,
//       );
//       link.style.visibility = "hidden";

//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);

//       // Clean up the URL object
//       URL.revokeObjectURL(url);

//       // STEP 6: Success message
//       toast.success(`Successfully exported ${patients.length} patients`);
//     } catch (error) {
//       console.error("Error exporting patients:", error);
//       toast.error("Failed to export patients");
//     }
//   };

//   // Fixed search filter with proper null checks
//   const filteredPatients = patients.filter((patient) => {
//     const fullName = patient.user?.fullName || patient.fullName || "";
//     const email = patient.user?.email || patient.email || "";
//     const phone = patient.user?.phoneNumber || patient.phoneNumber || "";
//     const searchLower = searchTerm.toLowerCase();

//     return (
//       fullName.toLowerCase().includes(searchLower) ||
//       email.toLowerCase().includes(searchLower) ||
//       phone.includes(searchTerm)
//     );
//   });

//   // Debug logs for filtering
//   console.log("Patients:", patients.length);
//   console.log("Filtered Patients:", filteredPatients.length);
//   console.log("Search Term:", searchTerm);

//   const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
//   const startIndex = (currentPage - 1) * itemsPerPage;
//   const paginatedPatients = filteredPatients.slice(
//     startIndex,
//     startIndex + itemsPerPage,
//   );

//   // Stats with proper data access
//   const stats = {
//     total: patients.length,
//     active: patients.filter(
//       (p) => p.status === "active" || p.isActive !== false,
//     ).length,
//     new: patients.filter((p) => {
//       try {
//         const days =
//           (new Date() - new Date(p.createdAt)) / (1000 * 60 * 60 * 24);
//         return days < 7;
//       } catch {
//         return false;
//       }
//     }).length,
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-96">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       className="space-y-6"
//     >
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
//           <p className="text-sm text-gray-500 mt-1">
//             Manage all patient records
//           </p>
//         </div>
//         <div className="flex gap-3">
//           <button
//             onClick={handleExport}
//             className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
//           >
//             <Download size={18} />
//             Export
//           </button>
//         </div>
//       </div>

//       {/* Stats */}
//       <div className="grid grid-cols-3 gap-4">
//         <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
//           <p className="text-xs text-gray-500">Total Patients</p>
//           <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
//         </div>
//         <div className="bg-white rounded-xl p-4 shadow-sm border border-green-100">
//           <p className="text-xs text-green-600">Active Patients</p>
//           <p className="text-2xl font-bold text-green-600">{stats.active}</p>
//         </div>
//         <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-100">
//           <p className="text-xs text-blue-600">New (This Week)</p>
//           <p className="text-2xl font-bold text-blue-600">{stats.new}</p>
//         </div>
//       </div>

//       {/* Search */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
//         <div className="relative">
//           <Search
//             className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
//             size={18}
//           />
//           <input
//             type="text"
//             placeholder="Search patients by name, email, or phone..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//           />
//         </div>
//       </div>

//       {/* Patient Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {paginatedPatients.length > 0 ? (
//           paginatedPatients.map((patient, index) => {
//             // Safe data access for each patient
//             const fullName =
//               patient.user?.fullName || patient.fullName || "Unknown";
//             const email = patient.user?.email || patient.email || "N/A";
//             const phone =
//               patient.user?.phoneNumber || patient.phoneNumber || "N/A";
//             const avatar = fullName.charAt(0) || "P";

//             // Handle address properly
//             const address = patient.address
//               ? typeof patient.address === "object"
//                 ? [
//                     patient.address.street,
//                     patient.address.city,
//                     patient.address.state,
//                     patient.address.country,
//                   ]
//                     .filter(Boolean)
//                     .join(", ")
//                 : patient.address
//               : null;

//             return (
//               <motion.div
//                 key={patient._id || index}
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: index * 0.05 }}
//                 className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
//               >
//                 <div className="flex items-start justify-between">
//                   <div className="flex items-center gap-3">
//                     <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
//                       {avatar}
//                     </div>
//                     <div>
//                       <h4 className="font-semibold text-gray-900">
//                         {fullName}
//                       </h4>
//                       <p className="text-xs text-gray-500">
//                         {patient.gender || "Unknown"} • {patient.age || "N/A"}{" "}
//                         yrs
//                       </p>
//                     </div>
//                   </div>
//                   <span
//                     className={`px-2 py-0.5 text-xs rounded-full ${
//                       patient.status === "active" || patient.isActive !== false
//                         ? "bg-green-100 text-green-700"
//                         : "bg-gray-100 text-gray-700"
//                     }`}
//                   >
//                     {patient.status || "Active"}
//                   </span>
//                 </div>

//                 <div className="mt-4 space-y-2">
//                   <div className="flex items-center gap-2 text-sm text-gray-600">
//                     <Mail size={14} />
//                     <span>{email}</span>
//                   </div>
//                   <div className="flex items-center gap-2 text-sm text-gray-600">
//                     <Phone size={14} />
//                     <span>{phone}</span>
//                   </div>
//                   {address && (
//                     <div className="flex items-center gap-2 text-sm text-gray-600">
//                       <MapPin size={14} />
//                       <span>{address}</span>
//                     </div>
//                   )}
//                   {patient.bloodGroup && (
//                     <div className="flex items-center gap-2 text-sm text-gray-600">
//                       <User size={14} />
//                       <span>Blood Group: {patient.bloodGroup}</span>
//                     </div>
//                   )}
//                 </div>

//                 <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
//                   <span className="text-xs text-gray-400 flex items-center gap-1">
//                     <Clock size={12} />
//                     Joined{" "}
//                     {patient.createdAt
//                       ? new Date(patient.createdAt).toLocaleDateString(
//                           "en-GB",
//                           {
//                             day: "2-digit",
//                             month: "short",
//                             year: "numeric",
//                           },
//                         )
//                       : "N/A"}
//                   </span>
//                   <div className="flex gap-2">
//                     <button
//                       onClick={() => setSelectedPatient(patient)}
//                       className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
//                       title="View"
//                     >
//                       <Eye size={16} className="text-blue-600" />
//                     </button>
//                     <button
//                       className="p-1.5 hover:bg-green-50 rounded-lg transition-colors"
//                       title="Edit"
//                     >
//                       <Edit size={16} className="text-green-600" />
//                     </button>
//                     <button
//                       onClick={() => handleDelete(patient._id)}
//                       className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
//                       title="Delete"
//                     >
//                       <Trash2 size={16} className="text-red-600" />
//                     </button>
//                   </div>
//                 </div>
//               </motion.div>
//             );
//           })
//         ) : (
//           <div className="col-span-3 py-12 text-center text-gray-500">
//             <Users size={48} className="mx-auto mb-3 text-gray-300" />
//             <p>No patients found</p>
//           </div>
//         )}
//       </div>

//       {/* Pagination */}
//       {filteredPatients.length > 0 && (
//         <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">

//           <div className="flex gap-2">
//             <button
//               onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
//               disabled={currentPage === 1}
//               className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               <ChevronLeft size={16} />
//             </button>
//             <button
//               onClick={() =>
//                 setCurrentPage((prev) => Math.min(prev + 1, totalPages))
//               }
//               disabled={currentPage === totalPages}
//               className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               <ChevronRight size={16} />
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Patient Details Modal */}
//       {selectedPatient && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//           <motion.div
//             initial={{ scale: 0.9, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
//           >
//             <div className="p-6 border-b border-gray-200 flex items-center justify-between">
//               <h3 className="text-lg font-semibold text-gray-900">
//                 Patient Details
//               </h3>
//               <button
//                 onClick={() => setSelectedPatient(null)}
//                 className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
//               >
//                 <XCircle size={20} className="text-gray-500" />
//               </button>
//             </div>
//             <div className="p-6 space-y-4">
//               <div className="flex items-center gap-4">
//                 {/* Fixed avatar to show first letter only */}
//                 <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
//                   {(
//                     selectedPatient.user?.fullName ||
//                     selectedPatient.fullName ||
//                     "P"
//                   ).charAt(0)}
//                 </div>
//                 <div>
//                   {/* Fixed data access in modal */}
//                   <h4 className="text-xl font-semibold text-gray-900">
//                     {selectedPatient.user?.fullName ||
//                       selectedPatient.fullName ||
//                       "Unknown"}
//                   </h4>
//                   <p className="text-sm text-gray-500">
//                     {selectedPatient.gender || "Unknown"} •{" "}
//                     {selectedPatient.age || "N/A"} yrs
//                   </p>
//                   <span
//                     className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full ${
//                       selectedPatient.status === "active" ||
//                       selectedPatient.isActive !== false
//                         ? "bg-green-100 text-green-700"
//                         : "bg-gray-100 text-gray-700"
//                     }`}
//                   >
//                     {selectedPatient.status || "Active"}
//                   </span>
//                 </div>
//               </div>
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <p className="text-xs text-gray-500">Email</p>
//                   <p className="font-medium text-gray-900">
//                     {selectedPatient.user?.email ||
//                       selectedPatient.email ||
//                       "N/A"}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-xs text-gray-500">Phone</p>
//                   <p className="font-medium text-gray-900">
//                     {selectedPatient.user?.phoneNumber ||
//                       selectedPatient.phoneNumber ||
//                       "N/A"}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-xs text-gray-500">Blood Group</p>
//                   <p className="font-medium text-gray-900">
//                     {selectedPatient.bloodGroup || "N/A"}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-xs text-gray-500">Registered</p>
//                   <p className="font-medium text-gray-900">
//                     {selectedPatient.createdAt
//                       ? new Date(selectedPatient.createdAt).toLocaleDateString()
//                       : "N/A"}
//                   </p>
//                 </div>
//               </div>
//               {selectedPatient.address && (
//                 <div>
//                   <p className="text-xs text-gray-500">Address</p>
//                   <p className="text-sm text-gray-700">
//                     {typeof selectedPatient.address === "object"
//                       ? [
//                           selectedPatient.address.street,
//                           selectedPatient.address.city,
//                           selectedPatient.address.state,
//                           selectedPatient.address.country,
//                         ]
//                           .filter(Boolean)
//                           .join(", ")
//                       : selectedPatient.address}
//                   </p>
//                 </div>
//               )}
//             </div>
//             <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
//               <button
//                 onClick={() => setSelectedPatient(null)}
//                 className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
//               >
//                 Close
//               </button>
//               <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
//                 Edit Patient
//               </button>
//             </div>
//           </motion.div>
//         </div>
//       )}
//     </motion.div>
//   );
// };

// export default Patients;



// src/pages/admin/Patients.jsx
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Search,
  UserPlus,
  Eye,
  Edit,
  Trash2,
  Phone,
  Mail,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  User,
  MapPin,
  Clock,
  XCircle,
  Heart,
  Activity,
  UserCheck,
  Users as UsersIcon,
} from "lucide-react";
import { adminAPI } from "../../services/api";
import toast from "react-hot-toast";

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showSideDrawer, setShowSideDrawer] = useState(false);
  const itemsPerPage = 6;
  const searchInputRef = useRef(null);

  useEffect(() => {
    fetchPatients();
    // Focus search input on load
    if (searchInputRef.current) {
      setTimeout(() => searchInputRef.current.focus(), 100);
    }
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getPatients();

      console.log("Patients Response:", response.data);
      console.log("Patients Data Array:", response.data.data);

      if (response.data.success) {
        setPatients(response.data.data);
        console.log("Patients set successfully:", response.data.data.length);
      } else {
        console.log("Response success is false:", response.data);
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
      toast.error("Failed to load patients");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this patient?")) {
      try {
        const response = await adminAPI.deletePatient(id);
        if (response.data.success) {
          toast.success("Patient deleted successfully");
          fetchPatients();
        }
      } catch (error) {
        console.error("Error deleting patient:", error);
        toast.error("Failed to delete patient");
      }
    }
  };

  const handleExport = () => {
    try {
      if (patients.length === 0) {
        toast.error("No patients to export");
        return;
      }

      const headers = [
        "Name",
        "Email",
        "Phone",
        "Gender",
        "Blood Group",
        "Status",
        "Registration Date",
      ];

      const rows = patients.map((patient) => {
        const fullName =
          patient.user?.fullName || patient.fullName || "Unknown";
        const email = patient.user?.email || patient.email || "N/A";
        const phone = patient.user?.phoneNumber || patient.phoneNumber || "";
        const gender = patient.gender || "Unknown";
        const bloodGroup = patient.bloodGroup || "N/A";
        const status =
          patient.status === "active" || patient.isActive !== false
            ? "Active"
            : "Inactive";
        const registeredDate = patient.createdAt
          ? new Date(patient.createdAt).toLocaleDateString("en-GB")
          : "N/A";

        return [
          fullName,
          email,
          `="${phone}"`,
          gender,
          bloodGroup,
          status,
          registeredDate,
        ];
      });

      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.join(",")),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `patients_${new Date().toISOString().split("T")[0]}.csv`,
      );
      link.style.visibility = "hidden";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);

      toast.success(`Successfully exported ${patients.length} patients`);
    } catch (error) {
      console.error("Error exporting patients:", error);
      toast.error("Failed to export patients");
    }
  };

  const filteredPatients = patients.filter((patient) => {
    const fullName = patient.user?.fullName || patient.fullName || "";
    const email = patient.user?.email || patient.email || "";
    const phone = patient.user?.phoneNumber || patient.phoneNumber || "";
    const searchLower = searchTerm.toLowerCase();

    return (
      fullName.toLowerCase().includes(searchLower) ||
      email.toLowerCase().includes(searchLower) ||
      phone.includes(searchTerm)
    );
  });

  console.log("Patients:", patients.length);
  console.log("Filtered Patients:", filteredPatients.length);
  console.log("Search Term:", searchTerm);

  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPatients = filteredPatients.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const todayRegistrations = patients.filter((p) => {
    const today = new Date();
    const created = new Date(p.createdAt);

    return (
      created.getDate() === today.getDate() &&
      created.getMonth() === today.getMonth() &&
      created.getFullYear() === today.getFullYear()
    );
  }).length;

  const stats = {
    total: patients.length,
    active: patients.filter(
      (p) => p.status === "active" || p.isActive !== false,
    ).length,
    new: patients.filter((p) => {
      try {
        const days =
          (new Date() - new Date(p.createdAt)) / (1000 * 60 * 60 * 24);
        return days < 7;
      } catch {
        return false;
      }
    }).length,
  };

  // Skeleton loading cards
  const SkeletonCard = () => (
    <div className="bg-white rounded-2xl p-6 shadow-sm animate-pulse border border-gray-100/50">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-3 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
        <div className="h-6 bg-gray-200 rounded-full w-16"></div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
        <div className="h-3 bg-gray-200 rounded w-20"></div>
        <div className="flex gap-2">
          <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
          <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
          <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-64 bg-gray-200 rounded mt-2 animate-pulse"></div>
            </div>
            <div className="flex gap-3">
              <div className="h-10 w-24 bg-gray-200 rounded-xl animate-pulse"></div>
              <div className="h-10 w-24 bg-gray-200 rounded-xl animate-pulse"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 shadow-sm animate-pulse"
              >
                <div className="flex items-center justify-between">
                  <div className="h-12 w-12 bg-gray-200 rounded-xl"></div>
                  <div className="h-8 w-16 bg-gray-200 rounded"></div>
                </div>
                <div className="h-4 w-24 bg-gray-200 rounded mt-4"></div>
              </div>
            ))}
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm animate-pulse">
            <div className="h-12 bg-gray-200 rounded-xl"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative mb-8"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent tracking-tight">
                Patients Management
              </h1>
              <p className="text-slate-500 mt-1.5 text-sm font-medium">
                Manage all patient records and medical history
              </p>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleExport}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow"
              >
                <Download size={18} className="text-slate-500" />
                Export
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8"
        >
          {[
            {
              icon: UsersIcon,
              label: "Total Patients",
              value: stats.total,
              gradient: "from-blue-500 to-blue-600",
              bgGradient: "from-blue-50 to-blue-100/50",
              iconBg: "bg-blue-100",
              iconColor: "text-blue-600",
            },
            {
              icon: UserCheck,
              label: "Active Patients",
              value: stats.active,
              gradient: "from-emerald-500 to-emerald-600",
              bgGradient: "from-emerald-50 to-emerald-100/50",
              iconBg: "bg-emerald-100",
              iconColor: "text-emerald-600",
            },
            {
              icon: Activity,
              label: "New This Week",
              value: stats.new,
              gradient: "from-purple-500 to-purple-600",
              bgGradient: "from-purple-50 to-purple-100/50",
              iconBg: "bg-purple-100",
              iconColor: "text-purple-600",
            },
            {
              icon: Heart,
              label: "Today's Registrations",
              value: stats.today,
              gradient: "from-rose-500 to-rose-600",
              bgGradient: "from-rose-50 to-rose-100/50",
              iconBg: "bg-rose-100",
              iconColor: "text-rose-600",
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 * (index + 1) }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className={`bg-gradient-to-br ${stat.bgGradient} rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-white/50 backdrop-blur-sm`}
            >
              <div className="flex items-start justify-between">
                <div className={`${stat.iconBg} p-2.5 sm:p-3 rounded-xl`}>
                  <stat.icon
                    className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.iconColor}`}
                  />
                </div>
                <motion.span
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
                  className={`text-2xl sm:text-3xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}
                >
                  {stat.value}
                </motion.span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-3">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Search Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow duration-300 mb-8 border border-white/50"
        >
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search patients by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm placeholder:text-slate-400"
              aria-label="Search patients"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  if (searchInputRef.current) {
                    searchInputRef.current.focus();
                  }
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="Clear search"
              >
                <XCircle size={18} />
              </button>
            )}
          </div>
        </motion.div>

        {/* Patient Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedPatients.length > 0 ? (
            paginatedPatients.map((patient, index) => {
              const fullName =
                patient.user?.fullName || patient.fullName || "Unknown";
              const email = patient.user?.email || patient.email || "N/A";
              const phone =
                patient.user?.phoneNumber || patient.phoneNumber || "N/A";
              const avatar = fullName.charAt(0) || "P";

              const address = patient.address
                ? typeof patient.address === "object"
                  ? [
                      patient.address.street,
                      patient.address.city,
                      patient.address.state,
                      patient.address.country,
                    ]
                      .filter(Boolean)
                      .join(", ")
                  : patient.address
                : null;

              const isActive =
                patient.status === "active" || patient.isActive !== false;

              return (
                <motion.div
                  key={patient._id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-white/50 group"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md shadow-blue-200/50 flex-shrink-0">
                        <span className="text-white font-bold text-lg">
                          {avatar}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-slate-900 truncate">
                          {fullName}
                        </h4>
                        <p className="text-xs text-slate-500">
                          {patient.gender || "Unknown"} • {patient.age || "N/A"}{" "}
                          yrs
                        </p>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border flex-shrink-0 ml-2 ${
                        isActive
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-red-50 text-red-700 border-red-200"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                          isActive ? "bg-emerald-500" : "bg-red-500"
                        }`}
                      ></span>
                      {isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Mail
                        size={14}
                        className="text-slate-400 flex-shrink-0"
                      />
                      <span className="truncate">{email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Phone
                        size={14}
                        className="text-slate-400 flex-shrink-0"
                      />
                      <span>{phone}</span>
                    </div>
                    {address && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <MapPin
                          size={14}
                          className="text-slate-400 flex-shrink-0"
                        />
                        <span className="truncate">{address}</span>
                      </div>
                    )}
                    {patient.bloodGroup && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Heart
                          size={14}
                          className="text-slate-400 flex-shrink-0"
                        />
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                          {patient.bloodGroup}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock size={12} />
                      Joined{" "}
                      {patient.createdAt
                        ? new Date(patient.createdAt).toLocaleDateString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            },
                          )
                        : "N/A"}
                    </span>
                    <div className="flex gap-1.5">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          setSelectedPatient(patient);
                          setShowSideDrawer(true);
                        }}
                        className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                        title="View Patient"
                        aria-label={`View ${fullName}`}
                      >
                        <Eye size={15} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-lg transition-colors"
                        title="Edit Patient"
                        aria-label={`Edit ${fullName}`}
                      >
                        <Edit size={15} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDelete(patient._id)}
                        className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                        title="Delete Patient"
                        aria-label={`Delete ${fullName}`}
                      >
                        <Trash2 size={15} />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            /* Empty State */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-1 md:col-span-2 lg:col-span-3 py-16 text-center"
            >
              <div className="text-7xl mb-6">👨‍⚕️</div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                No Patients Found
              </h3>
              <p className="text-slate-500 mb-6">
                Add your first patient to begin managing records.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-2xl flex items-center gap-2 mx-auto shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-300 font-medium"
              >
                <UserPlus size={18} />
                Add Your First Patient
              </motion.button>
            </motion.div>
          )}
        </div>

        {/* Pagination */}
        {filteredPatients.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex justify-end mt-8 pt-4 border-t border-slate-100"
          >
            <div className="flex gap-2 order-1 sm:order-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Previous page"
              >
                <ChevronLeft size={16} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Next page"
              >
                <ChevronRight size={16} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Patient Details Side Drawer */}
      <AnimatePresence>
        {showSideDrawer && selectedPatient && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
              onClick={() => setShowSideDrawer(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30 }}
              className="fixed right-0 top-0 h-full w-full sm:w-[400px] lg:w-[480px] bg-white shadow-2xl z-50 overflow-y-auto"
              role="dialog"
              aria-labelledby="drawer-title"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                  <h2
                    id="drawer-title"
                    className="text-2xl font-bold text-slate-900"
                  >
                    Patient Details
                  </h2>
                  <motion.button
                    whileHover={{ rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowSideDrawer(false)}
                    className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-100 rounded-xl"
                    aria-label="Close drawer"
                  >
                    <XCircle size={20} />
                  </motion.button>
                </div>

                {/* Avatar and Basic Info */}
                <div className="flex items-center gap-4 mb-6 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-200/50 flex-shrink-0">
                    <span className="text-white text-2xl font-bold">
                      {(
                        selectedPatient.user?.fullName ||
                        selectedPatient.fullName ||
                        "P"
                      ).charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      {selectedPatient.user?.fullName ||
                        selectedPatient.fullName ||
                        "Unknown"}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {selectedPatient.gender || "Unknown"} •{" "}
                      {selectedPatient.age || "N/A"} yrs
                    </p>
                    <span
                      className={`inline-flex items-center mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        selectedPatient.status === "active" ||
                        selectedPatient.isActive !== false
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-red-50 text-red-700 border-red-200"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                          selectedPatient.status === "active" ||
                          selectedPatient.isActive !== false
                            ? "bg-emerald-500"
                            : "bg-red-500"
                        }`}
                      ></span>
                      {selectedPatient.status === "active" ||
                      selectedPatient.isActive !== false
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-xs text-slate-500 font-medium">
                        Email
                      </p>
                      <p className="text-sm text-slate-900 font-medium truncate">
                        <Mail
                          className="inline mr-1.5 text-slate-400"
                          size={12}
                        />
                        {selectedPatient.user?.email ||
                          selectedPatient.email ||
                          "N/A"}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-xs text-slate-500 font-medium">
                        Phone
                      </p>
                      <p className="text-sm text-slate-900 font-medium">
                        <Phone
                          className="inline mr-1.5 text-slate-400"
                          size={12}
                        />
                        {selectedPatient.user?.phoneNumber ||
                          selectedPatient.phoneNumber ||
                          "N/A"}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-xs text-slate-500 font-medium">
                        Blood Group
                      </p>
                      <p className="text-sm text-slate-900 font-medium">
                        <Heart
                          className="inline mr-1.5 text-slate-400"
                          size={12}
                        />
                        {selectedPatient.bloodGroup || "N/A"}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-xs text-slate-500 font-medium">
                        Registered
                      </p>
                      <p className="text-sm text-slate-900 font-medium">
                        <Calendar
                          className="inline mr-1.5 text-slate-400"
                          size={12}
                        />
                        {selectedPatient.createdAt
                          ? new Date(
                              selectedPatient.createdAt,
                            ).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>

                  {selectedPatient.address && (
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-xs text-slate-500 font-medium">
                        Address
                      </p>
                      <p className="text-sm text-slate-900">
                        <MapPin
                          className="inline mr-1.5 text-slate-400"
                          size={12}
                        />
                        {typeof selectedPatient.address === "object"
                          ? [
                              selectedPatient.address.street,
                              selectedPatient.address.city,
                              selectedPatient.address.state,
                              selectedPatient.address.country,
                            ]
                              .filter(Boolean)
                              .join(", ")
                          : selectedPatient.address}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-slate-100">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-xl transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <Edit size={14} />
                      Edit Patient
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setShowSideDrawer(false);
                        handleDelete(selectedPatient._id);
                      }}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <Trash2 size={14} />
                      Delete
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Patients;
