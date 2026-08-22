// // src/components/admin/Analytics.jsx
// import React, { useState, useEffect } from 'react';
// import { motion } from 'framer-motion';
// import {
//   LineChart,
//   Line,
//   AreaChart,
//   Area,
//   BarChart,
//   Bar,
//   PieChart,
//   Pie,
//   Cell,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer
// } from 'recharts';

// const Analytics = () => {
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [appointmentTrend, setAppointmentTrend] = useState([]);
//   const [patientRegistration, setPatientRegistration] = useState([]);
//   const [departmentData, setDepartmentData] = useState([]);
//   const [appointmentStatus, setAppointmentStatus] = useState([]);
//   const [doctorPerformance, setDoctorPerformance] = useState([]);

//   const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444'];

//   useEffect(() => {
//     fetchAnalyticsData();
//   }, []);

//   const fetchAnalyticsData = async () => {
//     try {
//       setLoading(true);
//       // Replace with your actual API endpoints
//       const [
//         appointmentTrendRes,
//         patientRegistrationRes,
//         departmentDataRes,
//         appointmentStatusRes,
//         doctorPerformanceRes
//       ] = await Promise.all([
//         fetch('/api/analytics/appointment-trend'),
//         fetch('/api/analytics/patient-registration'),
//         fetch('/api/analytics/department-data'),
//         fetch('/api/analytics/appointment-status'),
//         fetch('/api/analytics/doctor-performance')
//       ]);

//       if (!appointmentTrendRes.ok || !patientRegistrationRes.ok || 
//           !departmentDataRes.ok || !appointmentStatusRes.ok || 
//           !doctorPerformanceRes.ok) {
//         throw new Error('Failed to fetch analytics data');
//       }

//       const [
//         appointmentTrendData,
//         patientRegistrationData,
//         departmentData,
//         appointmentStatusData,
//         doctorPerformanceData
//       ] = await Promise.all([
//         appointmentTrendRes.json(),
//         patientRegistrationRes.json(),
//         departmentDataRes.json(),
//         appointmentStatusRes.json(),
//         doctorPerformanceRes.json()
//       ]);

//       setAppointmentTrend(appointmentTrendData);
//       setPatientRegistration(patientRegistrationData);
//       setDepartmentData(departmentData);
//       setAppointmentStatus(appointmentStatusData);
//       setDoctorPerformance(doctorPerformanceData);
//       setError(null);
//     } catch (err) {
//       console.error('Error fetching analytics:', err);
//       setError('Failed to load analytics data. Please try again later.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-96">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading analytics data...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
//         <p className="text-red-600">{error}</p>
//         <button 
//           onClick={fetchAnalyticsData}
//           className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
//         >
//           Retry
//         </button>
//       </div>
//     );
//   }

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       className="space-y-6"
//     >
//       <div className="flex justify-between items-center">
//         <h2 className="text-xl font-semibold text-gray-800">Analytics Overview</h2>
//         <button 
//           onClick={fetchAnalyticsData}
//           className="px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
//         >
//           Refresh Data
//         </button>
//       </div>
      
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Appointment Trend */}
//         <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
//           <h3 className="text-sm font-semibold text-gray-700 mb-4">Appointment Trend</h3>
//           <ResponsiveContainer width="100%" height={250}>
//             <LineChart data={appointmentTrend}>
//               <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
//               <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
//               <YAxis stroke="#9ca3af" fontSize={12} />
//               <Tooltip />
//               <Line 
//                 type="monotone" 
//                 dataKey="appointments" 
//                 stroke="#3b82f6" 
//                 strokeWidth={2}
//                 dot={{ fill: '#3b82f6', strokeWidth: 2 }}
//               />
//             </LineChart>
//           </ResponsiveContainer>
//         </div>

//         {/* Patient Registration */}
//         <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
//           <h3 className="text-sm font-semibold text-gray-700 mb-4">Patient Registration</h3>
//           <ResponsiveContainer width="100%" height={250}>
//             <AreaChart data={patientRegistration}>
//               <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
//               <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
//               <YAxis stroke="#9ca3af" fontSize={12} />
//               <Tooltip />
//               <Area 
//                 type="monotone" 
//                 dataKey="patients" 
//                 stroke="#10b981" 
//                 fill="#10b981" 
//                 fillOpacity={0.2}
//               />
//             </AreaChart>
//           </ResponsiveContainer>
//         </div>

//         {/* Patients by Department */}
//         <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
//           <h3 className="text-sm font-semibold text-gray-700 mb-4">Patients by Department</h3>
//           <ResponsiveContainer width="100%" height={250}>
//             <BarChart data={departmentData}>
//               <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
//               <XAxis dataKey="department" stroke="#9ca3af" fontSize={12} />
//               <YAxis stroke="#9ca3af" fontSize={12} />
//               <Tooltip />
//               <Bar dataKey="patients" fill="#8b5cf6" />
//             </BarChart>
//           </ResponsiveContainer>
//         </div>

//         {/* Appointment Status */}
//         <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
//           <h3 className="text-sm font-semibold text-gray-700 mb-4">Appointment Status</h3>
//           <ResponsiveContainer width="100%" height={250}>
//             <PieChart>
//               <Pie
//                 data={appointmentStatus}
//                 cx="50%"
//                 cy="50%"
//                 labelLine={false}
//                 label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
//                 outerRadius={80}
//                 fill="#8884d8"
//                 dataKey="value"
//               >
//                 {appointmentStatus.map((entry, index) => (
//                   <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                 ))}
//               </Pie>
//               <Tooltip />
//             </PieChart>
//           </ResponsiveContainer>
//         </div>
//       </div>

//       {/* Doctor Performance */}
//       <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
//         <h3 className="text-sm font-semibold text-gray-700 mb-4">Doctor Performance</h3>
//         <ResponsiveContainer width="100%" height={200}>
//           <BarChart data={doctorPerformance} layout="vertical">
//             <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
//             <XAxis type="number" stroke="#9ca3af" fontSize={12} />
//             <YAxis dataKey="name" type="category" stroke="#9ca3af" fontSize={12} />
//             <Tooltip />
//             <Bar dataKey="patients" fill="#3b82f6" />
//           </BarChart>
//         </ResponsiveContainer>
//       </div>
//     </motion.div>
//   );
// };

// export default Analytics;


// src/components/admin/Analytics.jsx
import React, { useState, useEffect } from 'react';
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
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [appointmentTrend, setAppointmentTrend] = useState([]);
  const [patientRegistration, setPatientRegistration] = useState([]);
  const [departmentData, setDepartmentData] = useState([]);
  const [appointmentStatus, setAppointmentStatus] = useState([]);
  const [doctorPerformance, setDoctorPerformance] = useState([]);

  const COLORS = ['#14b8a6', '#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444'];

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        appointmentTrendRes,
        patientRegistrationRes,
        departmentDataRes,
        appointmentStatusRes,
        doctorPerformanceRes
      ] = await Promise.all([
        adminAPI.getAppointmentTrend(),
        adminAPI.getPatientRegistration(),
        adminAPI.getDepartmentData(),
        adminAPI.getAppointmentStatus(),
        adminAPI.getDoctorPerformance()
      ]);

      setAppointmentTrend(appointmentTrendRes.data || []);
      setPatientRegistration(patientRegistrationRes.data || []);
      setDepartmentData(departmentDataRes.data || []);
      setAppointmentStatus(appointmentStatusRes.data || []);
      setDoctorPerformance(doctorPerformanceRes.data || []);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data. Please try again later.');
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={fetchAnalyticsData}
          className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full space-y-6"
    >
      {/* Header */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-gray-800">Analytics Overview</h2>
        <button 
          onClick={fetchAnalyticsData}
          className="px-4 py-2 text-sm bg-teal-50 text-teal-600 rounded-lg hover:bg-teal-100 transition font-medium"
        >
          Refresh Data
        </button>
      </div>
      
      {/* Charts Grid - 2 columns on large screens, 1 on small */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
        
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
                stroke="#14b8a6" 
                strokeWidth={2}
                dot={{ fill: '#14b8a6', strokeWidth: 2 }}
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

        {/* Appointment Status - Pie Chart */}
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

      {/* Doctor Performance - Full Width */}
      <div className="w-full bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Doctor Performance</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={doctorPerformance} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis type="number" stroke="#9ca3af" fontSize={12} />
            <YAxis dataKey="name" type="category" stroke="#9ca3af" fontSize={12} width={100} />
            <Tooltip />
            <Bar dataKey="patients" fill="#14b8a6" />
            <Bar dataKey="appointments" fill="#06b6d4" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default Analytics;