// src/components/admin/Reports.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Calendar, 
  Clock, 
  TrendingUp, 
  Star,
  Download,
  Eye
} from 'lucide-react';

const Reports = ({ reportData }) => {
  const reports = [
    { 
      id: 1, 
      title: 'Monthly Report', 
      icon: FileText,
      date: 'December 2024',
      status: 'Generated',
      color: 'bg-blue-50 text-blue-600'
    },
    { 
      id: 2, 
      title: 'Weekly Report', 
      icon: Calendar,
      date: 'Week 52, 2024',
      status: 'Pending',
      color: 'bg-orange-50 text-orange-600'
    },
    { 
      id: 3, 
      title: "Today's Report", 
      icon: Clock,
      date: 'December 26, 2024',
      status: 'Available',
      color: 'bg-green-50 text-green-600'
    },
    { 
      id: 4, 
      title: 'Revenue Report', 
      icon: TrendingUp,
      date: 'Q4 2024',
      status: 'Generated',
      color: 'bg-purple-50 text-purple-600'
    },
    { 
      id: 5, 
      title: 'Patient Satisfaction', 
      icon: Star,
      date: 'December 2024',
      status: 'Available',
      color: 'bg-pink-50 text-pink-600'
    },
  ];

  const metrics = {
    totalRevenue: '₹12,45,678',
    appointmentSuccess: '94.5%',
    patientSatisfaction: '4.8/5',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Reports</h3>
        <button className="text-sm text-blue-600 font-medium hover:text-blue-700">
          View All
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-500">Revenue</p>
          <p className="text-lg font-bold text-gray-900">{metrics.totalRevenue}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-500">Appointment Success</p>
          <p className="text-lg font-bold text-green-600">{metrics.appointmentSuccess}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-500">Patient Satisfaction</p>
          <p className="text-lg font-bold text-blue-600">{metrics.patientSatisfaction}</p>
        </div>
      </div>

      {/* Report List */}
      <div className="space-y-3">
        {reports.map((report) => (
          <motion.div
            key={report.id}
            whileHover={{ x: 4 }}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${report.color}`}>
                <report.icon size={18} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{report.title}</p>
                <p className="text-xs text-gray-500">{report.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-1 rounded-full ${
                report.status === 'Generated' ? 'bg-green-100 text-green-700' :
                report.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {report.status}
              </span>
              <button className="p-1 hover:bg-gray-200 rounded-lg transition-colors">
                <Eye size={16} className="text-gray-500" />
              </button>
              <button className="p-1 hover:bg-gray-200 rounded-lg transition-colors">
                <Download size={16} className="text-gray-500" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default Reports;