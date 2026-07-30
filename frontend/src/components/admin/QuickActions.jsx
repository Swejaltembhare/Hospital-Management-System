// src/components/admin/QuickActions.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  UserPlus,
  Users,
  Calendar,
  FileBarChart,
  Download,
  Settings
} from 'lucide-react';

const QuickActions = () => {
  const actions = [
    {
      title: 'Add Doctor',
      icon: UserPlus,
      color: 'bg-blue-500 hover:bg-blue-600',
      link: '/admin/doctors/add'
    },
    {
      title: 'Add Department',
      icon: Users,
      color: 'bg-purple-500 hover:bg-purple-600',
      link: '/admin/departments/add'
    },
    {
      title: 'View Patients',
      icon: Users,
      color: 'bg-green-500 hover:bg-green-600',
      link: '/admin/patients'
    },
    {
      title: 'Manage Appointments',
      icon: Calendar,
      color: 'bg-orange-500 hover:bg-orange-600',
      link: '/admin/appointments'
    },
    {
      title: 'Generate Reports',
      icon: FileBarChart,
      color: 'bg-indigo-500 hover:bg-indigo-600',
      link: '/admin/reports'
    },
    {
      title: 'Export Data',
      icon: Download,
      color: 'bg-red-500 hover:bg-red-600',
      link: '/admin/export'
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <Link key={index} to={action.link}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full ${action.color} text-white rounded-xl p-4 text-center transition-all duration-200 shadow-sm`}
            >
              <action.icon size={24} className="mx-auto mb-2" />
              <span className="text-xs font-medium block">{action.title}</span>
            </motion.button>
          </Link>
        ))}
      </div>
    </motion.div>
  );
};

export default QuickActions;