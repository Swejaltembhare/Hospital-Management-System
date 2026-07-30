// src/components/admin/Notifications.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Calendar,
  Stethoscope,
  AlertTriangle,
  UserPlus,
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  Settings,
  ChevronRight,
  ChevronDown,
  Search
} from 'lucide-react';

const Notifications = () => {
  const [expanded, setExpanded] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const notifications = [
    {
      id: 1,
      type: 'appointment',
      title: 'New Appointment Booked',
      description: 'John Doe booked an appointment with Dr. Smith for tomorrow at 10:00 AM',
      time: '5 minutes ago',
      status: 'unread',
      priority: 'high',
      icon: Calendar,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      id: 2,
      type: 'leave',
      title: 'Doctor Leave Request',
      description: 'Dr. Johnson has requested leave for December 28-30',
      time: '1 hour ago',
      status: 'unread',
      priority: 'medium',
      icon: Stethoscope,
      color: 'bg-yellow-100 text-yellow-600'
    },
    {
      id: 3,
      type: 'emergency',
      title: 'Emergency Alert',
      description: 'Emergency case in ER - Cardiac arrest patient admitted',
      time: '3 hours ago',
      status: 'unread',
      priority: 'high',
      icon: AlertTriangle,
      color: 'bg-red-100 text-red-600'
    },
    {
      id: 4,
      type: 'registration',
      title: 'New Patient Registered',
      description: 'Sarah Wilson has been registered as a new patient',
      time: '5 hours ago',
      status: 'read',
      priority: 'low',
      icon: UserPlus,
      color: 'bg-green-100 text-green-600'
    },
    {
      id: 5,
      type: 'system',
      title: 'System Update',
      description: 'System maintenance scheduled for December 30, 2:00 AM',
      time: '1 day ago',
      status: 'read',
      priority: 'medium',
      icon: Settings,
      color: 'bg-purple-100 text-purple-600'
    },
    {
      id: 6,
      type: 'reminder',
      title: 'Appointment Reminder',
      description: 'Dr. Williams has 5 appointments scheduled for today',
      time: '2 days ago',
      status: 'read',
      priority: 'low',
      icon: Clock,
      color: 'bg-gray-100 text-gray-600'
    },
  ];

  const getFilteredNotifications = () => {
    let filtered = notifications;
    
    if (filter !== 'all') {
      filtered = filtered.filter(n => n.type === filter);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  const getPriorityBadge = (priority) => {
    const badges = {
      high: 'bg-red-100 text-red-700',
      medium: 'bg-yellow-100 text-yellow-700',
      low: 'bg-gray-100 text-gray-700'
    };
    return badges[priority] || badges.low;
  };

  const filterOptions = [
    { value: 'all', label: 'All' },
    { value: 'appointment', label: 'Appointments' },
    { value: 'emergency', label: 'Emergencies' },
    { value: 'registration', label: 'Registrations' },
    { value: 'system', label: 'System' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell size={24} className="text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
              <p className="text-xs text-gray-500">
                You have {unreadCount} unread notifications
              </p>
            </div>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {expanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mt-4">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                filter === option.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
          <div className="relative ml-auto">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="max-h-[400px] overflow-y-auto"
          >
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification, index) => {
                const Icon = notification.icon;
                return (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 ${
                      notification.status === 'unread' ? 'bg-blue-50/30' : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${notification.color}`}>
                        <Icon size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {notification.title}
                            </p>
                            <p className="text-xs text-gray-600 mt-0.5">
                              {notification.description}
                            </p>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${getPriorityBadge(notification.priority)}`}>
                            {notification.priority}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-gray-400">{notification.time}</span>
                          {notification.status === 'unread' && (
                            <span className="text-xs text-blue-600 font-medium">New</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button className="p-1 hover:bg-gray-200 rounded-lg transition-colors">
                          <CheckCircle size={16} className="text-green-500" />
                        </button>
                        <button className="p-1 hover:bg-gray-200 rounded-lg transition-colors">
                          <XCircle size={16} className="text-red-500" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Bell size={48} className="mx-auto mb-3 text-gray-300" />
                <p>No notifications found</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      {expanded && filteredNotifications.length > 0 && (
        <div className="p-4 border-t border-gray-100 flex items-center justify-between">
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            Mark all as read
          </button>
          <button className="text-sm text-gray-500 hover:text-gray-700 font-medium">
            View all notifications
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default Notifications;