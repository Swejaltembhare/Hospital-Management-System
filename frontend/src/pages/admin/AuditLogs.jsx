import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Calendar, Clock, User, Activity, FileText,
  Users, Stethoscope, Pill, CalendarCheck, DollarSign, X, Eye
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalLogs: 0, todayLogs: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [resourceFilter, setResourceFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const itemsPerPage = 12;

  const actions = ['LOGIN', 'LOGOUT', 'CREATE', 'UPDATE', 'DELETE', 'BOOK', 'CANCEL', 'COMPLETE', 'PRESCRIPTION', 'PAYMENT'];
  const resources = ['PATIENT', 'DOCTOR', 'APPOINTMENT', 'PRESCRIPTION', 'BILLING', 'USER', 'MEDICAL_RECORD'];

  // Retrieve audit activity logs and counter statistics on dependency updates
  useEffect(() => {
    fetchAuditLogs();
    fetchStats();
  }, [currentPage, actionFilter, resourceFilter]);

  // Query audit logs using active filter parameters
  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const params = { page: currentPage, limit: itemsPerPage };
      if (searchTerm) params.search = searchTerm;
      if (actionFilter) params.action = actionFilter;
      if (resourceFilter) params.resource = resourceFilter;

      if (typeof adminAPI?.getAuditLogs === 'function') {
        const response = await adminAPI.getAuditLogs(params);
        setLogs(response.data?.data || []);
      } else {
        setLogs([]);
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  // Retrieve daily and aggregate log metric counts
  const fetchStats = async () => {
    try {
      if (typeof adminAPI?.getAuditLogStats === 'function') {
        const response = await adminAPI.getAuditLogStats();
        setStats(response.data?.data || { totalLogs: 0, todayLogs: 0 });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Reset active filter selections to default state
  const clearFilters = () => {
    setSearchTerm('');
    setActionFilter('');
    setResourceFilter('');
    setCurrentPage(1);
  };

  const getActionBadge = (action) => {
    const colors = {
      LOGIN: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
      LOGOUT: 'bg-slate-100 text-slate-700 border-slate-200/60',
      CREATE: 'bg-blue-50 text-blue-700 border-blue-200/60',
      UPDATE: 'bg-amber-50 text-amber-700 border-amber-200/60',
      DELETE: 'bg-rose-50 text-rose-700 border-rose-200/60',
      BOOK: 'bg-cyan-50 text-cyan-700 border-cyan-200/60',
      CANCEL: 'bg-rose-50 text-rose-700 border-rose-200/60',
      COMPLETE: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
      PRESCRIPTION: 'bg-violet-50 text-violet-700 border-violet-200/60',
      PAYMENT: 'bg-teal-50 text-teal-700 border-teal-200/60',
    };
    return colors[action] || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const getResourceIcon = (resource) => {
    const icons = {
      PATIENT: Users,
      DOCTOR: Stethoscope,
      APPOINTMENT: CalendarCheck,
      PRESCRIPTION: Pill,
      BILLING: DollarSign,
      USER: User,
      MEDICAL_RECORD: FileText,
    };
    return icons[resource] || Activity;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  if (loading) return <AuditLogsSkeleton />;

  return (
    <div className="w-full min-h-screen bg-slate-50/60 pb-12 font-sans">
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 space-y-6">

        {/* Audit Logs Hero Banner */}
        <div className="w-full bg-emerald-700 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2.5">
                <Activity className="w-7 h-7 text-emerald-200" />
                Audit Logs
              </h1>
              <p className="text-emerald-100 text-xs sm:text-sm mt-1.5 font-medium">
                Real-time tracking of system events and administrative operations.
              </p>
            </div>

            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-white/20 self-start sm:self-auto">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-300" />
                <span className="text-xs font-bold text-white">Logs: {stats?.totalLogs || 0}</span>
              </div>
              <div className="w-px h-4 bg-white/20" />
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-200" />
                <span className="text-xs font-bold text-white">Today: {stats?.todayLogs || 0}</span>
              </div>
            </div>
          </div>
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Search and Action Filtering Toolbar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-3"
        >
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search audit records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm placeholder:text-slate-400 transition-all"
            />
          </div>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm font-medium text-slate-700 cursor-pointer"
          >
            <option value="">All Actions</option>
            {actions.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
          <select
            value={resourceFilter}
            onChange={(e) => setResourceFilter(e.target.value)}
            className="px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm font-medium text-slate-700 cursor-pointer"
          >
            <option value="">All Resources</option>
            {resources.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={clearFilters}
            className="px-5 py-2.5 sm:py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-colors cursor-pointer"
          >
            Clear
          </motion.button>
        </motion.div>

        {/* Audit Log Table View */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-slate-200/60">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-4 sm:px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Timestamp</th>
                  <th className="px-4 sm:px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">User</th>
                  <th className="px-4 sm:px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Action</th>
                  <th className="px-4 sm:px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Resource</th>
                  <th className="px-4 sm:px-6 py-3.5 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Details</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {logs.length > 0 ? (
                  logs.map((log, idx) => {
                    const Icon = getResourceIcon(log.resource);
                    return (
                      <motion.tr 
                        key={log._id || idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.03 }}
                        whileHover={{ backgroundColor: "rgba(16, 185, 129, 0.04)", transition: { duration: 0.2 } }}
                        className="hover:shadow-sm transition-all duration-200"
                      >
                        <td className="px-4 sm:px-6 py-3.5 whitespace-nowrap text-xs text-slate-500 font-mono">
                          {formatDate(log.timestamp)}
                        </td>
                        <td className="px-4 sm:px-6 py-3.5 whitespace-nowrap">
                          <p className="text-xs sm:text-sm font-semibold text-slate-900">{log.userName || 'System'}</p>
                          <p className="text-xs text-slate-400 capitalize">{log.userRole || 'Automated'}</p>
                        </td>
                        <td className="px-4 sm:px-6 py-3.5 whitespace-nowrap">
                          <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full border ${getActionBadge(log.action)}`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-3.5 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-700">
                            <Icon size={14} className="text-emerald-600" />
                            {log.resource}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-3.5 whitespace-nowrap text-right">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => { setSelectedLog(log); setShowDetail(true); }}
                            className="p-1.5 sm:p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-colors cursor-pointer"
                            title="View Log Detail"
                          >
                            <Eye size={14} className="sm:w-3.5 sm:h-3.5" />
                          </motion.button>
                        </td>
                      </motion.tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-16 text-center text-slate-400">
                      <Activity size={48} className="mx-auto mb-3 text-slate-300" />
                      <p className="text-sm font-semibold text-slate-600">No audit logs found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

      </div>

      {/* Audit Log Overview Modal */}
      <AnimatePresence>
        {showDetail && selectedLog && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowDetail(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-900">Audit Entry Detail</h3>
                <button onClick={() => setShowDetail(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-3 text-xs sm:text-sm">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 font-medium text-xs">User Information</span>
                  <p className="font-bold text-slate-800 mt-0.5">{selectedLog.userName || 'Unknown'}</p>
                  <p className="text-xs text-slate-500">{selectedLog.userRole || 'User Role'}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 font-medium text-xs">Operation Details</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{selectedLog.details || 'No extended payload provided'}</p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowDetail(false)}
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl text-sm transition-colors shadow-sm cursor-pointer"
              >
                Close
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AuditLogsSkeleton = () => (
  <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-pulse">
    <div className="h-32 bg-slate-200 rounded-3xl" />
    <div className="h-64 bg-slate-200 rounded-2xl" />
  </div>
);

export default AuditLogs;