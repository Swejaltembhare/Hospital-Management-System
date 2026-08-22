// src/components/admin/QuickActions.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  UserPlus,
  Users,
  Calendar,
  FileBarChart,
  Download,
  Settings,
  Stethoscope,
  Building2,
  Clock,
  RefreshCw
} from 'lucide-react';

const QuickActions = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    pendingAppointments: 0,
    newPatients: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/dashboard-stats');
      if (response.ok) {
        const data = await response.json();
        setStats({
          pendingAppointments: data.pendingAppointments || 0,
          newPatients: data.newPatients || 0
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/export', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to export data');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Data exported successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  const actions = [
    {
      title: 'Add Doctor',
      icon: UserPlus,
      color: 'bg-blue-500 hover:bg-blue-600',
      link: '/admin/doctors/add'
    },
    {
      title: 'Add Patient',
      icon: UserPlus,
      color: 'bg-green-500 hover:bg-green-600',
      link: '/admin/patients/add'
    },
    {
      title: 'New Appointment',
      icon: Calendar,
      color: 'bg-orange-500 hover:bg-orange-600',
      link: '/admin/appointments/add'
    },
    {
      title: 'Add Department',
      icon: Building2,
      color: 'bg-purple-500 hover:bg-purple-600',
      link: '/admin/departments/add'
    },
    {
      title: 'Manage Patients',
      icon: Users,
      color: 'bg-teal-500 hover:bg-teal-600',
      link: '/admin/patients',
      badge: stats.newPatients > 0 ? stats.newPatients : null
    },
    {
      title: 'Manage Doctors',
      icon: Stethoscope,
      color: 'bg-cyan-500 hover:bg-cyan-600',
      link: '/admin/doctors'
    },
    {
      title: 'Appointments',
      icon: Clock,
      color: 'bg-amber-500 hover:bg-amber-600',
      link: '/admin/appointments',
      badge: stats.pendingAppointments > 0 ? stats.pendingAppointments : null
    },
    {
      title: 'Export Data',
      icon: Download,
      color: 'bg-red-500 hover:bg-red-600',
      onClick: handleExport,
      loading: loading
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Quick Actions</h3>
        <button
          onClick={fetchStats}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Refresh"
        >
          <RefreshCw size={16} className="text-gray-400" />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {actions.map((action, index) => (
          <motion.div
            key={action.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative"
          >
            {action.link ? (
              <Link to={action.link}>
                <div className={`${action.color} text-white rounded-xl p-3 text-center transition-all duration-200 shadow-sm relative`}>
                  {action.badge && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md">
                      {action.badge > 9 ? '9+' : action.badge}
                    </span>
                  )}
                  <action.icon size={20} className="mx-auto mb-1" />
                  <span className="text-xs font-medium block">{action.title}</span>
                </div>
              </Link>
            ) : (
              <button
                onClick={action.onClick}
                disabled={action.loading}
                className={`w-full ${action.color} text-white rounded-xl p-3 text-center transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {action.loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto mb-1"></div>
                    <span className="text-xs font-medium block">Exporting...</span>
                  </>
                ) : (
                  <>
                    <action.icon size={20} className="mx-auto mb-1" />
                    <span className="text-xs font-medium block">{action.title}</span>
                  </>
                )}
              </button>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default QuickActions;