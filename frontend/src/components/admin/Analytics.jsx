// src/components/admin/Analytics.jsx
import React from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const Analytics = () => {
  const appointmentTrend = [
    { month: 'Jan', appointments: 65 },
    { month: 'Feb', appointments: 78 },
    { month: 'Mar', appointments: 90 },
    { month: 'Apr', appointments: 85 },
    { month: 'May', appointments: 98 },
    { month: 'Jun', appointments: 110 },
  ];

  const patientRegistration = [
    { month: 'Jan', patients: 45 },
    { month: 'Feb', patients: 52 },
    { month: 'Mar', patients: 61 },
    { month: 'Apr', patients: 58 },
    { month: 'May', patients: 72 },
    { month: 'Jun', patients: 85 },
  ];

  const departmentData = [
    { department: 'Cardiology', patients: 120 },
    { department: 'Neurology', patients: 80 },
    { department: 'Orthopedics', patients: 95 },
    { department: 'Pediatrics', patients: 70 },
    { department: 'Dermatology', patients: 50 },
  ];

  const appointmentStatus = [
    { name: 'Completed', value: 45 },
    { name: 'Pending', value: 25 },
    { name: 'Confirmed', value: 20 },
    { name: 'Cancelled', value: 10 },
  ];

  const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444'];

  const doctorPerformance = [
    { name: 'Dr. Smith', patients: 45 },
    { name: 'Dr. Johnson', patients: 38 },
    { name: 'Dr. Williams', patients: 32 },
    { name: 'Dr. Brown', patients: 28 },
    { name: 'Dr. Jones', patients: 25 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <h2 className="text-xl font-semibold text-gray-800">Analytics Overview</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointment Trend */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Appointment Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={appointmentTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="appointments" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Patient Registration */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Patient Registration</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={patientRegistration}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="patients" 
                stroke="#10b981" 
                fill="#10b981" 
                fillOpacity={0.2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Patients by Department */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Patients by Department</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={departmentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="department" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip />
              <Bar dataKey="patients" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Appointment Status */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Appointment Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={appointmentStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {appointmentStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Doctor Performance */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Doctor Performance</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={doctorPerformance} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis type="number" stroke="#9ca3af" fontSize={12} />
            <YAxis dataKey="name" type="category" stroke="#9ca3af" fontSize={12} />
            <Tooltip />
            <Bar dataKey="patients" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default Analytics;