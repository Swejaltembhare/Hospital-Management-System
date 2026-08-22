// src/pages/admin/Appointments.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Search,
  Filter,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Download,
  PlusCircle,
  Users,
  Stethoscope,
  CalendarDays,
  User,
  Mail,
  Phone,
  MapPin,
  X
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getAppointments();
      console.log("Appointments Response:", response.data);
      
      if (response.data.success) {
        const appointmentsData = response.data.data || [];
        
        // Process appointments to properly extract patient and doctor names
        const processedAppointments = appointmentsData.map(app => {
          // Extract patient name - check multiple possible paths
          let patientName = 'Unknown Patient';
          if (app.patient) {
            if (app.patient.fullName) patientName = app.patient.fullName;
            else if (app.patient.name) patientName = app.patient.name;
            else if (app.patient.user?.fullName) patientName = app.patient.user.fullName;
            else if (app.patient.user?.name) patientName = app.patient.user.name;
          }
          
          // Extract doctor name - check multiple possible paths
          let doctorName = 'Unknown Doctor';
          if (app.doctor) {
            if (app.doctor.fullName) doctorName = app.doctor.fullName;
            else if (app.doctor.name) doctorName = app.doctor.name;
            else if (app.doctor.user?.fullName) doctorName = app.doctor.user.fullName;
            else if (app.doctor.user?.name) doctorName = app.doctor.user.name;
          }
          
          // Extract patient email
          let patientEmail = 'N/A';
          if (app.patient) {
            if (app.patient.email) patientEmail = app.patient.email;
            else if (app.patient.user?.email) patientEmail = app.patient.user.email;
          }
          
          // Extract patient phone
          let patientPhone = 'N/A';
          if (app.patient) {
            if (app.patient.phoneNumber) patientPhone = app.patient.phoneNumber;
            else if (app.patient.phone) patientPhone = app.patient.phone;
            else if (app.patient.user?.phoneNumber) patientPhone = app.patient.user.phoneNumber;
            else if (app.patient.user?.phone) patientPhone = app.patient.user.phone;
          }
          
          return {
            ...app,
            patientName: patientName,
            doctorName: doctorName,
            patientEmail: patientEmail,
            patientPhone: patientPhone,
          };
        });
        
        setAppointments(processedAppointments);
        console.log("Processed Appointments:", processedAppointments);
        console.log("First appointment patient name:", processedAppointments[0]?.patientName);
      } else {
        console.log("Response success is false:", response.data);
        setAppointments([]);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-amber-50 text-amber-700 border-amber-200',
      confirmed: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      cancelled: 'bg-red-50 text-red-700 border-red-200',
    };
    return badges[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return <Clock size={14} className="text-amber-500" />;
      case 'confirmed': return <CheckCircle size={14} className="text-cyan-500" />;
      case 'completed': return <CheckCircle size={14} className="text-emerald-500" />;
      case 'cancelled': return <XCircle size={14} className="text-red-500" />;
      default: return null;
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      const response = await adminAPI.updateStatus(id, status);
      if (response.data.success) {
        toast.success(`Appointment ${status} successfully`);
        fetchAppointments();
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error('Failed to update appointment');
    }
  };

  const filteredAppointments = appointments.filter(app => {
    const patientName = app.patientName || '';
    const doctorName = app.doctorName || '';
    const department = app.department || '';
    
    const matchesSearch = 
      patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAppointments = filteredAppointments.slice(startIndex, startIndex + itemsPerPage);

  const stats = {
    total: appointments.length,
    pending: appointments.filter(a => a.status === 'pending').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
  };

  // Skeleton loading
  if (loading) {
    return (
      <div className="w-full px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-64 bg-gray-200 rounded mt-2 animate-pulse"></div>
            </div>
            <div className="flex gap-3">
              <div className="h-10 w-32 bg-gray-200 rounded-xl animate-pulse"></div>
              <div className="h-10 w-24 bg-gray-200 rounded-xl animate-pulse"></div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 shadow-sm animate-pulse">
                <div className="h-4 w-16 bg-gray-200 rounded"></div>
                <div className="h-8 w-12 bg-gray-200 rounded mt-2"></div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm animate-pulse">
            <div className="flex gap-4">
              <div className="flex-1 h-12 bg-gray-200 rounded-xl"></div>
              <div className="h-12 w-32 bg-gray-200 rounded-xl"></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse">
            <div className="p-4 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="h-10 w-32 bg-gray-200 rounded"></div>
                  <div className="h-10 w-32 bg-gray-200 rounded"></div>
                  <div className="h-10 w-24 bg-gray-200 rounded"></div>
                  <div className="h-10 w-32 bg-gray-200 rounded"></div>
                  <div className="h-10 w-20 bg-gray-200 rounded"></div>
                  <div className="h-10 w-32 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-teal-50/30">
      <div className="w-full px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative mb-6 sm:mb-8"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                Appointments Management
              </h1>
              <p className="text-slate-500 mt-1 text-sm font-medium">
                Manage all hospital appointments
              </p>
            </div>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 lg:gap-5 mb-6 sm:mb-8"
        >
          {[
            { label: "Total", value: stats.total, color: "teal", borderColor: "border-teal-200" },
            { label: "Pending", value: stats.pending, color: "amber", borderColor: "border-amber-200" },
            { label: "Confirmed", value: stats.confirmed, color: "cyan", borderColor: "border-cyan-200" },
            { label: "Completed", value: stats.completed, color: "emerald", borderColor: "border-emerald-200" },
            { label: "Cancelled", value: stats.cancelled, color: "red", borderColor: "border-red-200" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 * (index + 1) }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className={`bg-white rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-xl transition-all duration-300 border ${stat.borderColor}`}
            >
              <p className={`text-xs font-medium ${
                stat.color === 'teal' ? 'text-teal-600' :
                stat.color === 'amber' ? 'text-amber-600' :
                stat.color === 'cyan' ? 'text-cyan-600' :
                stat.color === 'emerald' ? 'text-emerald-600' :
                'text-red-600'
              }`}>
                {stat.label}
              </p>
              <p className={`text-xl sm:text-2xl lg:text-3xl font-bold ${
                stat.color === 'teal' ? 'text-teal-600' :
                stat.color === 'amber' ? 'text-amber-600' :
                stat.color === 'cyan' ? 'text-cyan-600' :
                stat.color === 'emerald' ? 'text-emerald-600' :
                'text-red-600'
              }`}>
                {stat.value}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow duration-300 mb-6 sm:mb-8 border border-white/50"
        >
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search by patient, doctor, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 text-sm placeholder:text-slate-400"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 text-sm text-slate-700 cursor-pointer min-w-[140px]"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <button className="px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors">
                <Filter size={18} className="text-slate-500" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-white/50"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Patient</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider hidden sm:table-cell">Doctor</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider hidden md:table-cell">Department</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider hidden lg:table-cell">Date & Time</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedAppointments.length > 0 ? (
                  paginatedAppointments.map((appointment, index) => (
                    <motion.tr
                      key={appointment._id || index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-teal-50/20 transition-colors"
                    >
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white text-xs font-semibold shadow-md shadow-teal-200/50 flex-shrink-0">
                            {appointment.patientName?.charAt(0) || 'P'}
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm font-medium text-slate-900 truncate max-w-[100px] sm:max-w-[150px] md:max-w-[200px]">
                              {appointment.patientName}
                            </p>
                            <p className="text-[10px] sm:text-xs text-slate-400 truncate max-w-[80px] sm:max-w-[150px]">
                              {appointment.patientEmail}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">
                        <p className="text-xs sm:text-sm text-slate-600 truncate max-w-[120px]">
                          {appointment.doctorName}
                        </p>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 hidden md:table-cell">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-teal-50 text-teal-700 border border-teal-200">
                          {appointment.department || 'General'}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 hidden lg:table-cell">
                        <div className="text-xs sm:text-sm">
                          <p className="text-slate-900">{new Date(appointment.date).toLocaleDateString()}</p>
                          <p className="text-[10px] sm:text-xs text-slate-400">{appointment.timeSlot}</p>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <span className={`inline-flex items-center gap-1 px-1.5 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium rounded-full border ${getStatusBadge(appointment.status)}`}>
                          {getStatusIcon(appointment.status)}
                          <span className="hidden sm:inline capitalize">{appointment.status}</span>
                          <span className="sm:hidden capitalize">{appointment.status?.charAt(0).toUpperCase()}</span>
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              setSelectedAppointment(appointment);
                              setShowDetailsModal(true);
                            }}
                            className="p-1.5 sm:p-2 bg-teal-50 hover:bg-teal-100 text-teal-600 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye size={14} className="sm:w-4 sm:h-4" />
                          </motion.button>
                          {appointment.status === 'pending' && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleStatusUpdate(appointment._id, 'confirmed')}
                              className="p-1.5 sm:p-2 bg-cyan-50 hover:bg-cyan-100 text-cyan-600 rounded-lg transition-colors"
                              title="Confirm"
                            >
                              <CheckCircle size={14} className="sm:w-4 sm:h-4" />
                            </motion.button>
                          )}
                          {appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
                            <>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleStatusUpdate(appointment._id, 'completed')}
                                className="p-1.5 sm:p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-colors"
                                title="Complete"
                              >
                                <CheckCircle size={14} className="sm:w-4 sm:h-4" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleStatusUpdate(appointment._id, 'cancelled')}
                                className="p-1.5 sm:p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                                title="Cancel"
                              >
                                <XCircle size={14} className="sm:w-4 sm:h-4" />
                              </motion.button>
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                      <CalendarDays size={48} className="mx-auto mb-3 text-slate-300" />
                      <p className="text-sm">No appointments found</p>
                      <p className="text-xs text-slate-400 mt-1">Try adjusting your search or filters</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredAppointments.length > 0 && (
            <div className="px-3 sm:px-6 py-3 sm:py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 sm:p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={14} className="sm:w-4 sm:h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 sm:p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={14} className="sm:w-4 sm:h-4" />
                </motion.button>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Appointment Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedAppointment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4"
            onClick={() => setShowDetailsModal(false)}
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
              <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 id="modal-title" className="text-lg sm:text-xl font-bold text-slate-900">
                  Appointment Details
                </h3>
                <motion.button
                  whileHover={{ rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowDetailsModal(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-100 rounded-xl"
                  aria-label="Close modal"
                >
                  <X size={18} className="sm:w-5 sm:h-5" />
                </motion.button>
              </div>

              <div className="p-5 sm:p-6 space-y-4">
                {/* Patient & Doctor Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-slate-50 rounded-xl p-3 sm:p-4">
                    <p className="text-xs text-slate-500 font-medium">Patient</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold">
                        {selectedAppointment.patientName?.charAt(0) || 'P'}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{selectedAppointment.patientName}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <Mail size={11} /> {selectedAppointment.patientEmail}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 sm:p-4">
                    <p className="text-xs text-slate-500 font-medium">Doctor</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold">
                        {selectedAppointment.doctorName?.charAt(0) || 'D'}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{selectedAppointment.doctorName}</p>
                        <p className="text-xs text-slate-500">{selectedAppointment.department || 'General'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Appointment Details */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-xs text-slate-500 font-medium">Date</p>
                    <p className="text-sm font-semibold text-slate-900 mt-0.5">
                      {new Date(selectedAppointment.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-xs text-slate-500 font-medium">Time</p>
                    <p className="text-sm font-semibold text-slate-900 mt-0.5">{selectedAppointment.timeSlot}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-xs text-slate-500 font-medium">Status</p>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 mt-0.5 text-xs font-medium rounded-full border ${getStatusBadge(selectedAppointment.status)}`}>
                      {getStatusIcon(selectedAppointment.status)}
                      <span className="capitalize">{selectedAppointment.status}</span>
                    </span>
                  </div>
                </div>

                {selectedAppointment.notes && (
                  <div className="bg-slate-50 rounded-xl p-3 sm:p-4">
                    <p className="text-xs text-slate-500 font-medium">Notes</p>
                    <p className="text-sm text-slate-700 mt-1">{selectedAppointment.notes}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 border-t border-slate-100">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowDetailsModal(false)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl transition-colors font-medium text-sm"
                  >
                    Close
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white py-2.5 rounded-xl transition-colors font-medium text-sm shadow-lg shadow-teal-600/20"
                  >
                    Edit Appointment
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Appointments;