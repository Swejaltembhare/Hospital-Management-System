import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Search, Filter, Eye, CheckCircle, XCircle, Clock,
  ChevronLeft, ChevronRight, CalendarDays, X, RefreshCw
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
  const itemsPerPage = 8;

  // Retrieve appointments list on component mount
  useEffect(() => {
    fetchAppointments();
  }, []);

  // Fetch all appointments from backend API and format entity data
  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getAppointments();
      if (response.data?.success) {
        const appointmentsData = response.data.data || [];
        const processed = appointmentsData.map((app) => ({
          ...app,
          patientName: app.patient?.fullName || app.patient?.name || app.patient?.user?.fullName || 'Unknown Patient',
          doctorName: app.doctor?.fullName || app.doctor?.name || app.doctor?.user?.fullName || 'Unknown Doctor',
          patientEmail: app.patient?.email || app.patient?.user?.email || 'N/A',
          patientPhone: app.patient?.phoneNumber || app.patient?.phone || 'N/A',
        }));
        setAppointments(processed);
      } else {
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

  // Update specific appointment status state
  const handleStatusUpdate = async (id, status) => {
    try {
      const response = await adminAPI.updateStatus(id, status);
      if (response.data?.success) {
        toast.success(`Appointment ${status} successfully`);
        fetchAppointments();
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error('Failed to update appointment');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-amber-50 text-amber-700 border-amber-200/60',
      confirmed: 'bg-cyan-50 text-cyan-700 border-cyan-200/60',
      completed: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
      cancelled: 'bg-rose-50 text-rose-700 border-rose-200/60',
    };
    return badges[status] || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock size={13} className="text-amber-500" />;
      case 'confirmed': return <CheckCircle size={13} className="text-cyan-500" />;
      case 'completed': return <CheckCircle size={13} className="text-emerald-500" />;
      case 'cancelled': return <XCircle size={13} className="text-rose-500" />;
      default: return null;
    }
  };

  const filtered = appointments.filter((app) => {
    const matchesSearch =
      app.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.department || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const stats = [
    { label: "Total", value: appointments.length, color: "bg-teal-500", text: "text-teal-600" },
    { label: "Pending", value: appointments.filter(a => a.status === 'pending').length, color: "bg-amber-500", text: "text-amber-600" },
    { label: "Confirmed", value: appointments.filter(a => a.status === 'confirmed').length, color: "bg-cyan-500", text: "text-cyan-600" },
    { label: "Completed", value: appointments.filter(a => a.status === 'completed').length, color: "bg-emerald-500", text: "text-emerald-600" },
    { label: "Cancelled", value: appointments.filter(a => a.status === 'cancelled').length, color: "bg-rose-500", text: "text-rose-600" },
  ];

  if (loading) return <AppointmentsSkeleton />;

  return (
    <div className="w-full min-h-screen bg-slate-50/60 pb-12 font-sans">
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 space-y-6">
        
        {/* Appointments Management Hero Banner */}
        <div className="w-full bg-emerald-700 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2.5">
                <Calendar className="w-7 h-7 text-emerald-200" />
                Appointments Management
              </h1>
              <p className="text-emerald-100 text-xs sm:text-sm mt-1.5 font-medium">
                Manage and track patient scheduling, consultations, and statuses.
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={fetchAppointments}
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 backdrop-blur-sm transition-all duration-300 font-bold text-xs sm:text-sm cursor-pointer whitespace-nowrap self-start sm:self-auto"
            >
              <RefreshCw size={14} />
              <span>Refresh List</span>
            </motion.button>
          </div>
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Dynamic Status Metrics Counter Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 lg:gap-6"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between"
            >
              <div>
                <p className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                <p className={`text-xl sm:text-2xl font-bold ${stat.text} mt-1`}>{stat.value}</p>
              </div>
              <div className={`w-3 h-3 rounded-full ${stat.color}`}></div>
            </motion.div>
          ))}
        </motion.div>

        {/* Filter and Search Toolbar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-3"
        >
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by patient, doctor, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm placeholder:text-slate-400 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm font-medium text-slate-700 cursor-pointer min-w-[140px]"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button className="p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors text-slate-500 cursor-pointer">
              <Filter size={18} />
            </button>
          </div>
        </motion.div>

        {/* Appointments Table View */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-slate-200/60">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-4 sm:px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Patient</th>
                  <th className="px-4 sm:px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider hidden sm:table-cell">Doctor</th>
                  <th className="px-4 sm:px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider hidden md:table-cell">Department</th>
                  <th className="px-4 sm:px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider hidden lg:table-cell">Schedule</th>
                  <th className="px-4 sm:px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                  <th className="px-4 sm:px-6 py-3.5 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {paginated.length > 0 ? (
                  paginated.map((app, idx) => (
                    <motion.tr 
                      key={app._id || idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.04 }}
                      whileHover={{ backgroundColor: "rgba(16, 185, 129, 0.04)", transition: { duration: 0.2 } }}
                      className="hover:shadow-sm transition-all duration-200"
                    >
                      <td className="px-4 sm:px-6 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-emerald-600 text-white text-xs sm:text-sm font-semibold flex items-center justify-center flex-shrink-0 shadow-xs">
                            {app.patientName.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-semibold text-slate-900 truncate">{app.patientName}</p>
                            <p className="text-xs text-slate-500 truncate hidden sm:block">{app.patientEmail}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3.5 whitespace-nowrap hidden sm:table-cell">
                        <p className="text-xs sm:text-sm font-semibold text-slate-700 truncate">{app.doctorName}</p>
                      </td>
                      <td className="px-4 sm:px-6 py-3.5 whitespace-nowrap hidden md:table-cell">
                        <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {app.department || 'General'}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-3.5 whitespace-nowrap hidden lg:table-cell">
                        <p className="text-xs sm:text-sm font-medium text-slate-800">{new Date(app.date).toLocaleDateString()}</p>
                        <p className="text-xs text-slate-400">{app.timeSlot}</p>
                      </td>
                      <td className="px-4 sm:px-6 py-3.5 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusBadge(app.status)}`}>
                          {getStatusIcon(app.status)}
                          <span className="capitalize">{app.status}</span>
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-3.5 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => { setSelectedAppointment(app); setShowDetailsModal(true); }}
                            className="p-1.5 sm:p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-colors cursor-pointer"
                            title="View Details"
                          >
                            <Eye size={14} className="sm:w-3.5 sm:h-3.5" />
                          </motion.button>
                          {app.status === 'pending' && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleStatusUpdate(app._id, 'confirmed')}
                              className="p-1.5 sm:p-2 bg-cyan-50 hover:bg-cyan-100 text-cyan-600 rounded-lg transition-colors cursor-pointer"
                              title="Confirm"
                            >
                              <CheckCircle size={14} className="sm:w-3.5 sm:h-3.5" />
                            </motion.button>
                          )}
                          {app.status !== 'completed' && app.status !== 'cancelled' && (
                            <>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleStatusUpdate(app._id, 'completed')}
                                className="p-1.5 sm:p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-colors cursor-pointer"
                                title="Complete"
                              >
                                <CheckCircle size={14} className="sm:w-3.5 sm:h-3.5" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleStatusUpdate(app._id, 'cancelled')}
                                className="p-1.5 sm:p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors cursor-pointer"
                                title="Cancel"
                              >
                                <XCircle size={14} className="sm:w-3.5 sm:h-3.5" />
                              </motion.button>
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-16 text-center text-slate-400">
                      <CalendarDays size={48} className="mx-auto mb-3 text-slate-300" />
                      <p className="text-sm font-semibold text-slate-600">No appointments matched your query</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Pagination */}
          {filtered.length > 0 && (
            <div className="px-4 sm:px-6 py-4 bg-white border-t border-slate-100 flex items-center justify-between">
              <p className="text-xs sm:text-sm text-slate-500">
                Showing {paginated.length} of {filtered.length} records
              </p>
              <div className="flex items-center gap-1.5">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  className="p-1.5 sm:p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 disabled:opacity-40 transition-colors cursor-pointer"
                >
                  <ChevronLeft size={14} />
                </motion.button>
                <span className="text-xs sm:text-sm font-semibold text-slate-700 px-2">{currentPage} / {totalPages || 1}</span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  className="p-1.5 sm:p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 disabled:opacity-40 transition-colors cursor-pointer"
                >
                  <ChevronRight size={14} />
                </motion.button>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Appointment Overview Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedAppointment && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowDetailsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-900">Appointment Overview</h3>
                <button onClick={() => setShowDetailsModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer">
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 font-medium text-xs">Patient</span>
                  <p className="font-bold text-slate-800 mt-0.5">{selectedAppointment.patientName}</p>
                  <p className="text-xs text-slate-500 truncate">{selectedAppointment.patientEmail}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 font-medium text-xs">Doctor</span>
                  <p className="font-bold text-slate-800 mt-0.5">{selectedAppointment.doctorName}</p>
                  <p className="text-xs text-slate-500">{selectedAppointment.department || 'General'}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 font-medium text-xs">Date & Time</span>
                  <p className="font-bold text-slate-800 mt-0.5">{new Date(selectedAppointment.date).toLocaleDateString()}</p>
                  <p className="text-xs text-slate-500">{selectedAppointment.timeSlot}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 font-medium text-xs">Current Status</span>
                  <div className="mt-1">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full border ${getStatusBadge(selectedAppointment.status)}`}>
                      {selectedAppointment.status}
                    </span>
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowDetailsModal(false)}
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl text-sm transition-colors shadow-sm cursor-pointer"
              >
                Dismiss
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AppointmentsSkeleton = () => (
  <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-pulse">
    <div className="h-32 bg-slate-200 rounded-3xl" />
    <div className="grid grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
      {[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-slate-200 rounded-2xl" />)}
    </div>
    <div className="h-64 bg-slate-200 rounded-2xl" />
  </div>
);

export default Appointments;