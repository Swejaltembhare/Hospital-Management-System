// src/pages/admin/Reports.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FileBarChart,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  Users,
  Stethoscope,
  CalendarCheck,
  IndianRupee,
  FileText,
  Printer,
  Mail,
  Eye,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Clock,
  XCircle
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState('overview');
  const [dateRange, setDateRange] = useState('month');
  const [reports, setReports] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    fetchReports();
  }, [dateRange]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getReports();
      if (response.data.success) {
        setReports(response.data.data);
        setSelectedReport(response.data.data?.[0] || null);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format = 'pdf') => {
    try {
      await adminAPI.exportData(format);
      toast.success(`Report exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Failed to export report');
    }
  };

  const handleGenerateReport = async (type) => {
    try {
      await adminAPI.generateReport({ type, dateRange });
      toast.success('Report generated successfully');
      fetchReports();
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
    }
  };

  const overviewStats = [
    { title: 'Total Revenue', value: '₹12,45,678', icon: IndianRupee, trend: 15, color: 'blue' },
    { title: 'Total Patients', value: '1,234', icon: Users, trend: 12, color: 'green' },
    { title: 'Total Doctors', value: '45', icon: Stethoscope, trend: 8, color: 'purple' },
    { title: 'Appointments', value: '3,456', icon: CalendarCheck, trend: 20, color: 'orange' },
    { title: 'Success Rate', value: '94.5%', icon: TrendingUp, trend: 5, color: 'indigo' },
    { title: 'Satisfaction', value: '4.8/5', icon: FileText, trend: 3, color: 'pink' },
  ];

  const patientRegistrationData = [
    { month: 'Jan', patients: 65, revenue: 45000 },
    { month: 'Feb', patients: 78, revenue: 52000 },
    { month: 'Mar', patients: 90, revenue: 68000 },
    { month: 'Apr', patients: 85, revenue: 62000 },
    { month: 'May', patients: 98, revenue: 75000 },
    { month: 'Jun', patients: 110, revenue: 89000 },
    { month: 'Jul', patients: 105, revenue: 82000 },
    { month: 'Aug', patients: 120, revenue: 95000 },
    { month: 'Sep', patients: 115, revenue: 91000 },
    { month: 'Oct', patients: 130, revenue: 108000 },
    { month: 'Nov', patients: 125, revenue: 99000 },
    { month: 'Dec', patients: 140, revenue: 115000 },
  ];

  const appointmentStatusData = [
    { name: 'Completed', value: 45 },
    { name: 'Pending', value: 25 },
    { name: 'Confirmed', value: 20 },
    { name: 'Cancelled', value: 10 },
  ];

  const departmentData = [
    { department: 'Cardiology', patients: 120, revenue: 56000 },
    { department: 'Neurology', patients: 80, revenue: 42000 },
    { department: 'Orthopedics', patients: 95, revenue: 48000 },
    { department: 'Pediatrics', patients: 70, revenue: 35000 },
    { department: 'Dermatology', patients: 50, revenue: 28000 },
  ];

  const doctorPerformanceData = [
    { name: 'Dr. Smith', patients: 45, revenue: 34000 },
    { name: 'Dr. Johnson', patients: 38, revenue: 29000 },
    { name: 'Dr. Williams', patients: 32, revenue: 26000 },
    { name: 'Dr. Brown', patients: 28, revenue: 22000 },
    { name: 'Dr. Jones', patients: 25, revenue: 20000 },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const reportTypes = [
    { id: 'overview', label: 'Overview', icon: FileBarChart },
    { id: 'patients', label: 'Patient Reports', icon: Users },
    { id: 'revenue', label: 'Revenue Reports', icon: IndianRupee },
    { id: 'appointments', label: 'Appointment Reports', icon: CalendarCheck },
    { id: 'doctor', label: 'Doctor Performance', icon: Stethoscope },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">
            Comprehensive reports and insights for your hospital
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <button
            onClick={() => handleExport('pdf')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <Download size={18} />
            Export PDF
          </button>
          <button
            onClick={() => handleExport('excel')}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
          >
            <Download size={18} />
            Export Excel
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {overviewStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-lg bg-${stat.color}-50`}>
                <stat.icon size={18} className={`text-${stat.color}-600`} />
              </div>
              <span className={`text-xs font-medium ${
                stat.trend > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.trend > 0 ? '↑' : '↓'} {Math.abs(stat.trend)}%
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-500">{stat.title}</p>
          </motion.div>
        ))}
      </div>

      {/* Report Type Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200">
        {reportTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setReportType(type.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              reportType === type.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <type.icon size={18} />
            {type.label}
          </button>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patient Registration Trend */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700">Patient Registration Trend</h3>
            <LineChartIcon size={18} className="text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={patientRegistrationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="patients" 
                stroke="#3b82f6" 
                fill="#3b82f6" 
                fillOpacity={0.1}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Revenue Trend */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700">Revenue Trend</h3>
            <BarChart3 size={18} className="text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={patientRegistrationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip />
              <Bar dataKey="revenue" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Appointment Status */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700">Appointment Status</h3>
            <PieChart size={18} className="text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={appointmentStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {appointmentStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Department Performance */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700">Department Performance</h3>
            <BarChart3 size={18} className="text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={departmentData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" stroke="#9ca3af" fontSize={12} />
              <YAxis dataKey="department" type="category" stroke="#9ca3af" fontSize={12} />
              <Tooltip />
              <Bar dataKey="patients" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Doctor Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700">Doctor Performance</h3>
          <button
            onClick={() => handleGenerateReport('doctor')}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Generate Report
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 text-xs font-medium text-gray-500 uppercase">Doctor</th>
                <th className="text-left py-3 text-xs font-medium text-gray-500 uppercase">Patients</th>
                <th className="text-left py-3 text-xs font-medium text-gray-500 uppercase">Revenue</th>
                <th className="text-left py-3 text-xs font-medium text-gray-500 uppercase">Performance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {doctorPerformanceData.map((doctor, index) => (
                <motion.tr
                  key={doctor.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3">
                    <span className="font-medium text-gray-900">{doctor.name}</span>
                  </td>
                  <td className="py-3 text-gray-600">{doctor.patients}</td>
                  <td className="py-3 text-gray-600">₹{doctor.revenue.toLocaleString()}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-600 rounded-full"
                          style={{ width: `${(doctor.patients / 45) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">
                        {Math.round((doctor.patients / 45) * 100)}%
                      </span>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <button className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
          <FileText size={24} className="text-blue-600" />
          <span className="text-xs font-medium text-gray-600">Monthly Report</span>
        </button>
        <button className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
          <Calendar size={24} className="text-green-600" />
          <span className="text-xs font-medium text-gray-600">Weekly Report</span>
        </button>
        <button className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
          <Clock size={24} className="text-orange-600" />
          <span className="text-xs font-medium text-gray-600">Today's Report</span>
        </button>
        <button className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
          <Printer size={24} className="text-purple-600" />
          <span className="text-xs font-medium text-gray-600">Print Report</span>
        </button>
        <button className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
          <Mail size={24} className="text-red-600" />
          <span className="text-xs font-medium text-gray-600">Email Report</span>
        </button>
      </div>
    </motion.div>
  );
};

export default Reports;