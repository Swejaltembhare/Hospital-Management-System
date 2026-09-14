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
  FaChevronRight
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
    availableSlots: [
      {
        day: "",
        startTime: "",
        endTime: "",
        isAvailable: true
      }
    ]
  });

  // Fetch doctors and initialize search input focus on mount
  useEffect(() => {
    fetchDoctors();
    if (searchInputRef.current) {
      setTimeout(() => searchInputRef.current.focus(), 100);
    }
  }, []);

  // Retrieve doctors list from role-specific endpoint
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

  const handleAvailabilityChange = (index, field, value) => {
    const updatedSlots = [...formData.availableSlots];
    updatedSlots[index][field] = value;
    setFormData((prev) => ({
      ...prev,
      availableSlots: updatedSlots
    }));
  };

  const addAvailabilitySlot = () => {
    setFormData((prev) => ({
      ...prev,
      availableSlots: [
        ...prev.availableSlots,
        {
          day: "",
          startTime: "",
          endTime: "",
          isAvailable: true
        }
      ]
    }));
  };

  const removeAvailabilitySlot = (index) => {
    if (formData.availableSlots.length <= 1) {
      toast.error("At least one availability slot is required");
      return;
    }
    const updatedSlots = formData.availableSlots.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      availableSlots: updatedSlots
    }));
  };

  const validateAvailabilitySlots = () => {
    const slots = formData.availableSlots;
    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      if (!slot.day) {
        toast.error(`Please select a day for availability slot ${i + 1}`);
        return false;
      }
      if (!slot.startTime) {
        toast.error(`Please select start time for availability slot ${i + 1}`);
        return false;
      }
      if (!slot.endTime) {
        toast.error(`Please select end time for availability slot ${i + 1}`);
        return false;
      }
      if (slot.startTime >= slot.endTime) {
        toast.error(`End time must be greater than start time for slot ${i + 1}`);
        return false;
      }
    }
    return true;
  };

  // Submit new or updated doctor payload
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateAvailabilitySlots()) {
      return;
    }

    try {
      const cleanedName = formData.fullName.replace(/^Dr\.\s*/i, "").trim();

      const doctorData = {
        ...formData,
        fullName: cleanedName
      };

      if (editingDoctor) {
        await adminAPI.updateDoctor(editingDoctor._id, doctorData);
        toast.success("Doctor updated successfully");
      } else {
        await adminAPI.createDoctor(doctorData);
        toast.success("Doctor added successfully");
      }

      fetchDoctors();
      resetForm();
      setShowModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  const confirmDelete = (doctor) => {
    setDoctorToDelete(doctor);
    setShowDeleteModal(true);
  };

  // Delete doctor entry by ID
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
      availableSlots: doctor.availableSlots && doctor.availableSlots.length > 0 
        ? doctor.availableSlots 
        : [
            {
              day: "",
              startTime: "",
              endTime: "",
              isAvailable: true
            }
          ]
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
      availableSlots: [
        {
          day: "",
          startTime: "",
          endTime: "",
          isAvailable: true
        }
      ]
    });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

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

  const totalPages = Math.ceil(filteredDoctors.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDoctors = filteredDoctors.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, departmentFilter]);

  const totalDoctors = doctors.length;
  const uniqueDepartments = new Set(doctors.map(d => d.department)).size;
  const availableDoctors = doctors.filter(d => d.isAvailable !== false).length;
  const avgExperience = doctors.length > 0 
    ? Math.round(doctors.reduce((acc, d) => acc + (d.experience || 0), 0) / doctors.length) 
    : 0;

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
    return colors[department] || 'bg-emerald-100 text-emerald-800 border-emerald-200';
  };

  const cleanDoctorName = (name) => {
    if (!name) return "Unknown";
    return name.replace(/^Dr\.\s*/i, "");
  };

  if (loading) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-80 bg-gray-200 rounded mt-2 animate-pulse"></div>
            </div>
            <div className="h-12 w-32 bg-gray-200 rounded-xl animate-pulse"></div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 shadow-sm animate-pulse">
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
    <div className="w-full min-h-screen bg-slate-50/60 pb-12 font-sans">
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 space-y-6">
        
        {/* Doctor Management Hero Banner */}
        <div className="w-full bg-emerald-700 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {isPatient ? "Find Doctors" : "Doctors Management"}
              </h1>
              <p className="text-emerald-100 text-xs sm:text-sm mt-1.5 font-medium">
                {isPatient
                  ? "Find and book appointments with specialized medical professionals."
                  : "Manage doctors, departments, availability, and consultation fees."}
              </p>
            </div>
            {!isPatient && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className="bg-white text-emerald-800 hover:bg-emerald-50 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl flex items-center gap-2 shadow-md transition-all duration-300 font-bold text-xs sm:text-sm cursor-pointer whitespace-nowrap"
              >
                <FaPlus className="text-xs sm:text-sm" />
                <span>Add Doctor</span>
              </motion.button>
            )}
          </div>
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Doctor Counter Metric Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6"
        >
          {[
            { 
              icon: FaUserMd, 
              label: "Total Doctors", 
              value: totalDoctors,
              bgColor: "bg-teal-50",
              iconColor: "text-teal-600",
              borderColor: "border-teal-200"
            },
            { 
              icon: FaHospital, 
              label: "Departments", 
              value: uniqueDepartments,
              bgColor: "bg-cyan-50",
              iconColor: "text-cyan-600",
              borderColor: "border-cyan-200"
            },
            { 
              icon: FaCheckCircle, 
              label: "Available", 
              value: availableDoctors,
              bgColor: "bg-emerald-50",
              iconColor: "text-emerald-600",
              borderColor: "border-emerald-200"
            },
            { 
              icon: FaStar, 
              label: "Avg Experience", 
              value: `${avgExperience} yrs`,
              bgColor: "bg-amber-50",
              iconColor: "text-amber-600",
              borderColor: "border-amber-200"
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 * (index + 1) }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className={`bg-white rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-xl transition-all duration-300 border ${stat.borderColor}`}
            >
              <div className="flex items-start justify-between">
                <div className={`${stat.bgColor} p-2.5 sm:p-3 rounded-xl`}>
                  <stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.iconColor}`} />
                </div>
                <span className={`text-xl sm:text-2xl lg:text-3xl font-bold ${stat.iconColor}`}>
                  {stat.value}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-3">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Filter and Search Controls Toolbar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100"
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4">
            <div className="md:col-span-5 relative">
              <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                <FaSearch className="text-slate-400 text-xs sm:text-sm" />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search by name, specialization, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-sm placeholder:text-slate-400"
                aria-label="Search doctors"
              />
            </div>
            <div className="md:col-span-4">
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 sm:py-3 px-3 sm:px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-sm text-slate-700 cursor-pointer"
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
            <div className="md:col-span-3 flex gap-2 sm:gap-3">
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
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl flex items-center justify-center gap-1.5 sm:gap-2 transition-all duration-200 text-xs sm:text-sm font-medium cursor-pointer"
                aria-label="Clear all filters"
              >
                <FaTimes className="text-xs" />
                Clear
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Doctors Data Table */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100"
        >
          {filteredDoctors.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 px-4"
            >
              <div className="text-6xl sm:text-7xl mb-6">👨‍⚕️</div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">No Doctors Found</h3>
              <p className="text-slate-500 mb-6 text-sm sm:text-base">
                {!isPatient ? "Add your first doctor to begin managing your medical staff." : "No doctors currently match your criteria."}
              </p>
              {!isPatient && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    resetForm();
                    setShowModal(true);
                  }}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-2xl flex items-center gap-2 mx-auto shadow-md transition-all duration-300 font-medium text-sm sm:text-base cursor-pointer"
                >
                  <FaPlus />
                  <span>Add Your First Doctor</span>
                </motion.button>
              )}
            </motion.div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full divide-y divide-slate-200/60">
                  <thead className="bg-slate-50/50">
                    <tr>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Doctor
                      </th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider hidden sm:table-cell">
                        Department
                      </th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider hidden md:table-cell">
                        Specialization
                      </th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider hidden lg:table-cell">
                        Fee
                      </th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider hidden sm:table-cell">
                        Experience
                      </th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider hidden md:table-cell">
                        Status
                      </th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
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
                          backgroundColor: "rgba(16, 185, 129, 0.04)",
                          transition: { duration: 0.2 }
                        }}
                        className="hover:shadow-sm transition-all duration-200"
                      >
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-9 w-9 sm:h-11 sm:w-11">
                              <div className="h-9 w-9 sm:h-11 sm:w-11 rounded-full bg-emerald-600 flex items-center justify-center text-white font-semibold text-xs sm:text-sm">
                                {doctor.user?.fullName?.charAt(0) || "D"}
                              </div>
                            </div>
                            <div className="ml-2 sm:ml-3 min-w-0">
                              <div className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
                                Dr. {cleanDoctorName(doctor.user?.fullName)}
                              </div>
                              <div className="text-xs text-slate-500 truncate hidden sm:block">
                                {doctor.user?.email || "No email"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden sm:table-cell">
                          <span className={`inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-xs font-medium border ${getDepartmentColor(doctor.department)}`}>
                            {doctor.department}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-slate-600 hidden md:table-cell">
                          {doctor.specialization}
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-semibold text-slate-900 hidden lg:table-cell">
                          ₹{doctor.consultationFee}
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden sm:table-cell">
                          <span className="inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <FaCalendarAlt className="mr-1 text-xs" />
                            {doctor.experience} yrs
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden md:table-cell">
                          <span className={`inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-xs font-medium border ${
                            doctor.isAvailable !== false 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full mr-1 ${
                              doctor.isAvailable !== false ? 'bg-emerald-500' : 'bg-red-500'
                            }`}></span>
                            {doctor.isAvailable !== false ? 'Available' : 'Unavailable'}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1 sm:gap-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleViewDoctor(doctor)}
                              className="p-1.5 sm:p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-all duration-200 cursor-pointer"
                              title="View Doctor"
                              aria-label={`View Dr. ${cleanDoctorName(doctor.user?.fullName)}`}
                            >
                              <FaEye size={12} className="sm:w-3.5 sm:h-3.5" />
                            </motion.button>
                            {!isPatient && (
                              <>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleEdit(doctor)}
                                  className="p-1.5 sm:p-2 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-lg transition-all duration-200 cursor-pointer"
                                  title="Edit Doctor"
                                  aria-label={`Edit Dr. ${cleanDoctorName(doctor.user?.fullName)}`}
                                >
                                  <FaEdit size={12} className="sm:w-3.5 sm:h-3.5" />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => confirmDelete(doctor)}
                                  className="p-1.5 sm:p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-all duration-200 cursor-pointer"
                                  title="Delete Doctor"
                                  aria-label={`Delete Dr. ${cleanDoctorName(doctor.user?.fullName)}`}
                                >
                                  <FaTrash size={12} className="sm:w-3.5 sm:h-3.5" />
                                </motion.button>
                              </>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Table Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-3 sm:px-6 py-3 sm:py-4 border-t border-slate-100">
                  <p className="text-xs sm:text-sm text-slate-500">
                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredDoctors.length)} of {filteredDoctors.length} doctors
                  </p>
                  <div className="flex gap-1.5 sm:gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-1.5 sm:p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      aria-label="Previous page"
                    >
                      <FaChevronLeft size={12} className="sm:w-3.5 sm:h-3.5" />
                    </motion.button>
                    <div className="flex items-center gap-1">
                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                            currentPage === i + 1
                              ? 'bg-emerald-700 text-white'
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
                      className="p-1.5 sm:p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      aria-label="Next page"
                    >
                      <FaChevronRight size={12} className="sm:w-3.5 sm:h-3.5" />
                    </motion.button>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>

      {/* Add / Edit Doctor Modal Form */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4"
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
              <div className="p-5 sm:p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 id="modal-title" className="text-xl sm:text-2xl font-bold text-slate-900">
                    {editingDoctor ? "Edit Doctor" : "Add New Doctor"}
                  </h2>
                  <motion.button
                    whileHover={{ rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleCloseModal}
                    className="text-slate-400 hover:text-slate-600 transition-colors duration-200 p-2 hover:bg-slate-100 rounded-xl cursor-pointer"
                    aria-label="Close modal"
                  >
                    <FaTimes size={18} className="sm:w-5 sm:h-5" />
                  </motion.button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
                        placeholder="e.g., Swejal Tembhare"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-sm"
                        aria-required="true"
                      />
                      <p className="text-xs text-slate-400 mt-1">Don't add "Dr." prefix, it will be added automatically</p>
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
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-sm"
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
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-sm"
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
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-sm"
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
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-sm"
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
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-sm"
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
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-sm"
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
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-sm"
                        aria-required="true"
                      />
                    </div>
                    <div className="sm:col-span-2">
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
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-sm"
                        aria-required="true"
                      />
                    </div>
                  </div>

                  {/* Dynamic Shift Schedule Slots */}
                  <div className="border-t border-slate-200 pt-5 sm:pt-6 mt-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                      <h3 className="text-base sm:text-lg font-semibold text-slate-800 flex items-center gap-2">
                        <FaRegClock className="text-emerald-600" />
                        Doctor Availability
                      </h3>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={addAvailabilitySlot}
                        className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl flex items-center gap-2 transition-all duration-200 text-xs sm:text-sm font-medium border border-emerald-200 w-full sm:w-auto justify-center cursor-pointer"
                      >
                        <FaPlus size={11} className="sm:w-3.5 sm:h-3.5" />
                        Add Availability
                      </motion.button>
                    </div>

                    {formData.availableSlots.map((slot, index) => (
                      <div key={index} className="bg-slate-50 rounded-xl p-3 sm:p-4 mb-3 border border-slate-200">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">
                              Day *
                            </label>
                            <select
                              value={slot.day}
                              onChange={(e) => handleAvailabilityChange(index, "day", e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg py-1.5 sm:py-2 px-2 sm:px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-xs sm:text-sm cursor-pointer"
                              required
                            >
                              <option value="">Select Day</option>
                              <option value="Monday">Monday</option>
                              <option value="Tuesday">Tuesday</option>
                              <option value="Wednesday">Wednesday</option>
                              <option value="Thursday">Thursday</option>
                              <option value="Friday">Friday</option>
                              <option value="Saturday">Saturday</option>
                              <option value="Sunday">Sunday</option>
                            </select>
                          </div>
                          <div className="flex items-end gap-2">
                            <div className="flex-1">
                              <label className="block text-xs font-medium text-slate-600 mb-1">
                                Start *
                              </label>
                              <input
                                type="time"
                                value={slot.startTime}
                                onChange={(e) => handleAvailabilityChange(index, "startTime", e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-lg py-1.5 sm:py-2 px-2 sm:px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-xs sm:text-sm"
                                required
                              />
                            </div>
                            <div className="flex-1">
                              <label className="block text-xs font-medium text-slate-600 mb-1">
                                End *
                              </label>
                              <input
                                type="time"
                                value={slot.endTime}
                                onChange={(e) => handleAvailabilityChange(index, "endTime", e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-lg py-1.5 sm:py-2 px-2 sm:px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-xs sm:text-sm"
                                required
                              />
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-2 sm:mt-3">
                          <label className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={slot.isAvailable}
                              onChange={(e) => handleAvailabilityChange(index, "isAvailable", e.target.checked)}
                              className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 cursor-pointer"
                            />
                            Available
                          </label>
                          {formData.availableSlots.length > 1 && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              type="button"
                              onClick={() => removeAvailabilitySlot(index)}
                              className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              aria-label="Remove availability slot"
                            >
                              <FaTrash size={12} className="sm:w-3.5 sm:h-3.5" />
                            </motion.button>
                          )}
                        </div>
                      </div>
                    ))}
                    <p className="text-xs text-slate-500 mt-2">
                      * All fields are required. End time must be greater than start time.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4 sm:pt-6 border-t border-slate-100">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={handleCloseModal}
                      className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 px-6 rounded-xl transition-all duration-200 font-medium text-sm cursor-pointer"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="w-full sm:w-auto bg-emerald-700 hover:bg-emerald-800 text-white py-2.5 px-8 rounded-xl transition-all duration-200 font-medium shadow-md text-sm cursor-pointer"
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

      {/* Delete Confirmation Alert Modal */}
      <AnimatePresence>
        {showDeleteModal && doctorToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-labelledby="delete-title"
            >
              <div className="text-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaTrash className="text-red-600 text-xl sm:text-2xl" />
                </div>
                <h3 id="delete-title" className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
                  Delete Doctor
                </h3>
                <p className="text-sm sm:text-base text-slate-500 mb-6">
                  Are you sure you want to delete <span className="font-semibold text-slate-900">Dr. {cleanDoctorName(doctorToDelete.user?.fullName)}</span>? This action cannot be undone.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowDeleteModal(false)}
                    className="w-full sm:w-auto px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors font-medium text-sm cursor-pointer"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDelete}
                    className="w-full sm:w-auto px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors font-medium shadow-md text-sm cursor-pointer"
                  >
                    Delete
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Doctor Detailed Overview Drawer */}
      <AnimatePresence>
        {showSideDrawer && selectedDoctor && (
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
              className="fixed right-0 top-0 h-full w-full sm:w-[380px] lg:w-[440px] bg-white shadow-2xl z-50 overflow-y-auto"
              role="dialog"
              aria-labelledby="drawer-title"
            >
              <div className="p-5 sm:p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 id="drawer-title" className="text-xl sm:text-2xl font-bold text-slate-900">
                    Doctor Details
                  </h2>
                  <motion.button
                    whileHover={{ rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowSideDrawer(false)}
                    className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-100 rounded-xl cursor-pointer"
                    aria-label="Close drawer"
                  >
                    <FaTimes size={18} className="sm:w-5 sm:h-5" />
                  </motion.button>
                </div>

                <div className="flex items-center gap-4 mb-6 p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100">
                  <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-xl sm:text-2xl shadow-md flex-shrink-0">
                    {selectedDoctor.user?.fullName?.charAt(0) || "D"}
                  </div>
                  <div>
                    <h3 className="text-base sm:text-xl font-bold text-slate-900">
                      Dr. {cleanDoctorName(selectedDoctor.user?.fullName)}
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

                <div className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-xs text-slate-500 font-medium">Email</p>
                      <p className="text-xs sm:text-sm text-slate-900 font-medium truncate">
                        <FaEnvelope className="inline mr-1.5 text-slate-400" size={12} />
                        {selectedDoctor.user?.email || "N/A"}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-xs text-slate-500 font-medium">Phone</p>
                      <p className="text-xs sm:text-sm text-slate-900 font-medium">
                        <FaPhone className="inline mr-1.5 text-slate-400" size={12} />
                        {selectedDoctor.user?.phoneNumber || "N/A"}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-xs text-slate-500 font-medium">Department</p>
                      <p className="text-xs sm:text-sm text-slate-900 font-medium">
                        <FaHospital className="inline mr-1.5 text-slate-400" size={12} />
                        {selectedDoctor.department}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-xs text-slate-500 font-medium">Qualification</p>
                      <p className="text-xs sm:text-sm text-slate-900 font-medium">
                        <FaGraduationCap className="inline mr-1.5 text-slate-400" size={12} />
                        {selectedDoctor.qualification}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-xs text-slate-500 font-medium">Experience</p>
                      <p className="text-xs sm:text-sm text-slate-900 font-medium">
                        <FaCalendarAlt className="inline mr-1.5 text-slate-400" size={12} />
                        {selectedDoctor.experience} years
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-xs text-slate-500 font-medium">Consultation Fee</p>
                      <p className="text-xs sm:text-sm text-slate-900 font-medium">
                        <FaMoneyBillWave className="inline mr-1.5 text-slate-400" size={12} />
                        ₹{selectedDoctor.consultationFee}
                      </p>
                    </div>
                  </div>

                  {!isPatient && (
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 border-t border-slate-100">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setShowSideDrawer(false);
                          handleEdit(selectedDoctor);
                        }}
                        className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-xl transition-colors font-medium flex items-center justify-center gap-2 text-sm cursor-pointer"
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
                        className="w-full bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl transition-colors font-medium flex items-center justify-center gap-2 text-sm cursor-pointer"
                      >
                        <FaTrash size={14} />
                        Delete
                      </motion.button>
                    </div>
                  )}
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