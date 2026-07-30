// src/components/admin/RecentActivity.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { 
  UserPlus, 
  Stethoscope, 
  Calendar, 
  XCircle, 
  Pill, 
  Building2,
  Clock 
} from 'lucide-react';

const RecentActivity = ({ activities }) => {
  const getActivityIcon = (type) => {
    const icons = {
      patient: UserPlus,
      doctor: Stethoscope,
      appointment: Calendar,
      cancel: XCircle,
      prescription: Pill,
      department: Building2,
    };
    return icons[type] || Clock;
  };

  const getActivityColor = (type) => {
    const colors = {
      patient: 'bg-green-100 text-green-600',
      doctor: 'bg-blue-100 text-blue-600',
      appointment: 'bg-purple-100 text-purple-600',
      cancel: 'bg-red-100 text-red-600',
      prescription: 'bg-yellow-100 text-yellow-600',
      department: 'bg-indigo-100 text-indigo-600',
    };
    return colors[type] || 'bg-gray-100 text-gray-600';
  };

  const getActivityText = (activity) => {
    const texts = {
      patient: `New patient ${activity.name} registered`,
      doctor: `Dr. ${activity.name} added to hospital`,
      appointment: `Appointment booked with Dr. ${activity.doctor}`,
      cancel: `Appointment cancelled by ${activity.name}`,
      prescription: `Prescription added for ${activity.name}`,
      department: `New department ${activity.name} created`,
    };
    return texts[activity.type] || `${activity.type} activity`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
    >
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
      </div>
      <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
        {activities?.length > 0 ? (
          activities.map((activity, index) => {
            const Icon = getActivityIcon(activity.type);
            const colorClass = getActivityColor(activity.type);
            
            return (
              <motion.div
                key={activity.id || index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors"
              >
                <div className={`p-2 rounded-xl ${colorClass}`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800">{getActivityText(activity)}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
                {activity.status && (
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    activity.status === 'completed' ? 'bg-green-100 text-green-700' :
                    activity.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    activity.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {activity.status}
                  </span>
                )}
              </motion.div>
            );
          })
        ) : (
          <div className="p-8 text-center text-gray-500">
            <Clock size={48} className="mx-auto mb-3 text-gray-300" />
            <p>No recent activities</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default RecentActivity;