import React, { useState, useEffect, useRef } from "react";
import { adminAPI, patientAPI } from "../../services/api";
import { useLocation } from "react-router-dom";
import { 
  FaEdit, 
  FaTrash, 
  FaPlus, 
  FaSearch, 
  FaTimes,
  FaEye,
  FaUserMd,
  FaHospital,
  FaCalendarAlt,
  FaStar,
  FaCheckCircle,
  FaRegClock,
  FaPhone,
  FaEnvelope,
  FaGraduationCap,
  FaMoneyBillWave,
  FaChevronLeft,
  FaChevronRight,
  FaUser
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const DoctorManagement = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSideDrawer, setShowSideDrawer] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctorToDelete, setDoctorToDelete] = useState(null);
  const [departments, setDepartments] = useState([]);
  const searchInputRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const location = useLocation();
const isPatient = location.pathname.startsWith("/patient");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    department: "",
    specialization: "",
    qualification: "",
    experience: "",
    consultationFee: "",
    password: "",
  });

  useEffect(() => {
    fetchDoctors();
    // Focus search input on load
    if (searchInputRef.current) {
      setTimeout(() => searchInputRef.current.focus(), 100);
    }
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = isPatient
  ? await patientAPI.getDoctors()
  : await adminAPI.getDoctors();

const doctorsData = isPatient
  ? response.data.doctors
  : response.data.data;

setDoctors(doctorsData || []);

const uniqueDepts = [
  ...new Set((doctorsData || []).map((d) => d.department)),
];

setDepartments(uniqueDepts);

console.log(response.data);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      toast.error("Failed to load doctors");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingDoctor) {
        await adminAPI.updateDoctor(editingDoctor._id, formData);
        toast.success("Doctor updated successfully");
      } else {
        console.log("========== FORM DATA ==========");
        console.log(formData);
        console.table(formData);
        await adminAPI.createDoctor(formData);
        toast.success("Doctor added successfully");
      }

      fetchDoctors();
      resetForm();
      setShowModal(false);
    } catch (err) {
      console.error("========== FULL ERROR ==========");
      console.log("Status:", err.response?.status);
      console.log("Response:", err.response?.data);
      console.table(err.response?.data?.errors);

      err.response?.data?.errors?.forEach((e) => {
        console.log("Field:", e.field);
        console.log("Message:", e.message);
      });

      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  const confirmDelete = (doctor) => {
    setDoctorToDelete(doctor);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!doctorToDelete) return;

    try {
      await adminAPI.deleteDoctor(doctorToDelete._id);
      setDoctors(doctors.filter((doc) => doc._id !== doctorToDelete._id));
      toast.success("Doctor deleted successfully");
      setShowDeleteModal(false);
      setDoctorToDelete(null);
    } catch (err) {
      console.error("Error deleting doctor:", err);
      toast.error("Failed to delete doctor");
    }
  };

  const handleEdit = (doctor) => {
    setEditingDoctor(doctor);
    setFormData({
      fullName: doctor.user?.fullName || "",
      email: doctor.user?.email || "",
      phoneNumber: doctor.user?.phoneNumber || "",
      password: "",
      department: doctor.department || "",
      specialization: doctor.specialization || "",
      qualification: doctor.qualification || "",
      experience: doctor.experience || "",
      consultationFee: doctor.consultationFee || "",
    });
    setShowModal(true);
  };

  const handleViewDoctor = (doctor) => {
    setSelectedDoctor(doctor);
    setShowSideDrawer(true);
  };

  const resetForm = () => {
    setEditingDoctor(null);
    setFormData({
      fullName: "",
      email: "",
      phoneNumber: "",
      department: "",
      specialization: "",
      qualification: "",
      experience: "",
      consultationFee: "",
      password: "",
    });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  // Filter doctors based on search and department
  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch =
      doctor.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.department?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter
      ? doctor.department === departmentFilter
      : true;
    return matchesSearch && matchesDepartment;
  });

  // Pagination
  const totalPages = Math.ceil(filteredDoctors.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDoctors = filteredDoctors.slice(startIndex, startIndex + itemsPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, departmentFilter]);

  // Statistics calculations
  const totalDoctors = doctors.length;
  const uniqueDepartments = new Set(doctors.map(d => d.department)).size;
  const availableDoctors = doctors.filter(d => d.isAvailable !== false).length;
  const avgExperience = doctors.length > 0 
    ? Math.round(doctors.reduce((acc, d) => acc + (d.experience || 0), 0) / doctors.length) 
    : 0;

  // Skeleton loading rows
  const SkeletonRow = () => (
    <div className="animate-pulse">
      <div className="flex items-center space-x-4 p-4 bg-white rounded-xl border border-gray-100">
        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
        </div>
        <div className="h-6 bg-gray-200 rounded-full w-20"></div>
        <div className="h-4 bg-gray-200 rounded w-24"></div>
        <div className="h-4 bg-gray-200 rounded w-16"></div>
        <div className="h-6 bg-gray-200 rounded-full w-16"></div>
        <div className="flex space-x-2">
          <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
          <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
          <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    </div>
  );

  // Get color for department badge
  const getDepartmentColor = (department) => {
    const colors = {
      'Cardiology': 'bg-red-100 text-red-800 border-red-200',
      'Neurology': 'bg-purple-100 text-purple-800 border-purple-200',
      'Orthopedics': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'Pediatrics': 'bg-pink-100 text-pink-800 border-pink-200',
      'Dermatology': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Ophthalmology': 'bg-cyan-100 text-cyan-800 border-cyan-200',
      'Psychiatry': 'bg-violet-100 text-violet-800 border-violet-200',
      'Oncology': 'bg-orange-100 text-orange-800 border-orange-200',
      'Gastroenterology': 'bg-teal-100 text-teal-800 border-teal-200',
      'Gynecology': 'bg-rose-100 text-rose-800 border-rose-200',
    };
    return colors[department] || 'bg-green-100 text-green-800 border-green-200';
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-80 bg-gray-200 rounded mt-2 animate-pulse"></div>
            </div>
            <div className="h-12 w-32 bg-gray-200 rounded-xl animate-pulse"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="h-12 w-12 bg-gray-200 rounded-xl"></div>
                  <div className="h-8 w-16 bg-gray-200 rounded"></div>
                </div>
                <div className="h-4 w-24 bg-gray-200 rounded mt-4"></div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="h-12 bg-gray-200 rounded-xl"></div>
              <div className="h-12 bg-gray-200 rounded-xl"></div>
              <div className="h-12 bg-gray-200 rounded-xl"></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 space-y-4">
              {[...Array(5)].map((_, i) => (
                <SkeletonRow key={i} />
              ))}
            </div>
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
                {isPatient ? "Find Doctors" : "Doctors Management"}
              </h1>
              <p className="text-slate-500 mt-1.5 text-sm font-medium">
                {isPatient
  ? "Find and book appointments with doctors"
  : "Manage doctors, departments, and consultations"}
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-2xl flex items-center gap-2.5 shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-300 font-medium"
            >
              <FaPlus className="text-sm" />
              <span>Add Doctor</span>
            </motion.button>
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
              icon: FaUserMd, 
              label: "Total Doctors", 
              value: totalDoctors,
              gradient: "from-blue-500 to-blue-600",
              bgGradient: "from-blue-50 to-blue-100/50",
              iconBg: "bg-blue-100",
              iconColor: "text-blue-600"
            },
            { 
              icon: FaHospital, 
              label: "Departments", 
              value: uniqueDepartments,
              gradient: "from-purple-500 to-purple-600",
              bgGradient: "from-purple-50 to-purple-100/50",
              iconBg: "bg-purple-100",
              iconColor: "text-purple-600"
            },
            { 
              icon: FaCheckCircle, 
              label: "Available", 
              value: availableDoctors,
              gradient: "from-emerald-500 to-emerald-600",
              bgGradient: "from-emerald-50 to-emerald-100/50",
              iconBg: "bg-emerald-100",
              iconColor: "text-emerald-600"
            },
            { 
              icon: FaStar, 
              label: "Avg Experience", 
              value: `${avgExperience} yrs`,
              gradient: "from-amber-500 to-amber-600",
              bgGradient: "from-amber-50 to-amber-100/50",
              iconBg: "bg-amber-100",
              iconColor: "text-amber-600"
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
                  <stat.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.iconColor}`} />
                </div>
                <motion.span 
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 + (index * 0.1) }}
                  className={`text-2xl sm:text-3xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}
                >
                  {stat.value}
                </motion.span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-3">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Search and Filter Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-300 mb-8 border border-white/50"
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-5 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaSearch className="text-slate-400 text-sm" />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search by name, specialization, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm placeholder:text-slate-400"
                aria-label="Search doctors"
              />
            </div>
            <div className="md:col-span-4">
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm text-slate-700 cursor-pointer"
                aria-label="Filter by department"
              >
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-3 flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setSearchTerm("");
                  setDepartmentFilter("");
                  if (searchInputRef.current) {
                    searchInputRef.current.focus();
                  }
                }}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 text-sm font-medium"
                aria-label="Clear all filters"
              >
                <FaTimes className="text-xs" />
                Clear Filters
              </motion.button>
              <div className="text-sm text-slate-500 flex items-center px-4 bg-slate-50 rounded-xl font-medium whitespace-nowrap">
                {filteredDoctors.length} results
              </div>
            </div>
          </div>
        </motion.div>

        {/* Doctors Table */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-white/50"
        >
          {filteredDoctors.length === 0 ? (
            /* Empty State */
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 px-4"
            >
              <div className="text-7xl mb-6">👨‍⚕️</div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">No Doctors Found</h3>
              <p className="text-slate-500 mb-6">Add your first doctor to begin managing your medical staff.</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-2xl flex items-center gap-2 mx-auto shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-300 font-medium"
              >
                <FaPlus />
                <span>Add Your First Doctor</span>
              </motion.button>
            </motion.div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200/60">
                  <thead className="bg-slate-50/50">
                    <tr>
                      <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Doctor
                      </th>
                      <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider hidden sm:table-cell">
                        Department
                      </th>
                      <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider hidden md:table-cell">
                        Specialization
                      </th>
                      <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider hidden lg:table-cell">
                        Fee
                      </th>
                      <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider hidden sm:table-cell">
                        Experience
                      </th>
                      <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider hidden md:table-cell">
                        Status
                      </th>
                      <th className="px-4 sm:px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-100">
                    {paginatedDoctors.map((doctor, index) => (
                      <motion.tr
                        key={doctor._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        whileHover={{ 
                          backgroundColor: "rgba(59, 130, 246, 0.04)",
                          transition: { duration: 0.2 }
                        }}
                        className="group hover:shadow-sm transition-all duration-200"
                      >
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 sm:h-12 sm:w-12">
                              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md shadow-blue-200/50">
                                <span className="text-white font-semibold text-sm sm:text-base">
                                  {doctor.user?.fullName?.charAt(0) || "D"}
                                </span>
                              </div>
                            </div>
                            <div className="ml-3 min-w-0">
                              <div className="text-sm font-semibold text-slate-900 truncate">
                                Dr. {doctor.user?.fullName || "Unknown"}
                              </div>
                              <div className="text-xs sm:text-sm text-slate-500 truncate">
                                {doctor.user?.email || "No email"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getDepartmentColor(doctor.department)}`}>
                            {doctor.department}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-slate-600 hidden md:table-cell">
                          {doctor.specialization}
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900 hidden lg:table-cell">
                          ₹{doctor.consultationFee}
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                            <FaCalendarAlt className="mr-1.5 text-xs" />
                            {doctor.experience} yrs
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                            doctor.isAvailable !== false 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                              doctor.isAvailable !== false ? 'bg-emerald-500' : 'bg-red-500'
                            }`}></span>
                            {doctor.isAvailable !== false ? 'Available' : 'Unavailable'}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1.5 sm:gap-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleViewDoctor(doctor)}
                              className="p-1.5 sm:p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-all duration-200 group-hover:shadow-sm"
                              title="View Doctor"
                              aria-label={`View Dr. ${doctor.user?.fullName}`}
                            >
                              <FaEye size={13} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleEdit(doctor)}
                              className="p-1.5 sm:p-2 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-lg transition-all duration-200 group-hover:shadow-sm"
                              title="Edit Doctor"
                              aria-label={`Edit Dr. ${doctor.user?.fullName}`}
                            >
                              <FaEdit size={13} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => confirmDelete(doctor)}
                              className="p-1.5 sm:p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-all duration-200 group-hover:shadow-sm"
                              title="Delete Doctor"
                              aria-label={`Delete Dr. ${doctor.user?.fullName}`}
                            >
                              <FaTrash size={13} />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards View (visible on smaller screens) */}
              <div className="sm:hidden divide-y divide-slate-100">
                {paginatedDoctors.map((doctor) => (
                  <motion.div
                    key={`mobile-${doctor._id}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 hover:bg-blue-50/30 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md shadow-blue-200/50">
                          <span className="text-white font-semibold text-sm">
                            {doctor.user?.fullName?.charAt(0) || "D"}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-900">
                            Dr. {doctor.user?.fullName || "Unknown"}
                          </div>
                          <div className="text-xs text-slate-500">
                            {doctor.specialization}
                          </div>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                        doctor.isAvailable !== false 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1 ${
                          doctor.isAvailable !== false ? 'bg-emerald-500' : 'bg-red-500'
                        }`}></span>
                        {doctor.isAvailable !== false ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getDepartmentColor(doctor.department)}`}>
                        {doctor.department}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                        <FaCalendarAlt className="mr-1 text-xs" />
                        {doctor.experience} yrs
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-50 text-slate-700 border border-slate-200">
                        ₹{doctor.consultationFee}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-end gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleViewDoctor(doctor)}
                        className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                        title="View"
                      >
                        <FaEye size={12} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleEdit(doctor)}
                        className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <FaEdit size={12} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => confirmDelete(doctor)}
                        className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <FaTrash size={12} />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-6 py-4 border-t border-slate-100">
                  <p className="text-sm text-slate-500">
                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredDoctors.length)} of {filteredDoctors.length} doctors
                  </p>
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Previous page"
                    >
                      <FaChevronLeft size={14} />
                    </motion.button>
                    <div className="flex items-center gap-1.5">
                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                            currentPage === i + 1
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                          aria-label={`Page ${i + 1}`}
                          aria-current={currentPage === i + 1 ? 'page' : undefined}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Next page"
                    >
                      <FaChevronRight size={14} />
                    </motion.button>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25 }}
              className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-labelledby="modal-title"
            >
              <div className="p-6 sm:p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 id="modal-title" className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    {editingDoctor ? "Edit Doctor" : "Add New Doctor"}
                  </h2>
                  <motion.button
                    whileHover={{ rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleCloseModal}
                    className="text-slate-400 hover:text-slate-600 transition-colors duration-200 p-2 hover:bg-slate-100 rounded-xl"
                    aria-label="Close modal"
                  >
                    <FaTimes size={20} />
                  </motion.button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        aria-required="true"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        aria-required="true"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        aria-required="true"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Password {!editingDoctor && "*"}
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required={!editingDoctor}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        aria-required={!editingDoctor}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Department *
                      </label>
                      <input
                        type="text"
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        aria-required="true"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Specialization *
                      </label>
                      <input
                        type="text"
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        aria-required="true"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Qualification *
                      </label>
                      <input
                        type="text"
                        name="qualification"
                        value={formData.qualification}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        aria-required="true"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Experience (years) *
                      </label>
                      <input
                        type="number"
                        name="experience"
                        value={formData.experience}
                        onChange={handleInputChange}
                        required
                        min="0"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        aria-required="true"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Consultation Fee (₹) *
                      </label>
                      <input
                        type="number"
                        name="consultationFee"
                        value={formData.consultationFee}
                        onChange={handleInputChange}
                        required
                        min="0"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        aria-required="true"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={handleCloseModal}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 px-6 rounded-xl transition-all duration-200 font-medium"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2.5 px-8 rounded-xl transition-all duration-200 font-medium shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30"
                    >
                      {editingDoctor ? "Update Doctor" : "Save Doctor"}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && doctorToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-labelledby="delete-title"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaTrash className="text-red-600 text-2xl" />
                </div>
                <h3 id="delete-title" className="text-xl font-bold text-slate-900 mb-2">
                  Delete Doctor
                </h3>
                <p className="text-slate-500 mb-6">
                  Are you sure you want to delete <span className="font-semibold text-slate-900">Dr. {doctorToDelete.user?.fullName}</span>? This action cannot be undone.
                </p>
                <div className="flex gap-3 justify-center">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowDeleteModal(false)}
                    className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors font-medium"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDelete}
                    className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors font-medium shadow-lg shadow-red-600/20"
                  >
                    Delete
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Side Drawer - Doctor Details */}
      <AnimatePresence>
        {showSideDrawer && selectedDoctor && (
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
                  <h2 id="drawer-title" className="text-2xl font-bold text-slate-900">
                    Doctor Details
                  </h2>
                  <motion.button
                    whileHover={{ rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowSideDrawer(false)}
                    className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-100 rounded-xl"
                    aria-label="Close drawer"
                  >
                    <FaTimes size={20} />
                  </motion.button>
                </div>

                {/* Avatar and Basic Info */}
                <div className="flex items-center gap-4 mb-6 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-200/50 flex-shrink-0">
                    <span className="text-white text-2xl font-bold">
                      {selectedDoctor.user?.fullName?.charAt(0) || "D"}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      Dr. {selectedDoctor.user?.fullName || "Unknown"}
                    </h3>
                    <p className="text-sm text-slate-500">{selectedDoctor.specialization}</p>
                    <span className={`inline-flex items-center mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      selectedDoctor.isAvailable !== false 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                        selectedDoctor.isAvailable !== false ? 'bg-emerald-500' : 'bg-red-500'
                      }`}></span>
                      {selectedDoctor.isAvailable !== false ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-xs text-slate-500 font-medium">Email</p>
                      <p className="text-sm text-slate-900 font-medium truncate">
                        <FaEnvelope className="inline mr-1.5 text-slate-400" size={12} />
                        {selectedDoctor.user?.email || "N/A"}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-xs text-slate-500 font-medium">Phone</p>
                      <p className="text-sm text-slate-900 font-medium">
                        <FaPhone className="inline mr-1.5 text-slate-400" size={12} />
                        {selectedDoctor.user?.phoneNumber || "N/A"}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-xs text-slate-500 font-medium">Department</p>
                      <p className="text-sm text-slate-900 font-medium">
                        <FaHospital className="inline mr-1.5 text-slate-400" size={12} />
                        {selectedDoctor.department}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-xs text-slate-500 font-medium">Qualification</p>
                      <p className="text-sm text-slate-900 font-medium">
                        <FaGraduationCap className="inline mr-1.5 text-slate-400" size={12} />
                        {selectedDoctor.qualification}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-xs text-slate-500 font-medium">Experience</p>
                      <p className="text-sm text-slate-900 font-medium">
                        <FaCalendarAlt className="inline mr-1.5 text-slate-400" size={12} />
                        {selectedDoctor.experience} years
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-xs text-slate-500 font-medium">Consultation Fee</p>
                      <p className="text-sm text-slate-900 font-medium">
                        <FaMoneyBillWave className="inline mr-1.5 text-slate-400" size={12} />
                        ₹{selectedDoctor.consultationFee}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-slate-100">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setShowSideDrawer(false);
                        handleEdit(selectedDoctor);
                      }}
                      className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-xl transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <FaEdit size={14} />
                      Edit Doctor
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setShowSideDrawer(false);
                        confirmDelete(selectedDoctor);
                      }}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <FaTrash size={14} />
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

export default DoctorManagement;