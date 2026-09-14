import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  UserPlus,
  Eye,
  Edit,
  Trash2,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  Download,
  Clock,
  XCircle,
  Heart,
  Activity,
  UserCheck,
  Users as UsersIcon,
  X,
  Key
} from "lucide-react";
import { adminAPI } from "../../services/api";
import api from "../../services/api";
import toast from "react-hot-toast";

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showSideDrawer, setShowSideDrawer] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Reset Password Modal State
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetPatient, setResetPatient] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetting, setResetting] = useState(false);

  const itemsPerPage = 6;
  const searchInputRef = useRef(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    dateOfBirth: "",
    age: "",
    gender: "Male",
    bloodGroup: "A+",
    address: ""
  });

  // Fetch patients list and set autofocus on search input
  useEffect(() => {
    fetchPatients();
    if (searchInputRef.current) {
      setTimeout(() => searchInputRef.current.focus(), 100);
    }
  }, []);

  // Retrieve patient list from admin API endpoint
  const fetchPatients = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getPatients();
      if (response.data.success) {
        setPatients(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
      toast.error("Failed to load patients");
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes and auto-calculate age from DOB
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      
      if (name === "dateOfBirth" && value) {
        const birthDate = new Date(value);
        const today = new Date();
        let calculatedAge = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          calculatedAge--;
        }
        updated.age = calculatedAge >= 0 ? calculatedAge : "";
      }
      
      return updated;
    });
  };

  const resetForm = () => {
    setFormData({
      fullName: "",
      email: "",
      phoneNumber: "",
      password: "",
      dateOfBirth: "",
      age: "",
      gender: "Male",
      bloodGroup: "A+",
      address: ""
    });
    setIsEditing(false);
    setEditingId(null);
  };

  const handleOpenEdit = (patient) => {
    setIsEditing(true);
    setEditingId(patient._id);
    
    let formattedDob = "";
    if (patient.dateOfBirth) {
      formattedDob = new Date(patient.dateOfBirth).toISOString().split("T")[0];
    }

    setFormData({
      fullName: patient.user?.fullName || patient.fullName || "",
      email: patient.user?.email || patient.email || "",
      phoneNumber: patient.user?.phoneNumber || patient.phoneNumber || "",
      password: "",
      dateOfBirth: formattedDob,
      age: patient.age || "",
      gender: patient.gender || "Male",
      bloodGroup: patient.bloodGroup || "A+",
      address: typeof patient.address === "string" ? patient.address : patient.address?.street || ""
    });
    setShowSideDrawer(false);
    setShowModal(true);
  };

  // Submit patient creation or edit payload
  const handlePatientSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      if (isEditing) {
        response = await adminAPI.updatePatient(editingId, formData);
      } else {
        response = await adminAPI.createPatient(formData);
      }

      if (response.data.success || response.status === 201 || response.status === 200) {
        toast.success(isEditing ? "Patient updated successfully" : "Patient registered successfully");
        setShowModal(false);
        resetForm();
        fetchPatients();
      }
    } catch (error) {
      console.error("Error submitting patient form:", error);
      toast.error(error.response?.data?.message || "Operation failed. Please check form data.");
    }
  };

  // Remove patient record after confirmation
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
        toast.error(error.response?.data?.message || "Failed to delete patient");
      }
    }
  };

  // Trigger admin password reset for selected patient
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      return toast.error("Password must be at least 6 characters long");
    }

    setResetting(true);
    try {
      const targetUserId = resetPatient?.user?._id || resetPatient?._id;
      const res = await api.put(`/admin/users/${targetUserId}/reset-password`, {
        newPassword,
      });

      if (res.data?.success || res.status === 200) {
        toast.success(`Password reset successfully for ${resetPatient.user?.fullName || resetPatient.fullName}`);
        setShowResetModal(false);
        setNewPassword("");
        setResetPatient(null);
      }
    } catch (error) {
      console.error("Reset patient password error:", error);
      toast.error(error.response?.data?.message || "Failed to reset patient password");
    } finally {
      setResetting(false);
    }
  };

  // Export patient list as a downloadable CSV file
  const handleExport = () => {
    try {
      if (patients.length === 0) {
        toast.error("No patients to export");
        return;
      }

      const headers = ["Name", "Email", "Phone", "Gender", "Blood Group", "Status", "Registration Date"];
      const rows = patients.map((patient) => {
        const fullName = patient.user?.fullName || patient.fullName || "Unknown";
        const email = patient.user?.email || patient.email || "N/A";
        const phone = patient.user?.phoneNumber || patient.phoneNumber || "";
        const gender = patient.gender || "Unknown";
        const bloodGroup = patient.bloodGroup || "N/A";
        const status = patient.status === "active" || patient.isActive !== false ? "Active" : "Inactive";
        const registeredDate = patient.createdAt
          ? new Date(patient.createdAt).toLocaleDateString("en-GB")
          : "N/A";

        return [fullName, email, `="${phone}"`, gender, bloodGroup, status, registeredDate];
      });

      const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      link.setAttribute("href", url);
      link.setAttribute("download", `patients_${new Date().toISOString().split("T")[0]}.csv`);
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

  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPatients = filteredPatients.slice(startIndex, startIndex + itemsPerPage);

  const stats = {
    total: patients.length,
    active: patients.filter((p) => p.status === "active" || p.isActive !== false).length,
    new: patients.filter((p) => {
      try {
        return (new Date() - new Date(p.createdAt)) / (1000 * 60 * 60 * 24) < 7;
      } catch {
        return false;
      }
    }).length,
    today: patients.filter((p) => {
      const today = new Date();
      const created = new Date(p.createdAt);
      return (
        created.getDate() === today.getDate() &&
        created.getMonth() === today.getMonth() &&
        created.getFullYear() === today.getFullYear()
      );
    }).length,
  };

  if (loading) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-pulse">
        <div className="h-36 bg-slate-200 rounded-3xl"></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-200 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-50/60 pb-12 font-sans">
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 space-y-6">
        
        {/* Patients Management Hero Banner */}
        <div className="relative bg-emerald-700 rounded-3xl p-6 sm:p-8 text-white shadow-md overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Patients Management</h1>
              <p className="text-emerald-100 mt-1 text-xs sm:text-sm font-medium">
                Manage all patient records, medical history, and registrations.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleExport}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl backdrop-blur-sm transition-all text-xs sm:text-sm font-semibold border border-white/20 cursor-pointer"
              >
                <Download size={16} /> Export
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl transition-all text-xs sm:text-sm font-bold shadow-md cursor-pointer"
              >
                <UserPlus size={16} /> Add Patient
              </motion.button>
            </div>
          </div>
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Patient Statistics Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[
            { icon: UsersIcon, label: "Total Patients", value: stats.total, color: "text-blue-600", bg: "bg-blue-50" },
            { icon: UserCheck, label: "Active Patients", value: stats.active, color: "text-emerald-600", bg: "bg-emerald-50" },
            { icon: Activity, label: "New This Week", value: stats.new, color: "text-purple-600", bg: "bg-purple-50" },
            { icon: Heart, label: "Today Registrations", value: stats.today, color: "text-rose-600", bg: "bg-rose-50" },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              whileHover={{ y: -4 }}
              className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.bg} p-3 rounded-xl ${stat.color}`}>
                <stat.icon size={20} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Patient Search Input Bar */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search patients by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm placeholder:text-slate-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <XCircle size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Grid of Patient Profile Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedPatients.length > 0 ? (
            paginatedPatients.map((patient, index) => {
              const fullName = patient.user?.fullName || patient.fullName || "Unknown";
              const email = patient.user?.email || patient.email || "N/A";
              const phone = patient.user?.phoneNumber || patient.phoneNumber || "N/A";
              const isActive = patient.status === "active" || patient.isActive !== false;

              return (
                <motion.div
                  key={patient._id || index}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md border border-slate-100 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-full bg-emerald-600 text-white font-bold text-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                          {fullName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-slate-900 truncate">{fullName}</h4>
                          <p className="text-xs text-slate-500">
                            {patient.gender || "Unknown"} • {patient.age || "N/A"} yrs
                          </p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                        {isActive ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs text-slate-600">
                      <div className="flex items-center gap-2"><Mail size={14} className="text-slate-400" /><span className="truncate">{email}</span></div>
                      <div className="flex items-center gap-2"><Phone size={14} className="text-slate-400" /><span>{phone}</span></div>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock size={12} /> Joined {patient.createdAt ? new Date(patient.createdAt).toLocaleDateString("en-GB") : "N/A"}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          setSelectedPatient(patient);
                          setShowSideDrawer(true);
                        }}
                        className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-colors cursor-pointer"
                        title="View Patient Details"
                      >
                        <Eye size={15} />
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleOpenEdit(patient)}
                        className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors cursor-pointer"
                        title="Edit Patient"
                      >
                        <Edit size={15} />
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          setResetPatient(patient);
                          setShowResetModal(true);
                        }}
                        className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-lg transition-colors cursor-pointer"
                        title="Reset Password"
                      >
                        <Key size={15} />
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDelete(patient._id)}
                        className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors cursor-pointer"
                        title="Delete Patient"
                      >
                        <Trash2 size={15} />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="col-span-full py-16 text-center">
              <p className="text-slate-500 font-medium">No Patients Found</p>
            </div>
          )}
        </div>

        {/* Pagination Navigation */}
        {filteredPatients.length > 0 && (
          <div className="flex justify-end pt-4 border-t border-slate-100 gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Add / Edit Patient Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-3">
                <h2 className="text-xl font-bold text-slate-900">
                  {isEditing ? "Edit Patient Details" : "Add New Patient"}
                </h2>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handlePatientSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. Rahul Sharma"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="patient@example.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-emerald-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      required
                      placeholder="9876543210"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-emerald-500 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Date of Birth *</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-emerald-500 text-sm cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Age</label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      readOnly
                      placeholder="Auto-calculated"
                      className="w-full bg-slate-100 border border-slate-200 rounded-xl py-2.5 px-4 text-slate-500 text-sm cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Gender *</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-emerald-500 text-sm cursor-pointer"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Blood Group *</label>
                    <select
                      name="bloodGroup"
                      value={formData.bloodGroup}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-emerald-500 text-sm cursor-pointer"
                    >
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                </div>

                {!isEditing && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Password *</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required={!isEditing}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-emerald-500 text-sm"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Address</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows="2"
                    placeholder="City, State"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-emerald-500 text-sm resize-none"
                  ></textarea>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-md cursor-pointer"
                  >
                    {isEditing ? "Update Patient" : "Save Patient"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Patient Profile Drawer */}
      <AnimatePresence>
        {showSideDrawer && selectedPatient && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
              onClick={() => setShowSideDrawer(false)}
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30 }}
              className="fixed right-0 top-0 h-full w-full sm:w-[400px] lg:w-[480px] bg-white shadow-2xl z-50 overflow-y-auto"
            >
              <div className="p-6 space-y-6">
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                  <h2 className="text-xl font-bold text-slate-900">Patient Details</h2>
                  <button onClick={() => setShowSideDrawer(false)} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg cursor-pointer">
                    <X size={20} />
                  </button>
                </div>

                <div className="flex items-center gap-4 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                  <div className="h-16 w-16 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-bold text-2xl flex-shrink-0">
                    {(selectedPatient.user?.fullName || selectedPatient.fullName || "P").charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {selectedPatient.user?.fullName || selectedPatient.fullName || "Unknown"}
                    </h3>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">
                      {selectedPatient.gender || "Unknown"} • {selectedPatient.age || "N/A"} yrs
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Email</p>
                      <p className="text-xs font-semibold text-slate-800 truncate mt-0.5">
                        {selectedPatient.user?.email || selectedPatient.email || "N/A"}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Phone</p>
                      <p className="text-xs font-semibold text-slate-800 mt-0.5">
                        {selectedPatient.user?.phoneNumber || selectedPatient.phoneNumber || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Blood Group</p>
                      <p className="text-xs font-semibold text-slate-800 mt-0.5">{selectedPatient.bloodGroup || "N/A"}</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Gender</p>
                      <p className="text-xs font-semibold text-slate-800 mt-0.5">{selectedPatient.gender || "N/A"}</p>
                    </div>
                  </div>

                  {selectedPatient.address && (
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Address</p>
                      <p className="text-xs font-semibold text-slate-800 mt-0.5">
                        {typeof selectedPatient.address === "object"
                          ? [selectedPatient.address.street, selectedPatient.address.city, selectedPatient.address.state].filter(Boolean).join(", ")
                          : selectedPatient.address}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleOpenEdit(selectedPatient)}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Edit size={14} /> Edit Details
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowSideDrawer(false);
                      handleDelete(selectedPatient._id);
                    }}
                    className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-2.5 rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Trash2 size={14} /> Delete Patient
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Admin Reset Password Modal */}
      <AnimatePresence>
        {showResetModal && resetPatient && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowResetModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Key className="w-5 h-5 text-amber-500" /> Reset Patient Password
                </h3>
                <button onClick={() => setShowResetModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs text-slate-600">
                Resetting password for: <strong className="text-slate-800">{resetPatient.user?.fullName || resetPatient.fullName}</strong>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                    New Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min 6 characters)"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowResetModal(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resetting}
                    className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    {resetting ? "Resetting..." : "Update Password"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Patients;