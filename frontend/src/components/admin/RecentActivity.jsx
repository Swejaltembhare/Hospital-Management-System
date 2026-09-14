// src/components/admin/RecentActivity.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  UserPlus, 
  Stethoscope, 
  Calendar, 
  XCircle, 
  Pill, 
  Building2,
  Clock,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  RefreshCw,
  ChevronRight,
  FileText
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const RecentActivity = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  // Query recent system activity events when filter selection updates
  useEffect(() => {
    fetchActivities();
  }, [filter]);

  // Retrieve recent administrative logs and events from backend API
  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        limit: 10,
        type: filter !== 'all' ? filter : ''
      };

      const response = await adminAPI.getRecentActivity(params);
      const data = response.data || response.activities || response || [];
      setActivities(Array.isArray(data) ? data : data.activities || []);
    } catch (err) {
      console.error('Error fetching activities:', err);
      setError('Failed to load activities');
      setActivities([]);
      toast.error('Failed to load recent activity feed');
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    const icons = {
      patient: UserPlus,
      doctor: Stethoscope,
      appointment: Calendar,
      cancel: XCircle,
      prescription: Pill,
      department: Building2,
      completed: CheckCircle,
      alert: AlertCircle,
      message: MessageSquare,
      export: FileText,
    };
    return icons[type?.toLowerCase()] || Clock;
  };

  const getActivityColor = (type) => {
    const colors = {
      patient: 'bg-green-100 text-green-600',
      doctor: 'bg-blue-100 text-blue-600',
      appointment: 'bg-purple-100 text-purple-600',
      cancel: 'bg-red-100 text-red-600',
      prescription: 'bg-yellow-100 text-yellow-600',
      department: 'bg-indigo-100 text-indigo-600',
      completed: 'bg-emerald-100 text-emerald-600',
      alert: 'bg-rose-100 text-rose-600',
      message: 'bg-cyan-100 text-cyan-600',
      export: 'bg-teal-100 text-teal-600',
    };
    return colors[type?.toLowerCase()] || 'bg-gray-100 text-gray-600';
  };

  const getActivityText = (activity) => {
    if (activity.description) return activity.description;
    if (activity.details) return activity.details;

    const texts = {
      patient: `New patient ${activity.name || activity.patientName || 'User'} registered`,
      doctor: `Dr. ${activity.name || activity.doctorName || 'Doctor'} ${activity.action || 'updated'}`,
      appointment: `Appointment ${activity.action || 'booked'} with Dr. ${activity.doctorName || 'Doctor'}`,
      cancel: `Appointment cancelled by ${activity.name || activity.patientName || 'Patient'}`,
      prescription: `Prescription ${activity.action || 'added'} for ${activity.name || activity.patientName || 'Patient'}`,
      department: `Department ${activity.name || ''} modified`,
      completed: `Appointment completed for ${activity.patientName || 'Patient'}`,
      alert: `${activity.title || 'Alert'}: ${activity.message || ''}`,
      message: `${activity.from || 'User'} sent a helpdesk message`,
    };
    return texts[activity.type?.toLowerCase()] || `${activity.action || 'System event'} performed`;
  };

  const getStatusBadge = (status) => {
    if (!status) return null;
    
    const badges = {
      completed: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      cancelled: 'bg-red-100 text-red-700',
      confirmed: 'bg-blue-100 text-blue-700',
      active: 'bg-emerald-100 text-emerald-700',
      inactive: 'bg-gray-100 text-gray-700',
    };
    
    const color = badges[status.toLowerCase()] || 'bg-gray-100 text-gray-700';
    return (
      <span className={`text-xs font-medium px-2 py-1 rounded-full ${color}`}>
        {status}
      </span>
    );
  };

  const filterOptions = [
    { value: 'all', label: 'All' },
    { value: 'patient', label: 'Patients' },
    { value: 'appointment', label: 'Appointments' },
    { value: 'doctor', label: 'Doctors' },
    { value: 'department', label: 'Departments' },
  ];

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Just now';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading && activities.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="divide-y divide-gray-100">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="p-4 animate-pulse">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
                <div className="flex-1">
                  <div className="h-4 w-48 bg-gray-200 rounded"></div>
                  <div className="h-3 w-24 bg-gray-200 rounded mt-2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-6">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={fetchActivities}
            className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
    >
      {/* Activity Section Header */}
      <div className="p-4 sm:p-6 border-b border-gray-100">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-100 rounded-lg">
              <Clock size={20} className="text-teal-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
              {activities.length > 0 && (
                <p className="text-xs text-gray-500">{activities.length} recent activities</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchActivities}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw size={16} className="text-gray-400" />
            </button>
            <Link
              to="/admin/audit-logs"
              className="text-xs text-teal-600 font-medium hover:text-teal-700 flex items-center gap-1"
            >
              View All
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>

        {/* Activity Category Filter Chips */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`px-3 py-1 rounded-lg text-xs transition-colors ${
                filter === option.value
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Items List */}
      <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
        {activities.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Clock size={48} className="mx-auto mb-3 text-gray-300" />
            <p>No recent activities</p>
            {filter !== 'all' && (
              <p className="text-sm mt-1">Try changing the filter</p>
            )}
          </div>
        ) : (
          activities.map((activity, index) => {
            const Icon = getActivityIcon(activity.type);
            const colorClass = getActivityColor(activity.type);
            
            return (
              <motion.div
                key={activity._id || index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(index * 0.05, 0.5) }}
                className="flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => {
                  if (activity.link) {
                    navigate(activity.link);
                  }
                }}
              >
                <div className={`p-2 rounded-xl ${colorClass}`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800">{getActivityText(activity)}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">{formatTime(activity.createdAt || activity.time || activity.timestamp)}</span>
                    {(activity.user || activity.performedBy) && (
                      <span className="text-xs text-gray-400">by {activity.user || activity.performedBy}</span>
                    )}
                    {getStatusBadge(activity.status)}
                  </div>
                </div>
                {activity.link && (
                  <button 
                    className="text-xs text-teal-600 hover:text-teal-700 font-medium whitespace-nowrap"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(activity.link);
                    }}
                  >
                    View
                  </button>
                )}
              </motion.div>
            );
          })
        )}
      </div>

      {/* Activity Card Footer */}
      {activities.length > 0 && (
        <div className="p-3 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
          <span className="text-xs text-gray-500">
            Showing {activities.length} activities
          </span>
          <Link
            to="/admin/audit-logs"
            className="text-xs text-teal-600 hover:text-teal-700 font-medium"
          >
            View all →
          </Link>
        </div>
      )}
    </motion.div>
  );
};

export default RecentActivity;